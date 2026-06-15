import React, { useState, useMemo } from 'react';
import { ClientReturn, ReturnStatus, ReturnReason } from './types';
import { Search, Plus, Download, Package, Activity, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import { cn, safeFormatDate } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';

interface RetoursClientListProps {
  returns: ClientReturn[];
  onSelectReturn: (ret: ClientReturn) => void;
  onAddClick: () => void;
}

export function RetoursClientList({ returns: allReturns, onSelectReturn, onAddClick }: RetoursClientListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [warrantyFilter, setWarrantyFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');

  const activeFiltersCount = [statusFilter, clientFilter, reasonFilter, warrantyFilter, projectFilter, siteFilter, typeFilter, zoneFilter].filter(Boolean).length;

  const returns = useMemo(() => {
    return allReturns.filter(r => {
      const matchSearch = 
        r.returnNumber.toLowerCase().includes(search.toLowerCase()) || 
        r.clientName.toLowerCase().includes(search.toLowerCase()) ||
        r.projectName.toLowerCase().includes(search.toLowerCase()) ||
        r.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
        r.productName.toLowerCase().includes(search.toLowerCase()) ||
        r.productReference.toLowerCase().includes(search.toLowerCase()) ||
        r.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.deliveryNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.technician.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter ? r.status === statusFilter : true;
      const matchClient = clientFilter ? r.clientName === clientFilter : true;
      const matchReason = reasonFilter ? r.reason === reasonFilter : true;
      const matchWarranty = warrantyFilter ? r.warrantyStatus === warrantyFilter : true;
      const matchProject = projectFilter ? r.projectName === projectFilter : true;
      const matchSite = siteFilter ? r.siteName === siteFilter : true;
      const matchType = typeFilter ? r.returnType === typeFilter : true;
      const matchZone = zoneFilter ? r.warehouseZone === zoneFilter : true;

      return matchSearch && matchStatus && matchClient && matchReason && matchWarranty && matchProject && matchSite && matchType && matchZone;
    });
  }, [search, statusFilter, clientFilter, reasonFilter, warrantyFilter, projectFilter, siteFilter, typeFilter, zoneFilter, allReturns]);

  const statuses = useMemo(() => Array.from(new Set(allReturns.map(r => r.status))), [allReturns]);
  const clients = useMemo(() => Array.from(new Set(allReturns.map(r => r.clientName))), [allReturns]);
  const reasons = useMemo(() => Array.from(new Set(allReturns.map(r => r.reason))), [allReturns]);
  const warranties = useMemo(() => Array.from(new Set(allReturns.map(r => r.warrantyStatus))), [allReturns]);
  const projects = useMemo(() => Array.from(new Set(allReturns.map(r => r.projectName))), [allReturns]);
  const sites = useMemo(() => Array.from(new Set(allReturns.map(r => r.siteName))), [allReturns]);
  const types = useMemo(() => Array.from(new Set(allReturns.map(r => r.returnType))), [allReturns]);
  const zones = useMemo(() => Array.from(new Set(allReturns.map(r => r.warehouseZone))), [allReturns]);

  const stats = useMemo(() => {
    const total = allReturns.length;
    const attenteReception = allReturns.filter(r => r.status === 'En attente de réception' || r.status === 'Demande enregistrée').length;
    const recus = allReturns.filter(r => r.status === 'Reçu').length;
    const enDiagnostic = allReturns.filter(r => r.status === 'En diagnostic').length;
    const aRemplacer = allReturns.filter(r => r.status === 'Remplacement prévu').length;
    const clotures = allReturns.filter(r => r.status === 'Clôturé' || r.status === 'Résolu').length;
    return { total, attenteReception, recus, enDiagnostic, aRemplacer, clotures };
  }, [allReturns]);

  const getStatusColor = (status: ReturnStatus) => {
    switch (status) {
      case 'Clôturé':
      case 'Résolu': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'En diagnostic':
      case 'Réparation en cours':
      case 'Remplacement prévu': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'En attente de réception':
      case 'Demande enregistrée':
      case 'Reçu': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Brouillon':
      case 'Annulé':
      case 'Retour refusé': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getWarrantyColor = (warrantyStatus: string) => {
    switch (warrantyStatus) {
      case 'Sous garantie': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30';
      case 'Hors garantie': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Retours client</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Centralisez et traitez les retours de matériel défectueux.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors opacity-90 hover:opacity-100"
          >
            <Plus className="w-4 h-4" /> Nouveau retour
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total des retours */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <RotateCcw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.total}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total retours</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Tous confondus</p>
          </div>
        </div>

        {/* En attente */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all flex items-start gap-4 cursor-pointer" onClick={() => setStatusFilter('En attente de réception')}>
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.attenteReception}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">En attente</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Non reçus</p>
          </div>
        </div>

        {/* Reçus */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all flex items-start gap-4 cursor-pointer" onClick={() => setStatusFilter('Reçu')}>
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.recus}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Reçus</span>
             <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">À traiter</p>
          </div>
        </div>

        {/* En diagnostic */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 transition-all flex items-start gap-4 cursor-pointer" onClick={() => setStatusFilter('En diagnostic')}>
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/30 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
            <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.enDiagnostic}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">En diagnostic</span>
             <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">En inspection</p>
          </div>
        </div>

        {/* À remplacer */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-red-200 dark:hover:border-red-800/50 transition-all flex items-start gap-4 cursor-pointer" onClick={() => setStatusFilter('Remplacement prévu')}>
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-800/30 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.aRemplacer}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">À remplacer</span>
             <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Action requise</p>
          </div>
        </div>

        {/* Clôturés */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all flex items-start gap-4 cursor-pointer" onClick={() => setStatusFilter('Clôturé')}>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.clotures}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Clôturés</span>
             <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Dossiers fermés</p>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par N° retour, client, équipement..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Statut</label>
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[{ value: '', label: 'Tous statuts' }, ...statuses.map(s => ({ value: s, label: s }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Client</label>
                <CustomSelect
                  value={clientFilter}
                  onChange={setClientFilter}
                  options={[{ value: '', label: 'Tous clients' }, ...clients.map(c => ({ value: c, label: c }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Motif</label>
                <CustomSelect
                  value={reasonFilter}
                  onChange={setReasonFilter}
                  options={[{ value: '', label: 'Tous motifs' }, ...reasons.map(r => ({ value: r, label: r }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Garantie</label>
                <CustomSelect
                  value={warrantyFilter}
                  onChange={setWarrantyFilter}
                  options={[{ value: '', label: 'Tous états' }, ...warranties.map(w => ({ value: w, label: w }))]}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Projet</label>
                <CustomSelect
                  value={projectFilter}
                  onChange={setProjectFilter}
                  options={[{ value: '', label: 'Tous projets' }, ...projects.map(p => ({ value: p, label: p }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Site</label>
                <CustomSelect
                  value={siteFilter}
                  onChange={setSiteFilter}
                  options={[{ value: '', label: 'Tous sites' }, ...sites.map(s => ({ value: s, label: s }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Type de retour</label>
                <CustomSelect
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[{ value: '', label: 'Tous types' }, ...types.map(t => ({ value: t, label: t }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Zone / Entrepôt</label>
                <CustomSelect
                  value={zoneFilter}
                  onChange={setZoneFilter}
                  options={[{ value: '', label: 'Toutes zones' }, ...zones.map(z => ({ value: z, label: z }))]}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {returns.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => {
                   setStatusFilter('');
                   setClientFilter('');
                   setReasonFilter('');
                   setWarrantyFilter('');
                   setProjectFilter('');
                   setSiteFilter('');
                   setTypeFilter('');
                   setZoneFilter('');
                 }}
                 className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
               >
                 Réinitialiser les filtres
               </button>
            </div>
          </div>
        }
      />

      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] table-fixed divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">N° Retour</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                <th scope="col" className="w-[16%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produit / Équipement</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">N° Série</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projet / Site</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Motif</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Garantie</th>
                <th scope="col" className="w-[8%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Demande</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Responsable</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {returns.map((r) => (
                <tr 
                  key={r.id} 
                  onClick={() => onSelectReturn(r)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white truncate">
                    {r.returnNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate">
                    {r.clientName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate">
                    <div className="font-medium truncate">{r.equipmentName}</div>
                    <div className="text-xs text-slate-500">{r.productName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate">
                    <span className="font-mono">{r.serialNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate">
                    <div className="truncate">{r.projectName}</div>
                    <div className="text-xs">{r.siteName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate">
                    {r.reason}
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", 
                        getWarrantyColor(r.warrantyStatus)
                    )}>
                        {r.warrantyStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate">
                    {safeFormatDate(r.requestDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate">
                    {r.technician}
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(r.status))}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {returns.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucun retour ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
