import { SupplierReceipt } from './types';

export const MOCK_RECEIPTS: SupplierReceipt[] = [
  {
    id: 'rc-001',
    reference: 'RF-0001',
    supplierId: 'sup-001',
    supplierName: 'Hikvision Algérie',
    date: '2026-05-25 10:30',
    validationDate: '2026-05-25 14:15',
    deliveryNoteRef: 'BL-HIK-4567',
    purchaseOrderRef: 'PO-2026-102',
    warehouseId: 'dep-001',
    warehouseName: 'Dépôt Principal',
    responsible: 'K. Samia',
    status: 'Validée',
    totalQty: 20,
    totalValue: 450000,
    products: [
      {
        id: 'p1',
        reference: 'CAM-HIK-2CD2043',
        name: 'Caméra IP Hikvision DS-2CD2043',
        qtyOrdered: 20,
        qtyReceived: 20,
        purchasePrice: 22500,
        locationId: 'loc-003',
        locationName: 'Zone CCTV / A-01',
        condition: 'Conforme',
        isSerialized: true,
        serialNumbers: ['SN-HIK-001', 'SN-HIK-002', 'SN-HIK-003', 'SN-HIK-004', 'SN-HIK-005']
      }
    ],
    documents: [
      { id: 'doc1', type: 'BL fournisseur', name: 'BL-HIK-4567.pdf' },
      { id: 'doc2', type: 'Facture', name: 'INV-HIK-998.pdf' }
    ],
    history: [
      { id: 'h1', date: '2026-05-25 10:30', action: 'Réception créée', user: 'K. Samia' },
      { id: 'h2', date: '2026-05-25 14:15', action: 'Réception validée', user: 'K. Samia' }
    ]
  },
  {
    id: 'rc-002',
    reference: 'RF-0002',
    supplierId: 'sup-002',
    supplierName: 'TP-Link Distributor',
    date: '2026-06-01 09:00',
    validationDate: '2026-06-01 10:00',
    deliveryNoteRef: 'BL-TP-2024',
    purchaseOrderRef: 'PO-2026-115',
    warehouseId: 'dep-001',
    warehouseName: 'Dépôt Principal',
    responsible: 'M. Ahmed',
    status: 'Validée',
    totalQty: 50,
    totalValue: 125000,
    products: [
      {
        id: 'p2',
        reference: 'SW-TP-SG105',
        name: 'Switch TP-Link 5 Ports Gigabit',
        qtyOrdered: 50,
        qtyReceived: 50,
        purchasePrice: 2500,
        locationId: 'loc-002',
        locationName: 'Zone Réseau / B-04',
        condition: 'Conforme',
        isSerialized: false
      }
    ],
    history: [
      { id: 'h3', date: '2026-06-01 09:00', action: 'Réception créée', user: 'M. Ahmed' },
      { id: 'h4', date: '2026-06-01 10:00', action: 'Réception validée', user: 'M. Ahmed' }
    ]
  },
  {
    id: 'rc-003',
    reference: 'RF-0003',
    supplierId: 'sup-003',
    supplierName: 'APC Schneider',
    date: '2026-06-02 11:45',
    deliveryNoteRef: 'BL-APC-0012',
    purchaseOrderRef: 'PO-2026-120',
    warehouseId: 'dep-001',
    warehouseName: 'Dépôt Principal',
    responsible: 'K. Samia',
    status: 'Écart détecté',
    totalQty: 10,
    totalValue: 850000,
    products: [
      {
        id: 'p3',
        reference: 'UPS-APC-1500',
        name: 'Onduleur APC Smart-UPS 1500VA',
        qtyOrdered: 10,
        qtyReceived: 9,
        purchasePrice: 85000,
        locationId: 'loc-005',
        locationName: 'Zone Énergie / C-01',
        condition: 'Manquant',
        isSerialized: true,
        serialNumbers: ['SN-APC-X01', 'SN-APC-X02', 'SN-APC-X03'],
        hasGap: true
      }
    ],
    gaps: [
      { id: 'g1', type: 'Quantité manquante', productName: 'Onduleur APC Smart-UPS 1500VA', comment: 'Reçu 9 unités sur 10 commandées.' }
    ],
    history: [
      { id: 'h5', date: '2026-06-02 11:45', action: 'Réception créée', user: 'K. Samia' },
      { id: 'h6', date: '2026-06-02 11:55', action: 'Écart signalé', user: 'K. Samia' }
    ]
  },
  {
    id: 'rc-004',
    reference: 'RF-0004',
    supplierId: 'sup-004',
    supplierName: 'Dahua Technology',
    date: '2026-06-02 15:30',
    deliveryNoteRef: 'BL-DAH-778',
    purchaseOrderRef: 'PO-2026-125',
    warehouseId: 'dep-002',
    warehouseName: 'Dépôt Ouest',
    responsible: 'S. Malik',
    status: 'Écart détecté',
    totalQty: 15,
    totalValue: 300000,
    products: [
      {
        id: 'p4',
        reference: 'CAM-DAH-HFW1431',
        name: 'Caméra Bullet Dahua 4MP',
        qtyOrdered: 15,
        qtyReceived: 15,
        purchasePrice: 20000,
        locationId: 'loc-007',
        locationName: 'Zone CCTV / B-02',
        condition: 'Abîmé',
        isSerialized: true,
        serialNumbers: ['SN-DAH-Y99'],
        hasGap: true
      }
    ],
    gaps: [
      { id: 'g2', type: 'Produit abîmé', productName: 'Caméra Bullet Dahua 4MP', comment: 'Un carton écrasé, caméra avec optique rayée.' }
    ],
    documents: [
      { id: 'doc3', type: 'Photo produit abîmé', name: 'photo_dahua_cassee.jpg' }
    ],
    history: [
      { id: 'h7', date: '2026-06-02 15:30', action: 'Réception créée', user: 'S. Malik' },
      { id: 'h8', date: '2026-06-02 15:45', action: 'Écart signalé', user: 'S. Malik' }
    ]
  },
  {
    id: 'rc-005',
    reference: 'RF-0005',
    supplierId: 'sup-005',
    supplierName: 'Dell Technologies',
    date: '2026-06-03 10:00',
    deliveryNoteRef: 'BL-DELL-990',
    purchaseOrderRef: 'PO-2026-130',
    warehouseId: 'dep-001',
    warehouseName: 'Dépôt Principal',
    responsible: 'M. Ahmed',
    status: 'Brouillon',
    totalQty: 5,
    totalValue: 750000,
    products: [
      {
        id: 'p5',
        reference: 'LAP-DELL-LAT5420',
        name: 'Laptop Dell Latitude 5420 i7',
        qtyOrdered: 5,
        qtyReceived: 5,
        purchasePrice: 150000,
        locationId: 'loc-001',
        locationName: 'Zone Informatique / A-02',
        condition: 'Conforme',
        isSerialized: true
      }
    ],
    history: [
      { id: 'h9', date: '2026-06-03 10:00', action: 'Réception créée', user: 'M. Ahmed' }
    ]
  },
  {
    id: 'rc-006',
    reference: 'RF-0006',
    supplierId: 'sup-006',
    supplierName: 'ZKTeco Algérie',
    date: '2026-05-30 14:00',
    deliveryNoteRef: 'BL-ZK-443',
    purchaseOrderRef: 'PO-2026-098',
    warehouseId: 'dep-001',
    warehouseName: 'Dépôt Principal',
    responsible: 'S. Malik',
    status: 'Annulée',
    totalQty: 10,
    totalValue: 120000,
    products: [],
    history: [
      { id: 'h10', date: '2026-05-30 14:00', action: 'Réception créée', user: 'S. Malik' },
      { id: 'h11', date: '2026-05-30 14:30', action: 'Réception annulée', user: 'S. Malik' }
    ]
  }
];
