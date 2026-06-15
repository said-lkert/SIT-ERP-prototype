import React, { useState, useEffect, useRef } from 'react';
import { ProjetClient, ProjetJalon, ProjetBesoinProduit, ProjetBesoinService, ProjetTeamMember, ProjetDocument, ProjetAlerte } from './types';
import { ProjetClientOptionsDropdown } from './ProjetClientOptionsDropdown';
import { ArrowLeft, Edit3, MoreVertical, Calendar, MapPin, User, CheckCircle2, Clock, AlertCircle, AlertTriangle, Package, Wrench, Wallet, Users, FileText, ExternalLink, TrendingUp, Activity, Info, Plus } from 'lucide-react';
import { cn, safeFormatDate, safeFormatDateTime } from '../../lib/utils';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useModules } from '../../contexts/ModuleContext';

interface ProjetClientDetailsProps {
  projet: ProjetClient;
  onBack: () => void;
  onEdit: (projet: ProjetClient) => void;
  onDuplicate: (projet: ProjetClient) => void;
  onHold: (projet: ProjetClient) => void;
  onClose: (projet: ProjetClient) => void;
  onCancel: (projet: ProjetClient) => void;
  onHistory: (projet: ProjetClient) => void;
  onArchive: (projet: ProjetClient) => void;
}

