export type ReturnStatus = 'Brouillon' | 'En attente' | 'Validé' | 'Clôturé' | 'Annulé';
export type ReturnReason = 'Panne' | 'Abîmé à la réception' | 'Erreur de livraison' | 'Garantie' | 'Échange' | 'Avoir';
export type ReturnDecision = 'Échange' | 'Remboursement' | 'Réparation' | 'Avoir';

export interface ReturnProduct {
  id: string;
  reference: string;
  name: string;
  qty: number;
  locationName: string;
  condition: 'Neuf' | 'Occasion' | 'Abîmé';
  isSerialized: boolean;
  serialNumbers?: string[];
  reason: string;
  decision: ReturnDecision;
  isLinkedToInstalledEquipment?: boolean;
}

export interface ReturnDocument {
  id: string;
  type: string;
  name: string;
  url?: string;
  size?: string;
}

export interface ReturnTrackingStep {
  name: string;
  completed: boolean;
  date?: string;
  description?: string;
}

export interface ReturnHistory {
  id: string;
  date: string;
  action: string;
  user: string;
}

export interface SupplierReturn {
  id: string;
  reference: string;
  supplierName: string;
  date: string;
  validationDate?: string;
  motif: ReturnReason;
  linkedReceipt?: string; // Reference of linked reception/order
  warehouseName: string; // Emplacement source principal
  responsible: string;
  status: ReturnStatus;
  comment?: string;
  products: ReturnProduct[];
  documents: ReturnDocument[];
  tracking: ReturnTrackingStep[];
  history: ReturnHistory[];
  totalQty: number;
  totalValue: number; // estimated credit invoice / refund
}
