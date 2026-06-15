import React, { useState, useMemo } from 'react';
import { ArchiveItem, ArchiveFamily, ArchiveStatus } from './types';
import { Search, Globe, Database, Package, Briefcase, Wrench, Shield, Eye, MoreHorizontal, History } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';
import { motion, AnimatePresence } from 'motion/react';

interface ArchivesListProps {
  archives: ArchiveItem[];
  onSelectArchive: (archive: ArchiveItem) => void;
}

export function ArchivesList({ archives: allArchives, onSelectArchive }: ArchivesListProps) {
  const [search, setSearch] = useState('');
  const [activeFamily, setActiveFamily] = useState<ArchiveFamily>('Toutes');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [archivedByFilter, setArchivedByFilter] = useState('');

  const families: { id: ArchiveFamily; label: string; icon: React.ElementType }[] = [
    { id: 'Toutes', label: 'Toutes', icon: Globe },
    { id: 'Référentiel', label: 'Référentiel', icon: Database },
    { id: 'Stock & Logistique', label: 'Stock & Logistique', icon: Package },
    { id: 'Projets & Affaires', label: 'Projets & Affaires', icon: Briefcase },
    { id: 'Parc Client & SAV', label: 'Parc Client & SAV', icon: Wrench },
    { id: 'Administration', label: 'Administration', icon: Shield },
  ];

  const filteredArchives = useMemo(() => {
    return allArchives.filter(a => {
      const matchFamily = activeFamily === 'Toutes' ? true : a.family === activeFamily;
      
      const matchSearch = 
        a.name.toLowerCase().includes(search.toLowerCase()) || 
        a.reference.toLowerCase().includes(search.toLowerCase()) ||
        a.reason.toLowerCase().includes(search.toLowerCase()) ||
        a.module.toLowerCase().includes(search.toLowerCase());
      
      const matchType = typeFilter ? a.type === typeFilter : true;
      const matchStatus = statusFilter ? a.status === statusFilter : true;
      const matchBy = archivedByFilter ? a.archivedBy === archivedByFilter : true;

      return matchFamily && matchSearch && matchType && matchStatus && matchBy;
    });
  }, [allArchives, activeFamily, search, typeFilter, statusFilter, archivedByFilter]);

  const activeFiltersCount = [typeFilter, statusFilter, archivedByFilter].filter(Boolean).length;

  const currentFamilyArchives = useMemo(() => 
    activeFamily === 'Toutes' ? allArchives : allArchives.filter(a => a.family === activeFamily),
  [allArchives, activeFamily]);

  const availableTypes = useMemo(() => Array.from(new Set(currentFamilyArchives.map(a => a.type))), [currentFamilyArchives]);
  const availableStatuses = useMemo(() => Array.from(new Set(currentFamilyArchives.map(a => a.status))), [currentFamilyArchives]);
  const availableUsers = useMemo(() => Array.from(new Set(currentFamilyArchives.map(a => a.archivedBy))), [currentFamilyArchives]);

  const stats = useMemo(() => {
    return {
      total: allArchives.length,
      ref: allArchives.filter(a => a.family === 'Référentiel').length,
      stock: allArchives.filter(a => a.family === 'Stock & Logistique').length,
      projets: allArchives.filter(a => a.family === 'Projets & Affaires').length,
      sav: allArchives.filter(a => a.family === 'Parc Client & SAV').length,
      admin: allArchives.filter(a => a.family === 'Administration').length,
    };
  }, [allArchives]);

  const getStatusColor = (status: ArchiveStatus) => {
    switch(status) {
      case 'Restaurable': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Conservation obligatoire': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'Lecture seule': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Archivé': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }).format(new Date(dateString));
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Archives</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Consultez, recherchez et restaurez les éléments désactivés ou clôturés.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Globe className="w-4 h-4" /> Exporter
          </button>
        </div>
      </div>

      {/* Stats Cards =================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider truncate">Total Archivés</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.total}</div>
        </div>
        
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider truncate">Référentiel</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.ref}</div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider truncate">Logistique</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.stock}</div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider truncate">Projets</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.projets}</div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider truncate">Parc & SAV</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.sav}</div>
        </div>

        <div className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800/50 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider truncate">Administration</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.admin}</div>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col">
        {/* Horizontal Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 px-4 flex overflow-x-auto no-scrollbar shrink-0">
          {families.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveFamily(cat.id);
                setTypeFilter('');
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeFamily === cat.id
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              <cat.icon className="w-4 h-4 shrink-0" />
              {cat.label}
            </button>
          ))}
        </div>

        <ModuleSearchFilters
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder={`Rechercher dans ${activeFamily === 'Toutes' ? 'les archives' : activeFamily.toLowerCase()}...`}
          activeFiltersCount={activeFiltersCount}
          advancedFilters={
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Type d'élément</label>
                  <CustomSelect
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={[{ value: '', label: 'Tous les types' }, ...availableTypes.map(t => ({ value: t, label: t }))]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Statut</label>
                  <CustomSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[{ value: '', label: 'Tous les statuts' }, ...availableStatuses.map(s => ({ value: s, label: s }))]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Archivé par</label>
                  <CustomSelect
                    value={archivedByFilter}
                    onChange={setArchivedByFilter}
                    options={[{ value: '', label: 'Tous utilisateurs' }, ...availableUsers.map(u => ({ value: u, label: u }))]}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    {filteredArchives.length} archive(s) trouvée(s)
                </div>
                <button 
                  onClick={() => {
                    setTypeFilter('');
                    setStatusFilter('');
                    setArchivedByFilter('');
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
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full min-w-[1000px] table-fixed divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Élément</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Référence</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Module d'origine</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Utilisateur</th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Motif</th>
                <th scope="col" className="w-[14%] px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredArchives.map((archive) => (
                <tr 
                  key={archive.id} 
                  onClick={() => onSelectArchive(archive)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white truncate" title={archive.name}>
                    {archive.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400 truncate" title={archive.reference}>
                    {archive.reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={archive.type}>
                    {archive.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-medium">
                      {archive.module}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm truncate">
                    <div className="text-slate-900 dark:text-white font-medium">{formatDate(archive.archivedAt)}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">par {archive.archivedBy}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate" title={archive.reason}>
                    {archive.reason}
                  </td>
                  <td className="px-6 py-4 text-sm text-left truncate">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border", getStatusColor(archive.status))}>
                      {archive.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredArchives.length === 0 && (
                <tr className="hover:bg-transparent">
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <History className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-medium">Aucun élément archivé trouvé.</p>
                      <p className="text-xs mt-1">Les éléments archivés depuis les différents modules apparaîtront ici.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
