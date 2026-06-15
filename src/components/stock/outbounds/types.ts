import { LocationType } from '../locations/types';

export type OutboundStatus = 'Brouillon' | 'Validée' | 'Écart détecté' | 'Annulée';
export type OutboundDestinationType = 'Projet' | 'Client' | 'Technicien' | 'SAV' | 'Perte/Casse';

export interface OutboundProduct {
  id: string;
  lineId?: string;
  reference: string;
  name: string;
  family?: string;
  qtyRequested: number;
  qtyOut: number;
  qtyReturned?: number;
  price: number;
  locationId?: string;
  locationName?: string;
  condition: 'Neuf' | 'Occasion' | 'Abîmé';
  isSerialized: boolean;
  serialNumbers?: string[];
  status: 'Prêt' | 'Manquant' | 'Sorti' | 'Retourné';
}

export interface OutboundDocument {
  id: string;
  type: string;
  name: string;
  url?: string;
}

export interface OutboundHistory {
  id: string;
  date: string;
  action: string;
  user: string;
}

export interface StockOutbound {
  id: string;
  reference: string;
  destinationType: OutboundDestinationType;
  destinationName: string; // Project Name, Client Name, Technician Name, etc.
  date: string;
  validationDate?: string;
  warehouseId: string;
  warehouseName: string;
  responsible: string;
  status: OutboundStatus;
  reason?: string;
  reservationReference?: string;
  products: OutboundProduct[];
  documents?: OutboundDocument[];
  history: OutboundHistory[];
  totalQty: number;
  totalReturned?: number;
  totalValue: number;
  exitVoucher?: { id: string; number: string; status: string; created_at?: string };
  returnVouchers?: Array<{ id: string; number: string; status: string; created_at?: string }>;
  returns?: Array<{ id: string; reference: string; date: string; reason: string; status: string }>;
  sourceWarehouse?: string;
}
