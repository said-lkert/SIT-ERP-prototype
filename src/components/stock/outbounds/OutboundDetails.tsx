import React, { useState, useRef, useEffect } from 'react';
import { StockOutbound, OutboundStatus, OutboundProduct } from './types';
import { 
  ArrowLeft, Settings, ChevronDown, Download, FileText, History, 
  Package, User, ShieldAlert, Barcode, Calendar, Box, 
  DollarSign, ExternalLink, Archive, Copy, AlertTriangle, 
  CheckCircle2, Clock, Building2, Truck, FileCheck, Tag, Info, ListFilter, AlertCircle, LogOut, Plus
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useModules } from '../../../contexts/ModuleContext';
import { OutboundDocumentPreview } from './OutboundDocumentPreview';
import { OutboundReturnModal } from './OutboundReturnModal';

interface OutboundDetailsProps {
  outbound: StockOutbound;
  onBack: () => void;
  onEdit?: (outbound: StockOutbound) => void;
  onChanged?: () => void;
}

export function OutboundDetails({ outbound, onBack, onEdit, onChanged }: OutboundDetailsProps) {
  const { isModuleEnabled } = useModules();
  const serialNumbersEnabled = isModuleEnabled('numeros-serie');

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [isTitleVisible, setIsTitleVisible] = useState(true);
  const [preview, setPreview] = useState<'Bon de sortie' | 'Bon de retour' | null>(null);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [actionError, setActionError] = useState('');

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

  const getStatusBadgeColor = (status: OutboundStatus) => {
    switch (status) {
      case 'Validée': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Écart détecté': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Annulée': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Brouillon': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Neuf': return 'text-emerald-600 dark:text-emerald-400';
      case 'Abîmé': return 'text-red-600 dark:text-red-400';
      case 'Occasion': return 'text-amber-600 dark:text-amber-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const serializedProducts = serialNumbersEnabled ? outbound.products.filter(p => p.isSerialized) : [];
  const validateOutbound = async () => {
    setActionError('');
    setIsValidating(true);
    const response = await fetch(`/api/outbounds/${outbound.id}/validate`, { method: 'POST' });
    const data = await response.json();
    setIsValidating(false);
    if (!response.ok) return setActionError(data.error || 'Validation impossible.');
    onChanged?.();
  };
  const cancelOutbound = async () => {
    setActionError('');
    const response = await fetch(`/api/outbounds/${outbound.id}/cancel`, { method: 'POST' });
    const data = await response.json();
    if (!response.ok) return setActionError(data.error || 'Annulation impossible.');
    onChanged?.();
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {/* Top Actions Bar */}
      <div className="relative flex items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0 z-40 transition-all duration-300">
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
                <div className="font-bold text-slate-900 dark:text-white truncate">Sortie {outbound.reference}</div>
                <div className="hidden md:flex items-center justify-center shrink-0">
                  <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border truncate", getStatusBadgeColor(outbound.status))}>
                    {outbound.status}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          {outbound.status === 'Brouillon' && (
            <>
              <button onClick={validateOutbound} disabled={isValidating} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors">
                <CheckCircle2 className="w-4 h-4" /> {isValidating ? 'Validation...' : 'Valider la sortie'}
              </button>
              <button 
                onClick={() => onEdit?.(outbound)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 transition-colors"
              >
                Modifier
              </button>
            </>
          )}
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
                  className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  <style>{`
                    .group-hover-animate:hover .animate-scroll-text {
                      animation: scroll-text-x 2.5s linear infinite alternate;
                    }
                    @keyframes scroll-text-x {
                      0%, 15% { transform: translateX(0); }
                      85%, 100% { transform: translateX(-40px); }
                    }
                  `}</style>
                  <div className="p-1.5 text-slate-700 dark:text-slate-300">
                    <button onClick={() => setPreview('Bon de sortie')} disabled={!outbound.exitVoucher} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800 rounded-lg transition-colors group group-hover-animate text-left">
                      <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" /> 
                      <div className="flex-1 min-w-0">Consulter bon de sortie</div>
                    </button>
                    {outbound.status === 'Validée' && (
                      <button onClick={() => setIsReturnOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left">
                        <LogOut className="w-4 h-4 rotate-180 text-amber-500 shrink-0" /> Créer un retour en stock
                      </button>
                    )}
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group group-hover-animate text-left">
                      <Download className="w-4 h-4 text-indigo-500 shrink-0" /> 
                      <div className="flex-1 min-w-0">Exporter sortie</div>
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group group-hover-animate relative text-left">
                      <History className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" /> 
                      <div className="flex-1 overflow-hidden relative text-left">
                        <span className="block w-full truncate group-hover:opacity-0 transition-opacity">
                          Historique des changements
                        </span>
                        <div className="absolute top-0 left-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                           <span className="inline-block animate-scroll-text">Historique des changements de la sortie</span>
                        </div>
                      </div>
                    </button>
                    {outbound.status === 'Brouillon' && (
                      <button onClick={cancelOutbound} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <AlertTriangle className="w-4 h-4 shrink-0" /> Annuler sortie
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full">
          {/* Main Area */}
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
            
            {/* Header Info */}
            <div className="px-8 pt-8 pb-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-4" ref={titleRef}>
                <h1 className="text-3xl font-bold tracking-tight">Sortie {outbound.reference}</h1>
                <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border", getStatusBadgeColor(outbound.status))}>
                  {outbound.status}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-8">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Destination ({outbound.destinationType})</span>
                  <span className="font-medium text-slate-900 dark:text-white">{outbound.destinationName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Date sortie</span>
                  <span className="font-medium text-slate-900 dark:text-white">{outbound.date}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Dépôt source</span>
                  <span className="font-medium text-slate-900 dark:text-white">{outbound.warehouseName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Responsable</span>
                  <span className="font-medium text-slate-900 dark:text-white">{outbound.responsible}</span>
                </div>
              </div>
              {actionError && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{actionError}</div>}

              {/* Quick Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Box className="w-4 h-4" /> Quantité sortie
                  </div>
                  <div className="text-2xl font-bold tracking-tight flex items-baseline gap-1.5">
                    {outbound.totalQty || 0}
                    <span className="text-xs font-medium text-slate-400 uppercase">Unités</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <LogOut className="w-4 h-4 rotate-180" /> Quantité retournée
                  </div>
                  <div className="text-2xl font-bold tracking-tight">{outbound.totalReturned || 0}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Valeur estimée
                  </div>
                  <div className="text-2xl font-bold tracking-tight">
                    {(outbound.totalValue || 0).toLocaleString()} <span className="text-xs font-medium text-slate-400 uppercase">DA</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <ListFilter className="w-4 h-4 shrink-0" /> Produits concernés
                  </div>
                  <div className="text-2xl font-bold tracking-tight truncate">
                    {outbound.products.length} <span className="text-xs font-medium text-slate-400 uppercase">Réf.</span>
                  </div>
                </div>
                {serialNumbersEnabled && (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Barcode className="w-4 h-4 shrink-0" /> Numéros de série
                    </div>
                    <div className="text-2xl font-bold tracking-tight truncate">
                      {serializedProducts.reduce((acc, p) => acc + (p.serialNumbers?.length || 0), 0)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 p-8 space-y-8">
              
              {/* Informations Générales */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> Informations générales de la sortie
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Référence sortie</span>
                    <p className="text-sm font-medium font-mono">{outbound.reference}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Type destination</span>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{outbound.destinationType}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Destination</span>
                    <p className="text-sm font-medium">{outbound.destinationName}</p>
                  </div>
                  {outbound.reservationReference && (
                    <div>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Réservation d'origine</span>
                      <p className="text-sm font-medium font-mono text-indigo-600 dark:text-indigo-400">{outbound.reservationReference}</p>
                    </div>
                  )}
                  {outbound.reason && (
                    <div>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Motif / Commentaire</span>
                      <p className="text-sm font-medium">{outbound.reason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Liste des produits */}
              <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                   <Package className="w-4 h-4 text-slate-400" />
                   <h3 className="text-sm font-semibold uppercase tracking-wider">Produits sortis</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/50">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Produit</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Qté Demandée</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Qté Sortie</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Emplacement source</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">État</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut Ligne</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {outbound.products.map((p, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{p.name}</span>
                              <span className="text-[10px] font-mono text-indigo-500 font-medium tracking-tight uppercase">{p.reference}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-400 text-right">{p.qtyRequested}</td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex flex-col items-end">
                                <span className={cn("text-sm font-medium", p.qtyRequested !== p.qtyOut && "text-orange-500 font-bold")}>{p.qtyOut}</span>
                                {p.qtyRequested !== p.qtyOut && <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider leading-none">Partiel</span>}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{p.locationName || '-'}</td>
                          <td className="px-6 py-4">
                             <span className={cn("text-xs font-medium uppercase tracking-wider", getConditionColor(p.condition))}>{p.condition}</span>
                          </td>
                          <td className="px-6 py-4">
                             <span className={cn("text-xs font-medium uppercase tracking-wider px-2 py-1 rounded bg-slate-100 dark:bg-slate-800", p.status === 'Sorti' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400')}>{p.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Numéros de série */}
              {serialNumbersEnabled && (
                <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                      <Barcode className="w-4 h-4 text-slate-400" /> Numéros de série
                    </h3>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{serializedProducts.length} produit(s) sérialisé(s)</span>
                  </div>
                  
                  {serializedProducts.length > 0 ? (
                    <div className="space-y-6">
                      {serializedProducts.map((p, idx) => (
                        <div key={idx} className="space-y-3">
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{p.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded">({p.serialNumbers?.length || 0} S/N affectés)</span>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                              {p.serialNumbers?.map((sn, snIdx) => (
                                <div key={snIdx} className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center justify-between group">
                                   {sn}
                                   <Copy className="w-3 h-3 text-slate-300 cursor-pointer hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2" />
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-50 dark:border-slate-900 rounded-xl">
                      <Barcode className="w-8 h-8 text-slate-200 dark:text-slate-800 mb-3" />
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-widest italic">Aucun numéro de série nécessité pour cette sortie</p>
                    </div>
                  )}
                </div>
              )}



              {/* Historique */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" /> Historique de la sortie
                </h3>
                <div className="relative space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-100 dark:before:bg-slate-800">
                  {outbound.history.map((h, i) => (
                     <div key={i} className="relative pl-10 flex items-start group">
                        <div className={cn(
                          "absolute left-0 w-6 h-6 rounded-full border-2 bg-white dark:bg-slate-950 flex items-center justify-center z-10",
                          i === outbound.history.length - 1 ? "border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/10" : "border-slate-200"
                        )}>
                           {i === outbound.history.length - 1 ? <CheckCircle2 className="w-3 h-3 text-indigo-500" /> : <Clock className="w-3 h-3 text-slate-400" />}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center justify-between mb-1.5">
                              <h4 className="text-sm font-bold uppercase tracking-tight">{h.action}</h4>
                              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{h.date}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                 {h.user.charAt(0)}
                              </div>
                              <p className="text-xs text-slate-500">Opéré par <span className="text-slate-900 dark:text-white font-medium">{h.user}</span></p>
                           </div>
                        </div>
                     </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right SIDEBAR (Fixed panel) */}
          <div className="w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-6 shrink-0 flex flex-col gap-8 hidden lg:flex overflow-y-auto">
            
            {/* Référence rapide */}
            <div>
              <div className="w-full aspect-square rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4">
                <Package className="w-16 h-16 text-slate-300 dark:text-slate-700" />
              </div>
              <div className="text-center">
                <span className="inline-block bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-700 dark:text-slate-300">
                  {outbound.reference}
                </span>
                <div className="mt-3">
                  <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border", getStatusBadgeColor(outbound.status))}>
                    {outbound.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Infos rapides */}
            <div>
               <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Informations rapides</h3>
               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Destination</span>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[150px]" title={outbound.destinationName}>{outbound.destinationName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Type</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{outbound.destinationType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Date</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{outbound.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Responsable</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{outbound.responsible}</span>
                  </div>
                  <div className="pt-2">
                    <div className={cn("p-3 rounded-lg border text-xs font-medium leading-relaxed", 
                        outbound.status === 'Validée' 
                          ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" 
                          : "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400"
                    )}>
                        <span className="font-bold flex items-center gap-1 mb-1">
                          {outbound.status === 'Validée' ? <History className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5"/>}
                          Impact stock
                        </span>
                        {outbound.status === 'Validée' 
                         ? `Stock diminué de ${outbound.totalQty || 0} unités le ${outbound.date}.`
                         : "Aucun impact stock physique avant validation."}
                    </div>
                  </div>
               </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Documents */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Bons & Documents</h3>
              </div>
              
              <div className="space-y-2">
                <button onClick={() => setPreview('Bon de sortie')} disabled={!outbound.exitVoucher} className="w-full flex items-center justify-between p-3 bg-white disabled:opacity-40 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1 flex items-center gap-2">
                        Bon de sortie
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 uppercase">Auto</span>
                      </div>
                      <div className="text-xs text-slate-500">PDF généré automatiquement</div>
                    </div>
                  </div>
                </button>
                {outbound.returnVouchers?.map((doc) => (
                  <button key={doc.id} onClick={() => setPreview('Bon de retour')} className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-amber-300 transition-colors text-left">
                    <div className="flex items-center gap-3"><div className="p-2 bg-amber-50 rounded-lg text-amber-600"><FileText className="w-4 h-4" /></div><div><div className="text-sm font-medium">{doc.number}</div><div className="text-xs text-slate-500">Bon de retour généré</div></div></div>
                  </button>
                ))}
                
                {outbound.documents?.map((doc, idx) => (
                  <button key={idx} className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group text-left">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{doc.name}</div>
                        <div className="text-xs text-slate-500">{doc.type}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button className="mt-4 w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors">
                <Plus className="w-4 h-4 shrink-0" />
                Ajouter un document
              </button>
            </div>

          </div>
        </div>
      </div>
      <OutboundDocumentPreview outbound={outbound} documentType={preview || 'Bon de sortie'} documentNumber={preview === 'Bon de retour' ? outbound.returnVouchers?.[0]?.number : outbound.exitVoucher?.number} isOpen={preview !== null} onClose={() => setPreview(null)} />
      <OutboundReturnModal outbound={outbound} isOpen={isReturnOpen} onClose={() => setIsReturnOpen(false)} onCreated={() => onChanged?.()} />
    </div>
  );
}
