import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Edit3, MoreVertical, 
  Calendar, MapPin, User, CheckCircle2, 
  Clock, AlertCircle, Package, Wrench, 
  FileText, ShieldAlert, Info, TrendingUp,
  ExternalLink, ChevronRight, Share2, 
  Printer, History, ArrowRight,
  BarChart3, Settings, Briefcase, Lock,
  Trash2, Send, RefreshCw, XCircle
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { cn } from '../../lib/utils';
import { Besoin, BesoinProduct, BesoinService, Substitution, HistoryEvent } from './types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BesoinOptionsDropdown } from './BesoinOptionsDropdown';
import { CancellationModal, SubstitutionModal } from './ActionModals';
import { HistorySidebar } from './HistorySidebar';
import { safeFormatDate } from '../../lib/utils';

interface BesoinDetailsProps {
  besoin: Besoin;
  onBack: () => void;
  onEdit: () => void;
  onUpdate: (updatedBesoin: Besoin) => void;
}

export function BesoinDetails({ besoin, onBack, onEdit, onUpdate }: BesoinDetailsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  
  const { scrollY } = useScroll({ container: scrollRef });
  
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);
  const headerTranslateY = useTransform(scrollY, [0, 100], [10, 0]);

  // Donut chart data
  const coverageData = [
    { name: 'Couvert', value: besoin.totalCoverageRate, color: '#10b981' },
    { name: 'En attente', value: 100 - besoin.totalCoverageRate, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  const stats = [
    { label: 'Éléments demandés', value: besoin.products.length + besoin.services.length, icon: Package, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' },
    { label: 'Éléments couverts', value: Math.round(((besoin.products.length + besoin.services.length) * besoin.totalCoverageRate) / 100), icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
    { label: 'Éléments manquants', value: besoin.products.reduce((acc, p) => acc + (p.missingQty > 0 ? 1 : 0), 0), icon: AlertCircle, color: 'text-red-600 bg-red-50 dark:bg-red-900/30' },
    { label: 'Impact projet', value: besoin.impactProject, icon: ShieldAlert, color: besoin.impactProject === 'Projet bloqué' ? 'text-red-600 bg-red-50' : (besoin.impactProject === 'Risque de retard' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50') }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Couvert':
      case 'Consommé':
      case 'Validé':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Partiellement couvert':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'À valider':
      case 'À affecter':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Bloqué':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Annulé':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const addHistoryEvent = (type: string, description: string) => {
    const newEvent: HistoryEvent = {
       id: Math.random().toString(36).substr(2, 9),
       date: new Date().toISOString().replace('T', ' ').substr(0, 16).replace('-', '/'),
       type,
       user: 'User Demo',
       description
    };
    onUpdate({
      ...besoin,
      history: [newEvent, ...besoin.history]
    });
  };

  const handleAction = (actionId: string) => {
     switch (actionId) {
        case 'validate':
          if (!besoin.projectName || !besoin.plannedDate) {
            alert('Vérifiez que le projet et la date sont renseignés.');
            return;
          }
          onUpdate({ ...besoin, status: 'Validé' });
          addHistoryEvent('Validation', 'Le dossier de besoin a été validé techniquement.');
          break;
        case 'reserve':
          const updatedProducts = besoin.products.map(p => ({
            ...p,
            reservedQty: p.requestedQty,
            missingQty: 0,
            status: 'Réservé'
          }));
          onUpdate({ 
            ...besoin, 
            products: updatedProducts, 
            totalCoverageRate: 100,
            status: 'Couvert'
          });
          addHistoryEvent('Réservation', 'L\'ensemble des produits disponibles a été réservé en stock.');
          break;
        case 'assign':
          alert('Popup d\'affectation des intervenants ouverte.');
          break;
        case 'substitute':
          setIsSubstitutionModalOpen(true);
          break;
        case 'transmit':
          addHistoryEvent('Transmission', 'Dossier transmis à l\'approvisionnement pour les produits manquants.');
          alert('Transmis à l\'approvisionnement.');
          break;
        case 'consume':
          onUpdate({ ...besoin, status: 'Consommé' });
          addHistoryEvent('Consommation', 'Le matériel a été marqué comme consommé sur site.');
          break;
        case 'cancel':
          setIsCancellationModalOpen(true);
          break;
        case 'history':
          setIsHistorySidebarOpen(true);
          break;
        case 'archive':
          if (confirm('Voulez-vous vraiment archiver ce besoin ?')) {
            addHistoryEvent('Archivage', 'Le dossier a été archivé.');
            onBack();
          }
          break;
     }
  };

  const handleConfirmCancellation = (reason: string) => {
    onUpdate({ 
       ...besoin, 
       status: 'Annulé',
       products: besoin.products.map(p => ({ ...p, reservedQty: 0, missingQty: p.requestedQty })),
       totalCoverageRate: 0,
       history: [{
         id: Math.random().toString(36).substr(2, 9),
         date: new Date().toISOString().replace('T', ' ').substr(0, 16).replace('-', '/'),
         type: 'Annulation',
         user: 'User Demo',
         description: `Besoin annulé pour le motif suivant : ${reason}`
       }, ...besoin.history]
    });
    setIsCancellationModalOpen(false);
  };

  const handleConfirmSubstitution = (sub: Substitution) => {
    const finalSub = { ...sub, id: Math.random().toString(36).substr(2, 9) };
    onUpdate({
       ...besoin,
       substitutions: [finalSub, ...besoin.substitutions],
       history: [{
         id: Math.random().toString(36).substr(2, 9),
         date: new Date().toISOString().replace('T', ' ').substr(0, 16).replace('-', '/'),
         type: 'Substitution',
         user: 'User Demo',
         description: `${sub.originalLabel} remplacé par ${sub.substitutedLabel}. Motif : ${sub.reason}`
       }, ...besoin.history]
    });
    setIsSubstitutionModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <motion.div 
                style={{ opacity: headerOpacity, y: headerTranslateY }}
                className="flex items-center gap-3"
              >
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{besoin.reference}</h2>
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", getStatusColor(besoin.status))}>
                  {besoin.status}
                </span>
              </motion.div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white md:hidden">Détails du besoin</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onEdit}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2 inline" /> Modifier info
            </button>
            <BesoinOptionsDropdown besoin={besoin} onAction={handleAction} />
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Header Info */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Dossier de besoin</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Créé le {safeFormatDate(besoin.createdAt)}</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
                  {besoin.reference}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    <span>{besoin.projectName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-4">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>{besoin.clientName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-4">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>Prévu pour le {safeFormatDate(besoin.plannedDate)}</span>
                  </div>
                </div>
              </div>

              {/* KPI Cards & Donut */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 grid grid-cols-2 gap-6">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mb-1", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <div className="md:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center relative min-h-[200px]">
                  <span className="absolute top-6 left-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Couverture globale</span>
                  <div className="w-full h-full min-h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={coverageData}
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {coverageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-4">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{besoin.totalCoverageRate}%</span>
                  </div>
                </div>
              </div>

              {/* Informations Générales */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-500" /> Informations générales
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="space-y-4">
                      <DetailField label="Responsable" value={besoin.responsible} icon={User} />
                      <DetailField label="Priorité" value={besoin.priority} highlight={besoin.priority === 'Critique' || besoin.priority === 'Haute'} />
                      <DetailField label="Site d'intervention" value={besoin.site || 'Non spécifié'} icon={MapPin} />
                    </div>
                    <div className="space-y-4">
                      <DetailField label="Justification métier" value={besoin.justification || 'Aucune justification fournie'} isFull />
                      <DetailField label="Commentaire interne" value={besoin.internalComment || 'Aucun commentaire'} isFull isMuted />
                    </div>
                  </div>
                </div>
              </div>

              {/* Produits Nécessaires */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-500" /> Produits nécessaires
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{besoin.products.length} articles</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Produit</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Quantité</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Disponibilité</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {besoin.products.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{product.label}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.2em]">Réf: {product.reference}</span>
                                {product.isSerialized && (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-[0.2em] flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" /> {product.serializedCount || 0} sérialisés
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{product.requestedQty}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 w-32">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                <span>{product.reservedQty} réservé</span>
                                <span className={product.missingQty > 0 ? "text-red-500" : ""}>{product.missingQty > 0 ? `-${product.missingQty}` : 'OK'}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex relative z-10 shadow-inner">
                                <div 
                                  className={cn("h-full transition-all duration-1000 ease-out", product.missingQty > 0 ? "bg-amber-400" : "bg-emerald-500")}
                                  style={{ width: `${(product.reservedQty / product.requestedQty) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", getStatusColor(product.status))}>
                              {product.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Services Nécessaires */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-500" /> Services nécessaires
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{besoin.services.length} prestations</span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {besoin.services.map((service) => (
                      <div key={service.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col gap-3 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{service.label}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{service.requiredSkill || 'Compétence non spécifiée'}</span>
                          </div>
                          <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border", getStatusColor(service.status))}>
                            {service.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-700/50 pt-3 mt-1">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Durée / Planifié</span>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{service.plannedDuration} {service.unit}</span>
                            </div>
                          </div>
                          <div className="flex flex-col border-l border-slate-200 dark:border-slate-700/50 pl-4">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Intervenant</span>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                              <User className="w-3.5 h-3.5 text-emerald-500" />
                              <span className={cn(!service.assignedResource && "italic text-red-500")}>
                                {service.assignedResource || 'À affecter'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alternatives & Substitutions */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm border-l-4 border-l-amber-500">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" /> Alternatives et substitutions
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{besoin.substitutions.length} propositions</span>
                </div>
                <div className="p-6 space-y-4">
                  {besoin.substitutions.length > 0 ? (
                    besoin.substitutions.map((sub) => (
                      <div key={sub.id} className="p-5 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col line-through text-slate-400">
                              <span className="text-xs font-bold">{sub.originalLabel}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-amber-500" />
                            <div className="flex flex-col text-slate-900 dark:text-white">
                              <span className="text-sm font-bold uppercase tracking-tight">{sub.substitutedLabel}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                            {sub.type}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg border border-amber-100/50 italic leading-relaxed">
                          "{sub.reason}"
                        </p>
                        <div className="grid grid-cols-3 gap-6 pt-2 border-t border-amber-100/50">
                          <SubImpact label="Coût" value={sub.impactCost} />
                          <SubImpact label="Délai" value={sub.impactDelay} />
                          <SubImpact label="Conformité" value={sub.compliance} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-slate-500 italic">Aucune substitution proposée pour ce besoin.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Historique */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-500" /> Aperçu Historique
                  </h3>
                  <button 
                    onClick={() => setIsHistorySidebarOpen(true)}
                    className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest"
                  >
                    Voir tout
                  </button>
                </div>
                <div className="p-8">
                  <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-slate-200 before:to-slate-200 dark:before:via-slate-800 dark:before:to-slate-800">
                    {besoin.history.slice(0, 3).map((event) => (
                      <div key={event.id} className="relative flex items-start gap-12 group">
                        <div className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 shadow-lg group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div className="flex-1 pt-1 ml-14">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{event.type}</span>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                              <Clock className="w-3.5 h-3.5" /> {event.date}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-colors">
                            {event.description}
                            <span className="block mt-2 font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-[9px]">— Par {event.user}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Projet Summary */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Contexte Projet</h4>
                  <div className="space-y-4">
                    <SidebarItem icon={Briefcase} label="Projet" value={besoin.projectName} />
                    <SidebarItem icon={User} label="Client" value={besoin.clientName} />
                    <SidebarItem icon={MapPin} label="Site" value={besoin.site || 'Marrakech'} />
                    <SidebarItem icon={Clock} label="Échéance" value={safeFormatDate(besoin.plannedDate)} />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Documents liés</h4>
                  <div className="space-y-2">
                    <DocLink label="Cahier des charges.pdf" />
                    <DocLink label="Plan d'implantation.dwg" />
                    <DocLink label="Devis validé #789.pdf" />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Alertes importantes</h4>
                  <div className="space-y-3">
                    {besoin.products.some(p => p.missingQty > 0) && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 dark:text-red-400 font-medium">Certains articles sont manquants en stock.</p>
                      </div>
                    )}
                    {besoin.services.some(s => !s.assignedResource) && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-start gap-3">
                        <User className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Certaines prestations n'ont pas d'intervenant affecté.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-500/10">
                    <Settings className="w-4 h-4" /> Optimiser les ressources
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold uppercase tracking-widest text-xs transition-all">
                    Accéder au projet
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      <CancellationModal 
        isOpen={isCancellationModalOpen}
        onClose={() => setIsCancellationModalOpen(false)}
        onConfirm={handleConfirmCancellation}
      />

      <SubstitutionModal 
        isOpen={isSubstitutionModalOpen}
        onClose={() => setIsSubstitutionModalOpen(false)}
        onConfirm={handleConfirmSubstitution}
        besoin={besoin}
      />

      <HistorySidebar 
        isOpen={isHistorySidebarOpen}
        onClose={() => setIsHistorySidebarOpen(false)}
        history={besoin.history}
      />
    </div>
  );
}

function DetailField({ label, value, icon: Icon, isFull = false, isMuted = false, highlight = false }: { label: string, value: string, icon?: any, isFull?: boolean, isMuted?: boolean, highlight?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1.5", isFull && "col-span-full")}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-0.5">{label}</span>
      <div className={cn(
        "flex items-center gap-2 text-sm font-bold p-3 rounded-xl border transition-all",
        isMuted ? "bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 border-slate-100 dark:border-slate-800" : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-sm",
        highlight && "bg-rose-50 text-rose-600 border-rose-100"
      )}>
        {Icon && <Icon className={cn("w-4 h-4", highlight ? "text-rose-500" : "text-indigo-500")} />}
        <span>{value}</span>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-slate-900 dark:text-white truncate" title={value}>{value}</span>
      </div>
    </div>
  );
}

function DocLink({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all group">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-all opacity-0 group-hover:opacity-100" />
    </button>
  );
}

function SubImpact({ label, value }: { label: string, value: string }) {
  const getSubColor = (v: string) => {
    if (['Augmentation', 'Retard', 'Dégradé'].includes(v)) return 'text-red-600';
    if (['Diminution', 'Avance', 'Conforme'].includes(v)) return 'text-emerald-600';
    return 'text-slate-600';
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className={cn("text-xs font-black", getSubColor(value))}>{value}</span>
    </div>
  );
}
