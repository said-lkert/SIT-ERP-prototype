import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, FileText, Download, Upload, Archive, 
  Image as ImageIcon, FileBox, FileArchive, Plus, Building2, Package, Hash, Tag 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TechDocument, LinkedElementType } from './types';

// Using the provided specific mock data for the panel
const PANEL_MOCK_DATA = {
  format: 'PDF',
  size: '2.4 Mo',
  addedBy: 'Ahmed Benali',
  validatedBy: 'Karim Meziane',
  lastModified: '18/04/2025',
  notes: 'Vérifier compatibilité avec firmware v15.2',
  linkedElements: [
    { type: 'produit' as LinkedElementType, name: 'Cisco SG350-28P' },
    { type: 'client' as LinkedElementType, name: 'Sonatrach Alger' }
  ],
  history: [
    { version: 'v2.1', date: '18/04/2025', author: 'Ahmed Benali', notes: 'Mise à jour après firmware', current: true },
    { version: 'v2.0', date: '02/01/2025', author: 'Karim Meziane', notes: 'Révision complète' },
    { version: 'v1.0', date: '12/03/2024', author: 'Ahmed Benali', notes: 'Version initiale' }
  ]
};

const getFileIcon = (ext: string, className = "w-8 h-8") => {
  switch (ext) {
    case 'pdf': return <FileText className={cn("text-rose-500", className)} />;
    case 'image': return <ImageIcon className={cn("text-blue-500", className)} />;
    case 'word': return <FileBox className={cn("text-blue-600", className)} />;
    case 'excel': return <FileBox className={cn("text-emerald-600", className)} />;
    case 'archive': return <FileArchive className={cn("text-amber-500", className)} />;
    default: return <FileText className={cn("text-slate-500", className)} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Actif': return 'bg-emerald-100 text-emerald-700';
    case 'À vérifier': return 'bg-orange-100 text-orange-700';
    case 'Brouillon': return 'bg-sky-100 text-sky-700';
    case 'Remplacé': return 'bg-rose-100 text-rose-700';
    default: return 'bg-slate-100 text-slate-600'; // Archivé
  }
};

const getLinkedElementIcon = (type: string) => {
  switch (type) {
    case 'produit': return <Package className="w-3.5 h-3.5 mr-1.5" />;
    case 'client': return <Building2 className="w-3.5 h-3.5 mr-1.5" />;
    case 'equipement': return <Package className="w-3.5 h-3.5 mr-1.5" />;
    case 'numero_serie': return <Hash className="w-3.5 h-3.5 mr-1.5" />;
    default: return <Tag className="w-3.5 h-3.5 mr-1.5" />;
  }
};

