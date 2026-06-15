export type CommandeFournisseurStatus = 'Brouillon' | 'Validée' | 'Envoyée' | 'Partiellement reçue' | 'Reçue' | 'Annulée';

export interface CommandeFournisseurLine {
  id: string;
  productId: string;
  productName: string;
  refFournisseur: string;
  qteCmd: number;
  qteRecue: number;
  prixU: number;
}

export interface CommandeFournisseur {
  id: string;
  reference: string;
  fournisseurId: string;
  fournisseurName: string;
  dateCommande: string;
  dateLivraisonPrevue: string;
  responsableId: string;
  responsableName: string;
  statut: CommandeFournisseurStatus;
  commentaire: string;
  lignes: CommandeFournisseurLine[];
  receptionId?: string;
  modePaiement: string;
  devise: string;
  remise: number;
  fraisLivraison: number;
  conditionsParticulieres: string;
  createdAt: string;
  updatedAt: string;
}
