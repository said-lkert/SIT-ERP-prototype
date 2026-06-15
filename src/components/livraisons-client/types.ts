export type LivraisonStatus = 
  | 'Brouillon'
  | 'À préparer'
  | 'Prête'
  | 'En cours'
  | 'Livrée'
  | 'Partiellement livrée'
  | 'Refusée'
  | 'Annulée'
  | 'Avec anomalie';

export interface LivraisonProduct {
  id: string;
  productId: string;
  productReference: string;
  productName: string;
  requestedQty: number;
  deliveredQty: number;
}

export interface ClientLivraison {
  id: string;
  reference: string;
  deliverySlipNumber: string; // Bon de livraison
  sourceOutboundReference?: string; // Bon de sortie utilise
  clientName: string;
  projectName: string;
  deliverySite: string;
  warehouse: string;
  status: LivraisonStatus;
  products: LivraisonProduct[];
  carrier: string; // transporteur ou livreur
  responsible: string;
  plannedDate: string;
  actualDate?: string;
  createdAt: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  priority?: string;
  comment?: string;
  authorizedPerson?: string;
  expeditionReference?: string;
  transportMode?: string;
}