const getLinkedElementColor = (type: string) => {
  switch (type) {
    case 'produit': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'client': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'equipement': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'numero_serie': return 'bg-purple-100 text-purple-700 border-purple-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

interface DocumentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  document: TechDocument | null;
}

export function DocumentPanel({ isOpen, onClose, document: doc }: DocumentPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Use setTimeout slightly to let animation start so elements are visible for focus
      setTimeout(() => {
        if (panelRef.current) {
          const firstFocusable = panelRef.current.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (firstFocusable) firstFocusable.focus();
        }
      }, 50);
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        if (!panelRef.current) return;
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Si aucun doc, on utilise un mock complet fidèle à la consigne
  const displayDoc = doc || {
    id: 'mock',
    name: "Manuel d'installation Cisco SG350-28P",
    type: "Manuel d'installation",
    fileExt: "pdf",
    version: "v2.1",
    status: "Actif",
    dateAdded: "12/03/2025",
    linkedElement: { type: 'produit', name: 'Cisco SG350-28P' }
  } as TechDocument;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - Click ne ferme PAS le panneau, mais intercepte les clics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.20, ease: "easeIn" } }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[4px] z-50 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Détails du document ${displayDoc.name}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              enter: { duration: 0.28, ease: "easeOut" },
              exit: { duration: 0.22, ease: "easeIn" }
            }}
            className="fixed top-0 right-0 h-screen w-full md:w-[480px] bg-white z-[60] shadow-2xl flex flex-col"
          >
            {/* Header / Zone 1 */}
            <div className="px-6 py-5 border-b border-[#E9ECEF] flex-shrink-0 relative">
              <button 
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-start gap-4 pr-8">
                <div className="w-12 h-12 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  {getFileIcon(displayDoc.fileExt, "w-6 h-6")}
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold text-slate-900 leading-tight mb-2">
                    {displayDoc.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={cn("px-2.5 py-0.5 rounded-[20px] text-[12px] font-medium border border-transparent", getStatusColor(displayDoc.status))}>
                      {displayDoc.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-[20px] text-[12px] font-medium bg-slate-100 text-slate-700 border border-[#E9ECEF]">
                      {displayDoc.type}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500">
                    Ajouté le {displayDoc.dateAdded} par {PANEL_MOCK_DATA.addedBy}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Zone 2 - File Preview */}
              <div className="bg-[#F8F9FA] rounded-[8px] border border-[#E9ECEF] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-[#E9ECEF] rounded-lg flex items-center justify-center shadow-sm">
                    {getFileIcon(displayDoc.fileExt, "w-5 h-5")}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-slate-900 truncate max-w-[180px]">
                      {displayDoc.name}.{displayDoc.fileExt}
                    </p>
                    <p className="text-[12px] text-slate-500">{PANEL_MOCK_DATA.size}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-[13px] font-medium rounded-lg shadow-sm hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                >
                  Ouvrir l'aperçu
                </button>
              </div>

              {/* Zone 3 - Metadata */}
              <div>
                <h3 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.05em] mb-3">Informations générales</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <p className="text-[12px] text-slate-500 mb-1">Version</p>
                    <p className="text-[13px] font-medium text-slate-900">{displayDoc.version}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500 mb-1">Format</p>
                    <p className="text-[13px] font-medium text-slate-900 uppercase">{displayDoc.fileExt}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500 mb-1">Taille</p>
                    <p className="text-[13px] font-medium text-slate-900">{PANEL_MOCK_DATA.size}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500 mb-1">Statut</p>
                    <p className="text-[13px] font-medium text-slate-900">{displayDoc.status}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500 mb-1">Date d'ajout</p>
                    <p className="text-[13px] font-medium text-slate-900">{displayDoc.dateAdded}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500 mb-1">Dernière modification</p>
                    <p className="text-[13px] font-medium text-slate-900">{PANEL_MOCK_DATA.lastModified}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500 mb-1">Ajouté par</p>
                    <p className="text-[13px] font-medium text-slate-900">{PANEL_MOCK_DATA.addedBy}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500 mb-1">Validé par</p>
                    <p className="text-[13px] font-medium text-slate-900">{PANEL_MOCK_DATA.validatedBy}</p>
                  </div>
                  <div className="col-span-2 mt-1">
                    <p className="text-[12px] text-slate-500 mb-1">Notes internes</p>
                    <p className="text-[13px] text-slate-800 bg-[#F8F9FA] border border-[#E9ECEF] p-2.5 rounded-lg">
                      {PANEL_MOCK_DATA.notes}
                    </p>
                  </div>
                </div>
              </div>

              {/* Zone 4 - Linked Elements */}
              <div>
                <h3 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.05em] mb-3">Éléments liés</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PANEL_MOCK_DATA.linkedElements.map((el, i) => (
                    <button 
                      key={i} 
                      className={cn(
                        "flex items-center px-3 py-1.5 rounded-[20px] text-[12px] font-medium border transition-colors hover:shadow-sm hover:opacity-90",
                        getLinkedElementColor(el.type)
                      )}
                    >
                      {getLinkedElementIcon(el.type)}
                      {el.name}
                    </button>
                  ))}
                </div>
                <button className="flex items-center text-[12px] font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1.5 rounded-md transition-colors">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Ajouter un lien
                </button>
              </div>

              {/* Zone 5 - Version History */}
              <div className="pb-4">
                <h3 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.05em] mb-3">Historique des versions</h3>
                <div className="space-y-0 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-[#E9ECEF]">
                  {PANEL_MOCK_DATA.history.map((ver, i) => (
                    <div key={i} className="relative flex gap-4 py-3 group">
                      <div className="relative z-10 w-[23px] flex items-center justify-center flex-shrink-0 bg-white py-1">
                        <div className={cn("w-2 h-2 rounded-full ring-4 ring-white", ver.current ? "bg-indigo-600" : "bg-slate-300 group-hover:bg-slate-400")} />
                      </div>
                      <div className="flex-1 mt-0.5">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[13px] font-medium text-slate-900">
                            {ver.version} <span className="text-slate-300 mx-1">—</span> <span className="text-slate-500 font-normal">{ver.date}</span>
                          </p>
                          <button className="text-[12px] font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
                            Consulter
                          </button>
                        </div>
                        <p className="text-[12px] text-slate-700">
                          {ver.notes} <span className="text-slate-400">par {ver.author}</span>
                          {ver.current && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                              Actuelle
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Actions / Zone 6 */}
            <div className="p-4 bg-white border-t border-[#E9ECEF] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-[13px] font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                  <Download className="w-4 h-4 mr-1.5" />
                  Télécharger
                </button>
                <button className="flex items-center justify-center px-3 py-2 bg-white border border-slate-300 text-slate-700 text-[13px] font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                  <Upload className="w-4 h-4 mr-1.5" />
                  Remplacer le fichier
                </button>
              </div>
              <button className="flex items-center justify-center p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Archiver">
                <Archive className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
          {isPreviewOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md" onMouseDown={() => setIsPreviewOpen(false)}>
              <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <FileText className="h-4 w-4 text-indigo-600" /> Aperçu du document technique
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => window.print()} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Imprimer</button>
                    <button onClick={() => setIsPreviewOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="overflow-y-auto bg-slate-100 p-5">
                  <article className="mx-auto min-h-[720px] max-w-4xl bg-white p-10 text-slate-900 shadow-sm">
                    <header className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
                      <div><div className="text-xl font-bold">SIT-ERP</div><div className="mt-1 text-sm text-slate-500">Solutions IT Algérie</div><div className="text-sm text-slate-500">Bibliothèque documentaire technique</div></div>
                      <div className="text-right"><h2 className="text-2xl font-bold">DOCUMENT TECHNIQUE</h2><div className="mt-2 font-mono text-lg font-semibold text-indigo-700">{displayDoc.version}</div><span className="mt-2 inline-flex rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">{displayDoc.status}</span></div>
                    </header>
                    <section className="border-b border-slate-200 py-8">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">{getFileIcon(displayDoc.fileExt, "w-7 h-7")}</div>
                        <div><h1 className="text-2xl font-bold">{displayDoc.name}</h1><p className="mt-1 text-sm text-slate-500">{displayDoc.type}</p></div>
                      </div>
                    </section>
                    <section className="grid grid-cols-2 gap-8 py-6 text-sm">
                      <div className="space-y-3"><p><strong>Format :</strong> {displayDoc.fileExt.toUpperCase()}</p><p><strong>Version :</strong> {displayDoc.version}</p><p><strong>Taille :</strong> {PANEL_MOCK_DATA.size}</p><p><strong>Date d'ajout :</strong> {displayDoc.dateAdded}</p></div>
                      <div className="space-y-3"><p><strong>Élément lié :</strong> {displayDoc.linkedElement?.name || '-'}</p><p><strong>Ajouté par :</strong> {PANEL_MOCK_DATA.addedBy}</p><p><strong>Validé par :</strong> {PANEL_MOCK_DATA.validatedBy}</p><p><strong>Statut :</strong> {displayDoc.status}</p></div>
                    </section>
                    <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
                      <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Contenu du document</h3>
                      <p className="text-sm leading-7 text-slate-700">Aperçu de démonstration du fichier « {displayDoc.name} ». Ce document regroupe les informations techniques, instructions et références associées à {displayDoc.linkedElement?.name || 'l’élément concerné'}.</p>
                    </section>
                  </article>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
