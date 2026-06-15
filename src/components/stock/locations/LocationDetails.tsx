import React, { useState, useRef, useEffect } from 'react';
import { StockLocation, LocationStatus } from './types';
import { ArrowLeft, Edit, MapPin, Gauge, Box, History, Settings, ChevronDown, Package, Archive, Copy, AlertTriangle, QrCode, FileText, User, ShieldAlert, Barcode, ArrowRightLeft, Layers, Download, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { LocationEditModal } from './LocationEditModal';
import { useModules } from '../../../contexts/ModuleContext';

interface LocationDetailsProps {
  location: StockLocation;
  onBack: () => void;
  onUpdate: (location: StockLocation) => void;
  onDelete: () => void;
}

export function LocationDetails({ location: initialLocation, onBack, onUpdate, onDelete }: LocationDetailsProps) {
  const { isModuleEnabled } = useModules();
  const serialNumbersEnabled = isModuleEnabled('numeros-serie');

  const [location, setLocation] = useState<StockLocation>(initialLocation);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [isTitleVisible, setIsTitleVisible] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTitleVisible(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    return () => {
      if (titleRef.current) {
        observer.unobserve(titleRef.current);
      }
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

  const getStatusColor = (status: LocationStatus) => {
    switch (status) {
      case 'Actif': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Saturé': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Maintenance': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Inactif': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const capacityPercent = Math.min(100, (location.usedCapacity / location.maxCapacity) * 100);
  const isSaturated = capacityPercent >= 100;
  const isNearSaturation = capacityPercent >= 85 && !isSaturated;

  const handleDuplicate = () => {
    setIsOptionsOpen(false);
    setIsEditModalOpen(true);
  };

  const handleArchive = () => {
    setIsOptionsOpen(false);
    setIsArchiveConfirmOpen(true);
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
                <div className="font-bold text-slate-900 dark:text-white truncate">{location.name}</div>
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0", getStatusColor(location.status))}>
                  {location.status}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
          >
            <Edit className="w-4 h-4" /> Modifier
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
                    <button
                      onClick={handleArchive}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Archive className="w-4 h-4 text-red-500" /> Désactiver emplacement
                    </button>
                    <button
                      onClick={handleDuplicate}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 text-indigo-500" /> Dupliquer emplacement
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        setIsHistoryModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <History className="w-4 h-4 text-slate-500" /> Historique des changements
                    </button>
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
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{location.name}</h1>
                <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border", getStatusColor(location.status))}>
                  {location.status}
                </span>
              </div>

              {/* Stats Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Box className="w-4 h-4" /> Produits stockés
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{location.productsStoredCount}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Gauge className="w-4 h-4" /> Capacité utilisée
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{capacityPercent.toFixed(0)}%</div>
                    <div className="text-xs text-slate-400 font-medium">{location.usedCapacity}/{location.maxCapacity} {location.capacityUnit}</div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        capacityPercent >= 100 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
                        capacityPercent >= 85 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : 
                        "bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                      )}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>
                {serialNumbersEnabled && (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Barcode className="w-4 h-4" /> Équipements sérialisés
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{location.hasSerializedProducts ? 'Actif' : 'Non'}</div>
                  </div>
                )}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                    <History className="w-4 h-4" /> Dernier mouvement
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {location.movements && location.movements.length > 0 ? location.movements[0].date : 'Aucun'}
                  </div>
                </div>
              </div>
            </div>

            {/* Containers */}
            <div className="p-8 space-y-8">
              {/* 1. Informations générales */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                   <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Informations générales</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nom de l'emplacement</label>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{location.name}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type de lieu</label>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{location.type}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Référence ERP</label>
                        <code className="text-xs bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md text-indigo-600 dark:text-indigo-400 font-mono font-bold">{location.reference}</code>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dépôt parent</label>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{location.parentLocation || 'Racine'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Localisation / Adresse</label>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{location.address || 'Non spécifiée'}</p>
                        {location.city && <p className="text-xs text-slate-500 font-medium">{location.city}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Responsable</label>
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                             {location.manager?.split(' ').map(n => n[0]).join('') || ''}
                           </div>
                           <p className="text-sm font-semibold text-slate-900 dark:text-white">{location.manager}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Capacité */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                   <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Capacité & occupation</h3>
                </div>
                <div className="p-6">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <div className="flex justify-between items-end">
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Taux d'occupation actuel</label>
                              <span className={cn("text-lg font-black", capacityPercent >= 85 ? "text-red-500" : "text-indigo-600 dark:text-indigo-400")}>
                                {capacityPercent.toFixed(1)}%
                              </span>
                           </div>
                           <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative">
                              <div 
                                 className={cn(
                                   "h-full transition-all duration-1000 ease-out",
                                   capacityPercent >= 100 ? "bg-red-500" : 
                                   capacityPercent >= 85 ? "bg-amber-500" : 
                                   "bg-indigo-500"
                                 )}
                                 style={{ width: `${capacityPercent}%` }}
                              />
                           </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                           <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                             <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Maximum</span>
                             <span className="text-lg font-bold text-slate-900 dark:text-white">{location.maxCapacity}</span>
                             <span className="text-[10px] text-slate-500 font-medium ml-1 uppercase">{location.capacityUnit}</span>
                           </div>
                           <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                             <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Occupé</span>
                             <span className="text-lg font-bold text-slate-900 dark:text-white">{location.usedCapacity}</span>
                           </div>
                           <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                             <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Libre</span>
                             <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{location.maxCapacity - location.usedCapacity}</span>
                           </div>
                        </div>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <ShieldAlert className="w-3.5 h-3.5" /> Seuils critiques
                        </h4>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between py-2 border-b border-slate-200/50 dark:border-slate-800/50">
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Alerte de saturation</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{location.alertThreshold} {location.capacityUnit}</span>
                           </div>
                           <p className="text-xs text-slate-500 italic pt-2">L'emplacement passera automatiquement en statut "Saturé" une fois ce seuil franchi.</p>
                        </div>
                     </div>
                   </div>
                </div>
              </div>

              {/* 3. Produits stockés */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                     <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Aperçu du stock présent</h3>
                   </div>
                   <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">Voir l'inventaire complet</button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full divide-y divide-slate-100 dark:divide-slate-800">
                      <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                         <tr>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Référence</th>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produit</th>
                            <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Physique</th>
                            <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Réservé</th>
                            <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disponible</th>
                            {serialNumbersEnabled && <th className="px-6 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">S/N</th>}
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {location.products?.map((prod) => (
                           <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-3.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{prod.reference}</td>
                              <td className="px-6 py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">{prod.name}</td>
                              <td className="px-6 py-3.5 text-xs font-black text-slate-900 dark:text-white text-right">{prod.physicalQuantity}</td>
                              <td className="px-6 py-3.5 text-xs font-semibold text-amber-600 dark:text-amber-400 text-right">{prod.reservedQuantity}</td>
                              <td className="px-6 py-3.5 text-xs font-black text-emerald-600 dark:text-emerald-400 text-right">{prod.availableQuantity}</td>
                              {serialNumbersEnabled && (
                                <td className="px-6 py-3.5 text-center">
                                  {prod.isSerialized && <Barcode className="w-3.5 h-3.5 text-slate-400 inline-block" />}
                                </td>
                              )}
                           </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              </div>

              {/* 4. Flux */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                   <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Derniers flux logistiques</h3>
                </div>
                <div className="p-6">
                   <div className="space-y-4">
                      {location.movements?.map((m) => (
                         <div key={m.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30">
                            <div className="flex items-center gap-4">
                               <div className={cn(
                                 "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
                                 m.type === 'Entrée' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                 m.type === 'Sortie' ? "bg-red-50 text-red-600 border-red-100" :
                                 "bg-indigo-50 text-indigo-600 border-indigo-100"
                               )}>
                                  {m.type === 'Entrée' ? <Package className="w-5 h-5" /> : m.type === 'Sortie' ? <ArrowLeft className="w-5 h-5 rotate-180" /> : <ArrowRightLeft className="w-5 h-5" />}
                               </div>
                               <div>
                                  <div className="flex items-center gap-2">
                                     <span className="text-sm font-bold text-slate-900 dark:text-white">{m.productName}</span>
                                     <span className={cn(
                                       "text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                                       m.type === 'Entrée' ? "bg-emerald-100 text-emerald-700" :
                                       m.type === 'Sortie' ? "bg-red-100 text-red-700" :
                                       "bg-indigo-100 text-indigo-700"
                                     )}>{m.type}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">{m.date} par {m.user}</span>
                               </div>
                            </div>
                            <span className={cn(
                               "text-lg font-black",
                               m.type === 'Entrée' ? "text-emerald-500" : "text-red-500"
                            )}>
                               {m.type === 'Entrée' ? '+' : '-'}{m.quantity}
                            </span>
                         </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* 5. Hiérarchie */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                   <div className="w-1.5 h-4 bg-slate-500 rounded-full" />
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Hiérarchie & Emplacements liés</h3>
                </div>
                <div className="p-8 flex items-center gap-4 flex-wrap">
                   <div className="flex items-center gap-2">
                      <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border text-sm font-bold text-slate-600">
                        {location.hierarchy?.depot || "Dépôt Principal"}
                      </div>
                      <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180" />
                   </div>
                   {location.hierarchy?.zone && (
                     <div className="flex items-center gap-2">
                        <div className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border text-sm font-bold text-slate-600">
                           {location.hierarchy.zone}
                        </div>
                        <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180" />
                     </div>
                   )}
                   <div className="px-4 py-2 rounded-lg bg-indigo-600 text-white border-indigo-500 text-sm font-bold shadow-md">
                      {location.name}
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right SIDEBAR Panel */}
          <div className="w-[340px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shrink-0 overflow-y-auto hidden xl:flex flex-col">
            <div className="p-8 space-y-8">
              {/* Reference & QR Section */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Référence Emplacement</label>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl group transition-all hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200">
                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-tight">{location.reference}</span>
                    <Copy className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" title="Copier" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Code emplacement (QR)</label>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group">
                     <div className="w-40 h-40 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-100/50 relative overflow-hidden group-hover:border-indigo-100 transition-colors">
                        <QrCode className="w-32 h-32 text-slate-900 dark:text-white transition-transform group-hover:scale-95 duration-500" />
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mt-2 group-hover:text-indigo-500 transition-colors">Scanner pour identifier</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800" />

              {/* Quick Info List */}
              <div className="space-y-6">
                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Aperçu rapide</label>
                   <ul className="space-y-4">
                     <li className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                         <Layers className="w-4 h-4 text-indigo-600" />
                       </div>
                       <div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none mb-1">Type</span>
                         <span className="text-sm font-bold text-slate-900 dark:text-white">{location.type}</span>
                       </div>
                     </li>
                     <li className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                         <User className="w-4 h-4 text-indigo-600" />
                       </div>
                       <div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none mb-1">Responsable</span>
                         <span className="text-sm font-bold text-slate-900 dark:text-white">{location.manager}</span>
                       </div>
                     </li>
                   </ul>
                 </div>

                 {/* Documents */}
                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                     Documents liés
                     <Plus className="w-3.5 h-3.5 text-indigo-600 cursor-pointer" />
                   </label>
                   <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 group cursor-pointer hover:border-indigo-100 transition-all">
                         <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                         <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex-1 truncate">Plan_depôt_2026.pdf</span>
                      </div>
                   </div>
                 </div>

                 {/* Alerts */}
                 {(isSaturated || isNearSaturation || location.status === 'Maintenance') && (
                    <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800 text-red-500">
                      <label className="block text-[10px] font-black uppercase tracking-widest pb-1 flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5" /> Alertes critiques
                      </label>
                      {isSaturated && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-3">
                           <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                           <p className="text-[11px] font-bold text-red-700 dark:text-red-400 leading-tight">Cet emplacement est saturé. Les nouvelles entrées de stock sont bloquées.</p>
                        </div>
                      )}
                      {isNearSaturation && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl flex items-start gap-3">
                           <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                           <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 leading-tight">Seuil de saturation presque atteint (85%+).</p>
                        </div>
                      )}
                    </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LocationEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updated) => {
          onUpdate(updated);
          setIsEditModalOpen(false);
        }}
        location={location}
      />

      <AnimatePresence>
        {isArchiveConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsArchiveConfirmOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-8 text-center flex flex-col items-center">
                 <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <AlertTriangle className="w-7 h-7 text-red-600" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Désactiver l'emplacement ?</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                   Êtes-vous sûr de vouloir désactiver cet emplacement ? Il ne pourra plus être utilisé pour de nouveaux mouvements de stock.
                 </p>
                 <div className="flex gap-3 w-full">
                   <button
                     onClick={() => setIsArchiveConfirmOpen(false)}
                     className="flex-1 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                   >
                     Annuler
                   </button>
                   <button
                     onClick={() => {
                        const updated = { ...location, status: 'Inactif' as LocationStatus };
                        onUpdate(updated);
                        setIsArchiveConfirmOpen(false);
                     }}
                     className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                   >
                     Désactiver
                   </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
