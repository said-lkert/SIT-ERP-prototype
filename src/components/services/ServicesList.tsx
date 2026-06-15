import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Service, ServiceStatus } from './types';
import { MOCK_SERVICES } from './mockData';
import { Search, Plus, Filter, Download, Upload, Briefcase, AlertCircle, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';

function ScrollingText({ text, className }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [scrollAmount, setScrollAmount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const isLong = text.length > 56;

  useEffect(() => {
    if (isLong && isHovered && textRef.current && containerRef.current) {
      const scrollWidth = textRef.current.scrollWidth;
      const clientWidth = containerRef.current.clientWidth;
      if (scrollWidth > clientWidth) {
        setScrollAmount(scrollWidth - clientWidth + 40);
      }
    } else {
      setScrollAmount(0);
    }
  }, [isHovered, isLong, text]);

  if (!isLong) {
    return (
      <div className={cn("overflow-hidden whitespace-nowrap text-ellipsis", className)}>
        {text}
      </div>
    );
  }

  const durationStr = `${Math.max(4, scrollAmount / 15)}s`;

  return (
    <div 
      ref={containerRef}
      className={cn("overflow-hidden whitespace-nowrap cursor-default", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={textRef}
        className={cn(
          "inline-block transition-transform",
          !isHovered && "w-full"
        )}
        style={{
          transform: (isHovered && scrollAmount > 0) ? `translateX(-${scrollAmount}px)` : 'translateX(0)',
          transitionDuration: (isHovered && scrollAmount > 0) ? durationStr : '0.4s',
          transitionProperty: 'transform',
          transitionTimingFunction: isHovered ? 'linear' : 'ease-out',
        }}
      >
        {isHovered ? text : `${text.slice(0, 56)}...`}
      </div>
    </div>
  );
}

interface ServicesListProps {
  services: Service[];
  onServiceClick: (service: Service) => void;
  onAddClick: () => void;
}

const FAMILY_OPTIONS = [
  { value: 'all', label: 'Toutes les familles' },
  { value: 'CCTV', label: 'CCTV' },
  { value: 'Réseau', label: 'Réseau' },
  { value: 'Fibre optique', label: 'Fibre optique' },
  { value: 'Contrôle d\'accès', label: 'Contrôle d\'accès' },
  { value: 'Serveurs', label: 'Serveurs' },
  { value: 'Cloud', label: 'Cloud' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Support', label: 'Support' },
  { value: 'Formation', label: 'Formation' },
];

const UNIT_OPTIONS = [
  { value: 'all', label: 'Toutes les unités' },
  { value: 'Heure', label: 'Heure' },
  { value: 'Jour', label: 'Jour' },
  { value: 'Forfait', label: 'Forfait' },
  { value: 'Mètre', label: 'Mètre' },
  { value: 'Point réseau', label: 'Point réseau' },
  { value: 'Caméra installée', label: 'Caméra installée' },
  { value: 'Équipement configuré', label: 'Équipement configuré' },
  { value: 'Intervention', label: 'Intervention' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'Actif', label: 'Actif' },
  { value: 'Désactivé', label: 'Désactivé' },
  { value: 'Obsolète', label: 'Obsolète' },
];

export function ServicesList({ services: allServices, onServiceClick, onAddClick }: ServicesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [margeFilter, setMargeFilter] = useState<{ value: 'all' | 'faible', label: string }>({ value: 'all', label: 'Toutes les marges' });

  const activeFiltersCount = [
    selectedFamily !== 'all',
    selectedUnit !== 'all',
    selectedStatus !== 'all',
    margeFilter.value !== 'all'
  ].filter(Boolean).length;

  const stats = useMemo(() => {
    return {
      total: allServices.length,
      actifs: allServices.filter(s => s.status === 'Actif').length,
      margeFaible: allServices.filter(s => s.marginRate < 120).length,
      visiteRequise: allServices.filter(s => s.unit === 'Intervention' || s.unit === 'Jour' || s.family === 'Maintenance').length || 3,
    };
  }, [allServices]);

  const filteredServices = useMemo(() => {
    return allServices.filter(service => {
      const matchesSearch = 
        service.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFamily = selectedFamily === 'all' || service.family === selectedFamily;
      const matchesUnit = selectedUnit === 'all' || service.unit === selectedUnit;
      const matchesStatus = selectedStatus === 'all' || service.status === selectedStatus;
      const matchesMarge = margeFilter.value === 'all' || (margeFilter.value === 'faible' && service.marginRate < 120);

      return matchesSearch && matchesFamily && matchesUnit && matchesStatus && matchesMarge;
    });
  }, [searchQuery, selectedFamily, selectedUnit, selectedStatus, margeFilter]);

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'Actif': return 'px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800/10 text-xs font-semibold';
      case 'Désactivé': return 'px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-800/10 text-xs font-semibold';
      case 'Obsolète': return 'px-2.5 py-1 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Services & Prestations</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gérez le catalogue des services proposés.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Exporter
          </button>
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors opacity-90 hover:opacity-100"
          >
            <Plus className="w-4 h-4" /> Nouveau service
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.total}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total services</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Catalogue complet</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.actifs}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Prestations actives</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Prêtes pour devis</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/30 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.margeFaible}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Marges &lt; 120%</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">À surveiller</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.visiteRequise}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Visite requise</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Intervention sur site</p>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher par référence, nom ou mot-clé..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Famille</label>
                <CustomSelect
                  value={selectedFamily}
                  onChange={setSelectedFamily}
                  options={FAMILY_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Unité</label>
                <CustomSelect
                  value={selectedUnit}
                  onChange={setSelectedUnit}
                  options={UNIT_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Statut</label>
                <CustomSelect
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={STATUS_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Marge</label>
                <CustomSelect
                  value={margeFilter.value}
                  onChange={(val) => {
                    const opts = [{ value: 'all', label: 'Toutes les marges' }, { value: 'faible', label: 'Marges faibles' }];
                    setMargeFilter(opts.find(o => o.value === val) || opts[0])
                  }}
                  options={[
                    { value: 'all', label: 'Toutes les marges' },
                    { value: 'faible', label: 'Marges faibles' }
                  ]}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredServices.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => {
                   setSelectedFamily('all');
                   setSelectedUnit('all');
                   setSelectedStatus('all');
                   setMargeFilter({ value: 'all', label: 'Toutes les marges' });
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
          <table className="min-w-full table-fixed divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Référence</th>
                <th scope="col" className="w-[35%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Service</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Famille & Unité</th>
                <th scope="col" className="w-[23%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Coût / Prix / Marge</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-950 divide-y divide-slate-200 dark:divide-slate-800">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <tr 
                    key={service.id} 
                    onClick={() => onServiceClick(service)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                      {service.reference}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg">{service.name}</div>
                      <ScrollingText text={service.description} className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-white">{service.family}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{service.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        <span className="text-slate-500 line-through text-xs mr-2">{service.internalCost.toFixed(2)}</span>
                        {service.sellingPrice.toFixed(2)} DA
                      </div>
                      <div className={cn(
                        "text-xs mt-0.5 flex items-center gap-1",
                        service.marginRate < 120 ? "text-amber-600 dark:text-amber-500 font-semibold" : "text-emerald-600 dark:text-emerald-500"
                      )}>
                        Marge : {service.marginRate.toFixed(2)}% ({service.margin.toFixed(2)} DA)
                        {service.marginRate < 120 && <AlertTriangle className="w-3 h-3" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusColor(service.status)}>
                        {service.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    Aucun service ne correspond à vos critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between mt-auto">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Affichage de <span className="font-medium text-slate-900 dark:text-white">{filteredServices.length}</span> services sur <span className="font-medium text-slate-900 dark:text-white">{allServices.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
