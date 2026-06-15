export type PVStatus = 
  | 'Brouillon'
  | 'À compléter'
  | 'En attente de signature'
  | 'Signé'
  | 'Signé avec réserves'
  | 'Refusé'
  | 'Annulé';

export type PVResult = 
  | 'Installation conforme'
  | 'Conforme avec réserves'
  | 'Non conforme'
  | 'Tests à reprendre';

export interface PVProduct {
  id: string;
  productId: string;
  productName: string;
  productReference: string;
  serialNumber: string;
  installedQty: number;
  location?: string;
  stateBefore?: string;
  stateAfter?: string;
  status?: string;
  remark?: string;
}

export interface ServicePerformed {
  name: string;
  description: string;
  technician: string;
  duration: string;
  result: string;
  comment: string;
}

export interface TestPerformed {
  name: string;
  equipment: string;
  expectedResult: string;
  actualResult: string;
  status: 'Réussi' | 'Échoué' | '';
  observation: string;
}

export interface Reserve {
  type: string;
  description: string;
  equipment: string;
  priority: string;
  responsible: string;
  resolutionDate: string;
  status?: string;
}

export interface InstallationPV {
  id: string;
  reference: string;
  clientName: string;
  projectName: string;
  siteName: string;
  address?: string;
  teamMembers?: string;
  technician: string;
  clientSignatory?: string;
  clientRole?: string;
  installationDate: string;
  signatureDate?: string;
  clientComment?: string;
  status: PVStatus;
  result: PVResult;
  hasReserves: boolean;
  reservesDetails?: string;
  products: PVProduct[];
  services?: ServicePerformed[];
  tests?: TestPerformed[];
  reserves?: Reserve[];
  createdAt: string;
}
