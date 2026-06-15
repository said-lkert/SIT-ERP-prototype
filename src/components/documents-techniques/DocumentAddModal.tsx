import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, UploadCloud, File, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useModules } from '../../contexts/ModuleContext';

interface DocumentAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const STATUS_OPTIONS = ["Brouillon", "Actif", "À vérifier"];

const MOCK_PRODUITS = ["Cisco SG350-28P", "Hikvision DS-2CD2143", "HP ProBook 450", "Ubiquiti UniFi AP", "Mikrotik RB750Gr3"];
const MOCK_SERVICES = ["Installation réseau", "Maintenance préventive", "Configuration système", "Formation utilisateur"];
const MOCK_SN = ["SN-CSC-00123", "SN-HKV-00456", "SN-HPP-00789"];
const MOCK_EQUIPEMENTS = ["EQ-00189 — AP UniFi Bureau 3 — Sonatrach", "EQ-00234 — Switch Cisco Salle Serveur — Cevital", "EQ-00301 — NVR Hikvision RDC — Air Algérie"];
const MOCK_CLIENTS = ["Sonatrach Alger", "Cevital Bejaia", "Air Algérie Siège", "Sonelgaz Oran", "Naftal Constantine"];
const SUGGESTED_TAGS = ["CCTV", "Réseau", "Fibre", "VPN", "WiFi", "Configuration", "Garantie", "Installation", "SAV"];

