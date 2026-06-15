import db from './connection.js';
import { createSchema, dropSchema } from './schema.js';

type SupplierSeed = {
  id: string;
  reference: string;
  name: string;
  type: string;
  country: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  currency: string;
  deliveryDays: number;
  conformityRate: number;
  status: string;
};

type ProductSeed = {
  id: string;
  reference: string;
  name: string;
  family: string;
  brand: string;
  model: string;
  supplierId: string;
  supplierReference: string;
  purchasePrice: number;
  salePrice: number;
  physicalStock: number;
  reservedStock: number;
  minimumStock: number;
  serialized: boolean;
  isStockable: boolean;
  type: string;
  status: string;
  description: string;
  supplierWarrantyMonths: number;
  clientWarrantyMonths: number;
  tags: string[];
};

const suppliers: SupplierSeed[] = [
  { id: 'sup-districam', reference: 'FRN-DIS-001', name: 'DistriCam', type: 'Distributeur', country: 'Algérie', contact: 'Amine Benali', email: 'contact@districam.dz', phone: '+213 550 12 34 56', address: 'Alger', paymentMethod: 'Virement bancaire (45 jours)', currency: 'DZD', deliveryDays: 3, conformityRate: 98, status: 'Actif' },
  { id: 'sup-netdev', reference: 'FRN-NET-002', name: 'NetDev', type: 'Grossiste', country: 'Algérie', contact: 'Karim Ziani', email: 'commercial@netdev.dz', phone: '+213 555 11 22 33', address: 'Tizi-Ouzou', paymentMethod: 'Virement bancaire (30 jours)', currency: 'DZD', deliveryDays: 4, conformityRate: 96, status: 'Actif' },
  { id: 'sup-power', reference: 'FRN-POW-003', name: 'PowerSupply', type: 'Distributeur', country: 'Algérie', contact: 'Nadia Saadi', email: 'vente@powersupply.dz', phone: '+213 560 22 44 66', address: 'Alger', paymentMethod: 'Chèque à réception', currency: 'DZD', deliveryDays: 5, conformityRate: 99, status: 'Actif' },
  { id: 'sup-cabling', reference: 'FRN-CAB-004', name: 'CablingPro', type: 'Grossiste', country: 'Algérie', contact: 'Sofiane Kaci', email: 'commandes@cablingpro.dz', phone: '+213 770 20 30 40', address: 'Béjaïa', paymentMethod: 'Paiement comptant', currency: 'DZD', deliveryDays: 2, conformityRate: 97, status: 'Actif' },
  { id: 'sup-security', reference: 'FRN-SEC-005', name: 'SecurityDist', type: 'Distributeur', country: 'Algérie', contact: 'Lydia Ait Ali', email: 'contact@securitydist.dz', phone: '+213 661 44 55 66', address: 'Alger', paymentMethod: 'Virement bancaire (30 jours)', currency: 'DZD', deliveryDays: 6, conformityRate: 91, status: 'Actif' },
  { id: 'sup-dell', reference: 'FRN-DEL-006', name: 'DellDirect', type: 'Fabricant', country: 'Algérie', contact: 'Mourad Hamdi', email: 'enterprise@delldirect.dz', phone: '+213 550 99 88 77', address: 'Alger', paymentMethod: 'Virement (60 jours)', currency: 'DZD', deliveryDays: 10, conformityRate: 99, status: 'Actif' },
  { id: 'sup-cloud', reference: 'FRN-CLO-007', name: 'DistriCloud', type: 'Revendeur', country: 'Algérie', contact: 'Sarah Lami', email: 'sales@districloud.dz', phone: '+213 540 12 34 56', address: 'Oran', paymentMethod: 'Virement bancaire (30 jours)', currency: 'DZD', deliveryDays: 7, conformityRate: 95, status: 'Actif' },
  { id: 'sup-fiber', reference: 'FRN-FIB-008', name: 'FiberDist', type: 'Grossiste', country: 'Algérie', contact: 'Yacine Meziane', email: 'info@fiberdist.dz', phone: '+213 770 55 66 77', address: 'Sétif', paymentMethod: 'Paiement comptant', currency: 'DZD', deliveryDays: 3, conformityRate: 94, status: 'Actif' },
  { id: 'sup-software', reference: 'FRN-SOF-009', name: 'SoftwareDist', type: 'Revendeur', country: 'Algérie', contact: 'Nassim Belkacem', email: 'licences@softwaredist.dz', phone: '+213 560 77 88 99', address: 'Alger', paymentMethod: 'Virement bancaire (30 jours)', currency: 'DZD', deliveryDays: 1, conformityRate: 100, status: 'Actif' },
];

