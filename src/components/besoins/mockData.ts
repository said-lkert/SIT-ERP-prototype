import { Besoin } from './types';

export const MOCK_BESOINS: Besoin[] = [
  {
    id: 'BSN-26-001',
    reference: 'BSN-26-001',
    projectId: 'PRJ-26-001',
    projectName: 'Hôtel Atlas - Rénovation Vidéo',
    clientId: 'CL-001',
    clientName: 'Hôtel Atlas Marrakech',
    site: 'Marrakech - Guéliz',
    responsible: 'Yassir Berrada',
    createdAt: '2026-05-15',
    plannedDate: '2026-06-15',
    priority: 'Haute',
    status: 'Partiellement couvert',
    impactProject: 'Risque de retard',
    justification: 'Mise à niveau complète du système de surveillance vers la 4K.',
    internalComment: 'Attention au délai de livraison des caméras spécifiques.',
    isUrgent: true,
    totalCoverageRate: 65,
    products: [
      {
        id: 'P1',
        label: 'Caméra IP Dome 4K HDR',
        reference: 'CAM-DOM-4K-V2',
        requestedQty: 12,
        availableQty: 8,
        reservedQty: 8,
        missingQty: 4,
        location: 'ENT-MAR-A12',
        status: 'Partiellement réservé',
        isSerialized: true,
        serializedCount: 8
      },
      {
        id: 'P2',
        label: 'Enregistreur NVR 32CH 4K',
        reference: 'NVR-32-PRO',
        requestedQty: 1,
        availableQty: 1,
        reservedQty: 1,
        missingQty: 0,
        location: 'ENT-MAR-B05',
        status: 'Réservé'
      },
      {
        id: 'P3',
        label: 'Switch PoE+ 24 Port Gigabit',
        reference: 'SW-POE-24-G',
        requestedQty: 2,
        availableQty: 2,
        reservedQty: 2,
        missingQty: 0,
        location: 'ENT-MAR-C01',
        status: 'Réservé'
      },
      {
        id: 'P4',
        label: 'Câble Ethernet Cat6 FTP',
        reference: 'CAB-CAT6-FTP',
        requestedQty: 2,
        availableQty: 5,
        reservedQty: 2,
        missingQty: 0,
        location: 'ENT-MAR-D10',
        status: 'Réservé'
      }
    ],
    services: [
      {
        id: 'S1',
        label: 'Installation & Tirage Câbles',
        plannedDuration: 48,
        unit: 'H',
        requiredSkill: 'Technicien Courant Faible',
        assignedResource: 'Équipe Tech A',
        plannedDate: '2026-06-10',
        estimatedCost: 2400,
        status: 'Planifié'
      },
      {
        id: 'S2',
        label: 'Configuration Système & Réseau',
        plannedDuration: 16,
        unit: 'H',
        requiredSkill: 'Ingénieur Sécurité',
        assignedResource: undefined,
        plannedDate: '2026-06-14',
        estimatedCost: 1200,
        status: 'À affecter'
      },
      {
        id: 'S3',
        label: 'Tests & Mise en Service',
        plannedDuration: 8,
        unit: 'H',
        requiredSkill: 'Ingénieur Sécurité',
        assignedResource: undefined,
        plannedDate: '2026-06-15',
        estimatedCost: 600,
        status: 'Attente configuration'
      }
    ],
    substitutions: [
      {
        id: 'SUB1',
        originalLabel: 'Support Mural Standard',
        substitutedLabel: 'Support Mural Articulé Premium',
        type: 'Produit',
        impactCost: 'Augmentation',
        impactDelay: 'Neutre',
        compliance: 'Équivalent',
        reason: 'Modèle standard en rupture, version premium disponible en stock.'
      }
    ],
    history: [
      { id: 'H1', date: '2026-05-15 09:00', type: 'Création', user: 'Yassir Berrada', description: 'Création du dossier de besoin pour le projet Atlas.' },
      { id: 'H2', date: '2026-05-16 14:20', type: 'Validation', user: 'Admin', description: 'Validation technique des ressources demandées.' },
      { id: 'H3', date: '2026-05-20 11:00', type: 'Réservation', user: 'Système', description: 'Réservation automatique de 8 caméras et du NVR.' },
      { id: 'H4', date: '2026-05-22 10:30', type: 'Substitution', user: 'Yassir Berrada', description: 'Validation du support articulé en remplacement du standard.' }
    ]
  },
  // Add simplified items for the other 11 to satisfy the requirement of 12 items
  ...Array.from({ length: 11 }).map((_, i) => ({
    id: `BSN-26-00${i + 2}`,
    reference: `BSN-26-00${i + 2}`,
    projectId: `PRJ-ID-${i}`,
    projectName: `Projet de Test ${i + 1}`,
    clientId: `CL-ID-${i}`,
    clientName: `Client ${i + 1}`,
    responsible: 'Alice Martin',
    createdAt: '2026-05-20',
    plannedDate: '2026-07-01',
    priority: (['Basse', 'Moyenne', 'Haute', 'Critique'] as const)[i % 4],
    status: (['Brouillon', 'À valider', 'Validé', 'Partiellement couvert', 'Couvert', 'Bloqué', 'Consommé', 'Annulé'] as const)[i % 8],
    impactProject: (['Aucun blocage', 'Risque de retard', 'Projet bloqué'] as const)[i % 3],
    isUrgent: i % 5 === 0,
    totalCoverageRate: i * 10,
    products: [],
    services: [],
    substitutions: [],
    history: []
  }))
];
