import { SupplierReturn } from './types';

export const MOCK_RETURNS: SupplierReturn[] = [
  {
    id: 'ret-001',
    reference: 'RF-2024-001',
    supplierName: 'Hikvision France',
    date: '2024-04-10 10:15',
    validationDate: '2024-04-10 11:00',
    motif: 'Garantie',
    linkedReceipt: 'BL-HK-8893',
    warehouseName: 'Zone SAV / Retour',
    responsible: 'Ahmed.K',
    status: 'Validé',
    comment: 'Caméra IP Hikvision défectueuse sous garantie, capteur CMOS HS.',
    totalQty: 1,
    totalValue: 15000,
    products: [
      {
        id: 'p1',
        reference: 'CAM-IP-001',
        name: 'Caméra IP Hikvision 4MP',
        qty: 1,
        locationName: 'SAV-01',
        condition: 'Abîmé',
        isSerialized: true,
        serialNumbers: ['SN-HIK-DEF-991'],
        reason: 'Capteur CMOS HS en test',
        decision: 'Échange'
      }
    ],
    documents: [
      { id: 'doc-001', type: 'Bon de retour fournisseur', name: 'RF-2024-001_Bon.pdf', size: '150 KB' },
      { id: 'doc-002', type: 'Certificat de garantie', name: 'Garantie_HIK_2024.pdf', size: '1.2 MB' },
      { id: 'doc-003', type: 'Accord de retour fournisseur', name: 'Accord_HIK_RMA_99.pdf', size: '420 KB' }
    ],
    tracking: [
      { name: 'Retour envoyé', completed: true, date: '2024-04-10 11:30', description: 'Envoi par DHL, Track #99281' },
      { name: 'Reçu par fournisseur', completed: true, date: '2024-04-12 14:00', description: 'Arrivé à l\'entrepôt de Hikvision' },
      { name: 'Diagnostic fournisseur', completed: true, date: '2024-04-13 09:30', description: 'Panne confirmée (défaut composant)' },
      { name: 'Échange accepté', completed: true, date: '2024-04-13 11:00', description: 'Nouvel appareil expédié' },
      { name: 'Avoir reçu', completed: false },
      { name: 'Retour clôturé', completed: false }
    ],
    history: [
      { id: 'h1', date: '2024-04-10 10:15', action: 'Création du brouillon de retour', user: 'Ahmed.K' },
      { id: 'h2', date: '2024-04-10 10:45', action: 'Numéro de série sélectionné et affecté', user: 'Ahmed.K' },
      { id: 'h3', date: '2024-04-10 11:00', action: 'Validation du retour (Produit bloqué/retiré du stock)', user: 'Ahmed.K' }
    ]
  },
  {
    id: 'ret-002',
    reference: 'RF-2024-002',
    supplierName: 'Schneider Electric',
    date: '2024-04-15 09:00',
    motif: 'Abîmé à la réception',
    linkedReceipt: 'BL-SE-2191',
    warehouseName: 'Zone de réception A',
    responsible: 'Ahmed.K',
    status: 'Brouillon',
    comment: 'Onduleur APC abîmé à la réception. Châssis métallique tordu lors du transport.',
    totalQty: 2,
    totalValue: 70000,
    products: [
      {
        id: 'p2',
        reference: 'OND-APC-1500',
        name: 'Onduleur APC Back-UPS 1500VA',
        qty: 2,
        locationName: 'REC-03',
        condition: 'Abîmé',
        isSerialized: true,
        serialNumbers: ['SN-APC-D1', 'SN-APC-D2'],
        reason: 'Châssis enfoncé à la livraison',
        decision: 'Avoir'
      }
    ],
    documents: [
      { id: 'doc-004', type: 'Facture fournisseur', name: 'FAC-SE-2024.pdf', size: '2.4 MB' },
      { id: 'doc-005', type: 'Photos produit abîmé', name: 'Casse_Transport_APC_1.jpg', size: '3.1 MB' }
    ],
    tracking: [
      { name: 'Retour envoyé', completed: false },
      { name: 'Reçu par fournisseur', completed: false },
      { name: 'Diagnostic fournisseur', completed: false },
      { name: 'Échange accepté', completed: false },
      { name: 'Avoir reçu', completed: false },
      { name: 'Retour clôturé', completed: false }
    ],
    history: [
      { id: 'h1', date: '2024-04-15 09:00', action: 'Création du brouillon de retour suite à contrôle de livraison', user: 'Ahmed.K' },
      { id: 'h2', date: '2024-04-15 09:20', action: 'Ajout des photos des dégâts matériels', user: 'Ahmed.K' }
    ]
  },
  {
    id: 'ret-003',
    reference: 'RF-2024-003',
    supplierName: 'TP-Link Distri',
    date: '2024-04-16 14:00',
    validationDate: '2024-04-16 15:30',
    motif: 'Erreur de livraison',
    linkedReceipt: 'BL-TL-902',
    warehouseName: 'Dépôt Alger',
    responsible: 'Samir.M',
    status: 'En attente',
    comment: 'Switch TP-Link reçu en mauvaise référence. Commande de commutateur PoE+ de 24 ports, reçu PoE simple.',
    totalQty: 5,
    totalValue: 42500,
    products: [
      {
        id: 'p3',
        reference: 'SW-POE-08',
        name: 'Switch PoE TP-Link 8 Ports',
        qty: 5,
        locationName: 'ALGER-B4',
        condition: 'Neuf',
        isSerialized: false,
        reason: 'Incompatibilité de référence (reçu version standard non PoE+)',
        decision: 'Échange'
      }
    ],
    documents: [
      { id: 'doc-006', type: 'Bon de livraison fournisseur initial', name: 'BL-TL-902.pdf', size: '1.1 MB' },
      { id: 'doc-007', type: 'Accord de retour fournisseur', name: 'Retour_Accord_approved_TPL.pdf', size: '940 KB' }
    ],
    tracking: [
      { name: 'Retour envoyé', completed: true, date: '2024-04-16 16:30', description: 'Envoyé par transporteur interne' },
      { name: 'Reçu par fournisseur', completed: true, date: '2024-04-17 11:15', description: 'Réception validée' },
      { name: 'Diagnostic fournisseur', completed: false },
      { name: 'Échange accepté', completed: false },
      { name: 'Avoir reçu', completed: false },
      { name: 'Retour clôturé', completed: false }
    ],
    history: [
      { id: 'h1', date: '2024-04-16 14:00', action: 'Déclenchement anomalie erreur livraison', user: 'Samir.M' },
      { id: 'h2', date: '2024-04-16 15:30', action: 'Validation de la réexpédition vers fournisseur', user: 'Samir.M' }
    ]
  },
  {
    id: 'ret-004',
    reference: 'RF-2024-004',
    supplierName: 'Dahua Security',
    date: '2024-04-18 11:20',
    validationDate: '2024-04-18 12:00',
    motif: 'Échange',
    warehouseName: 'Zone SAV / Retour',
    responsible: 'Amine.T',
    status: 'Clôturé',
    comment: 'NVR Dahua retourné pour échange suite à instabilité firmware constatée au banc de test.',
    totalQty: 1,
    totalValue: 27500,
    products: [
      {
        id: 'p4',
        reference: 'NVR-16CH-01',
        name: 'NVR 16 canaux Dahua',
        qty: 1,
        locationName: 'SAV-02',
        condition: 'Occasion',
        isSerialized: true,
        serialNumbers: ['SN-DAHUA-7729'],
        reason: 'Bugs de déconnexions répétés',
        decision: 'Échange'
      }
    ],
    documents: [
      { id: 'doc-008', type: 'Bon de retour fournisseur', name: 'RF-Dahua_Return.pdf', size: '410 KB' }
    ],
    tracking: [
      { name: 'Retour envoyé', completed: true, date: '2024-04-18 14:00', description: 'Remis au commercial Dahua' },
      { name: 'Reçu par fournisseur', completed: true, date: '2024-04-19 10:00', description: 'Enregistré par Dahua RMA' },
      { name: 'Diagnostic fournisseur', completed: true, date: '2024-04-20 16:00', description: 'Contrôle OK (échange validé)' },
      { name: 'Échange accepté', completed: true, date: '2024-04-20 16:15', description: 'Nouveau NVR envoyé' },
      { name: 'Avoir reçu', completed: true, date: '2024-04-22 11:30', description: 'NVR neuf reçu de remplacement' },
      { name: 'Retour clôturé', completed: true, date: '2024-04-22 15:30', description: 'Module réintégré en stock' }
    ],
    history: [
      { id: 'h1', date: '2024-04-18 11:20', action: 'Création du retour suite à échec de test firmware', user: 'Amine.T' },
      { id: 'h2', date: '2024-04-18 12:00', action: 'Validation de l\'envoi de l\'appareil', user: 'Amine.T' },
      { id: 'h3', date: '2024-04-22 15:30', action: 'Réception du nouveau matériel, clôture de la fiche RMA', user: 'Amine.T' }
    ]
  },
  {
    id: 'ret-005',
    reference: 'RF-2024-005',
    supplierName: 'MikroTik Distri',
    date: '2024-04-20 15:45',
    validationDate: '2024-04-20 16:00',
    motif: 'Avoir',
    warehouseName: 'Dépôt Alger',
    responsible: 'Samir.M',
    status: 'Validé',
    comment: 'Routeur MikroTik retourné pour remboursement / avoir attendu car fin de gamme non supportée.',
    totalQty: 1,
    totalValue: 8000,
    products: [
      {
        id: 'p5',
        reference: 'ROUT-MIK',
        name: 'Routeur MikroTik hEX lite',
        qty: 1,
        locationName: 'ALGER-A1',
        condition: 'Neuf',
        isSerialized: true,
        serialNumbers: ['SN-MIK-9003'],
        reason: 'Matériel non conforme au cahier des charges client (fin de vie)',
        decision: 'Avoir'
      }
    ],
    documents: [
      { id: 'doc-009', type: 'Bon de retour fournisseur', name: 'RF-MikroTik_Return.pdf', size: '250 KB' }
    ],
    tracking: [
      { name: 'Retour envoyé', completed: true, date: '2024-04-21 08:30', description: 'Expédié via colissimo' },
      { name: 'Reçu par fournisseur', completed: true, date: '2024-04-23 15:00', description: 'Reçu en centre de service' },
      { name: 'Diagnostic fournisseur', completed: true, date: '2024-04-24 10:00', description: 'Conformité acceptée' },
      { name: 'Échange accepté', completed: false },
      { name: 'Avoir reçu', completed: false },
      { name: 'Retour clôturé', completed: false }
    ],
    history: [
      { id: 'h1', date: '2024-04-20 15:45', action: 'Création de la fiche de retour', user: 'Samir.M' },
      { id: 'h2', date: '2024-04-20 16:00', action: 'Validation de la radiation du stock physique', user: 'Samir.M' }
    ]
  },
  {
    id: 'ret-006',
    reference: 'RF-2024-006',
    supplierName: 'Nexans Tunisie',
    date: '2024-04-22 09:30',
    motif: 'Panne',
    warehouseName: 'Dépôt Principal',
    responsible: 'Ahmed.K',
    status: 'Annulé',
    comment: 'Câble Cat6 non sérialisé retourné partiellement à Nexans par erreur d\'aiguillage logistique.',
    totalQty: 1,
    totalValue: 95000,
    products: [
      {
        id: 'p6',
        reference: 'CAB-RJ45-C6',
        name: 'Câble réseau Cat6 Nexans 305m',
        qty: 1,
        locationName: 'RAYON-D1',
        condition: 'Neuf',
        isSerialized: false,
        reason: 'Mauvais de conditionnement par erreur d\'inventaire',
        decision: 'Remboursement'
      }
    ],
    documents: [],
    tracking: [
      { name: 'Retour envoyé', completed: false },
      { name: 'Reçu par fournisseur', completed: false },
      { name: 'Diagnostic fournisseur', completed: false },
      { name: 'Échange accepté', completed: false },
      { name: 'Avoir reçu', completed: false },
      { name: 'Retour clôturé', completed: false }
    ],
    history: [
      { id: 'h1', date: '2024-04-22 09:30', action: 'Création du brouillon de réexpédition', user: 'Ahmed.K' },
      { id: 'h2', date: '2024-04-22 09:50', action: 'Annulation du retour (Erreur d\'aiguillage : le touret est finalement conservé)', user: 'Ahmed.K' }
    ]
  }
];