export function ProjetClientDetails({ 
  projet, 
  onBack, 
  onEdit, 
  onDuplicate, 
  onHold, 
  onClose, 
  onCancel, 
  onHistory, 
  onArchive 
}: ProjetClientDetailsProps) {
  const { isModuleEnabled } = useModules();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  
  // Header animation values
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);
  const headerTitleY = useTransform(scrollY, [0, 100], [20, 0]);
  const mainTitleOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  // Data for the donut chart
  const progressData = [
    { name: 'Terminé', value: (projet.jalons?.filter(j => j.status === 'Terminé') || []).length, color: '#10b981' },
    { name: 'En cours', value: (projet.jalons?.filter(j => j.status === 'En cours') || []).length || 1, color: '#3b82f6' },
    { name: 'À faire', value: (projet.jalons?.filter(j => j.status === 'À faire') || []).length, color: '#94a3b8' },
    { name: 'Bloqué', value: (projet.jalons?.filter(j => j.status === 'Bloqué') || []).length, color: '#ef4444' },
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Terminé': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/10';
      case 'En retard': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800/10';
      case 'En cours': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/10';
      case 'En attente': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/10';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <motion.div style={{ opacity: headerOpacity, y: headerTitleY }} className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{projet.reference}</span>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] lg:max-w-md">{projet.name}</h1>
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(projet)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" /> Modifier
          </button>
          <ProjetClientOptionsDropdown 
            projet={projet}
            onDuplicate={onDuplicate}
            onHold={onHold}
            onClose={onClose}
            onCancel={onCancel}
            onHistory={onHistory}
            onArchive={onArchive}
          />
        </div>
      </div>

      {/* Main Scroll Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 space-y-8 pb-24"
      >
        {/* Identité Section */}
        <section className="relative">
          <motion.div style={{ opacity: mainTitleOpacity }}>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-bold rounded uppercase tracking-wider border border-indigo-200 dark:border-indigo-800/30">
                    {projet.reference}
                  </span>
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", getStatusBadgeColor(projet.status))}>
                    {projet.status}
                  </span>
                  {projet.priority === 'Critique' && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold rounded uppercase tracking-wider border border-red-200 dark:border-red-800/30 animate-pulse">
                      Critique
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{projet.name}</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-3xl">{projet.description}</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Client</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{projet.clientName}</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Site</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 opacity-50" /> {projet.siteName}</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Responsable</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5"><User className="w-3.5 h-3.5 opacity-50" /> {projet.responsibleName}</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Début</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 opacity-50" /> {safeFormatDate(projet.startDate)}</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Échéance</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 opacity-50" /> {safeFormatDate(projet.deadline)}</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Priorité</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{projet.priority}</p>
              </div>
              <Activity className={cn("w-5 h-5", projet.priority === 'Haute' ? 'text-amber-500' : 'text-slate-300')} />
            </div>
          </div>
        </section>

        {/* Dashboard Avancement */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-10">
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 w-full text-left lg:text-center">Pilotage d'avancement</h3>
            <div className="relative w-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">{projet.progress || 0}%</span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Global</span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {progressData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">{d.name} ({d.value || 0})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Tâches et Jalons</span>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{(projet.jalons?.filter(j => j.status === 'Terminé') || []).length} / {(projet.jalons || []).length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Jalons validés avec succès</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Temps restant</span>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">25 Jours</p>
                <p className={cn("text-xs mt-1", projet.status === 'En retard' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400')}>Échéance le {safeFormatDate(projet.deadline)}</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Budget Consommé</span>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{(projet.budget?.consumed || 0).toLocaleString()} €</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sur un total prévu de {(projet.budget?.planned || 0).toLocaleString()} €</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Matériel Réservé</span>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">92%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">42/48 unités réservées à ce jour</p>
              </div>
            </div>
          </div>
        </section>

        {/* Business Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Main sections) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Résumé du projet */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <Info className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Résumé du projet</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Objectif Client</label>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{projet.objectives}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Périmètre</label>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{projet.scope}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Contact Client</label>
                    <p className="text-sm text-slate-900 dark:text-white font-medium">{projet.contactClient}</p>
                    <p className="text-xs text-highlight font-medium">{projet.clientName}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Commentaires Importants</label>
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">"Besoin d'un accès nocturne pour les essais de nuit à partir de la semaine 25."</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Planning et Jalons */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Planning et Jalons</h3>
              </div>

              <div className="space-y-4 overflow-hidden relative">
                <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                {projet.jalons?.map((jalon, idx) => (
                  <div key={jalon.id} className="relative pl-12 group">
                    <div className={cn(
                      "absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-4 border-white dark:border-slate-950 z-10 transition-colors",
                      jalon.status === 'Terminé' ? 'bg-emerald-500' : 
                      jalon.status === 'En cours' ? 'bg-blue-500' :
                      jalon.status === 'Bloqué' ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'
                    )}></div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{jalon.label}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {safeFormatDate(jalon.date)}</span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5"><User className="w-3 h-3" /> {jalon.responsible}</span>
                        </div>
                      </div>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0", 
                        jalon.status === 'Terminé' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        jalon.status === 'En cours' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        jalon.status === 'Bloqué' ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100'
                      )}>
                        {jalon.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Besoins en produits */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Besoins en produits</h3>
                </div>
                <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-1.5">
                  Gérer les besoins <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-4 py-2">Produit</th>
                      <th className="px-4 py-2 text-center">Qté. Dem.</th>
                      <th className="px-4 py-2 text-center">Réservée</th>
                      <th className="px-4 py-2 text-center">Sortie</th>
                      <th className="px-4 py-2">Disponibilité</th>
                      <th className="px-4 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projet.produits?.map(p => (
                      <tr key={p.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white rounded-l-xl border-y border-l border-transparent transition-colors">{p.name}</td>
                        <td className="px-4 py-3 text-center border-y border-transparent">{p.requested}</td>
                        <td className="px-4 py-3 text-center border-y border-transparent font-bold text-blue-600 dark:text-blue-400">{p.reserved}</td>
                        <td className="px-4 py-3 text-center border-y border-transparent font-bold text-emerald-600 dark:text-emerald-400">{p.shipped}</td>
                        <td className="px-4 py-3 border-y border-transparent">
                          <span className={cn("inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider", p.available ? 'text-emerald-500' : 'text-red-500')}>
                            {p.available ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {p.available ? 'Dispo' : 'Rupture'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 rounded-r-xl border-y border-r border-transparent">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            {/* Besoins en produits (always shown if tab is not hidden, assuming overview is fine) */}
            {/* The products table logic continues here unchanged ... */}
            </div>

            {/* Besoins en services */}
            {isModuleEnabled('services') && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Besoins en services</h3>
                </div>
                <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-1.5">
                  Planifier ressources <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3">
                {projet.services?.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 group hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{s.label}</h4>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">{s.skill} • {s.duration}</p>
                    </div>
                    <div className="flex items-center gap-8">
                       <div className="text-right">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{s.assignedTo}</p>
                          <p className="text-[10px] text-slate-400 uppercase">Assigné à</p>
                       </div>
                       <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border h-fit", 
                         s.status === 'Terminé' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                       )}>
                         {s.status}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

          </div>

          {/* Right Column (Sidebar sections) */}
          <div className="space-y-8">
            
            {/* Alertes Section */}
            {projet.alertes && projet.alertes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Alertes Pilotage</h3>
                <div className="space-y-2">
                  {projet.alertes.map(alert => (
                    <div key={alert.id} className={cn(
                      "p-4 rounded-xl border flex gap-3 animate-in slide-in-from-right-4 duration-300",
                      alert.type === 'danger' ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' : 
                      alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30' : 
                      'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/20'
                    )}>
                      {alert.type === 'danger' ? <AlertCircle className="w-5 h-5 text-red-500 shrink-0" /> : 
                       alert.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" /> : 
                       <Info className="w-5 h-5 text-indigo-500 shrink-0" />}
                      <p className={cn(
                        "text-xs font-medium",
                        alert.type === 'danger' ? 'text-red-900 dark:text-red-400' : 
                        alert.type === 'warning' ? 'text-amber-900 dark:text-amber-400' : 
                        'text-indigo-900 dark:text-indigo-400'
                      )}>{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budget Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <Wallet className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Budget & Coûts</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Prévu Total</span>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{(projet.budget?.planned || 0).toLocaleString()} €</p>
                   </div>
                   <div className="text-right space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Consommé</span>
                      <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{(projet.budget?.consumed || 0).toLocaleString()} €</p>
                   </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, ((projet.budget?.consumed || 0) / (projet.budget?.planned || 1)) * 100)}%` }}></div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Coût Matériel</span>
                    <span className="text-slate-900 dark:text-white font-bold">{(projet.budget?.materialCost || 0).toLocaleString()} €</span>
                  </div>
                  {isModuleEnabled('services') && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Coût Services</span>
                    <span className="text-slate-900 dark:text-white font-bold">{(projet.budget?.serviceCost || 0).toLocaleString()} €</span>
                  </div>
                  )}
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 font-bold">
                    <span className="text-slate-900 dark:text-white">Reliquat Budget</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{( (projet.budget?.planned || 0) - (projet.budget?.consumed || 0) ).toLocaleString()} €</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Équipe et responsabilités */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <Users className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Équipe Projet</h3>
              </div>
              
              <div className="space-y-4">
                {projet.team?.map(m => (
                  <div key={m.id} className="flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                         {(m.name || '').split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight">{m.name}</p>
                         <p className="text-[10px] text-slate-500 uppercase">{m.role}</p>
                      </div>
                    </div>
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", 
                      m.availability === 'Libre' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                      m.availability === 'Occupé' ? 'text-amber-600 bg-amber-50 border-amber-100' : 
                      'text-indigo-600 bg-indigo-50 border-indigo-100'
                    )}>{m.availability}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents Project */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Documents</h3>
              </div>
              
              <div className="space-y-3">
                {projet.documents?.map(doc => (
                  <div key={doc.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-2">
                       <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{doc.name}</p>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">v{doc.version}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                       <span className="text-[10px] font-bold text-indigo-500 uppercase">{doc.type}</span>
                       <span className="text-[10px] text-slate-400">{safeFormatDate(doc.date)}</span>
                    </div>
                  </div>
                ))}
                <button className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-500 hover:border-indigo-200 transition-all text-sm font-medium flex items-center justify-center gap-2">
                   <Plus className="w-4 h-4" /> Ajouter une pièce jointe
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
