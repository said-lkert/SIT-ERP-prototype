import React, { useState, useMemo } from 'react';
import { StockReservation, ReservationStatus, ReservationPriority } from './types';
import { Plus, Download, Package, AlertCircle, AlertTriangle, CheckCircle2, Bookmark, Clock, CalendarDays } from 'lucide-react';
import { cn, safeFormatDate } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';

interface ReservationsListProps {
  reservations: StockReservation[];
  onSelectReservation: (reservation: StockReservation) => void;
  onAddClick: () => void;
}

export function ReservationsList({ reservations: allReservations, onSelectReservation, onAddClick }: ReservationsListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [requesterFilter, setRequesterFilter] = useState('');
  const [creationDateFilter, setCreationDateFilter] = useState('');
  const [plannedDateFilter, setPlannedDateFilter] = useState('');

  const activeFiltersCount = [statusFilter, projectFilter, clientFilter, warehouseFilter, locationFilter, priorityFilter, requesterFilter, creationDateFilter, plannedDateFilter].filter(Boolean).length;

  const reservations = useMemo(() => {
    return allReservations.filter(r => {
      const matchSearch = 
        r.reference.toLowerCase().includes(search.toLowerCase()) || 
        r.projectName.toLowerCase().includes(search.toLowerCase()) ||
        r.clientName.toLowerCase().includes(search.toLowerCase()) ||
        r.responsible.toLowerCase().includes(search.toLowerCase()) ||
        r.products.some(p => 
          p.productName.toLowerCase().includes(search.toLowerCase()) || 
          p.productReference.toLowerCase().includes(search.toLowerCase())
        );
      
      const matchStatus = statusFilter ? r.status === statusFilter : true;
      const matchProject = projectFilter ? r.projectName === projectFilter : true;
      const matchClient = clientFilter ? r.clientName === clientFilter : true;
      const matchWarehouse = warehouseFilter ? r.products.some(p => p.warehouse === warehouseFilter) : true;
      const matchLocation = locationFilter ? r.products.some(p => p.location === locationFilter) : true;
      const matchPriority = priorityFilter ? r.priority === priorityFilter : true;
      const matchRequester = requesterFilter ? r.responsible === requesterFilter : true;
      const matchCreationDate = creationDateFilter ? r.createdAt.startsWith(creationDateFilter) : true;
      const matchPlannedDate = plannedDateFilter ? r.plannedDate.startsWith(plannedDateFilter) : true;

      return matchSearch && matchStatus && matchProject && matchClient && matchWarehouse && matchLocation && matchPriority && matchRequester && matchCreationDate && matchPlannedDate;
    });
  }, [search, statusFilter, projectFilter, clientFilter, warehouseFilter, locationFilter, priorityFilter, requesterFilter, creationDateFilter, plannedDateFilter, allReservations]);

  const statuses = useMemo(() => Array.from(new Set(allReservations.map(r => r.status))), [allReservations]);
  const projects = useMemo(() => Array.from(new Set(allReservations.map(r => r.projectName))), [allReservations]);
  const clients = useMemo(() => Array.from(new Set(allReservations.map(r => r.clientName))), [allReservations]);
  const priorities = useMemo(() => Array.from(new Set(allReservations.map(r => r.priority))), [allReservations]);
  const requesters = useMemo(() => Array.from(new Set(allReservations.map(r => r.responsible))), [allReservations]);
  const warehouses = useMemo(() => {
    const list = new Set<string>();
    allReservations.forEach(r => r.products.forEach(p => list.add(p.warehouse)));
    return Array.from(list);
  }, [allReservations]);
  const locations = useMemo(() => {
    const list = new Set<string>();
    allReservations.forEach(r => r.products.forEach(p => list.add(p.location)));
    return Array.from(list);
  }, [allReservations]);

  const stats = useMemo(() => {
    const actives = allReservations.filter(r => ['Brouillon', 'En attente', 'Partiellement réservée', 'Réservée'].includes(r.status)).length;
    const enAttente = allReservations.filter(r => r.status === 'En attente').length;
    const portielles = allReservations.filter(r => r.status === 'Partiellement réservée').length;
    const reservees = allReservations.reduce((sum, r) => sum + r.totalReservedQty, 0);
    
    // Proches de l'échéance : less than 7 days ahead
    const now = new Date();
    const proches = allReservations.filter(r => {
      if (r.status === 'Consommée' || r.status === 'Annulée' || r.status === 'Expirée') return false;
      const date = new Date(r.plannedDate);
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;

    return { actives, enAttente, portielles, reservees, proches };
  }, [allReservations]);

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case 'Réservée': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Consommée': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Partiellement réservée': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'En attente': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Brouillon': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      case 'Annulée': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Expirée': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'Libérée': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getPriorityColor = (priority: ReservationPriority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
      case 'Haute': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800';
      case 'Normale': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
      case 'Basse': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Réservations stock</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Bloquez des quantités disponibles pour vos projets et affaires sans modifier le stock physique.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors opacity-90 hover:opacity-100"
          >
            <Plus className="w-4 h-4" /> Nouvelle réservation
          </button>
        </div>
      </div>

      {/* Stats Cards =================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <Bookmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.actives}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Actives</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Réservations en cours</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/30 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.enAttente}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">En attente</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">À traiter</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-800/30 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.portielles}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Partielles</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Stock incomplet</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.reservees}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Produits</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Total réservé</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-red-200 dark:hover:border-red-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-800/30 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
            <CalendarDays className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.proches}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Échéance proche</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">&lt; 7 jours</p>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher (n°, projet, client, produit...)"
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Statut</label>
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[{ value: '', label: 'Tous statuts' }, ...statuses.map(s => ({ value: s, label: s }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Projet / Affaire</label>
                <CustomSelect
                  value={projectFilter}
                  onChange={setProjectFilter}
                  options={[{ value: '', label: 'Tous projets' }, ...projects.map(p => ({ value: p, label: p }))]}
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
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Priorité</label>
                <CustomSelect
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                  options={[{ value: '', label: 'Toutes priorités' }, ...priorities.map(p => ({ value: p, label: p }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Entrepôt</label>
                <CustomSelect
                  value={warehouseFilter}
                  onChange={setWarehouseFilter}
                  options={[{ value: '', label: 'Tous entrepôts' }, ...warehouses.map(w => ({ value: w, label: w }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Emplacement</label>
                <CustomSelect
                  value={locationFilter}
                  onChange={setLocationFilter}
                  options={[{ value: '', label: 'Tous emplacements' }, ...locations.map(l => ({ value: l, label: l }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Demandeur</label>
                <CustomSelect
                  value={requesterFilter}
                  onChange={setRequesterFilter}
                  options={[{ value: '', label: 'Tous demandeurs' }, ...requesters.map(r => ({ value: r, label: r }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Date de création</label>
                <input
                  type="date"
                  value={creationDateFilter}
                  onChange={(e) => setCreationDateFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Date prévue</label>
                <input
                  type="date"
                  value={plannedDateFilter}
                  onChange={(e) => setPlannedDateFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {reservations.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => {
                   setStatusFilter('');
                   setProjectFilter('');
                   setClientFilter('');
                   setPriorityFilter('');
                   setWarehouseFilter('');
                   setLocationFilter('');
                   setRequesterFilter('');
                   setCreationDateFilter('');
                   setPlannedDateFilter('');
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
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">N° Réservation</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projet / Affaire</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produits</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dem / Rés.</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date prévue</th>
                <th scope="col" className="w-[8%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priorité</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Responsable</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {reservations.map((reservation) => {
                const missingQty = reservation.totalRequestedQty - reservation.totalReservedQty;
                
                return (
                <tr 
                  key={reservation.id} 
                  onClick={() => onSelectReservation(reservation)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white truncate" title={reservation.reference}>
                    {reservation.reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={reservation.projectName}>
                    <div className="font-medium truncate">{reservation.projectName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={reservation.clientName}>
                    {reservation.clientName}
                  </td>
                  <td className="px-6 py-4 text-sm text-center truncate">
                    <span className="font-semibold text-slate-900 dark:text-white">{reservation.products.length}</span> réf.
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {reservation.totalRequestedQty} / {reservation.totalReservedQty}
                      </span>
                      {missingQty > 0 && (
                        <span className="text-[10px] text-red-500 dark:text-red-400 font-bold">-{missingQty}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate">
                    {safeFormatDate(reservation.plannedDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", getPriorityColor(reservation.priority))}>
                      {reservation.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(reservation.status))}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={reservation.responsible}>
                     {reservation.responsible}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          {reservations.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucune réservation ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
