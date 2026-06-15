import React, { useState, useRef, useEffect } from 'react';
import { Client, ClientStatus, ClientProject, ClientSite } from './types';
import { ArrowLeft, Edit, MoreHorizontal, Settings, ChevronDown, Building2, Briefcase, Box, ShieldAlert, User, Phone, Mail, FileText, Plus, MapPin, Globe, Calendar, Clock, History, CheckCircle2, AlertCircle, Trash2, Copy, X } from 'lucide-react';
import { cn, safeFormatDate } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ClientEditModal } from './ClientEditModal';
import { ClientSiteModal } from './ClientSiteModal';
import { ClientProjectModal } from './ClientProjectModal';

interface ClientDetailsProps {
  client: Client;
  onBack: () => void;
  onUpdate: (client: Client) => void;
  onDelete: (clientId: string) => void;
  onViewParc: (clientId: string) => void;
}

export function ClientDetails({ client: initialClient, onBack, onUpdate, onDelete, onViewParc }: ClientDetailsProps) {
  const [client, setClient] = useState<Client>(initialClient);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'duplicate'>('edit');
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [isTitleVisible, setIsTitleVisible] = useState(true);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setClient(initialClient);
  }, [initialClient]);

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

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case 'Actif': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Inactif': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Archivé': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const handleEdit = () => {
    setModalMode('edit');
    setIsEditModalOpen(true);
    setIsOptionsOpen(false);
  };

  const handleDuplicate = () => {
    setModalMode('duplicate');
    setIsEditModalOpen(true);
    setIsOptionsOpen(false);
  };

  const handleArchive = () => {
    setIsArchiveConfirmOpen(true);
    setIsOptionsOpen(false);
  };

  const handleConfirmArchive = () => {
    const updatedClient = { ...client, status: 'Archivé' as ClientStatus };
    setClient(updatedClient);
    onUpdate(updatedClient);
    setIsArchiveConfirmOpen(false);
  };

  const handleAddSite = (site: ClientSite) => {
    const updatedSites = [...(client.sites || []), site];
    const updatedClient = { 
      ...client, 
      sites: updatedSites, 
      sitesCount: updatedSites.length 
    };
    setClient(updatedClient);
    onUpdate(updatedClient);
  };

  const handleAddProject = (project: ClientProject) => {
    const updatedProjects = [...(client.projects || []), project];
    const updatedClient = { 
      ...client, 
      projects: updatedProjects, 
      activeProjects: updatedProjects.filter(p => p.status !== 'Terminé').length 
    };
    setClient(updatedClient);
    onUpdate(updatedClient);
  };

  const tabs = [
    { id: 'resume', label: 'Résumé', icon: Building2 },
    { id: 'sites', label: 'Sites client', icon: MapPin },
    { id: 'projets', label: 'Projets liés', icon: Briefcase },
    { id: 'equipements', label: 'Parc installé', icon: Box },
    { id: 'historique', label: 'Audit & CRM', icon: Clock },
  ];

  const [activeTab, setActiveTab] = useState('resume');

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Top Actions Bar */}
      <div className="relative flex items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0 transition-all duration-300 z-50">
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
                <div className="font-bold text-slate-900 dark:text-white truncate tracking-tight">{client.name}</div>
                <div className="hidden md:flex items-center justify-center shrink-0">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider border", getStatusColor(client.status))}>
                    {client.status}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button 
            onClick={handleEdit}
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
                    onClick={handleDuplicate}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                  >
                    <Copy className="w-4 h-4 text-indigo-500 shrink-0" /> Dupliquer le client
                  </button>
                  <button 
                    onClick={() => { setIsHistoryOpen(true); setIsOptionsOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left group relative"
                  >
                    <History className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" /> 
                    <div className="flex-1 overflow-hidden relative text-left ml-2">
                      <span className="block w-full truncate group-hover:opacity-0 transition-opacity">
                        Historique des changements
                      </span>
                      <div className="absolute top-0 left-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                         <span className="inline-block animate-scroll-text">Historique des changements</span>
                      </div>
                    </div>
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button 
                    onClick={() => { setIsProjectModalOpen(true); setIsOptionsOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                  >
                    <Plus className="w-4 h-4 text-emerald-500 shrink-0" /> Créer un projet
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button 
                    onClick={handleArchive}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 rounded-lg transition-colors text-left"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" /> {client.status === 'Archivé' ? 'Désarchiver' : 'Archiver le client'}
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
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 pb-20">
            
            {/* Header Info */}
            <div className="px-8 pt-8 pb-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-4" ref={titleRef}>
                <div className="flex flex-col gap-1">
                   <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{client.name}</h1>
                   <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <span>{client.type}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span>{client.sector}</span>
                   </div>
                </div>
                <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border", getStatusColor(client.status))}>
                  {client.status}
                </span>
              </div>

              {/* Top Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" /> Sites
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{client.sitesCount}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" /> Projets actifs
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{client.activeProjects}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors group" onClick={() => onViewParc(client.id)}>
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2 group-hover:text-indigo-500">
                    <Box className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" /> Équipements
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">{client.installedEquipments}</div>
                </div>
                <div className={cn(
                  "rounded-xl p-4 border transition-colors shadow-sm",
                  client.hasExpiredWarranties ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                )}>
                  <div className={cn(
                    "text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2",
                    client.hasExpiredWarranties ? "text-red-800 dark:text-red-400" : "text-slate-500 dark:text-slate-400"
                  )}>
                    <ShieldAlert className="w-4 h-4 shrink-0" /> Garanties
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <div className={cn(
                      "text-sm font-bold uppercase",
                      client.hasExpiredWarranties ? "text-red-600 dark:text-red-500" : "text-emerald-600 dark:text-emerald-500"
                    )}>
                      {client.hasExpiredWarranties ? "À surveiller" : "À jour"}
                    </div>
                    {client.hasExpiredWarranties && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
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
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {activeTab === 'resume' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* General Info */}
                      <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" /> Informations essentielles
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                            <span className="text-sm text-slate-500">Raison sociale</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{client.name}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                            <span className="text-sm text-slate-500">Type de client</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{client.type}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                            <span className="text-sm text-slate-500">Secteur d'activité</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{client.sector}</span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-slate-500">Responsable interne</span>
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">K. Samia</span>
                          </div>
                        </div>
                      </div>

                      {/* Contacts */}
                      <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" /> Contacts clés
                        </h3>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-white">{client.mainContact}</div>
                              <div className="text-xs text-slate-500">Contact Principal</div>
                            </div>
                            <div className="flex gap-2">
                              <a href={`tel:${client.phone}`} className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 transition-colors group">
                                <Phone className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                              </a>
                              <a href={`mailto:${client.email}`} className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 transition-colors group">
                                <Mail className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                              </a>
                            </div>
                          </div>
                          <div className="h-px bg-slate-100 dark:bg-slate-800" />
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-white">Fatima Zahra</div>
                              <div className="text-xs text-slate-500">Comptabilité & Finance</div>
                            </div>
                            <div className="flex gap-2 opacity-50">
                              <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <Phone className="w-4 h-4 text-slate-400" />
                              </div>
                              <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <Mail className="w-4 h-4 text-slate-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'sites' && (
                    <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" /> Sites d'exploitation
                        </h3>
                        <button onClick={() => setIsSiteModalOpen(true)} className="text-sm font-medium text-indigo-600 flex items-center gap-1 hover:underline">
                          <Plus className="w-4 h-4" /> Nouveau site
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {client.sites?.map(site => (
                          <div key={site.id} className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 transition-all group bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">{site.name}</div>
                            <div className="text-xs text-slate-500 mb-4">{site.address}, {site.city}</div>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="px-2 py-0.5 bg-white dark:bg-slate-800 text-[10px] font-semibold text-slate-500 rounded border border-slate-200 dark:border-slate-700 uppercase">{site.type}</span>
                              <span className="text-xs font-bold text-indigo-600">{site.installedEquipments} équips.</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'projets' && (
                    <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-slate-400" /> Historique des projets
                        </h3>
                        <button onClick={() => setIsProjectModalOpen(true)} className="text-sm font-medium text-indigo-600 flex items-center gap-1 hover:underline">
                          <Plus className="w-4 h-4" /> Lancer un projet
                        </button>
                      </div>
                      <div className="space-y-4">
                        {client.projects?.map(project => (
                          <div key={project.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 transition-colors bg-slate-50/30">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400">
                                <Briefcase className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">{project.name}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{project.reference} • {safeFormatDate(project.expectedDate)}</div>
                              </div>
                            </div>
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-1 rounded uppercase border",
                              project.status === 'En cours' ? "bg-blue-50 text-blue-700 border-blue-100" :
                              project.status === 'Terminé' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                              "bg-slate-50 text-slate-500 border-slate-100"
                            )}>{project.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                   {activeTab === 'equipements' && (
                    <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center py-16">
                      <Box className="w-16 h-16 text-slate-200 mb-4" />
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Base Installée du Client</h4>
                      <p className="text-sm text-slate-500 mb-8 max-w-sm text-center">Consultez l'inventaire complet des équipements installés sur les différents sites.</p>
                      <button onClick={() => onViewParc(client.id)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">
                        Ouvrir le parc installé
                      </button>
                    </div>
                  )}

                  {activeTab === 'historique' && (
                    <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-8 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" /> Historique des interactions
                      </h3>
                      <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-8 space-y-10">
                        {client.history?.map((event, idx) => (
                          <div key={event.id} className="relative">
                            <div className={cn(
                              "absolute -left-[37px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950",
                              idx === 0 ? "bg-indigo-500 ring-4 ring-indigo-500/10" : "bg-slate-200 dark:bg-slate-700"
                            )} />
                            <div className="text-xs text-slate-500 mb-1 flex items-center gap-2 font-medium">
                              {safeFormatDate(event.date)} • <span className="text-indigo-600 uppercase font-bold">{event.type}</span>
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</div>
                            <div className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                              <User className="w-3 h-3" /> {event.user}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right SIDEBAR (Fixed panel) */}
          <div className="w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-6 shrink-0 flex flex-col gap-8 hidden lg:flex">
            
            {/* Logo/Photo */}
            <div>
              <div className="w-full aspect-square rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4 shadow-sm relative group overflow-hidden">
                <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-700 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-center">
                <span className="inline-block bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-700 dark:text-slate-300">
                  {client.reference || 'REF-N/A'}
                </span>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Quick Info */}
            <div className="space-y-4">
               <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" /> Localisation
               </h3>
               <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Ville</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{client.city}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Région</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{client.region}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Enregistré le</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{safeFormatDate(client.createdAt)}</span>
                  </div>
               </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Documents */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                   <FileText className="w-4 h-4 text-slate-400" /> Documents utiles
                </h3>
              </div>
              
              <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                {[
                  { label: 'Contrat Cadre', type: 'PDF', size: '1.2 MB' },
                  { label: 'Bon de commande #102', type: 'PDF' },
                  { label: 'Fiche client CRM', type: 'DOCX' }
                ].map((doc, i) => (
                  <button key={i} className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 transition-all text-left group">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate mb-0.5">{doc.label}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{doc.type} {doc.size ? `• ${doc.size}` : ''}</div>
                    </div>
                  </button>
                ))}
              </div>

              <button className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all uppercase tracking-wider">
                <Plus className="w-4 h-4" /> Ajouter un doc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals ========================================= */}
      <ClientEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updated) => {
          setClient(updated);
          onUpdate(updated);
        }}
        client={client}
        mode={modalMode}
      />

      <ClientSiteModal 
        isOpen={isSiteModalOpen}
        onClose={() => setIsSiteModalOpen(false)}
        onSave={handleAddSite}
        clientId={client.id}
      />

      <ClientProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleAddProject}
        clientId={client.id}
        clientName={client.name}
        sites={client.sites || []}
      />

      {/* Archive Confirmation Popup */}
      <AnimatePresence>
        {isArchiveConfirmOpen && (
          <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsArchiveConfirmOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden z-10"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                  <History className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Archiver le client</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Voulez-vous vraiment archiver ce client ? Il ne sera plus proposé dans les nouvelles opérations, mais son historique complet restera conservé.
                </p>
                <div className="flex items-center gap-3 justify-end">
                   <button
                     onClick={() => setIsArchiveConfirmOpen(false)}
                     className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                   >
                     Annuler
                   </button>
                   <button
                     onClick={handleConfirmArchive}
                     className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors"
                   >
                     Confirmer l'archivage
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

       {/* History Sidebar Panel Placeholder */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-[11000] flex justify-end overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md shadow-2xl"
              onClick={() => setIsHistoryOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="relative bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10"
            >
               <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Journal d'audit</h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Traçabilité complète des modifications</p>
                  </div>
                  <button 
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-10">
                  <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-8 space-y-12">
                     {client.history?.map((event, idx) => (
                        <div key={event.id} className="relative group">
                           <div className="absolute -left-[37px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 shadow-md group-hover:scale-125 transition-transform" />
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{safeFormatDate(event.date)}</span>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{event.title}</h4>
                              <div className="flex items-center gap-2 mt-3 p-2 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                 <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                                    {event.user.charAt(0)}
                                 </div>
                                 <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">{event.user} • {event.type}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                     <div className="relative p-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center">
                        <History className="w-8 h-8 text-slate-100 dark:text-slate-800 mb-2 mx-auto rotate-180 opacity-50" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Fin de l'historique récent</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
