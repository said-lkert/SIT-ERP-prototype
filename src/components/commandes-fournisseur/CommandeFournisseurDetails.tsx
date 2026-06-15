import React, { useState, useRef, useEffect } from 'react';
import { CommandeFournisseur, CommandeFournisseurStatus } from './types';
import { ArrowLeft, Edit, Copy, Settings, ChevronDown, Package, FileText, CheckCircle2, History, Truck, MapPin, Archive, Info, Plus } from 'lucide-react';
import { cn, safeFormatDate, safeFormatDateTime } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { PurchaseOrderPreview } from './PurchaseOrderPreview';

interface CommandeFournisseurDetailsProps {
  commande: CommandeFournisseur;
  onBack: () => void;
}

export function CommandeFournisseurDetails({ commande, onBack }: CommandeFournisseurDetailsProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isPurchaseOrderOpen, setIsPurchaseOrderOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isTitleVisible, setIsTitleVisible] = useState(true);
  const titleRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusColor = (status: CommandeFournisseurStatus) => {
    switch (status) {
      case 'Brouillon': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'Validée': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Envoyée': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Partiellement reçue': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Reçue': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Annulée': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const totalQte = commande.lignes.reduce((sum, l) => sum + l.qteCmd, 0);
  const totalRecue = commande.lignes.reduce((sum, l) => sum + l.qteRecue, 0);
  const remainingRecue = Math.max(0, totalQte - totalRecue);
  const valeurEst = commande.lignes.reduce((sum, l) => sum + (l.qteCmd * l.prixU), 0);
  
  let statutReception = 'Non reçue';
  if (totalRecue > 0 && totalRecue < totalQte) statutReception = 'Partielle';
  if (totalRecue > 0 && totalRecue >= totalQte) statutReception = 'Complète';

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Top Actions Bar */}
      <div className="relative flex items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0 transition-all duration-300">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors relative z-10 shrink-0"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Retour à la liste</span>
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
                <div className="font-bold text-slate-900 dark:text-white truncate">Commande {commande.reference}</div>
                <div className="hidden md:flex items-center justify-center shrink-0">
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded border", getStatusColor(commande.statut))}>
                    {commande.statut}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          {commande.statut === 'Brouillon' && (
             <button 
               className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
             >
               <Edit className="w-4 h-4" /> Modifier
             </button>
          )}
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
              Options
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  isOptionsOpen && "rotate-180",
                )}
              />
            </button>
            {isOptionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <style>{`
                  .group:hover .animate-scroll-text {
                    animation: scroll-text-x 2.5s linear infinite alternate;
                  }
                  @keyframes scroll-text-x {
                    0%, 15% { transform: translateX(0); }
                    85%, 100% { transform: translateX(-40px); }
                  }
                `}</style>
                <div className="p-1.5 text-slate-700 dark:text-slate-300">
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      setIsPurchaseOrderOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group relative border-none text-left"
                  >
                    <FileText className="w-4 h-4 text-slate-500 shrink-0" /> 
                    <div className="flex-1 overflow-hidden relative text-left">
                       <span className="block w-full truncate group-hover:opacity-0 transition-opacity">Consulter bon de commande</span>
                       <div className="absolute top-0 left-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="inline-block animate-scroll-text">Consulter bon de commande</span>
                       </div>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border-none text-left">
                    <Copy className="w-4 h-4 text-indigo-500 shrink-0" /> Exporter commande
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border-none group relative text-left">
                    <History className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" /> 
                    <div className="flex-1 overflow-hidden relative text-left">
                      <span className="block w-full truncate group-hover:opacity-0 transition-opacity">Historique des changements</span>
                      <div className="absolute top-0 left-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                         <span className="inline-block animate-scroll-text">Historique des changements</span>
                      </div>
                    </div>
                  </button>
                  
                  {['Validée', 'Envoyée', 'Partiellement reçue'].includes(commande.statut) && (
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-indigo-600 dark:text-indigo-400 border-none group relative text-left">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> 
                      <div className="flex-1 overflow-hidden relative text-left">
                        <span className="block w-full truncate group-hover:opacity-0 transition-opacity">Créer réception</span>
                        <div className="absolute top-0 left-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                           <span className="inline-block animate-scroll-text">Créer réception depuis cette commande</span>
                        </div>
                      </div>
                    </button>
                  )}
                  
                  {['Brouillon', 'Envoyée'].includes(commande.statut) && (
                     <>
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-red-600 dark:text-red-400 border-none group relative text-left">
                          <Archive className="w-4 h-4 shrink-0" /> 
                          <span className="block w-full truncate text-left">Annuler commande</span>
                        </button>
                     </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full max-w-[2000px] mx-auto z-0">
        <div className="flex min-h-full">
          {/* Main Area */}
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
             
             {/* Header Info */}
             <div className="px-8 pt-8 pb-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center justify-between mb-4" ref={titleRef}>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                     Commande {commande.reference}
                  </h1>
                  <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border", getStatusColor(commande.statut))}>
                     {commande.statut}
                  </span>
                </div>
                
                {/* Cards en haut */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                   <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                         <Package className="w-4 h-4" /> Quantité commandée
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalQte}</div>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                         <FileText className="w-4 h-4" /> Valeur estimée
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white truncate">{valeurEst.toLocaleString()} {commande.devise}</div>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                         <Package className="w-4 h-4" /> Produits concernés
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{commande.lignes.length} réf.</div>
                   </div>
                   <div className={cn(
                     "rounded-xl p-4 border transition-colors",
                     remainingRecue > 0 ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800" 
                     : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                   )}>
                      <div className={cn(
                        "text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2",
                        remainingRecue > 0 ? "text-orange-800 dark:text-orange-400" : "text-emerald-800 dark:text-emerald-400"
                      )}>
                         <Truck className="w-4 h-4" /> Réception restante
                      </div>
                      <div className={cn("text-2xl font-bold", remainingRecue === 0 ? "text-emerald-600 dark:text-emerald-500" : "text-orange-600 dark:text-orange-500")}>
                         {remainingRecue}
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex-1 p-4 sm:p-8 space-y-6">

                {/* 1. Informations commande */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" /> Informations métier
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                         <span className="text-sm text-slate-500 dark:text-slate-400">Référence</span>
                         <span className="text-sm font-medium text-slate-900 dark:text-white font-mono">{commande.reference}</span>
                       </div>
                       <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                         <span className="text-sm text-slate-500 dark:text-slate-400">Fournisseur</span>
                         <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{commande.fournisseurName}</span>
                       </div>
                       <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                         <span className="text-sm text-slate-500 dark:text-slate-400">Date commande</span>
                         <span className="text-sm font-medium text-slate-900 dark:text-white">{safeFormatDate(commande.dateCommande)}</span>
                       </div>
                       <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                         <span className="text-sm text-slate-500 dark:text-slate-400">Date livraison prévue</span>
                         <span className="text-sm font-medium text-slate-900 dark:text-white">{safeFormatDate(commande.dateLivraisonPrevue)}</span>
                       </div>
                       <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                         <span className="text-sm text-slate-500 dark:text-slate-400">Responsable</span>
                         <span className="text-sm font-medium text-slate-900 dark:text-white">{commande.responsableName}</span>
                       </div>
                       <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                         <span className="text-sm text-slate-500 dark:text-slate-400">Statut</span>
                         <span className="text-sm font-medium text-slate-900 dark:text-white">{commande.statut}</span>
                       </div>
                    </div>
                    <div className="pt-2 flex flex-col">
                      <span className="text-sm text-slate-500 dark:text-slate-400 mb-1 border-none pb-0">Commentaire</span>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg ring-1 ring-slate-200 dark:ring-slate-800/50">
                        {commande.commentaire || "Aucun commentaire."}
                      </p>
                    </div>
                </div>

                {/* 2. Produits commandés */}
                <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400" /> Produits commandés
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                           <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-500">
                               <tr>
                                   <th className="px-6 py-3 text-left">Produit</th>
                                   <th className="px-6 py-3 text-left">Réf. Fournisseur</th>
                                   <th className="px-6 py-3 text-center">Qté Cmd</th>
                                   <th className="px-6 py-3 text-center">Qté Reçue</th>
                                   <th className="px-6 py-3 text-center">Reste</th>
                                   <th className="px-6 py-3 text-right">Prix HT</th>
                                   <th className="px-6 py-3 text-right">Total Ligne</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                               {commande.lignes.map(l => {
                                   const reste = Math.max(0, l.qteCmd - l.qteRecue);
                                   return (
                                     <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                         <td className="px-6 py-4 font-medium text-slate-900 dark:text-white text-sm">{l.productName}</td>
                                         <td className="px-6 py-4 text-slate-500 font-mono text-xs">{l.refFournisseur}</td>
                                         <td className="px-6 py-4 text-slate-900 dark:text-white font-semibold text-center text-sm">{l.qteCmd}</td>
                                         <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-semibold text-center text-sm">{l.qteRecue}</td>
                                         <td className={cn("px-6 py-4 font-semibold text-center text-sm", reste > 0 ? "text-orange-500 dark:text-orange-400" : "text-emerald-500 dark:text-emerald-400")}>{reste}</td>
                                         <td className="px-6 py-4 text-right text-slate-900 dark:text-white text-sm">{l.prixU.toLocaleString()} {commande.devise}</td>
                                         <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white text-sm">{(l.qteCmd * l.prixU).toLocaleString()} {commande.devise}</td>
                                     </tr>
                                   )
                               })}
                           </tbody>
                       </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 3. Suivi réception */}
                  <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Truck className="w-4 h-4 text-slate-400" /> Suivi réception
                        </h3>
                        {['Validée', 'Envoyée', 'Partiellement reçue'].includes(commande.statut) && (
                          <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">Créer réception</button>
                        )}
                      </div>
                      <div className="space-y-4 mb-8">
                         <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                           <div>
                             <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">Réception liée</div>
                             <div className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm cursor-pointer hover:underline">{commande.receptionId ? 'BR-2026-X' : 'Aucune'}</div>
                           </div>
                         </div>
                         <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                           <div>
                             <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">Statut de la réception</div>
                             <div className={cn(
                               "text-xs font-bold px-2 py-0.5 rounded uppercase mt-2 inline-block",
                               statutReception === 'Complète' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" :
                               statutReception === 'Partielle' ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                             )}>{statutReception}</div>
                           </div>
                         </div>
                      </div>
                      
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Statistiques quantités</h4>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10">
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalRecue}</div>
                            <div className="text-[10px] sm:text-xs text-emerald-800 dark:text-emerald-500 uppercase font-semibold mt-1">Total reçu</div>
                          </div>
                          <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-orange-50/50 dark:bg-orange-900/10">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{remainingRecue}</div>
                            <div className="text-[10px] sm:text-xs text-orange-800 dark:text-orange-500 uppercase font-semibold mt-1">Reste à recevoir</div>
                          </div>
                      </div>
                  </div>

                  {/* 4. Conditions commerciales */}
                  <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" /> Conditions commerciales
                      </h3>
                      <div className="space-y-3">
                         <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                           <span className="text-sm text-slate-500 dark:text-slate-400">Mode de paiement</span>
                           <span className="text-sm font-medium text-slate-900 dark:text-white">{commande.modePaiement}</span>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                           <span className="text-sm text-slate-500 dark:text-slate-400">Devise</span>
                           <span className="text-sm font-medium text-slate-900 dark:text-white">{commande.devise}</span>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                           <span className="text-sm text-slate-500 dark:text-slate-400">Remise globale</span>
                           <span className="text-sm font-medium text-slate-900 dark:text-white">{commande.remise} %</span>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                           <span className="text-sm text-slate-500 dark:text-slate-400">Frais de livraison</span>
                           <span className="text-sm font-medium text-slate-900 dark:text-white">{commande.fraisLivraison} {commande.devise}</span>
                         </div>
                      </div>
                      {(commande.conditionsParticulieres || '').trim() && (
                        <div className="pt-2 flex flex-col">
                          <span className="text-sm text-slate-500 dark:text-slate-400 mb-1 border-none pb-0">Conditions particulières</span>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg ring-1 ring-slate-200 dark:ring-slate-800/50 text-wrap">
                            {commande.conditionsParticulieres}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
                
                {/* 6. Historique */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-400" /> Historique de la commande
                    </h3>
                    <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-slate-200 dark:before:bg-slate-800 mt-6">
                        <div className="relative flex gap-4">
                           <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-950" />
                           <div className="ml-6 space-y-1">
                             <p className="text-sm font-semibold text-slate-900 dark:text-white">Commande créée</p>
                             <p className="text-xs text-slate-500">{safeFormatDateTime(commande.createdAt)} par {commande.responsableName}</p>
                           </div>
                        </div>
                        <div className="relative flex gap-4">
                           <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-950" />
                           <div className="ml-6 space-y-1">
                             <p className="text-sm font-semibold text-slate-900 dark:text-white">Commande validée</p>
                             <p className="text-xs text-slate-500">{safeFormatDateTime(commande.createdAt)} par {commande.responsableName}</p>
                           </div>
                        </div>
                        {['Envoyée', 'Partiellement reçue', 'Reçue'].includes(commande.statut) && (
                          <div className="relative flex gap-4">
                             <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-950" />
                             <div className="ml-6 space-y-1">
                               <p className="text-sm font-semibold text-slate-900 dark:text-white">Commande envoyée au fournisseur</p>
                               <p className="text-xs text-slate-500">Document PDF généré et rattaché.</p>
                             </div>
                          </div>
                        )}
                        {['Partiellement reçue', 'Reçue'].includes(commande.statut) && (
                          <div className="relative flex gap-4">
                             <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-orange-500 ring-4 ring-white dark:ring-slate-950" />
                             <div className="ml-6 space-y-1">
                               <p className="text-sm font-semibold text-slate-900 dark:text-white">Réception fournisseur initiée</p>
                               <p className="text-xs text-slate-500">Mise à jour des quantités reçues : {totalRecue}/{totalQte}.</p>
                             </div>
                          </div>
                        )}
                    </div>
                </div>

             </div>
          </div>

          {/* Right SIDEBAR (Fixed panel) */}
          <div className="w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-6 shrink-0 flex flex-col gap-8 hidden lg:flex">
             
             {/* Référence rapide */}
             <div>
               <div className="w-full aspect-square rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4">
                 <Package className="w-16 h-16 text-slate-300 dark:text-slate-700" />
               </div>
               <div className="text-center">
                 <span className="inline-block bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-700 dark:text-slate-300">
                   {commande.reference}
                 </span>
               </div>
             </div>

             <div className="h-px bg-slate-200 dark:bg-slate-800" />

             {/* Infos rapides */}
             <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Informations rapides</h3>
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] text-slate-400 uppercase tracking-wider">Fournisseur</span>
                     <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[150px]" title={commande.fournisseurName}>{commande.fournisseurName}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] text-slate-400 uppercase tracking-wider">Valeur totale</span>
                     <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{valeurEst.toLocaleString()} {commande.devise}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] text-slate-400 uppercase tracking-wider">Livraison prévue</span>
                     <span className="text-sm font-medium text-slate-900 dark:text-white">{safeFormatDate(commande.dateLivraisonPrevue)}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] text-slate-400 uppercase tracking-wider">Responsable</span>
                     <span className="text-sm font-medium text-slate-900 dark:text-white">{commande.responsableName}</span>
                   </div>
                   <div className="pt-2">
                     <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium leading-relaxed">
                         <span className="font-bold flex items-center gap-1 mb-1"><CheckCircle2 className="w-3.5 h-3.5"/> Impact stock</span>
                         Aucun impact stock physique avant validation de la réception.
                     </div>
                   </div>
                </div>
             </div>

             <div className="h-px bg-slate-200 dark:bg-slate-800" />

             {/* Documents */}
             <div>
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Documents utiles</h3>
               </div>
               
               <div className="space-y-2">
                 <button
                   onClick={() => setIsPurchaseOrderOpen(true)}
                   className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group text-left"
                 >
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                       <FileText className="w-4 h-4" />
                     </div>
                     <div>
                       <div className="text-sm font-medium text-slate-900 dark:text-white">BC_Généré</div>
                       <div className="text-xs text-slate-500">PDF • 120 KB</div>
                     </div>
                   </div>
                 </button>
                 
                 <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group text-left">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                       <FileText className="w-4 h-4" />
                     </div>
                     <div>
                       <div className="text-sm font-medium text-slate-900 dark:text-white">Devis_Frs</div>
                       <div className="text-xs text-slate-500">PDF • 450 KB</div>
                     </div>
                   </div>
                 </button>
               </div>

               <button className="mt-4 w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors">
                 <Plus className="w-4 h-4" />
                 Ajouter document
               </button>
             </div>

          </div>
        </div>
      </div>

      <PurchaseOrderPreview
        isOpen={isPurchaseOrderOpen}
        onClose={() => setIsPurchaseOrderOpen(false)}
        commande={commande}
      />
    </div>
  );
}
