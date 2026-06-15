import React, { useState, useMemo } from 'react';
import { 
  Building2, Search, Filter, Plus, Download, Package, Truck, CheckCircle2, AlertTriangle, MoreHorizontal, User, Phone, Mail, Globe, MapPin, Activity, X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Fournisseur } from './types';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';
import { CustomSelect } from '../ui/CustomSelect';
import { FournisseurAddModal } from './FournisseurAddModal';
import { AnimatePresence, motion } from 'motion/react';

interface FournisseursListProps {
  suppliers: Fournisseur[];
  onFournisseurSelect: (f: Fournisseur) => void;
  onAddFournisseur: (newF: Fournisseur) => void;
}

export function FournisseursList({ suppliers, onFournisseurSelect, onAddFournisseur }: FournisseursListProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [addedSupplierName, setAddedSupplierName] = useState('');

  const activeFiltersCount = [typeFilter, statusFilter, countryFilter].filter(Boolean).length;

  const filteredFournisseurs = useMemo(() => {
    return suppliers.filter(f => {
      const matchSearch = 
        (f.name || '').toLowerCase().includes(search.toLowerCase()) || 
        (f.reference || '').toLowerCase().includes(search.toLowerCase()) ||
        (f.contactPrincipale || '').toLowerCase().includes(search.toLowerCase()) ||
        (f.email || '').toLowerCase().includes(search.toLowerCase());
      
      const matchType = typeFilter ? f.type.toLowerCase() === typeFilter.toLowerCase() : true;
      const matchStatus = statusFilter ? f.statut === statusFilter : true;
      const matchCountry = countryFilter ? f.pays.includes(countryFilter) : true;

      return matchSearch && matchType && matchStatus && matchCountry;
    });
  }, [suppliers, search, typeFilter, statusFilter, countryFilter]);

  const types = useMemo(() => Array.from(new Set(suppliers.map(f => f.type))), [suppliers]);
  const statuses = useMemo(() => Array.from(new Set(suppliers.map(f => f.statut))), [suppliers]);
  const countries = useMemo(() => Array.from(new Set(suppliers.map(f => f.pays))), [suppliers]);

  const stats = useMemo(() => {
    const total = suppliers.length;
    const actifs = suppliers.filter(f => f.statut === 'actif').length;
    const lowConformity = suppliers.filter(f => f.tauxConformite < 85).length;
    const itemsProvided = suppliers.reduce((acc, f) => acc + f.produitsAssocies, 0);
    return { total, actifs, lowConformity, itemsProvided };
  }, [suppliers]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'inactif': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'archive': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Fournisseurs</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez vos partenaires d'approvisionnement et leurs performances.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors opacity-90 hover:opacity-100"
          >
            <Plus className="w-4 h-4" /> Nouveau fournisseur
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.total}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total fournisseurs</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Catalogue partenaires</p>
          </div>
        </div>

        {/* Actifs */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.actifs}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Actifs</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Opérationnels</p>
          </div>
        </div>

        {/* Alerte Conformité */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/30 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.lowConformity}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Alerte Conformité</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{"< 85% de fiabilité"}</p>
          </div>
        </div>

        {/* Produits Fournis */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.itemsProvided}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Références gérées</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Articles référencés</p>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par nom, contact, email..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Type</label>
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
                  options={[{ value: '', label: 'Tous les statuts' }, ...statuses.map(s => ({ value: s, label: s }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Pays</label>
                <CustomSelect
                  value={countryFilter}
                  onChange={setCountryFilter}
                  options={[{ value: '', label: 'Tous les pays' }, ...countries.map(c => ({ value: c, label: c }))]}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredFournisseurs.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => {
                   setTypeFilter('');
                   setStatusFilter('');
                   setCountryFilter('');
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
          <table className="w-full min-w-[900px] table-fixed divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="w-[18%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fournisseur</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                <th scope="col" className="w-[18%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Téléphone / Email</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produits</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dernière liv.</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {filteredFournisseurs.map(f => (
                <tr 
                  key={f.id} 
                  onClick={() => onFournisseurSelect(f)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white truncate" title={f.name}>
                    {f.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={f.type}>
                    {f.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={f.contactPrincipale}>
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                            {(f.contactPrincipale || '').split(' ').map(n=>n[0]).join('').substring(0,2)}
                        </div>
                        <span className="truncate">{f.contactPrincipale}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <div className="flex flex-col truncate">
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{f.telephone}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs truncate">{f.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white truncate">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Package className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500"/> {f.produitsAssocies}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-left truncate">
                    <div className="flex flex-col">
                        <span>{formatDate(f.derniereLivraison)}</span>
                        {f.commandesAttente > 0 && (
                           <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{f.commandesAttente} en attente</span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(f.statut))}>
                      {f.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredFournisseurs.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucun fournisseur ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>

      {/* NEW SUPPLIER MODAL */}
      <FournisseurAddModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(newFournisseur) => {
          onAddFournisseur(newFournisseur);
          setAddedSupplierName(newFournisseur.name);
          setShowSuccessToast(true);
          setTimeout(() => {
            setShowSuccessToast(false);
          }, 5000);
        }}
      />

      {/* TOAST SUCCESS NOTIFICATION */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="fixed top-6 right-6 z-[99999] max-w-sm bg-white dark:bg-slate-900 border-l-4 border-emerald-500 rounded-xl shadow-2xl p-4 border border-slate-200/80 dark:border-slate-800"
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-grow min-w-0 pr-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Fournisseur créé avec succès</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Une nouvelle fiche a été générée pour le partenaire <span className="font-semibold text-slate-800 dark:text-slate-200">{addedSupplierName}</span>.
                </p>
              </div>
              <button 
                onClick={() => setShowSuccessToast(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
