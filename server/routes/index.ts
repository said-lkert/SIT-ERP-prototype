import { Express, Request, Response } from 'express';
import db from '../database/connection.js';
import express from 'express';

function parseTags(value?: string | null) {
  try {
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function mapSupplier(row: any) {
  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM supplier_product_offers WHERE supplier_id = ?) AS product_count,
      (SELECT COUNT(*) FROM supplier_orders WHERE supplier_id = ? AND status NOT IN ('Annulée', 'Réceptionnée')) AS pending_orders,
      (SELECT MAX(receipt_date) FROM supplier_receipts WHERE fournisseur_id = ? OR supplier_order_id IN (SELECT id FROM supplier_orders WHERE supplier_id = ?)) AS last_receipt
  `).get(row.id, row.id, row.id, row.id) as any;

  return {
    id: row.id,
    reference: row.reference,
    name: row.name,
    type: row.type || 'Distributeur',
    contactPrincipale: row.contact_name || 'Non spécifié',
    email: row.email || '-',
    telephone: row.phone || '-',
    address: row.address || '',
    produitsAssocies: stats.product_count || 0,
    derniereLivraison: stats.last_receipt || row.created_at,
    statut: row.archived_at ? 'archive' : row.status === 'Actif' ? 'actif' : 'inactif',
    tauxConformite: row.conformity_rate ?? 100,
    commandesAttente: stats.pending_orders || 0,
    pays: row.country || 'Algérie',
    delaiMoyenLivraison: `${row.average_delivery_days || 0} jours`,
    modePaiement: row.payment_method || 'Non défini',
    currency: row.currency || 'DZD',
  };
}

function syncSupplierOrderStatus(orderId: string) {
  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(sol.quantity_ordered), 0) AS ordered,
      COALESCE((
        SELECT SUM(srl.quantity_accepted)
        FROM supplier_receipt_lines srl
        JOIN supplier_receipts sr ON sr.id = srl.supplier_receipt_id
        JOIN supplier_order_lines linked_line ON linked_line.id = srl.supplier_order_line_id
        WHERE linked_line.supplier_order_id = ? AND sr.status = 'Validée'
      ), 0) AS received
    FROM supplier_order_lines sol
    WHERE sol.supplier_order_id = ?
  `).get(orderId, orderId) as any;

  const status = totals.received >= totals.ordered && totals.ordered > 0
    ? 'Reçue'
    : totals.received > 0
      ? 'Partiellement reçue'
      : 'Validée';
  db.prepare('UPDATE supplier_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, orderId);
}

function validateSupplierReceipt(receiptId: string) {
  const receipt = db.prepare('SELECT * FROM supplier_receipts WHERE id = ?').get(receiptId) as any;
  if (!receipt) throw new Error('Réception introuvable');

  if (!receipt.stock_applied) {
    const lines = db.prepare(`
      SELECT rl.*, sol.product_id, sol.unit_purchase_price
      FROM supplier_receipt_lines rl
      JOIN supplier_order_lines sol ON sol.id = rl.supplier_order_line_id
      WHERE rl.supplier_receipt_id = ?
    `).all(receiptId) as any[];

    for (const line of lines) {
      const qty = line.quantity_accepted || 0;
      if (qty <= 0) continue;
      const stock = db.prepare('SELECT id FROM warehouse_stocks WHERE product_id = ? AND location_id = ?').get(line.product_id, line.destination_location_id || null) as any;
      if (stock) {
        db.prepare('UPDATE warehouse_stocks SET physical_quantity = physical_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(qty, stock.id);
      } else {
        db.prepare('INSERT INTO warehouse_stocks (id, product_id, location_id, physical_quantity, reserved_quantity) VALUES (?, ?, ?, ?, 0)')
          .run(`stk-${receiptId}-${line.product_id}`, line.product_id, line.destination_location_id || null, qty);
      }
      db.prepare(`
        INSERT INTO stock_movements (id, product_id, location_id, movement_type, quantity, source_type, source_id, created_by)
        VALUES (?, ?, ?, 'Entrée', ?, 'SupplierReceipt', ?, ?)
      `).run(`mov-${receiptId}-${line.id}`, line.product_id, line.destination_location_id || null, qty, receiptId, receipt.received_by);
    }

    db.prepare(`
      UPDATE serial_numbers
      SET status = 'en_stock', received_at = COALESCE(received_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
      WHERE id IN (
        SELECT rsn.serial_number_id
        FROM receipt_serial_numbers rsn
        JOIN supplier_receipt_lines rl ON rl.id = rsn.supplier_receipt_line_id
        WHERE rl.supplier_receipt_id = ?
      )
    `).run(receiptId);
  }

  db.prepare("UPDATE supplier_receipts SET status = 'Validée', stock_applied = 1, validated_at = COALESCE(validated_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(receiptId);

  const existingDocument = db.prepare("SELECT * FROM documents WHERE source_type = 'supplier_receipt' AND source_id = ? AND document_type = ?").get(receiptId, "Bon d'entrée") as any;
  if (!existingDocument) {
    const count = (db.prepare("SELECT COUNT(*) AS count FROM documents WHERE document_type = ?").get("Bon d'entrée") as any).count;
    const number = `BE-${String(count + 1).padStart(4, '0')}`;
    const totals = db.prepare(`
      SELECT COALESCE(SUM(rl.quantity_accepted), 0) AS total_qty,
             COALESCE(SUM(rl.quantity_accepted * sol.unit_purchase_price), 0) AS total_value
      FROM supplier_receipt_lines rl
      JOIN supplier_order_lines sol ON sol.id = rl.supplier_order_line_id
      WHERE rl.supplier_receipt_id = ?
    `).get(receiptId) as any;
    db.prepare(`
      INSERT INTO documents (id, document_type, number, source_type, source_id, status, metadata_json)
      VALUES (?, ?, ?, 'supplier_receipt', ?, 'Validé', ?)
    `).run(`doc-be-${Date.now()}`, "Bon d'entrée", number, receiptId, JSON.stringify({
      receiptNumber: receipt.number,
      totalQty: totals.total_qty,
      totalValue: totals.total_value
    }));
  }

  if (receipt.supplier_order_id) syncSupplierOrderStatus(receipt.supplier_order_id);
}

function validateStockExit(exitId: string) {
  const exit = db.prepare('SELECT * FROM stock_exits WHERE id = ?').get(exitId) as any;
  if (!exit) throw new Error('Sortie de stock introuvable');
  if (exit.status === 'Annulée') throw new Error('Une sortie annulée ne peut pas être validée');

  const lines = db.prepare(`
    SELECT sel.*, p.name AS product_name
    FROM stock_exit_lines sel
    JOIN products p ON p.id = sel.product_id
    WHERE sel.stock_exit_id = ?
  `).all(exitId) as any[];
  if (!lines.length) throw new Error('La sortie doit contenir au moins un produit');

  if (!exit.stock_applied) {
    for (const line of lines) {
      const stock = db.prepare(`
        SELECT id, physical_quantity, reserved_quantity
        FROM warehouse_stocks
        WHERE product_id = ? AND location_id IS ?
      `).get(line.product_id, line.source_location_id || null) as any;
      if (!stock || stock.physical_quantity < line.quantity_exited) {
        throw new Error(`Stock insuffisant pour ${line.product_name} : ${stock?.physical_quantity || 0} disponible(s), ${line.quantity_exited} demandé(s)`);
      }
      if (line.stock_reservation_line_id && stock.reserved_quantity < line.quantity_exited) {
        throw new Error(`Réservation insuffisante pour ${line.product_name} : ${stock.reserved_quantity} réservé(s), ${line.quantity_exited} demandé(s)`);
      }
    }

    for (const line of lines) {
      db.prepare(`
        UPDATE warehouse_stocks
        SET physical_quantity = physical_quantity - ?,
            reserved_quantity = MAX(0, reserved_quantity - ?),
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ? AND location_id IS ?
      `).run(line.quantity_exited, (line.stock_reservation_line_id || exit.project_id) ? line.quantity_exited : 0, line.product_id, line.source_location_id || null);
      db.prepare(`
        INSERT INTO stock_movements (id, product_id, location_id, movement_type, quantity, source_type, source_id, comment, created_by)
        VALUES (?, ?, ?, 'Sortie', ?, 'StockExit', ?, ?, ?)
      `).run(`mov-exit-${exitId}-${line.id}`, line.product_id, line.source_location_id || null, -line.quantity_exited, exitId, exit.reason, exit.prepared_by);
    }

    if (exit.reservation_id) {
      const remaining = db.prepare(`
        SELECT COALESCE(SUM(MAX(0, srl.quantity_reserved - COALESCE((
          SELECT SUM(sel.quantity_exited)
          FROM stock_exit_lines sel
          JOIN stock_exits se ON se.id = sel.stock_exit_id
          WHERE sel.stock_reservation_line_id = srl.id
            AND (se.status = 'Validée' OR se.id = ?)
        ), 0))), 0) AS remaining
        FROM stock_reservation_lines srl
        WHERE srl.stock_reservation_id = ?
      `).get(exitId, exit.reservation_id) as any;

      db.prepare(`
        UPDATE stock_reservations
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(Number(remaining?.remaining || 0) === 0 ? 'Consommée' : 'Partiellement réservée', exit.reservation_id);
    }
  }

  db.prepare(`
    UPDATE stock_exits
    SET status = 'Validée', stock_applied = 1,
        validated_at = COALESCE(validated_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(exitId);

  const existingDocument = db.prepare("SELECT id FROM documents WHERE source_type = 'stock_exit' AND source_id = ? AND document_type = 'Bon de sortie'").get(exitId);
  if (!existingDocument) {
    const count = (db.prepare("SELECT COUNT(*) AS count FROM documents WHERE document_type = 'Bon de sortie'").get() as any).count;
    const number = `BS-${String(count + 1).padStart(4, '0')}`;
    db.prepare(`
      INSERT INTO documents (id, document_type, number, source_type, source_id, status, metadata_json)
      VALUES (?, 'Bon de sortie', ?, 'stock_exit', ?, 'Validé', ?)
    `).run(`doc-bs-${Date.now()}`, number, exitId, JSON.stringify({ exitNumber: exit.number }));
  }
}

function validateStockExitReturn(returnId: string) {
  const stockReturn = db.prepare(`
    SELECT r.*, e.number AS exit_number
    FROM stock_exit_returns r JOIN stock_exits e ON e.id = r.stock_exit_id
    WHERE r.id = ?
  `).get(returnId) as any;
  if (!stockReturn) throw new Error('Retour de sortie introuvable');

  const lines = db.prepare(`
    SELECT rl.*, el.product_id, el.quantity_exited, el.quantity_returned AS already_returned
    FROM stock_exit_return_lines rl
    JOIN stock_exit_lines el ON el.id = rl.stock_exit_line_id
    WHERE rl.stock_exit_return_id = ?
  `).all(returnId) as any[];

  for (const line of lines) {
    if (line.quantity_returned <= 0 || line.quantity_returned + line.already_returned > line.quantity_exited) {
      throw new Error('La quantité retournée dépasse la quantité réellement sortie');
    }
  }

  if (!stockReturn.stock_applied) {
    for (const line of lines) {
      const stock = db.prepare('SELECT id FROM warehouse_stocks WHERE product_id = ? AND location_id IS ?').get(line.product_id, line.destination_location_id || null) as any;
      if (stock) {
        db.prepare('UPDATE warehouse_stocks SET physical_quantity = physical_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(line.quantity_returned, stock.id);
      } else {
        db.prepare('INSERT INTO warehouse_stocks (id, product_id, location_id, physical_quantity, reserved_quantity) VALUES (?, ?, ?, ?, 0)')
          .run(`stk-return-${returnId}-${line.product_id}`, line.product_id, line.destination_location_id || null, line.quantity_returned);
      }
      db.prepare('UPDATE stock_exit_lines SET quantity_returned = quantity_returned + ? WHERE id = ?').run(line.quantity_returned, line.stock_exit_line_id);
      db.prepare(`
        INSERT INTO stock_movements (id, product_id, location_id, movement_type, quantity, source_type, source_id, comment, created_by)
        VALUES (?, ?, ?, 'Retour en stock', ?, 'StockExitReturn', ?, ?, ?)
      `).run(`mov-return-${returnId}-${line.id}`, line.product_id, line.destination_location_id || null, line.quantity_returned, returnId, stockReturn.reason, stockReturn.received_by);
    }
  }

  db.prepare("UPDATE stock_exit_returns SET status = 'Validé', stock_applied = 1, validated_at = COALESCE(validated_at, CURRENT_TIMESTAMP) WHERE id = ?").run(returnId);
  const existingDocument = db.prepare("SELECT id FROM documents WHERE source_type = 'stock_exit_return' AND source_id = ? AND document_type = 'Bon de retour'").get(returnId);
  if (!existingDocument) {
    const count = (db.prepare("SELECT COUNT(*) AS count FROM documents WHERE document_type = 'Bon de retour'").get() as any).count;
    db.prepare(`
      INSERT INTO documents (id, document_type, number, source_type, source_id, status, metadata_json)
      VALUES (?, 'Bon de retour', ?, 'stock_exit_return', ?, 'Validé', ?)
    `).run(`doc-br-${Date.now()}`, `BR-${String(count + 1).padStart(4, '0')}`, returnId, JSON.stringify({ exitNumber: stockReturn.exit_number }));
  }
}

function ensureDemoProjects() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO client_projects (
      id, reference, name, client_id, client_site_id, manager_id, status,
      start_date, planned_end_date, budget, progress, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const projects = [
    ['proj-demo-2', 'PRJ-0007', 'Sécurisation réseau Clinique El Amel', 'cli2', null, 'u2', 'Planifié', '2026-06-15', '2026-08-15', 980000, 10, 'Projet prêt pour affectation des besoins.'],
    ['proj-demo-3', 'PRJ-0008', 'Modernisation du campus numérique', 'cli3', null, 'u2', 'En attente', '2026-05-10', '2026-09-30', 2400000, 35, 'Projet temporairement arrêté en attente de validation client.'],
    ['proj-demo-4', 'PRJ-0004', 'Maintenance vidéosurveillance Hôtel', 'cli1', 'site1', 'u2', 'Terminé', '2026-02-01', '2026-04-20', 420000, 100, 'Projet réalisé et clôturé.'],
    ['proj-demo-5', 'PRJ-0005', "Contrôle d'accès Clinique El Amel", 'cli2', null, 'u2', 'Annulé', '2026-03-01', '2026-05-01', 650000, 20, 'Projet annulé à la demande du client.'],
    ['proj-demo-6', 'PRJ-0006', 'Extension réseau Hôtel Les Oliviers', 'cli1', 'site1', 'u2', 'En cours', '2026-06-01', '2026-07-30', 760000, 55, 'Déploiement en cours.']
  ];
  projects.forEach((project) => insert.run(...project));
}

export function setupApiRoutes(app: Express) {
  app.get('/api/modules', (req, res) => {
    res.json(db.prepare('SELECT * FROM modules').all());
  });

  app.get('/api/products', (req: Request, res: Response) => {
    try {
      const rows = db.prepare(`
        SELECT p.*, 
               COALESCE(SUM(ws.physical_quantity), 0) as physicalStock, 
               COALESCE(SUM(ws.reserved_quantity), 0) as reservedStock, 
               (COALESCE(SUM(ws.physical_quantity), 0) - COALESCE(SUM(ws.reserved_quantity), 0)) as availableStock,
               (SELECT s.name FROM suppliers s JOIN supplier_product_offers spo ON s.id = spo.supplier_id WHERE spo.product_id = p.id ORDER BY spo.purchase_price ASC LIMIT 1) as mainSupplier,
               (SELECT s.id FROM suppliers s JOIN supplier_product_offers spo ON s.id = spo.supplier_id WHERE spo.product_id = p.id ORDER BY spo.purchase_price ASC LIMIT 1) as mainSupplierId,
               (
                 SELECT COALESCE(SUM(MAX(0, sol.quantity_ordered - COALESCE((
                   SELECT SUM(srl.quantity_accepted)
                   FROM supplier_receipt_lines srl
                   JOIN supplier_receipts sr ON sr.id = srl.supplier_receipt_id
                   WHERE srl.supplier_order_line_id = sol.id AND sr.status = 'Validée'
                 ), 0))), 0)
                 FROM supplier_order_lines sol
                 JOIN supplier_orders so ON so.id = sol.supplier_order_id
                 WHERE sol.product_id = p.id
                   AND so.status NOT IN ('Brouillon', 'Annulée')
               ) as orderedStock
        FROM products p 
        LEFT JOIN warehouse_stocks ws ON p.id = ws.product_id 
        GROUP BY p.id
      `).all();
      
      const products = rows.map((r: any) => ({
        id: r.id,
        reference: r.reference,
        name: r.name,
        family: r.family,
        brand: r.brand,
        model: r.model,
        purchasePrice: r.purchase_price || 0,
        sellingPrice: r.sale_price || 0,
        margin: (r.sale_price || 0) - (r.purchase_price || 0),
        marginRate: r.sale_price ? (((r.sale_price - r.purchase_price) / r.sale_price) * 100) : 0,
        requiresSerialNumber: r.serialized === 1,
        isStockable: r.is_stockable === 1,
        status: r.status,
        type: r.product_type || 'Équipement',
        description: r.description || '',
        tags: parseTags(r.tags_json),
        supplierWarrantyMonths: r.supplier_warranty_months || 0,
        clientWarrantyMonths: r.client_warranty_months || 0,
        physicalStock: r.physicalStock,
        reservedStock: r.reservedStock,
        availableStock: r.availableStock,
        createdAt: r.created_at,
        orderedStock: r.orderedStock || 0,
        minThreshold: r.minimum_stock,
        mainSupplier: r.mainSupplier || 'Non défini',
        mainSupplierId: r.mainSupplierId || ''
      }));
      res.json(products);
    } catch(err) {
      res.status(500).json({error: (err as any).message});
    }
  });

  app.get('/api/products/:id', (req: Request, res: Response) => {
    try {
      const product = db.prepare(`
        SELECT p.*, 
               COALESCE(SUM(ws.physical_quantity), 0) as physicalStock, 
               COALESCE(SUM(ws.reserved_quantity), 0) as reservedStock, 
               (COALESCE(SUM(ws.physical_quantity), 0) - COALESCE(SUM(ws.reserved_quantity), 0)) as availableStock,
               (
                 SELECT COALESCE(SUM(MAX(0, sol.quantity_ordered - COALESCE((
                   SELECT SUM(srl.quantity_accepted)
                   FROM supplier_receipt_lines srl
                   JOIN supplier_receipts sr ON sr.id = srl.supplier_receipt_id
                   WHERE srl.supplier_order_line_id = sol.id AND sr.status = 'Validée'
                 ), 0))), 0)
                 FROM supplier_order_lines sol
                 JOIN supplier_orders so ON so.id = sol.supplier_order_id
                 WHERE sol.product_id = p.id AND so.status NOT IN ('Brouillon', 'Annulée')
               ) AS orderedStock
        FROM products p 
        LEFT JOIN warehouse_stocks ws ON p.id = ws.product_id 
        WHERE p.id = ?
        GROUP BY p.id
      `).get(req.params.id) as any;

      if (!product) return res.status(404).json({error: 'Produit non trouvé'});

      const offers = db.prepare(`
        SELECT spo.*, s.name as supplier_name, s.reference as supplier_reference_code, s.email as supplier_email
        FROM supplier_product_offers spo
        JOIN suppliers s ON spo.supplier_id = s.id
        WHERE spo.product_id = ?
      `).all(req.params.id) as any[];

      const mainOffer = offers[0];
      res.json({
        id: product.id,
        reference: product.reference,
        name: product.name,
        family: product.family,
        brand: product.brand,
        model: product.model,
        description: product.description || '',
        type: product.product_type || 'Équipement',
        isStockable: product.is_stockable === 1,
        requiresSerialNumber: product.serialized === 1,
        status: product.status,
        physicalStock: product.physicalStock,
        reservedStock: product.reservedStock,
        availableStock: product.availableStock,
        orderedStock: product.orderedStock || 0,
        minThreshold: product.minimum_stock || 0,
        supplierWarrantyMonths: product.supplier_warranty_months || 0,
        clientWarrantyMonths: product.client_warranty_months || 0,
        tags: parseTags(product.tags_json),
        createdAt: product.created_at,
        purchasePrice: product.purchase_price || 0,
        sellingPrice: product.sale_price || 0,
        margin: (product.sale_price || 0) - (product.purchase_price || 0),
        marginRate: product.sale_price ? (((product.sale_price - product.purchase_price) / product.sale_price) * 100) : 0,
        mainSupplier: mainOffer?.supplier_name || 'Non défini',
        mainSupplierId: mainOffer?.supplier_id || '',
        offers: offers.map((o: any) => ({
          id: o.id,
          supplierId: o.supplier_id,
          supplierName: o.supplier_name,
          supplierEmail: o.supplier_email,
          supplierReferenceCode: o.supplier_reference_code,
          reference: o.supplier_reference,
          purchasePrice: o.purchase_price,
          currency: o.currency,
          deliveryDays: o.delivery_days,
          updatedAt: o.updated_at
        }))
      });
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/products', express.json(), (req: Request, res: Response) => {
    try {
      const {
        reference, name, brand, model, family, description, type, isStockable,
        requiresSerialNumber, status, minThreshold, minimum_stock, purchasePrice,
        sellingPrice, supplierId, supplierRef, physicalStock, reservedStock,
        supplierWarrantyMonths, clientWarrantyMonths, tags
      } = req.body;
      const count = (db.prepare("SELECT COUNT(*) as count FROM products").get() as any).count;
      const ref = reference || `PRD-${(count + 1).toString().padStart(4, '0')}`;
      const id = `p${Date.now()}`;
      
      db.prepare(`
        INSERT INTO products (id, reference, name, brand, model, family, description, product_type, is_stockable, serialized, status, minimum_stock, purchase_price, sale_price, supplier_warranty_months, client_warranty_months, tags_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, ref, name, brand, model, family, description || '', type || 'Équipement', isStockable === false ? 0 : 1, requiresSerialNumber ? 1 : 0, status || 'Actif', minThreshold ?? minimum_stock ?? 0, purchasePrice || 0, sellingPrice || 0, supplierWarrantyMonths || 0, clientWarrantyMonths || 0, JSON.stringify(tags || []));

      if (isStockable !== false) {
        db.prepare('INSERT INTO warehouse_stocks (id, product_id, location_id, physical_quantity, reserved_quantity) VALUES (?, ?, ?, ?, ?)')
          .run(`stk${Date.now()}`, id, 'loc1', physicalStock || 0, reservedStock || 0);
      }
      
      if (supplierId) {
        const offerId = `offer${Date.now()}`;
        db.prepare(`
          INSERT INTO supplier_product_offers (id, supplier_id, product_id, supplier_reference, purchase_price, currency, delivery_days)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(offerId, supplierId, id, supplierRef || ref, purchasePrice || 0, 'DZD', 0);
      }

      const supplier = supplierId ? db.prepare('SELECT name FROM suppliers WHERE id = ?').get(supplierId) as any : null;
      res.json({
        id,
        reference: ref,
        name,
        family,
        brand: brand || '',
        model: model || '',
        mainSupplier: supplier?.name || 'Non défini',
        mainSupplierId: supplierId || '',
        purchasePrice: purchasePrice || 0,
        sellingPrice: sellingPrice || 0,
        margin: (sellingPrice || 0) - (purchasePrice || 0),
        marginRate: sellingPrice ? (((sellingPrice - purchasePrice) / sellingPrice) * 100) : 0,
        physicalStock: physicalStock || 0,
        reservedStock: reservedStock || 0,
        availableStock: Math.max(0, (physicalStock || 0) - (reservedStock || 0)),
        orderedStock: 0,
        minThreshold: minThreshold ?? minimum_stock ?? 0,
        supplierWarrantyMonths: supplierWarrantyMonths || 0,
        clientWarrantyMonths: clientWarrantyMonths || 0,
        status: status || 'Actif',
        requiresSerialNumber: !!requiresSerialNumber,
        isStockable: isStockable !== false,
        description: description || '',
        type: type || 'Équipement',
        createdAt: new Date().toISOString(),
        tags: tags || []
      });
    } catch(err) {
      res.status(500).json({error: (err as any).message});
    }
  });

  app.put('/api/products/:id', express.json(), (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        reference, name, brand, model, family, description, type, isStockable,
        requiresSerialNumber, status, minThreshold, minimum_stock, purchasePrice,
        sellingPrice, supplierId, supplierRef, supplierWarrantyMonths,
        clientWarrantyMonths, tags
      } = req.body;
      
      db.prepare(`
        UPDATE products 
        SET reference = ?, name = ?, brand = ?, model = ?, family = ?, description = ?, product_type = ?, is_stockable = ?, serialized = ?, status = ?, minimum_stock = ?, purchase_price = ?, sale_price = ?, supplier_warranty_months = ?, client_warranty_months = ?, tags_json = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(reference, name, brand, model, family, description || '', type || 'Équipement', isStockable === false ? 0 : 1, requiresSerialNumber ? 1 : 0, status || 'Actif', minThreshold ?? minimum_stock ?? 0, purchasePrice || 0, sellingPrice || 0, supplierWarrantyMonths || 0, clientWarrantyMonths || 0, JSON.stringify(tags || []), id);
      
      if (supplierId) {
        // Update or Insert offer
        const existing = db.prepare('SELECT id FROM supplier_product_offers WHERE supplier_id = ? AND product_id = ?').get(supplierId, id) as any;
        if (existing) {
          db.prepare(`
            UPDATE supplier_product_offers 
            SET supplier_reference = ?, purchase_price = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(supplierRef || reference, purchasePrice || 0, existing.id);
        } else {
          db.prepare(`
            INSERT INTO supplier_product_offers (id, supplier_id, product_id, supplier_reference, purchase_price, currency, delivery_days)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(`offer${Date.now()}`, supplierId, id, supplierRef || reference, purchasePrice || 0, 'DZD', 0);
        }
      }

      res.json({ success: true });
    } catch(err) {
      res.status(500).json({error: (err as any).message});
    }
  });

  app.get('/api/suppliers', (req: Request, res: Response) => {
    try {
      const rows = db.prepare('SELECT * FROM suppliers ORDER BY name').all();
      const mapped = rows.map(mapSupplier);
      res.json(mapped);
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.get('/api/suppliers/:id', (req: Request, res: Response) => {
    try {
      const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id) as any;
      if (!supplier) return res.status(404).json({error: 'Fournisseur non trouvé'});
      
      const offers = db.prepare(`
        SELECT spo.*, p.name as product_name, p.reference as product_reference,
          COALESCE((SELECT SUM(ws.physical_quantity) FROM warehouse_stocks ws WHERE ws.product_id = p.id), 0) AS internal_stock
        FROM supplier_product_offers spo
        JOIN products p ON spo.product_id = p.id
        WHERE spo.supplier_id = ?
      `).all(req.params.id);

      const receptions = db.prepare(`
        SELECT r.*, o.number AS order_number,
          (SELECT COUNT(*) FROM supplier_receipt_lines WHERE supplier_receipt_id = r.id) AS product_count,
          (SELECT COALESCE(SUM(quantity_accepted), 0) FROM supplier_receipt_lines WHERE supplier_receipt_id = r.id) AS total_quantity
        FROM supplier_receipts r
        LEFT JOIN supplier_orders o ON o.id = r.supplier_order_id
        WHERE r.fournisseur_id = ? OR o.supplier_id = ?
        ORDER BY r.receipt_date DESC
      `).all(req.params.id, req.params.id) as any[];
      const orders = db.prepare('SELECT * FROM supplier_orders WHERE supplier_id = ? ORDER BY order_date DESC').all(req.params.id) as any[];

      res.json({
        ...mapSupplier(supplier),
        offers: offers.map((o: any) => ({
          id: o.id,
          productId: o.product_id,
          productName: o.product_name,
          productReference: o.product_reference,
          reference: o.supplier_reference,
          purchasePrice: o.purchase_price,
          currency: o.currency,
          deliveryDays: o.delivery_days,
          internalStock: o.internal_stock || 0,
          availableInternally: (o.internal_stock || 0) > 0,
          updatedAt: o.updated_at
        })),
        receptions: receptions.map(r => ({
          id: r.id,
          fournisseurId: req.params.id,
          date: r.receipt_date,
          referenceBL: r.supplier_delivery_note || r.number,
          referenceCommande: r.order_number,
          nbProduits: r.product_count || 0,
          quantiteTotale: r.total_quantity || 0,
          valeurTotale: 0,
          statut: r.status === 'Validée' ? 'validee' : 'brouillon',
          depot: 'Entrepôt principal',
          responsable: r.received_by || 'Magasinier'
        })),
        commandes: orders.map(o => ({
          id: o.id,
          reference: o.number,
          date: o.order_date,
          statut: o.status,
          nbProduits: 0,
          quantiteTotale: 0,
          valeurTotale: 0,
          devise: o.currency || 'DZD'
        }))
      });
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/supplier-offers', express.json(), (req: Request, res: Response) => {
    try {
      const { supplierId, productId, reference, purchasePrice, currency, deliveryDays } = req.body;
      const id = `offer${Date.now()}`;
      
      db.prepare(`
        INSERT INTO supplier_product_offers (id, supplier_id, product_id, supplier_reference, purchase_price, currency, delivery_days)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, supplierId, productId, reference, purchasePrice, currency || 'DZD', deliveryDays || 0);

      res.json({ id });
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.put('/api/supplier-offers/:id', express.json(), (req: Request, res: Response) => {
    try {
      const { reference, purchasePrice, currency, deliveryDays } = req.body;
      db.prepare(`
        UPDATE supplier_product_offers 
        SET supplier_reference = ?, purchase_price = ?, currency = ?, delivery_days = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(reference, purchasePrice, currency, deliveryDays, req.params.id);
      res.json({ success: true });
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.delete('/api/supplier-offers/:id', (req: Request, res: Response) => {
    try {
      db.prepare('DELETE FROM supplier_product_offers WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/suppliers', express.json(), (req: Request, res: Response) => {
    try {
      const {
        reference, name, currency, paymentMethod, modePaiement, status, statut,
        contact_name, contactPrincipale, email, phone, telephone, address, type,
        country, pays, averageDeliveryDays, delaiMoyenLivraison, conformityRate, tauxConformite
      } = req.body;
      const count = (db.prepare("SELECT COUNT(*) as count FROM suppliers").get() as any).count;
      const ref = reference || `FOUR-${(count + 1).toString().padStart(4, '0')}`;
      const id = `sup${Date.now()}`;

      db.prepare(`
        INSERT INTO suppliers (id, reference, name, type, country, contact_name, email, phone, address, payment_method, currency, average_delivery_days, conformity_rate, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, ref, name.trim(), type || 'Distributeur', country || pays || 'Algérie',
        contact_name || contactPrincipale || null, email || null, phone || telephone || null,
        address || null, paymentMethod || modePaiement || 'Virement', currency || 'DZD',
        averageDeliveryDays || parseInt(delaiMoyenLivraison) || 0, conformityRate ?? tauxConformite ?? 100,
        status || (statut === 'actif' ? 'Actif' : 'Inactif')
      );
      
      res.json({ id, reference: ref });
    } catch(err) {
      res.status(500).json({error: (err as any).message});
    }
  });

  app.get('/api/clients', (req: Request, res: Response) => {
    try {
      const rows = db.prepare('SELECT * FROM clients').all();
      const mapped = rows.map((r: any) => ({
        id: r.id,
        reference: r.reference,
        name: r.name,
        mainContact: r.contact_name,
        email: r.email,
        phone: r.phone,
        address: r.address,
        status: r.archived_at ? 'Archivé' : r.status,
        type: r.type || 'Entreprise',
        sector: r.sector || 'Autre',
        city: r.city || '',
        region: r.region || '',
        hasExpiredWarranties: false,
        sitesCount: (db.prepare("SELECT COUNT(*) as count FROM client_sites WHERE client_id = ?").get(r.id) as any).count,
        activeProjects: (db.prepare("SELECT COUNT(*) as count FROM client_projects WHERE client_id = ? AND status != 'Terminé'").get(r.id) as any).count,
        installedEquipments: (db.prepare("SELECT COUNT(*) as count FROM installed_equipment WHERE client_id = ?").get(r.id) as any).count,
        createdAt: r.created_at
      }));
      res.json(mapped);
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/clients', express.json(), (req: Request, res: Response) => {
    try {
      const { name, reference, contact_name, mainContact, email, phone, address, status, type, sector, city, region } = req.body;
      const count = (db.prepare("SELECT COUNT(*) as count FROM clients").get() as any).count;
      const ref = reference || `CLI-${(count + 1).toString().padStart(4, '0')}`;
      const id = `cli${Date.now()}`;

      db.prepare(`
        INSERT INTO clients (id, reference, name, type, sector, contact_name, email, phone, address, city, region, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, ref, name, type || 'Entreprise', sector || 'Autre', contact_name || mainContact || null, email || null, phone || null, address || null, city || null, region || null, status || 'Actif');
      
      res.json({ id, reference: ref });
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.get('/api/projects', (req: Request, res: Response) => {
    try {
      ensureDemoProjects();
      const projects = db.prepare(`
        SELECT p.*, c.name as client_name, s.name as site_name, u.name as manager_name 
        FROM client_projects p 
        JOIN clients c ON p.client_id = c.id 
        LEFT JOIN client_sites s ON p.client_site_id = s.id 
        LEFT JOIN users u ON p.manager_id = u.id
      `).all();
      
      const mapped = projects.map((p: any) => ({
        id: p.id,
        clientId: p.client_id,
        reference: p.reference,
        name: p.name,
        description: p.notes,
        clientName: p.client_name,
        siteName: p.site_name,
        responsibleName: p.manager_name || 'Non assigné',
        contactClient: 'ND',
        scope: '',
        objectives: '',
        startDate: p.start_date,
        deadline: p.planned_end_date,
        progress: p.progress,
        status: p.status,
        priority: 'Moyenne',
        jalons: [],
        produits: [],
        services: [],
        team: [],
        documents: [],
        alertes: []
      }));
      res.json(mapped);
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/projects', express.json(), (req: Request, res: Response) => {
    try {
      const { nom, clientId, siteId, managerId, status, progress, startDate, endDate, budget, priority, notes } = req.body;
      const id = `proj${Date.now()}`;
      const code = `PRJ-${Date.now().toString().slice(-6)}`;

      db.prepare(`
        INSERT INTO client_projects (id, reference, name, client_id, client_site_id, manager_id, start_date, planned_end_date, status, progress, budget, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, code, nom, clientId, siteId || null, managerId || null, startDate || null, endDate || null, status || 'Nouveau', progress || 0, budget || 0, notes || null);

      const client = db.prepare('SELECT name FROM clients WHERE id = ?').get(clientId) as any;
      const manager = db.prepare('SELECT name FROM users WHERE id = ?').get(managerId || 'u2') as any;

      res.json({
        id,
        clientId,
        reference: code,
        name: nom,
        description: notes || '',
        clientName: client?.name || '',
        siteName: '',
        responsibleName: manager?.name || 'Responsable projet',
        contactClient: 'ND',
        scope: '',
        objectives: '',
        startDate: startDate || '',
        deadline: endDate || '',
        progress: progress || 0,
        status: status || 'Nouveau',
        priority: priority || 'Moyenne',
        jalons: [],
        produits: [],
        services: [],
        team: [],
        documents: [],
        alertes: []
      });
    } catch(err) { res.status(422).json({error: (err as any).message}); }
  });

  app.get('/api/project-needs', (req: Request, res: Response) => {
    try {
      const projects = db.prepare(`
        SELECT DISTINCT p.*, c.name AS client_name, s.name AS site_name, u.name AS manager_name
        FROM client_projects p
        JOIN clients c ON c.id = p.client_id
        LEFT JOIN client_sites s ON s.id = p.client_site_id
        LEFT JOIN users u ON u.id = p.manager_id
        WHERE EXISTS (SELECT 1 FROM project_product_needs pn WHERE pn.project_id = p.id)
           OR EXISTS (SELECT 1 FROM project_service_needs sn WHERE sn.project_id = p.id)
        ORDER BY p.updated_at DESC
      `).all() as any[];

      res.json(projects.map((project: any) => {
        const products = db.prepare(`
          SELECT pn.*, p.name, p.reference, p.serialized,
                 COALESCE(SUM(ws.physical_quantity), 0) AS physical_stock,
                 COALESCE(SUM(ws.reserved_quantity), 0) AS reserved_stock,
                 COALESCE((
                   SELECT SUM(srl.quantity_reserved)
                   FROM stock_reservation_lines srl
                   JOIN stock_reservations sr ON sr.id = srl.stock_reservation_id
                   WHERE srl.project_product_need_id = pn.id
                     AND sr.status IN ('Réservée', 'Partiellement réservée')
                 ), 0) AS reserved_for_need
          FROM project_product_needs pn
          JOIN products p ON p.id = pn.product_id
          LEFT JOIN warehouse_stocks ws ON ws.product_id = p.id
          WHERE pn.project_id = ?
          GROUP BY pn.id
        `).all(project.id) as any[];
        const services = db.prepare(`
          SELECT sn.*, s.name, s.unit
          FROM project_service_needs sn
          JOIN services s ON s.id = sn.service_id
          WHERE sn.project_id = ?
        `).all(project.id) as any[];
        const requested = products.reduce((sum, product) => sum + product.quantity_required, 0);
        const reserved = products.reduce((sum, product) => sum + Math.min(product.quantity_required, product.reserved_for_need), 0);

        return {
          id: `need-${project.id}`,
          reference: `BES-${project.reference.replace('PRJ-', '')}`,
          projectId: project.id,
          projectName: project.name,
          clientId: project.client_id,
          clientName: project.client_name,
          site: project.site_name || '',
          responsible: project.manager_name || 'Responsable projet',
          createdAt: project.created_at,
          plannedDate: project.planned_end_date || project.start_date,
          priority: 'Moyenne',
          status: products.every(product => product.reserved_for_need >= product.quantity_required)
            ? 'Couvert'
            : products.some(product => product.reserved_for_need > 0)
              ? 'Partiellement couvert'
              : 'À réserver',
          impactProject: products.some(product =>
            product.reserved_for_need < product.quantity_required
            && product.physical_stock - product.reserved_stock < product.quantity_required - product.reserved_for_need
          ) ? 'Risque de retard' : 'Aucun blocage',
          justification: project.notes || '',
          products: products.map((product: any) => {
            const availableBeforeNeed = Math.max(0, product.physical_stock - product.reserved_stock);
            const reservedForNeed = Math.min(product.quantity_required, product.reserved_for_need);
            return {
              id: product.id,
              productId: product.product_id,
              label: product.name,
              reference: product.reference,
              requestedQty: product.quantity_required,
              availableQty: availableBeforeNeed,
              reservedQty: reservedForNeed,
              missingQty: Math.max(0, product.quantity_required - reservedForNeed),
              location: 'EMPL-A-01',
              status: reservedForNeed >= product.quantity_required ? 'Réservé' : 'Partiellement réservé',
              isSerialized: product.serialized === 1,
              serializedCount: 0
            };
          }),
          services: services.map((service: any) => ({
            id: service.id,
            serviceId: service.service_id,
            label: service.name,
            plannedDuration: service.quantity,
            unit: service.unit || 'Unité',
            plannedDate: service.planned_date || project.start_date,
            status: service.status
          })),
          substitutions: [],
          history: [],
          totalCoverageRate: requested > 0 ? Math.round((reserved / requested) * 100) : 100,
          isUrgent: false
        };
      }));
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/project-needs', express.json(), (req: Request, res: Response) => {
    try {
      const { projectId, priority, products = [], services = [] } = req.body;
      if (!projectId) throw new Error('Veuillez sélectionner un projet');
      if (!products.length && !services.length) throw new Error('Ajoutez au moins un produit ou un service');

        const result = db.transaction(() => {
        const activeReservations = db.prepare(`
          SELECT id
          FROM stock_reservations
          WHERE project_id = ? AND status IN ('Réservée', 'Partiellement réservée')
        `).all(projectId) as any[];

        activeReservations.forEach((reservation: any) => {
          const reservedLines = db.prepare(`
            SELECT product_id, location_id, quantity_reserved
            FROM stock_reservation_lines
            WHERE stock_reservation_id = ?
          `).all(reservation.id) as any[];

          reservedLines.forEach((line: any) => {
            db.prepare(`
              UPDATE warehouse_stocks
              SET reserved_quantity = MAX(0, reserved_quantity - ?),
                  updated_at = CURRENT_TIMESTAMP
              WHERE product_id = ? AND location_id IS ?
            `).run(line.quantity_reserved, line.product_id, line.location_id || null);
          });

          db.prepare("UPDATE stock_reservations SET status = 'Annulée', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
            .run(reservation.id);
        });

        db.prepare(`
          UPDATE stock_reservation_lines
          SET project_product_need_id = NULL
          WHERE project_product_need_id IN (
            SELECT id FROM project_product_needs WHERE project_id = ?
          )
        `).run(projectId);

        db.prepare('DELETE FROM project_product_needs WHERE project_id = ?').run(projectId);
        db.prepare('DELETE FROM project_service_needs WHERE project_id = ?').run(projectId);

        products.forEach((product: any, index: number) => {
          if (!product.productId) return;
          const requested = Math.max(0, Number(product.requestedQty || 0));
          db.prepare(`
            INSERT INTO project_product_needs (id, project_id, product_id, quantity_required, priority, status)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(`need-product-${Date.now()}-${index}`, projectId, product.productId, requested, priority || 'Moyenne', 'En attente de réservation');
        });

        services.forEach((service: any, index: number) => {
          if (!service.serviceId) return;
          db.prepare(`
            INSERT INTO project_service_needs (id, project_id, service_id, quantity, planned_date, status)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(`need-service-${Date.now()}-${index}`, projectId, service.serviceId, Number(service.plannedDuration || 1), service.plannedDate || null, 'Planifié');
        });

        return {
          id: `need-${projectId}`,
          reference: `BES-${Date.now().toString().slice(-6)}`,
          status: 'En attente de réservation'
        };
      })();
      res.json(result);
    } catch(err) { res.status(422).json({error: (err as any).message}); }
  });

  app.get('/api/services', (req: Request, res: Response) => {
    const rows = db.prepare('SELECT * FROM services ORDER BY name').all() as any[];
    res.json(rows.map(r => ({
      id: r.id,
      reference: r.reference,
      name: r.name,
      family: 'Services techniques',
      unit: r.unit || 'Unité',
      internalCost: 0,
      sellingPrice: r.sale_price || 0,
      margin: r.sale_price || 0,
      marginRate: 100,
      status: r.archived_at ? 'Désactivé' : r.status,
      description: r.description || '',
      estimatedDuration: 'Selon intervention',
      conditions: '',
      requiredSkills: [],
      prerequisites: [],
      executionSteps: [],
      associatedEquipment: [],
      requiredDocuments: [],
      qualityCheckpoints: [],
      createdAt: r.created_at,
      lastUsed: r.updated_at,
      usageCount: 0,
      lastUpdatedBy: 'Système'
    })));
  });
  
  app.post('/api/services', express.json(), (req: Request, res: Response) => {
    try {
      const { name, description, unit, sale_price, sellingPrice, status, reference } = req.body;
      const count = (db.prepare("SELECT COUNT(*) as count FROM services").get() as any).count;
      const ref = reference || `SRV-${(count + 1).toString().padStart(4, '0')}`;
      const id = `srv${Date.now()}`;
      
      db.prepare(`
        INSERT INTO services (id, reference, name, description, unit, sale_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, ref, name, description || null, unit || 'Unité', sale_price ?? sellingPrice ?? 0, status || 'Actif');
      
      res.json({ id, reference: ref });
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/supplier-orders', express.json(), (req: Request, res: Response) => {
    try {
      const { fournisseurId, dateCommande, reference, dateLivraison, responsable, statut, commentaire, modePaiement, devise, delaiPaiement, fraisLivraison, conditions, lines } = req.body;
      const id = `order${Date.now()}`;
      const count = (db.prepare("SELECT COUNT(*) as count FROM supplier_orders").get() as any).count;
      const num = reference || `CF-${(count + 1).toString().padStart(4, '0')}`;

      db.transaction(() => {
        db.prepare(`
          INSERT INTO supplier_orders (id, number, supplier_id, order_date, expected_delivery_date, status, notes, payment_method, currency, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, num, fournisseurId, dateCommande, dateLivraison || null, statut, commentaire, modePaiement, devise, responsable);

        for (const line of lines) {
           db.prepare(`
             INSERT INTO supplier_order_lines (id, supplier_order_id, product_id, quantity_ordered, unit_purchase_price)
             VALUES (?, ?, ?, ?, ?)
           `).run(`line${Math.random()}`, id, line.productId, line.qteCmd, line.prixU);
        }
      })();
      res.json({ id, reference: num });
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.get('/api/supplier-orders', (req: Request, res: Response) => {
    try {
      const orders = db.prepare(`
        SELECT o.*, s.name as supplier_name,
          (SELECT COUNT(*) FROM supplier_order_lines WHERE supplier_order_id = o.id) as lines_count,
          (SELECT id FROM supplier_receipts WHERE supplier_order_id = o.id ORDER BY receipt_date DESC LIMIT 1) as reception_id
        FROM supplier_orders o JOIN suppliers s ON o.supplier_id = s.id
        ORDER BY o.order_date DESC
      `).all();
      const allLines = db.prepare(`
        SELECT l.*, p.name as product_name, p.reference as product_reference, p.serialized,
          COALESCE((SELECT SUM(rl.quantity_accepted) FROM supplier_receipt_lines rl JOIN supplier_receipts r ON r.id = rl.supplier_receipt_id WHERE rl.supplier_order_line_id = l.id AND r.status = 'Validée'), 0) as quantity_received,
          COALESCE((SELECT spo.supplier_reference FROM supplier_product_offers spo WHERE spo.product_id = l.product_id AND spo.supplier_id = o.supplier_id LIMIT 1), p.reference) as supplier_product_reference
        FROM supplier_order_lines l
        JOIN supplier_orders o ON o.id = l.supplier_order_id
        JOIN products p ON l.product_id = p.id
      `).all();
      
      const mappedOrders = orders.map((o: any) => ({
        id: o.id,
        reference: o.number,
        fournisseurId: o.supplier_id,
        fournisseurName: o.supplier_name,
        dateCommande: o.order_date,
        dateLivraisonPrevue: o.expected_delivery_date,
        responsableId: o.created_by,
        responsableName: 'Utilisateur',
        statut: o.status,
        commentaire: o.notes,
        modePaiement: o.payment_method,
        devise: o.currency,
        remise: 0,
        fraisLivraison: 0,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        receptionId: o.reception_id,
        conditionsParticulieres: '',
        lignes: allLines.filter((l: any) => l.supplier_order_id === o.id).map((l: any) => ({
          id: l.id,
          productId: l.product_id,
          productName: l.product_name,
          refFournisseur: l.supplier_product_reference,
          qteCmd: l.quantity_ordered,
          qteRecue: l.quantity_received,
          prixU: l.unit_purchase_price
        }))
      }));
      res.json(mappedOrders);
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.get('/api/supplier-receipts', (req, res) => {
    try {
      const receipts = db.prepare(`
        SELECT 
          r.*, 
          o.number as order_number, 
          w.name as warehouse_name, 
          s.name as supplier_name,
          COALESCE(r.fournisseur_id, o.supplier_id) as actual_supplier_id
        FROM supplier_receipts r 
        LEFT JOIN supplier_orders o ON r.supplier_order_id = o.id 
        LEFT JOIN warehouses w ON r.warehouse_id = w.id 
        LEFT JOIN suppliers s ON s.id = COALESCE(r.fournisseur_id, o.supplier_id)
      `).all();

      const mappedReceipts = receipts.map((r: any) => {
        const lines = db.prepare(`
          SELECT 
            rl.*, 
            p.id as product_id,
            p.name as product_name, 
            p.reference as product_reference,
            p.family as product_family,
            p.serialized as is_serialized,
            sol.quantity_ordered,
            sol.unit_purchase_price,
            loc.code as location_name
          FROM supplier_receipt_lines rl
          JOIN supplier_order_lines sol ON rl.supplier_order_line_id = sol.id
          JOIN products p ON sol.product_id = p.id
          LEFT JOIN warehouse_locations loc ON loc.id = rl.destination_location_id
          WHERE rl.supplier_receipt_id = ?
        `).all(r.id);
        const documents = db.prepare(`
          SELECT * FROM documents
          WHERE source_type = 'supplier_receipt' AND source_id = ?
          ORDER BY created_at DESC
        `).all(r.id) as any[];
        
        let totalQty = 0;
        let totalValue = 0;
        
        const mappedProducts = lines.map((l: any) => {
          const qty = l.quantity_accepted || 0;
          const price = l.unit_purchase_price || 0;
          totalQty += qty;
          totalValue += qty * price;
          
          const serialNumbers = db.prepare(`
            SELECT sn.serial_number
            FROM receipt_serial_numbers rsn
            JOIN serial_numbers sn ON sn.id = rsn.serial_number_id
            WHERE rsn.supplier_receipt_line_id = ?
            ORDER BY sn.serial_number
          `).all(l.id).map((serial: any) => serial.serial_number);

          return {
            id: l.product_id,
            reference: l.product_reference,
            name: l.product_name,
            family: l.product_family,
            qtyOrdered: l.quantity_ordered || 0,
            qtyReceived: qty,
            purchasePrice: price,
            locationId: l.destination_location_id,
            locationName: l.location_name,
            condition: l.conformity_status || 'Conforme',
            isSerialized: l.is_serialized === 1,
            serialNumbers,
            hasGap: (l.quantity_accepted || 0) !== (l.quantity_ordered || 0)
              || (l.quantity_rejected || 0) > 0
              || (l.conformity_status && l.conformity_status !== 'Conforme')
          };
        });
        const gaps = mappedProducts
          .filter((product: any) => product.hasGap)
          .map((product: any, index: number) => ({
            id: `${r.id}-gap-${index}`,
            type: product.condition === 'Abîmé' ? 'Produit abîmé' : 'Quantité manquante',
            productName: product.name,
            comment: product.condition === 'Abîmé'
              ? `Une partie de la livraison a été refusée pour non-conformité.`
              : `${product.qtyReceived} unité(s) reçue(s) sur ${product.qtyOrdered} commandée(s).`
          }));
        const entryVoucher = documents.find((document: any) => document.document_type === "Bon d'entrée");
        
        return {
          id: r.id,
          reference: r.number,
          supplierId: r.actual_supplier_id,
          supplierName: r.supplier_name || 'Inconnu',
          date: r.receipt_date || r.created_at,
          validationDate: r.validated_at,
          deliveryNoteRef: r.supplier_delivery_note || '',
          supplierInvoiceRef: r.supplier_invoice_number || '',
          purchaseOrderRef: r.order_number || '',
          warehouseId: r.warehouse_id,
          warehouseName: r.warehouse_name || 'Non assigné',
          responsible: r.received_by || 'Utilisateur',
          status: r.status,
          totalQty,
          totalValue,
          products: mappedProducts,
          gaps,
          documents: documents.map((document: any) => ({
            id: document.id,
            type: document.document_type,
            name: document.number
          })),
          entryVoucher: entryVoucher ? {
            id: entryVoucher.id,
            number: entryVoucher.number,
            status: entryVoucher.status,
            createdAt: entryVoucher.created_at
          } : undefined,
          history: [
            {
              id: `${r.id}-created`,
              date: r.created_at,
              action: 'Réception créée',
              user: r.received_by || 'Utilisateur'
            },
            ...(r.validated_at ? [{
              id: `${r.id}-validated`,
              date: r.validated_at,
              action: "Réception validée et bon d'entrée généré",
              user: r.received_by || 'Utilisateur'
            }] : [])
          ]
        };
      });
      res.json(mappedReceipts);
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/supplier-receipts', express.json(), (req, res) => {
    try {
      const { fromOrder, orderId, fournisseurId, dateReception, referenceBL, referenceFacture, depot, responsable, statut, commentaire, lines } = req.body;
      const id = `rec${Date.now()}`;
      const count = (db.prepare("SELECT COUNT(*) as count FROM supplier_receipts").get() as any).count;
      const num = `REC-${(count + 1).toString().padStart(4, '0')}`;

      db.transaction(() => {
        const warehouse = db.prepare('SELECT id FROM warehouses WHERE id = ? OR name = ? LIMIT 1').get(depot, depot) as any;
        db.prepare(`
          INSERT INTO supplier_receipts (
            id, number, supplier_order_id, fournisseur_id, warehouse_id, receipt_date,
            supplier_delivery_note, supplier_invoice_number, status, notes, received_by, stock_applied
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `).run(id, num, fromOrder === 'oui' ? orderId : null, fournisseurId, warehouse?.id || null, dateReception, referenceBL, referenceFacture, statut, commentaire, responsable);

        for (const line of lines || []) {
          const orderLine = line.orderLineId
            ? { id: line.orderLineId }
            : db.prepare('SELECT id FROM supplier_order_lines WHERE supplier_order_id = ? AND product_id = ? LIMIT 1').get(orderId, line.productId) as any;
          if (!orderLine?.id) continue;
          const location = db.prepare('SELECT id FROM warehouse_locations WHERE id = ? OR code = ? LIMIT 1').get(line.emplacement, line.emplacement) as any;
          const accepted = Math.max(0, Number(line.qteAcceptee ?? line.qteRecue ?? 0));
          const rejected = Math.max(0, Number(line.qteRefusee ?? 0));
          const condition = line.etat === 'conforme' ? 'Conforme' : line.etat || 'Conforme';
          const receiptLineId = `rl-${id}-${orderLine.id}`;
          db.prepare(`
            INSERT INTO supplier_receipt_lines (
              id, supplier_receipt_id, supplier_order_line_id, quantity_delivered,
              quantity_accepted, quantity_rejected, destination_location_id, conformity_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(receiptLineId, id, orderLine.id, accepted + rejected, accepted, rejected, location?.id || null, condition);

          const product = db.prepare('SELECT serialized FROM products WHERE id = ?').get(line.productId) as any;
          if (product?.serialized === 1) {
            const serials = String(line.serials || '')
              .split('\n')
              .map((serial: string) => serial.trim())
              .filter(Boolean);

            for (const serial of serials) {
              let serialRecord = db.prepare('SELECT id FROM serial_numbers WHERE serial_number = ? LIMIT 1').get(serial) as any;
              if (!serialRecord) {
                serialRecord = { id: `sn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` };
                db.prepare(`
                  INSERT INTO serial_numbers (
                    id, product_id, serial_number, status, location_id, supplier_id, received_at
                  ) VALUES (?, ?, ?, 'en_attente_reception', ?, ?, ?)
                `).run(serialRecord.id, line.productId, serial, location?.id || null, fournisseurId || null, dateReception || null);
              }
              db.prepare(`
                INSERT INTO receipt_serial_numbers (id, supplier_receipt_line_id, serial_number_id)
                VALUES (?, ?, ?)
              `).run(`rsn-${receiptLineId}-${serialRecord.id}`, receiptLineId, serialRecord.id);
            }
          }
        }

        if (statut === 'Validée') validateSupplierReceipt(id);
      })();
      
      res.json({ id, reference: num });
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/supplier-receipts/:id/validate', express.json(), (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      db.transaction(() => validateSupplierReceipt(id))();
      res.json({ success: true });
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.get('/api/reservations', (req: Request, res: Response) => {
    try {
      const reservations = db.prepare(`
        SELECT sr.*, p.reference AS project_reference, p.name AS project_name,
               p.planned_end_date, p.start_date, c.name AS client_name,
               requester.name AS requester_name, approver.name AS approver_name
        FROM stock_reservations sr
        JOIN client_projects p ON p.id = sr.project_id
        JOIN clients c ON c.id = p.client_id
        LEFT JOIN users requester ON requester.id = sr.requested_by
        LEFT JOIN users approver ON approver.id = sr.approved_by
        ORDER BY sr.created_at DESC
      `).all() as any[];

      const mapped = reservations.map((reservation: any) => {
        const products = db.prepare(`
          SELECT srl.*, p.name, p.reference, loc.code AS location_code,
                 w.name AS warehouse_name,
                 COALESCE((
                   SELECT SUM(sel.quantity_exited)
                   FROM stock_exit_lines sel
                   JOIN stock_exits se ON se.id = sel.stock_exit_id
                   WHERE sel.stock_reservation_line_id = srl.id
                     AND se.status = 'Validée'
                 ), 0) AS quantity_consumed
          FROM stock_reservation_lines srl
          JOIN products p ON p.id = srl.product_id
          LEFT JOIN warehouse_locations loc ON loc.id = srl.location_id
          LEFT JOIN warehouses w ON w.id = loc.warehouse_id
          WHERE srl.stock_reservation_id = ?
          ORDER BY p.name
        `).all(reservation.id) as any[];

        const lines = products.map((product: any) => {
          const requestedQty = Number(product.quantity_requested || product.quantity_reserved || 0);
          const reservedQty = Number(product.quantity_reserved || 0);
          const consumedQty = Number(product.quantity_consumed || 0);

          return {
            id: product.id,
            productId: product.product_id,
            productReference: product.reference,
            productName: product.name,
            requestedQty,
            reservedQty,
            missingQty: Math.max(0, requestedQty - reservedQty),
            remainingQty: Math.max(0, reservedQty - consumedQty),
            consumedQty,
            warehouse: product.warehouse_name || 'Entrepôt principal',
            location: product.location_code || 'EMPL-A-01'
          };
        });

        const totalRequestedQty = lines.reduce((sum: number, line: any) => sum + line.requestedQty, 0);
        const totalReservedQty = lines.reduce((sum: number, line: any) => sum + line.reservedQty, 0);
        const documents = db.prepare(`
          SELECT id, document_type, number, status, created_at
          FROM documents
          WHERE source_type = 'stock_reservation' AND source_id = ?
          ORDER BY created_at DESC
        `).all(reservation.id) as any[];

        return {
          id: reservation.id,
          reference: reservation.number,
          projectId: reservation.project_id,
          projectName: reservation.project_name,
          clientName: reservation.client_name,
          products: lines,
          totalRequestedQty,
          totalReservedQty,
          status: reservation.status,
          priority: 'Normale',
          plannedDate: reservation.planned_end_date || reservation.start_date || reservation.created_at,
          createdAt: reservation.created_at,
          responsible: reservation.approver_name || reservation.requester_name || 'Responsable projet',
          documents: documents.map((document: any) => ({
            id: document.id,
            type: document.document_type,
            number: document.number,
            status: document.status,
            createdAt: document.created_at
          }))
        };
      });

      res.json(mapped);
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/reservations', express.json(), (req: Request, res: Response) => {
    try {
      const { projetId } = req.body;
      if (!projetId) throw new Error('Veuillez sélectionner un besoin projet');

      const existing = db.prepare(`
        SELECT id, number
        FROM stock_reservations
        WHERE project_id = ? AND status IN ('Réservée', 'Partiellement réservée')
        ORDER BY created_at DESC
        LIMIT 1
      `).get(projetId) as any;
      if (existing) return res.json({ id: existing.id, reference: existing.number, existing: true });

      const needs = db.prepare(`
        SELECT pn.*, p.name AS product_name
        FROM project_product_needs pn
        JOIN products p ON p.id = pn.product_id
        WHERE pn.project_id = ?
      `).all(projetId) as any[];
      if (!needs.length) throw new Error('Aucun besoin produit trouvé pour ce projet');

      const count = (db.prepare('SELECT COUNT(*) AS count FROM stock_reservations').get() as any).count;
      const id = `reservation-${Date.now()}`;
      const number = `RES-${String(count + 1).padStart(4, '0')}`;

      const result = db.transaction(() => {
        db.prepare(`
          INSERT INTO stock_reservations (id, number, project_id, status, requested_by, approved_by)
          VALUES (?, ?, ?, 'En attente', 'u2', 'u3')
        `).run(id, number, projetId);

        let totalRequested = 0;
        let totalReserved = 0;

        needs.forEach((need: any, index: number) => {
          const requested = Math.max(0, Number(need.quantity_required || 0));
          const stock = db.prepare(`
            SELECT id, location_id, physical_quantity, reserved_quantity
            FROM warehouse_stocks
            WHERE product_id = ?
            ORDER BY physical_quantity - reserved_quantity DESC
            LIMIT 1
          `).get(need.product_id) as any;
          const available = stock ? Math.max(0, stock.physical_quantity - stock.reserved_quantity) : 0;
          const reserved = Math.min(requested, available);

          db.prepare(`
            INSERT INTO stock_reservation_lines (
              id, stock_reservation_id, project_product_need_id,
              product_id, location_id, quantity_requested, quantity_reserved
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(`reservation-line-${Date.now()}-${index}`, id, need.id, need.product_id, stock?.location_id || null, requested, reserved);

          if (stock && reserved > 0) {
            db.prepare(`
              UPDATE warehouse_stocks
              SET reserved_quantity = reserved_quantity + ?,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(reserved, stock.id);
          }

          db.prepare('UPDATE project_product_needs SET status = ? WHERE id = ?')
            .run(reserved >= requested ? 'Réservé' : reserved > 0 ? 'Partiellement réservé' : 'En attente', need.id);

          totalRequested += requested;
          totalReserved += reserved;
        });

        const status = totalReserved >= totalRequested
          ? 'Réservée'
          : totalReserved > 0
            ? 'Partiellement réservée'
            : 'En attente';
        db.prepare('UPDATE stock_reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(status, id);

        const documentCount = (db.prepare("SELECT COUNT(*) AS count FROM documents WHERE document_type = 'Bon de réservation'").get() as any).count;
        const documentNumber = `BRV-${String(documentCount + 1).padStart(4, '0')}`;
        db.prepare(`
          INSERT INTO documents (id, document_type, number, source_type, source_id, status, metadata_json)
          VALUES (?, 'Bon de réservation', ?, 'stock_reservation', ?, 'Validé', ?)
        `).run(
          `doc-reservation-${Date.now()}`,
          documentNumber,
          id,
          JSON.stringify({ reservationNumber: number, projectId: projetId, totalRequested, totalReserved })
        );

        db.prepare(`
          INSERT INTO change_logs (id, entity_type, entity_id, action, description, user_id)
          VALUES (?, 'stock_reservation', ?, 'Création', ?, 'u3')
        `).run(
          `log-reservation-${Date.now()}`,
          id,
          `${number} créée : ${totalReserved}/${totalRequested} unité(s) verrouillée(s)`
        );

        return { id, reference: number, status, totalRequested, totalReserved, documentNumber };
      })();

      res.json(result);
    } catch(err) { res.status(422).json({error: (err as any).message}); }
  });
  app.get('/api/serial-numbers', (req: Request, res: Response) => {
    try {
      const serials = db.prepare(`
        SELECT
          sn.*,
          p.name as product_name,
          p.reference as product_ref,
          p.family as product_family,
          p.brand as product_brand,
          p.model as product_model,
          loc.code as location_code,
          loc.zone as location_zone,
          loc.aisle as location_aisle,
          loc.shelf as location_shelf,
          w.name as warehouse_name,
          s.name as supplier_name,
          r.number as receipt_number,
          r.received_by
        FROM serial_numbers sn
        JOIN products p ON sn.product_id = p.id
        LEFT JOIN warehouse_locations loc ON sn.location_id = loc.id
        LEFT JOIN warehouses w ON loc.warehouse_id = w.id
        LEFT JOIN suppliers s ON sn.supplier_id = s.id
        LEFT JOIN receipt_serial_numbers rsn ON rsn.serial_number_id = sn.id
        LEFT JOIN supplier_receipt_lines rl ON rl.id = rsn.supplier_receipt_line_id
        LEFT JOIN supplier_receipts r ON r.id = rl.supplier_receipt_id
        WHERE sn.status <> 'en_attente_reception'
        ORDER BY COALESCE(sn.received_at, sn.created_at) DESC
      `).all() as any[];
      res.json(serials.map((serial: any) => ({
        id: serial.id,
        serial: serial.serial_number,
        productId: serial.product_id,
        productName: serial.product_name,
        productReference: serial.product_ref,
        family: serial.product_family || 'Non classé',
        brand: serial.product_brand,
        model: serial.product_model,
        status: serial.status,
        location: serial.location_code || serial.warehouse_name || 'Non affecté',
        warehouse: serial.warehouse_name,
        exactLocation: [serial.location_zone, serial.location_aisle, serial.location_shelf].filter(Boolean).join(' • ') || serial.location_code,
        dateOfPurchase: serial.received_at,
        dateOfEntry: serial.received_at,
        supplier: serial.supplier_name,
        history: [{
          id: `history-${serial.id}`,
          date: serial.received_at || serial.created_at,
          type: 'reception_fournisseur',
          description: `Réception fournisseur ${serial.receipt_number || ''}`.trim(),
          user: serial.received_by || 'Magasinier',
          documentRef: serial.receipt_number
        }],
        documents: []
      })));
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.get('/api/movements', (req: Request, res: Response) => {
    try {
      const movements = db.prepare("SELECT m.*, p.name as product_name, p.reference as product_reference, p.family as product_family, p.serialized, l.code as location_code FROM stock_movements m JOIN products p ON m.product_id = p.id LEFT JOIN warehouse_locations l ON m.location_id = l.id").all();
      
      const mapped = movements.map((m: any) => ({
        id: m.id,
        reference: `MOV-${m.id}`,
        type: m.movement_type,
        status: 'Validé',
        date: m.created_at,
        validationDate: m.created_at,
        responsible: m.created_by,
        quantity: Math.abs(m.quantity),
        productLink: {
          id: m.product_id,
          reference: m.product_reference,
          name: m.product_name,
          family: m.product_family,
          isSerialized: m.serialized === 1
        },
        product: m.product_name,
        source: { type: 'Emplacement', name: m.location_code || 'Inconnu' },
        destination: { type: 'Projet', name: m.source_type === 'StockExit' ? 'Hôtel Les Oliviers' : 'Stock' }
      }));
      res.json(mapped);
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.get('/api/outbounds', (req: Request, res: Response) => {
    try {
      const outbounds = db.prepare(`
        SELECT o.*, p.name as project_name, w.name as warehouse_name, u.name as prepared_by_name,
               sr.number AS reservation_number
        FROM stock_exits o 
        LEFT JOIN client_projects p ON o.project_id = p.id 
        LEFT JOIN stock_reservations sr ON sr.id = o.reservation_id
        LEFT JOIN warehouses w ON o.warehouse_id = w.id
        LEFT JOIN users u ON o.prepared_by = u.id
        ORDER BY o.created_at DESC
      `).all();
      const mapped = outbounds.map((o: any) => {
        const lines = db.prepare(`
          SELECT el.*, p.reference, p.name, p.family, p.purchase_price, p.serialized, loc.code AS location_name
          FROM stock_exit_lines el
          JOIN products p ON p.id = el.product_id
          LEFT JOIN warehouse_locations loc ON loc.id = el.source_location_id
          WHERE el.stock_exit_id = ?
        `).all(o.id) as any[];
        const documents = db.prepare(`
          SELECT * FROM documents
          WHERE (source_type = 'stock_exit' AND source_id = ?)
             OR (source_type = 'stock_exit_return' AND source_id IN (SELECT id FROM stock_exit_returns WHERE stock_exit_id = ?))
          ORDER BY created_at DESC
        `).all(o.id, o.id) as any[];
        const returns = db.prepare('SELECT * FROM stock_exit_returns WHERE stock_exit_id = ? ORDER BY created_at DESC').all(o.id) as any[];
        const products = lines.map((line: any) => ({
          id: line.product_id,
          lineId: line.id,
          reference: line.reference,
          name: line.name,
          family: line.family,
          qtyRequested: line.quantity_requested,
          qtyOut: line.quantity_exited,
          qtyReturned: line.quantity_returned,
          price: line.purchase_price || 0,
          locationId: line.source_location_id,
          locationName: line.location_name,
          condition: line.condition || 'Neuf',
          isSerialized: line.serialized === 1,
          serialNumbers: [],
          status: line.quantity_returned >= line.quantity_exited ? 'Retourné' : o.status === 'Validée' ? 'Sorti' : 'Prêt'
        }));
        return {
          id: o.id,
          reference: o.number,
          destinationType: o.destination_type || 'Projet',
          destinationName: o.destination_name || o.project_name || 'Non définie',
          date: o.exit_date || o.created_at,
          validationDate: o.validated_at,
          warehouseId: o.warehouse_id,
          warehouseName: o.warehouse_name || 'Entrepôt principal',
          sourceWarehouse: o.warehouse_name || 'Entrepôt principal',
          responsible: o.prepared_by_name || o.prepared_by || 'Magasinier',
          status: o.status,
          reason: o.reason,
          reservationReference: o.reservation_number,
          products,
          totalQty: products.reduce((sum: number, product: any) => sum + product.qtyOut, 0),
          totalReturned: products.reduce((sum: number, product: any) => sum + product.qtyReturned, 0),
          totalValue: products.reduce((sum: number, product: any) => sum + product.qtyOut * product.price, 0),
          documents: documents.map((document: any) => ({ id: document.id, type: document.document_type, name: document.number })),
          exitVoucher: documents.find((document: any) => document.document_type === 'Bon de sortie'),
          returnVouchers: documents.filter((document: any) => document.document_type === 'Bon de retour'),
          returns: returns.map((stockReturn: any) => ({
            id: stockReturn.id,
            reference: stockReturn.number,
            date: stockReturn.return_date,
            reason: stockReturn.reason,
            status: stockReturn.status
          })),
          history: [
            { id: `${o.id}-created`, date: o.created_at, action: 'Sortie créée', user: o.prepared_by_name || 'Magasinier' },
            ...(o.validated_at ? [{ id: `${o.id}-validated`, date: o.validated_at, action: 'Sortie validée, stock diminué et bon de sortie généré', user: o.prepared_by_name || 'Magasinier' }] : []),
            ...returns.map((stockReturn: any) => ({ id: `${stockReturn.id}-return`, date: stockReturn.validated_at || stockReturn.created_at, action: `${stockReturn.number} validé et remis en stock`, user: stockReturn.received_by || 'Magasinier' }))
          ]
        };
      });
      res.json(mapped);
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/outbounds', express.json(), (req: Request, res: Response) => {
    try {
      const { projetId, originId, type, destinationName, demandeur, statut, commentaire, produits, date, warehouseId } = req.body;
      const count = (db.prepare("SELECT COUNT(*) as count FROM stock_exits").get() as any).count;
      const id = `exit${Date.now()}`;
      const code = `SOR-${(count + 1).toString().padStart(4, '0')}`;

      db.transaction(() => {
        const warehouse = db.prepare('SELECT id FROM warehouses WHERE id = ? OR name = ? LIMIT 1').get(warehouseId, warehouseId) as any;
        db.prepare(`
          INSERT INTO stock_exits (
            id, number, project_id, reservation_id, warehouse_id, exit_date,
            destination_type, destination_name, status, reason, prepared_by, stock_applied
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `).run(id, code, projetId || null, originId || null, warehouse?.id || 'w1', date || new Date().toISOString(), type || 'Projet', destinationName || demandeur, statut || 'Brouillon', commentaire, 'u3');

        for (const prod of produits || []) {
          const location = db.prepare('SELECT id FROM warehouse_locations WHERE id = ? OR code = ? LIMIT 1').get(prod.locationId || prod.emplacement, prod.locationId || prod.emplacement) as any;
          db.prepare(`
            INSERT INTO stock_exit_lines (
              id, stock_exit_id, stock_reservation_line_id, product_id, source_location_id,
              quantity_requested, quantity_exited, condition
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            `eline-${id}-${prod.productId || prod.id}`,
            id,
            prod.reservationLineId || null,
            prod.productId || prod.id,
            location?.id || 'loc1',
            Number(prod.qteDemande ?? prod.qte ?? prod.quantity ?? 0),
            Number(prod.qteSortie ?? prod.qte ?? prod.quantity ?? 0),
            prod.etat || 'Neuf'
          );
        }

        if (statut === 'Validée') validateStockExit(id);
      })();
      res.json({ id, reference: code });
    } catch(err) { res.status(422).json({error: (err as any).message}); }
  });

  app.post('/api/outbounds/:id/validate', express.json(), (req: Request, res: Response) => {
    try {
      db.transaction(() => validateStockExit(req.params.id))();
      res.json({ success: true });
    } catch(err) { res.status(422).json({error: (err as any).message}); }
  });

  app.post('/api/outbounds/:id/cancel', express.json(), (req: Request, res: Response) => {
    try {
      const outbound = db.prepare('SELECT * FROM stock_exits WHERE id = ?').get(req.params.id) as any;
      if (!outbound) throw new Error('Sortie introuvable');
      if (outbound.stock_applied) throw new Error('Une sortie déjà validée ne peut pas être annulée directement. Créez un retour en stock.');
      db.prepare("UPDATE stock_exits SET status = 'Annulée', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch(err) { res.status(422).json({error: (err as any).message}); }
  });

  app.post('/api/outbounds/:id/returns', express.json(), (req: Request, res: Response) => {
    try {
      const { reason, date, lines } = req.body;
      const count = (db.prepare('SELECT COUNT(*) AS count FROM stock_exit_returns').get() as any).count;
      const id = `exit-return-${Date.now()}`;
      const number = `RS-${String(count + 1).padStart(4, '0')}`;
      db.transaction(() => {
        db.prepare(`
          INSERT INTO stock_exit_returns (id, number, stock_exit_id, return_date, reason, status, received_by, stock_applied)
          VALUES (?, ?, ?, ?, ?, 'Brouillon', 'u3', 0)
        `).run(id, number, req.params.id, date || new Date().toISOString(), reason);
        for (const line of lines || []) {
          if (Number(line.quantity) <= 0) continue;
          db.prepare(`
            INSERT INTO stock_exit_return_lines (
              id, stock_exit_return_id, stock_exit_line_id, quantity_returned, destination_location_id, condition
            ) VALUES (?, ?, ?, ?, ?, ?)
          `).run(`return-line-${id}-${line.lineId}`, id, line.lineId, Number(line.quantity), line.locationId || 'loc1', line.condition || 'Bon état');
        }
        validateStockExitReturn(id);
      })();
      res.json({ id, reference: number });
    } catch(err) { res.status(422).json({error: (err as any).message}); }
  });

  app.get('/api/returns', (req: Request, res: Response) => {
    try {
      res.json([]);
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/returns', express.json(), (req: Request, res: Response) => {
    try {
      const id = Date.now().toString();
      res.json({ id });
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.get('/api/installations', (req: Request, res: Response) => {
    try {
      const pvs = db.prepare(`
        SELECT i.*, pr.name as project_name, c.name as client_name, u.name as technician_name 
        FROM installations i 
        LEFT JOIN client_projects pr ON i.project_id = pr.id 
        LEFT JOIN clients c ON pr.client_id = c.id 
        LEFT JOIN users u ON i.technician_id = u.id
      `).all();
      
      const mapped = pvs.map((p: any) => ({
        id: p.id,
        reference: p.reference,
        clientName: p.client_name || 'Inconnu',
        projectName: p.project_name || 'Inconnu',
        siteName: 'Site principal',
        technician: p.technician_name,
        clientSignatory: '',
        installationDate: p.installation_date,
        signatureDate: null,
        status: p.status,
        result: 'Conforme',
        hasReserves: false,
        reservesDetails: '',
        createdAt: p.created_at,
        products: []
      }));
      res.json(mapped);
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/installations', express.json(), (req: Request, res: Response) => {
    try {
      const { projectId, siteId, technicianId, installationDate, status, products } = req.body;
      const count = (db.prepare("SELECT COUNT(*) as count FROM installations").get() as any).count;
      const id = `inst${Date.now()}`;
      const ref = `PV-${(count + 1).toString().padStart(4, '0')}`;

      db.transaction(() => {
        db.prepare(`
          INSERT INTO installations (id, reference, project_id, client_site_id, technician_id, installation_date, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, ref, projectId || null, siteId || null, technicianId || null, installationDate, status);

        if (status === 'Signé' || status === 'Signé avec réserves') {
          for (const prod of products || []) {
             const equipId = `equip${Math.random()}`;
             db.prepare(`
               INSERT INTO installed_equipment (id, installation_id, client_id, client_site_id, product_id, status, installed_at)
               VALUES (?, ?, (SELECT client_id FROM client_projects WHERE id = ?), ?, ?, 'Installé', ?)
             `).run(equipId, id, projectId, siteId || null, prod.productId || prod.id, installationDate);
          }
        }
      })();
      res.json({ id, reference: ref });
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.get('/api/interventions', (req: Request, res: Response) => {
    try {
      const interventions = db.prepare(`
        SELECT i.*, p.name as product_name, c.name as client_name, e.serial_number_id 
        FROM sav_interventions i 
        JOIN installed_equipment e ON i.installed_equipment_id = e.id 
        JOIN products p ON e.product_id = p.id 
        JOIN clients c ON e.client_id = c.id
      `).all();
      res.json(interventions);
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/interventions', express.json(), (req: Request, res: Response) => {
    try {
      const { installedEquipmentId, technicianId, type, status, reportedIssue, diagnosis, interventionDate } = req.body;
      const count = (db.prepare("SELECT COUNT(*) as count FROM sav_interventions").get() as any).count;
      const id = `sav${Date.now()}`;
      const num = `SAV-${(count + 1).toString().padStart(4, '0')}`;

      db.transaction(() => {
        db.prepare(`
          INSERT INTO sav_interventions (id, number, installed_equipment_id, technician_id, type, status, reported_issue, diagnosis, intervention_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, num, installedEquipmentId, technicianId, type || 'Maintenance', status || 'Brouillon', reportedIssue, diagnosis, interventionDate);

        if (status === 'Clôturé') {
           db.prepare(`UPDATE sav_interventions SET closed_at = CURRENT_TIMESTAMP WHERE id = ?`).run(id);
           db.prepare(`UPDATE installed_equipment SET status = 'Fonctionnel' WHERE id = ?`).run(installedEquipmentId);
        }
      })();
      res.json({ id, reference: num });
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  // ACTIONS POST
  app.post('/api/actions/reserve-stock', express.json(), (req, res) => {
    try {
      res.json({success: true});
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });

  app.post('/api/actions/stock-exit', express.json(), (req, res) => {
    try {
      res.json({success: true});
    } catch(err) { res.status(500).json({error: (err as any).message}); }
  });
}
