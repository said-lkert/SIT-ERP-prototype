export interface EquipmentEvent {
  id: string;
  date: string;
  type:
    | "installation"
    | "panne"
    | "remplacement"
    | "retrait"
    | "transfert"
    | "maintenance"
    | "document";
  description: string;
  user: string;
}

export interface EquipmentDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  date: string;
}

export interface EquipmentIntervention {
  id: string;
  date: string;
  technician: string;
  type: "maintenance" | "panne" | "remplacement" | "controle";
  diagnostic: string;
  result: string;
  cost?: number;
}

export interface InstalledEquipment {
  id: string;
  clientId: string;
  clientName: string;
  siteId?: string;
  siteName?: string;
  address?: string;
  zone?: string;
  productId: string;
  productName: string;
  productReference: string;
  family: string;
  brand: string;
  model: string;
  serialNumber: string;
  exactLocation: string;
  status:
    | "actif"
    | "en_panne"
    | "remplace"
    | "retire"
    | "hors_service"
    | "en_maintenance";
  installationDate: string;
  supplierWarranty: number; // months
  clientWarranty: number; // months
  startOfWarranty: string;
  endOfWarranty: string;
  warrantyConditions?: string;
  technician: string;
  supplier: string;
  purchaseDate: string;
  history: EquipmentEvent[];
  documents: EquipmentDocument[];
  interventions: EquipmentIntervention[];
}
