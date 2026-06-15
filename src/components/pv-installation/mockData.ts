import { InstallationPV } from './types';

export const mockPVs: InstallationPV[] = [
  {
    id: 'PV-2026-0001',
    reference: 'PV-2026-0001',
    clientName: 'TechCorp Industries',
    projectName: 'Déploiement Fibre Zone Nord',
    siteName: 'Site Principal - Bâtiment A',
    technician: 'Marc Dubois',
    clientSignatory: 'Jean Dupont',
    installationDate: '2026-06-05',
    signatureDate: '2026-06-05',
    status: 'Signé',
    result: 'Installation conforme',
    hasReserves: false,
    createdAt: '2026-06-05',
    products: [
      {
        id: 'pvp1',
        productId: 'prod1',
        productName: 'Câble Fibre Optique 100m',
        productReference: 'FIB-100',
        serialNumber: 'SN-FIB-001',
        installedQty: 5
      },
      {
        id: 'pvp2',
        productId: 'prod2',
        productName: 'Routeur Cisco 9000',
        productReference: 'ROUT-C',
        serialNumber: 'SN-ROUT-9012',
        installedQty: 1
      }
    ]
  },
  {
    id: 'PV-2026-0002',
    reference: 'PV-2026-0002',
    clientName: 'Ville de Paris',
    projectName: 'Installation Caméras',
    siteName: 'Hôtel de Ville',
    technician: 'Sophie Martin',
    installationDate: '2026-06-08',
    status: 'En attente de signature',
    result: 'Installation conforme',
    hasReserves: false,
    createdAt: '2026-06-08',
    products: [
      {
        id: 'pvp3',
        productId: 'prod3',
        productName: 'Caméra IP 4K Extérieure',
        productReference: 'CAM-4K',
        serialNumber: 'SN-CAM-1023',
        installedQty: 4
      }
    ]
  },
  {
    id: 'PV-2026-0003',
    reference: 'PV-2026-0003',
    clientName: 'Banque Nationale',
    projectName: 'Mise à niveau Routeurs',
    siteName: 'Siège Social',
    technician: 'Lucas Perrin',
    installationDate: '2026-06-07',
    signatureDate: '2026-06-07',
    status: 'Signé avec réserves',
    result: 'Conforme avec réserves',
    hasReserves: true,
    reservesDetails: 'Port 4 du switch inactif, remplacement planifié.',
    createdAt: '2026-06-07',
    products: [
      {
        id: 'pvp4',
        productId: 'prod4',
        productName: 'Switch 24 ports PoE',
        productReference: 'SW-24P',
        serialNumber: 'SN-SW-8834',
        installedQty: 1
      }
    ]
  },
  {
    id: 'PV-2026-0004',
    reference: 'PV-2026-0004',
    clientName: 'CHU Bordeaux',
    projectName: 'Maintenance Serveurs DB',
    siteName: 'Datacenter Principal',
    technician: 'Jean Admin',
    installationDate: '2026-06-09',
    status: 'Brouillon',
    result: 'Tests à reprendre',
    hasReserves: false,
    createdAt: '2026-06-09',
    products: [
      {
        id: 'pvp5',
        productId: 'prod5',
        productName: 'Serveur HP DL380',
        productReference: 'SRV-DL380',
        serialNumber: 'SN-HP-380X',
        installedQty: 1
      }
    ]
  },
  {
    id: 'PV-2026-0005',
    reference: 'PV-2026-0005',
    clientName: 'StartUp Nation',
    projectName: 'Événement Tech Summit',
    siteName: 'Parc des Expositions',
    technician: 'Emma Leroy',
    clientSignatory: 'Alice Lemaire',
    installationDate: '2026-06-07',
    signatureDate: '2026-06-07',
    status: 'Refusé',
    result: 'Non conforme',
    hasReserves: true,
    reservesDetails: 'Écran rayé pendant le transport. Refus d\'installation.',
    createdAt: '2026-06-07',
    products: [
      {
        id: 'pvp6',
        productId: 'prod6',
        productName: 'Écran interactif 75"',
        productReference: 'SCR-75',
        serialNumber: 'SN-SCR-7501',
        installedQty: 1
      }
    ]
  }
];
