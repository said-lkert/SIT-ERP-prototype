import React, { useState, useMemo } from 'react';
import { InstallationPV, PVStatus, PVResult } from './types';
import { Search, Plus, Filter, Download, FileSignature, AlertCircle, Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { cn, safeFormatDate } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';

interface PVListProps {
  pvs: InstallationPV[];
  onSelectPV: (pv: InstallationPV) => void;
  onAddClick: () => void;
}

export function PVList({ pvs: allPVs, onSelectPV, onAddClick }: PVListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [hasReservesFilter, setHasReservesFilter] = useState('');
  const [installationDateFilter, setInstallationDateFilter] = useState('');
  const [signatureDateFilter, setSignatureDateFilter] = useState('');

  const activeFiltersCount = [
    statusFilter, clientFilter, projectFilter, siteFilter, 
    technicianFilter, resultFilter, hasReservesFilter, 
    installationDateFilter, signatureDateFilter
  ].filter(Boolean).length;

  const pvs = useMemo(() => {
    return allPVs.filter(pv => {
      const searchLower = search.toLowerCase();
      const matchSearch = 
        pv.reference.toLowerCase().includes(searchLower) || 
        pv.clientName.toLowerCase().includes(searchLower) ||
        pv.projectName.toLowerCase().includes(searchLower) ||
        pv.siteName.toLowerCase().includes(searchLower) ||
        pv.technician.toLowerCase().includes(searchLower) ||
        (pv.clientSignatory && pv.clientSignatory.toLowerCase().includes(searchLower)) ||
        pv.products.some(p => 
          p.productName.toLowerCase().includes(searchLower) ||
          p.productReference.toLowerCase().includes(searchLower) ||
          p.serialNumber.toLowerCase().includes(searchLower)
        );
      
      const matchStatus = statusFilter ? pv.status === statusFilter : true;
      const matchClient = clientFilter ? pv.clientName === clientFilter : true;
      const matchProject = projectFilter ? pv.projectName === projectFilter : true;
      const matchSite = siteFilter ? pv.siteName === siteFilter : true;
      const matchTechnician = technicianFilter ? pv.technician === technicianFilter : true;
      const matchResult = resultFilter ? pv.result === resultFilter : true;
      const matchReserves = hasReservesFilter ? (hasReservesFilter === 'Oui' ? pv.hasReserves : !pv.hasReserves) : true;
      const matchInstallationDate = installationDateFilter ? pv.installationDate.startsWith(installationDateFilter) : true;
      const matchSignatureDate = signatureDateFilter ? (pv.signatureDate && pv.signatureDate.startsWith(signatureDateFilter)) : true;

      return matchSearch && matchStatus && matchClient && matchProject && matchSite && 
             matchTechnician && matchResult && matchReserves && 
             matchInstallationDate && matchSignatureDate;
    });
  }, [
    search, statusFilter, clientFilter, projectFilter, siteFilter, 
    technicianFilter, resultFilter, hasReservesFilter, 
    installationDateFilter, signatureDateFilter, allPVs
  ]);

  const statuses = useMemo(() => Array.from(new Set(allPVs.map(pv => pv.status))), [allPVs]);
  const clients = useMemo(() => Array.from(new Set(allPVs.map(pv => pv.clientName))), [allPVs]);
  const projects = useMemo(() => Array.from(new Set(allPVs.map(pv => pv.projectName))), [allPVs]);
  const sites = useMemo(() => Array.from(new Set(allPVs.map(pv => pv.siteName))), [allPVs]);
  const technicians = useMemo(() => Array.from(new Set(allPVs.map(pv => pv.technician))), [allPVs]);
  const results = useMemo(() => Array.from(new Set(allPVs.map(pv => pv.result))), [allPVs]);

  const stats = useMemo(() => {
    const total = allPVs.length;
    const brouillons = allPVs.filter(pv => pv.status === 'Brouillon' || pv.status === 'À compléter').length;
    const enAttente = allPVs.filter(pv => pv.status === 'En attente de signature').length;
    const signes = allPVs.filter(pv => pv.status === 'Signé').length;
    const avecReserves = allPVs.filter(pv => pv.status === 'Signé avec réserves').length;
    const refuses = allPVs.filter(pv => pv.status === 'Refusé' || pv.status === 'Annulé').length;
    
    return { total, brouillons, enAttente, signes, avecReserves, refuses };
  }, [allPVs]);

  const getStatusColor = (status: PVStatus) => {
    switch (status) {
      case 'Signé': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Signé avec réserves': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'En attente de signature': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'À compléter': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Refusé':
      case 'Annulé': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Brouillon': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getResultColor = (result: PVResult) => {
    switch(result) {
      case 'Installation conforme': return 'text-emerald-600 dark:text-emerald-400';
      case 'Conforme avec réserves': return 'text-amber-600 dark:text-amber-400';
      case 'Non conforme':
      case 'Tests à reprendre': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">PV d'installation</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez les validations et signatures après installation chez le client.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors opacity-90 hover:opacity-100"
          >
            <Plus className="w-4 h-4" /> Nouveau PV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
              <FileSignature className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{stats.total}</span>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Total PV</span>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
              <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{stats.brouillons}</span>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Brouillons</span>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{stats.enAttente}</span>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">En attente</span>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{stats.signes}</span>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Signés</span>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center border border-amber-100 dark:border-amber-800/30 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{stats.avecReserves}</span>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Avec réserves</span>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-red-200 dark:hover:border-red-800/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center border border-red-100 dark:border-red-800/30 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{stats.refuses}</span>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Refusés</span>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher N°, client, projet, technicien, série..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
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
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Site</label>
                <CustomSelect
                  value={siteFilter}
                  onChange={setSiteFilter}
                  options={[{ value: '', label: 'Tous les sites' }, ...sites.map(s => ({ value: s, label: s }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Technicien</label>
                <CustomSelect
                  value={technicianFilter}
                  onChange={setTechnicianFilter}
                  options={[{ value: '', label: 'Tous les techniciens' }, ...technicians.map(t => ({ value: t, label: t }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Résultat</label>
                <CustomSelect
                  value={resultFilter}
                  onChange={setResultFilter}
                  options={[{ value: '', label: 'Tous les résultats' }, ...results.map(r => ({ value: r, label: r }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Avec réserves</label>
                <CustomSelect
                  value={hasReservesFilter}
                  onChange={setHasReservesFilter}
                  options={[
                    { value: '', label: 'Peu importe' },
                    { value: 'Oui', label: 'Oui' },
                    { value: 'Non', label: 'Non' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Date installation</label>
                <input
                  type="date"
                  value={installationDateFilter}
                  onChange={(e) => setInstallationDateFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Date signature</label>
                <input
                  type="date"
                  value={signatureDateFilter}
                  onChange={(e) => setSignatureDateFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 transition-colors"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {pvs.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => {
                   setStatusFilter('');
                   setClientFilter('');
                   setProjectFilter('');
                   setSiteFilter('');
                   setTechnicianFilter('');
                   setResultFilter('');
                   setHasReservesFilter('');
                   setInstallationDateFilter('');
                   setSignatureDateFilter('');
                   setSearch('');
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
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">N° PV</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projet / Affaire</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Site</th>
                <th scope="col" className="w-[8%] px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Équipements</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Technicien</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Installation</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Résultat</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Signature</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {pvs.length > 0 ? (
                pvs.map((pv) => (
                  <tr 
                    key={pv.id} 
                    onClick={() => onSelectPV(pv)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white truncate" title={pv.reference}>
                      {pv.reference}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={pv.clientName}>
                      {pv.clientName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={pv.projectName}>
                      {pv.projectName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={pv.siteName}>
                      {pv.siteName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                        {pv.products.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={pv.technician}>
                      {pv.technician}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {safeFormatDate(pv.installationDate)}
                    </td>
                    <td className="px-6 py-4 text-sm truncate">
                      <span className={cn("font-medium", getResultColor(pv.result))}>
                        {pv.result}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {pv.signatureDate ? (
                        <div className="flex flex-col">
                           <span className="text-slate-700 dark:text-slate-300">{safeFormatDate(pv.signatureDate)}</span>
                           <span className="text-xs truncate">{pv.clientSignatory}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        getStatusColor(pv.status)
                      )}>
                        {pv.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                      <FileSignature className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm font-medium">Aucun PV trouvé</p>
                      <p className="text-xs mt-1">Ajustez vos filtres ou créez un nouveau PV d'installation.</p>
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
              Affichage de {pvs.length} résultat(s)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
