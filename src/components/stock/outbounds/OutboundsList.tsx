import React, { useState, useMemo } from 'react';
import { StockOutbound, OutboundStatus } from './types';
import { Download, Plus, Search, Filter, Calendar, Building2, Package, LogOut, ChevronRight, Hash, Users, PenTool, CheckCircle2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CustomSelect } from '../../ui/CustomSelect';
import { ModuleSearchFilters } from '../../ui/ModuleSearchFilters';

interface OutboundsListProps {
  outbounds: StockOutbound[];
  onSelectOutbound: (outbound: StockOutbound) => void;
  onNewOutbound: () => void;
}

export function OutboundsList({ outbounds: allOutbounds, onSelectOutbound, onNewOutbound }: OutboundsListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [destinationTypeFilter, setDestinationTypeFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  const activeFiltersCount = [statusFilter, destinationTypeFilter, periodFilter, warehouseFilter].filter(Boolean).length;

  const filteredOutbounds = useMemo(() => {
    return allOutbounds.filter(out => {
      const matchSearch = 
        out.reference.toLowerCase().includes(search.toLowerCase()) || 
        out.destinationName.toLowerCase().includes(search.toLowerCase()) ||
        out.responsible.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter ? out.status === statusFilter : true;
      const matchDestType = destinationTypeFilter ? out.destinationType === destinationTypeFilter : true;
      const matchWarehouse = warehouseFilter ? out.warehouseId === warehouseFilter : true;
      
      let matchPeriod = true;
      if (periodFilter) {
        if (periodFilter === 'today') matchPeriod = out.date.includes('2026-06-03');
        else if (periodFilter === 'week') matchPeriod = out.date.includes('2026-06');
        else if (periodFilter === 'month') matchPeriod = out.date.includes('2026-06');
      }

      return matchSearch && matchStatus && matchDestType && matchWarehouse && matchPeriod;
    });
  }, [search, statusFilter, destinationTypeFilter, periodFilter, warehouseFilter, allOutbounds]);

  const stats = useMemo(() => {
    const month = allOutbounds.filter(r => r.date.includes('2026-06')).length;
    const drafts = allOutbounds.filter(r => r.status === 'Brouillon').length;
    const projectOutbounds = allOutbounds.filter(r => r.destinationType === 'Projet').length;
    const totalQty = allOutbounds.reduce((acc, curr) => acc + curr.totalQty, 0);
    return { month, drafts, projectOutbounds, totalQty };
  }, [allOutbounds]);

  const warehouses = useMemo(() => {
    const unique = new Map();
    allOutbounds.forEach(r => unique.set(r.warehouseId, r.warehouseName));
    return Array.from(unique.entries()).map(([id, name]) => ({ value: id, label: name }));
  }, [allOutbounds]);

  const getStatusBadgeColor = (status: OutboundStatus) => {
    switch (status) {
      case 'Validée': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Écart détecté': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Annulée': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Brouillon': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sorties stock</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gérez les sorties de produits vers projets, clients, techniciens ou SAV.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-all">
            <Download className="w-4 h-4" /> Exporter
          </button>
          <button 
            onClick={onNewOutbound}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Nouvelle sortie
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-all hover:border-indigo-200">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{stats.month}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Sorties du mois</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-all hover:border-slate-300">
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{stats.drafts}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Sorties en brouillon</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-all hover:border-purple-200">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{stats.projectOutbounds}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Sorties projet</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-all hover:border-emerald-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{stats.totalQty}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Quantité sortie</div>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Référence, destination, responsable..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">Type Destination</label>
                <CustomSelect
                  value={destinationTypeFilter}
                  onChange={setDestinationTypeFilter}
                  options={[
                    { value: '', label: 'Toutes les destinations' },
                    { value: 'Projet', label: 'Projet' },
                    { value: 'Client', label: 'Client' },
                    { value: 'Technicien', label: 'Technicien' },
                    { value: 'SAV', label: 'SAV' },
                    { value: 'Perte/Casse', label: 'Perte/Casse' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">Statut</label>
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: '', label: 'Tous les statuts' },
                    { value: 'Brouillon', label: 'Brouillon' },
                    { value: 'Validée', label: 'Validée' },
                    { value: 'Écart détecté', label: 'Écart détecté' },
                    { value: 'Annulée', label: 'Annulée' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">Période</label>
                <CustomSelect
                  value={periodFilter}
                  onChange={setPeriodFilter}
                  options={[
                    { value: '', label: 'Toutes périodes' },
                    { value: 'today', label: 'Aujourd\'hui' },
                    { value: 'week', label: 'Cette semaine' },
                    { value: 'month', label: 'Ce mois' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">Source (Dépôt)</label>
                <CustomSelect
                  value={warehouseFilter}
                  onChange={setWarehouseFilter}
                  options={[{ value: '', label: 'Tous les dépôts' }, ...warehouses]}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {filteredOutbounds.length} sortie(s) trouvée(s)
               </div>
               <button 
                 onClick={() => {
                   setStatusFilter('');
                   setDestinationTypeFilter('');
                   setPeriodFilter('');
                   setWarehouseFilter('');
                 }}
                 className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 uppercase tracking-widest transition-colors"
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
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Référence sortie</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Destination</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date sortie</th>
                <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produits</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quantité totale</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Responsable</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {filteredOutbounds.map((out) => (
                <tr 
                  key={out.id} 
                  onClick={() => onSelectOutbound(out)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white truncate" title={out.reference}>
                    {out.reference}
                  </td>
                  <td className="px-6 py-4 text-sm truncate" title={out.destinationName}>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-0.5">{out.destinationType}</div>
                    <div className="font-medium text-slate-900 dark:text-white truncate">{out.destinationName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate">
                    {out.date?.split(' ')[0] || ''}
                    <span className="text-xs opacity-70 ml-1 block">{out.date?.split(' ')[1] || ''}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={out.products.map(p => p.name).join(', ')}>
                    {out.products.map(p => p.name).join(', ')}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white text-right truncate">
                    {out.totalQty}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={out.sourceWarehouse}>
                    {out.sourceWarehouse}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={out.responsible}>
                    {out.responsible}
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border max-w-full truncate", getStatusBadgeColor(out.status))}>
                      {out.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOutbounds.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucune sortie ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
