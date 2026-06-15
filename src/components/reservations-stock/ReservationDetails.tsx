import React, { useState, useRef, useEffect } from 'react';
import { StockReservation, ReservationStatus, ReservationPriority } from './types';
import { ArrowLeft, Edit, Copy, MoreHorizontal, Box, Tag, FileText, CheckCircle2, History, Plus, AlertCircle, ShoppingCart, Truck, ShieldAlert, BadgeCheck, Package, AlertTriangle, Archive, Settings, ChevronDown, List, MapPin, Calendar, Clock, User, ClipboardList, Info, X, Printer } from 'lucide-react';
import { cn, safeFormatDate } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ReservationDetailsProps {
  reservation: StockReservation;
  onBack: () => void;
  onUpdate: (updated: StockReservation) => void;
}

type TabId = 'resume' | 'produits' | 'affectations' | 'historique';

export function ReservationDetails({ reservation: initialReservation, onBack, onUpdate }: ReservationDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('resume');
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [reservation, setReservation] = useState<StockReservation>(initialReservation);
  const [selectedDocument, setSelectedDocument] = useState<NonNullable<StockReservation['documents']>[number] | null>(null);
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOptionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = (newStatus: ReservationStatus) => {
    let updatedProducts = [...reservation.products];
    let totalReserved = reservation.totalReservedQty;

    if (newStatus === 'Réservée' || newStatus === 'Partiellement réservée') {
      updatedProducts = updatedProducts.map(p => ({
        ...p,
        reservedQty: newStatus === 'Réservée' ? p.requestedQty : Math.floor(p.requestedQty / 2),
        missingQty: newStatus === 'Réservée' ? 0 : Math.ceil(p.requestedQty / 2),
      }));
      totalReserved = updatedProducts.reduce((sum, p) => sum + p.reservedQty, 0);
    } else if (newStatus === 'Libérée' || newStatus === 'Annulée') {
      updatedProducts = updatedProducts.map(p => ({
        ...p,
        reservedQty: 0,
        missingQty: p.requestedQty,
      }));
      totalReserved = 0;
    }

    const updated: StockReservation = {
      ...reservation,
      status: newStatus,
      products: updatedProducts,
      totalReservedQty: totalReserved,
    };
    
    setReservation(updated);
    onUpdate(updated);
    setIsOptionsOpen(false);
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case 'Réservée': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Consommée': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Partiellement réservée': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'En attente': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Brouillon': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      case 'Annulée': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Expirée': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'Libérée': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getPriorityColor = (priority: ReservationPriority) => {
    switch (priority) {
      case 'Urgent': return 'text-red-800 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Haute': return 'text-orange-800 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Normale': return 'text-emerald-800 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Basse': return 'text-slate-800 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'text-slate-800 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'resume', label: 'Résumé', icon: FileText },
    { id: 'produits', label: 'Produits réservés', icon: List },
    { id: 'affectations', label: 'Affectations', icon: MapPin },
    { id: 'historique', label: 'Historique', icon: History }
  ];

  const progressionPercent = reservation.totalRequestedQty > 0 
    ? Math.round((reservation.totalReservedQty / reservation.totalRequestedQty) * 100) 
    : 0;

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden absolute inset-0 z-10">
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
                <div className="font-bold text-slate-900 dark:text-white truncate">{reservation.reference}</div>
                <div className="hidden md:flex items-center justify-center shrink-0">
                   <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", getStatusColor(reservation.status))}>
                     {reservation.status}
                   </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button 
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
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  isOptionsOpen && "rotate-180",
                )}
              />
            </button>
            {isOptionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-1.5 text-slate-700 dark:text-slate-300">
                  {reservation.status === 'Brouillon' && (
                    <button onClick={() => handleStatusChange('En attente')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Valider la demande
                    </button>
                  )}
                  {reservation.status === 'En attente' && (
                    <>
                      <button onClick={() => handleStatusChange('Réservée')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Effectuer la réservation totale
                      </button>
                      <button onClick={() => handleStatusChange('Partiellement réservée')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> Réservation partielle
                      </button>
                    </>
                  )}
                  {reservation.status === 'Partiellement réservée' && (
                    <button onClick={() => handleStatusChange('Réservée')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" /> Compléter la réservation
                    </button>
                  )}
                  {(reservation.status === 'Réservée' || reservation.status === 'Partiellement réservée') && (
                    <>
                      <button onClick={() => handleStatusChange('Consommée')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <ShoppingCart className="w-4 h-4 text-blue-500 shrink-0" /> Consommer (Sortie stock)
                      </button>
                      <button onClick={() => handleStatusChange('Libérée')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Archive className="w-4 h-4 text-teal-500 shrink-0" /> Libérer les quantités
                      </button>
                    </>
                  )}
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-1 line-separator" />
                  <button onClick={() => { setIsOptionsOpen(false); setActiveTab('historique'); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <History className="w-4 h-4 text-slate-500 shrink-0" /> Consulter l'historique
                  </button>
                  <button onClick={() => setIsOptionsOpen(false)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0" /> Exporter / Imprimer
                  </button>
                  <button onClick={() => setIsOptionsOpen(false)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-indigo-500 shrink-0" /> Dupliquer
                  </button>
                  {['Brouillon', 'En attente', 'Partiellement réservée'].includes(reservation.status) && (
                    <button onClick={() => handleStatusChange('Annulée')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-red-600 dark:text-red-400">
                      <Archive className="w-4 h-4 text-red-500 shrink-0" /> Annuler la réservation
                    </button>
                  )}
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
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{reservation.reference}</h1>
                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border", getPriorityColor(reservation.priority))}>
                    {reservation.priority}
                  </span>
                  <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border", getStatusColor(reservation.status))}>
                    {reservation.status}
                  </span>
                </div>
              </div>

              {/* Quick Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" /> Projet / Affaire
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white truncate" title={reservation.projectName}>{reservation.projectName}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <User className="w-4 h-4" /> Client
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white truncate" title={reservation.clientName}>{reservation.clientName}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0" /> Date prévue
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
                    {safeFormatDate(reservation.plannedDate)}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <User className="w-4 h-4 shrink-0" /> Responsable
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white truncate" title={reservation.responsible}>
                    {reservation.responsible}
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Tabs */}
            <div className="px-8 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <nav className="flex space-x-6 overflow-x-auto">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                        isActive 
                          ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" 
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab content area */}
            <div className="flex-1 p-8">
              <div className="w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'resume' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          
                          {/* Informations essentielles */}
                          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                              <Info className="w-4 h-4 text-slate-400" /> Détails de la réservation
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Projet</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{reservation.projectName}</span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Client</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{reservation.clientName}</span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Site d'intervention</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">Site Principal</span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Demandeur</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{reservation.responsible}</span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Date de demande</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{safeFormatDate(reservation.createdAt)}</span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Priorité</span>
                                <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", getPriorityColor(reservation.priority))}>
                                  {reservation.priority}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Résumé des quantités */}
                          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                              <Box className="w-4 h-4 text-slate-400" /> Résumé des quantités
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">{reservation.totalRequestedQty}</div>
                                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Total demandé</div>
                              </div>
                              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{reservation.totalReservedQty}</div>
                                <div className="text-xs text-indigo-500 font-medium uppercase tracking-wider mt-1">Qté Réservée</div>
                              </div>
                              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-100 dark:border-red-800/30">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{reservation.totalRequestedQty - reservation.totalReservedQty}</div>
                                <div className="text-xs text-red-500 font-medium uppercase tracking-wider mt-1">Manquant</div>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">{reservation.products.length}</div>
                                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Lignes produits</div>
                              </div>
                            </div>
                            
                            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Commentaire / Justification</label>
                              <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                                "Pour le déploiement de la phase 1 du projet. Matériel à préparer avant l'intervention de l'équipe."
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'produits' && (
                      <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Lignes de la réservation</h3>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                              <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Produit</th>
                                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Demandé</th>
                                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Dispo</th>
                                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Réservé</th>
                                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Manquant</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Entrepôt</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">État</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                                {reservation.products.map(p => {
                                  const estComplet = p.reservedQty >= p.requestedQty;
                                  return (
                                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">{p.productName}</div>
                                      <div className="text-xs text-slate-500 font-mono mt-0.5">{p.productReference}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-medium text-slate-900 dark:text-white">
                                      {p.requestedQty}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-slate-500">
                                      {Math.max(0, p.requestedQty + 10)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      <span className={cn("text-sm font-bold", estComplet ? "text-emerald-600" : "text-amber-600")}>
                                        {p.reservedQty}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      {p.missingQty > 0 ? (
                                        <span className="text-sm font-bold text-red-600">{p.missingQty}</span>
                                      ) : (
                                        <span className="text-sm text-slate-400">-</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                      <div>{p.warehouse}</div>
                                      <div className="text-xs text-slate-500">{p.location}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={cn(
                                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                                        estComplet ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"
                                      )}>
                                        {estComplet ? 'Complet' : 'Partiel'}
                                      </span>
                                    </td>
                                  </tr>
                                )})}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'affectations' && (
                      <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6">Affectations par emplacement et numéros de série</h3>
                          <div className="space-y-6">
                            {reservation.products.map((p, idx) => (
                              <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                  <div>
                                    <div className="font-medium text-slate-900 dark:text-white">{p.productName}</div>
                                    <div className="text-xs text-slate-500 font-mono">{p.productReference}</div>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-slate-500">Source:</span> <span className="font-medium text-slate-900 dark:text-white">{p.warehouse} / {p.location}</span>
                                  </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-950">
                                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Numéros de série sélectionnés ({p.reservedQty})</h4>
                                  {p.reservedQty > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {Array.from({ length: p.reservedQty }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-mono text-slate-700 dark:text-slate-300">
                                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                                          SN-{p.productReference?.split('-')[1] || '00'}-{1000 + i}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-slate-400 italic">Aucun numéro de série affecté</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'historique' && (
                      <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-8">Historique de la réservation</h3>
                          <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white dark:border-slate-950 bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <CheckCircle2 className="w-3 h-3" />
                              </div>
                              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="font-bold text-slate-900 dark:text-white">Validation partielle</div>
                                  <time className="text-xs font-medium text-slate-500 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">Hier, 14:30</time>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-300">Réservation confirmée pour les produits en stock. En attente pour les manquants.</div>
                                <div className="text-xs text-slate-400 mt-2 flex items-center gap-1"><User className="w-3 h-3" /> par Jean Admin</div>
                              </div>
                            </div>
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white dark:border-slate-950 bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <Plus className="w-3 h-3" />
                              </div>
                              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="font-bold text-slate-900 dark:text-white">Création</div>
                                  <time className="text-xs font-medium text-slate-500 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">{safeFormatDate(reservation.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })}</time>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-300">Création de la demande de réservation de stock.</div>
                                <div className="text-xs text-slate-400 mt-2 flex items-center gap-1"><User className="w-3 h-3" /> par {reservation.responsible}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right SIDEBAR (Fixed panel) */}
          <div className="w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-6 shrink-0 flex flex-col gap-8 hidden lg:flex">
            
            {/* Progression */}
            <div>
              <div className="text-center mb-4">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * progressionPercent) / 100} className={cn("transition-all duration-1000", progressionPercent === 100 ? "text-emerald-500" : "text-indigo-500")} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{progressionPercent}%</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <span className="inline-block bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {reservation.totalReservedQty} / {reservation.totalRequestedQty} réservés
                </span>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Informations Projet */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Informations Projet</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 mt-0.5">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-0.5">Projet lié</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{reservation.projectName}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-0.5">Client</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{reservation.clientName}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Dates Importantes */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Dates clés</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Création</span>
                  <span className="font-medium text-slate-900 dark:text-white">{safeFormatDate(reservation.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Prévue pour</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">{safeFormatDate(reservation.plannedDate)}</span>
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
                {(reservation.documents || []).map((document) => (
                  <button
                    key={document.id}
                    onClick={() => setSelectedDocument(document)}
                    className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{document.type}</div>
                        <div className="text-xs text-slate-500">{document.number} • {document.status}</div>
                      </div>
                    </div>
                  </button>
                ))}
                {(!reservation.documents || reservation.documents.length === 0) && (
                  <div className="rounded-lg border border-dashed border-slate-300 p-3 text-center text-xs font-medium text-slate-400">
                    Aucun document généré
                  </div>
                )}
              </div>
              <button className="mt-4 w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors">
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500">Dernière modification</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">Hier à 14:30 par Jean</p>
            </div>
            
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedDocument && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
              onClick={() => setSelectedDocument(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-8 shadow-2xl"
            >
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">SIT-ERP</div>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{selectedDocument.type}</h2>
                  <p className="mt-1 font-mono text-sm font-bold text-slate-500">{selectedDocument.number}</p>
                </div>
                <button onClick={() => setSelectedDocument(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-5 py-6 text-sm">
                <div><span className="text-slate-500">Réservation</span><div className="font-bold text-slate-900">{reservation.reference}</div></div>
                <div><span className="text-slate-500">Statut</span><div className="font-bold text-slate-900">{reservation.status}</div></div>
                <div><span className="text-slate-500">Projet</span><div className="font-bold text-slate-900">{reservation.projectName}</div></div>
                <div><span className="text-slate-500">Client</span><div className="font-bold text-slate-900">{reservation.clientName}</div></div>
              </div>

              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Produit</th>
                    <th className="px-4 py-3 text-center">Demandé</th>
                    <th className="px-4 py-3 text-center">Réservé</th>
                    <th className="px-4 py-3">Emplacement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reservation.products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3"><div className="font-bold text-slate-900">{product.productName}</div><div className="font-mono text-xs text-slate-500">{product.productReference}</div></td>
                      <td className="px-4 py-3 text-center font-bold">{product.requestedQty}</td>
                      <td className="px-4 py-3 text-center font-bold text-indigo-600">{product.reservedQty}</td>
                      <td className="px-4 py-3">{product.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
                <div className="text-sm text-slate-500">Total réservé : <strong className="text-slate-900">{reservation.totalReservedQty}</strong></div>
                <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
                  <Printer className="h-4 w-4" /> Imprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
