import React, { useState, useMemo } from 'react';
import { ProjetClient, ProjetClientStatus, ProjetClientPriority } from './types';
import { Search, Plus, Filter, Download, Briefcase, AlertCircle, Clock, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { cn, safeFormatDate } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';
import { ProjetClientOptionsDropdown } from './ProjetClientOptionsDropdown';

interface ProjetsClientsListProps {
  projets: ProjetClient[];
  onSelectProjet: (projet: ProjetClient) => void;
  onAddClick: () => void;
  onEdit: (projet: ProjetClient) => void;
  onDuplicate: (projet: ProjetClient) => void;
  onHold: (projet: ProjetClient) => void;
  onClose: (projet: ProjetClient) => void;
  onCancel: (projet: ProjetClient) => void;
  onHistory: (projet: ProjetClient) => void;
  onArchive: (projet: ProjetClient) => void;
}

export function ProjetsClientsList({ 
  projets: allProjets, 
  onSelectProjet, 
  onAddClick,
  onEdit,
  onDuplicate,
  onHold,
  onClose,
  onCancel,
  onHistory,
  onArchive
}: ProjetsClientsListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState(''); // Just a mock period filter
  const [progressStateFilter, setProgressStateFilter] = useState(''); 
  const [lateOnly, setLateOnly] = useState(false);

  const activeFiltersCount = [statusFilter, priorityFilter, clientFilter, responsibleFilter, periodFilter, progressStateFilter, lateOnly].filter(Boolean).length;

  const projets = useMemo(() => {
    return allProjets.filter(p => {
      const matchSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.reference.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName.toLowerCase().includes(search.toLowerCase()) ||
        p.responsibleName.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter ? p.status === statusFilter : true;
      const matchPriority = priorityFilter ? p.priority === priorityFilter : true;
      const matchClient = clientFilter ? p.clientName === clientFilter : true;
      const matchResponsible = responsibleFilter ? p.responsibleName === responsibleFilter : true;
      const matchLate = lateOnly ? p.status === 'En retard' : true;
      
      let matchProgress = true;
      if (progressStateFilter === 'non commencé') matchProgress = p.progress === 0;
      if (progressStateFilter === 'en cours') matchProgress = p.progress > 0 && p.progress < 100;
      if (progressStateFilter === 'terminé') matchProgress = p.progress === 100;

      return matchSearch && matchStatus && matchPriority && matchClient && matchResponsible && matchLate && matchProgress;
    });
  }, [search, statusFilter, priorityFilter, clientFilter, responsibleFilter, progressStateFilter, lateOnly, allProjets]);

  const clients = useMemo(() => Array.from(new Set(allProjets.map(p => p.clientName))), [allProjets]);
  const responsibles = useMemo(() => Array.from(new Set(allProjets.map(p => p.responsibleName))), [allProjets]);
  const statuses = useMemo(() => Array.from(new Set(allProjets.map(p => p.status))), [allProjets]);
  const priorities = useMemo(() => Array.from(new Set(allProjets.map(p => p.priority))), [allProjets]);

  const stats = useMemo(() => {
    const actifs = allProjets.filter(p => ['Planifié', 'En cours'].includes(p.status)).length;
    const enRetard = allProjets.filter(p => p.status === 'En retard').length;
    const aValider = allProjets.filter(p => p.status === 'En attente').length; // let's map 'A valider' to En attente
    const terminesCeMois = allProjets.filter(p => p.status === 'Terminé').length; // Mock
    return { actifs, enRetard, aValider, terminesCeMois };
  }, [allProjets]);

  const getStatusColor = (status: ProjetClientStatus) => {
    switch (status) {
      case 'Terminé': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/10';
      case 'En retard': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800/10';
      case 'En cours': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/10';
      case 'Planifié': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/10';
      case 'En attente': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/10';
      case 'Brouillon': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700/50';
      case 'Annulé': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700/50';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700/50';
    }
  };

  const getProgressColor = (progress: number, status: ProjetClientStatus) => {
    if (status === 'En retard') return 'bg-red-500';
    if (progress === 100) return 'bg-emerald-500';
    return 'bg-blue-500';
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Projets clients</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Planifiez et suivez les projets clients, leurs ressources, leurs coûts et leur avancement.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors opacity-90 hover:opacity-100"
          >
            <Plus className="w-4 h-4" /> Nouveau projet
          </button>
        </div>
      </div>

      {/* Stats Cards =================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projets actifs */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.actifs}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Projets actifs</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">En cours de réalisation</p>
          </div>
        </div>

        {/* En retard */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-red-200 dark:hover:border-red-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-800/30 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.enRetard}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">En retard</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Action requise</p>
          </div>
        </div>

        {/* À valider */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/30 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.aValider}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">À valider</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">En attente de retour</p>
          </div>
        </div>

        {/* Terminés ce mois */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.terminesCeMois}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Terminés ce mois</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Succès de l'équipe</p>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par référence, projet, client..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Statut</label>
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[{ value: '', label: 'Tous les statuts' }, ...statuses.map(s => ({ value: s, label: s }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">État d'avancement</label>
                <CustomSelect
                  value={progressStateFilter}
                  onChange={setProgressStateFilter}
                  options={[
                      { value: '', label: 'Tous les états' },
                      { value: 'non commencé', label: 'Non commencé (0%)' },
                      { value: 'en cours', label: 'En cours (1% - 99%)' },
                      { value: 'terminé', label: 'Terminé (100%)' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Client</label>
                <CustomSelect
                  value={clientFilter}
                  onChange={setClientFilter}
                  options={[{ value: '', label: 'Tous les clients' }, ...clients.map(c => ({ value: c, label: c }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Responsable</label>
                <CustomSelect
                  value={responsibleFilter}
                  onChange={setResponsibleFilter}
                  options={[{ value: '', label: 'Tous les responsables' }, ...responsibles.map(r => ({ value: r, label: r }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Période</label>
                <CustomSelect
                  value={periodFilter}
                  onChange={setPeriodFilter}
                  options={[
                      { value: '', label: 'Toutes les périodes' },
                      { value: 'ce_mois', label: 'Ce mois' },
                      { value: 'mois_prochain', label: 'Le mois prochain' },
                      { value: 'cette_annee', label: 'Cette année' }
                  ]}
                />
              </div>
              <div>
                 <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Priorité</label>
                 <CustomSelect
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                  options={[{ value: '', label: 'Toutes les priorités' }, ...priorities.map(p => ({ value: p, label: p }))]}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lateOnly}
                  onChange={(e) => setLateOnly(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:checked:bg-indigo-500 transition-colors"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Projets en retard uniquement</span>
              </label>
            </div>
            
            <div className="flex items-center justify-between pt-3">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {projets.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => {
                   setStatusFilter('');
                   setClientFilter('');
                   setResponsibleFilter('');
                   setPeriodFilter('');
                   setPriorityFilter('');
                   setProgressStateFilter('');
                   setLateOnly(false);
                 }}
                 className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
               >
                 Réinitialiser les filtres
               </button>
            </div>
          </div>
        }
      />

      {/* Table */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Référence</th>
                <th scope="col" className="w-[28%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projet</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Responsable</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Échéance</th>
                <th scope="col" className="w-[13%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avancement</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
                <th scope="col" className="w-[5%] px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {projets.map((projet) => (
                <tr 
                  key={projet.id} 
                  onClick={() => onSelectProjet(projet)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white truncate" title={projet.reference}>
                    {projet.reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={projet.name}>
                    <div className="font-medium text-slate-900 dark:text-white truncate">{projet.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{projet.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white truncate" title={projet.clientName}>
                    {projet.clientName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={projet.responsibleName}>
                    {projet.responsibleName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate">
                    {safeFormatDate(projet.deadline)}
                  </td>
                  <td className="px-6 py-4 text-left">
                     <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                           <div className={cn("h-full rounded-full transition-all duration-500", getProgressColor(projet.progress || 0, projet.status))} style={{ width: `${projet.progress || 0}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{projet.progress || 0}%</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(projet.status))}>
                      {projet.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div onClick={(e) => e.stopPropagation()}>
                      <ProjetClientOptionsDropdown 
                        projet={projet}
                        onDuplicate={onDuplicate}
                        onHold={onHold}
                        onClose={onClose}
                        onCancel={onCancel}
                        onHistory={onHistory}
                        onArchive={onArchive}
                        showLabel={false}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {projets.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucun projet ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
