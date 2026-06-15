export interface StockItem {
  id: string;
  reference: string;
  name: string;
  family: string;
  physicalStock: number;
  reservedStock: number;
  availableStock: number;
  orderedStock: number;
  minStockThreshold: number;
  mainLocation: string;
  status: 'en_stock' | 'sous_seuil' | 'rupture';
  locations: StockLocation[];
  movements: StockMovement[];
  reservations: StockReservation[];
  isSerialized?: boolean;
  serialNumbers?: SerialNumber[];
}

export interface StockLocation {
  id: string;
  name: string;
  quantity: number;
  type: 'depot' | 'vehicule' | 'chantier' | 'retour' | 'reparation';
}

export interface StockMovement {
  id: string;
  date: string;
  type: 'entree' | 'sortie' | 'transfert' | 'correction' | 'retour';
  quantity: number;
  user: string;
  document?: string;
  comment?: string;
}

export interface StockReservation {
  id: string;
  project: string;
  quantity: number;
  date: string;
  status: 'active' | 'consommee' | 'annulee';
  responsible: string;
}

export interface SerialNumber {
  serial: string;
  status: 'en_stock' | 'installe' | 'reparation' | 'retour_fournisseur';
  location: string;
}