const products: ProductSeed[] = [
  { id: 'p1', reference: 'CAM-HIK-2CD2043', name: 'Caméra IP Hikvision DS-2CD2043', family: 'CCTV', brand: 'Hikvision', model: 'DS-2CD2043G2', supplierId: 'sup-districam', supplierReference: 'HIK-2CD2043G2', purchasePrice: 120, salePrice: 180, physicalStock: 45, reservedStock: 5, minimumStock: 10, serialized: true, isStockable: true, type: 'Équipement', status: 'Actif', description: "Caméra d'extérieur IP 4MP avec vision nocturne jusqu'à 30m.", supplierWarrantyMonths: 36, clientWarrantyMonths: 24, tags: ['PoE', 'IP67', '4MP'] },
  { id: 'p2', reference: 'NVR-HIK-16CH', name: 'NVR Hikvision 16 canaux', family: 'CCTV', brand: 'Hikvision', model: 'DS-7616NI-K2/16P', supplierId: 'sup-districam', supplierReference: 'HIK-7616NI', purchasePrice: 250, salePrice: 380, physicalStock: 8, reservedStock: 3, minimumStock: 5, serialized: true, isStockable: true, type: 'Équipement', status: 'Sous seuil', description: 'Enregistreur vidéo réseau 16 canaux avec 16 ports PoE.', supplierWarrantyMonths: 36, clientWarrantyMonths: 24, tags: ['NVR', '16 ports', 'PoE+'] },
  { id: 'p3', reference: 'SW-TPL-24P', name: 'Switch PoE 24 ports TP-Link', family: 'Réseau', brand: 'TP-Link', model: 'T1500G-10MPS', supplierId: 'sup-netdev', supplierReference: 'TPL-T1500G', purchasePrice: 180, salePrice: 260, physicalStock: 0, reservedStock: 0, minimumStock: 2, serialized: true, isStockable: true, type: 'Équipement', status: 'En rupture', description: 'Switch Gigabit PoE+ 24 ports de niveau 2.', supplierWarrantyMonths: 60, clientWarrantyMonths: 24, tags: ['24 ports', 'PoE+', 'Gigabit'] },
  { id: 'p4', reference: 'ROUT-MIK-4011', name: 'Routeur MikroTik RB4011', family: 'Réseau', brand: 'MikroTik', model: 'RB4011iGS+RM', supplierId: 'sup-netdev', supplierReference: 'MIK-RB4011', purchasePrice: 190, salePrice: 290, physicalStock: 12, reservedStock: 2, minimumStock: 3, serialized: true, isStockable: true, type: 'Équipement', status: 'Actif', description: 'Routeur Ethernet Gigabit 10 ports avec accélération matérielle IPsec.', supplierWarrantyMonths: 12, clientWarrantyMonths: 12, tags: ['Gigabit', 'IPsec', 'Rackable'] },
  { id: 'p5', reference: 'OND-APC-1500', name: 'Onduleur APC 1500VA', family: 'Onduleurs', brand: 'APC', model: 'BR1500G-FR', supplierId: 'sup-power', supplierReference: 'APC-BR1500G', purchasePrice: 210, salePrice: 320, physicalStock: 15, reservedStock: 5, minimumStock: 5, serialized: true, isStockable: true, type: 'Équipement', status: 'Actif', description: 'Onduleur Pro avec écran LCD, puissance 1500 VA.', supplierWarrantyMonths: 24, clientWarrantyMonths: 24, tags: ['1500VA', 'LCD'] },
  { id: 'p6', reference: 'CBL-CAT6-UTP', name: 'Câble réseau Cat6 UTP 305m', family: 'Consommables', brand: 'Generic', model: 'Cat6-UTP-LSZH', supplierId: 'sup-cabling', supplierReference: 'CAB-CAT6-305', purchasePrice: 45, salePrice: 85, physicalStock: 30, reservedStock: 10, minimumStock: 15, serialized: false, isStockable: true, type: 'Consommable', status: 'Actif', description: 'Bobine de 305m de câble réseau catégorie 6 UTP.', supplierWarrantyMonths: 0, clientWarrantyMonths: 0, tags: ['Cat6', 'UTP', '305m'] },
  { id: 'p7', reference: 'RACK-12U', name: 'Baie réseau 12U', family: 'Réseau', brand: 'Generic', model: 'Rack-12U-600x450', supplierId: 'sup-cabling', supplierReference: 'CAB-RACK-12U', purchasePrice: 90, salePrice: 150, physicalStock: 3, reservedStock: 3, minimumStock: 1, serialized: false, isStockable: true, type: 'Équipement', status: 'En rupture', description: 'Coffret mural 12U profondeur 450mm.', supplierWarrantyMonths: 12, clientWarrantyMonths: 12, tags: ['12U', 'Mural'] },
  { id: 'p8', reference: 'CTRL-ZKT', name: "Contrôleur d'accès ZKTeco", family: "Contrôle d'accès", brand: 'ZKTeco', model: 'InBio260', supplierId: 'sup-security', supplierReference: 'ZKT-INBIO260', purchasePrice: 150, salePrice: 250, physicalStock: 2, reservedStock: 0, minimumStock: 2, serialized: true, isStockable: true, type: 'Équipement', status: 'Sous seuil', description: 'Contrôleur 2 portes multi-biométrique.', supplierWarrantyMonths: 24, clientWarrantyMonths: 12, tags: ['Biométrique', '2 portes'] },
  { id: 'p9', reference: 'SRV-DELL-R440', name: 'Serveur Dell PowerEdge R440', family: 'Serveurs', brand: 'Dell', model: 'PowerEdge R440', supplierId: 'sup-dell', supplierReference: 'DELL-R440', purchasePrice: 1200, salePrice: 1800, physicalStock: 1, reservedStock: 1, minimumStock: 1, serialized: true, isStockable: true, type: 'Équipement', status: 'Sous seuil', description: 'Serveur rack 1U, Intel Xeon Silver, 32GB RAM et SSD.', supplierWarrantyMonths: 36, clientWarrantyMonths: 36, tags: ['Rack 1U', 'Xeon', 'SSD'] },
  { id: 'p10', reference: 'NAS-SYN-920', name: 'NAS Synology DS920+', family: 'Serveurs', brand: 'Synology', model: 'DS920+', supplierId: 'sup-cloud', supplierReference: 'SYN-DS920', purchasePrice: 450, salePrice: 650, physicalStock: 4, reservedStock: 1, minimumStock: 2, serialized: true, isStockable: true, type: 'Équipement', status: 'Actif', description: 'Serveur NAS 4 baies destiné aux petites entreprises.', supplierWarrantyMonths: 36, clientWarrantyMonths: 36, tags: ['NAS', '4 baies'] },
  { id: 'p11', reference: 'CON-RJ45-B100', name: 'Boîte de 100 connecteurs RJ45', family: 'Consommables', brand: 'Generic', model: 'RJ45-Cat6-Shielded', supplierId: 'sup-cabling', supplierReference: 'CAB-RJ45-100', purchasePrice: 15, salePrice: 35, physicalStock: 120, reservedStock: 20, minimumStock: 30, serialized: false, isStockable: true, type: 'Consommable', status: 'Actif', description: 'Connecteurs RJ45 blindés catégorie 6.', supplierWarrantyMonths: 0, clientWarrantyMonths: 0, tags: ['RJ45', 'Cat6'] },
  { id: 'p12', reference: 'FIB-JAR-LC-3M', name: 'Jarretière optique LC-LC 3m', family: 'Fibre optique', brand: 'Generic', model: 'OM3-LC-LC-3M', supplierId: 'sup-fiber', supplierReference: 'FIB-OM3-LCLC3', purchasePrice: 8, salePrice: 18, physicalStock: 50, reservedStock: 5, minimumStock: 20, serialized: false, isStockable: true, type: 'Consommable', status: 'Actif', description: 'Cordon optique multimode OM3 LC/PC-LC/PC de 3 mètres.', supplierWarrantyMonths: 0, clientWarrantyMonths: 0, tags: ['Fibre', 'LC', 'OM3'] },
  { id: 'p13', reference: 'RFID-CARD-100', name: 'Lot de 100 badges RFID', family: 'Consommables', brand: 'ZKTeco', model: 'Mifare 13.56MHz', supplierId: 'sup-security', supplierReference: 'ZKT-RFID-100', purchasePrice: 25, salePrice: 60, physicalStock: 15, reservedStock: 2, minimumStock: 10, serialized: false, isStockable: true, type: 'Consommable', status: 'Actif', description: "Cartes RFID Mifare pour contrôle d'accès.", supplierWarrantyMonths: 0, clientWarrantyMonths: 0, tags: ['Badge', 'RFID'] },
  { id: 'p14', reference: 'LIC-MILE-ESS', name: 'Licence Camera VMS', family: 'Cloud / licences', brand: 'Milestone', model: 'XProtect Essential+', supplierId: 'sup-software', supplierReference: 'SW-MILE-ESS', purchasePrice: 40, salePrice: 80, physicalStock: 0, reservedStock: 0, minimumStock: 0, serialized: false, isStockable: false, type: 'Licence', status: 'Actif', description: 'Licence par caméra pour logiciel VMS Milestone.', supplierWarrantyMonths: 0, clientWarrantyMonths: 0, tags: ['VMS', 'Licence'] },
  { id: 'p15', reference: 'LIC-ESET-1Y', name: 'Antivirus Entreprise 1 an', family: 'Cloud / licences', brand: 'ESET', model: 'Endpoint Security', supplierId: 'sup-software', supplierReference: 'SW-ESET-1Y', purchasePrice: 25, salePrice: 50, physicalStock: 0, reservedStock: 0, minimumStock: 0, serialized: false, isStockable: false, type: 'Licence', status: 'Actif', description: 'Licence antivirus ESET pour poste de travail, validité un an.', supplierWarrantyMonths: 0, clientWarrantyMonths: 0, tags: ['Sécurité', 'Antivirus'] },
  { id: 'p16', reference: 'CAM-OLD-720P', name: 'Caméra dôme 720p', family: 'CCTV', brand: 'Generic', model: 'Dome-720', supplierId: 'sup-districam', supplierReference: 'DIS-DOME-720', purchasePrice: 30, salePrice: 45, physicalStock: 2, reservedStock: 0, minimumStock: 0, serialized: true, isStockable: true, type: 'Équipement', status: 'Obsolète', description: 'Ancien modèle de caméra analogique 720p.', supplierWarrantyMonths: 12, clientWarrantyMonths: 12, tags: ['Analogique', '720p'] },
  { id: 'p17', reference: 'ROUT-OBS-2015', name: 'Routeur ADSL', family: 'Réseau', brand: 'Linksys', model: 'WRT54G', supplierId: 'sup-netdev', supplierReference: 'NET-WRT54G', purchasePrice: 20, salePrice: 30, physicalStock: 0, reservedStock: 0, minimumStock: 0, serialized: true, isStockable: true, type: 'Équipement', status: 'Désactivé', description: 'Modèle ancien conservé pour historique.', supplierWarrantyMonths: 0, clientWarrantyMonths: 0, tags: ['ADSL', 'Obsolète'] },
];

