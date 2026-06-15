import { LucideIcon } from 'lucide-react';

export type BesoinType = 'Produit' | 'Service';

export type BesoinStatus = 
  | 'Brouillon'
  | 'À valider'
  | 'Validé'
  | 'Partiellement couvert'
  | 'Couvert'
  | 'Bloqué'
  | 'Consommé'
  | 'Annulé';

export type Priority = 'Basse' | 'Moyenne' | 'Haute' | 'Critique';

export interface BesoinProduct {
  id: string;
  productId?: string;
  label: string;
  reference: string;
  requestedQty: number;
  availableQty: number;
  reservedQty: number;
  missingQty: number;
  location?: string;
  status: string;
  isSerialized?: boolean;
  serializedCount?: number;
}

export interface BesoinService {
  id: string;
  serviceId?: string;
  label: string;
  plannedDuration: number;
  unit: string;
  requiredSkill?: string;
  assignedResource?: string;
  plannedDate: string;
  estimatedCost?: number;
  status: string;
}

export interface Substitution {
  id: string;
  originalLabel: string;
  substitutedLabel: string;
  type: string;
  impactCost: 'Augmentation' | 'Diminution' | 'Neutre';
  impactDelay: 'Retard' | 'Avance' | 'Neutre';
  compliance: 'Conforme' | 'Équivalent' | 'Dégradé';
  reason: string;
}

export interface HistoryEvent {
  id: string;
  date: string;
  type: string;
  user: string;
  description: string;
}

export type ImpactProject = 'Aucun blocage' | 'Risque de retard' | 'Projet bloqué';

export interface Besoin {
  id: string;
  reference: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  site?: string;
  responsible: string;
  createdAt: string;
  plannedDate: string;
  priority: Priority;
  status: BesoinStatus;
  impactProject: ImpactProject;
  
  justification?: string;
  internalComment?: string;

  products: BesoinProduct[];
  services: BesoinService[];
  substitutions: Substitution[];
  history: HistoryEvent[];

  totalCoverageRate: number;
  isUrgent: boolean;
  modificationReason?: string;
}
