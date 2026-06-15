export interface SerialNumber {
  id: string;
  serial: string;
  productId: string;
  productName: string;
  productReference: string;
  family: string;
  brand?: string;
  model?: string;
  status: 'en_stock' | 'reserve' | 'affecte_chantier' | 'installe_client' | 'en_panne' | 'retour_fournisseur' | 'en_reparation' | 'remplace' | 'hors_service';
  location: string;
  warehouse?: string;
  vehicle?: string;
  clientSite?: string;
  exactLocation?: string;
  endOfWarranty?: string; // ISO date string
  startOfWarranty?: string;
  endOfClientWarranty?: string;
  warrantyConditions?: string;
  dateOfPurchase?: string;
  dateOfEntry?: string;
  dateOfInstallation?: string;
  supplier?: string;
  history: SerialHistoryEvent[];
  documents?: SerialDocument[];
}

export interface SerialHistoryEvent {
  id: string;
  date: string;
  type: string;
  description: string;
  user: string;
  documentRef?: string;
}

export interface SerialDocument {
  id: string;
  name: string;
  type: 'invoice' | 'delivery_note' | 'exit_note' | 'installation_pv' | 'photo' | 'intervention_report' | 'warranty' | 'other';
  date: string;
  url: string;
}
