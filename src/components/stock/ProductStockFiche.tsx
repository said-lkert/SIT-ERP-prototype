import React, { useState, useRef, useEffect } from 'react';
import { StockItem } from './types';
import { 
  ArrowLeft, 
  MapPin,
  Clock,
  Lock,
  Barcode,
  AlertTriangle,
  AlertOctagon,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCcw,
  ListChecks,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  Package,
  CheckCircle2,
  ShoppingCart,
  Settings,
  ChevronDown,
  Box,
  FileText,
  Plus,
  History
} from 'lucide-react';
import { StockActionModal } from './StockActionModal';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ProductStockFicheProps {
  product: StockItem;
  onBack: () => void;
}

export function ProductStockFiche({ product, onBack }: ProductStockFicheProps) {
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; action: 'entree' | 'sortie' | 'transfert' | 'resever' | 'correction' | null }>({ isOpen: false, action: null });
  const [isActionsOpen, setIsActionsOpen] = useState(false);
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
        setIsActionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entree': return <ArrowDownRight className="w-4 h-4 text-emerald-500" />;
      case 'sortie': return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
      case 'transfert': return <RefreshCcw className="w-4 h-4 text-blue-500" />;
      case 'correction': return <ListChecks className="w-4 h-4 text-amber-500" />;
      default: return null;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  };

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
                <div className="font-bold text-slate-900 dark:text-white truncate">{product.name}</div>
                <div className="hidden md:flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                    {product.reference}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
            <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsActionsOpen(!isActionsOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Options
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isActionsOpen && "rotate-180")} />
                </button>

                {isActionsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1.5 text-slate-700 dark:text-slate-300">
                      <button 
                        onClick={() => { setActionModal({ isOpen: true, action: 'entree' }); setIsActionsOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <ArrowDownToLine className="w-4 h-4 text-emerald-500 shrink-0" /> Entrée stock
                      </button>

                      <button 
                        onClick={() => { setActionModal({ isOpen: true, action: 'sortie' }); setIsActionsOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <ArrowUpFromLine className="w-4 h-4 text-rose-500 shrink-0" /> Sortie stock
                      </button>

                      <button 
                        onClick={() => { setActionModal({ isOpen: true, action: 'transfert' }); setIsActionsOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-blue-500 shrink-0" /> Transfert stock
                      </button>

                      <button 
                        onClick={() => { setActionModal({ isOpen: true, action: 'resever' }); setIsActionsOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Lock className="w-4 h-4 text-amber-500 shrink-0" /> Réserver stock
                      </button>

                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                      <button 
                        onClick={() => { setActionModal({ isOpen: true, action: 'correction' }); setIsActionsOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <ListChecks className="w-4 h-4 text-slate-500 shrink-0" /> Correction stock
                      </button>
                    </div>
                  </div>
                )}
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full">
          {/* Left MAIN area */}
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
            
            {/* Header Info */}
            <div className="px-8 pt-8 pb-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-4" ref={titleRef}>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{product.name}</h1>
                <span className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border",
                    product.status === 'en_stock' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" :
                    product.status === 'sous_seuil' ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800" :
                    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
                )}>
                  {product.status === 'en_stock' ? 'En stock' : product.status === 'sous_seuil' ? 'Sous seuil' : 'Rupture'}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-8">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Famille</span>
                  <span className="font-medium text-slate-900 dark:text-white">{product.family}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Emplacement principal</span>
                  <span className="font-medium text-slate-900 dark:text-white">{product.mainLocation}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Seuil Alert.</span>
                  <span className="font-medium text-slate-900 dark:text-white">{product.minStockThreshold} unités</span>
                </div>
              </div>

              {/* Quick Indicators (Like ProductDetails) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Stock physique
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{product.physicalStock || 0}</div>
                </div>
                <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-100 dark:border-orange-800">
                  <div className="text-orange-800 dark:text-orange-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-orange-500" /> Réservé
                  </div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">{product.reservedStock || 0}</div>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
                  <div className="text-emerald-800 dark:text-emerald-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Disponible
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{product.availableStock || 0}</div>
                </div>
                <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
                  <div className="text-purple-800 dark:text-purple-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-purple-500" /> En commande
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">{product.orderedStock || 0}</div>
                </div>
              </div>

            </div>

            {/* Containers area */}
            <div className="flex-1 p-8 space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Repartition */}
                    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
                            <MapPin className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-semibold text-slate-800 dark:text-white uppercase tracking-wider text-sm">Répartition du stock physique</h3>
                        </div>
                        <div className="p-0 overflow-x-auto flex-1">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium tracking-wider text-xs uppercase">
                                    <tr>
                                        <th className="px-5 py-3">Emplacement</th>
                                        <th className="px-5 py-3">Type</th>
                                        <th className="px-5 py-3 text-right">Qté</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {product.locations.map((loc, i) => (
                                        <tr key={loc.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                            <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{loc.name}</td>
                                            <td className="px-5 py-3 capitalize text-slate-500 dark:text-slate-400">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                                  loc.type === 'depot' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' :
                                                  loc.type === 'vehicule' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' :
                                                  loc.type === 'chantier' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
                                                  loc.type === 'retour' || loc.type === 'reparation' || loc.type === 'hors_service' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800' :
                                                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                                }`}>
                                                    {loc.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right font-mono font-medium text-slate-900 dark:text-white">{loc.quantity || 0}</td>
                                        </tr>
                                    ))}
                                    {product.locations.length === 0 && (
                                        <tr><td colSpan={3} className="p-5 text-center text-slate-500">Aucun emplacement défini.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Reservations */}
                    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
                            <Lock className="w-5 h-5 text-amber-500" />
                            <h3 className="font-semibold text-slate-800 dark:text-white uppercase tracking-wider text-sm">Réservations Actives</h3>
                        </div>
                        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                            {product.reservations.filter(r => r.status === 'active').map(r => (
                                <div key={r.id} className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:shadow-sm transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-medium text-slate-900 dark:text-white">{r.project}</div>
                                        <div className="font-mono font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 rounded">{r.quantity || 0} uni.</div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1"><Lock className="w-3 h-3"/> {r.responsible}</span>
                                        <span>{formatDate(r.date || '').split(' ')[0] || ''}</span>
                                    </div>
                                </div>
                            ))}
                            {product.reservations.filter(r => r.status === 'active').length === 0 && (
                                <div className="text-center text-slate-500 text-sm py-4">Aucune réservation active.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Movements */}
                <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-semibold text-slate-800 dark:text-white uppercase tracking-wider text-sm">Derniers Mouvements</h3>
                        </div>
                    </div>
                    <div className="p-0 overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium tracking-wider text-xs uppercase">
                                <tr>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3 text-center">Type</th>
                                    <th className="px-5 py-3 text-right">Qté</th>
                                    <th className="px-5 py-3">Document</th>
                                    <th className="px-5 py-3">Utilisateur</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {product.movements.map(m => (
                                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{formatDate(m.date)}</td>
                                        <td className="px-5 py-3 text-center">
                                            <div className="flex justify-center" aria-label={m.type} title={m.type}>
                                                {getMovementIcon(m.type)}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-right font-mono font-medium text-slate-900 dark:text-white">
                                            {m.quantity > 0 ? `+${m.quantity}` : (m.quantity || 0)}
                                        </td>
                                        <td className="px-5 py-3">
                                            {m.document ? (
                                                <span className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">{m.document}</span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{m.user}</td>
                                    </tr>
                                ))}
                                {product.movements.length === 0 && (
                                    <tr><td colSpan={5} className="p-5 text-center text-slate-500">Aucun mouvement récent.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Historique du produit */}
                <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-400" /> Historique du produit dans le stock
                    </h3>
                    
                    <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 md:ml-4 space-y-8 pb-4">
                        <div className="relative pl-6">
                            <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                            <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-2">
                              Aujourd'hui, 09:42 
                              <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-slate-500">Mouvement</span>
                            </div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">4 unités réservées pour Projet Hôtel X</div>
                            <div className="text-xs text-slate-500">Par Technicien Lead</div>
                        </div>
                        
                        <div className="relative pl-6">
                            <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                            <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-2">
                              Il y a 3 jours
                              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Réception</span>
                            </div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">Entrée en stock: +10 unités (BL-26-0043)</div>
                            <div className="text-xs text-slate-500">Par Magasinier</div>
                        </div>

                        <div className="relative pl-6">
                            <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                            <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-2">
                              Le 10 Avril 2026
                              <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Transfert</span>
                            </div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">Transfert de 5 unités vers Chantier Y</div>
                            <div className="text-xs text-slate-500">Par Gestionnaire Stock</div>
                        </div>
                        
                        <div className="relative pl-6">
                            <div className="absolute w-3 h-3 bg-slate-300 dark:bg-slate-700 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                            <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-2">
                              Le 01 Février 2026
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Création</span>
                            </div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">Création de la fiche stock initial</div>
                            <div className="text-xs text-slate-500">Par Admin Système</div>
                        </div>
                    </div>
                </div>


            </div>
          </div>

          {/* Right SIDEBAR (Fixed panel) */}
          <div className="w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-6 shrink-0 flex flex-col gap-8 hidden lg:flex">
            
            {/* Photo */}
            <div>
              <div className="w-full aspect-square rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4">
                <Package className="w-16 h-16 text-slate-300 dark:text-slate-700" />
              </div>
              <div className="text-center">
                <span className="inline-block bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-700 dark:text-slate-300">
                  {product.reference}
                </span>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Documents */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Documents liés</h3>
              </div>
              
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Bon d'entrée</div>
                      <div className="text-xs text-slate-500">BE-2026-0043 • PDF</div>
                    </div>
                  </div>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Bon de sortie</div>
                      <div className="text-xs text-slate-500">BS-2026-0112 • PDF</div>
                    </div>
                  </div>
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Bon de transfert</div>
                      <div className="text-xs text-slate-500">BT-2026-0015 • PDF</div>
                    </div>
                  </div>
                </button>
              </div>

              <button className="mt-4 w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors">
                <Plus className="w-4 h-4" />
                Lier un document
              </button>
            </div>

          </div>
        </div>
      </div>

      <StockActionModal 
        isOpen={actionModal.isOpen} 
        action={actionModal.action} 
        onClose={() => setActionModal({ isOpen: false, action: null })} 
        initialProduct={product}
      />
    </div>
  );
}
