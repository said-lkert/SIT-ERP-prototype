import { ProjetClient } from './types';

export const MOCK_PROJETS_CLIENTS: ProjetClient[] = [
  {
    id: 'PRJ-24-012',
    reference: 'PRJ-24-012',
    name: 'Installation Vidéosurb. - Hôtel Atlas',
    description: 'Système complet de protection périmétrique et intérieure avec reconnaissance faciale aux accès critiques.',
    clientName: 'Hôtel Atlas Marrakech',
    siteName: 'Main Resort - Zone A & B',
    responsibleName: 'Yassir Berrada',
    contactClient: 'Samir Lahlou (Directeur Technique)',
    scope: 'Fourniture, pose et mise en service de 42 caméras 4K, 2 NVR 64 canaux, et formation du personnel sécurité.',
    objectives: 'Sécurisation des points d\'accès, surveillance du parking 24h/24 et intégration avec le système incendie.',
    startDate: '2026-05-15',
    deadline: '2026-06-30',
    progress: 68,
    status: 'En cours',
    priority: 'Haute',
    jalons: [
      { id: 'j1', label: 'Étude et validation technique', date: '2026-05-18', responsible: 'Y. Berrada', status: 'Terminé' },
      { id: 'j2', label: 'Préparation du matériel', date: '2026-05-22', responsible: 'M. Magasinier', status: 'Terminé' },
      { id: 'j3', label: 'Livraison sur site', date: '2026-05-25', responsible: 'Logistique Atlas', status: 'Terminé' },
      { id: 'j4', label: 'Installation câblage Zone A', date: '2026-06-02', responsible: 'Équipe Tech 1', status: 'Terminé' },
      { id: 'j5', label: 'Installation caméras Zone B', date: '2026-06-15', responsible: 'Équipe Tech 2', status: 'En cours' },
      { id: 'j6', label: 'Configuration Logicielle', date: '2026-06-22', responsible: 'Consultant IT', status: 'À faire' },
      { id: 'j7', label: 'Réception client', date: '2026-06-30', responsible: 'S. Lahlou', status: 'À faire' }
    ],
    produits: [
      { id: 'p1', name: 'Caméra Dome 4K IP', requested: 42, reserved: 42, shipped: 28, available: true, status: 'En cours de pose' },
      { id: 'p2', name: 'NVR 64 Channels Platinum', requested: 2, reserved: 2, shipped: 2, available: true, status: 'Installé' },
      { id: 'p3', name: 'Switch PoE+ 24 Ports Managed', requested: 4, reserved: 4, shipped: 4, available: true, status: 'Configuré' },
      { id: 'p4', name: 'Disque Dur 12TB SkyHawk', requested: 8, reserved: 6, shipped: 0, available: false, status: 'Rupture stock' }
    ],
    services: [
      { id: 's1', label: 'Main d\'œuvre Installation', duration: '120h', skill: 'Technicien Senior', assignedTo: 'Ahmed K.', status: 'En cours' },
      { id: 's2', label: 'Audit & Optimisation Réseau', duration: '16h', skill: 'Expert Réseau', assignedTo: 'Sara L.', status: 'Terminé' },
      { id: 's3', label: 'Formation Utilisateurs', duration: '4h', skill: 'Formateur', assignedTo: 'Laila M.', status: 'Planifié' }
    ],
    budget: {
      planned: 45000,
      materialCost: 28400,
      serviceCost: 12500,
      otherCosts: 1200,
      consumed: 32000
    },
    team: [
      { id: 't1', name: 'Yassir Berrada', role: 'Chef de Projet', availability: 'Libre' },
      { id: 't2', name: 'Karim Mansour', role: 'Commercial', availability: 'Libre' },
      { id: 't3', name: 'Mohamed Drissi', role: 'Magasinier', availability: 'Occupé' },
      { id: 't4', name: 'Ahmed Khalid', role: 'Technicien Senior', availability: 'Sur Site' }
    ],
    documents: [
      { id: 'd1', name: 'Devis_Atlas_V2.pdf', type: 'Devis', version: '2.0', date: '2026-05-10', status: 'Validé' },
      { id: 'd2', name: 'CDC_Vidéosurveillance.doc', type: 'Cahier des charges', version: '1.2', date: '2026-05-12', status: 'Validé' },
      { id: 'd3', name: 'Plan_Implantation_ZoneA.dwg', type: 'Plan', version: '3.1', date: '2026-05-20', status: 'À jour' },
      { id: 'd4', name: 'Rapport_Intervention_W22.pdf', type: 'Rapport', version: '1.0', date: '2026-06-01', status: 'Signé' }
    ],
    alertes: [
      { id: 'a1', type: 'danger', message: 'Rupture de stock sur Disques Purs 12TB - 2 unités manquantes pour finalisation NVR 2.' },
      { id: 'a2', type: 'warning', message: 'Jalon "Installation caméras Zone B" en retard de 2 jours.' }
    ]
  },
  {
    id: 'PRJ-24-001',
    reference: 'PRJ-24-001',
    name: 'Déploiement Vidéosurb. Site A',
    description: 'Installation de 20 caméras IP et configuration du NVR.',
    clientName: 'TechCorp Industries',
    siteName: 'Site Alpha',
    responsibleName: 'Jean Dupont',
    contactClient: 'Paul Martin',
    scope: 'Installation standard',
    objectives: 'Surveillance périmétrique',
    startDate: '2026-05-01',
    deadline: '2026-06-15',
    progress: 75,
    status: 'En cours',
    priority: 'Haute'
  },
  // ... Rest can be simplified for brevity or kept
  {
    id: 'PRJ-24-002',
    reference: 'PRJ-24-002',
    name: 'Refonte Réseau Siège',
    description: 'Remplacement des baies de brassage et switches cœur.',
    clientName: 'Banque Nationale',
    siteName: 'Siège Central',
    responsibleName: 'Alice Martin',
    contactClient: 'Marie Curie',
    scope: 'Réseau core',
    objectives: 'Performance LAN',
    startDate: '2026-04-01',
    deadline: '2026-05-30',
    progress: 100,
    status: 'Terminé',
    priority: 'Critique'
  }
];
