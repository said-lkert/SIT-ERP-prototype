import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, Edit, Settings, ChevronDown, Archive, Copy, History, 
  MapPin, Clock, Phone, Mail, FileText, Shield, Package, Truck, Activity, ArrowDownToLine,
  LayoutDashboard, CreditCard, ShoppingCart, CheckCircle2, AlertCircle, ExternalLink, Download, User,
  Building2, Globe, X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Fournisseur } from './types';
import { FournisseurOrderModal } from './FournisseurOrderModal';
import { FournisseurEditModal } from './FournisseurEditModal';

interface FournisseurFicheProps {
  fournisseur: Fournisseur;
  onBack: () => void;
}

type TabType = 'resume' | 'produits' | 'conditions' | 'commandes' | 'livraisons' | 'garanties';

export function FournisseurFiche({ fournisseur, onBack }: FournisseurFicheProps) {
  const [activeTab, setActiveTab] = useState<TabType>('resume');
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [localFournisseur, setLocalFournisseur] = useState<any>(fournisseur);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isTitleVisible, setIsTitleVisible] = useState(true);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSupplierDetails = async () => {
      try {
        const response = await fetch(`/api/suppliers/${fournisseur.id}`);
        if (response.ok) {
          const data = await response.json();
          setLocalFournisseur(data);
        }
      } catch (err) {
        console.error("Error fetching supplier details:", err);
      }
    };
    fetchSupplierDetails();
  }, [fournisseur.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTitleVisible(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );

    if (titleRef.current) observer.observe(titleRef.current);
    return () => {
      if (titleRef.current) observer.unobserve(titleRef.current);
    };
  }, []);

  const tabs = [
    { id: 'resume', label: 'Résumé', icon: LayoutDashboard },
    { id: 'produits', label: 'Catalogue fournisseur', icon: Package },
    { id: 'conditions', label: 'Conditions', icon: CreditCard },
    { id: 'commandes', label: 'Commandes', icon: ShoppingCart },
    { id: 'livraisons', label: 'Livraisons', icon: Truck },
    { id: 'garanties', label: 'Garanties', icon: Shield },
  ] as const;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actif': return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full font-bold text-[10px] uppercase tracking-wider">Actif</span>;
      case 'inactif': return <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full font-bold text-[10px] uppercase tracking-wider">Inactif</span>;
      case 'archive': return <span className="px-3 py-1 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-[10px] uppercase tracking-wider">Archivé</span>;
      default: return null;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {/* Top Actions Bar */}
      <div className="relative flex items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0 transition-all duration-300 z-30">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors relative z-10 shrink-0"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline tracking-tight">Retour à la liste</span>
          <span className="sm:hidden">Retour</span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 flex justify-center overflow-hidden max-w-[40%] pointer-events-none z-0">
          <AnimatePresence>
            {!isTitleVisible && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex items-center gap-3 overflow-hidden pointer-events-auto"
              >
                <div className="font-bold text-slate-900 dark:text-white truncate tracking-tight">{fournisseur.name}</div>
                <div className="hidden md:flex items-center shrink-0">
                  {getStatusBadge(fournisseur.statut)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button 
            onClick={() => setIsOrderModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/50 rounded-lg transition-colors shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" /> 
            <span className="hidden md:inline">Créer commande fournisseur</span>
            <span className="md:hidden">Commander</span>
          </button>
          
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Edit className="w-4 h-4" /> 
            <span className="hidden sm:inline">Modifier</span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Options</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isActionsOpen && "rotate-180")} />
            </button>

            {isActionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <style>{`
                  .animate-scroll-text-slow {
                    animation: scroll-text-x 4s linear infinite alternate;
                  }
                  @keyframes scroll-text-x {
                    0%, 15% { transform: translateX(0); }
                    85%, 100% { transform: translateX(-100%) translateX(170px); }
                  }
                `}</style>
                <div className="py-2">
                  <button 
                    onClick={() => {
                      setIsArchiveModalOpen(true);
                      setIsActionsOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 group transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Archive className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 overflow-hidden leading-tight text-left">
                      <div className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-0.5 whitespace-nowrap">Gestion fournisseur</div>
                      <div className="font-bold truncate group-hover:animate-scroll-text-slow whitespace-nowrap block">Archiver {localFournisseur.name}</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                      setIsDuplicateModalOpen(true);
                      setIsActionsOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 group transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Copy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 overflow-hidden leading-tight text-left">
                      <div className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-0.5 whitespace-nowrap">Administration</div>
                      <div className="font-bold truncate group-hover:animate-scroll-text-slow whitespace-nowrap block">Dupliquer {localFournisseur.name}</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800 mx-4 opacity-50"></div>

                  <button 
                    onClick={() => {
                      setIsHistoryModalOpen(true);
                      setIsActionsOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 group transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <History className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 overflow-hidden leading-tight text-left">
                      <div className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-0.5 whitespace-nowrap">Audit & Sécurité</div>
                      <div className="font-bold truncate group-hover:animate-scroll-text-slow whitespace-nowrap block">Historique des changements</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col min-h-full">
          
          {/* Header Section */}
          <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
             <div className="px-8 pt-8 pb-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6" ref={titleRef}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{fournisseur.name}</h1>
                      {getStatusBadge(fournisseur.statut)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 dark:text-slate-400 font-medium">
                       <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {fournisseur.type}</span>
                       <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {fournisseur.pays}</span>
                       <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {fournisseur.reference}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                    <div className="px-4 border-r border-slate-200 dark:border-slate-800 last:border-0 text-center">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Références</p>
                       <p className="text-xl font-bold text-slate-900 dark:text-white leading-none">{fournisseur.produitsAssocies}</p>
                    </div>
                    <div className="px-4 border-r border-slate-200 dark:border-slate-800 last:border-0 text-center">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">En attente</p>
                       <p className={cn("text-xl font-bold leading-none", fournisseur.commandesAttente > 0 ? "text-amber-600" : "text-slate-900 dark:text-white")}>
                         {fournisseur.commandesAttente}
                       </p>
                    </div>
                    <div className="px-4 border-r border-slate-200 dark:border-slate-800 last:border-0 text-center">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Fiabilité</p>
                       <p className={cn("text-xl font-bold leading-none", 
                          fournisseur.tauxConformite < 85 ? "text-rose-500" : 
                          fournisseur.tauxConformite < 95 ? "text-amber-500" : "text-emerald-500")}>
                         {fournisseur.tauxConformite}%
                       </p>
                    </div>
                  </div>
                </div>
             </div>

             {/* Dynamic Horizontal Tabs */}
             <div className="px-8 border-t border-slate-100 dark:border-slate-800/50">
               <nav className="flex space-x-8 overflow-x-auto">
                 {tabs.map(tab => {
                   const Icon = tab.icon;
                   const isActive = activeTab === tab.id;
                   return (
                     <button
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id as TabType)}
                       className={cn(
                         "flex items-center gap-2 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap",
                         isActive 
                           ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" 
                           : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600"
                       )}
                     >
                       <Icon className="w-4 h-4" />
                       {tab.label}
                     </button>
                   );
                 })}
               </nav>
             </div>
          </div>

          <div className="flex-1 flex min-h-0">
             {/* Main Content Area */}
             <div className="flex-1 p-8 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    {activeTab === 'resume' && (
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Info Card */}
                          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-all">
                             <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                   </div>
                                   <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">Identité & Contact</h3>
                                </div>
                             </div>
                             <div className="p-6">
                                <div className="space-y-6">
                                   <div className="flex items-start gap-4">
                                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 font-bold text-slate-500">
                                         {(fournisseur.contactPrincipale || '').split(' ').map(n=>n[0]).join('')}
                                      </div>
                                      <div className="flex-1">
                                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Principal</p>
                                         <p className="text-lg font-bold text-slate-900 dark:text-white">{fournisseur.contactPrincipale}</p>
                                         <div className="mt-3 space-y-2">
                                            <a href={`tel:${fournisseur.telephone}`} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">
                                               <Phone className="w-4 h-4" /> {fournisseur.telephone}
                                            </a>
                                            <a href={`mailto:${fournisseur.email}`} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">
                                               <Mail className="w-4 h-4" /> {fournisseur.email}
                                            </a>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Localisation</p>
                                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                         <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-indigo-500" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Siège social ({fournisseur.pays})</span>
                                         </div>
                                         <button className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">Voir carte</button>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* Stats and Activity Card */}
                          <div className="space-y-8">
                             <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                                   <Activity className="w-4 h-4 text-emerald-500" />
                                   <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">Aperçu Performance</h3>
                                </div>
                                <div className="p-6">
                                   <div className="flex items-center justify-between mb-6 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                                      <div>
                                         <p className="text-xs font-bold text-slate-400 uppercase mb-1">Dernière activité</p>
                                         <p className="text-sm font-bold text-slate-900 dark:text-white">Livraison réceptionnée</p>
                                         <p className="text-xs text-slate-500 mt-0.5">{formatDate(fournisseur.derniereLivraison)}</p>
                                      </div>
                                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold">
                                         <CheckCircle2 className="w-4 h-4" /> Opérationnel
                                      </div>
                                   </div>
                                   <div className="space-y-4">
                                      <div>
                                         <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider">
                                            <span className="text-slate-400">Taux de conformité</span>
                                            <span className="text-emerald-600">{fournisseur.tauxConformite}%</span>
                                         </div>
                                         <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div 
                                              initial={{ width: 0 }}
                                              animate={{ width: `${fournisseur.tauxConformite}%` }}
                                              className={cn(
                                                "h-full rounded-full",
                                                fournisseur.tauxConformite < 85 ? "bg-amber-500" : "bg-emerald-500"
                                              )} 
                                            />
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             </div>
                             
                             {/* Latest Delivery Mini Table */}
                             <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50">
                                   <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">Dernière Livraison</h3>
                                   <button 
                                      onClick={() => setActiveTab('livraisons')}
                                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                   >
                                      Tout voir
                                   </button>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                   {fournisseur.receptions?.[0] ? (
                                      <div className="p-4 flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                                               <Truck className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div>
                                               <p className="text-sm font-bold text-slate-900 dark:text-white">{fournisseur.receptions[0].referenceBL}</p>
                                               <p className="text-xs text-slate-500 uppercase tracking-widest font-medium font-mono">{formatDate(fournisseur.receptions[0].date)}</p>
                                            </div>
                                         </div>
                                         <div className="text-right">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{fournisseur.receptions[0].quantiteTotale} Pièces</p>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">Validée</span>
                                         </div>
                                      </div>
                                   ) : (
                                      <div className="p-12 text-center text-slate-500 text-sm font-medium italic">Aucun historique récent</div>
                                   )}
                                </div>
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'produits' && (
                       <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-indigo-500" />
                                <div>
                                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Catalogue fournisseur</h2>
                                  <p className="text-xs text-slate-500 mt-1">Produits proposés, prix négociés et disponibilité dans notre stock.</p>
                                </div>
                             </div>
                          </div>
                          <div className="overflow-x-auto min-h-0">
                            <table className="w-full text-left text-sm whitespace-nowrap divide-y divide-slate-100 dark:divide-slate-800">
                               <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                  <tr>
                                     <th scope="col" className="px-6 py-4">Produit</th>
                                     <th scope="col" className="px-6 py-4">Réf. Fournisseur</th>
                                     <th scope="col" className="px-6 py-4 text-right">Prix Achat</th>
                                     <th scope="col" className="px-6 py-4 text-center">Délai</th>
                                     <th scope="col" className="px-6 py-4 text-center">Chez nous</th>
                                     <th scope="col" className="px-6 py-4 opacity-0">Actions</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                  {localFournisseur.offers?.map((offer: any) => (
                                     <tr key={offer.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                           <div className="flex flex-col">
                                              <span className="font-bold text-slate-900 dark:text-white tracking-tight">{offer.productName}</span>
                                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{offer.productReference}</span>
                                           </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-slate-500">{offer.reference}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                                           {offer.purchasePrice.toLocaleString()} {offer.currency}
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-300">
                                           {offer.deliveryDays} jours
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                          {offer.availableInternally ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                              <CheckCircle2 className="w-3.5 h-3.5" /> Disponible ({offer.internalStock})
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                                              <AlertCircle className="w-3.5 h-3.5" /> Non disponible
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                           <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all">
                                              <ExternalLink className="w-4 h-4" />
                                           </button>
                                        </td>
                                     </tr>
                                  ))}
                                  {(!localFournisseur.offers || localFournisseur.offers.length === 0) && (
                                     <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                                           Aucun produit référencé pour ce fournisseur
                                        </td>
                                     </tr>
                                  )}
                               </tbody>
                            </table>
                          </div>
                       </div>
                    )}

                    {activeTab === 'conditions' && (
                       <div className="max-w-4xl space-y-8">
                          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                             <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Accords Commerciaux</h2>
                             </div>
                             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                                <div>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Modalités de Paiement</p>
                                   <div className="p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800">
                                      <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">{fournisseur.modePaiement}</p>
                                      <p className="text-xs text-slate-500 font-medium">Conditions négociées pour l'exercice 2026.</p>
                                   </div>
                                </div>
                                <div className="space-y-6">
                                   <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                      <div className="flex items-center gap-3">
                                         <Clock className="w-5 h-5 text-slate-400" />
                                         <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Délai de livraison moyen</span>
                                      </div>
                                      <span className="text-sm font-bold text-slate-900 dark:text-white px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{fournisseur.delaiMoyenLivraison}</span>
                                   </div>
                                   <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                      <div className="flex items-center gap-3">
                                         <Globe className="w-5 h-5 text-slate-400" />
                                         <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Incoterm par défaut</span>
                                      </div>
                                      <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">DDP - Alger</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'livraisons' && (
                       <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <Truck className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Historique des Livraisons</h2>
                             </div>
                             <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                <Download className="w-4 h-4" /> Exporter l'historique
                             </button>
                          </div>
                          <div className="overflow-x-auto min-h-0">
                            <table className="w-full text-left text-sm whitespace-nowrap table-fixed divide-y divide-slate-100 dark:divide-slate-800">
                               <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                  <tr>
                                     <th scope="col" className="w-[15%] px-6 py-4">Date</th>
                                     <th scope="col" className="w-[20%] px-6 py-4">Référence BL</th>
                                     <th scope="col" className="w-[15%] px-6 py-4">Items</th>
                                     <th scope="col" className="w-[15%] px-6 py-4">Dépôt</th>
                                     <th scope="col" className="w-[15%] px-6 py-4">Responsable</th>
                                     <th scope="col" className="w-[10%] px-6 py-4">Statut</th>
                                     <th scope="col" className="w-[10%] px-6 py-4 text-center">Actions</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                  {fournisseur.receptions?.map(rec => (
                                     <tr key={rec.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-slate-500">{formatDate(rec.date)}</td>
                                        <td className="px-6 py-4">
                                           <div className="flex flex-col">
                                              <span className="font-bold text-slate-900 dark:text-white tracking-tight">{rec.referenceBL}</span>
                                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{rec.referenceCommande || 'Sans Commande'}</span>
                                           </div>
                                        </td>
                                        <td className="px-6 py-4">
                                           <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                                              {rec.quantiteTotale} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">UNITÉS</span>
                                           </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                                           {rec.depot || 'Principal'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                                           {rec.responsable || 'Admin'}
                                        </td>
                                        <td className="px-6 py-4">
                                           <span className={cn(
                                              "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                                              rec.statut === 'validee' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                              rec.statut === 'ecart' ? "bg-rose-50 text-rose-700 border border-rose-100" :
                                              "bg-slate-100 text-slate-700"
                                           )}>
                                              {rec.statut === 'validee' ? 'Conforme' : rec.statut === 'ecart' ? 'Écart' : 'En attente'}
                                           </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                           <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all">
                                              <ExternalLink className="w-4 h-4" />
                                           </button>
                                        </td>
                                     </tr>
                                  ))}
                                  {(!fournisseur.receptions || fournisseur.receptions.length === 0) && (
                                     <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                                           Aucun historique de livraison disponible
                                        </td>
                                     </tr>
                                  )}
                               </tbody>
                            </table>
                          </div>
                       </div>
                    )}

                    {activeTab === 'commandes' && (
                       <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <ShoppingCart className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Commandes fournisseur</h2>
                             </div>
                          </div>
                          
                          {(!localFournisseur.commandes || localFournisseur.commandes.length === 0) ? (
                            <div className="p-12 text-center">
                               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200 dark:border-slate-800">
                                  <ShoppingCart className="w-6 h-6 text-slate-300" />
                               </div>
                               <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Aucune commande active</h3>
                               <p className="text-xs text-slate-500 max-w-xs mx-auto">Toutes les commandes passées à ce fournisseur ont été réceptionnées ou clôturées.</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {localFournisseur.commandes.map(cmd => (
                                <div key={cmd.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800">
                                        <FileText className="w-5 h-5 text-indigo-500" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{cmd.reference}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-widest font-medium font-mono">{formatDate(cmd.date)}</p>
                                        <p className="text-xs text-slate-500 mt-1">{cmd.nbProduits} produits ({cmd.quantiteTotale} pièces)</p>
                                     </div>
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-2">
                                     <span className={cn(
                                       "text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest",
                                       cmd.statut === 'brouillon' ? "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" :
                                       cmd.statut === 'validee' ? "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800" :
                                       cmd.statut === 'envoyee' ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" :
                                       cmd.statut === 'annulee' ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" : ""
                                     )}>
                                       {cmd.statut}
                                     </span>
                                     <p className="text-sm font-bold text-slate-900 dark:text-white">
                                       {cmd.valeurTotale.toLocaleString()} {cmd.devise}
                                     </p>
                                     <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 mt-1">Consulter détail</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                       </div>
                    )}

                    {activeTab === 'garanties' && (
                       <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Accords de Garantie</h2>
                             </div>
                          </div>
                          <div className="p-8">
                             <div className="flex items-start gap-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-slate-100 dark:border-slate-700">
                                   <Shield className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div className="space-y-4">
                                   <div>
                                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Garantie Constructeur Standard</h3>
                                      <p className="text-sm text-slate-500 leading-relaxed max-w-2xl mt-1">
                                         Tous les produits livrés par ce fournisseur bénéficient d'une garantie pièce et main d'œuvre de 24 mois à compter de la date de réception, sauf spécification contraire sur la fiche produit.
                                      </p>
                                   </div>
                                   <div className="flex flex-wrap gap-3">
                                      <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">Durée: 24 mois</span>
                                      <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">Type: Retour Atelier</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    )}
                  </motion.div>
                </AnimatePresence>
             </div>

             {/* Right Fixed Sidebar Layout - Match Product Style */}
             <div className="w-96 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-8 shrink-0 flex flex-col gap-10 sticky top-0 h-full hidden lg:flex">
                <div className="text-center group">
                  <div className="relative inline-block">
                    <span className="block px-6 py-3 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-2xl text-slate-900 dark:text-white rounded-2xl border-2 border-slate-200 dark:border-slate-800 group-hover:border-indigo-400 transition-colors tracking-tighter">
                      {fournisseur.reference}
                    </span>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 bg-white dark:bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                       Réf. Interne
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5" /> Performance Stats
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">Livraisons R.</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">{fournisseur.receptions?.length || 0}</p>
                         </div>
                         <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">Conformité</p>
                            <p className="text-xl font-bold text-emerald-600 font-mono">{fournisseur.tauxConformite}%</p>
                         </div>
                      </div>
                   </div>

                   <div className="h-px bg-slate-100 dark:bg-slate-800" />

                   <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" /> Documents Critiques
                      </h4>
                      <div className="space-y-3">
                         <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 border border-slate-200 dark:border-slate-800 rounded-xl transition-all group">
                            <div className="flex items-center gap-3 overflow-hidden">
                               <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                               <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">Contrat_Distribution.pdf</span>
                            </div>
                            <Download className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 shrink-0" />
                         </button>
                         <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 border border-slate-200 dark:border-slate-800 rounded-xl transition-all group">
                            <div className="flex items-center gap-3 overflow-hidden">
                               <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                               <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">RIB_Validé_2026.pdf</span>
                            </div>
                            <Download className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 shrink-0" />
                         </button>
                      </div>
                   </div>

                   <div className="h-px bg-slate-100 dark:bg-slate-800" />

                   <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> Dernier Check
                      </h4>
                      <div className="flex items-center gap-3 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-2xl">
                         <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shrink-0" />
                         <p className="text-xs font-bold text-amber-800 dark:text-amber-400 tracking-tight leading-relaxed">Dernière vérification administrative faite le 12 mai.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Modals Implementation - Uniform with Reference */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isArchiveModalOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-md"
                onClick={() => setIsArchiveModalOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden relative z-10 flex flex-col"
              >
                <div className="p-8 text-center pb-0 border-b-0">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600">
                    <Archive className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Archiver le fournisseur</h3>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-widest px-4">
                    Confirmez-vous l'archivage de <span className="text-indigo-600 dark:text-indigo-400 font-black">{localFournisseur.name}</span> ?
                  </p>
                  <p className="mt-6 p-4 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl text-xs text-orange-700 dark:text-orange-400 font-medium leading-relaxed text-left italic">
                    L'archivage désactive le fournisseur de la base active. Toutes les données historiques (factures, livraisons) resteront accessibles pour audit.
                  </p>
                </div>
                <div className="p-8 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsArchiveModalOpen(false)}
                    className="flex-1 px-4 py-3 text-[11px] font-black text-slate-500 bg-white border-2 border-slate-100 dark:bg-slate-800 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-[0.2em]"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      setLocalFournisseur({ ...localFournisseur, statut: 'archive' });
                      setIsArchiveModalOpen(false);
                    }}
                    className="flex-1 px-4 py-3 text-[11px] font-black text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-lg shadow-orange-500/20 transition-all uppercase tracking-[0.2em]"
                  >
                    Archiver
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <FournisseurEditModal 
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        fournisseur={localFournisseur}
        mode="duplicate"
        onSave={(newFournisseur) => {
          // In a real app, this would add to the list
          console.log('Duplicated:', newFournisseur);
          onBack();
        }}
      />

      <FournisseurEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        fournisseur={localFournisseur}
        mode="edit"
        onSave={(updatedFournisseur) => {
          setLocalFournisseur(updatedFournisseur);
        }}
      />

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isHistoryModalOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-md"
                onClick={() => setIsHistoryModalOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh]"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3 text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                      <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span>Historique d'audit</span>
                  </div>
                  <button 
                    onClick={() => setIsHistoryModalOpen(false)} 
                    className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                  <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-10 pb-4">
                    {[
                      { date: '28 mai 2026', time: '09:42', type: 'Finance', detail: 'Modification du RIB et conditions de paiement', user: 'Adrian S.' },
                      { date: '15 mars 2026', time: '14:20', type: 'Logistique', detail: 'Actualisation du délai moyen de livraison: 12 jours', user: 'System' },
                      { date: '10 fév. 2026', time: '11:15', type: 'Catalog', detail: 'Mise à jour de 24 tarifs produits via import CSV', user: 'Sarah L.' },
                      { date: '01 janv. 2026', time: '08:30', type: 'Système', detail: 'Initialisation du profil fournisseur', user: 'Admin' },
                    ].map((event, idx) => (
                      <div key={idx} className="relative pl-10">
                        <div className={cn(
                          "absolute w-4 h-4 rounded-full -left-[9px] top-1.5 border-4 border-white dark:border-slate-900 shadow-sm",
                          event.type === 'Système' ? "bg-slate-300 dark:bg-slate-700" : "bg-indigo-600"
                        )}></div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{event.date} • {event.time}</span>
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">{event.type}</span>
                          </div>
                          <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{event.detail}</div>
                          <div className="flex items-center gap-1.5">
                             <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-black text-slate-500">
                                {event.user.charAt(0)}
                             </div>
                             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Édité par {event.user}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="px-6 py-5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-inner shrink-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Journal d'audit chiffré</p>
                  <button
                    onClick={() => setIsHistoryModalOpen(false)}
                    className="px-8 py-2.5 text-[11px] font-black text-slate-900 bg-white border-2 border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-[0.2em] shadow-sm"
                  >
                    Fermer le journal
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <AnimatePresence>
        {isOrderModalOpen && (
          <FournisseurOrderModal 
            isOpen={isOrderModalOpen}
            fournisseur={localFournisseur}
            onClose={() => setIsOrderModalOpen(false)}
            onSave={(order) => {
              // Add simulated order creation
              const updatedFournisseur = { ...localFournisseur };
              if (!updatedFournisseur.commandes) {
                updatedFournisseur.commandes = [];
              }
              updatedFournisseur.commandes.unshift({
                id: order.id,
                reference: order.reference,
                date: order.dateCommande,
                statut: order.statut,
                nbProduits: order.itemsCount || 0,
                quantiteTotale: order.quantiteTotale || 0,
                valeurTotale: order.amount || 0,
                devise: order.currency || localFournisseur.modePaiement?.includes('EUR') ? 'EUR' : localFournisseur.modePaiement?.includes('USD') ? 'USD' : 'DZD'
              });
              setLocalFournisseur(updatedFournisseur);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
