import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  X, 
  FileText, 
  Image as ImageIcon, 
  FileBox, 
  FileArchive, 
  Eye, 
  Download, 
  MoreHorizontal,
  Upload,
  Plus
} from 'lucide-react';
import { MOCK_DOCUMENTS, MOCK_PRODUCTS, MOCK_CLIENTS, MOCK_TYPES, MOCK_ALERTS } from './mockData';
import { TechDocument, DocumentAlert } from './types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentPanel } from './DocumentPanel';
import { DocumentAddModal } from './DocumentAddModal';
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';

// Custom Dropdown Component
function CustomDropdown({ 
  label, 
  options, 
  value, 
  onChange 
}: { 
  label: string; 
  options: string[]; 
  value: string; 
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-56 px-3 py-2 text-sm bg-white dark:bg-slate-800 border rounded-lg shadow-sm transition-colors",
          value ? "border-indigo-300 text-slate-900 dark:border-indigo-500/50 dark:text-white" : "border-slate-300 text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
        )}
      >
        <span className="truncate">{value || label}</span>
        {value ? (
          <div 
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="p-1 -mr-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors dark:hover:bg-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </div>
        ) : (
          <ChevronDown className="w-4 h-4 opacity-50" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto w-full py-1">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => { onChange(option); setIsOpen(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm transition-colors",
                    value === option ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/30 dark:text-indigo-400" : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Alert Band
function AlertBand({ alerts, onAction }: { alerts: DocumentAlert[], onAction: (alertId: string) => void }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="w-full flex items-center gap-3 px-4 py-2.5 mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-sm overflow-x-auto hide-scrollbar">
      {alerts.map((alert, index) => {
        const colorClass = 
          alert.type === 'warning' ? 'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' :
          alert.type === 'error' ? 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' :
          'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';

        return (
          <React.Fragment key={alert.id}>
            <div className={cn("flex items-center px-2 py-1 rounded border", colorClass, "whitespace-nowrap")}>
              <span className="mr-2">{alert.message}</span>
              <button 
                onClick={() => onAction(alert.id)}
                className="font-medium hover:underline opacity-90"
              >
                — Voir
              </button>
            </div>
            {index < alerts.length - 1 && (
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const getFileIcon = (ext: string) => {
  switch (ext) {
    case 'pdf': return <FileText className="w-4 h-4 text-rose-500" />;
    case 'image': return <ImageIcon className="w-4 h-4 text-blue-500" />;
    case 'word': return <FileBox className="w-4 h-4 text-blue-600" />;
    case 'excel': return <FileBox className="w-4 h-4 text-emerald-600" />;
    case 'archive': return <FileArchive className="w-4 h-4 text-amber-500" />;
    default: return <FileText className="w-4 h-4 text-slate-500" />;
  }
};

const getLinkedElementColor = (type: string) => {
  switch (type) {
    case 'produit': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
    case 'client': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
    case 'equipement': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800';
    case 'numero_serie': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
    default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Actif': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'À vérifier': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
    case 'Brouillon': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800';
    case 'Remplacé': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'; // Archivé
  }
};

export function DocumentsList() {
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeAlertFilter, setActiveAlertFilter] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeFiltersCount = [productFilter, clientFilter, typeFilter].filter(Boolean).length;

  // Filter Logic
  const filteredDocs = MOCK_DOCUMENTS.filter(doc => {
    // Alert filters take precedence if mapped (mocking behavior)
    if (activeAlertFilter === 'alert-1' && doc.status !== 'À vérifier') return false;
    if (activeAlertFilter === 'alert-2' && doc.linkedElement.type !== 'aucun') return false;
    if (activeAlertFilter === 'alert-3' && doc.type !== 'PV d\'installation') return false;

    if (search && !doc.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (productFilter && doc.linkedElement.name !== productFilter) return false;
    if (clientFilter && doc.linkedElement.name !== clientFilter) return false;
    if (typeFilter && doc.type !== typeFilter) return false;

    return true;
  });

  const handleAlertAction = (alertId: string) => {
    setActiveAlertFilter(prev => prev === alertId ? null : alertId);
  };

  const handleRowClick = (docId: string) => {
    setSelectedDocId(docId);
  };

  const selectedDoc = MOCK_DOCUMENTS.find(d => d.id === selectedDocId) || null;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Documents techniques</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez votre bibliothèque de fichiers techniques et manuels.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors opacity-90 hover:opacity-100"
          >
            <Plus className="w-4 h-4" /> Ajouter un document
          </button>
        </div>
      </div>

      {/* Alerts Band */}
      <AlertBand alerts={MOCK_ALERTS} onAction={handleAlertAction} />

      <ModuleSearchFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un document..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Chercher par produit</label>
                <div className="h-10">
                <CustomDropdown 
                  label="Tous les produits" 
                  options={MOCK_PRODUCTS} 
                  value={productFilter} 
                  onChange={setProductFilter} 
                />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Type de document</label>
                <div className="h-10">
                <CustomDropdown 
                  label="Tous les types" 
                  options={MOCK_TYPES} 
                  value={typeFilter === 'Tous' ? '' : typeFilter} 
                  onChange={(val) => setTypeFilter(val === '' ? 'Tous' : val)} 
                />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredDocs.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => {
                   setProductFilter('');
                   setTypeFilter('Tous');
                   setClientFilter('');
                 }}
                 className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
               >
                 Réinitialiser les filtres
               </button>
            </div>
          </div>
        }
      />

      {/* Main Table */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[280px]">Nom du document</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[160px]">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[180px]">Élément lié</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap w-[100px] hidden sm:table-cell">Version</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap w-[120px]">Statut</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap w-[120px] hidden md:table-cell">Date d'ajout</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {filteredDocs.map((doc) => (
                <tr 
                  key={doc.id} 
                  onClick={() => handleRowClick(doc.id)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="opacity-80">
                        {getFileIcon(doc.fileExt)}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {doc.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    <span className="inline-flex items-center px-2 py-1 rounded-[6px] text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    <span className={cn("inline-flex items-center px-2 py-1 rounded-[6px] text-xs font-medium", getLinkedElementColor(doc.linkedElement.type))}>
                      {doc.linkedElement.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white hidden sm:table-cell">
                    {doc.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(doc.status))}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
                    {doc.dateAdded}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <button 
                        className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        onClick={(e) => { e.stopPropagation(); console.log('Prévisualiser:', doc.id); }}
                        title="Prévisualiser"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors hidden sm:block"
                        onClick={(e) => { e.stopPropagation(); console.log('Télécharger:', doc.id); }}
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        onClick={(e) => { e.stopPropagation(); console.log('Plus:', doc.id); }}
                        title="Plus d'actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    Aucun document technique ne correspond à vos critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DocumentPanel 
        isOpen={selectedDocId !== null} 
        onClose={() => setSelectedDocId(null)} 
        document={selectedDoc} 
      />

      <DocumentAddModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={() => {
          setIsAddModalOpen(false);
          // In a real app we'd dispatch an update here.
          console.log("Document ajouté !");
        }}
      />
    </div>
  );
}
