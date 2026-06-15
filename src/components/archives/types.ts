export type ArchiveFamily = 'Toutes' | 'Référentiel' | 'Stock & Logistique' | 'Projets & Affaires' | 'Parc Client & SAV' | 'Administration';

export type ArchiveStatus = 'Restaurable' | 'Lecture seule' | 'Conservation obligatoire' | 'Archivé';

export interface ArchiveItemData {
  [key: string]: any;
}

export interface ArchiveItem {
  id: string;
  name: string;
  reference: string;
  type: string;
  module: string;
  family: ArchiveFamily;
  archivedAt: string;
  archivedBy: string;
  reason: string;
  status: ArchiveStatus;
  isRestorable: boolean;
  isProtected: boolean;
  originalData: ArchiveItemData;
}