export function runSeed() {
  db.pragma('foreign_keys = OFF');
  dropSchema();
  createSchema();
  db.pragma('foreign_keys = ON');
  db.transaction(seed)();
}

export function seed() {
  const insertUser = db.prepare('INSERT INTO users (id, name, email, role, status) VALUES (?, ?, ?, ?, ?)');
  insertUser.run('u1', 'Ahmed Benali', 'ahmed@siterp.com', 'Administrateur', 'Actif');
  insertUser.run('u2', 'Sarah Mansouri', 'sarah@siterp.com', 'Commercial', 'Actif');
  insertUser.run('u3', 'Karim Haddad', 'karim@siterp.com', 'Magasinier', 'Actif');
  insertUser.run('u4', 'Yacine Amrane', 'yacine@siterp.com', 'Technicien', 'Actif');

  const insertSupplier = db.prepare(`
    INSERT INTO suppliers (
      id, reference, name, type, country, contact_name, email, phone, address,
      payment_method, currency, average_delivery_days, conformity_rate, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  suppliers.forEach(s => insertSupplier.run(s.id, s.reference, s.name, s.type, s.country, s.contact, s.email, s.phone, s.address, s.paymentMethod, s.currency, s.deliveryDays, s.conformityRate, s.status));

  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, reference, name, family, brand, model, description, product_type, is_stockable,
      purchase_price, sale_price, serialized, minimum_stock, supplier_warranty_months,
      client_warranty_months, tags_json, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertOffer = db.prepare(`
    INSERT INTO supplier_product_offers (
      id, supplier_id, product_id, supplier_reference, purchase_price, currency, delivery_days
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertStock = db.prepare('INSERT INTO warehouse_stocks (id, product_id, location_id, physical_quantity, reserved_quantity) VALUES (?, ?, ?, ?, ?)');

  db.prepare('INSERT INTO warehouses (id, reference, name, address, status) VALUES (?, ?, ?, ?, ?)').run('w1', 'WH-MAIN', 'Entrepôt principal', 'Tizi-Ouzou', 'Actif');
  db.prepare('INSERT INTO warehouse_locations (id, warehouse_id, code, zone, aisle, shelf, capacity, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run('loc1', 'w1', 'EMPL-A-01', 'Stock actif', 'A', '01', 500, 'Actif');

  products.forEach((p, index) => {
    insertProduct.run(p.id, p.reference, p.name, p.family, p.brand, p.model, p.description, p.type, p.isStockable ? 1 : 0, p.purchasePrice, p.salePrice, p.serialized ? 1 : 0, p.minimumStock, p.supplierWarrantyMonths, p.clientWarrantyMonths, JSON.stringify(p.tags), p.status);
    insertOffer.run(`off-${p.id}`, p.supplierId, p.id, p.supplierReference, p.purchasePrice, 'DZD', suppliers.find(s => s.id === p.supplierId)?.deliveryDays || 0);
    if (p.isStockable) insertStock.run(`stk-${p.id}`, p.id, 'loc1', p.physicalStock, 0);
  });

  const insertClient = db.prepare('INSERT INTO clients (id, reference, name, type, sector, contact_name, email, phone, address, city, region, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertClient.run('cli1', 'CLI-0001', 'Hôtel Les Oliviers', 'Hôtel', 'Hôtellerie', 'Nadia Ferhat', 'direction@oliviers.dz', '+213 560 10 20 30', 'Centre-ville', 'Tizi-Ouzou', 'Tizi-Ouzou', 'Actif');
  insertClient.run('cli2', 'CLI-0002', 'Clinique El Amel', 'Entreprise', 'Santé', 'Sofiane Merabet', 'it@elamel.dz', '+213 550 40 50 60', 'Nouvelle ville', 'Tizi-Ouzou', 'Tizi-Ouzou', 'Actif');
  insertClient.run('cli3', 'CLI-0003', 'Université Numérique', 'Administration', 'Éducation', 'Lina Ouali', 'contact@univ-numerique.dz', '+213 770 80 90 10', 'Campus principal', 'Alger', 'Alger', 'Actif');
  db.prepare('INSERT INTO client_sites (id, client_id, reference, name, address) VALUES (?, ?, ?, ?, ?)').run('site1', 'cli1', 'SITE-0001', 'Hôtel Les Oliviers - Tizi-Ouzou', 'Centre-ville');

  const insertService = db.prepare('INSERT INTO services (id, reference, name, description, unit, sale_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertService.run('srv1', 'SRV-INST-001', 'Installation caméra', 'Pose, raccordement et test fonctionnel.', 'Unité', 5000, 'Actif');
  insertService.run('srv2', 'SRV-CONF-001', 'Configuration vidéosurveillance', 'Paramétrage du NVR et des accès utilisateurs.', 'Forfait', 12000, 'Actif');
  insertService.run('srv3', 'SRV-MNT-001', 'Maintenance préventive', 'Contrôle périodique des équipements installés.', 'Intervention', 8000, 'Actif');

  const insertOrder = db.prepare('INSERT INTO supplier_orders (id, number, supplier_id, order_date, expected_delivery_date, status, currency, payment_method, notes, created_by, validated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertOrderLine = db.prepare('INSERT INTO supplier_order_lines (id, supplier_order_id, product_id, quantity_ordered, unit_purchase_price) VALUES (?, ?, ?, ?, ?)');
  insertOrder.run('order1', 'CF-0001', 'sup-districam', '2026-05-20', '2026-05-24', 'Reçue', 'DZD', 'Virement bancaire (45 jours)', 'Commande totalement réceptionnée.', 'u1', '2026-05-20 10:00:00');
  insertOrderLine.run('oline1', 'order1', 'p1', 10, 120);
  insertOrderLine.run('oline2', 'order1', 'p2', 3, 250);
  insertOrder.run('order2', 'CF-0002', 'sup-netdev', '2026-06-01', '2026-06-12', 'Partiellement reçue', 'DZD', 'Virement bancaire (30 jours)', 'Première livraison reçue, solde attendu.', 'u1', '2026-06-01 09:30:00');
  insertOrderLine.run('oline3', 'order2', 'p3', 15, 180);
  insertOrderLine.run('oline4', 'order2', 'p4', 5, 190);
  insertOrder.run('order3', 'CF-0003', 'sup-power', '2026-06-03', '2026-06-15', 'Validée', 'DZD', 'Chèque à réception', 'Commande validée en attente de livraison.', 'u1', '2026-06-03 11:00:00');
  insertOrderLine.run('oline5', 'order3', 'p5', 10, 210);
  insertOrder.run('order4', 'CF-0004', 'sup-cabling', '2026-06-05', '2026-06-18', 'Envoyée', 'DZD', 'Paiement comptant', 'Bon de commande transmis au fournisseur.', 'u1', '2026-06-05 14:20:00');
  insertOrderLine.run('oline6', 'order4', 'p6', 20, 45);
  insertOrderLine.run('oline7', 'order4', 'p11', 40, 15);
  insertOrder.run('order5', 'CF-0005', 'sup-dell', '2026-06-07', '2026-06-30', 'Brouillon', 'DZD', 'Virement (60 jours)', 'Prix et délai en cours de négociation.', 'u1', null);
  insertOrderLine.run('oline8', 'order5', 'p9', 2, 1200);
  insertOrder.run('order6', 'CF-0006', 'sup-security', '2026-05-12', '2026-05-28', 'Annulée', 'DZD', 'Virement bancaire (30 jours)', 'Commande annulée avant expédition.', 'u1', null);
  insertOrderLine.run('oline9', 'order6', 'p8', 4, 150);

  const insertReceipt = db.prepare('INSERT INTO supplier_receipts (id, number, supplier_order_id, fournisseur_id, supplier_delivery_note, supplier_invoice_number, receipt_date, warehouse_id, status, conformity_status, notes, received_by, validated_at, stock_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertReceipt.run('receipt1', 'REC-0001', 'order1', 'sup-districam', 'BL-DIS-2026-0042', 'FAC-DIS-2026-119', '2026-05-24', 'w1', 'Validée', 'Conforme', 'Livraison complète et conforme.', 'u3', '2026-05-24 15:20:00', 1);
  const insertReceiptLine = db.prepare('INSERT INTO supplier_receipt_lines (id, supplier_receipt_id, supplier_order_line_id, quantity_delivered, quantity_accepted, quantity_rejected, destination_location_id, conformity_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertReceiptLine.run('rline1', 'receipt1', 'oline1', 10, 10, 0, 'loc1', 'Conforme');
  insertReceiptLine.run('rline2', 'receipt1', 'oline2', 3, 3, 0, 'loc1', 'Conforme');
  insertReceipt.run('receipt2', 'REC-0002', 'order2', 'sup-netdev', 'BL-NET-2026-0088', 'FAC-NET-2026-044', '2026-06-06', 'w1', 'Validée', 'Partielle', 'Réception partielle, reste attendu.', 'u3', '2026-06-06 10:45:00', 1);
  insertReceiptLine.run('rline3', 'receipt2', 'oline3', 8, 8, 0, 'loc1', 'Partiel');
  insertReceiptLine.run('rline4', 'receipt2', 'oline4', 2, 2, 0, 'loc1', 'Partiel');
  insertReceipt.run('receipt3', 'REC-0003', 'order3', 'sup-power', 'BL-POW-2026-0017', 'FAC-POW-2026-017', '2026-06-09', 'w1', 'Brouillon', 'À contrôler', 'Réception saisie, contrôle physique non terminé.', 'u3', null, 0);
  insertReceiptLine.run('rline5', 'receipt3', 'oline5', 10, 10, 0, 'loc1', 'Conforme');
  insertReceipt.run('receipt4', 'REC-0004', 'order4', 'sup-cabling', 'BL-CAB-2026-0312', 'FAC-CAB-2026-312', '2026-06-09', 'w1', 'Écart détecté', 'Non conforme', 'Deux bobines manquantes, réception non validée.', 'u3', null, 0);
  insertReceiptLine.run('rline6', 'receipt4', 'oline6', 18, 18, 0, 'loc1', 'Partiel');
  insertReceiptLine.run('rline7', 'receipt4', 'oline7', 40, 38, 2, 'loc1', 'Abîmé');

  const insertDocument = db.prepare('INSERT INTO documents (id, document_type, number, source_type, source_id, status, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertDocument.run('doc-bc-1', 'Bon de commande fournisseur', 'BC-0001', 'supplier_order', 'order1', 'Généré', JSON.stringify({ supplier: 'DistriCam', orderNumber: 'CF-0001' }), '2026-05-20 10:00:00');
  insertDocument.run('doc-be-1', "Bon d'entrée", 'BE-0001', 'supplier_receipt', 'receipt1', 'Validé', JSON.stringify({ receiptNumber: 'REC-0001', orderNumber: 'CF-0001', supplier: 'DistriCam', warehouse: 'Entrepôt principal', totalQty: 13, totalValue: 1950 }), '2026-05-24 15:20:00');
  insertDocument.run('doc-be-2', "Bon d'entrée", 'BE-0002', 'supplier_receipt', 'receipt2', 'Validé', JSON.stringify({ receiptNumber: 'REC-0002', orderNumber: 'CF-0002', supplier: 'NetDev', warehouse: 'Entrepôt principal', totalQty: 10, totalValue: 1820 }), '2026-06-06 10:45:00');

  const insertProject = db.prepare(`
    INSERT INTO client_projects (
      id, reference, name, client_id, client_site_id, manager_id,
      status, progress, start_date, planned_end_date, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertProject.run('proj1', 'PRJ-0001', 'Installation vidéosurveillance Hôtel', 'cli1', 'site1', 'u2', 'En cours', 65, '2026-05-15', '2026-07-15', 'Première phase déjà sortie du stock.');
  insertProject.run('proj-demo-2', 'PRJ-0007', 'Sécurisation réseau Clinique El Amel', 'cli2', null, 'u2', 'Planifié', 10, '2026-06-15', '2026-08-15', 'Matériel entièrement réservé et prêt à sortir.');
  insertProject.run('proj-demo-6', 'PRJ-0006', 'Extension réseau Hôtel Les Oliviers', 'cli1', 'site1', 'u2', 'En cours', 55, '2026-06-01', '2026-07-30', 'Réservation partielle en attente du switch commandé.');

  const insertProductNeed = db.prepare(`
    INSERT INTO project_product_needs (id, project_id, product_id, quantity_required, priority, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertProductNeed.run('need1', 'proj1', 'p1', 4, 'Haute', 'Consommé');
  insertProductNeed.run('need2', 'proj1', 'p7', 2, 'Haute', 'Consommé');
  insertProductNeed.run('need3', 'proj-demo-2', 'p4', 3, 'Haute', 'Réservé');
  insertProductNeed.run('need4', 'proj-demo-2', 'p8', 2, 'Haute', 'Réservé');
  insertProductNeed.run('need5', 'proj-demo-6', 'p6', 8, 'Moyenne', 'Réservé');
  insertProductNeed.run('need6', 'proj-demo-6', 'p3', 5, 'Moyenne', 'En attente');
  db.prepare('INSERT INTO project_service_needs (id, project_id, service_id, quantity, status) VALUES (?, ?, ?, ?, ?)').run('sneed1', 'proj1', 'srv1', 4, 'Planifié');

  const insertReservation = db.prepare(`
    INSERT INTO stock_reservations (
      id, number, project_id, status, requested_by, approved_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertReservationLine = db.prepare(`
    INSERT INTO stock_reservation_lines (
      id, stock_reservation_id, project_product_need_id, product_id,
      location_id, quantity_requested, quantity_reserved
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertReservation.run('reservation-1', 'RES-0001', 'proj1', 'Consommée', 'u2', 'u3', '2026-06-06 14:00:00', '2026-06-07 09:15:00');
  insertReservationLine.run('reservation-line-1', 'reservation-1', 'need1', 'p1', 'loc1', 4, 4);
  insertReservationLine.run('reservation-line-2', 'reservation-1', 'need2', 'p7', 'loc1', 2, 2);
  insertReservation.run('reservation-2', 'RES-0002', 'proj-demo-2', 'Réservée', 'u2', 'u3', '2026-06-08 10:30:00', '2026-06-08 10:30:00');
  insertReservationLine.run('reservation-line-3', 'reservation-2', 'need3', 'p4', 'loc1', 3, 3);
  insertReservationLine.run('reservation-line-4', 'reservation-2', 'need4', 'p8', 'loc1', 2, 2);
  insertReservation.run('reservation-3', 'RES-0003', 'proj-demo-6', 'Partiellement réservée', 'u2', 'u3', '2026-06-09 11:20:00', '2026-06-09 11:20:00');
  insertReservationLine.run('reservation-line-5', 'reservation-3', 'need5', 'p6', 'loc1', 8, 8);
  insertReservationLine.run('reservation-line-6', 'reservation-3', 'need6', 'p3', 'loc1', 5, 0);

  db.prepare("UPDATE warehouse_stocks SET reserved_quantity = reserved_quantity + 3 WHERE product_id = 'p4' AND location_id = 'loc1'").run();
  db.prepare("UPDATE warehouse_stocks SET reserved_quantity = reserved_quantity + 2 WHERE product_id = 'p8' AND location_id = 'loc1'").run();
  db.prepare("UPDATE warehouse_stocks SET reserved_quantity = reserved_quantity + 8 WHERE product_id = 'p6' AND location_id = 'loc1'").run();

  const insertExit = db.prepare(`
    INSERT INTO stock_exits (
      id, number, project_id, reservation_id, warehouse_id, exit_date, destination_type, destination_name,
      status, reason, prepared_by, stock_applied, validated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertExitLine = db.prepare(`
    INSERT INTO stock_exit_lines (
      id, stock_exit_id, stock_reservation_line_id, product_id, source_location_id,
      quantity_requested, quantity_exited, quantity_returned, condition
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertExit.run('exit1', 'SOR-0001', 'proj1', 'reservation-1', 'w1', '2026-06-07', 'Projet', 'Installation vidéosurveillance Hôtel', 'Validée', 'Matériel prévu pour la première phase du projet.', 'u3', 1, '2026-06-07 09:15:00');
  insertExitLine.run('exit-line1', 'exit1', 'reservation-line-1', 'p1', 'loc1', 4, 4, 1, 'Neuf');
  insertExitLine.run('exit-line2', 'exit1', 'reservation-line-2', 'p7', 'loc1', 2, 2, 0, 'Neuf');
  insertExit.run('exit2', 'SOR-0002', null, null, 'w1', '2026-06-09', 'Technicien', 'Équipe technique A', 'Brouillon', 'Préparation de matériel pour intervention terrain.', 'u3', 0, null);
  insertExitLine.run('exit-line3', 'exit2', null, 'p9', 'loc1', 1, 1, 0, 'Neuf');
  insertExit.run('exit3', 'SOR-0003', null, null, 'w1', '2026-06-08', 'SAV', 'Atelier SAV', 'Validée', 'Diagnostic en atelier.', 'u3', 1, '2026-06-08 13:10:00');
  insertExitLine.run('exit-line4', 'exit3', null, 'p5', 'loc1', 1, 1, 0, 'Occasion');

  db.prepare(`
    INSERT INTO stock_exit_returns (id, number, stock_exit_id, return_date, reason, status, received_by, stock_applied, validated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('exit-return1', 'RS-0001', 'exit1', '2026-06-08', 'Produit non utilisé sur le chantier.', 'Validé', 'u3', 1, '2026-06-08 16:00:00');
  db.prepare(`
    INSERT INTO stock_exit_return_lines (id, stock_exit_return_id, stock_exit_line_id, quantity_returned, destination_location_id, condition)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('exit-return-line1', 'exit-return1', 'exit-line1', 1, 'loc1', 'Bon état');
  insertDocument.run('doc-bs-1', 'Bon de sortie', 'BS-0001', 'stock_exit', 'exit1', 'Validé', JSON.stringify({ exitNumber: 'SOR-0001', destination: 'Installation vidéosurveillance Hôtel' }), '2026-06-07 09:15:00');
  insertDocument.run('doc-bs-2', 'Bon de sortie', 'BS-0002', 'stock_exit', 'exit3', 'Validé', JSON.stringify({ exitNumber: 'SOR-0003', destination: 'Atelier SAV' }), '2026-06-08 13:10:00');
  insertDocument.run('doc-br-1', 'Bon de retour', 'BR-0001', 'stock_exit_return', 'exit-return1', 'Validé', JSON.stringify({ exitNumber: 'SOR-0001', returnNumber: 'RS-0001' }), '2026-06-08 16:00:00');
  insertDocument.run('doc-brv-1', 'Bon de réservation', 'BRV-0001', 'stock_reservation', 'reservation-1', 'Consommé', JSON.stringify({ reservationNumber: 'RES-0001', projectId: 'proj1', totalRequested: 6, totalReserved: 6 }), '2026-06-06 14:00:00');
  insertDocument.run('doc-brv-2', 'Bon de réservation', 'BRV-0002', 'stock_reservation', 'reservation-2', 'Validé', JSON.stringify({ reservationNumber: 'RES-0002', projectId: 'proj-demo-2', totalRequested: 5, totalReserved: 5 }), '2026-06-08 10:30:00');
  insertDocument.run('doc-brv-3', 'Bon de réservation', 'BRV-0003', 'stock_reservation', 'reservation-3', 'Partiel', JSON.stringify({ reservationNumber: 'RES-0003', projectId: 'proj-demo-6', totalRequested: 13, totalReserved: 8 }), '2026-06-09 11:20:00');
  db.prepare("UPDATE warehouse_stocks SET physical_quantity = physical_quantity - 3 WHERE product_id = 'p1' AND location_id = 'loc1'").run();
  db.prepare("UPDATE warehouse_stocks SET physical_quantity = physical_quantity - 2 WHERE product_id = 'p7' AND location_id = 'loc1'").run();
  db.prepare("UPDATE warehouse_stocks SET physical_quantity = physical_quantity - 1 WHERE product_id = 'p5' AND location_id = 'loc1'").run();
  const insertMovement = db.prepare('INSERT INTO stock_movements (id, product_id, location_id, movement_type, quantity, source_type, source_id, comment, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertMovement.run('mov-seed-exit1-p1', 'p1', 'loc1', 'Sortie', -4, 'StockExit', 'exit1', 'Sortie projet', 'u3', '2026-06-07 09:15:00');
  insertMovement.run('mov-seed-exit1-p7', 'p7', 'loc1', 'Sortie', -2, 'StockExit', 'exit1', 'Sortie projet', 'u3', '2026-06-07 09:15:00');
  insertMovement.run('mov-seed-return1-p1', 'p1', 'loc1', 'Retour en stock', 1, 'StockExitReturn', 'exit-return1', 'Produit non utilisé', 'u3', '2026-06-08 16:00:00');
  insertMovement.run('mov-seed-exit3-p5', 'p5', 'loc1', 'Sortie', -1, 'StockExit', 'exit3', 'Sortie SAV', 'u3', '2026-06-08 13:10:00');

  console.log(`Database seeded: ${suppliers.length} suppliers, ${products.length} products and ${products.length} coherent supplier offers.`);
}

if (process.argv[1]?.endsWith('seed.ts')) {
  runSeed();
}
