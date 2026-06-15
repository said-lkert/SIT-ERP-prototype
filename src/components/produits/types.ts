export interface Product {
  id: string;
  reference: string;
  name: string;
  family: string;
  brand: string;
  model: string;
  mainSupplier: string;
  purchasePrice: number;
  sellingPrice: number;
  margin: number;
  marginRate: number;
  physicalStock: number;
  reservedStock: number;
  availableStock: number;
  orderedStock: number;
  minThreshold: number;
  supplierWarrantyMonths: number;
  clientWarrantyMonths: number;
  status: 'Actif' | 'En rupture' | 'Sous seuil' | 'Obsolète' | 'Désactivé';
  requiresSerialNumber: boolean;
  isStockable: boolean;
  description: string;
  type: string;
  createdAt: string;
  tags?: string[];
  averagePurchasePrice?: number;
  lastPriceUpdate?: string;
}

export type ProductStatus = Product['status'];
