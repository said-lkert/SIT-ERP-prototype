import React, { useState, useMemo } from 'react';
import { SupplierReceipt, ReceiptStatus } from './types';
import { Download, Plus, Search, Filter, Calendar, Building2, Package, AlertTriangle, BadgePercent, ChevronRight, Share2, Printer } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CustomSelect } from '../../ui/CustomSelect';
import { ModuleSearchFilters } from '../../ui/ModuleSearchFilters';

interface ReceiptsListProps {
  receipts: SupplierReceipt[];
  onSelectReceipt: (receipt: SupplierReceipt) => void;
  onNewReceipt: () => void;
}

export function ReceiptsList({ receipts: allReceipts, onSelectReceipt, onNewReceipt }: ReceiptsListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  const activeFiltersCount = [statusFilter, supplierFilter, periodFilter, warehouseFilter].filter(Boolean).length;

  const filteredReceipts = useMemo(() => {
    return allReceipts.filter(rc => {
      const matchSearch = 
        rc.reference.toLowerCase().includes(search.toLowerCase()) || 
        rc.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        rc.deliveryNoteRef.toLowerCase().includes(search.toLowerCase()) ||
        rc.responsible.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter ? rc.status === statusFilter : true;
      const matchSupplier = supplierFilter ? rc.supplierId === supplierFilter : true;
      const matchWarehouse = warehouseFilter ? rc.warehouseId === warehouseFilter : true;
      
      let matchPeriod = true;
      if (periodFilter) {
        if (periodFilter === 'today') matchPeriod = rc.date.includes('2026-06-03');
        else if (periodFilter === 'week') matchPeriod = rc.date.includes('2026-06');
        else if (periodFilter === 'month') matchPeriod = rc.date.includes('2026-06');
      }

      return matchSearch && matchStatus && matchSupplier && matchWarehouse && matchPeriod;
    });
  }, [search, statusFilter, supplierFilter, periodFilter, warehouseFilter, allReceipts]);

  const stats = useMemo(() => {
    const month = allReceipts.filter(r => r.date.includes('2026-06')).length;
    const drafts = allReceipts.filter(r => r.status === 'Brouillon').length;
    const gaps = allReceipts.filter(r => r.status === 'Écart détecté').length;
    const totalValue = allReceipts.reduce((acc, curr) => acc + curr.totalValue, 0);
    return { month, drafts, gaps, totalValue };
  }, [allReceipts]);

  const suppliers = useMemo(() => {
    const unique = new Map();
    allReceipts.forEach(r => unique.set(r.supplierId, r.supplierName));
    return Array.from(unique.entries()).map(([id, name]) => ({ value: id, label: name }));
  }, [allReceipts]);

  const warehouses = useMemo(() => {
    const unique = new Map();
    allReceipts.forEach(r => unique.set(r.warehouseId, r.warehouseName));
    return Array.from(unique.entries()).map(([id, name]) => ({ value: id, label: name }));
  }, [allReceipts]);

  const getStatusBadgeColor = (status: ReceiptStatus) => {
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Réceptions fournisseur</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gérez les livraisons reçues, les écarts et les entrées en stock.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={onNewReceipt}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Nouvelle réception
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
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Réceptions du mois</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-all hover:border-slate-300">
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <BadgePercent className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{stats.drafts}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">En brouillon</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-all hover:border-orange-200">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{stats.gaps}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Écarts détectés</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-all hover:border-emerald-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">
              {((stats.totalValue || 0) / 1000).toFixed(0)} <span className="text-sm font-medium">k DA</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Valeur réceptionnée</div>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Référence, fournisseur, BL, responsable..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">Fournisseur</label>
                <CustomSelect
                  value={supplierFilter}
                  onChange={setSupplierFilter}
                  options={[{ value: '', label: 'Tous les fournisseurs' }, ...suppliers]}
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
                <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">Dépôt</label>
                <CustomSelect
                  value={warehouseFilter}
                  onChange={setWarehouseFilter}
                  options={[{ value: '', label: 'Tous les dépôts' }, ...warehouses]}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {filteredReceipts.length} réception(s) trouvée(s)
               </div>
               <button 
                 onClick={() => {
                   setStatusFilter('');
                   setSupplierFilter('');
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
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Référence</th>
                <th scope="col" className="w-[18%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fournisseur</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th scope="col" className="w-[18%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produits</th>
                <th scope="col" className="w-[8%] px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qté</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dépôt</th>
                <th scope="col" className="w-[9%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Écarts</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {filteredReceipts.map((receipt) => (
                <tr 
                  key={receipt.id} 
                  onClick={() => onSelectReceipt(receipt)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white truncate" title={receipt.reference}>
                    {receipt.reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={receipt.supplierName}>
                    <div className="font-medium truncate">{receipt.supplierName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate">
                    {receipt.date?.split(' ')[0] || ''}
                    <span className="text-xs opacity-70 ml-1 block">{receipt.date?.split(' ')[1] || ''}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={receipt.products.map(p => p.name).join(', ')}>
                    {receipt.products.map(p => p.name).join(', ')}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white text-right truncate">
                    {receipt.totalQty || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={receipt.warehouseName}>
                    {receipt.warehouseName}
                  </td>
                  <td className="px-6 py-4 text-sm truncate">
                    {receipt.gaps && receipt.gaps.length > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400">
                        <AlertTriangle className="w-4 h-4" /> {receipt.gaps.length} écart(s)
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border max-w-full truncate", getStatusBadgeColor(receipt.status))}>
                      {receipt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReceipts.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucune réception ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
