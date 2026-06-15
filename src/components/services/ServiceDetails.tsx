import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Service, ServiceStatus } from './types';
import { ArrowLeft, Edit, MoreHorizontal, Briefcase, Tag, FileText, CheckCircle2, History, AlertCircle, AlertTriangle, ShieldCheck, Download, Calendar, Plus, ChevronDown, Archive, Settings, Copy } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceEditModal } from './ServiceEditModal';

interface ServiceDetailsProps {
  service: Service;
  onBack: () => void;
}


export function ServiceDetails({ service: initialService, onBack }: ServiceDetailsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [service, setService] = useState<Service>(initialService);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isDuplicateEditModalOpen, setIsDuplicateEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
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

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'Actif': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Désactivé': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Obsolète': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };


  const serviceDocs = [
    { name: "Procédure d'intervention", type: "PDF", size: "1.5 Mo" },
    { name: "Checklist technicien", type: "PDF", size: "850 Ko" },
    { name: "Modèle de rapport", type: "DOCX", size: "2.1 Mo" },
    { name: "Conditions de prestation", type: "PDF", size: "1.1 Mo" },
    { name: "Guide de configuration", type: "XLSX", size: "1.4 Mo" },
  ];

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
                <div className="font-bold text-slate-900 dark:text-white truncate">{service.name}</div>
                <div className="hidden md:flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                    {service.reference}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
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
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  isOptionsOpen && "rotate-180",
                )}
              />
            </button>
            {isOptionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                      setIsArchiveModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Archive className="w-4 h-4 text-red-500 shrink-0" /> Archiver le service
                  </button>
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      setIsDuplicateEditModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-indigo-500 shrink-0" /> Dupliquer le service
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      setIsHistoryModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group relative"
                  >
                    <History className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" /> 
                    <div className="flex-1 overflow-hidden relative text-left">
                      <span className="block w-full truncate group-hover:opacity-0 transition-opacity">
                        Historique des changements
                      </span>
                      <div className="absolute top-0 left-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                         <span className="inline-block animate-scroll-text">Historique des changements</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col lg:flex-row">
          
          {/* Left MAIN area */}
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
            
            {/* Header Info */}
            <div className="px-8 pt-8 pb-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-4" ref={titleRef}>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  <Briefcase className="w-8 h-8 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  {service.name}
                </h1>
                <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border", getStatusColor(service.status))}>
                  {service.status}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-8">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Famille</span>
                  <span className="font-medium text-slate-900 dark:text-white">{service.family}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Référence</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white">{service.reference}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Unité facturation</span>
                  <span className="font-medium text-slate-900 dark:text-white">{service.unit}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Durée estimée</span>
                  <span className="font-medium text-slate-900 dark:text-white">{service.estimatedDuration}</span>
                </div>
              </div>

              {/* Quick Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-500" /> Prix de vente
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{service.sellingPrice.toFixed(2)} DA</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400" /> Coût interne
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{service.internalCost.toFixed(2)} DA</div>
                </div>
                <div className={cn(
                  "rounded-xl p-4 border border-x-transparent border-t-transparent shadow-sm border-b-4",
                  service.marginRate < 120 
                    ? "bg-amber-50 dark:bg-amber-900/10 border-b-amber-500 border-amber-200 dark:border-amber-800"
                    : "bg-slate-50 dark:bg-slate-900 border-b-emerald-500 border-slate-200 dark:border-slate-800"
                )}>
                  <div className={cn(
                    "text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-2",
                    service.marginRate < 120 ? "text-amber-800 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"
                  )}>
                    <ChartIcon className="w-4 h-4" /> Marge % {service.marginRate < 120 && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                  </div>
                  <div className={cn(
                    "text-2xl font-bold",
                    service.marginRate < 120 ? "text-amber-600 dark:text-amber-500" : "text-emerald-600 dark:text-emerald-500"
                  )}>{service.marginRate.toFixed(1)}%</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-500" /> Utilisation
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{service.usageCount} <span className="text-sm font-normal text-slate-500">devis</span></div>
                </div>
              </div>
            </div>

            {/* Main Content Area: Simplified view with cards */}
            <div className="flex-1 p-8 space-y-8 overflow-y-auto">
              
              {/* Card 1: Résumé & Compétences */}
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" /> Résumé de la prestation
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      {service.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Compétences requises
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {service.requiredSkills.map((skill, idx) => (
                          <span key={idx} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-indigo-100 dark:border-indigo-800/30">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-500" /> Matériel associé
                      </h4>
                      {service.associatedEquipment.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {service.associatedEquipment.map((eq, idx) => (
                            <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-medium border border-slate-200 dark:border-slate-700">
                              {eq}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Aucun matériel spécifique requis.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* Right SIDEBAR (Fixed panel) */}
          <div className="w-full lg:w-80 bg-white dark:bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 p-6 shrink-0 flex flex-col gap-8">
            
            {/* Reference */}
            <div>
              <div className="text-center">
                <span className="inline-block bg-slate-100 dark:bg-slate-850 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                  {service.reference}
                </span>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Documents Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Documents du service</h3>
              </div>
              
              <div className="space-y-2">
                {serviceDocs.map((doc, idx) => (
                  <button key={idx} className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{doc.name}</div>
                        <div className="text-xs text-slate-520 dark:text-slate-440">{doc.type} • {doc.size}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button className="mt-4 w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors">
                <Plus className="w-4 h-4" />
                Ajouter un document
              </button>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Points de contrôle qualité Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Points de contrôle qualité</h3>
              </div>
              
              <div className="space-y-2">
                {[
                  "Validation configuration",
                  "Test fonctionnel",
                  "Rapport client signé",
                  "Photos avant/après",
                  "Vérification accès distant"
                ].map((point, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{point}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <ServiceEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        service={service} 
        onSave={(updatedService) => {
          setService(updatedService);
        }}
      />

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isArchiveModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden relative z-10"
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                    <Archive className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Archiver le service</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Voulez-vous vraiment archiver ce service ? Il ne sera plus proposé dans les nouvelles opérations, mais son historique restera conservé.
                  </p>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsArchiveModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      setService({ ...service, status: 'Désactivé' });
                      setIsArchiveModalOpen(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-lg shadow-sm transition-colors"
                  >
                    Confirmer l'archivage
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}



      <ServiceEditModal
        isOpen={isDuplicateEditModalOpen}
        onClose={() => setIsDuplicateEditModalOpen(false)}
        service={service}
        mode="duplicate"
        onSave={(newService) => {
          setIsDuplicateEditModalOpen(false);
          onBack(); 
        }}
      />

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isHistoryModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh]"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Historique des changements
                  </h3>
                </div>

                <div className="p-6 overflow-y-auto">
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 md:ml-4 space-y-8 pb-4">
                    <div className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                        <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-2">
                          01/06/2026, 14:15
                          <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-amber-600">Tarification</span>
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">Prix de vente : 25 000 DA → 28 000 DA</div>
                        <div className="text-xs text-slate-500">Par Admin (Admin Principal)</div>
                    </div>
                    
                    <div className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                        <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-2">
                          28/05/2026, 10:30
                          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Planification</span>
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">Durée estimée : 2h → 3h</div>
                        <div className="text-xs text-slate-500">Par Admin (Admin Principal)</div>
                    </div>
                    
                    <div className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                        <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-2">
                          15/05/2026, 09:20
                          <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Qualité</span>
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">Rapport requis : Non → Oui</div>
                        <div className="text-xs text-slate-500">Par Admin (Admin Principal)</div>
                    </div>

                    <div className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-slate-300 dark:bg-slate-700 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                        <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-2">
                          02/05/2026, 16:45
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Modification</span>
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">Conditions modifiées</div>
                        <div className="text-xs text-slate-500">Par Admin (Admin Principal)</div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => setIsHistoryModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function ChartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}
