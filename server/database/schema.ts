import db from './connection.js';

export function createSchema() {
  db.exec(`
    -- Administration
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      family TEXT NOT NULL,
      is_active INTEGER DEFAULT 0,
      is_core INTEGER DEFAULT 0
    );

    -- Référentiel
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'Distributeur',
      country TEXT NOT NULL DEFAULT 'Algérie',
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      payment_method TEXT,
      currency TEXT,
      average_delivery_days INTEGER,
      conformity_rate INTEGER DEFAULT 100,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      archived_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'Entreprise',
      sector TEXT NOT NULL DEFAULT 'Autre',
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      region TEXT,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      archived_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS client_sites (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES clients(id),
      reference TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      contact_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      family TEXT,
      brand TEXT,
      model TEXT,
      description TEXT,
      product_type TEXT NOT NULL DEFAULT 'Équipement',
      is_stockable INTEGER DEFAULT 1,
      purchase_price REAL DEFAULT 0,
      sale_price REAL DEFAULT 0,
      serialized INTEGER DEFAULT 0,
      minimum_stock INTEGER DEFAULT 0,
      supplier_warranty_months INTEGER DEFAULT 0,
      client_warranty_months INTEGER DEFAULT 0,
      tags_json TEXT,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      archived_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      unit TEXT,
      sale_price REAL,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      archived_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS supplier_product_offers (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      supplier_reference TEXT,
      purchase_price REAL,
      currency TEXT,
      delivery_days INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(supplier_id, product_id)
    );

    -- Stock et emplacements
    CREATE TABLE IF NOT EXISTS warehouses (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      address TEXT,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS warehouse_locations (
      id TEXT PRIMARY KEY,
      warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
      code TEXT NOT NULL,
      zone TEXT,
      aisle TEXT,
      shelf TEXT,
      capacity INTEGER,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS warehouse_stocks (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      location_id TEXT REFERENCES warehouse_locations(id),
      physical_quantity INTEGER DEFAULT 0,
      reserved_quantity INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS serial_numbers (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      serial_number TEXT NOT NULL,
      status TEXT NOT NULL,
      location_id TEXT REFERENCES warehouse_locations(id),
      supplier_id TEXT REFERENCES suppliers(id),
      received_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      location_id TEXT REFERENCES warehouse_locations(id),
      serial_number_id TEXT REFERENCES serial_numbers(id),
      movement_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      source_type TEXT,
      source_id TEXT,
      comment TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Approvisionnement fournisseur
    CREATE TABLE IF NOT EXISTS supplier_orders (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL UNIQUE,
      supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      order_date DATETIME,
      expected_delivery_date DATETIME,
      status TEXT NOT NULL,
      currency TEXT,
      payment_method TEXT,
      delivery_address TEXT,
      notes TEXT,
      created_by TEXT,
      validated_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      archived_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS supplier_order_lines (
      id TEXT PRIMARY KEY,
      supplier_order_id TEXT NOT NULL REFERENCES supplier_orders(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity_ordered INTEGER NOT NULL,
      unit_purchase_price REAL,
      discount_rate REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Réceptions
    CREATE TABLE IF NOT EXISTS supplier_receipts (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL UNIQUE,
      supplier_order_id TEXT REFERENCES supplier_orders(id),
      fournisseur_id TEXT REFERENCES suppliers(id),
      supplier_delivery_note TEXT,
      supplier_invoice_number TEXT,
      receipt_date DATETIME,
      warehouse_id TEXT REFERENCES warehouses(id),
      status TEXT NOT NULL,
      conformity_status TEXT,
      stock_applied INTEGER DEFAULT 0,
      notes TEXT,
      received_by TEXT,
      validated_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      archived_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS supplier_receipt_lines (
      id TEXT PRIMARY KEY,
      supplier_receipt_id TEXT NOT NULL REFERENCES supplier_receipts(id),
      supplier_order_line_id TEXT REFERENCES supplier_order_lines(id),
      quantity_delivered INTEGER DEFAULT 0,
      quantity_accepted INTEGER DEFAULT 0,
      quantity_rejected INTEGER DEFAULT 0,
      destination_location_id TEXT REFERENCES warehouse_locations(id),
      conformity_status TEXT,
      issue_reason TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS receipt_serial_numbers (
      id TEXT PRIMARY KEY,
      supplier_receipt_line_id TEXT NOT NULL REFERENCES supplier_receipt_lines(id),
      serial_number_id TEXT NOT NULL REFERENCES serial_numbers(id)
    );

    -- Retours fournisseur
    CREATE TABLE IF NOT EXISTS supplier_returns (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL UNIQUE,
      supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      supplier_receipt_id TEXT REFERENCES supplier_receipts(id),
      return_date DATETIME,
      shipping_date DATETIME,
      warehouse_id TEXT REFERENCES warehouses(id),
      status TEXT NOT NULL,
      general_reason TEXT,
      requested_solution TEXT,
      notes TEXT,
      created_by TEXT,
      validated_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      archived_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS supplier_return_lines (
      id TEXT PRIMARY KEY,
      supplier_return_id TEXT NOT NULL REFERENCES supplier_returns(id),
      supplier_receipt_line_id TEXT REFERENCES supplier_receipt_lines(id),
      quantity_returned INTEGER DEFAULT 0,
      source_location_id TEXT REFERENCES warehouse_locations(id),
      reason TEXT,
      condition TEXT,
      requested_solution TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS supplier_return_serial_numbers (
      id TEXT PRIMARY KEY,
      supplier_return_line_id TEXT NOT NULL REFERENCES supplier_return_lines(id),
      serial_number_id TEXT NOT NULL REFERENCES serial_numbers(id)
    );

    -- Projet
    CREATE TABLE IF NOT EXISTS client_projects (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      client_id TEXT NOT NULL REFERENCES clients(id),
      client_site_id TEXT REFERENCES client_sites(id),
      manager_id TEXT REFERENCES users(id),
      status TEXT NOT NULL,
      start_date DATETIME,
      planned_end_date DATETIME,
      budget REAL,
      progress REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      archived_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS project_product_needs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES client_projects(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity_required INTEGER NOT NULL,
      priority TEXT,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS project_service_needs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES client_projects(id),
      service_id TEXT NOT NULL REFERENCES services(id),
      quantity INTEGER NOT NULL,
      planned_date DATETIME,
      status TEXT NOT NULL
    );

    -- Réservations
    CREATE TABLE IF NOT EXISTS stock_reservations (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL UNIQUE,
      project_id TEXT NOT NULL REFERENCES client_projects(id),
      status TEXT NOT NULL,
      requested_by TEXT REFERENCES users(id),
      approved_by TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_reservation_lines (
      id TEXT PRIMARY KEY,
      stock_reservation_id TEXT NOT NULL REFERENCES stock_reservations(id),
      project_product_need_id TEXT REFERENCES project_product_needs(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      location_id TEXT REFERENCES warehouse_locations(id),
      quantity_requested INTEGER NOT NULL,
      quantity_reserved INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reservation_serial_numbers (
      id TEXT PRIMARY KEY,
      stock_reservation_line_id TEXT NOT NULL REFERENCES stock_reservation_lines(id),
      serial_number_id TEXT NOT NULL REFERENCES serial_numbers(id)
    );

    -- Sorties de stock
    CREATE TABLE IF NOT EXISTS stock_exits (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL UNIQUE,
      project_id TEXT REFERENCES client_projects(id),
      reservation_id TEXT REFERENCES stock_reservations(id),
      warehouse_id TEXT REFERENCES warehouses(id),
      exit_date DATETIME,
      destination_type TEXT NOT NULL DEFAULT 'Projet',
      destination_name TEXT,
      status TEXT NOT NULL,
      reason TEXT,
      prepared_by TEXT REFERENCES users(id),
      authorized_by TEXT REFERENCES users(id),
      stock_applied INTEGER DEFAULT 0,
      validated_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      archived_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS stock_exit_lines (
      id TEXT PRIMARY KEY,
      stock_exit_id TEXT NOT NULL REFERENCES stock_exits(id),
      stock_reservation_line_id TEXT REFERENCES stock_reservation_lines(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      source_location_id TEXT REFERENCES warehouse_locations(id),
      quantity_requested INTEGER NOT NULL DEFAULT 0,
      quantity_exited INTEGER NOT NULL,
      quantity_returned INTEGER NOT NULL DEFAULT 0,
      condition TEXT DEFAULT 'Neuf'
    );

    CREATE TABLE IF NOT EXISTS stock_exit_serial_numbers (
      id TEXT PRIMARY KEY,
      stock_exit_line_id TEXT NOT NULL REFERENCES stock_exit_lines(id),
      serial_number_id TEXT NOT NULL REFERENCES serial_numbers(id)
    );

    CREATE TABLE IF NOT EXISTS stock_exit_returns (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL UNIQUE,
      stock_exit_id TEXT NOT NULL REFERENCES stock_exits(id),
      return_date DATETIME,
      reason TEXT,
      status TEXT NOT NULL,
      received_by TEXT REFERENCES users(id),
      stock_applied INTEGER DEFAULT 0,
      validated_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_exit_return_lines (
      id TEXT PRIMARY KEY,
      stock_exit_return_id TEXT NOT NULL REFERENCES stock_exit_returns(id),
      stock_exit_line_id TEXT NOT NULL REFERENCES stock_exit_lines(id),
      quantity_returned INTEGER NOT NULL,
      destination_location_id TEXT REFERENCES warehouse_locations(id),
      condition TEXT DEFAULT 'Bon état'
    );

    -- Livraisons client
    CREATE TABLE IF NOT EXISTS client_deliveries (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL UNIQUE,
      project_id TEXT REFERENCES client_projects(id),
      stock_exit_id TEXT REFERENCES stock_exits(id),
      delivery_date DATETIME,
      status TEXT NOT NULL,
      received_by_client TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS client_delivery_lines (
      id TEXT PRIMARY KEY,
      client_delivery_id TEXT NOT NULL REFERENCES client_deliveries(id),
      stock_exit_line_id TEXT NOT NULL REFERENCES stock_exit_lines(id),
      quantity_delivered INTEGER NOT NULL
    );

    -- Installations
    CREATE TABLE IF NOT EXISTS installations (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      project_id TEXT REFERENCES client_projects(id),
      client_site_id TEXT REFERENCES client_sites(id),
      technician_id TEXT REFERENCES users(id),
      installation_date DATETIME,
      status TEXT NOT NULL,
      report TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS installed_equipment (
      id TEXT PRIMARY KEY,
      installation_id TEXT REFERENCES installations(id),
      client_id TEXT NOT NULL REFERENCES clients(id),
      client_site_id TEXT REFERENCES client_sites(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      serial_number_id TEXT REFERENCES serial_numbers(id),
      installed_at DATETIME,
      status TEXT NOT NULL,
      warranty_start DATETIME,
      warranty_end DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      archived_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS installation_service_lines (
      id TEXT PRIMARY KEY,
      installation_id TEXT NOT NULL REFERENCES installations(id),
      project_service_need_id TEXT REFERENCES project_service_needs(id),
      status TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS installation_reports (
      id TEXT PRIMARY KEY,
      installation_id TEXT NOT NULL REFERENCES installations(id),
      content TEXT,
      created_by TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS installation_minutes (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL UNIQUE,
      installation_id TEXT NOT NULL REFERENCES installations(id),
      status TEXT NOT NULL,
      client_signatory TEXT,
      signed_at DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- SAV
    CREATE TABLE IF NOT EXISTS sav_interventions (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL UNIQUE,
      installed_equipment_id TEXT NOT NULL REFERENCES installed_equipment(id),
      technician_id TEXT REFERENCES users(id),
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      reported_issue TEXT,
      diagnosis TEXT,
      action_taken TEXT,
      intervention_date DATETIME,
      closed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      archived_at DATETIME
    );

    -- Documents
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      document_type TEXT NOT NULL,
      number TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      status TEXT NOT NULL,
      metadata_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Change Logs
    CREATE TABLE IF NOT EXISTS change_logs (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      description TEXT,
      user_id TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function dropSchema() {
  // Extract all table names and drop them
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as {name: string}[];
  for (const table of tables) {
    if (table.name !== 'sqlite_sequence') {
      db.exec(`DROP TABLE ${table.name}`);
    }
  }
}
