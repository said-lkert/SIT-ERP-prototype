import {
  Factory,
  Package,
  Boxes,
  Briefcase,
  Archive,
  Barcode,
  Server,
  ShieldAlert,
  FileText,
  Users,
  MapPin,
  ArrowLeftRight,
  Truck,
  LogOut,
  RotateCcw,
  FolderKanban,
  ListChecks,
  FileSpreadsheet,
  Lock,
  ClipboardCheck,
  Headset,
  Wrench,
  RefreshCw,
  History,
  Settings,
  AppWindow,
  Key,
  Database,
  ShoppingCart
} from 'lucide-react';

import { ERPModule, ModuleFamily } from '../types';

export const MODULE_FAMILIES: ModuleFamily[] = [
  {
    id: 'referentiel',
    name: 'Référentiel',
    description: 'Données de base : catalogue, partenaires, clients et documents de référence.',
    icon: FolderKanban
  },
  {
    id: 'stock-logistique',
    name: 'Stock & Logistique',
    description: 'Quantités, emplacements, entrées, sorties, retours et traçabilité physique.',
    icon: Boxes
  },
  {
    id: 'projets-affaires',
    name: 'Projets & Affaires',
    description: 'Projets client, besoins matériels, prestations, réservations et livraisons.',
    icon: Briefcase
  },
  {
    id: 'parc-client-sav',
    name: 'Parc Client & SAV',
    description: 'Matériel installé chez les clients, garanties, interventions et remplacements.',
    icon: Headset
  },
  {
    id: 'administration',
    name: 'Administration',
    description: 'Configuration ERP, droits d’accès, paramètres et éléments archivés.',
    icon: Settings
  }
];

