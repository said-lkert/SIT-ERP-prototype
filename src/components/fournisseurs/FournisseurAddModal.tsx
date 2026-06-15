import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Fournisseur } from './types';
import { X, Check, FileText, Plus, Trash2, AlertCircle, FilePlus, Globe, Mail, Phone, Calendar, CreditCard, Building, ShieldCheck, MapPin, Link as LinkIcon, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { useModules } from '../../contexts/ModuleContext';

interface FournisseurAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newFournisseur: Fournisseur) => void;
}

const STATUS_OPTIONS = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'archive', label: 'Archivé' },
];

const PAYMENT_OPTIONS = [
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'chèque', label: 'Chèque' },
  { value: 'espèces', label: 'Espèces' },
  { value: 'paiement à réception', label: 'Paiement à réception' },
];

const CURRENCY_OPTIONS = [
  { value: 'DZD', label: 'DZD (Dinar Algérien)' },
  { value: 'EUR', label: 'EUR (Euro)' },
  { value: 'USD', label: 'USD (Dollar AM)' },
];

const FAMILY_OPTIONS = [
  'CCTV',
  'Réseau',
  'Onduleurs',
  'Serveurs',
  'Contrôle d’accès',
  'Fibre optique',
  'Consommables'
];

const BRAND_OPTIONS = [
  'Hikvision',
  'Dahua',
  'TP-Link',
  'MikroTik',
  'APC',
  'Dell',
  'ZKTeco'
];

const DEMO_PRODUCTS = [
  { id: 'p1', name: 'DS-2CD2143G0 Camera Dome 4MP' },
  { id: 'p2', name: 'Switch PoE Managed 24p TP-Link' },
  { id: 'p3', name: 'Smart-UPS 1500VA APC' },
  { id: 'p4', name: 'Routeur CCR2004 MikroTik' },
  { id: 'p5', name: 'PowerEdge T350 Xeon Server' },
  { id: 'p6', name: 'K40 Lecteur Empreintes ZKTeco' },
  { id: 'p7', name: 'Bobine Fibre Monomode 300m' }
];

const EXEMPLES_DOCUMENTS = [
  { name: 'Contrat fournisseur annuel', type: 'PDF', size: '1.4 MB' },
  { name: 'Grille tarifaire CCTV & Réseau', type: 'XLSX', size: '540 KB' },
  { name: 'Catalogue général de produits', type: 'PDF', size: '3.1 MB' },
  { name: 'Conditions commerciales de règlement', type: 'DOCX', size: '120 KB' },
  { name: 'Certificat de partenariat constructeur', type: 'PDF', size: '780 KB' },
  { name: 'RIB bancaire officiel', type: 'PDF', size: '140 KB' },
  { name: 'Facture type d\'exemple', type: 'PDF', size: '210 KB' },
  { name: 'Bon de livraison exemple type', type: 'PDF', size: '190 KB' }
];

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
}

