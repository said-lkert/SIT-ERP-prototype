import { LocationType } from '../locations/types';

export type ReceiptStatus = 'Brouillon' | 'Validée' | 'Écart détecté' | 'Annulée';
export type ProductCondition = 'Conforme' | 'Abîmé' | 'Manquant' | 'Partiel';

export interface ReceiptProduct {
  id: string;
  reference: string;
  name: string;
  family?: string;
  qtyOrdered: number;
  qtyReceived: number;
  purchasePrice: number;
  locationId?: string;
  locationName?: string;
  condition: ProductCondition;
  isSerialized: boolean;
  serialNumbers?: string[];
  hasGap?: boolean;
}

export interface ReceiptGap {
  id: string;
  type: 'Quantité manquante' | 'Produit abîmé' | 'Produit non commandé' | 'Document absent' | 'Numéro de série manquant';
  productName?: string;
  comment: string;
}

export interface ReceiptDocument {
  id: string;
  type: string;
  name: string;
  url?: string;
}

export interface EntryVoucher {
  id: string;
  number: string;
  status: string;
  createdAt: string;
}

export interface ReceiptHistory {
  id: string;
  date: string;
  action: string;
  user: string;
}

export interface SupplierReceipt {
  id: string;
  reference: string;
  supplierId: string;
  supplierName: string;
  date: string;
  validationDate?: string;
  deliveryNoteRef: string;
  supplierInvoiceRef?: string;
  purchaseOrderRef: string;
  warehouseId: string;
  warehouseName: string;
  responsible: string;
  status: ReceiptStatus;
  products: ReceiptProduct[];
  gaps?: ReceiptGap[];
  documents?: ReceiptDocument[];
  entryVoucher?: EntryVoucher;
  history: ReceiptHistory[];
  totalQty: number;
  totalValue: number;
}
