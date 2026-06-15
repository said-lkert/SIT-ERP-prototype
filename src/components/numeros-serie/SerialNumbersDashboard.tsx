import React, { useState } from 'react';
import { 
  Search, Filter, Plus, FileDown, FileUp, 
  Barcode, Package, CheckCircle2, AlertTriangle, 
  MapPin, ShieldAlert, Wrench
} from 'lucide-react';
import { SerialNumber } from './types';
import { CustomSelect } from '../ui/CustomSelect';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';
import { SerialActionModal, SerialActionType } from './SerialActionModal';
import { safeFormatDate } from '../../lib/utils';

interface SerialNumbersDashboardProps {
  data: SerialNumber[];
  onSelectSerial: (serial: SerialNumber) => void;
}

export function SerialNumbersDashboard({ data, onSelectSerial }: SerialNumbersDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionModal, setActionModal] = useState<{isOpen: boolean; action: SerialActionType}>({isOpen: false, action: null});
  
  const [filters, setFilters] = useState({
    family: '',
    status: '',
    location: '',
    warrantyExpiring: false,
    warrantyExpired: false
  });

  // KPI Calculations
  const totalSerials = data.length;
  const inStock = data.filter(d => d.status === 'en_stock').length;
  const installed = data.filter(d => d.status === 'installe_client').length;
  const inRepair = data.filter(d => ['en_panne', 'retour_fournisseur', 'en_reparation'].includes(d.status)).length;
  
  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(now.getMonth() + 3);

  const warrantyExpiringSoon = data.filter(d => {
    if (!d.endOfWarranty) return false;
    const end = new Date(d.endOfWarranty);
    return end > now && end <= threeMonthsFromNow;
  }).length;

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.serial.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.clientSite && item.clientSite.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (filters.family && item.family !== filters.family) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.location && item.location !== filters.location) return false;
    
    if (filters.warrantyExpiring || filters.warrantyExpired) {
       if (!item.endOfWarranty) return false;
       const end = new Date(item.endOfWarranty);
       if (filters.warrantyExpired && end > now) return false;
       if (filters.warrantyExpiring && (end <= now || end > threeMonthsFromNow)) return false;
    }

    return true;
  });

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_stock':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">En stock</span>;
      case 'reserve':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Réservé</span>;
      case 'installe_client':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Installé</span>;
      case 'en_panne':
      case 'retour_fournisseur':
      case 'en_reparation':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">{status.replace('_', ' ')}</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{status.replace('_', ' ')}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Numéros de série</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Traçabilité et suivi unitaire des équipements</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <FileDown className="w-4 h-4" /> Exporter
          </button>
          <button onClick={() => setActionModal({isOpen: true, action: 'add'})} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors opacity-90 hover:opacity-100">
            <Plus className="w-4 h-4" /> Nouveau N° de série
          </button>
        </div>
      </div>

      {/* Stats Cards =================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <Barcode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">{totalSerials}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Numéros de série</p>
          </div>
        </div>

        {/* En stock */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">{inStock}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">En stock</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Disponibles</p>
          </div>
        </div>

         {/* Installés */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">{installed}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Installés</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Chez clients</p>
          </div>
        </div>

        {/* En panne / retour */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-rose-200 dark:hover:border-rose-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-800/30 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50 transition-colors">
            <Wrench className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">{inRepair}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">En réparation</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Panne ou SAV</p>
          </div>
        </div>

        {/* Garantie < 3 mois */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/30 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">{warrantyExpiringSoon}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Exp. proche</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Garantie {'<'} 3 mois</p>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher par N° de série, produit, client..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
               <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Famille</label>
                  <CustomSelect 
                    value={filters.family} onChange={(val) => setFilters({...filters, family: val})}
                    options={[
                        {value: '', label: 'Toutes les familles'},
                        {value: 'Vidéosurveillance', label: 'Vidéosurveillance'},
                        {value: 'Réseau', label: 'Réseau'},
                        {value: 'Énergie', label: 'Énergie'}
                    ]}
                  />
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Statut</label>
                  <CustomSelect 
                    value={filters.status} onChange={(val) => setFilters({...filters, status: val})}
                    options={[
                        {value: '', label: 'Tous les statuts'},
                        {value: 'en_stock', label: 'En stock'},
                        {value: 'reserve', label: 'Réservé'},
                        {value: 'installe_client', label: 'Installé chez client'},
                        {value: 'en_panne', label: 'En panne'},
                        {value: 'retour_fournisseur', label: 'Retour fournisseur'}
                    ]}
                  />
               </div>
            </div>

            <div className="flex flex-wrap gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={filters.warrantyExpiring} onChange={(e) => setFilters({...filters, warrantyExpiring: e.target.checked})} className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700" />
                Garantie bientôt expirée ({'<'} 3 mois)
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={filters.warrantyExpired} onChange={(e) => setFilters({...filters, warrantyExpired: e.target.checked})} className="rounded text-rose-600 focus:ring-rose-500 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700" />
                Garantie expirée
              </label>
            </div>
            
            <div className="flex items-center justify-between pt-3">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredData.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => setFilters({family: '', status: '', location: '', warrantyExpiring: false, warrantyExpired: false})}
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
                <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Numéro de série</th>
                <th scope="col" className="w-[30%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produit & Famille</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
                <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Localisation / Client</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fin garantie</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {filteredData.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  onClick={() => onSelectSerial(item)}
                >
                  <td className="px-6 py-4 text-sm font-medium font-mono text-slate-900 dark:text-white truncate" title={item.serial}>
                    {item.serial}
                  </td>
                  <td className="px-6 py-4 text-sm truncate" title={item.productName}>
                    <div className="font-medium text-slate-900 dark:text-white truncate">{item.productName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{item.productReference} • {item.family}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 text-sm truncate" title={item.location}>
                    <div className="text-slate-900 dark:text-white truncate">{item.location}</div>
                    {item.clientSite && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{item.clientSite}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    {item.endOfWarranty ? (
                      <span className={`text-sm ${
                        new Date(item.endOfWarranty) <= now ? 'text-rose-600 dark:text-rose-400 font-semibold' : 
                        new Date(item.endOfWarranty) <= threeMonthsFromNow ? 'text-amber-600 dark:text-amber-400 font-semibold' :
                        'text-slate-500 dark:text-slate-400'
                      }`}>
                        {safeFormatDate(item.endOfWarranty)}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Non définie</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucun numéro de série ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>

      <SerialActionModal 
        isOpen={actionModal.isOpen} 
        onClose={() => setActionModal({isOpen: false, action: null})} 
        action={actionModal.action} 
      />
    </div>
  );
}
