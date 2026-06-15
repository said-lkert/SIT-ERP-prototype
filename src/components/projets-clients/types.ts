export type ProjetClientStatus = 'Brouillon' | 'Planifié' | 'En cours' | 'En attente' | 'En retard' | 'Terminé' | 'Annulé';
export type ProjetClientPriority = 'Basse' | 'Moyenne' | 'Haute' | 'Critique';

export interface ProjetJalon {
  id: string;
  label: string;
  date: string;
  responsible: string;
  status: 'Terminé' | 'En cours' | 'À faire' | 'Bloqué';
}

export interface ProjetBesoinProduit {
  id: string;
  name: string;
  requested: number;
  reserved: number;
  shipped: number;
  available: boolean;
  status: string;
}

export interface ProjetBesoinService {
  id: string;
  label: string;
  duration: string;
  skill: string;
  assignedTo: string;
  status: string;
}

export interface ProjetBudget {
  planned: number;
  materialCost: number;
  serviceCost: number;
  otherCosts: number;
  consumed: number;
}

export interface ProjetTeamMember {
  id: string;
  name: string;
  role: string;
  availability: string;
}

export interface ProjetDocument {
  id: string;
  name: string;
  type: string;
  version: string;
  date: string;
  status: string;
}

export interface ProjetAlerte {
  id: string;
  type: 'danger' | 'warning' | 'info';
  message: string;
}

export interface ProjetClient {
  id: string;
  reference: string;
  name: string;
  description: string;
  clientName: string;
  siteName: string;
  responsibleName: string;
  contactClient: string;
  scope: string;
  objectives: string;
  startDate: string;
  deadline: string;
  progress: number;
  status: ProjetClientStatus;
  priority: ProjetClientPriority;
  clientId?: string;
  
  // Detailed fields
  jalons?: ProjetJalon[];
  produits?: ProjetBesoinProduit[];
  services?: ProjetBesoinService[];
  budget?: ProjetBudget;
  team?: ProjetTeamMember[];
  documents?: ProjetDocument[];
  alertes?: ProjetAlerte[];
}
