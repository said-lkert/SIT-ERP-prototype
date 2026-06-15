import { LucideIcon } from 'lucide-react';

export type LocationType = 'Dépôt' | 'Zone' | 'Allée' | 'Rayon' | 'Étagère' | 'Véhicule' | 'Zone Retour' | 'Zone SAV' | 'Zone retour' | 'Chantier';
export type LocationStatus = 'Actif' | 'Inactif' | 'Saturé' | 'Maintenance';

export interface StoredProduct {
  id: string;
  reference: string;
  name: string;
  quantity: number;
  reserved: number;
  available: number;
  isSerialized: boolean;
}

export interface InventoryMovement {
  id: string;
  type: 'Entrée' | 'Sortie' | 'Transfert' | 'Correction' | 'Retour Fournisseur';
  date: string;
  productName: string;
  quantity: number;
  responsible?: string;
  user?: string;
}

export interface Location {
  id: string;
  reference: string;
  name: string;
  type: LocationType;
  status: LocationStatus;
  parentLocation?: string;
  parentLocationId?: string;
  address?: string;
  responsible?: string;
  manager?: string;
  maxCapacity: number;
  usedCapacity: number;
  capacityUnit: 'pièces' | 'cartons' | 'palettes' | 'mètres';
  description?: string;
  storedProducts?: StoredProduct[];
  movements?: InventoryMovement[];
  lastMovementDate?: string;
  serializedCount?: number;
  productsStoredCount?: number;
  alertThreshold?: number;
  city?: string;
  createdAt?: string;
  hasSerializedProducts?: boolean;
  products?: any[];
  history?: any[];
  hierarchy?: {
    depot?: string;
    zone?: string;
    allee?: string;
    rayon?: string;
    etagere?: string;
  };
}

export type StockLocation = Location;
