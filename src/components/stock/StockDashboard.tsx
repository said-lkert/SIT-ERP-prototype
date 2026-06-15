import React, { useState, useRef, useEffect } from 'react';
import { StockItem } from './types';
import { 
  Package, 
  Search, 
  Filter, 
  ArrowRightLeft, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Lock, 
  ListChecks,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  X,
  Settings,
  ChevronDown,
  Download
} from 'lucide-react';
import { StockActionModal } from './StockActionModal';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';
import { cn } from '../../lib/utils';
import { useModules } from '../../contexts/ModuleContext';

interface StockDashboardProps {
  data: StockItem[];
  onSelectProduct: (product: StockItem) => void;
}

export function StockDashboard({ data, onSelectProduct }: StockDashboardProps) {
  const { isModuleEnabled } = useModules();
  const serialNumbersEnabled = isModuleEnabled('numeros-serie');

  const [searchTerm, setSearchTerm] = useState('');
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; action: 'entree' | 'sortie' | 'transfert' | 'resever' | 'correction' | null }>({ isOpen: false, action: null });
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filters State
  const [filters, setFilters] = useState({
    family: '',
    location: '',
    status: '',
    ruptureOnly: false,
    sousSeuilOnly: false,
    availableOnly: false,
    serializedOnly: false,
    orderedOnly: false
  });

  // KPI Calculations
  const ruptureCount = (data?.filter(d => d.status === 'rupture') || []).length;
  const sousSeuilCount = (data?.filter(d => d.status === 'sous_seuil') || []).length;
  const totalReserved = (data || []).reduce((sum, item) => sum + (item.reservedStock || 0), 0);
  const totalAvailable = (data || []).reduce((sum, item) => sum + (item.availableStock || 0), 0);
  const totalOrdered = (data || []).reduce((sum, item) => sum + (item.orderedStock || 0), 0);

  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filters.family && item.family !== filters.family) return false;
    if (filters.status && item.status !== filters.status) return false;
    
    if (filters.ruptureOnly && item.status !== 'rupture') return false;
    if (filters.sousSeuilOnly && item.status !== 'sous_seuil') return false;
    if (filters.availableOnly && item.availableStock <= 0) return false;
    if (serialNumbersEnabled && filters.serializedOnly && !item.isSerialized) return false;
    if (filters.orderedOnly && item.orderedStock <= 0) return false;
    
    if (filters.location && !item.locations.some(l => l.name === filters.location)) return false;

    return true;
  });

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Stock & Disponibilité</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Poste de contrôle du stock matériel et équipements.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>

            <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsActionsOpen(!isActionsOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Options
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isActionsOpen && "rotate-180")} />
                </button>

                {isActionsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1.5 text-slate-700 dark:text-slate-300">
                      <button 
                        onClick={() => { setActionModal({ isOpen: true, action: 'entree' }); setIsActionsOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <ArrowDownToLine className="w-4 h-4 text-emerald-500 shrink-0" /> Entrée stock
                      </button>

                      <button 
                        onClick={() => { setActionModal({ isOpen: true, action: 'sortie' }); setIsActionsOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <ArrowUpFromLine className="w-4 h-4 text-rose-500 shrink-0" /> Sortie stock
                      </button>

                      <button 
                        onClick={() => { setActionModal({ isOpen: true, action: 'transfert' }); setIsActionsOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-blue-500 shrink-0" /> Transfert stock
                      </button>

                      <button 
                        onClick={() => { setActionModal({ isOpen: true, action: 'resever' }); setIsActionsOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Lock className="w-4 h-4 text-amber-500 shrink-0" /> Réserver stock
                      </button>

                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                      <button 
                        onClick={() => { setActionModal({ isOpen: true, action: 'correction' }); setIsActionsOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <ListChecks className="w-4 h-4 text-slate-500 shrink-0" /> Correction stock
                      </button>
                    </div>
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Rupture */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-rose-200 dark:hover:border-rose-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-800/30 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50 transition-colors">
            <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">{ruptureCount}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Rupture</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Stock épuisé</p>
          </div>
        </div>

        {/* Sous Seuil */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/30 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">{sousSeuilCount}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Sous Seuil</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">À réapprovisionner</p>
          </div>
        </div>

        {/* Qté Réservée */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">{totalReserved}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Réservés</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Stock alloué</p>
          </div>
        </div>

        {/* Disponibles */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">{totalAvailable}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Disponibles</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Prêt à l'usage</p>
          </div>
        </div>

        {/* Commande */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">{totalOrdered}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">En commande</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Chez fournisseur</p>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher par référence, nom..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
               <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Famille</label>
                  <select 
                    value={filters.family} onChange={(e) => setFilters({...filters, family: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option value="">Toutes</option>
                    <option value="Vidéosurveillance">Vidéosurveillance</option>
                    <option value="Réseau">Réseau</option>
                    <option value="Énergie">Énergie</option>
                    <option value="Câblage">Câblage</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Emplacement</label>
                  <select 
                    value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option value="">Tous</option>
                    <option value="Dépôt principal">Dépôt principal</option>
                    <option value="Véhicule Technicien A">Véhicule Technicien A</option>
                    <option value="Véhicule Technicien B">Véhicule Technicien B</option>
                    <option value="Chantier Hôtel X">Chantier Hôtel X</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Statut global</label>
                  <select 
                    value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option value="">Tous</option>
                    <option value="en_stock">En stock</option>
                    <option value="sous_seuil">Sous seuil</option>
                    <option value="rupture">Rupture</option>
                  </select>
               </div>
            </div>

            <div className="flex flex-wrap gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={filters.ruptureOnly} onChange={(e) => setFilters({...filters, ruptureOnly: e.target.checked})} className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700" />
                Rupture uniquement
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={filters.sousSeuilOnly} onChange={(e) => setFilters({...filters, sousSeuilOnly: e.target.checked})} className="rounded text-amber-600 focus:ring-amber-500 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700" />
                Sous seuil uniquement
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={filters.availableOnly} onChange={(e) => setFilters({...filters, availableOnly: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700" />
                Stock disponible uniquement
              </label>
              {serialNumbersEnabled && (
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={filters.serializedOnly} onChange={(e) => setFilters({...filters, serializedOnly: e.target.checked})} className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700" />
                  Produits sérialisés uniquement
                </label>
              )}
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={filters.orderedOnly} onChange={(e) => setFilters({...filters, orderedOnly: e.target.checked})} className="rounded text-purple-600 focus:ring-purple-500 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700" />
                En commande fournisseur
              </label>
            </div>
            
            <div className="flex items-center justify-between pt-3">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredData.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => setFilters({family: '', location: '', status: '', ruptureOnly: false, sousSeuilOnly: false, availableOnly: false, serializedOnly: false, orderedOnly: false})}
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
                <th scope="col" className="w-[28%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produit</th>
                <th scope="col" className="w-[16%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Famille</th>
                <th scope="col" className="w-[11%] px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock Physique</th>
                <th scope="col" className="w-[11%] px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock Réservé</th>
                <th scope="col" className="w-[11%] px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock Disponible</th>
                <th scope="col" className="w-[11%] px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">En Commande</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {filteredData.map(item => (
                <tr 
                  key={item.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  onClick={() => onSelectProduct(item)}
                >
                  <td className="px-6 py-4 text-sm truncate">
                    <div className="font-medium text-slate-900 dark:text-white truncate" title={item.name}>{item.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate" title={`${item.reference} • ${item.mainLocation}`}>{item.reference} • {item.mainLocation}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate text-left" title={item.family}>
                    {item.family}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white text-center truncate">
                    {item.physicalStock || 0}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-amber-600 dark:text-amber-500 text-center truncate">
                    {item.reservedStock || 0}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-500 text-center truncate">
                    {item.availableStock || 0}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600 dark:text-blue-500 text-center truncate">
                    {item.orderedStock || 0}
                  </td>
                  <td className="px-6 py-4 text-left truncate">
                     {item.status === 'en_stock' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/10 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors"><CheckCircle2 className="w-3.5 h-3.5"/> En stock</span>}
                     {item.status === 'sous_seuil' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/10 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"><AlertTriangle className="w-3.5 h-3.5"/> Sous seuil</span>}
                     {item.status === 'rupture' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800/10 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"><AlertOctagon className="w-3.5 h-3.5"/> Rupture</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucun produit ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>

      <StockActionModal 
        isOpen={actionModal.isOpen} 
        action={actionModal.action} 
        onClose={() => setActionModal({ isOpen: false, action: null })} 
      />
    </div>
  );
}
