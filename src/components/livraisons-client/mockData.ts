import { ClientLivraison } from './types';

export const mockLivraisons: ClientLivraison[] = [
  {
    id: 'LIV-2026-0001',
    reference: 'LIV-2026-0001',
    deliverySlipNumber: 'BL-2026-0001',
    clientName: 'TechCorp Industries',
    projectName: 'Déploiement Fibre Zone Nord',
    deliverySite: 'Site Principal - Bâtiment A',
    warehouse: 'Magasin Central',
    status: 'Livrée',
    carrier: 'Camion Interne 1',
    responsible: 'Marc Dubois',
    plannedDate: '2026-06-05',
    actualDate: '2026-06-05',
    createdAt: '2026-06-01',
    products: [
      {
        id: 'lp1',
        productId: 'prod1',
        productReference: 'FIB-100',
        productName: 'Câble Fibre Optique 100m',
        requestedQty: 5,
        deliveredQty: 5
      },
      {
        id: 'lp2',
        productId: 'prod2',
        productReference: 'ROUT-C',
        productName: 'Routeur Cisco 9000',
        requestedQty: 1,
        deliveredQty: 1
      }
    ]
  },
  {
    id: 'LIV-2026-0002',
    reference: 'LIV-2026-0002',
    deliverySlipNumber: 'BL-2026-0002',
    clientName: 'Ville de Paris',
    projectName: 'Installation Caméras',
    deliverySite: 'Hôtel de Ville',
    warehouse: 'Magasin Nord',
    status: 'En cours',
    carrier: 'DHL Express',
    responsible: 'Sophie Martin',
    plannedDate: '2026-06-08',
    createdAt: '2026-06-06',
    products: [
      {
        id: 'lp3',
        productId: 'prod3',
        productReference: 'CAM-4K',
        productName: 'Caméra IP 4K Extérieure',
        requestedQty: 10,
        deliveredQty: 4
      }
    ]
  },
  {
    id: 'LIV-2026-0003',
    reference: 'LIV-2026-0003',
    deliverySlipNumber: 'BL-2026-0003',
    clientName: 'Banque Nationale',
    projectName: 'Mise à niveau Routeurs',
    deliverySite: 'Siège Social',
    warehouse: 'Magasin Central',
    status: 'À préparer',
    carrier: 'UPS',
    responsible: 'Lucas Perrin',
    plannedDate: '2026-06-10',
    createdAt: '2026-06-07',
    products: [
      {
        id: 'lp4',
        productId: 'prod4',
        productReference: 'SW-24P',
        productName: 'Switch 24 ports PoE',
        requestedQty: 2,
        deliveredQty: 0
      }
    ]
  },
  {
    id: 'LIV-2026-0004',
    reference: 'LIV-2026-0004',
    deliverySlipNumber: 'BL-2026-0004',
    clientName: 'CHU Bordeaux',
    projectName: 'Maintenance Serveurs DB',
    deliverySite: 'Datacenter Principal',
    warehouse: 'Magasin IT',
    status: 'Prête',
    carrier: 'Livreur Interne',
    responsible: 'Jean Admin',
    plannedDate: '2026-06-09',
    createdAt: '2026-06-07',
    products: [
      {
        id: 'lp5',
        productId: 'prod5',
        productReference: 'SRV-DL380',
        productName: 'Serveur HP DL380',
        requestedQty: 1,
        deliveredQty: 0
      }
    ]
  },
  {
    id: 'LIV-2026-0005',
    reference: 'LIV-2026-0005',
    deliverySlipNumber: 'BL-2026-0005',
    clientName: 'StartUp Nation',
    projectName: 'Événement Tech Summit',
    deliverySite: 'Parc des Expositions',
    warehouse: 'Magasin Central',
    status: 'Avec anomalie',
    carrier: 'FedEx',
    responsible: 'Emma Leroy',
    plannedDate: '2026-06-06',
    actualDate: '2026-06-07',
    createdAt: '2026-06-04',
    products: [
      {
        id: 'lp6',
        productId: 'prod6',
        productReference: 'SCR-75',
        productName: 'Écran interactif 75"',
        requestedQty: 2,
        deliveredQty: 1
      }
    ]
  }
];
