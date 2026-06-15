import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArchiveItem, ArchiveStatus } from './types';
import { ArrowLeft, History, RefreshCw, Trash2, Box, Package, Briefcase, Wrench, Shield, Database, Settings, ChevronDown, CheckCircle2, AlertTriangle, Info, FileText, Archive } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useModules } from '../../contexts/ModuleContext';

interface ArchiveDetailsProps {
  archive: ArchiveItem;
  onBack: () => void;
}

export function ArchiveDetails({ archive, onBack }: ArchiveDetailsProps) {
  const { isModuleEnabled } = useModules();
  
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [isTitleVisible, setIsTitleVisible] = useState(true);
  const titleRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Check if original module is enabled (naive matching based on archive.module string)
  const isOriginalModuleActive = useMemo(() => {
    const normalizeName = (name: string) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
    const normalizedModule = normalizeName(archive.module);
    
    // Some hardcoded mappings for our mock modules:
    if (archive.type === 'Produit') return isModuleEnabled('produits');
    if (archive.type === 'Service') return isModuleEnabled('services');
    if (archive.type === 'Fournisseur') return isModuleEnabled('fournisseurs');
    if (archive.type === 'Client') return isModuleEnabled('clients');
    if (archive.type === 'Projet client') return isModuleEnabled('projets-clients');
    if (archive.type === 'Utilisateur') return isModuleEnabled('utilisateurs');
    if (archive.type === 'Sortie de stock') return isModuleEnabled('sorties-stock');
    if (archive.type === 'Réception') return isModuleEnabled('receptions-fournisseur');
    if (archive.type === 'Commande fournisseur') return isModuleEnabled('commandes-fournisseur');
    if (archive.type === 'Équipement') return isModuleEnabled('equipements-installes');
    if (archive.type === 'Intervention') return isModuleEnabled('interventions-sav');
    
    // Fallback naive match
    return isModuleEnabled(normalizedModule);
  }, [archive, isModuleEnabled]);

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

  const getStatusColor = (status: ArchiveStatus) => {
    switch(status) {
      case 'Restaurable': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Conservation obligatoire': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'Lecture seule': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Archivé': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getFamilyIcon = () => {
    switch (archive.family) {
      case 'Référentiel': return <Database className="w-4 h-4 text-slate-400" />;
      case 'Stock & Logistique': return <Package className="w-4 h-4 text-slate-400" />;
      case 'Projets & Affaires': return <Briefcase className="w-4 h-4 text-slate-400" />;
      case 'Parc Client & SAV': return <Wrench className="w-4 h-4 text-slate-400" />;
      case 'Administration': return <Shield className="w-4 h-4 text-slate-400" />;
      default: return <Box className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }).format(new Date(dateString));
  };

  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
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
          <span className="hidden sm:inline">Retour aux archives</span>
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
                <div className="font-bold text-slate-900 dark:text-white truncate">{archive.name}</div>
                <div className="hidden md:flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                    {archive.reference}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
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
                  {archive.isRestorable && (
                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        setShowRestoreModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-emerald-500 shrink-0" /> Restaurer
                    </button>
                  )}
                  {isOriginalModuleActive && (
                    <button
                      onClick={() => setIsOptionsOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Box className="w-4 h-4 text-indigo-500 shrink-0" /> Consulter le module d'origine
                    </button>
                  )}
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      setShowDeleteModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" /> Supprimer définitivement
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full">
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
          
            {/* Header Info */}
            <div className="px-8 pt-8 pb-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-4" ref={titleRef}>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{archive.name}</h1>
                <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border", getStatusColor(archive.status))}>
                  {archive.status}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-8">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Référence</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white">{archive.reference}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Type</span>
                  <span className="font-medium text-slate-900 dark:text-white">{archive.type}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Module d'origine</span>
                  <span className="font-medium text-slate-900 dark:text-white">{archive.module}</span>
                </div>
              </div>

              {/* Quick Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    {getFamilyIcon()} Famille
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{archive.family}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <History className="w-4 h-4" /> Archivé le
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">{formatDate(archive.archivedAt)}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Archivé par
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{archive.archivedBy}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 shrink-0" /> Motif
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate" title={archive.reason}>
                    {archive.reason}
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Tabs */}
            <div className="px-8 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <nav className="flex space-x-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('details')}
                  className={cn(
                    "flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    activeTab === 'details' 
                      ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" 
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <FileText className="w-4 h-4" />
                  Détails de l'élément
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={cn(
                    "flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    activeTab === 'history' 
                      ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" 
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <History className="w-4 h-4" />
                  Historique
                </button>
              </nav>
            </div>

            {/* Tab content area */}
            <div className="flex-1 p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      {!isOriginalModuleActive && archive.isRestorable && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex items-start gap-4">
                          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-400">Le module d'origine est désactivé</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">Vous ne pourrez pas restaurer cet élément tant que le module "<strong>{archive.module}</strong>" n'est pas réactivé depuis le Module Store.</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Box className="w-4 h-4 text-slate-400" /> Données d'origine ({archive.type})
                        </h3>
                        <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800/50 border-t border-slate-100 dark:border-slate-800/50">
                          {Object.entries(archive.originalData).map(([key, value]) => (
                            <div key={key} className="flex flex-col sm:flex-row sm:items-center py-3">
                              <span className="text-sm text-slate-500 dark:text-slate-400 w-1/3 sm:w-1/4 font-medium mb-1 sm:mb-0">
                                {formatKey(key)}
                              </span>
                              <span className="text-sm font-medium text-slate-900 dark:text-white break-words flex-1">
                                {String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="max-w-2xl">
                      <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                        
                        <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-[-40px] md:relative md:left-0 z-10 text-[10px]">
                            <Archive className="w-3.5 h-3.5 text-indigo-500" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-800 shadow-sm relative before:absolute before:top-4 before:w-4 before:h-4 before:bg-white dark:before:bg-slate-950 before:border-slate-200 dark:before:border-slate-800 before:border-b before:border-l before:rotate-45 before:-left-2 md:group-odd:-right-2 md:group-odd:left-auto md:group-odd:border-b-0 md:group-odd:border-r md:group-odd:border-t-0 md:group-even:-left-2">
                             <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white mb-1">
                               <span>Archivage</span>
                               <span className="text-xs font-normal text-slate-500">Aujourd'hui</span>
                             </div>
                             <div className="text-xs text-slate-500 mb-2">Par {archive.archivedBy}</div>
                             <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2 rounded">
                               Motif : {archive.reason}
                             </div>
                          </div>
                        </div>

                        <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-[-40px] md:relative md:left-0 z-10 text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 relative before:absolute before:top-4 before:w-4 before:h-4 before:bg-slate-50/50 dark:before:bg-slate-900/50 before:border-slate-100 dark:before:border-slate-800 before:border-b before:border-l before:rotate-45 before:-left-2 md:group-odd:-right-2 md:group-odd:left-auto md:group-odd:border-b-0 md:group-odd:border-r md:group-odd:border-t-0 md:group-even:-left-2">
                             <div className="flex items-center justify-between font-bold text-sm text-slate-600 dark:text-slate-300 mb-1">
                               <span>Création initiale</span>
                               <span className="text-xs font-normal text-slate-500">Il y a 6 mois</span>
                             </div>
                             <div className="text-xs text-slate-500">Par Système</div>
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
      </div>

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Restaurer cet élément ?</h2>
            </div>
            
            <div className="p-6">
              {!isOriginalModuleActive ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-400">Restauration impossible</p>
                    <p className="text-sm text-amber-700 dark:text-amber-500">Le module <strong>{archive.module}</strong> est actuellement désactivé. Vous devez le réactiver depuis le Module Store avant de pouvoir restaurer cette archive.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    Vous êtes sur le point de restaurer <strong className="text-slate-900 dark:text-white">{archive.name}</strong>.
                  </p>
                  <p>
                    L'élément redeviendra visible et utilisable dans le module <strong>{archive.module}</strong>.
                    Les dépendances, si elles existent toujours, seront rétablies.
                  </p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                {isOriginalModuleActive ? 'Annuler' : 'Fermer'}
              </button>
              {isOriginalModuleActive && (
                <button
                  onClick={() => {
                    // Simulation of restoration
                    setShowRestoreModal(false);
                    onBack();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Restaurer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Suppression définitive</h2>
            </div>
            
            <div className="p-6">
              {archive.isProtected ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4 flex gap-3">
                  <Shield className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-400">Suppression impossible</p>
                    <p className="text-sm text-red-700 dark:text-red-500">Cet élément a le statut "{archive.status}" et est utilisé par des documents ou opérations historiques. Maintien obligatoire pour assurer la traçabilité de l'ERP.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    Êtes-vous sûr de vouloir supprimer définitivement <strong className="text-slate-900 dark:text-white">{archive.name}</strong> ?
                  </p>
                  <p className="text-red-600 dark:text-red-400 font-medium">Cette action est totalement irréversible. L'élément disparaîtra des archives.</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Fermer
              </button>
              {!archive.isProtected && (
                <button
                  onClick={() => {
                    // Simulation of deletion
                    setShowDeleteModal(false);
                    onBack();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
