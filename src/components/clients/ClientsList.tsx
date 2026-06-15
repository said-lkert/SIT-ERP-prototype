import React, { useState, useMemo } from 'react';
import { Client, ClientStatus, ClientType, SectorType } from './types';
import { Search, Plus, Download, Users, Briefcase, Box, AlertCircle, Building2, MapPin, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';

interface ClientsListProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  onAddClick: () => void;
}

export function ClientsList({ clients: allClients, onSelectClient, onAddClick }: ClientsListProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [withProjectsOnly, setWithProjectsOnly] = useState(false);
  const [withEquipmentsOnly, setWithEquipmentsOnly] = useState(false);

  const activeFiltersCount = [typeFilter, statusFilter, sectorFilter, cityFilter, withProjectsOnly, withEquipmentsOnly].filter(Boolean).length;

  const clients = useMemo(() => {
    return allClients.filter(c => {
      const matchSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.mainContact.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase()) ||
        c.sector.toLowerCase().includes(search.toLowerCase());
      
      const matchType = typeFilter ? c.type === typeFilter : true;
      const matchStatus = statusFilter ? c.status === statusFilter : true;
      const matchSector = sectorFilter ? c.sector === sectorFilter : true;
      const matchCity = cityFilter ? c.city === cityFilter : true;
      const matchProjects = withProjectsOnly ? c.activeProjects > 0 : true;
      const matchEquipments = withEquipmentsOnly ? c.installedEquipments > 0 : true;

      return matchSearch && matchType && matchStatus && matchSector && matchCity && matchProjects && matchEquipments;
    });
  }, [search, typeFilter, statusFilter, sectorFilter, cityFilter, withProjectsOnly, withEquipmentsOnly, allClients]);

  const stats = useMemo(() => {
    const total = allClients.length;
    const actifs = allClients.filter(c => c.status === 'Actif').length;
    const projets = allClients.reduce((acc, c) => acc + c.activeProjects, 0);
    const equipments = allClients.reduce((acc, c) => acc + c.installedEquipments, 0);
    return { total, actifs, projets, equipments };
  }, [allClients]);

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case 'Actif': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Inactif': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Archivé': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const types = ['Entreprise', 'Administration', 'Hôtel', 'École', 'Particulier'];
  const sectors = ['IT', 'Industrie', 'Hôtellerie', 'Éducation', 'Santé', 'Services', 'Autre'];
  const cities = Array.from(new Set(allClients.map(c => c.city)));

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Clients</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez les clients, leurs sites, projets et équipements installés.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Exporter
          </button>
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors opacity-90 hover:opacity-100"
          >
            <Plus className="w-4 h-4" /> Nouveau client
          </button>
        </div>
      </div>

      {/* Stats Cards =================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.total}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total clients</span>
          </div>
        </div>

        {/* Clients Actifs */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.actifs}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Clients actifs</span>
          </div>
        </div>

        {/* Projets Actifs */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.projets}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Projets actifs</span>
          </div>
        </div>

        {/* Équipements Installés */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <Box className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.equipments}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Équipements</span>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par nom, contact, ville..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Type client</label>
                <CustomSelect
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[{ value: '', label: 'Tous les types' }, ...types.map(t => ({ value: t, label: t }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Statut</label>
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[{ value: '', label: 'Tous les statuts' }, { value: 'Actif', label: 'Actif' }, { value: 'Inactif', label: 'Inactif' }, { value: 'Archivé', label: 'Archivé' }]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Secteur</label>
                <CustomSelect
                  value={sectorFilter}
                  onChange={setSectorFilter}
                  options={[{ value: '', label: 'Tous les secteurs' }, ...sectors.map(s => ({ value: s, label: s }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Ville</label>
                <CustomSelect
                  value={cityFilter}
                  onChange={setCityFilter}
                  options={[{ value: '', label: 'Toutes les villes' }, ...cities.map(c => ({ value: c, label: c }))]}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withProjectsOnly}
                  onChange={(e) => setWithProjectsOnly(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 transition-colors"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Avec projets actifs</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withEquipmentsOnly}
                  onChange={(e) => setWithEquipmentsOnly(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 transition-colors"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Avec équipements installés</span>
              </label>
            </div>
            
            <div className="flex items-center justify-between pt-3">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {clients.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => {
                   setTypeFilter('');
                   setStatusFilter('');
                   setSectorFilter('');
                   setCityFilter('');
                   setWithProjectsOnly(false);
                   setWithEquipmentsOnly(false);
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
          <table className="w-full min-w-[1100px] table-fixed divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact principal</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Téléphone / Email</th>
                <th scope="col" className="w-[8%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sites</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projets</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Équips.</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {clients.map((client) => (
                <tr 
                  key={client.id} 
                  onClick={() => onSelectClient(client)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-sm truncate">
                    <div className="flex flex-col min-w-0 truncate">
                      <div className="font-medium text-slate-900 dark:text-white truncate" title={client.name}>
                         {client.name}
                      </div>
                      <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" /> {client.city}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate">
                    {client.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate">
                    <div className="font-medium truncate">{client.mainContact}</div>
                  </td>
                  <td className="px-6 py-4 text-sm truncate">
                    <div className="flex flex-col truncate">
                       <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{client.phone}</span>
                       <span className="text-slate-500 dark:text-slate-400 text-xs truncate">{client.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className="font-semibold text-slate-900 dark:text-white">{client.sitesCount}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn(
                      "font-semibold transition-colors",
                      client.activeProjects > 0 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                    )}>
                      {client.activeProjects}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <div className="flex items-center gap-2 truncate">
                       <span className="font-semibold text-slate-900 dark:text-white">{client.installedEquipments}</span>
                       {client.hasExpiredWarranties && (
                         <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="Garanties expirées" />
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(client.status))}>
                      {client.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucun client ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