export const ALL_MODULES: ERPModule[] = [
  // 1. Référentiel
  {
    id: 'produits',
    name: 'Produits',
    icon: Package,
    category: 'Référentiel',
    familyId: 'referentiel',
    description: 'Gestion du matériel physique vendu, acheté, stocké ou installé chez les clients.'
  },
  {
    id: 'services',
    name: 'Services',
    icon: Briefcase,
    category: 'Référentiel',
    familyId: 'referentiel',
    description: 'Gestion des prestations comme installation, câblage, configuration, maintenance, support et formation.'
  },
  {
    id: 'fournisseurs',
    name: 'Fournisseurs',
    icon: Factory,
    category: 'Référentiel',
    familyId: 'referentiel',
    description: 'Créez et gérez les fournisseurs et distributeurs de produits et matériels.'
  },
  {
    id: 'clients',
    name: 'Clients',
    icon: Users,
    category: 'Référentiel',
    familyId: 'referentiel',
    description: 'Base de données clients, contacts, adresses de facturation et de livraison.'
  },
  {
    id: 'documents-techniques',
    name: 'Documents techniques',
    icon: FileText,
    category: 'Référentiel',
    familyId: 'referentiel',
    description: 'Centralisation des fiches techniques, manuels, certificats, photos, plans et procédures.'
  },

  // 2. Stock & Logistique
  {
    id: 'stock-disponibilite',
    name: 'Stock & Disponibilité',
    icon: Archive,
    category: 'Stock & Logistique',
    familyId: 'stock-logistique',
    description: 'Suivi du stock physique, réservé, disponible, en commande, chantier ou véhicule.'
  },
  {
    id: 'emplacements',
    name: 'Emplacements',
    icon: MapPin,
    category: 'Stock & Logistique',
    familyId: 'stock-logistique',
    description: 'Gestion des entrepôts, zones, allées et positions de stockage précises.'
  },
  {
    id: 'commandes-fournisseur',
    name: 'Commandes fournisseur',
    icon: ShoppingCart,
    category: 'Stock & Logistique',
    familyId: 'stock-logistique',
    description: 'Gérez les commandes passées aux fournisseurs et leur suivi de réception.'
  },
  {
    id: 'mouvements-stock',
    name: 'Mouvements de stock',
    icon: ArrowLeftRight,
    category: 'Stock & Logistique',
    familyId: 'stock-logistique',
    description: 'Historique des transferts, ajustements, consommations et mouvements internes.'
  },
  {
    id: 'receptions-fournisseur',
    name: 'Réceptions fournisseur',
    icon: Truck,
    category: 'Stock & Logistique',
    familyId: 'stock-logistique',
    description: 'Enregistrement des livraisons fournisseurs et contrôle de conformité des entrées.'
  },
  {
    id: 'sorties-stock',
    name: 'Sorties stock',
    icon: LogOut,
    category: 'Stock & Logistique',
    familyId: 'stock-logistique',
    description: 'Préparation et validation des sorties de matériel pour chantiers ou livraisons.'
  },
  {
    id: 'retours-fournisseur',
    name: 'Retours fournisseur',
    icon: RotateCcw,
    category: 'Stock & Logistique',
    familyId: 'stock-logistique',
    description: 'Gestion des retours de matériel défectueux ou non conforme aux fournisseurs.'
  },
  {
    id: 'numeros-serie',
    name: 'Numéros de série',
    icon: Barcode,
    category: 'Stock & Logistique',
    familyId: 'stock-logistique',
    description: 'Traçabilité individuelle des équipements avec historique, statut et garantie.'
  },

  // 3. Projets & Affaires
  {
    id: 'projets-clients',
    name: 'Projets clients',
    icon: FolderKanban,
    category: 'Projets & Affaires',
    familyId: 'projets-affaires',
    description: 'Pilotage des projets, étapes, jalons, affectations et suivi de l’avancement.'
  },
  {
    id: 'besoins-projets',
    name: 'Besoins produits & services',
    icon: ListChecks,
    category: 'Projets & Affaires',
    familyId: 'projets-affaires',
    description: 'Centralisez les ressources matérielles et les prestations nécessaires à la réalisation des projets clients.'
  },
  {
    id: 'reservations-stock',
    name: 'Réservations stock',
    icon: Lock,
    category: 'Projets & Affaires',
    familyId: 'projets-affaires',
    description: 'Blocage du matériel en stock pour des projets spécifiques afin d’éviter les ruptures.'
  },
  {
    id: 'livraisons-client',
    name: 'Livraisons client',
    icon: Truck,
    category: 'Projets & Affaires',
    familyId: 'projets-affaires',
    description: 'Expédition du matériel chez le client avec suivi des bons de livraison.'
  },
  {
    id: 'pv-installation',
    name: 'PV d’installation',
    icon: ClipboardCheck,
    category: 'Projets & Affaires',
    familyId: 'projets-affaires',
    description: 'Génération et signature des procès-verbaux de réception et de mise en service.'
  },

  // 4. Parc Client & SAV
  {
    id: 'equipements-installes',
    name: 'Équipements installés',
    icon: Server,
    category: 'Parc Client & SAV',
    familyId: 'parc-client-sav',
    description: 'Vue du matériel installé chez les clients, par site, emplacement et configuration.'
  },
  {
    id: 'garanties',
    name: 'Garanties',
    icon: ShieldAlert,
    category: 'Parc Client & SAV',
    familyId: 'parc-client-sav',
    description: 'Suivi des échéances et conditions de garantie constructeur et commerciale.'
  },
  {
    id: 'interventions-sav',
    name: 'Interventions SAV',
    icon: Wrench,
    category: 'Parc Client & SAV',
    familyId: 'parc-client-sav',
    description: 'Plannification et suivi des dépannages, maintenance préventive et curative.'
  },
  {
    id: 'remplacements',
    name: 'Remplacements',
    icon: RefreshCw,
    category: 'Parc Client & SAV',
    familyId: 'parc-client-sav',
    description: 'Gestion des échanges standards et remplacements sous garantie ou hors garantie.'
  },
  {
    id: 'retours-client',
    name: 'Retours client',
    icon: History,
    category: 'Parc Client & SAV',
    familyId: 'parc-client-sav',
    description: 'Réception et traitement des retours de matériel provenant des chantiers ou clients.'
  },

  // 5. Administration
  {
    id: 'utilisateurs',
    name: 'Utilisateurs',
    icon: Users,
    category: 'Administration',
    familyId: 'administration',
    description: 'Gestion des comptes utilisateurs, profils et informations de contact.'
  },
  {
    id: 'roles-permissions',
    name: 'Rôles & permissions',
    icon: Key,
    category: 'Administration',
    familyId: 'administration',
    description: 'Définition des droits d’accès par module, action et périmètre de données.'
  },
  {
    id: 'parametres',
    name: 'Paramètres',
    icon: Settings,
    category: 'Administration',
    familyId: 'administration',
    description: 'Configuration générale de l’ERP, formats, devises et préférences globales.'
  },
  {
    id: 'applications-fonctionnalites',
    name: 'Applications & fonctionnalités',
    icon: AppWindow,
    category: 'Administration',
    familyId: 'administration',
    description: 'Activation des options avancées et gestion de l’écosystème applicatif.'
  },
  {
    id: 'archives',
    name: 'Archives',
    icon: Archive,
    category: 'Administration',
    familyId: 'administration',
    description: 'Consultation des données historiques, purge et éléments désactivés.'
  }
];
