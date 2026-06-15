import { StockOutbound } from './types';

export const MOCK_OUTBOUNDS: StockOutbound[] = [
  {
    id: 'out-001',
    reference: 'BS-2024-001',
    destinationType: 'Projet',
    destinationName: 'Hôtel El Aurassi',
    date: '2024-03-15 08:30',
    validationDate: '2024-03-15 09:15',
    warehouseId: 'wh-01',
    warehouseName: 'Dépôt Principal',
    responsible: 'Ahmed.K',
    status: 'Validée',
    reason: 'Installation phase 1',
    totalQty: 25,
    totalValue: 350000,
    products: [
      {
        id: 'p1',
        reference: 'CAM-IP-001',
        name: 'Caméra IP Hikvision 4MP',
        qtyRequested: 20,
        qtyOut: 20,
        price: 15000,
        locationName: 'A-01',
        condition: 'Neuf',
        isSerialized: true,
        serialNumbers: ['SN-HIK-001', 'SN-HIK-002', '...', 'SN-HIK-020'],
        status: 'Sorti'
      },
      {
        id: 'p2',
        reference: 'CAB-RJ45-01',
        name: 'Câble réseau Cat6 305m',
        qtyRequested: 5,
        qtyOut: 5,
        price: 10000,
        locationName: 'B-02',
        condition: 'Neuf',
        isSerialized: false,
        status: 'Sorti'
      }
    ],
    documents: [
      { id: 'doc-01', type: 'Bon de sortie', name: 'BS-2024-001.pdf' },
      { id: 'doc-02', type: 'Demande Projet', name: 'DP-Aurassi.pdf' }
    ],
    history: [
      { id: 'h1', date: '2024-03-15 08:30', action: 'Création du brouillon', user: 'Ahmed.K' },
      { id: 'h2', date: '2024-03-15 09:00', action: 'Saisie des numéros de série', user: 'Ahmed.K' },
      { id: 'h3', date: '2024-03-15 09:15', action: 'Validation de la sortie (Stock diminué)', user: 'Admin' }
    ]
  },
  {
    id: 'out-002',
    reference: 'BS-2024-002',
    destinationType: 'Client',
    destinationName: 'Clinique El Yasmine',
    date: '2024-03-18 10:00',
    warehouseId: 'wh-01',
    warehouseName: 'Dépôt Principal',
    responsible: 'Samir.M',
    status: 'Brouillon',
    reason: 'Vente directe',
    totalQty: 2,
    totalValue: 45000,
    products: [
      {
        id: 'p1',
        reference: 'NVR-16CH-01',
        name: 'NVR 16 canaux',
        qtyRequested: 1,
        qtyOut: 1,
        price: 25000,
        locationName: 'A-03',
        condition: 'Neuf',
        isSerialized: true,
        serialNumbers: [],
        status: 'Prêt'
      },
      {
        id: 'p3',
        reference: 'SW-POE-08',
        name: 'Switch PoE TP-Link 8 Ports',
        qtyRequested: 1,
        qtyOut: 1,
        price: 20000,
        locationName: 'A-04',
        condition: 'Neuf',
        isSerialized: true,
        serialNumbers: [],
        status: 'Prêt'
      }
    ],
    documents: [
      { id: 'doc-03', type: 'Bon de commande', name: 'BC-Yasmine.pdf' }
    ],
    history: [
      { id: 'h1', date: '2024-03-18 10:00', action: 'Création du brouillon', user: 'Samir.M' }
    ]
  },
  {
    id: 'out-003',
    reference: 'BS-2024-003',
    destinationType: 'Technicien',
    destinationName: 'Véhicule A (Karim)',
    date: '2024-03-19 07:45',
    validationDate: '2024-03-19 08:00',
    warehouseId: 'wh-01',
    warehouseName: 'Dépôt Principal',
    responsible: 'Magasinier',
    status: 'Validée',
    reason: 'Stock véhicule hebdomadaire',
    totalQty: 50,
    totalValue: 12500,
    products: [
      {
        id: 'p4',
        reference: 'CON-RJ45',
        name: 'Connecteurs RJ45 (Lot 100)',
        qtyRequested: 50,
        qtyOut: 50,
        price: 250,
        locationName: 'C-01',
        condition: 'Neuf',
        isSerialized: false,
        status: 'Sorti'
      }
    ],
    history: [
      { id: 'h1', date: '2024-03-19 07:45', action: 'Création de la sortie', user: 'Magasinier' },
      { id: 'h2', date: '2024-03-19 08:00', action: 'Validation de la sortie', user: 'Magasinier' }
    ]
  },
  {
    id: 'out-004',
    reference: 'BS-2024-004',
    destinationType: 'Perte/Casse',
    destinationName: 'Zone Rebut',
    date: '2024-03-20 14:20',
    validationDate: '2024-03-20 14:30',
    warehouseId: 'wh-01',
    warehouseName: 'Dépôt Principal',
    responsible: 'Admin',
    status: 'Validée',
    reason: 'Produit endommagé pendant manipulation',
    totalQty: 1,
    totalValue: 35000,
    products: [
      {
        id: 'p5',
        reference: 'OND-APC-1500',
        name: 'Onduleur APC 1500VA',
        qtyRequested: 1,
        qtyOut: 1,
        price: 35000,
        locationName: 'B-01',
        condition: 'Abîmé',
        isSerialized: true,
        serialNumbers: ['SN-APC-088'],
        status: 'Sorti'
      }
    ],
    documents: [
      { id: 'doc-04', type: 'Justificatif Casse', name: 'Rapport-Degats.pdf' }
    ],
    history: [
      { id: 'h1', date: '2024-03-20 14:20', action: 'Création de la déclaration de casse', user: 'Admin' },
      { id: 'h2', date: '2024-03-20 14:30', action: 'Sortie du stock validée', user: 'Admin' }
    ]
  },
  {
    id: 'out-005',
    reference: 'BS-2024-005',
    destinationType: 'SAV',
    destinationName: 'Retour Fournisseur SAV',
    date: '2024-03-22 11:00',
    warehouseId: 'wh-sav',
    warehouseName: 'Zone SAV',
    responsible: 'Tech SAV',
    status: 'Annulée',
    reason: 'Erreur de diagnostic, produit réparé en local',
    totalQty: 1,
    totalValue: 8000,
    products: [
      {
        id: 'p6',
        reference: 'ROUT-MIK',
        name: 'Routeur MikroTik',
        qtyRequested: 1,
        qtyOut: 0,
        price: 8000,
        locationName: 'SAV-01',
        condition: 'Occasion',
        isSerialized: true,
        serialNumbers: ['SN-MIK-999'],
        status: 'Prêt'
      }
    ],
    history: [
      { id: 'h1', date: '2024-03-22 11:00', action: 'Création du brouillon SAV', user: 'Tech SAV' },
      { id: 'h2', date: '2024-03-22 15:00', action: 'Annulation de la sortie', user: 'Tech SAV' }
    ]
  }
];