export function FournisseurAddModal({ isOpen, onClose, onSave }: FournisseurAddModalProps) {
  const { isModuleEnabled } = useModules();
  
  const TYPE_OPTIONS = [
    { value: 'distributeur', label: 'Distributeur' },
    { value: 'constructeur', label: 'Constructeur' },
    { value: 'grossiste', label: 'Grossiste' },
    { value: 'revendeur', label: 'Revendeur' },
    { value: 'filiale', label: 'Filiale' },
    { value: 'matériel', label: 'Matériel' },
    { value: 'logiciel', label: 'Logiciel' },
    ...(isModuleEnabled('services') ? [{ value: 'service', label: 'Service' }] : []),
  ];
  // Input fields state
  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [type, setType] = useState('distributeur');
  const [statut, setStatut] = useState('actif');
  const [pays, setPays] = useState('Algérie');
  const [ville, setVille] = useState('');
  const [adresse, setAdresse] = useState('');

  // Section 2: Contact
  const [nomContact, setNomContact] = useState('');
  const [fonction, setFonction] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [siteWeb, setSiteWeb] = useState('');

  // Section 3: Conditions commerciales
  const [delaiLivraison, setDelaiLivraison] = useState('5 jours');
  const [modePaiement, setModePaiement] = useState('virement');
  const [devise, setDevise] = useState('DZD');
  const [remiseMoyenne, setRemiseMoyenne] = useState('5%');
  const [garantieDefaut, setGarantieDefaut] = useState('12 mois');
  const [notesCommerciales, setNotesCommerciales] = useState('');

  // Section 4: Produits & familles
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]); // demo associated products IDs

  // Section 5: Documents
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [nextDocIndex, setNextDocIndex] = useState(0);

  // Errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Closing confirmation state
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Reset fields upon opening
  useEffect(() => {
    if (isOpen) {
      setName('');
      setReference('FRN-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + new Date().getFullYear());
      setType('distributeur');
      setStatut('actif');
      setPays('Algérie');
      setVille('');
      setAdresse('');
      setNomContact('');
      setFonction('');
      setTelephone('');
      setEmail('');
      setSiteWeb('');
      setDelaiLivraison('5 jours');
      setModePaiement('virement');
      setDevise('DZD');
      setRemiseMoyenne('5%');
      setGarantieDefaut('12 mois');
      setNotesCommerciales('');
      setSelectedFamilies([]);
      setSelectedBrands([]);
      setSelectedProducts([]);
      setDocuments([]);
      setNextDocIndex(0);
      setErrors({});
      setShowConfirmClose(false);
    }
  }, [isOpen]);

  // Check if any fields have custom user input
  const isFormDirty = () => {
    return (
      name.trim() !== '' ||
      ville.trim() !== '' ||
      adresse.trim() !== '' ||
      nomContact.trim() !== '' ||
      fonction.trim() !== '' ||
      telephone.trim() !== '' ||
      email.trim() !== '' ||
      siteWeb.trim() !== '' ||
      notesCommerciales.trim() !== '' ||
      selectedFamilies.length > 0 ||
      selectedBrands.length > 0 ||
      selectedProducts.length > 0 ||
      documents.length > 0
    );
  };

  // Safe handler for closing
  const handleCloseAttempt = () => {
    if (isFormDirty()) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  // Add simulated document
  const handleAddDocument = () => {
    const template = EXEMPLES_DOCUMENTS[nextDocIndex % EXEMPLES_DOCUMENTS.length];
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: template.name,
      type: template.type,
      size: template.size
    };
    setDocuments(prev => [...prev, newDoc]);
    setNextDocIndex(prev => prev + 1);
  };

  // Remove simulated document
  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Toggles families, brands, products selection
  const toggleFamily = (fam: string) => {
    setSelectedFamilies(prev => 
      prev.includes(fam) ? prev.filter(f => f !== fam) : [...prev, fam]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleProduct = (prodId: string) => {
    setSelectedProducts(prev => 
      prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]
    );
  };

  // Validate fields
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Le nom du fournisseur est obligatoire';
    if (!reference.trim()) newErrors.reference = 'La référence fournisseur est obligatoire';
    if (!type) newErrors.type = 'Le type de fournisseur est obligatoire';
    
    // Contact email or telephone must be provided
    if (!email.trim() && !telephone.trim()) {
      newErrors.contact = 'Au moins un moyen de contact (Email ou Téléphone) est requis';
    }

    // Individual format validations if filled
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Format email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      const displayType = TYPE_OPTIONS.find(o => o.value === type)?.label || type;
      const formattedPayment = PAYMENT_OPTIONS.find(o => o.value === modePaiement)?.label || modePaiement;
      
      const newFournisseur: Fournisseur = {
        id: `f-${Math.random().toString(36).substring(2, 9)}`,
        name,
        reference,
        type: displayType,
        contactPrincipale: nomContact || 'Non spécifié',
        telephone: telephone || '-',
        email: email || '-',
        produitsAssocies: selectedProducts.length || Math.floor(Math.random() * 20),
        derniereLivraison: new Date().toISOString().split('T')[0],
        statut: statut as 'actif' | 'inactif' | 'archive',
        tauxConformite: 100, // New supplier starting fresh
        commandesAttente: 0,
        pays: pays || 'Algérie',
        delaiMoyenLivraison: delaiLivraison,
        modePaiement: `${formattedPayment} (${devise})`,
        receptions: []
      };

      onSave(newFournisseur);
      onClose();
    }
  };

  // Helper for document icon
  const getDocColorClass = (typeStr: string) => {
    switch (typeStr.toUpperCase()) {
      case 'PDF':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20';
      case 'XLSX':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
      case 'DOCX':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-slate-600 bg-slate-100 dark:bg-slate-800';
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 overflow-hidden">
          {/* Main Backdrop with full blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-md"
            onClick={handleCloseAttempt}
          />

          {/* Form Dialog Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-700 dark:text-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-500" />
                  Nouveau fournisseur
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Créer une fiche fournisseur et préparer ses informations d’achat.
                </p>
              </div>
              <button 
                onClick={handleCloseAttempt}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-amber-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                id="add-supplier-close-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom error banner if validator failed contact options */}
            {errors.contact && (
              <div className="px-6 py-3 bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2.5 shrink-0 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">{errors.contact}</p>
              </div>
            )}

            {/* Form Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* SECTION 1: Informations Générales */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">1. Informations générales</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Nom fournisseur */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Nom du fournisseur <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => {
                        setName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                      }}
                      placeholder="Ex: Hikvision Algérie"
                      className={cn(
                        "w-full px-3 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white",
                        errors.name ? "border-red-300 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                      )}
                    />
                    {errors.name && <p className="text-red-500 text-[10.5px] uppercase font-bold mt-1 ml-1">{errors.name}</p>}
                  </div>

                  {/* Référence fournisseur */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Référence <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={reference}
                      onChange={e => {
                        setReference(e.target.value);
                        if (errors.reference) setErrors(prev => ({ ...prev, reference: undefined }));
                      }}
                      placeholder="FRN-HIK-2026"
                      className={cn(
                        "w-full px-3 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white font-mono",
                        errors.reference ? "border-red-300 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                      )}
                    />
                    {errors.reference && <p className="text-red-500 text-[10.5px] uppercase font-bold mt-1 ml-1">{errors.reference}</p>}
                  </div>

                  {/* Type fournisseur */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Type de fournisseur <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect 
                      value={type}
                      onChange={v => {
                        setType(v);
                        if (errors.type) setErrors(prev => ({ ...prev, type: undefined }));
                      }}
                      options={TYPE_OPTIONS}
                      className="w-full"
                    />
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Statut d'activité
                    </label>
                    <CustomSelect 
                      value={statut}
                      onChange={setStatut}
                      options={STATUS_OPTIONS}
                      className="w-full"
                    />
                  </div>

                  {/* Pays */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Pays
                    </label>
                    <input 
                      type="text" 
                      value={pays}
                      onChange={e => setPays(e.target.value)}
                      placeholder="Algérie"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Ville */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Ville
                    </label>
                    <input 
                      type="text" 
                      value={ville}
                      onChange={e => setVille(e.target.value)}
                      placeholder="Alger"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Adresse complète */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Adresse complète
                    </label>
                    <input 
                      type="text" 
                      value={adresse}
                      onChange={e => setAdresse(e.target.value)}
                      placeholder="12 Ruelle des Jardins, Hydra"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 2: Contact Principal */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">2. Contact principal</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Nom du contact */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Nom complet
                    </label>
                    <input 
                      type="text" 
                      value={nomContact}
                      onChange={e => setNomContact(e.target.value)}
                      placeholder="Mina Chérif"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Fonction du contact */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Fonction
                    </label>
                    <input 
                      type="text" 
                      value={fonction}
                      onChange={e => setFonction(e.target.value)}
                      placeholder="Directrice Commerciale"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Téléphone {errors.contact && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="tel" 
                        value={telephone}
                        onChange={e => {
                          setTelephone(e.target.value);
                          if (errors.contact) setErrors(prev => ({ ...prev, contact: undefined }));
                        }}
                        placeholder="+213 550 11 22 33"
                        className={cn(
                          "w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white",
                          errors.contact ? "border-amber-400/80 focus:ring-amber-500/10" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                        )}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Adresse Email {errors.contact && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (e.target.value.trim() && errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                          if (errors.contact) setErrors(prev => ({ ...prev, contact: undefined }));
                        }}
                        placeholder="m.cherif@hikvision.dz"
                        className={cn(
                          "w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white",
                          errors.email || errors.contact ? "border-amber-400/80 focus:ring-amber-500/10" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                        )}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-[10px] uppercase font-bold mt-1 ml-1">{errors.email}</p>}
                  </div>

                  {/* Site web */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Site Web
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="url" 
                        value={siteWeb}
                        onChange={e => setSiteWeb(e.target.value)}
                        placeholder="www.hikvision.dz"
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: Conditions Commerciales */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">3. Conditions commerciales</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm col-span-3">
                  {/* Délai moyen de livraison */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Délai de livraison
                    </label>
                    <input 
                      type="text" 
                      value={delaiLivraison}
                      onChange={e => setDelaiLivraison(e.target.value)}
                      placeholder="Ex: 5 jours, 10 jours"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Mode de paiement */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Mode de paiement
                    </label>
                    <CustomSelect 
                      value={modePaiement}
                      onChange={setModePaiement}
                      options={PAYMENT_OPTIONS}
                      className="w-full"
                    />
                  </div>

                  {/* Devise */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Devise d'achat
                    </label>
                    <CustomSelect 
                      value={devise}
                      onChange={setDevise}
                      options={CURRENCY_OPTIONS}
                      className="w-full"
                    />
                  </div>

                  {/* Remise moyenne */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Remise standard
                    </label>
                    <input 
                      type="text" 
                      value={remiseMoyenne}
                      onChange={e => setRemiseMoyenne(e.target.value)}
                      placeholder="Ex: 10%, 15%"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Garantie par défaut */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Garantie par défaut
                    </label>
                    <input 
                      type="text" 
                      value={garantieDefaut}
                      onChange={e => setGarantieDefaut(e.target.value)}
                      placeholder="Ex: 12 mois, 24 mois"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Free notes */}
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Notes Commerciales & Accords
                    </label>
                    <textarea 
                      value={notesCommerciales}
                      onChange={e => setNotesCommerciales(e.target.value)}
                      rows={2}
                      placeholder="Conditions d'escompte, franco de port, conventions particulières..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 4: Produits & familles fournies */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">4. Familles, marques & produits</h3>
                </div>

                <div className="space-y-4">
                  {/* Familles */}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      Familles couvertes
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {FAMILY_OPTIONS.map(fam => {
                        const isSelected = selectedFamilies.includes(fam);
                        return (
                          <button
                            key={fam}
                            type="button"
                            onClick={() => toggleFamily(fam)}
                            className={cn(
                              "px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 select-none",
                              isSelected 
                                ? "bg-indigo-600 text-white border-transparent shadow-sm shadow-indigo-600/20" 
                                : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                            )}
                          >
                            {fam}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Marques */}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      Marques distribuées
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {BRAND_OPTIONS.map(brand => {
                        const isSelected = selectedBrands.includes(brand);
                        return (
                          <button
                            key={brand}
                            type="button"
                            onClick={() => toggleBrand(brand)}
                            className={cn(
                              "px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 select-none",
                              isSelected 
                                ? "bg-indigo-600 text-white border-transparent shadow-sm shadow-indigo-600/20" 
                                : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                            )}
                          >
                            {brand}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Produits Associés */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                        Associer des produits du catalogue (Exemples démo)
                      </span>
                      <span className="text-[10px] text-indigo-600 font-bold uppercase">{selectedProducts.length} sélectionné(s)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {DEMO_PRODUCTS.map(prod => {
                        const isSelected = selectedProducts.includes(prod.id);
                        return (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => toggleProduct(prod.id)}
                            className={cn(
                              "flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all select-none font-medium",
                              isSelected 
                                ? "bg-indigo-50/50 border-indigo-300 dark:bg-indigo-900/20 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400" 
                                : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                              isSelected ? "bg-indigo-600 border-transparent text-white" : "border-slate-300 dark:border-slate-700"
                            )}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3px]" />}
                            </div>
                            <span className="truncate">{prod.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 5: Documents Fournisseur */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-pink-500 rounded-full" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">5. Documents fournisseur</h3>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800/60 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter document
                  </button>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-950/10">
                    <FilePlus className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Aucun document joint pour le moment.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Cliquez sur "Ajouter document" pour attacher des pièces justificatives.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <AnimatePresence initial={false}>
                      {documents.map(doc => (
                        <motion.div
                          key={doc.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 group transition-all"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={cn("p-2 rounded-lg text-xs font-bold leading-none select-none shrink-0", getDocColorClass(doc.type))}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                              <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {doc.name}
                              </div>
                              <div className="text-[10px] text-slate-500 tracking-wider">
                                {doc.type} • {doc.size}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md shrink-0 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            title="Supprimer le document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </section>

            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={handleCloseAttempt}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors uppercase tracking-widest text-[10px]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-lg shadow-md hover:shadow-indigo-600/10 transition-all uppercase tracking-widest"
              >
                <Check className="w-4 h-4 stroke-[2.5px]" />
                Ajouter le fournisseur
              </button>
            </div>

            {/* Nested Dialog for Discard Confirmation */}
            <AnimatePresence>
              {showConfirmClose && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-4">
                  {/* Backdrop for confirm close with stronger dark glass */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                    onClick={() => setShowConfirmClose(false)}
                  />

                  {/* Discard confirmation dialog box */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
                    className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-700 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-3 text-amber-500 mb-4">
                      <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">Données non enregistrées</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Modification en cours</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                      Vous avez saisi des informations qui n'ont pas été sauvegardées. Êtes-vous sûr de vouloir fermer ce formulaire ? Toutes les données de saisie seront perdues.
                    </p>

                    <div className="flex justify-end gap-3 text-xs font-bold uppercase tracking-widest">
                      <button
                        type="button"
                        onClick={() => setShowConfirmClose(false)}
                        className="px-4 py-2.5 text-[10px] text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-900 rounded-lg transition-colors"
                      >
                        Continuer la saisie
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowConfirmClose(false);
                          onClose();
                        }}
                        className="px-4 py-2.5 text-[10px] text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md shadow-red-600/10 transition-colors"
                      >
                        Fermer sans enregistrer
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
