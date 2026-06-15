export interface ReceptionHistory {
  id: string;
  fournisseurId: string;
  date: string;
  referenceBL: string;
  referenceCommande?: string;
  nbProduits: number;
  quantiteTotale: number;
  valeurTotale: number;
  statut: 'brouillon' | 'validee' | 'ecart';
  depot: string;
  responsable: string;
  documents?: { id: string; name: string; type: string; size: string; }[];
}

export interface Fournisseur {
  id: string;
  name: string;
  type: string;
  contactPrincipale: string;
  telephone: string;
  email: string;
  produitsAssocies: number;
  derniereLivraison: string;
  statut: 'actif' | 'inactif' | 'archive';
  tauxConformite: number;
  commandesAttente: number;
  pays: string;
  delaiMoyenLivraison: string;
  modePaiement: string;
  reference: string;
  receptions?: ReceptionHistory[];
  commandes?: any[];
}
