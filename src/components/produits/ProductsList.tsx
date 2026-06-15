import React, { useState, useMemo } from 'react';
import { Product, ProductStatus } from './types';
import { MOCK_PRODUCTS } from './mockData';
import { Search, Plus, Filter, Download, Upload, MoreHorizontal, Package, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';
import { useModules } from '../../contexts/ModuleContext';

interface ProductsListProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddClick: () => void;
}

export function ProductsList({ products: allProducts, onSelectProduct, onAddClick }: ProductsListProps) {
  const { isModuleEnabled } = useModules();
  const serialNumbersEnabled = isModuleEnabled('numeros-serie');

  const [search, setSearch] = useState('');
  const [familyFilter, setFamilyFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [requiresSnOnly, setRequiresSnOnly] = useState(false);

  const activeFiltersCount = [familyFilter, brandFilter, statusFilter, inStockOnly, serialNumbersEnabled && requiresSnOnly].filter(Boolean).length;

  const products = useMemo(() => {
    return allProducts.filter(p => {
      const matchSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.reference.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.model.toLowerCase().includes(search.toLowerCase()) ||
        p.mainSupplier.toLowerCase().includes(search.toLowerCase());
      
      const matchFamily = familyFilter ? p.family === familyFilter : true;
      const matchBrand = brandFilter ? p.brand === brandFilter : true;
      const matchStatus = statusFilter ? p.status === statusFilter : true;
      const matchStock = inStockOnly ? p.availableStock > 0 : true;
      const matchSn = (serialNumbersEnabled && requiresSnOnly) ? p.requiresSerialNumber : true;

      return matchSearch && matchFamily && matchBrand && matchStatus && matchStock && matchSn;
    });
  }, [allProducts, search, familyFilter, brandFilter, statusFilter, inStockOnly, requiresSnOnly, serialNumbersEnabled]);

  const families = useMemo(() => Array.from(new Set(allProducts.map(p => p.family))), [allProducts]);
  const brands = useMemo(() => Array.from(new Set(allProducts.map(p => p.brand))), [allProducts]);
  const statuses = useMemo(() => Array.from(new Set(allProducts.map(p => p.status))), [allProducts]);

  const stats = useMemo(() => {
    const total = allProducts.length;
    const enRupture = allProducts.filter(p => p.availableStock === 0).length;
    const sousSeuil = allProducts.filter(p => p.availableStock > 0 && p.availableStock <= p.minThreshold).length;
    const disponibles = allProducts.filter(p => p.availableStock > p.minThreshold).length;
    return { total, enRupture, sousSeuil, disponibles };
  }, [allProducts]);

  const handleExport = () => {
    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) return;

    const rows = products.map((product) => `
      <tr>
        <td>${product.reference || '-'}</td>
        <td><strong>${product.name || '-'}</strong></td>
        <td>${product.family || '-'}</td>
        <td>${product.brand || '-'}</td>
        <td>${product.model || '-'}</td>
        <td>${product.availableStock ?? 0}</td>
        <td>${Number(product.sellingPrice || 0).toLocaleString('fr-FR')} DA</td>
        <td>${product.status || '-'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!doctype html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <title>Liste des produits - SIT ERP</title>
          <style>
            body { font-family: Arial, sans-serif; color: #172033; margin: 32px; }
            header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
            h1 { margin: 0 0 6px; font-size: 24px; }
            p { margin: 0; color: #64748b; font-size: 13px; }
            button { border: 0; background: #4f46e5; color: white; padding: 10px 16px; border-radius: 6px; cursor: pointer; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background: #f1f5f9; text-align: left; padding: 9px 7px; border: 1px solid #cbd5e1; }
            td { padding: 8px 7px; border: 1px solid #e2e8f0; }
            footer { margin-top: 18px; font-size: 11px; color: #64748b; }
            @media print { button { display: none; } body { margin: 12mm; } }
          </style>
        </head>
        <body>
          <header>
            <div>
              <h1>SIT ERP - Liste des produits</h1>
              <p>${products.length} produit(s) - Générée le ${new Date().toLocaleString('fr-FR')}</p>
            </div>
            <button onclick="window.print()">Imprimer</button>
          </header>
          <table>
            <thead>
              <tr>
                <th>Référence</th><th>Produit</th><th>Famille</th><th>Marque</th>
                <th>Modèle</th><th>Disponible</th><th>Prix de vente</th><th>Statut</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <footer>Document généré depuis le module Produits de SIT ERP.</footer>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case 'Actif': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'En rupture': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Sous seuil': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Obsolète': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      case 'Désactivé': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Produits</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez votre catalogue de produits et variez vos stocks.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors opacity-90 hover:opacity-100"
          >
            <Plus className="w-4 h-4" /> Nouveau produit
          </button>
        </div>
      </div>

      {/* Stats Cards =================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Produits */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.total}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total produits</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Catalogue actif</p>
          </div>
        </div>

        {/* En Rupture */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-red-200 dark:hover:border-red-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-800/30 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.enRupture}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">En rupture</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Action requise</p>
          </div>
        </div>

        {/* Sous Seuil */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/30 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.sousSeuil}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Sous seuil</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">À réapprovisionner</p>
          </div>
        </div>

        {/* Disponibles */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.disponibles}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Disponibles</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Prêts à vendre</p>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par référence, nom, marque..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Famille</label>
                <CustomSelect
                  value={familyFilter}
                  onChange={setFamilyFilter}
                  options={[{ value: '', label: 'Toutes les familles' }, ...families.map(f => ({ value: f, label: f }))]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Marque</label>
                <CustomSelect
                  value={brandFilter}
                  onChange={setBrandFilter}
                  options={[{ value: '', label: 'Toutes les marques' }, ...brands.map(b => ({ value: b, label: b }))]}
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
            </div>
            
            <div className="flex flex-wrap gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:checked:bg-indigo-500 transition-colors"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Stock disponible uniquement</span>
              </label>
              {serialNumbersEnabled && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresSnOnly}
                    onChange={(e) => setRequiresSnOnly(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:checked:bg-indigo-500 transition-colors"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Numéro de série obligatoire</span>
                </label>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-3">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {products.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => {
                   setFamilyFilter('');
                   setBrandFilter('');
                   setStatusFilter('');
                   setInStockOnly(false);
                   setRequiresSnOnly(false);
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
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Référence</th>
                <th scope="col" className="w-[25%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produit</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Famille</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Marque</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prix</th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {products.map((product) => (
                <tr 
                  key={product.id} 
                  onClick={() => onSelectProduct(product)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white truncate" title={product.reference}>
                    {product.reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 truncate" title={product.name}>
                    <div className="font-medium truncate">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={product.family}>
                    {product.family}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={product.brand}>
                    {product.brand}
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn(
                      "font-semibold",
                      product.availableStock === 0 ? "text-red-500 dark:text-red-400" : 
                      product.availableStock <= product.minThreshold ? "text-amber-500 dark:text-amber-400" : 
                      "text-slate-900 dark:text-white"
                    )}>
                      {product.availableStock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white text-left truncate">
                    {product.sellingPrice.toFixed(2)} DA
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(product.status))}>
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aucun produit ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
