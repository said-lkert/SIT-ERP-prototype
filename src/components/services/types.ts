export type ServiceStatus = 'Actif' | 'Désactivé' | 'Obsolète';

export interface Service {
  id: string;
  reference: string;
  name: string;
  family: string;
  unit: string;
  internalCost: number;
  sellingPrice: number;
  margin: number;
  marginRate: number;
  status: ServiceStatus;
  description: string;
  estimatedDuration: string;
  conditions: string;
  requiredSkills: string[];
  prerequisites: string[];
  executionSteps: string[];
  associatedEquipment: string[];
  requiredDocuments: string[];
  qualityCheckpoints: string[];
  createdAt: string;
  lastUsed: string;
  usageCount: number;
  lastUpdatedBy: string;
}
