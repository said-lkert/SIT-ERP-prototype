import React, { useState, useMemo } from 'react';
import { ClientLivraison, LivraisonStatus } from './types';
import { Search, Plus, Filter, Download, PackageOpen, AlertCircle, Clock, Truck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn, safeFormatDate } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';

interface LivraisonsListProps {
  livraisons: ClientLivraison[];
  onSelectLivraison: (livraison: ClientLivraison) => void;
  onAddClick: () => void;
}

export function LivraisonsList({ livraisons: allLivraisons, onSelectLivraison, onAddClick }: LivraisonsListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');
  const [creationDateFilter, setCreationDateFilter] = useState('');
  const [plannedDateFilter, setPlannedDateFilter] = useState('');
  const [actualDateFilter, setActualDateFilter] = useState('');

  const activeFiltersCount = [
    statusFilter, clientFilter, projectFilter, siteFilter, 
    warehouseFilter, responsibleFilter, carrierFilter, 
    creationDateFilter, plannedDateFilter, actualDateFilter
  ].filter(Boolean).length;

  const livraisons = useMemo(() => {
    return allLivraisons.filter(l => {
      const matchSearch = 
        l.reference.toLowerCase().includes(search.toLowerCase()) || 
        l.deliverySlipNumber.toLowerCase().includes(search.toLowerCase()) ||
        l.clientName.toLowerCase().includes(search.toLowerCase()) ||
        l.projectName.toLowerCase().includes(search.toLowerCase()) ||
        l.deliverySite.toLowerCase().includes(search.toLowerCase()) ||
        l.responsible.toLowerCase().includes(search.toLowerCase()) ||
        l.products.some(p => 
          p.productName.toLowerCase().includes(search.toLowerCase()) ||
          p.productReference.toLowerCase().includes(search.toLowerCase())
        );
      
      const matchStatus = statusFilter ? l.status === statusFilter : true;
      const matchClient = clientFilter ? l.clientName === clientFilter : true;
      const matchProject = projectFilter ? l.projectName === projectFilter : true;
      const matchSite = siteFilter ? l.deliverySite === siteFilter : true;
      const matchWarehouse = warehouseFilter ? l.warehouse === warehouseFilter : true;
      const matchResponsible = responsibleFilter ? l.responsible === responsibleFilter : true;
      const matchCarrier = carrierFilter ? l.carrier === carrierFilter : true;
      const matchCreationDate = creationDateFilter ? l.createdAt.startsWith(creationDateFilter) : true;
      const matchPlannedDate = plannedDateFilter ? l.plannedDate.startsWith(plannedDateFilter) : true;
      const matchActualDate = actualDateFilter ? (l.actualDate && l.actualDate.startsWith(actualDateFilter)) : true;

      return matchSearch && matchStatus && matchClient && matchProject && matchSite && 
             matchWarehouse && matchResponsible && matchCarrier && 
             matchCreationDate && matchPlannedDate && matchActualDate;
    });
  }, [
    search, statusFilter, clientFilter, projectFilter, siteFilter, 
    warehouseFilter, responsibleFilter, carrierFilter, 
    creationDateFilter, plannedDateFilter, actualDateFilter, allLivraisons
  ]);

  const statuses = useMemo(() => Array.from(new Set(allLivraisons.map(l => l.status))), [allLivraisons]);
  const clients = useMemo(() => Array.from(new Set(allLivraisons.map(l => l.clientName))), [allLivraisons]);
  const projects = useMemo(() => Array.from(new Set(allLivraisons.map(l => l.projectName))), [allLivraisons]);
  const sites = useMemo(() => Array.from(new Set(allLivraisons.map(l => l.deliverySite))), [allLivraisons]);
  const warehouses = useMemo(() => Array.from(new Set(allLivraisons.map(l => l.warehouse))), [allLivraisons]);
  const responsibles = useMemo(() => Array.from(new Set(allLivraisons.map(l => l.responsible))), [allLivraisons]);
  const carriers = useMemo(() => Array.from(new Set(allLivraisons.map(l => l.carrier))), [allLivraisons]);

  const stats = useMemo(() => {
    const total = allLivraisons.length;
    const aPreparer = allLivraisons.filter(l => l.status === 'À préparer').length;
    const pretes = allLivraisons.filter(l => l.status === 'Prête').length;
    const enCours = allLivraisons.filter(l => l.status === 'En cours').length;
    const livrees = allLivraisons.filter(l => ['Livrée', 'Partiellement livrée'].includes(l.status)).length;
    const anomalies = allLivraisons.filter(l => l.status === 'Avec anomalie' || l.status === 'Refusée').length;
    return { total, aPreparer, pretes, enCours, livrees, anomalies };
  }, [allLivraisons]);

  const getStatusColor = (status: LivraisonStatus) => {
    switch (status) {
      case 'Livrée': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Partiellement livrée': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800';
      case 'Prête': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'En cours': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'À préparer': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Avec anomalie':
      case 'Refusée':
      case 'Annulée': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Brouillon': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Livraisons client</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Préparez, suivez et confirmez la livraison de vos équipements.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors opacity-90 hover:opacity-100"
          >
            <Plus className="w-4 h-4" /> Nouvelle livraison
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
              <PackageOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{stats.total}</span>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Total livraisons</span>
        </div>

        {/* À préparer */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center border border-amber-100 dark:border-amber-800/30 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{stats.aPreparer}</span>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">À préparer</span>
        </div>

        {/* Prêtes à livrer */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
              <PackageOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{stats.pretes}</span>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Prêtes à livrer</span>
        </div>

        {/* En cours */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
              <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{stats.enCours}</span>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">En cours</span>
        </div>

        {/* Livrées */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{stats.livrees}</span>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Livrées</span>
        </div>

        {/* Avec anomalie */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-red-200 dark:hover:border-red-800/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center border border-red-100 dark:border-red-800/30 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{stats.anomalies}</span>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Anomalies</span>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher N°, BL, client, projet, site, produit..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Statut</label>
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[{ value: '', label: 'Tous les statuts' }, ...statuses.map(s => ({ value: s, label: s }))]}
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
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Projet</label>
                <CustomSelect
                  value={projectFilter}
                  onChange={setProjectFilter}
                  options={[{ value: '', label: 'Tous les projets' }, ...projects.map(p => ({ value: p, label: p }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Site client</label>
                <CustomSelect
                  value={siteFilter}
                  onChange={setSiteFilter}
                  options={[{ value: '', label: 'Tous les sites' }, ...sites.map(s => ({ value: s, label: s }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Entrepôt</label>
                <CustomSelect
                  value={warehouseFilter}
                  onChange={setWarehouseFilter}
                  options={[{ value: '', label: 'Tous les entrepôts' }, ...warehouses.map(w => ({ value: w, label: w }))]}
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
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Transporteur</label>
                <CustomSelect
                  value={carrierFilter}
                  onChange={setCarrierFilter}
                  options={[{ value: '', label: 'Tous les transporteurs' }, ...carriers.map(c => ({ value: c, label: c }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Date prévue</label>
                <input
                  type="date"
                  value={plannedDateFilter}
                  onChange={(e) => setPlannedDateFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 transition-colors"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {livraisons.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => {
                   setStatusFilter('');
                   setClientFilter('');
                   setProjectFilter('');
                   setSiteFilter('');
                   setWarehouseFilter('');
                   setResponsibleFilter('');
                   setCarrierFilter('');
                   setCreationDateFilter('');
                   setPlannedDateFilter('');
                   setActualDateFilter('');
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
          <table className="w-full min-w-[1200px] table-fixed divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">N° Livraison</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projet / Affaire</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Site de livraison</th>
                <th scope="col" className="w-[8%] px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produits</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date prévue</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Responsable</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">BL</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {livraisons.length > 0 ? (
                livraisons.map((livraison) => (
                  <tr 
                    key={livraison.id} 
                    onClick={() => onSelectLivraison(livraison)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white truncate" title={livraison.reference}>
                      {livraison.reference}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={livraison.clientName}>
                      {livraison.clientName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={livraison.projectName}>
                      {livraison.projectName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={livraison.deliverySite}>
                      {livraison.deliverySite}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                        {livraison.products.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {safeFormatDate(livraison.plannedDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 truncate" title={livraison.responsible}>
                      {livraison.responsible}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500 truncate" title={livraison.deliverySlipNumber}>
                      {livraison.deliverySlipNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        getStatusColor(livraison.status)
                      )}>
                        {livraison.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                      <PackageOpen className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm font-medium">Aucune livraison trouvée</p>
                      <p className="text-xs mt-1">Ajustez vos filtres ou créez une nouvelle livraison.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination/Footer could go here */}
        <div className="mt-auto px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Affichage de {livraisons.length} résultat(s)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
