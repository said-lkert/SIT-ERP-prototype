import React, { useState, useMemo } from 'react';
import { StockMovement, MovementType, MovementStatus } from './types';
import { Download, ArrowLeftRight, TrendingUp, TrendingDown, RefreshCcw, Search, Filter, Calendar } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CustomSelect } from '../../ui/CustomSelect';
import { ModuleSearchFilters } from '../../ui/ModuleSearchFilters';

interface MovementsListProps {
  movements: StockMovement[];
  onSelectMovement: (movement: StockMovement) => void;
}

export function MovementsList({ movements: allMovements, onSelectMovement }: MovementsListProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');

  const activeFiltersCount = [typeFilter, statusFilter, periodFilter, responsibleFilter].filter(Boolean).length;

  const filteredMovements = useMemo(() => {
    return allMovements.filter(mov => {
      const matchSearch = 
        mov.reference.toLowerCase().includes(search.toLowerCase()) || 
        mov.product.name.toLowerCase().includes(search.toLowerCase()) ||
        mov.product.reference.toLowerCase().includes(search.toLowerCase()) ||
        mov.responsible.toLowerCase().includes(search.toLowerCase());
      
      const matchType = typeFilter ? mov.type === typeFilter : true;
      const matchStatus = statusFilter ? mov.status === statusFilter : true;
      const matchResponsible = responsibleFilter ? mov.responsible === responsibleFilter : true;
      
      let matchPeriod = true;
      if (periodFilter) {
        // Simple period logic for mock data
        if (periodFilter === 'today') matchPeriod = mov.date.includes('2026-06-03');
        else if (periodFilter === 'week') matchPeriod = mov.date.includes('2026-06');
        else if (periodFilter === 'month') matchPeriod = mov.date.includes('2026-06');
      }

      return matchSearch && matchType && matchStatus && matchResponsible && matchPeriod;
    });
  }, [search, typeFilter, statusFilter, periodFilter, responsibleFilter, allMovements]);

  const types = useMemo(() => Array.from(new Set(allMovements.map(m => m.type))), [allMovements]);
  const statuses = useMemo(() => Array.from(new Set(allMovements.map(m => m.status))), [allMovements]);
  const responsibles = useMemo(() => Array.from(new Set(allMovements.map(m => m.responsible))), [allMovements]);

  const stats = useMemo(() => {
    const total = allMovements.length;
    const entrees = allMovements.filter(m => m.type === 'Entrée').length;
    const sorties = allMovements.filter(m => m.type === 'Sortie').length;
    const corrections = allMovements.filter(m => m.type === 'Correction' || m.status === 'Écart détecté').length;
    return { total, entrees, sorties, corrections };
  }, [allMovements]);

  const getTypeBadgeColor = (type: MovementType) => {
    switch (type) {
      case 'Entrée': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Sortie': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Transfert': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Correction': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Réservation': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Retour fournisseur': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusBadgeColor = (status: MovementStatus) => {
    switch (status) {
      case 'Validé': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Écart détecté': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Annulé': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      case 'Brouillon': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Mouvements de stock</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Consultez l’historique des entrées, sorties, transferts et corrections du stock.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 transition-colors">
            <ArrowLeftRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.total}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total mouvements</span>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 transition-colors">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.entrees}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Entrées stock</span>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-800/30 group-hover:bg-orange-100 transition-colors">
            <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.sorties}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Sorties stock</span>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/30 group-hover:bg-amber-100 transition-colors">
            <RefreshCcw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.corrections}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Écarts / Corrections</span>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par référence, produit, responsable..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Type de mouvement</label>
                <CustomSelect
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[{ value: '', label: 'Tous les types' }, ...types.map(t => ({ value: t, label: t }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Statut</label>
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[{ value: '', label: 'Tous statuts' }, ...statuses.map(s => ({ value: s, label: s }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Période</label>
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
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Responsable</label>
                <CustomSelect
                  value={responsibleFilter}
                  onChange={setResponsibleFilter}
                  options={[{ value: '', label: 'Tous responsables' }, ...responsibles.map(r => ({ value: r, label: r }))]}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredMovements.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => {
                   setTypeFilter('');
                   setStatusFilter('');
                   setPeriodFilter('');
                   setResponsibleFilter('');
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
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produit</th>
                <th scope="col" className="w-[8%] px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quantité</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Destination</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Document</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Responsable</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {filteredMovements.map((movement) => (
                <tr 
                  key={movement.id} 
                  onClick={() => onSelectMovement(movement)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate">
                    {movement.date?.split(' ')[0] || ''}
                    <span className="text-xs opacity-70 ml-1 block">{movement.date?.split(' ')[1] || ''}</span>
                  </td>
                  <td className="px-6 py-4 text-sm truncate">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider", getTypeBadgeColor(movement.type))}>
                      {movement.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm truncate" title={movement.product.name}>
                    <div className="font-medium text-slate-900 dark:text-white truncate">{movement.product.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{movement.product.reference}</div>
                  </td>
                  <td className={cn("px-6 py-4 text-sm font-semibold text-right truncate", movement.quantity > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400")}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={movement.source.name}>
                    {movement.source.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={movement.destination.name}>
                    {movement.destination.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={movement.linkedDocument.reference}>
                    {movement.linkedDocument.reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={movement.responsible}>
                    {movement.responsible}
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border max-w-full truncate", getStatusBadgeColor(movement.status))}>
                      {movement.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMovements.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm italic">Aucun mouvement ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
