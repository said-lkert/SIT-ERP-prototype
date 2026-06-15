import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Barcode, Calendar, History, MapPin, Package, ShieldAlert,
  Settings, ChevronDown, Lock, RefreshCw, ArrowDownToLine, CornerUpLeft, Ban, FileText, CheckCircle2, AlertTriangle, AlertOctagon,
  Wrench, Activity, Factory, ArrowRightLeft, Clock, User, Info, ArrowUpRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { SerialNumber } from './types';
import { SerialActionModal, SerialActionType } from './SerialActionModal';

interface SerialNumbersFicheProps {
  serial: SerialNumber;
  onBack: () => void;
}

export function SerialNumbersFiche({ serial, onBack }: SerialNumbersFicheProps) {
  const [actionModal, setActionModal] = useState<{isOpen: boolean; action: SerialActionType}>({isOpen: false, action: null});
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isTitleVisible, setIsTitleVisible] = useState(true);
  const titleRef = useRef<HTMLDivElement>(null);

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

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    return () => {
      if (titleRef.current) {
        observer.unobserve(titleRef.current);
      }
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_stock': return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full font-medium text-sm w-fit">En stock</span>;
      case 'reserve': return <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full font-medium text-sm w-fit">Réservé</span>;
      case 'installe_client': return <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full font-medium text-sm w-fit">Installé client</span>;
      case 'en_panne': return <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-full font-medium text-sm w-fit">En panne</span>;
      case 'retour_fournisseur': return <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-full font-medium text-sm w-fit">Retour fournisseur</span>;
      case 'hors_service': return <span className="px-3 py-1 bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-full font-medium text-sm w-fit">Hors service</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 rounded-full font-medium text-sm capitalize border border-slate-200 dark:border-slate-700 w-fit">{status.replace('_', ' ')}</span>;
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'reception_fournisseur':
      case 'entree': return <ArrowDownToLine className="w-4 h-4 text-emerald-500" />;
      case 'sortie': return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
      case 'transfert': return <ArrowRightLeft className="w-4 h-4 text-blue-500" />;
      case 'reservation': return <Lock className="w-4 h-4 text-amber-500" />;
      case 'installation_client':
      case 'installation': return <Wrench className="w-4 h-4 text-indigo-500" />;
      case 'panne': return <AlertOctagon className="w-4 h-4 text-orange-500" />;
      case 'retour_fournisseur': return <CornerUpLeft className="w-4 h-4 text-purple-500" />;
      case 'mise_hors_service': return <Ban className="w-4 h-4 text-rose-600" />;
      case 'remplacement': return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non défini';
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  };
  
  const formatDateOnly = (dateString?: string) => {
    if (!dateString) return 'Non défini';
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  };

  const getWarrantyInfo = () => {
    if (!serial.endOfWarranty) return { text: 'Non définie', status: 'neutral', icon: ShieldAlert };
    const end = new Date(serial.endOfWarranty);
    const now = new Date();
    const threeMonthsFromNow = new Date(new Date().setMonth(now.getMonth() + 3));

    if (end < now) return { text: 'Expirée', status: 'danger', icon: AlertOctagon };
    if (end < threeMonthsFromNow) return { text: 'Expire bientôt', status: 'warning', icon: AlertTriangle };
    return { text: 'Valide', status: 'success', icon: CheckCircle2 };
  };

  const warrantyInfo = getWarrantyInfo();
  const lastEvent = serial.history.length > 0 ? serial.history[0] : null;

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
                <div className="font-bold font-mono text-slate-900 dark:text-white truncate">{serial.serial}</div>
                <div className="hidden md:flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[150px]">
                    {serial.productName}
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
                    onClick={() => { setActionModal({isOpen: true, action: 'install'}); setIsActionsOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Déclarer installé
                  </button>
                  <button 
                    onClick={() => { setActionModal({isOpen: true, action: 'reserve'}); setIsActionsOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Lock className="w-4 h-4 text-amber-500 shrink-0" /> Réserver
                  </button>
                  <button 
                    onClick={() => { setActionModal({isOpen: true, action: 'transfer'}); setIsActionsOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-blue-500 shrink-0" /> Transférer
                  </button>
                  <button 
                    onClick={() => { setActionModal({isOpen: true, action: 'breakdown'}); setIsActionsOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Wrench className="w-4 h-4 text-orange-600 shrink-0" /> Déclarer panne
                  </button>
                  <button 
                    onClick={() => { setActionModal({isOpen: true, action: 'replace'}); setIsActionsOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-indigo-500 shrink-0" /> Remplacer
                  </button>
                  <button 
                    onClick={() => { setActionModal({isOpen: true, action: 'stock'}); setIsActionsOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <ArrowDownToLine className="w-4 h-4 text-emerald-600 shrink-0" /> Remettre en stock
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button 
                    onClick={() => { setActionModal({isOpen: true, action: 'return_supplier'}); setIsActionsOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <CornerUpLeft className="w-4 h-4 text-purple-500 shrink-0" /> Retour fournisseur
                  </button>
                  <button 
                    onClick={() => { setActionModal({isOpen: true, action: 'decommission'}); setIsActionsOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Ban className="w-4 h-4 text-rose-500 shrink-0" /> Mettre hors service
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
                <h1 className="text-3xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">{serial.serial}</h1>
                <div className="flex items-center gap-3">
                  {getStatusBadge(serial.status)}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-8">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Produit</span>
                  <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5"><Package className="w-4 h-4" /> {serial.productName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Référence</span>
                  <span className="font-medium text-slate-900 dark:text-white">{serial.productReference}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Famille</span>
                  <span className="font-medium text-slate-900 dark:text-white">{serial.family}</span>
                </div>
                {serial.brand && (
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Marque / Modèle</span>
                    <span className="font-medium text-slate-900 dark:text-white">{serial.brand} {serial.model ? `- ${serial.model}` : ''}</span>
                  </div>
                )}
              </div>

              {/* Quick Indicators Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Localisation actuelle
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white truncate" title={serial.location}>{serial.location}</div>
                  {serial.clientSite && <div className="text-xs text-slate-500 truncate" title={serial.clientSite}>{serial.clientSite}</div>}
                </div>
                
                <div className={`rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm border-b-4 ${
                 warrantyInfo.status === 'danger' ? 'bg-rose-50 dark:bg-rose-900/10 border-b-rose-500 border-rose-200 dark:border-rose-800' :
                 warrantyInfo.status === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-b-amber-500 border-amber-200 dark:border-amber-800' :
                 'bg-emerald-50 dark:bg-emerald-900/10 border-b-emerald-500 border-emerald-200 dark:border-emerald-800'
               }`}>
                  <div className={`text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2 ${
                    warrantyInfo.status === 'danger' ? 'text-rose-800 dark:text-rose-400' :
                    warrantyInfo.status === 'warning' ? 'text-amber-800 dark:text-amber-400' :
                    'text-emerald-800 dark:text-emerald-400'
                  }`}><warrantyInfo.icon className="w-4 h-4"/> Statut garantie</div>
                  <div className={`text-xl font-bold truncate ${
                    warrantyInfo.status === 'danger' ? 'text-rose-600 dark:text-rose-500' :
                    warrantyInfo.status === 'warning' ? 'text-amber-600 dark:text-amber-500' :
                    'text-emerald-600 dark:text-emerald-500'
                  }`}>{warrantyInfo.text}</div>
                  <div className={`text-xs mt-1 ${
                    warrantyInfo.status === 'danger' ? 'text-rose-500 dark:text-rose-400' :
                    warrantyInfo.status === 'warning' ? 'text-amber-600 dark:text-amber-500' :
                    'text-emerald-600 dark:text-emerald-500'
                  }`}>Jusqu'au {formatDateOnly(serial.endOfWarranty)}</div>
               </div>

                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <History className="w-4 h-4" /> Dernier mouvement
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white capitalize truncate" title={lastEvent?.type}>{lastEvent?.type?.replace('_', ' ') || 'N/A'}</div>
                  <div className="text-xs text-slate-500 mt-1">{formatDate(lastEvent?.date)}</div>
                </div>

                <div className={cn(
                    "rounded-xl p-4 border border-slate-200 dark:border-slate-800 border-b-4",
                    serial.status === 'en_panne' || serial.status === 'hors_service' ? 'bg-rose-50 dark:bg-rose-900/10 border-b-rose-500' : 'bg-slate-50 dark:bg-slate-900 border-b-emerald-500'
                )}>
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> État opérationnel
                  </div>
                  <div className={cn("text-xl font-bold truncate",
                      serial.status === 'en_panne' || serial.status === 'hors_service' ? "text-rose-600 dark:text-rose-500" : "text-emerald-600 dark:text-emerald-500"
                  )}>
                      {serial.status === 'en_panne' ? 'Défaillant' : serial.status === 'hors_service' ? 'Obsolète' : 'Fonctionnel'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                      {serial.status === 'hors_service' ? 'Retiré du service' : serial.status === 'en_panne' ? 'Nécessite réparation' : 'Apte au service'}
                  </div>
                </div>
              </div>
            </div>

            {/* Containers area */}
            <div className="flex-1 p-8 space-y-8">
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Container A: Résumé */}
                <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
                    <Info className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-white uppercase tracking-wider text-sm">Résumé de traçabilité</h3>
                  </div>
                  <div className="p-5 flex-1 relative">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                           <p className="text-xs text-slate-500 mb-1">Date d'achat</p>
                           <p className="text-sm font-medium">{formatDateOnly(serial.dateOfPurchase)}</p>
                        </div>
                        <div>
                           <p className="text-xs text-slate-500 mb-1">Entrée en stock</p>
                           <p className="text-sm font-medium">{formatDateOnly(serial.dateOfEntry)}</p>
                        </div>
                        <div>
                           <p className="text-xs text-slate-500 mb-1">Fournisseur</p>
                           <p className="text-sm font-medium flex items-center gap-1.5"><Factory className="w-3.5 h-3.5 text-slate-400"/> {serial.supplier || 'Non renseigné'}</p>
                        </div>
                        <div>
                           <p className="text-xs text-slate-500 mb-1">Source d'entrée</p>
                           <p className="text-sm font-medium">Saisie {serial.history.length > 0 && serial.history[serial.history.length-1].type === 'reception_fournisseur' ? 'réception' : 'manuelle'}</p>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Container B: Localisation */}
                <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
                    <MapPin className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-white uppercase tracking-wider text-sm">Localisation Détaillée</h3>
                  </div>
                  <div className="p-5 flex-1 p-0 overflow-y-auto">
                    <div className="space-y-6">
                        <div>
                           <p className="text-xs text-slate-500 mb-1">Emplacement global</p>
                           <p className="text-sm font-medium">{serial.location}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {serial.warehouse && (
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Entrepôt</p>
                                <p className="text-sm font-medium">{serial.warehouse}</p>
                              </div>
                            )}
                            {serial.vehicle && (
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Véhicule</p>
                                <p className="text-sm font-medium">{serial.vehicle}</p>
                              </div>
                            )}
                        </div>

                        {serial.clientSite && (
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                             <p className="text-xs text-slate-500 mb-1">Site Client (Installation)</p>
                             <p className="text-sm font-medium">{serial.clientSite}</p>
                          </div>
                        )}
                        
                        {serial.exactLocation && (
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                             <p className="text-xs text-slate-500 mb-2">Emplacement exact / Zone / Éléments</p>
                             <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                               <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{serial.exactLocation}</p>
                             </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Container E: Garantie */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
                    <ShieldAlert className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-white uppercase tracking-wider text-sm">Garanties & Achat</h3>
                  </div>
                  <div className="p-5 flex-1">
                     <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-xs text-slate-500 mb-1">Date d'achat</p>
                              <p className="text-sm font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400"/> {formatDateOnly(serial.dateOfPurchase)}</p>
                           </div>
                           <div>
                              <p className="text-xs text-slate-500 mb-1">Entrée en stock</p>
                              <p className="text-sm font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400"/> {formatDateOnly(serial.dateOfEntry)}</p>
                           </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                           <div className="flex items-center justify-between mb-3">
                             <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">GARANTIE FOURNISSEUR</p>
                           </div>
                           <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Début</p>
                                <p className="text-sm font-medium">{formatDateOnly(serial.startOfWarranty)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Fin</p>
                                <p className="text-sm font-medium">{formatDateOnly(serial.endOfWarranty)}</p>
                              </div>
                           </div>
                           {serial.warrantyConditions && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                {serial.warrantyConditions}
                              </p>
                           )}
                        </div>

                        {serial.endOfClientWarranty && (
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                             <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">GARANTIE CLIENT (Installation)</p>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-slate-500 mb-1">Fin garantie client</p>
                                  <p className="text-sm font-medium">{formatDateOnly(serial.endOfClientWarranty)}</p>
                                </div>
                             </div>
                          </div>
                        )}
                     </div>
                  </div>
                </div>

                {/* Container F: Alertes */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-white uppercase tracking-wider text-sm">Alertes de traçabilité</h3>
                  </div>
                  <div className="p-5 flex-1">
                     <div className="space-y-4">
                        {warrantyInfo.status === 'warning' && (
                           <div className="flex gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                              <div>
                                 <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Garantie bientôt expirée</p>
                                 <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">La garantie fournisseur expire le {formatDateOnly(serial.endOfWarranty)}.</p>
                              </div>
                           </div>
                        )}
                        {warrantyInfo.status === 'danger' && (
                           <div className="flex gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800">
                              <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />
                              <div>
                                 <p className="text-sm font-medium text-rose-800 dark:text-rose-400">Garantie expirée</p>
                                 <p className="text-xs text-rose-600 dark:text-rose-500 mt-1">La garantie fournisseur est dépassée (fin le {formatDateOnly(serial.endOfWarranty)}).</p>
                              </div>
                           </div>
                        )}
                        {serial.status === 'installe_client' && !serial.clientSite && (
                           <div className="flex gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                              <Info className="w-5 h-5 text-blue-500 shrink-0" />
                              <div>
                                 <p className="text-sm font-medium text-blue-800 dark:text-blue-400">Site client manquant</p>
                                 <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Déclaré installé mais la localisation exacte du site client n'est pas renseignée.</p>
                              </div>
                           </div>
                        )}
                        {serial.status === 'reserve' && (
                           <div className="flex gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                              <Lock className="w-5 h-5 text-amber-500 shrink-0" />
                              <div>
                                 <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Matériel réservé</p>
                                 <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">En attente de transfert ou installation.</p>
                              </div>
                           </div>
                        )}
                        <div className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                           <Activity className="w-5 h-5 text-slate-400 shrink-0" />
                           <div>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Statut normal</p>
                              <p className="text-xs text-slate-500 mt-1">Nombre de mouvements : {serial.history.length}.</p>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Container C: Cycle de vie (Timeline) */}
                <div className="col-span-1 xl:col-span-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col p-6">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                        <Activity className="w-5 h-5 text-slate-400" /> Cycle de vie du matériel
                    </h3>
                    
                    <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 md:ml-4 space-y-8 pb-4">
                        {serial.history.map((event, index) => {
                           const isLatest = index === 0;
                           const iconMap: Record<string, {color: string, bg: string}> = {
                              'reception_fournisseur': { color: 'bg-emerald-500', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
                              'entree': { color: 'bg-emerald-500', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
                              'transfert': { color: 'bg-blue-500', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
                              'reservation': { color: 'bg-amber-500', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
                              'installation_client': { color: 'bg-indigo-500', bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
                              'installation': { color: 'bg-indigo-500', bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
                              'panne': { color: 'bg-orange-500', bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
                              'retour_fournisseur': { color: 'bg-purple-500', bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
                              'mise_hors_service': { color: 'bg-rose-600', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' },
                              'remplacement': { color: 'bg-blue-600', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
                           };
                           const style = iconMap[event.type] || { color: 'bg-slate-400', bg: 'bg-slate-100 text-slate-600' };

                           return (
                                <div key={event.id} className="relative pl-6">
                                    <div className={`absolute w-3 h-3 ${style.color} rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-slate-900`}></div>
                                    <div className="text-xs text-slate-500 font-medium mb-2 flex flex-wrap items-center gap-2">
                                      {formatDate(event.date)}
                                      <span className={`${style.bg} px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border border-transparent`}>{event.type.replace('_', ' ')}</span>
                                    </div>
                                    <div className="text-sm font-medium text-slate-900 dark:text-white mb-1.5">{event.description}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                        Par <span className="font-medium text-slate-700 dark:text-slate-300">{event.user}</span> 
                                    </div>
                                </div>
                           )
                        })}
                    </div>
                </div>

                {/* Container D: Mouvements (Table) */}
                <div className="col-span-1 xl:col-span-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
                    <History className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-white uppercase tracking-wider text-sm">Historique complet des mouvements</h3>
                  </div>
                  <div className="p-0 overflow-x-auto flex-1">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium tracking-wider text-xs uppercase">
                              <tr>
                                  <th className="px-5 py-3">Date</th>
                                  <th className="px-5 py-3 text-center">Type</th>
                                  <th className="px-5 py-3">Événement</th>
                                  <th className="px-5 py-3">Responsable</th>
                                  <th className="px-5 py-3">Détails / Réf</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                              {serial.history.map(m => (
                                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                      <td className="px-5 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{formatDate(m.date)}</td>
                                      <td className="px-5 py-3 text-center">
                                          <div className="flex justify-center" aria-label={m.type} title={m.type}>
                                              {getMovementIcon(m.type)}
                                          </div>
                                      </td>
                                      <td className="px-5 py-3 max-w-[300px] truncate text-slate-900 dark:text-white font-medium">
                                          {m.description}
                                      </td>
                                      <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{m.user}</td>
                                      <td className="px-5 py-3">
                                          {m.documentRef ? (
                                              <span className="text-slate-500text-xs font-mono bg-slate-100 dark:bg-slate-800 py-0.5 px-1.5 rounded">{m.documentRef}</span>
                                          ) : (
                                              <span className="text-slate-400">-</span>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                              {serial.history.length === 0 && (
                                  <tr><td colSpan={5} className="p-5 text-center text-slate-500">Aucun mouvement récent.</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right SIDEBAR (Fixed panel) */}
          <div className="w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-6 shrink-0 flex flex-col gap-8 hidden lg:flex">
            
            {/* Identity */}
            <div>
              <div className="w-full aspect-square rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4 relative overflow-hidden">
                <Barcode className="w-20 h-20 text-slate-300 dark:text-slate-700" />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-100/50 to-transparent dark:from-slate-800/50"></div>
              </div>
              <div className="text-center">
                <span className="block bg-slate-100 dark:bg-slate-800 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-lg font-mono font-bold text-slate-900 dark:text-white truncate tracking-wider">
                  {serial.serial}
                </span>
                <p className="text-sm font-medium text-slate-500 mt-3">{serial.productName}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{serial.productReference}</p>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Statut & Localisation */}
            <div className="space-y-5">
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Statut actuel</p>
                  <div>{getStatusBadge(serial.status)}</div>
               </div>
               
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Localisation rapide</p>
                  <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                     <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                     <div className="text-sm font-medium">
                        {serial.location}
                        <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">{serial.exactLocation || serial.clientSite || 'Aucune précision'}</p>
                     </div>
                  </div>
               </div>
               
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Responsabilité actuelle</p>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                     <User className="w-4 h-4 text-slate-500 shrink-0" />
                     <span className="text-sm font-medium">{lastEvent?.user || 'Non attribuée'}</span>
                  </div>
               </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Tracking summary */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Indicateurs traçabilité</h3>
              
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Mouvements</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{serial.history.length}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Création</span>
                    <span className="text-slate-800 dark:text-slate-200 text-xs font-medium">{serial.history.length > 0 ? 'Réception' : 'Manuelle'}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Dernière MAJ</span>
                    <span className="text-slate-800 dark:text-slate-200 text-xs font-medium">
                       {serial.history.length > 0 ? formatDateOnly(serial.history[0].date) : '-'}
                    </span>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <SerialActionModal 
        isOpen={actionModal.isOpen} 
        onClose={() => setActionModal({isOpen: false, action: null})}
        action={actionModal.action}
        initialSerialId={serial.id}
      />
    </div>
  );
}
