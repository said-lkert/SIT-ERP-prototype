export type ReturnStatus = 'Brouillon' | 'Demande enregistrée' | 'En attente de réception' | 'Reçu' | 'En diagnostic' | 'Réparation en cours' | 'Remplacement prévu' | 'Retour refusé' | 'Résolu' | 'Clôturé' | 'Annulé';

export type ReturnReason = 'Panne totale' | 'Dysfonctionnement intermittent' | 'Produit endommagé' | 'Produit non conforme' | 'Mauvaise référence livrée' | 'Accessoire manquant' | 'Échec des tests d\'installation' | 'Remplacement demandé' | 'Autre' | 'Panne' | 'Produit défectueux' | 'Erreur de livraison' | 'Dommage constaté' | 'Remplacement' | 'Intervention sous garantie' | 'Demande de diagnostic' | string;

export interface ClientReturn {
  id: string;
  returnNumber: string;
  clientName: string;
  projectName: string;
  siteName: string;
  equipmentName: string;
  productName: string;
  productReference: string;
  serialNumber: string;
  deliveryNumber: string;
  technician: string;
  reason: ReturnReason;
  returnType: string;
  warrantyStatus: 'Sous garantie' | 'Hors garantie' | 'À vérifier';
  requestDate: string;
  receptionDate: string;
  warehouseZone: string;
  status: ReturnStatus;
  contactName?: string;
  contactPhone?: string;
  priority?: string;
  description?: string;
  receptionPhysical?: { date: string, receivedBy: string, realCondition: string, qty: number, accessories: string, packaging: boolean, discrepancies: string };
  diagnostic?: { technician: string, date: string, symptoms: string, tests: string, probableCause: string, parts: string, conclusion: string, warrantyCoverage: string };
  decision?: { type: string, responsible: string, expectedDate: string, cost: string, comment: string, replacementSerialNumber: string };
  history?: { date: string, user: string, action: string }[];
}
