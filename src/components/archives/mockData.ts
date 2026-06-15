import { ArchiveItem } from './types';

export const MOCK_ARCHIVES: ArchiveItem[] = [
  // Référentiel - Produits (2)
  {
    id: 'a1',
    name: 'Caméra IP Hikvision 2MP',
    reference: 'PRD-0012',
    type: 'Produit',
    module: 'Produits',
    family: 'Référentiel',
    archivedAt: '2024-05-12T10:30:00Z',
    archivedBy: 'Admin',
    reason: 'Obsolète, remplacé par PRD-0015',
    status: 'Restaurable',
    isRestorable: true,
    isProtected: false,
    originalData: {
      designation: 'Caméra IP Dôme 2MP IR 30m',
      marque: 'Hikvision',
      famille: 'CCTV',
      etatAvantArchivage: 'Actif',
      qteIndicative: 0
    }
  },
  {
    id: 'a2',
    name: 'Câble Réseau FTP Cat5e (Bobine 305m)',
    reference: 'CAB-FTP-5E',
    type: 'Produit',
    module: 'Produits',
    family: 'Référentiel',
    archivedAt: '2023-11-05T09:15:00Z',
    archivedBy: 'Jean Dupont',
    reason: 'Fin de commercialisation',
    status: 'Archivé',
    isRestorable: true,
    isProtected: false,
    originalData: {
      designation: 'Bobine 305m FTP Cat5e',
      marque: 'Generic',
      famille: 'Réseau',
      etatAvantArchivage: 'En rupture',
      qteIndicative: 0
    }
  },
  // Référentiel - Service (1)
  {
    id: 'a3',
    name: 'Contrat Maintenance Standard',
    reference: 'SRV-004',
    type: 'Service',
    module: 'Services',
    family: 'Référentiel',
    archivedAt: '2024-01-20T14:20:00Z',
    archivedBy: 'Sophie Martin',
    reason: 'Offre remplacée par version 2.0',
    status: 'Restaurable',
    isRestorable: true,
    isProtected: false,
    originalData: {
      designation: 'Maintenance préventive annuelle',
      type: 'Contrat',
      cout: 'Varie selon parc',
      etatAvantArchivage: 'Actif'
    }
  },
  // Référentiel - Fournisseur (1)
  {
    id: 'a4',
    name: 'Hikvision Algérie',
    reference: 'FOUR-0004',
    type: 'Fournisseur',
    module: 'Fournisseurs',
    family: 'Référentiel',
    archivedAt: '2022-08-11T11:00:00Z',
    archivedBy: 'Admin',
    reason: 'Changement de distributeur exclusif',
    status: 'Lecture seule',
    isRestorable: false,
    isProtected: true,
    originalData: {
      raisonSociale: 'Hikvision ALGERIA SARL',
      contact: 'contact@hikvision.dz',
      statutAvantArchivage: 'Actif',
      commandesAssociees: 45
    }
  },
  // Référentiel - Client (1)
  {
    id: 'a5',
    name: 'SARL Alpha Construction',
    reference: 'CLI-0022',
    type: 'Client',
    module: 'Clients',
    family: 'Référentiel',
    archivedAt: '2023-12-01T15:45:00Z',
    archivedBy: 'Ahmed.K',
    reason: 'Société dissoute',
    status: 'Archivé',
    isRestorable: false,
    isProtected: true,
    originalData: {
      nom: 'Alpha Construction',
      contacts: 'M. Ali',
      projetsAssocies: 2,
      parcInstalle: '12 équipements'
    }
  },
  // Stock & Logistique (3)
  {
    id: 'a6',
    name: 'Commande Visiophones Dahua',
    reference: 'CF-2023-018',
    type: 'Commande fournisseur',
    module: 'Commandes Fournisseur',
    family: 'Stock & Logistique',
    archivedAt: '2023-06-15T09:00:00Z',
    archivedBy: 'Système',
    reason: 'Annulée avant validation',
    status: 'Archivé',
    isRestorable: false,
    isProtected: false,
    originalData: {
      fournisseur: 'Dahua Dist. DZ',
      montant: '250 000 DA',
      etatAvantArchivage: 'Brouillon'
    }
  },
  {
    id: 'a7',
    name: 'Bon de réception BR-045',
    reference: 'BR-2023-045',
    type: 'Réception',
    module: 'Réceptions',
    family: 'Stock & Logistique',
    archivedAt: '2023-07-22T16:30:00Z',
    archivedBy: 'Admin',
    reason: 'Archivage légal terminé',
    status: 'Conservation obligatoire',
    isRestorable: false,
    isProtected: true,
    originalData: {
      fournisseur: 'TechDistrib',
      articles: 14,
      valeur: '1 250 000 DA',
      dateReception: '2022-07-20'
    }
  },
  {
    id: 'a8',
    name: 'Sortie Matériel Projet X',
    reference: 'BS-2024-012',
    type: 'Sortie de stock',
    module: 'Sorties Stock',
    family: 'Stock & Logistique',
    archivedAt: '2024-03-30T10:15:00Z',
    archivedBy: 'Jean Dupont',
    reason: 'Annulée pour modification',
    status: 'Restaurable',
    isRestorable: true,
    isProtected: false,
    originalData: {
      projetId: 'PRJ-0044',
      articles: 5,
      etatAvantArchivage: 'Annulé'
    }
  },
  // Projets & Affaires (1)
  {
    id: 'a9',
    name: 'Installation vidéosurveillance',
    reference: 'PRJ-0021',
    type: 'Projet client',
    module: 'Projets clients',
    family: 'Projets & Affaires',
    archivedAt: '2022-12-05T14:00:00Z',
    archivedBy: 'Sophie Martin',
    reason: 'Projet clôturé et réceptionné',
    status: 'Conservation obligatoire',
    isRestorable: false,
    isProtected: true,
    originalData: {
      client: 'Hôpital Central',
      site: 'Bâtiment B',
      responsable: 'Karim.B',
      etatFinal: 'Terminé',
      budget: '3 500 000 DA',
      dates: '01/09/2022 - 30/11/2022'
    }
  },
  // Parc Client & SAV (2)
  {
    id: 'a10',
    name: 'Switch PoE 24 ports - Agence Centre',
    reference: 'EQP-SW-089',
    type: 'Équipement',
    module: 'Parc Client',
    family: 'Parc Client & SAV',
    archivedAt: '2024-04-10T11:20:00Z',
    archivedBy: 'Tech1',
    reason: 'Remplacé suite à panne orage',
    status: 'Archivé',
    isRestorable: false,
    isProtected: true,
    originalData: {
      produit: 'Switch 24p PoE',
      client: 'Banque XYZ',
      site: 'Agence Centre Ville',
      sn: 'SN-SW-887654',
      dateInstallation: '2021-03-15',
      etatAvantRetrait: 'En panne (Garantie échue)'
    }
  },
  {
    id: 'a11',
    name: 'Intervention N° 1004',
    reference: 'INT-SAV-1004',
    type: 'Intervention',
    module: 'Interventions SAV',
    family: 'Parc Client & SAV',
    archivedAt: '2023-09-20T17:00:00Z',
    archivedBy: 'Admin',
    reason: 'Clôturée administrativement',
    status: 'Lecture seule',
    isRestorable: false,
    isProtected: false,
    originalData: {
      client: 'Pharmacie Centrale',
      type: 'Dépannage',
      statusFinal: 'Résolu',
      technicien: 'Ali.T'
    }
  },
  // Administration (1)
  {
    id: 'a12',
    name: 'Compte - Mohamed Ali',
    reference: 'USR-0034',
    type: 'Utilisateur',
    module: 'Utilisateurs',
    family: 'Administration',
    archivedAt: '2024-01-30T10:00:00Z',
    archivedBy: 'Admin',
    reason: 'Départ de la société',
    status: 'Archivé',
    isRestorable: true,
    isProtected: false,
    originalData: {
      email: 'm.ali@entreprise.com',
      role: 'Technicien N1',
      dateEmbauche: '2020-05-10',
      etatAvantArchivage: 'Actif'
    }
  }
];
