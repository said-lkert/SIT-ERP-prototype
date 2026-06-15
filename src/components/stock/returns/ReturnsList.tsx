import React, { useState, useMemo } from 'react';
import { SupplierReturn, ReturnStatus, ReturnReason } from './types';
import { 
  Download, Plus, Search, Filter, Calendar, Building2, Package, RotateCcw, 
  ChevronRight, Hash, Users, PenTool, CheckCircle2, ShieldAlert, AlertTriangle, 
  FileText, Clock, RefreshCw, Landmark
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CustomSelect } from '../../ui/CustomSelect';
import { ModuleSearchFilters } from '../../ui/ModuleSearchFilters';
import { useModules } from '../../../contexts/ModuleContext';

interface ReturnsListProps {
  returns: SupplierReturn[];
  onSelectReturn: (ret: SupplierReturn) => void;
  onNewReturn: () => void;
}

export function ReturnsList({ returns: allReturns, onSelectReturn, onNewReturn }: ReturnsListProps) {
  const { isModuleEnabled } = useModules();
  const serialNumbersEnabled = isModuleEnabled('numeros-serie');

  const [search, setSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [motifFilter, setMotifFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [serializedOnly, setSerializedOnly] = useState<string>(''); // 'yes' or ''

  const activeFiltersCount = [
    supplierFilter, 
    statusFilter, 
    motifFilter, 
    periodFilter, 
    serialNumbersEnabled ? serializedOnly : ''
  ].filter(Boolean).length;

  const filteredReturns = useMemo(() => {
    return allReturns.filter(ret => {
      // General search
      const matchSearch = 
        ret.reference.toLowerCase().includes(search.toLowerCase()) || 
        ret.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        ret.responsible.toLowerCase().includes(search.toLowerCase()) ||
        ret.products.some(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.reference.toLowerCase().includes(search.toLowerCase()));
      
      const matchSupplier = supplierFilter ? ret.supplierName === supplierFilter : true;
      const matchStatus = statusFilter ? ret.status === statusFilter : true;
      const matchMotif = motifFilter ? ret.motif === motifFilter : true;
      
      let matchPeriod = true;
      if (periodFilter) {
        if (periodFilter === 'today') matchPeriod = ret.date.includes('2026-06-03') || ret.date.includes('2024-04-22'); // mock today adapt relative
        else if (periodFilter === 'week') matchPeriod = ret.date.includes('2024-04');
        else if (periodFilter === 'month') matchPeriod = ret.date.includes('2024-04');
      }

      const matchSerialized = (serialNumbersEnabled && serializedOnly === 'yes') ? ret.products.some(p => p.isSerialized) : true;

      return matchSearch && matchSupplier && matchStatus && matchMotif && matchPeriod && matchSerialized;
    });
  }, [search, supplierFilter, statusFilter, motifFilter, periodFilter, serializedOnly, allReturns]);

  const stats = useMemo(() => {
    const month = allReturns.filter(r => r.date.includes('2024-04')).length;
    const pending = allReturns.filter(r => r.status === 'En attente').length;
    const validated = allReturns.filter(r => r.status === 'Validé').length;
    // Estimated worth of returning products expecting a credit note
    const avoirsAttendus = allReturns
      .filter(r => r.status === 'Validé' || r.status === 'En attente')
      .reduce((acc, curr) => acc + curr.totalValue, 0);

    return { month, pending, validated, avoirsAttendus };
  }, [allReturns]);

  const suppliers = useMemo(() => {
    const unique = new Set<string>();
    allReturns.forEach(r => unique.add(r.supplierName));
    return Array.from(unique).map(s => ({ value: s, label: s }));
  }, [allReturns]);

  const getStatusBadgeColor = (status: ReturnStatus) => {
    switch (status) {
      case 'Validé': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'En attente': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Clôturé': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Annulé': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Brouillon': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Retours fournisseur</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gérez les produits renvoyés aux fournisseurs pour panne, écart ou garantie.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-all">
            <Download className="w-4 h-4" /> Exporter
          </button>
          <button 
            onClick={onNewReturn}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Nouveau retour
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
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Retours du mois</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-all hover:border-amber-200">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{stats.pending}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Retours en attente</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-all hover:border-emerald-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{stats.validated}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-normal">Retours validés</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-all hover:border-purple-200">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{stats.avoirsAttendus.toLocaleString()} <span className="text-xs font-normal">DA</span></div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Avoirs attendus</div>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Référence, fournisseur, produit, responsable..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
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
                    { value: 'En attente', label: 'En attente' },
                    { value: 'Validé', label: 'Validé' },
                    { value: 'Clôturé', label: 'Clôturé' },
                    { value: 'Annulé', label: 'Annulé' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">Motif de retour</label>
                <CustomSelect
                  value={motifFilter}
                  onChange={setMotifFilter}
                  options={[
                    { value: '', label: 'Tous les motifs' },
                    { value: 'Panne', label: 'Panne' },
                    { value: 'Abîmé à la réception', label: 'Abîmé à la réception' },
                    { value: 'Erreur de livraison', label: 'Erreur de livraison' },
                    { value: 'Garantie', label: 'Garantie' },
                    { value: 'Échange', label: 'Échange' },
                    { value: 'Avoir', label: 'Avoir' }
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
              {serialNumbersEnabled && (
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">Traçabilité</label>
                  <CustomSelect
                    value={serializedOnly}
                    onChange={setSerializedOnly}
                    options={[
                      { value: '', label: 'Tous produits' },
                      { value: 'yes', label: 'Sérialisés uniquement' }
                    ]}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {filteredReturns.length} retour(s) trouvé(s)
               </div>
               <button 
                 onClick={() => {
                   setSupplierFilter('');
                   setStatusFilter('');
                   setMotifFilter('');
                   setPeriodFilter('');
                   setSerializedOnly('');
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
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Référence retour</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fournisseur</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Motif</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date retour</th>
                <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produits</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quantité</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Document lié</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {filteredReturns.map((ret) => (
                <tr 
                  key={ret.id} 
                  onClick={() => onSelectReturn(ret)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white truncate" title={ret.reference}>
                    {ret.reference}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white truncate" title={ret.supplierName}>
                    {ret.supplierName}
                  </td>
                  <td className="px-6 py-4 text-sm truncate">
                     <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {ret.motif}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate">
                    {ret.date?.split(' ')[0] || ''}
                    <span className="text-xs opacity-70 ml-1 block">{ret.date?.split(' ')[1] || ''}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={ret.products.map(p => p.name).join(', ')}>
                    {ret.products.map(p => p.name).join(', ')}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white text-right truncate">
                    {ret.totalQty}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate">
                    {ret.documents && ret.documents.length > 0 ? (
                      <span className="truncate" title={ret.documents[0].name}>{ret.documents[0].name}</span>
                    ) : (
                      <span className="italic text-slate-400 dark:text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border max-w-full truncate", getStatusBadgeColor(ret.status))}>
                      {ret.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReturns.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucun retour ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
