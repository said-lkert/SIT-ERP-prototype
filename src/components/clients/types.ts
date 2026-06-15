export type ClientStatus = 'Actif' | 'Inactif' | 'Archivé';
export type ClientType = 'Entreprise' | 'Administration' | 'Hôtel' | 'École' | 'Particulier';
export type SectorType = 'IT' | 'Industrie' | 'Hôtellerie' | 'Éducation' | 'Santé' | 'Services' | 'Autre';

export interface ClientSite {
  id: string;
  name: string;
  address: string;
  city: string;
  type: 'Siège' | 'Agence' | 'Hôtel' | 'Entrepôt' | 'Chantier';
  installedEquipments: number;
}

export interface ClientProject {
  id: string;
  reference: string;
  name: string;
  status: 'Devis' | 'Validé' | 'En cours' | 'Terminé';
  expectedDate: string;
}

export interface ClientHistoryEvent {
  id: string;
  type: 'creation' | 'project' | 'delivery' | 'installation' | 'sav' | 'document';
  date: string;
  title: string;
  user: string;
}

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  status: ClientStatus;
  sector: SectorType;
  mainContact: string;
  phone: string;
  email: string;
  sitesCount: number;
  activeProjects: number;
  installedEquipments: number;
  address: string;
  city: string;
  region: string;
  hasExpiredWarranties: boolean;
  createdAt: string;
  reference?: string;
  sites?: ClientSite[];
  projects?: ClientProject[];
  history?: ClientHistoryEvent[];
}
