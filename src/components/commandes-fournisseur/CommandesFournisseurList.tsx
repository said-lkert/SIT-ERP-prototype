import React, { useState, useMemo } from 'react';
import { CommandeFournisseur, CommandeFournisseurStatus } from './types';
import { Search, Plus, Download, ShoppingCart, Clock, CheckCircle2, AlertTriangle, AlertCircle, FileText } from 'lucide-react';
import { cn, safeFormatDate } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';

interface CommandesListProps {
  commandes: CommandeFournisseur[];
  onSelectCommande: (commande: CommandeFournisseur) => void;
  onAddClick: () => void;
}

export function CommandesFournisseurList({ commandes: allCommandes, onSelectCommande, onAddClick }: CommandesListProps) {
  const [search, setSearch] = useState('');
  const [fournisseurFilter, setFournisseurFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [responsableFilter, setResponsableFilter] = useState('');
  const [hasPartialReceptionOnly, setHasPartialReceptionOnly] = useState(false);
  const [hasDelayOnly, setHasDelayOnly] = useState(false);

  const activeFiltersCount = [fournisseurFilter, statusFilter, responsableFilter, hasPartialReceptionOnly, hasDelayOnly].filter(Boolean).length;

  const commandes = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return allCommandes.filter(c => {
      const matchSearch = 
        c.reference.toLowerCase().includes(search.toLowerCase()) || 
        c.fournisseurName.toLowerCase().includes(search.toLowerCase()) ||
        c.lignes.some(l => l.productName.toLowerCase().includes(search.toLowerCase()));
      
      const matchFournisseur = fournisseurFilter ? c.fournisseurName === fournisseurFilter : true;
      const matchStatus = statusFilter ? c.statut === statusFilter : true;
      const matchResponsable = responsableFilter ? c.responsableName === responsableFilter : true;
      const matchPartial = hasPartialReceptionOnly ? c.statut === 'Partiellement reçue' : true;
      
      const isRetard = c.statut !== 'Reçue' && c.statut !== 'Annulée' && c.dateLivraisonPrevue < today;
      const matchDelay = hasDelayOnly ? isRetard : true;

      return matchSearch && matchFournisseur && matchStatus && matchResponsable && matchPartial && matchDelay;
    });
  }, [allCommandes, search, fournisseurFilter, statusFilter, responsableFilter, hasPartialReceptionOnly, hasDelayOnly]);

  const fournisseurs = useMemo(() => Array.from(new Set(allCommandes.map(c => c.fournisseurName))), [allCommandes]);
  const statuses = useMemo(() => Array.from(new Set(allCommandes.map(c => c.statut))), [allCommandes]);
  const responsables = useMemo(() => Array.from(new Set(allCommandes.map(c => c.responsableName))), [allCommandes]);

  const stats = useMemo(() => {
    const periodMonth = new Date().getMonth();
    const periodYear = new Date().getFullYear();
    
    const commandesDuMois = allCommandes.filter(c => {
      const d = new Date(c.dateCommande);
      return d.getMonth() === periodMonth && d.getFullYear() === periodYear;
    }).length;
    
    const enAttente = allCommandes.filter(c => ['Brouillon', 'Validée', 'Envoyée'].includes(c.statut)).length;
    
    const partielles = allCommandes.filter(c => c.statut === 'Partiellement reçue').length;
    
    const valeurTotale = allCommandes.reduce((acc, c) => {
        const totalCmd = c.lignes.reduce((sum, l) => sum + (l.qteCmd * l.prixU), 0);
        // Approximation without handling multiple currencies easily, just summing for mock
        return acc + totalCmd;
    }, 0);
    
    return { commandesDuMois, enAttente, partielles, valeurTotale };
  }, [allCommandes]);

  const getStatusColor = (status: CommandeFournisseurStatus) => {
    switch (status) {
      case 'Brouillon': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'Validée': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Envoyée': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Partiellement reçue': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Reçue': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Annulée': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Commandes fournisseur</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez les commandes passées aux fournisseurs et leur suivi de réception.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Exporter
          </button>
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors opacity-90 hover:opacity-100"
          >
            <Plus className="w-4 h-4" /> Nouvelle commande
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.commandesDuMois}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Commandes du mois</span>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.enAttente}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Commandes en attente</span>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-800/30 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.partielles}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Réceptions partielles</span>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-xl font-bold text-slate-900 dark:text-white leading-none whitespace-nowrap">{stats.valeurTotale.toLocaleString()} DA</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Valeur commandée</span>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par référence, fournisseur, produit..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Fournisseur</label>
                <CustomSelect
                  value={fournisseurFilter}
                  onChange={setFournisseurFilter}
                  options={[{ value: '', label: 'Tous les fournisseurs' }, ...fournisseurs.map(f => ({ value: f, label: f }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Statut</label>
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[{ value: '', label: 'Tous statuts' }, ...statuses.map(s => ({ value: s, label: s }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Responsable</label>
                <CustomSelect
                  value={responsableFilter}
                  onChange={setResponsableFilter}
                  options={[{ value: '', label: 'Tous responsables' }, ...responsables.map(r => ({ value: r, label: r }))]}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPartialReceptionOnly}
                  onChange={(e) => setHasPartialReceptionOnly(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:checked:bg-indigo-500 transition-colors"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Commande avec réception partielle</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDelayOnly}
                  onChange={(e) => setHasDelayOnly(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:checked:bg-indigo-500 transition-colors"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Commande avec retard</span>
              </label>
            </div>
            
            <div className="flex items-center justify-between pt-3">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {commandes.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => {
                   setFournisseurFilter('');
                   setStatusFilter('');
                   setResponsableFilter('');
                   setHasPartialReceptionOnly(false);
                   setHasDelayOnly(false);
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
          <table className="w-full min-w-[1000px] table-fixed divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Référence</th>
                <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fournisseur</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produits</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qté Totale</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Livraison Prévue</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valeur Est.</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {commandes.map((commande) => {
                const totalQte = commande.lignes.reduce((sum, l) => sum + l.qteCmd, 0);
                const valeurEst = commande.lignes.reduce((sum, l) => sum + (l.qteCmd * l.prixU), 0);
                const firstProduct = commande.lignes[0]?.productName || '';
                const nbProducts = commande.lignes.length;
                const productsStr = nbProducts > 1 ? `${firstProduct} +${nbProducts - 1}` : firstProduct;
                
                return (
                  <tr 
                    key={commande.id} 
                    onClick={() => onSelectCommande(commande)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white truncate" title={commande.reference}>
                      {commande.reference}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={commande.fournisseurName}>
                      <div className="font-medium truncate">{commande.fournisseurName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate text-left">
                      {safeFormatDate(commande.dateCommande)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={productsStr}>
                      {productsStr}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white text-left truncate">
                      {totalQte}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-left truncate">
                      {safeFormatDate(commande.dateLivraisonPrevue)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white text-left truncate">
                      {valeurEst.toLocaleString()} {commande.devise}
                    </td>
                    <td className="px-6 py-4 text-sm text-left truncate">
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(commande.statut))}>
                        {commande.statut}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {commandes.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucune commande ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
