export type ReservationStatus = 
  | 'Brouillon'
  | 'En attente'
  | 'Partiellement réservée'
  | 'Réservée'
  | 'Consommée'
  | 'Libérée'
  | 'Annulée'
  | 'Expirée';

export type ReservationPriority = 'Basse' | 'Normale' | 'Haute' | 'Urgent';

export interface ReservationProduct {
  id: string;
  productId: string;
  productReference: string;
  productName: string;
  requestedQty: number;
  reservedQty: number;
  missingQty: number;
  warehouse: string;
  location: string;
  remainingQty?: number;
  consumedQty?: number;
}

export interface StockReservation {
  id: string;
  reference: string;
  projectName: string;
  clientName: string;
  products: ReservationProduct[];
  totalRequestedQty: number;
  totalReservedQty: number;
  status: ReservationStatus;
  priority: ReservationPriority;
  plannedDate: string;
  createdAt: string;
  responsible: string;
  projectId?: string;
  documents?: Array<{
    id: string;
    type: string;
    number: string;
    status: string;
    createdAt?: string;
  }>;
}
