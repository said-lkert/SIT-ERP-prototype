import { StockMovement } from "./types";

export const MOCK_MOVEMENTS: StockMovement[] = [
  {
    id: "mov1",
    reference: "MOV-2026-001",
    type: "Entrée",
    status: "Validé",
    date: "2026-06-01 09:30",
    validationDate: "2026-06-01 10:15",
    responsible: "K. Samia",
    quantity: 20,
    value: 4500,
    product: {
      id: "p1",
      reference: "CAM-HIK-2CD2043",
      name: "Caméra IP Hikvision DS-2CD2043",
      family: "CCTV",
      isSerialized: true,
      stockBefore: 45,
      stockAfter: 65
    },
    source: {
      type: "Fournisseur",
      name: "Hikvision Digital Technology"
    },
    destination: {
      type: "Emplacement",
      name: "Dépôt Principal / Zone CCTV",
      locationId: "loc3"
    },
    linkedDocument: {
      type: "Réception fournisseur",
      reference: "REC-2026-45"
    },
    comment: "Réception commande CO-2026-12. Conforme au BL.",
    serialNumbers: [
      { number: "SN-HIK-001", oldStatus: "En commande", newStatus: "En stock", currentLocationId: "loc3" },
      { number: "SN-HIK-002", oldStatus: "En commande", newStatus: "En stock", currentLocationId: "loc3" }
    ],
    history: [
      { id: "a1", date: "2026-06-01 09:30", action: "Création du mouvement", user: "K. Samia" },
      { id: "a2", date: "2026-06-01 10:15", action: "Validation & Mise à jour stock", user: "K. Samia" }
    ]
  },
  {
    id: "mov2",
    reference: "MOV-2026-002",
    type: "Sortie",
    status: "Validé",
    date: "2026-06-02 14:00",
    validationDate: "2026-06-02 14:30",
    responsible: "M. Ahmed",
    quantity: 5,
    value: 1200,
    product: {
      id: "p1",
      reference: "CAM-HIK-2CD2043",
      name: "Caméra IP Hikvision DS-2CD2043",
      family: "CCTV",
      isSerialized: true,
      stockBefore: 65,
      stockAfter: 60
    },
    source: {
      type: "Emplacement",
      name: "Dépôt Principal / Zone CCTV",
      locationId: "loc3"
    },
    destination: {
      type: "Projet",
      name: "Projet Hôtel El Aurassi",
      responsible: "Y. Sofiane"
    },
    linkedDocument: {
      type: "Bon de sortie",
      reference: "BS-2026-88"
    },
    comment: "Besoin urgent pour installation hall principal.",
    serialNumbers: [
      { number: "SN-HIK-001", oldStatus: "En stock", newStatus: "Sorti / Projet", currentLocationId: "PROJ-EL-AUR" }
    ],
    history: [
      { id: "a3", date: "2026-06-02 14:00", action: "Préparation sortie", user: "M. Ahmed" },
      { id: "a4", date: "2026-06-02 14:30", action: "Validation sortie", user: "K. Samia" }
    ]
  },
  {
    id: "mov3",
    reference: "MOV-2026-003",
    type: "Transfert",
    status: "Validé",
    date: "2026-06-03 08:45",
    validationDate: "2026-06-03 09:00",
    responsible: "S. Malik",
    quantity: 12,
    product: {
      id: "p4",
      reference: "ROUT-MIK-4011",
      name: "Routeur MikroTik RB4011",
      family: "Réseau",
      isSerialized: true,
      stockBefore: 20,
      stockAfter: 20
    },
    source: {
      type: "Emplacement",
      name: "Dépôt Principal",
      locationId: "loc1"
    },
    destination: {
      type: "Emplacement",
      name: "Véhicule Technicien A",
      locationId: "loc9"
    },
    linkedDocument: {
      type: "Bon d'entrée",
      reference: "BT-2026-11"
    },
    comment: "Réapprovisionnement stock interne véhicule.",
    history: [
      { id: "a5", date: "2026-06-03 08:45", action: "Création transfert", user: "S. Malik" },
      { id: "a6", date: "2026-06-03 09:00", action: "Validation réception véhicule", user: "Y. Sofiane" }
    ]
  },
  {
    id: "mov4",
    reference: "MOV-2026-004",
    type: "Correction",
    status: "Écart détecté",
    date: "2026-06-03 11:30",
    responsible: "A. Karim",
    quantity: -2,
    value: -150,
    product: {
      id: "p5",
      reference: "CAB-CAT6-UTP",
      name: "Câble réseau CAT6 UTP 305m",
      family: "Câblage",
      isSerialized: false,
      stockBefore: 12,
      stockAfter: 10
    },
    source: {
      type: "Emplacement",
      name: "Dépôt Principal / Zone Réseau",
      locationId: "loc2"
    },
    destination: {
      type: "Ajustement",
      name: "Perte / Inventaire"
    },
    linkedDocument: {
      type: "Correction inventaire",
      reference: "INV-2026-05"
    },
    comment: "Écart constaté lors du comptage tournant. Possible erreur de coupe.",
    history: [
      { id: "a7", date: "2026-06-03 11:30", action: "Écart déclaré", user: "A. Karim" }
    ]
  },
  {
    id: "mov5",
    reference: "MOV-2026-005",
    type: "Réservation",
    status: "Brouillon",
    date: "2026-06-03 15:20",
    responsible: "R. Amine",
    quantity: 15,
    product: {
      id: "p1",
      reference: "CAM-HIK-2CD2043",
      name: "Caméra IP Hikvision DS-2CD2043",
      family: "CCTV",
      isSerialized: true,
      stockBefore: 60,
      stockAfter: 45
    },
    source: {
      type: "Emplacement",
      name: "Dépôt Principal / Zone CCTV",
      locationId: "loc3"
    },
    destination: {
      type: "Projet",
      name: "Projet Clinique El Yasmine",
      responsible: "R. Amine"
    },
    linkedDocument: {
      type: "Réservation projet",
      reference: "RES-2026-55"
    },
    comment: "Blocage stock pour déploiement semaine prochaine.",
    history: [
      { id: "a8", date: "2026-06-03 15:20", action: "Réservation initiée", user: "R. Amine" }
    ]
  },
  {
    id: "mov6",
    reference: "MOV-2026-006",
    type: "Retour fournisseur",
    status: "Validé",
    date: "2026-05-28 10:00",
    validationDate: "2026-05-28 11:30",
    responsible: "T. Mourad",
    quantity: 1,
    value: 850,
    product: {
      id: "p10",
      reference: "UPS-APC-1500",
      name: "Onduleur APC Smart-UPS 1500VA",
      family: "Énergie",
      isSerialized: true,
      stockBefore: 1,
      stockAfter: 0
    },
    source: {
      type: "Emplacement",
      name: "Zone SAV",
      locationId: "loc8"
    },
    destination: {
      type: "Fournisseur",
      name: "APC by Schneider Electric"
    },
    linkedDocument: {
      type: "Retour fournisseur",
      reference: "RET-2026-04"
    },
    comment: "Appareil défectueux au déballage (DOA). Retour pour échange.",
    serialNumbers: [
      { number: "SN-APC-X99", oldStatus: "SAV / Diagnostiqué", newStatus: "Retourné Fournisseur", currentLocationId: "FOU-APC" }
    ],
    history: [
      { id: "a9", date: "2026-05-28 10:00", action: "Sortie SAV pour retour", user: "T. Mourad" },
      { id: "a10", date: "2026-05-28 11:30", action: "Expédition confirmée", user: "K. Samia" }
    ]
  }
];
