import { TechDocument, DocumentAlert } from './types';

export const MOCK_PRODUCTS = [
  "Cisco SG350-28P",
  "Hikvision DS-2CD2143",
  "HP ProBook 450",
  "Ubiquiti UniFi AP",
  "Mikrotik RB750Gr3"
];

export const MOCK_CLIENTS = [
  "Sonatrach Alger",
  "Cevital Bejaia",
  "Air Algérie Siège",
  "Sonelgaz Oran",
  "Naftal Constantine"
];

export const MOCK_TYPES = [
  "Fiche technique",
  "Manuel d'installation",
  "Procédure interne",
  "Schéma réseau",
  "Certificat",
  "Rapport d'intervention",
  "PV d'installation",
  "Photo",
  "Licence",
  "Garantie",
  "Guide de configuration"
];

export const MOCK_DOCUMENTS: TechDocument[] = [
  {
    id: 'doc-1',
    name: 'Manuel d\'installation Cisco SG350',
    type: 'Manuel d\'installation',
    fileExt: 'pdf',
    linkedElement: { type: 'produit', name: 'Cisco SG350-28P' },
    version: 'v2.1',
    status: 'Actif',
    dateAdded: '12/03/2025'
  },
  {
    id: 'doc-2',
    name: 'Schéma réseau Sonatrach Alger',
    type: 'Schéma réseau',
    fileExt: 'pdf',
    linkedElement: { type: 'client', name: 'Sonatrach Alger' },
    version: 'v1.0',
    status: 'Actif',
    dateAdded: '28/01/2025'
  },
  {
    id: 'doc-3',
    name: 'PV installation switch salle serveur',
    type: 'PV d\'installation',
    fileExt: 'pdf',
    linkedElement: { type: 'equipement', name: 'Équip. #EQ-00234' },
    version: 'v1.0',
    status: 'Actif',
    dateAdded: '05/04/2025'
  },
  {
    id: 'doc-4',
    name: 'Certificat de garantie HP ProBook',
    type: 'Certificat',
    fileExt: 'pdf',
    linkedElement: { type: 'produit', name: 'HP ProBook 450' },
    version: 'v1.0',
    status: 'À vérifier',
    dateAdded: '14/11/2024'
  },
  {
    id: 'doc-5',
    name: 'Procédure configuration VPN',
    type: 'Procédure interne',
    fileExt: 'word',
    linkedElement: { type: 'aucun', name: '—' },
    version: 'v3.0',
    status: 'Actif',
    dateAdded: '02/02/2025'
  },
  {
    id: 'doc-6',
    name: 'Fiche technique Hikvision DS-2CD2143',
    type: 'Fiche technique',
    fileExt: 'pdf',
    linkedElement: { type: 'produit', name: 'Hikvision DS-2CD2143' },
    version: 'v1.2',
    status: 'Actif',
    dateAdded: '19/09/2024'
  },
  {
    id: 'doc-7',
    name: 'Rapport intervention Cevital mars',
    type: 'Rapport d\'intervention',
    fileExt: 'word',
    linkedElement: { type: 'client', name: 'Cevital Bejaia' },
    version: 'v1.0',
    status: 'Actif',
    dateAdded: '31/03/2025'
  },
  {
    id: 'doc-8',
    name: 'Licence Kaspersky Endpoint 2025',
    type: 'Licence',
    fileExt: 'pdf',
    linkedElement: { type: 'numero_serie', name: 'SN-KSP-00412' },
    version: 'v1.0',
    status: 'À vérifier',
    dateAdded: '01/01/2025'
  },
  {
    id: 'doc-9',
    name: 'Photo installation AP UniFi bureau 3',
    type: 'Photo',
    fileExt: 'image',
    linkedElement: { type: 'equipement', name: 'Équip. #EQ-00189' },
    version: 'v1.0',
    status: 'Actif',
    dateAdded: '22/02/2025'
  },
  {
    id: 'doc-10',
    name: 'Guide configuration Mikrotik RB750',
    type: 'Guide de configuration',
    fileExt: 'pdf',
    linkedElement: { type: 'produit', name: 'Mikrotik RB750Gr3' },
    version: 'v2.0',
    status: 'Brouillon',
    dateAdded: '10/04/2025'
  }
];

export const MOCK_ALERTS: DocumentAlert[] = [
  {
    id: 'alert-1',
    message: '4 documents marqués À vérifier',
    type: 'warning',
    filterAction: () => console.log('Filter: To verify')
  },
  {
    id: 'alert-2',
    message: '2 documents sans lien depuis plus de 30 jours',
    type: 'error',
    filterAction: () => console.log('Filter: Unlinked')
  },
  {
    id: 'alert-3',
    message: '3 nouveaux PV d\'installation ajoutés cette semaine',
    type: 'info',
    filterAction: () => console.log('Filter: New PV')
  }
];
