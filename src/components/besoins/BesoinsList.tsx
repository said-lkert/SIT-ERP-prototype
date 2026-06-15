import React, { useState, useMemo } from 'react';
import { Besoin, BesoinType, BesoinStatus, Priority } from './types';
import { 
  Search, Plus, Download, Filter, 
  Package, Wrench, AlertCircle, 
  CheckCircle2, Clock, Ban, Construction, 
  User, Briefcase, Calendar, Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';
import { BesoinsKPIs } from './BesoinsKPIs';
import { useModules } from '../../contexts/ModuleContext';
import { safeFormatDate } from '../../lib/utils';

interface BesoinsListProps {
  allBesoins: Besoin[];
  onSelectBesoin: (besoin: Besoin) => void;
  onAddClick: () => void;
}

export function BesoinsList({ allBesoins, onSelectBesoin, onAddClick }: BesoinsListProps) {
  const { isModuleEnabled } = useModules();
  const [currentView, setCurrentView] = useState<'Tous' | 'Produits' | 'Services'>('Tous');
  const [search, setSearch] = useState('');
  
  // Filters
  const [projectIdFilter, setProjectIdFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');
  const [hasBlockersOnly, setHasBlockersOnly] = useState(false);

  const activeFiltersCount = [projectIdFilter, priorityFilter, statusFilter, responsibleFilter, hasBlockersOnly].filter(Boolean).length;

  const filteredBesoins = useMemo(() => {
    return allBesoins.filter(b => {
      const hasProducts = b.products.length > 0;
      const hasServices = b.services.length > 0;
      
      // View type filter
      if (currentView === 'Produits' && !hasProducts) return false;
      if (currentView === 'Services' && !hasServices) return false;

      const mainLabel = hasProducts ? b.products[0].label : (hasServices ? b.services[0].label : '');

      const matchSearch = 
        b.reference.toLowerCase().includes(search.toLowerCase()) ||
        b.projectName.toLowerCase().includes(search.toLowerCase()) ||
        b.clientName.toLowerCase().includes(search.toLowerCase()) ||
        b.responsible.toLowerCase().includes(search.toLowerCase()) ||
        mainLabel.toLowerCase().includes(search.toLowerCase());

      const matchProject = projectIdFilter ? b.projectId === projectIdFilter : true;
      const matchPriority = priorityFilter ? b.priority === priorityFilter : true;
      const matchStatus = statusFilter ? b.status === statusFilter : true;
      const matchResponsible = responsibleFilter ? b.responsible === responsibleFilter : true;
      const matchBlockers = hasBlockersOnly ? b.status === 'Bloqué' : true;

      // if services disabled, don't show needs that are ONLY services
      if (!isModuleEnabled('services') && !hasProducts && hasServices) return false;

      return matchSearch && matchProject && matchPriority && matchStatus && matchResponsible && matchBlockers;
    });
  }, [allBesoins, currentView, search, projectIdFilter, priorityFilter, statusFilter, responsibleFilter, hasBlockersOnly, isModuleEnabled]);

  const projects = useMemo(() => Array.from(new Set(allBesoins.map(b => ({ id: b.projectId, name: b.projectName })))), [allBesoins]);
  const priorities = ['Basse', 'Moyenne', 'Haute', 'Critique'];
  const statuses: BesoinStatus[] = ['Brouillon', 'À valider', 'Validé', 'Partiellement couvert', 'Couvert', 'Bloqué', 'Consommé', 'Annulé'];
  const responsibles = useMemo(() => Array.from(new Set(allBesoins.map(b => b.responsible))), [allBesoins]);

  const getStatusStyle = (status: BesoinStatus) => {
    switch (status) {
      case 'Couvert':
      case 'Consommé':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Partiellement couvert':
      case 'Validé':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'À valider':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Bloqué':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Annulé':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getTypeIcon = (type: BesoinType) => {
    return type === 'Produit' ? <Package className="w-3 h-3" /> : <Wrench className="w-3 h-3" />;
  };

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 pt-4 md:px-6 md:pt-6 lg:px-8 lg:pt-8 shrink-0 relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Besoins produits{isModuleEnabled('services') ? ' & services' : ''}</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Centralisez les ressources matérielles{isModuleEnabled('services') ? ' et les prestations' : ''} nécessaires à la réalisation des projets clients.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 transition-colors">
            <Download className="w-4 h-4 text-slate-400" /> Export
          </button>
          <button 
            onClick={onAddClick}
            className="flex-2 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Nouveau besoin
          </button>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 shrink-0">
        <BesoinsKPIs besoins={allBesoins} />
      </div>

      {/* Segmented Control & Search/Filters */}
      <div className="px-4 md:px-6 lg:px-8 space-y-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-fit shadow-inner">
            {(isModuleEnabled('services') ? ['Tous', 'Produits', 'Services'] : ['Tous', 'Produits']).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view as any)}
                className={cn(
                  "px-6 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200",
                  currentView === view 
                    ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-white shadow-sm ring-1 ring-black/5" 
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        <ModuleSearchFilters
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Besoin, référence, projet, client, responsable..."
          activeFiltersCount={activeFiltersCount}
          advancedFilters={
            <div className="w-full space-y-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Projet</label>
                  <CustomSelect
                    value={projectIdFilter}
                    onChange={setProjectIdFilter}
                    options={[{ value: '', label: 'Tous les projets' }, ...projects.map(p => ({ value: p.id, label: p.name }))]}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Priorité</label>
                  <CustomSelect
                    value={priorityFilter}
                    onChange={setPriorityFilter}
                    options={[{ value: '', label: 'Toutes priorités' }, ...priorities.map(p => ({ value: p, label: p }))]}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Statut</label>
                  <CustomSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[{ value: '', label: 'Tous les statuts' }, ...statuses.map(s => ({ value: s, label: s }))]}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Responsable</label>
                  <CustomSelect
                    value={responsibleFilter}
                    onChange={setResponsibleFilter}
                    options={[{ value: '', label: 'Tous les responsables' }, ...responsibles.map(r => ({ value: r, label: r }))]}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={hasBlockersOnly}
                    onChange={(e) => setHasBlockersOnly(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 transition-colors"
                  />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Éléments bloquants uniquement</span>
                </label>
                <div className="flex-1" />
                <button 
                  onClick={() => {
                    setProjectIdFilter('');
                    setPriorityFilter('');
                    setStatusFilter('');
                    setResponsibleFilter('');
                    setHasBlockersOnly(false);
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline transition-all"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          }
        />
      </div>

      {/* Table Section */}
      <div className="flex-1 px-4 md:px-6 lg:px-8 pb-4 min-h-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
          <div className="overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            <table className="w-full min-w-[1000px] table-fixed divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="w-[12%] px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Référence</th>
                  <th scope="col" className="w-[18%] px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Projet / Client</th>
                  <th scope="col" className="w-[8%] px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Type</th>
                  <th scope="col" className="w-[20%] px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Besoin</th>
                  <th scope="col" className="w-[12%] px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Qté / Durée</th>
                  <th scope="col" className="w-[12%] px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Couverture</th>
                  <th scope="col" className="w-[10%] px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Échéance</th>
                  <th scope="col" className="w-[10%] px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBesoins.map((besoin) => {
                  const hasProducts = besoin.products.length > 0;
                  const hasServices = besoin.services.length > 0;
                  const typeLabel = hasProducts && hasServices ? 'Mixte' : (hasProducts ? 'Produit' : 'Service');
                  const mainLabel = hasProducts ? besoin.products[0].label : (hasServices ? besoin.services[0].label : 'Besoin vide');
                  const subLabel = hasProducts ? besoin.products[0].reference : (hasServices ? (besoin.services[0].assignedResource || 'Non affecté') : '');
                  const qtyLabel = hasProducts ? besoin.products[0].requestedQty : (hasServices ? besoin.services[0].plannedDuration : 0);
                  const unitLabel = hasProducts ? (besoin.products[0].requestedQty > 1 ? 'Unités' : 'Unité') : (hasServices ? besoin.services[0].unit : '');
                  const missingQty = hasProducts ? besoin.products[0].missingQty : 0;

                  return (
                    <tr 
                      key={besoin.id}
                      onClick={() => onSelectBesoin(besoin)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-all duration-200 group border-l-2 border-l-transparent hover:border-l-indigo-500"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {besoin.reference}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Resp: {besoin.responsible}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate" title={besoin.projectName}>{besoin.projectName}</span>
                          <div className="flex items-center gap-1.5 mt-0.5 min-w-0 text-slate-500">
                            <User className="w-3 h-3 shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-tight truncate" title={besoin.clientName}>{besoin.clientName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors",
                            (hasProducts && hasServices) ? "bg-amber-50 text-amber-700 border-amber-100" :
                            hasProducts 
                              ? "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800" 
                              : "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                          )}>
                            {hasProducts ? <Package className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                            {typeLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate" title={mainLabel}>{mainLabel}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {hasProducts && !hasServices && besoin.products.length > 1 && (
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight italic">+{besoin.products.length - 1} articles</span>
                            )}
                            {hasServices && !hasProducts && besoin.services.length > 1 && (
                               <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight italic">+{besoin.services.length - 1} services</span>
                            )}
                             {hasProducts && hasServices && (
                               <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight italic">{besoin.products.length} prod. & {besoin.services.length} serv.</span>
                             )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                            {qtyLabel} 
                            <span className="ml-1 text-[10px] font-bold text-slate-400 uppercase">{unitLabel}</span>
                          </span>
                          {missingQty > 0 && (
                            <span className="text-[10px] text-red-500 dark:text-red-400 font-black tracking-tight">-{missingQty} manquants</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-slate-400 tabular-nums uppercase">{besoin.totalCoverageRate}% couvert</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner flex relative">
                            <div 
                              className={cn(
                                "h-full transition-all duration-1000 ease-out",
                                besoin.totalCoverageRate >= 100 ? "bg-emerald-500" :
                                besoin.totalCoverageRate > 50 ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" :
                                besoin.totalCoverageRate > 0 ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
                              )}
                              style={{ width: `${besoin.totalCoverageRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <Calendar className={cn("w-3.5 h-3.5", besoin.isUrgent ? "text-red-500" : "text-slate-400")} />
                          <span className={cn(
                            "text-xs font-bold tabular-nums tracking-tight",
                            besoin.isUrgent ? "text-red-600 dark:text-red-400 font-black" : "text-slate-600 dark:text-slate-300"
                          )}>
                            {safeFormatDate(besoin.plannedDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                          getStatusStyle(besoin.status)
                        )}>
                          {besoin.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredBesoins.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Aucun besoin ne correspond à votre recherche.</p>
                <button 
                  onClick={() => {
                    setSearch('');
                    setProjectIdFilter('');
                    setPriorityFilter('');
                    setStatusFilter('');
                    setCurrentView('Tous');
                  }}
                  className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest hover:underline"
                >
                  Effacer tout
                </button>
              </div>
            )}
          </div>
          
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0 uppercase tracking-widest">
            <div>{filteredBesoins.length} besoins affichés</div>
            <div className="flex items-center gap-4 italic font-medium tracking-tight normal-case text-xs">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Couvert</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> En cours</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Bloqué</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
