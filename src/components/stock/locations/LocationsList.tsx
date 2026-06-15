import React, { useState, useMemo } from 'react';
import { StockLocation, LocationStatus } from './types';
import { Download, Plus, MapPin, Gauge, Box, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CustomSelect } from '../../ui/CustomSelect';
import { ModuleSearchFilters } from '../../ui/ModuleSearchFilters';

interface LocationsListProps {
  locations: StockLocation[];
  onSelectLocation: (location: StockLocation) => void;
  onAddClick: () => void;
}

export function LocationsList({ locations: allLocations, onSelectLocation, onAddClick }: LocationsListProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [depotFilter, setDepotFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');

  const activeFiltersCount = [typeFilter, statusFilter, depotFilter, capacityFilter].filter(Boolean).length;

  const filteredLocations = useMemo(() => {
    return allLocations.filter(loc => {
      const matchSearch = 
        loc.name.toLowerCase().includes(search.toLowerCase()) || 
        loc.reference.toLowerCase().includes(search.toLowerCase()) ||
        loc.manager.toLowerCase().includes(search.toLowerCase());
      
      const matchType = typeFilter ? loc.type === typeFilter : true;
      const matchStatus = statusFilter ? loc.status === statusFilter : true;
      const matchDepot = depotFilter ? (loc.parentLocation === depotFilter || loc.name === depotFilter) : true;
      
      let matchCapacity = true;
      if (capacityFilter) {
        const ratio = loc.usedCapacity / loc.maxCapacity;
        if (capacityFilter === 'full') matchCapacity = ratio >= 1;
        else if (capacityFilter === 'almost') matchCapacity = ratio >= 0.8 && ratio < 1;
        else if (capacityFilter === 'available') matchCapacity = ratio < 0.8;
      }

      return matchSearch && matchType && matchStatus && matchDepot && matchCapacity;
    });
  }, [search, typeFilter, statusFilter, depotFilter, capacityFilter]);

  const types = useMemo(() => Array.from(new Set(allLocations.map(l => l.type))), [allLocations]);
  const statuses = useMemo(() => Array.from(new Set(allLocations.map(l => l.status))), [allLocations]);
  const depots = useMemo(() => Array.from(new Set(allLocations.filter(l => l.type === 'Dépôt').map(l => l.name))), [allLocations]);

  const stats = useMemo(() => {
    const total = allLocations.length;
    const actifs = allLocations.filter(l => l.status === 'Actif').length;
    const pleins = allLocations.filter(l => l.usedCapacity >= l.maxCapacity).length;
    const produitsStockes = allLocations.reduce((acc, curr) => acc + curr.productsStoredCount, 0);
    return { total, actifs, pleins, produitsStockes };
  }, [allLocations]);

  const getStatusColor = (status: LocationStatus) => {
    switch (status) {
      case 'Actif': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Saturé': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Maintenance': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Inactif': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Emplacements</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez les dépôts, zones et positions physiques du stock.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors opacity-90 hover:opacity-100"
          >
            <Plus className="w-4 h-4" /> Nouvel emplacement
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 transition-colors">
            <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.total}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total emplacements</span>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.actifs}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Emplacements actifs</span>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-800/30 group-hover:bg-red-100 transition-colors">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.pleins}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Zones pleines</span>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800/30 group-hover:bg-slate-100 transition-colors">
            <Box className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.produitsStockes}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Produits stockés</span>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par référence, nom, responsable..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Type</label>
                <CustomSelect
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[{ value: '', label: 'Tous les types' }, ...types.map(t => ({ value: t, label: t }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Dépôt parent</label>
                <CustomSelect
                  value={depotFilter}
                  onChange={setDepotFilter}
                  options={[{ value: '', label: 'Tous les dépôts' }, ...depots.map(d => ({ value: d, label: d }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Statut</label>
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[{ value: '', label: 'Tous statuts' }, ...statuses.map(s => ({ value: s, label: s }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Capacité</label>
                <CustomSelect
                  value={capacityFilter}
                  onChange={setCapacityFilter}
                  options={[
                    { value: '', label: 'Toutes capacités' },
                    { value: 'available', label: 'Disponible' },
                    { value: 'almost', label: 'Presque plein' },
                    { value: 'full', label: 'Plein' }
                  ]}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredLocations.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => {
                   setTypeFilter('');
                   setDepotFilter('');
                   setStatusFilter('');
                   setCapacityFilter('');
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
          <table className="w-full min-w-[1000px] table-fixed divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Emplacement</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dépôt parent</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Capacité</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produits stockés</th>
                <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLocations.map((location) => {
                const capacityPercent = Math.min(100, (location.usedCapacity / location.maxCapacity) * 100);
                return (
                  <tr 
                    key={location.id} 
                    onClick={() => onSelectLocation(location)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm truncate" title={location.name}>
                      <div className="font-medium text-slate-900 dark:text-white truncate">{location.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{location.reference}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={location.type}>
                      {location.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={location.parentLocation || '-'}>
                      {location.parentLocation || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-left truncate">
                      <div className="flex flex-col gap-1.5 w-full max-w-[120px]">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span>{capacityPercent.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-500",
                              capacityPercent >= 100 ? "bg-red-500" : capacityPercent >= 80 ? "bg-amber-500" : "bg-indigo-500"
                            )}
                            style={{ width: `${capacityPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white text-left font-semibold truncate">
                      {location.productsStoredCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-left truncate">
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(location.status))}>
                        {location.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredLocations.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucun emplacement ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
