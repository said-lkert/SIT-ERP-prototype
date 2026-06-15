import { LocationType } from '../locations/types';

export type MovementType = 'Entrée' | 'Sortie' | 'Transfert' | 'Correction' | 'Réservation' | 'Retour fournisseur' | 'Retour client' | 'SAV';
export type MovementStatus = 'Validé' | 'Brouillon' | 'Annulé' | 'Écart détecté';

export interface MovementProduct {
  id: string;
  reference: string;
  name: string;
  family?: string;
  isSerialized: boolean;
  stockBefore: number;
  stockAfter: number;
}

export interface MovementLocation {
  id: string;
  name: string;
  type: LocationType;
  depot?: string;
  zone?: string;
  allee?: string;
  rayon?: string;
  etagere?: string;
}

export interface MovementSerialNumber {
  number: string;
  oldStatus: string;
  newStatus: string;
  currentLocationId: string;
}

export interface MovementAudit {
  id: string;
  date: string;
  action: string;
  user: string;
  details?: string;
}

export interface StockMovement {
  id: string;
  reference: string;
  type: MovementType;
  status: MovementStatus;
  date: string;
  validationDate?: string;
  responsible: string;
  quantity: number;
  value?: number;
  product: MovementProduct;
  source: {
    type: 'Fournisseur' | 'Emplacement' | 'Réception' | 'Projet' | 'Client' | 'Ajustement';
    name: string;
    locationId?: string;
    responsible?: string;
  };
  destination: {
    type: 'Emplacement' | 'Projet' | 'Client' | 'SAV' | 'Ajustement' | 'Fournisseur';
    name: string;
    locationId?: string;
    responsible?: string;
  };
  linkedDocument: {
    type: 'Bon d\'entrée' | 'Bon de sortie' | 'Réception fournisseur' | 'Retour fournisseur' | 'Correction inventaire' | 'Réservation projet';
    reference: string;
    url?: string;
  };
  comment?: string;
  serialNumbers?: MovementSerialNumber[];
  history: MovementAudit[];
}