// Custom select component to strictly match the requested styling
function FormSelect({ label, options, value, onChange, placeholder, required, error }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
      {label && (
        <label className="text-[13px] font-semibold text-[#374151]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-[13px] text-left bg-[#F9FAFB] border rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
          isOpen ? "border-indigo-400 focus:ring-indigo-500" : "border-[#E5E7EB]",
          error ? "border-rose-400 focus:ring-rose-500/50" : "",
          !value ? "text-slate-400" : "text-slate-800"
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <svg className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-slate-200 rounded-[8px] shadow-lg overflow-hidden py-1"
          >
            <div className="max-h-52 overflow-y-auto">
              {options.map((opt: string) => (
                <button
                  key={opt}
                  type="button"
                  className={cn(
                    "w-full flex items-center px-3 py-2 text-[13px] text-left transition-colors",
                    value === opt ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700 hover:bg-slate-50"
                  )}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                >
                  <span className="truncate">{opt}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DocumentAddModal({ isOpen, onClose, onAdded }: DocumentAddModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { isModuleEnabled } = useModules();

  const DOCUMENT_TYPES = useMemo(() => {
    const list = [
      "Fiche technique", "Manuel d'installation", "Manuel utilisateur",
      "Guide de configuration", "Procédure interne", "Schéma de câblage", "Plan réseau",
      "Plan d'implantation", "Photo produit", "Photo installation", "Certificat de conformité",
      "Certificat de garantie", "Fichier de licence", "Document fournisseur", "Document client"
    ];
    if (isModuleEnabled('services')) {
      return [...list, "Rapport d'intervention", "PV d'installation", "Bon de mise en service"];
    }
    return list;
  }, [isModuleEnabled]);
  
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [version, setVersion] = useState('');
  const [status, setStatus] = useState('Brouillon');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  
  const [produitLie, setProduitLie] = useState('');
  const [serviceLie, setServiceLie] = useState('');
  const [snLie, setSnLie] = useState('');
  const [equipementLie, setEquipementLie] = useState('');
  const [clientLie, setClientLie] = useState('');
  
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setName('');
      setType('');
      setVersion('');
      setStatus('Brouillon');
      setDescription('');
      setNotes('');
      setFile(null);
      setFileError('');
      setProduitLie('');
      setServiceLie('');
      setSnLie('');
      setEquipementLie('');
      setClientLie('');
      setTags([]);
      setTagInput('');
      setShowErrors(false);
      setIsSubmitting(false);
      
      // Auto focus
      setTimeout(() => {
        const firstInput = modalRef.current?.querySelector('input[type="text"]');
        if (firstInput) (firstInput as HTMLElement).focus();
      }, 50);
    }
  }, [isOpen]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (!selectedFile) return;
    
    // Simulate > 50 Mo error (50 * 1024 * 1024 = 52428800)
    if (selectedFile.size > 52428800) {
      setFileError('Le fichier dépasse la taille maximale autorisée (50 Mo).');
      setFile(null);
    } else {
      setFileError('');
      setFile(selectedFile);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = () => {
    setShowErrors(true);
    
    if (!name || !type || !file || fileError) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onAdded();
      onClose();
    }, 1500);
  };

  const isValid = name.trim() !== '' && type !== '' && file !== null && !fileError;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay that does NOT close modal on click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[4px] z-[999] pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); }}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-[640px] max-h-[calc(100vh-2rem)] bg-white rounded-[12px] shadow-2xl flex flex-col pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Ajouter un document</h2>
                  <p className="text-[13px] text-slate-500 mt-0.5">Remplissez les informations du document à ajouter à la bibliothèque</p>
                </div>
                <button 
                  onClick={() => !isSubmitting && onClose()}
                  disabled={isSubmitting}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Internal scrollable body */}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                
                {/* 2 columns layout for main info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  
                  {/* Left Col */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-[#374151]">Nom du document <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex : Manuel Cisco SG350"
                        className={cn(
                          "w-full px-3 py-2 text-[13px] bg-[#F9FAFB] border rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                          showErrors && !name ? "border-rose-400 focus:ring-rose-500/50" : "border-[#E5E7EB] focus:border-indigo-400"
                        )}
                      />
                      {showErrors && !name && <span className="text-rose-500 text-xs text-left">Le nom est obligatoire</span>}
                    </div>

                    <FormSelect 
                      label="Type de document" 
                      options={DOCUMENT_TYPES} 
                      value={type} 
                      onChange={setType} 
                      placeholder="Sélectionner..." 
                      required 
                      error={showErrors && !type}
                    />
                    {showErrors && !type && <span className="text-rose-500 text-xs text-left -mt-2.5">Le type est obligatoire</span>}

                    <div className="flex gap-4">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-[13px] font-semibold text-[#374151]">Version</label>
                        <input 
                          type="text" 
                          value={version}
                          onChange={(e) => setVersion(e.target.value)}
                          placeholder="Ex : v1.0"
                          className="w-full px-3 py-2 text-[13px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-colors"
                        />
                      </div>
                      <div className="flex-1">
                        <FormSelect 
                          label="Statut" 
                          options={STATUS_OPTIONS} 
                          value={status} 
                          onChange={setStatus} 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-[#374151]">Description courte</label>
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Décrivez brièvement ce document..."
                        rows={3}
                        className="w-full px-3 py-2 text-[13px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {/* Right Col */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-[#374151]">Fichier <span className="text-rose-500">*</span></label>
                      
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        className={cn(
                          "relative w-full h-[140px] bg-[#F8F9FA] border-2 border-dashed rounded-[10px] flex flex-col items-center justify-center p-4 transition-colors group",
                          showErrors && !file && !fileError ? "border-rose-300 bg-rose-50/50" : fileError ? "border-rose-400 bg-rose-50" : "border-[#D1D5DB] hover:bg-slate-50 hover:border-indigo-300",
                          file && !fileError ? "border-indigo-200 bg-indigo-50/30" : ""
                        )}
                      >
                        <input 
                          type="file" 
                          onChange={handleFileSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label="Upload file"
                        />
                        
                        {!file && !fileError && (
                          <div className="flex flex-col items-center text-center pointer-events-none">
                            <UploadCloud className="w-8 h-8 text-slate-400 mb-2 group-hover:text-indigo-400 transition-colors" />
                            <p className="text-[13px] text-slate-600 font-medium">Glissez votre fichier ici ou cliquez pour parcourir</p>
                            <p className="text-xs text-slate-400 mt-1">PDF, Word, Excel, Image, Archive</p>
                          </div>
                        )}

                        {file && !fileError && (
                          <div className="flex flex-col items-center text-center pointer-events-none w-full px-2">
                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center mb-2">
                              <File className="w-5 h-5 text-indigo-500" />
                            </div>
                            <p className="text-[13px] text-slate-700 font-medium truncate w-full px-2">{file.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
                            
                            <button 
                              onClick={(e) => { e.stopPropagation(); e.preventDefault(); setFile(null); }}
                              className="absolute top-2 right-2 p-1 bg-white rounded-md text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 pointer-events-auto transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {fileError && (
                          <div className="flex flex-col items-center text-center px-4 w-full">
                            <AlertCircle className="w-6 h-6 text-rose-500 mb-1" />
                            <p className="text-[12px] font-medium text-rose-600">{fileError}</p>
                            <button 
                              onClick={(e) => { e.stopPropagation(); e.preventDefault(); setFileError(''); }}
                              className="mt-2 text-xs text-slate-500 hover:text-slate-700 underline pointer-events-auto"
                            >
                              Réessayer
                            </button>
                          </div>
                        )}
                      </div>
                      {showErrors && !file && !fileError && <span className="text-rose-500 text-xs text-left">Un fichier est requis</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-[#374151]">Notes internes</label>
                      <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes visibles uniquement en interne..."
                        rows={3}
                        className="w-full px-3 py-2 text-[13px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100 mb-6" />

                {/* Section Liaisons */}
                <div className="mb-6">
                  <h3 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.05em] mb-4">Lier ce document à</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <FormSelect 
                      label="Produit lié" 
                      options={MOCK_PRODUITS} 
                      value={produitLie} 
                      onChange={setProduitLie} 
                      placeholder="Aucun" 
                    />
                    {isModuleEnabled('services') && (
                      <FormSelect 
                        label="Service lié" 
                        options={MOCK_SERVICES} 
                        value={serviceLie} 
                        onChange={setServiceLie} 
                        placeholder="Aucun" 
                      />
                    )}
                    <FormSelect 
                      label="Numéro de série" 
                      options={MOCK_SN} 
                      value={snLie} 
                      onChange={setSnLie} 
                      placeholder="Aucun" 
                    />
                    <FormSelect 
                      label="Équipement installé" 
                      options={MOCK_EQUIPEMENTS} 
                      value={equipementLie} 
                      onChange={setEquipementLie} 
                      placeholder="Aucun" 
                    />
                  </div>
                  
                  <FormSelect 
                    label="Client / Site lié" 
                    options={MOCK_CLIENTS} 
                    value={clientLie} 
                    onChange={setClientLie} 
                    placeholder="Sélectionner un site concerné..." 
                  />
                </div>

                {/* Section Tags */}
                <div>
                  <h3 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.05em] mb-3">Tags techniques</h3>
                  
                  <div className="flex flex-col gap-3 mt-1">
                    <div className="flex items-center flex-wrap gap-2 min-h-[38px] p-1.5 w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-400 transition-colors">
                      {tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-200">
                          {tag}
                          <button 
                            onClick={() => removeTag(tag)}
                            className="ml-1.5 p-0.5 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder={tags.length === 0 ? "Tapez un tag et Entrée..." : ""}
                        className="flex-1 min-w-[120px] bg-transparent text-[13px] px-1 text-slate-700 focus:outline-none placeholder-slate-400"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_TAGS.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addSuggestedTag(tag)}
                          disabled={tags.includes(tag)}
                          className={cn(
                            "px-2 py-1 rounded-md text-[11px] font-medium border transition-colors",
                            tags.includes(tag) 
                              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                          )}
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-transparent border border-[#E5E7EB] rounded-[8px] hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 text-[13px] font-medium text-white rounded-[8px] transition-all focus:outline-none",
                    isValid && !isSubmitting 
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-sm" 
                      : "bg-indigo-400 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    "Ajouter le document"
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
