import { StockReservation } from './types';

export const MOCK_RESERVATIONS: StockReservation[] = [
  {
    id: '1',
    reference: 'RES-2026-001',
    projectName: 'Déploiement Fibre Zone Nord',
    clientName: 'Télécom Paris',
    products: [
      { id: 'p1', productId: '101', productReference: 'FIB-100', productName: 'Câble Fibre Optique 100m', requestedQty: 50, reservedQty: 50, missingQty: 0, warehouse: 'Magasin Central', location: 'A-12' },
      { id: 'p2', productId: '102', productReference: 'CON-RJ45', productName: 'Connecteur RJ45', requestedQty: 200, reservedQty: 200, missingQty: 0, warehouse: 'Magasin Central', location: 'B-04' }
    ],
    totalRequestedQty: 250,
    totalReservedQty: 250,
    status: 'Réservée',
    priority: 'Haute',
    plannedDate: '2026-06-15',
    createdAt: '2026-06-01',
    responsible: 'Alice Dupont'
  },
  {
    id: '2',
    reference: 'RES-2026-002',
    projectName: 'Maintenance Serveurs DB',
    clientName: 'Banque Nationale',
    products: [
      { id: 'p3', productId: '103', productReference: 'RAM-64G', productName: 'Barrette RAM 64GB DDR5', requestedQty: 10, reservedQty: 5, missingQty: 5, warehouse: 'Magasin IT', location: 'C-01' },
      { id: 'p4', productId: '104', productReference: 'SSD-2T', productName: 'Disque NVMe 2TB', requestedQty: 4, reservedQty: 4, missingQty: 0, warehouse: 'Magasin IT', location: 'C-02' }
    ],
    totalRequestedQty: 14,
    totalReservedQty: 9,
    status: 'Partiellement réservée',
    priority: 'Urgent',
    plannedDate: '2026-06-10',
    createdAt: '2026-06-05',
    responsible: 'Marc Tremblay'
  },
  {
    id: '3',
    reference: 'RES-2026-003',
    projectName: 'Installation Caméras',
    clientName: 'Ville de Lyon',
    products: [
      { id: 'p5', productId: '105', productReference: 'CAM-PTZ', productName: 'Caméra PTZ 4K', requestedQty: 12, reservedQty: 0, missingQty: 12, warehouse: 'Magasin Central', location: 'D-05' }
    ],
    totalRequestedQty: 12,
    totalReservedQty: 0,
    status: 'En attente',
    priority: 'Normale',
    plannedDate: '2026-07-01',
    createdAt: '2026-06-07',
    responsible: 'Sophie Martin'
  },
  {
    id: '4',
    reference: 'RES-2026-004',
    projectName: 'Mise à niveau Routeurs',
    clientName: 'Tech Innov',
    products: [
      { id: 'p6', productId: '106', productReference: 'ROUT-C', productName: 'Routeur Cisco 9000', requestedQty: 5, reservedQty: 5, missingQty: 0, warehouse: 'Magasin IT', location: 'C-10' }
    ],
    totalRequestedQty: 5,
    totalReservedQty: 5,
    status: 'Consommée',
    priority: 'Normale',
    plannedDate: '2026-05-20',
    createdAt: '2026-05-15',
    responsible: 'Luc Dubois'
  },
  {
    id: '5',
    reference: 'RES-2026-005',
    projectName: 'Événement Tech Summit',
    clientName: 'SIT-ERP Corp Ltd.',
    products: [
      { id: 'p7', productId: '107', productReference: 'ECR-85', productName: 'Écran OLED 85 pouces', requestedQty: 2, reservedQty: 0, missingQty: 2, warehouse: 'Magasin Audiovisuel', location: 'E-01' }
    ],
    totalRequestedQty: 2,
    totalReservedQty: 0,
    status: 'Brouillon',
    priority: 'Basse',
    plannedDate: '2026-06-25',
    createdAt: '2026-06-08',
    responsible: 'Claire Lefebvre'
  }
];
