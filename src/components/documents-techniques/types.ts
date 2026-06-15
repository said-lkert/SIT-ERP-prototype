export type DocumentType = 'Fiche technique' | 'Manuel d\'installation' | 'Procédure interne' | 'Schéma réseau' | 'Certificat' | 'Rapport d\'intervention' | 'PV d\'installation' | 'Photo' | 'Licence' | 'Garantie' | 'Guide de configuration';

export type LinkedElementType = 'produit' | 'client' | 'equipement' | 'numero_serie' | 'aucun';

export type DocumentStatus = 'Actif' | 'À vérifier' | 'Archivé' | 'Brouillon' | 'Remplacé';

export interface TechDocument {
  id: string;
  name: string;
  type: DocumentType;
  fileExt: string;
  linkedElement: {
    type: LinkedElementType;
    name: string;
  };
  version: string;
  status: DocumentStatus;
  dateAdded: string;
}

export interface DocumentAlert {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'info';
  filterAction: () => void;
}
