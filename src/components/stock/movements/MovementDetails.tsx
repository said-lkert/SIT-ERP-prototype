import React, { useState, useRef, useEffect } from 'react';
import { StockMovement, MovementType, MovementStatus } from './types';
import { ArrowLeft, Settings, ChevronDown, Download, FileText, History, Package, ArrowRightLeft, User, ShieldAlert, Barcode, Calendar, Box, TrendingUp, DollarSign, ExternalLink, Archive, Copy, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface MovementDetailsProps {
  movement: StockMovement;
  onBack: () => void;
}

export function MovementDetails({ movement, onBack }: MovementDetailsProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [isTitleVisible, setIsTitleVisible] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsTitleVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
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

  const getTypeBadgeColor = (type: MovementType) => {
    switch (type) {
      case 'Entrée': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Sortie': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Transfert': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Correction': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Réservation': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Retour fournisseur': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusBadgeColor = (status: MovementStatus) => {
    switch (status) {
      case 'Validé': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Écart détecté': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Annulé': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      case 'Brouillon': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {/* Top Actions Bar */}
      <div className="relative flex items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0 z-40">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors relative z-10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Retour à la liste</span>
          <span className="sm:hidden">Retour</span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 flex justify-center overflow-hidden max-w-[40%] pointer-events-none">
          <AnimatePresence>
            {!isTitleVisible && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 pointer-events-auto"
              >
                <div className="font-bold text-slate-900 dark:text-white truncate">{movement.type} - {movement.product.name}</div>
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 uppercase tracking-widest", getStatusBadgeColor(movement.status))}>
                  {movement.status}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
              Options
              <ChevronDown className={cn("w-4 h-4 transition-transform", isOptionsOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {isOptionsOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  <div className="p-1.5 text-slate-700 dark:text-slate-300">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <FileText className="w-4 h-4 text-indigo-500" /> Consulter document lié
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-slate-500" /> Exporter mouvement
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <History className="w-4 h-4 text-slate-500" /> Historique des changements
                    </button>
                    {(movement.status === 'Brouillon' || movement.status === 'Écart détecté') && (
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors">
                        <AlertTriangle className="w-4 h-4" /> Annuler mouvement
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full">
          {/* Left MAIN area */}
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
            {/* Header Info */}
            <div className="px-8 pt-8 pb-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-6" ref={titleRef}>
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {movement.type} stock - {movement.product.reference}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border uppercase tracking-wider", getTypeBadgeColor(movement.type))}>
                    {movement.type}
                  </span>
                  <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border uppercase tracking-wider", getStatusBadgeColor(movement.status))}>
                    {movement.status}
                  </span>
                </div>
              </div>

              {/* Stats Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 opacity-70" /> Quantité
                  </div>
                  <div className={cn("text-2xl font-black", movement.quantity > 0 ? "text-emerald-500" : "text-red-500")}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </div>
                </div>
                {movement.value && (
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 opacity-70" /> Valeur estimée
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {Math.abs(movement.value).toLocaleString()} <span className="text-sm font-bold opacity-50">DA</span>
                    </div>
                  </div>
                )}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <ArrowRightLeft className="w-3.5 h-3.5 opacity-70" /> Source
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{movement.source.name}</div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">{movement.source.type}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <ArrowRightLeft className="w-3.5 h-3.5 opacity-70 rotate-180" /> Destination
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{movement.destination.name}</div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">{movement.destination.type}</span>
                </div>
              </div>
            </div>

            {/* Containers Area */}
            <div className="p-8 space-y-8">
              {/* 1. Résumé du mouvement */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                   <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Résumé du mouvement</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Type Mouvement</label>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{movement.type}</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date & Heure</label>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{movement.date}</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Responsable</label>
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-slate-200">
                             {(movement.responsible || '').split(' ').map(n => n[0]).join('')}
                         </div>
                         <p className="text-sm font-bold text-slate-900 dark:text-white">{movement.responsible}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Statut Actuel</label>
                      <span className={cn("text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest", getStatusBadgeColor(movement.status))}>
                        {movement.status}
                      </span>
                    </div>
                  </div>
                  {movement.comment && (
                    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> Commentaire / Motif
                      </label>
                      <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{movement.comment}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Produit concerné */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                     <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Produit concerné</h3>
                   </div>
                   <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-1">
                     Ouvrir fiche produit <ExternalLink className="w-3 h-3" />
                   </button>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-8">
                     <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Référence</label>
                              <code className="text-sm font-mono font-black text-indigo-600 dark:text-indigo-400">{movement.product.reference}</code>
                           </div>
                           <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Famille</label>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{movement.product.family || '-'}</p>
                           </div>
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nom complet</label>
                           <p className="text-sm font-bold text-slate-900 dark:text-white">{movement.product.name}</p>
                        </div>
                        <div className="pt-2 flex items-center gap-6">
                           <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", movement.product.isSerialized ? "bg-emerald-500" : "bg-slate-300")} />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Produit sérialisé</span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="shrink-0 w-full md:w-64 bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Impact Stock Physique</h4>
                        <div className="flex items-center justify-between gap-4">
                           <div className="text-center flex-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Avant</span>
                              <span className="text-xl font-black text-slate-400">{movement.product.stockBefore}</span>
                           </div>
                           <ArrowRightLeft className="w-5 h-5 text-slate-300 shrink-0" />
                           <div className="text-center flex-1">
                              <span className="text-[10px] font-bold text-indigo-500 uppercase block mb-1">Après</span>
                              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{movement.product.stockAfter}</span>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* 3. Emplacements */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                   <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Flux : Logistique & Positions</h3>
                </div>
                <div className="p-8">
                   <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                      {/* Source */}
                      <div className="w-full lg:w-[40%] flex flex-col items-center lg:items-start text-center lg:text-left space-y-3">
                         <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 shadow-sm">
                            <Archive className="w-6 h-6" />
                         </div>
                         <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Origine</span>
                            <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{movement.source.name}</div>
                            <span className="text-xs font-bold text-indigo-600 opacity-70 uppercase tracking-wide">{movement.source.type}</span>
                         </div>
                         {movement.source.locationId && (
                           <button className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 hover:underline">Voir l'emplacement <ExternalLink className="w-2.5 h-2.5" /></button>
                         )}
                      </div>

                      {/* Direction Icon */}
                      <div className="shrink-0 flex items-center justify-center">
                         <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center relative">
                            <ArrowRightLeft className="w-5 h-5 text-indigo-300" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-slate-950 ring-2 ring-slate-50 dark:ring-slate-900 rounded-full flex items-center justify-center">
                               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            </div>
                         </div>
                      </div>

                      {/* Destination */}
                      <div className="w-full lg:w-[40%] flex flex-col items-center lg:items-end text-center lg:text-right space-y-3">
                         <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 shadow-sm">
                            <Box className="w-6 h-6" />
                         </div>
                         <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Destination</span>
                            <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{movement.destination.name}</div>
                            <span className="text-xs font-bold text-indigo-600 opacity-70 uppercase tracking-wide">{movement.destination.type}</span>
                         </div>
                         {movement.destination.locationId && (
                           <button className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 hover:underline">Voir l'emplacement <ExternalLink className="w-2.5 h-2.5" /></button>
                         )}
                      </div>
                   </div>
                </div>
              </div>

              {/* 4. Numéros de série liés */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                     <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Unités identifiées (S/N)</h3>
                   </div>
                   {movement.product.isSerialized && movement.serialNumbers && (
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{movement.serialNumbers.length} unité(s)</span>
                   )}
                </div>
                <div className="p-6">
                  {movement.product.isSerialized ? (
                    movement.serialNumbers && movement.serialNumbers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {movement.serialNumbers.map((sn, idx) => (
                           <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                    <Barcode className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <span className="text-sm font-mono font-black text-slate-900 dark:text-white">{sn.number}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">{sn.oldStatus}</span>
                                      <ArrowLeft className="w-2.5 h-2.5 text-slate-300 rotate-180" />
                                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">{sn.newStatus}</span>
                                    </div>
                                 </div>
                              </div>
                              <button className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Consulter unit</button>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                         <Barcode className="w-10 h-10 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                         <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Aucun numéro de série rattaché</p>
                         <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto italic">Ce produit est configuré comme sérialisé mais aucune unité spécifique n'a été rattachée à ce mouvement.</p>
                      </div>
                    )
                  ) : (
                    <div className="p-12 text-center">
                       <p className="text-sm text-slate-400 italic">Ce produit n'est pas géré par numéros de série.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Document lié */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                   <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Document lié & Référence ERP</h3>
                </div>
                <div className="p-6">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-600">
                         <FileText className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-widest">{movement.linkedDocument.type}</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight">{movement.linkedDocument.reference}</span>
                         </div>
                         <p className="text-xs text-slate-500 mt-1">Cliquez pour consulter ou télécharger le document numérique original.</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
                        <Download className="w-4 h-4" /> PDF
                      </button>
                   </div>
                </div>
              </div>

              {/* 6. Historique / Audit */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                   <div className="w-1.5 h-4 bg-slate-500 rounded-full" />
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Audit & Historique des actions</h3>
                </div>
                <div className="p-8">
                  <div className="relative space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
                    {movement.history.map((h, i) => (
                       <div key={h.id} className="relative pl-10 flex items-start gap-4 group">
                          <div className={cn(
                            "absolute left-0 w-8 h-8 rounded-full border-2 bg-white dark:bg-slate-900 flex items-center justify-center z-10 transition-colors duration-500",
                            i === 0 ? "border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20" : "border-slate-200"
                          )}>
                             {i === 0 ? <CheckCircle2 className="w-4 h-4 text-indigo-500" /> : <Clock className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />}
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{h.action}</h4>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h.date}</span>
                             </div>
                             <p className="text-xs text-slate-500 font-medium">Réalisé par <span className="text-slate-700 dark:text-slate-300 font-bold">{h.user}</span></p>
                             {h.details && <p className="text-xs text-slate-500 mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 border-l-4 border-l-indigo-500 italic">"{h.details}"</p>}
                          </div>
                       </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right SIDEBAR Panel */}
          <div className="w-[340px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shrink-0 overflow-y-auto hidden xl:flex flex-col z-0">
            <div className="p-8 space-y-8">
              {/* Movement ID & Status */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Référence Mouvement</label>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl group transition-all hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 cursor-default">
                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-tight">{movement.reference}</span>
                    <Copy className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" title="Copier" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-800">Informations Clés</label>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-indigo-600" />
                       </div>
                       <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none mb-1">Responsable</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{movement.responsible}</span>
                       </div>
                    </li>
                    <li className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                       </div>
                       <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none mb-1">Crée le</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{movement.date}</span>
                       </div>
                    </li>
                    {movement.validationDate && (
                      <li className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none mb-1">Validé le</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{movement.validationDate}</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="space-y-3">
                   <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-800">Support Digital</label>
                   <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 group cursor-pointer hover:border-amber-200 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                         <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Fichier attaché</span>
                         <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">{movement.linkedDocument.reference}.pdf</span>
                      </div>
                      <Download className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                   </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800" />

              {/* Warnings/Context */}
              {movement.status === 'Écart détecté' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                     <ShieldAlert className="w-4 h-4 text-red-600" />
                     <span className="text-xs font-black text-red-800 dark:text-red-400 uppercase tracking-widest">Alerte Écart</span>
                  </div>
                  <p className="text-[11px] font-medium text-red-700 dark:text-red-400 leading-relaxed italic">
                    "Cet écart de stock impacte la valeur globale de l'inventaire. Une correction de régularisation est fortement conseillée."
                  </p>
                  <button className="mt-4 w-full py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95">
                    Générer correction
                  </button>
                </div>
              )}

              {movement.status === 'Brouillon' && (
                 <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2 text-amber-600">
                       <Clock className="w-4 h-4" />
                       <span className="text-xs font-black uppercase tracking-widest">En attente</span>
                    </div>
                    <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 leading-relaxed italic">
                       "Ce mouvement n'a pas encore validé les stocks physiques. Il peut être encore modifié ou annulé."
                    </p>
                    <button className="mt-4 w-full py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95">
                       Valider mouvement
                    </button>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
