import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, FileText, CheckCircle2, ChevronDown, Package, Plus, Trash2, Tag, 
  MapPin, ShoppingCart, Info, Archive, Calendar, User, Search, Truck, Upload, Download,
  AlertTriangle, Barcode, Check, FileWarning
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, safeFormatDate } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';

interface Fournisseur {
  id: string;
  name: string;
  [key: string]: any;
}

interface FournisseurReceptionModalProps {
  fournisseur?: Fournisseur;
  onClose: () => void;
}

interface ReceptionLine {
  id: string;
  productId: string;
  productName: string;
  refFournisseur: string;
  qteCmd: number;
  qteRecue: number;
  prixU: number;
  emplacement: string;
  etat: string;
  serials: string;
  isSerialized: boolean;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
}

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Caméra IP Dôme 4K', ref: 'CAM-DOM-4K', price: 12000, isSerialized: true },
  { id: 'p2', name: 'NVR 16 Voies PoE', ref: 'NVR-16-POE', price: 45000, isSerialized: true },
  { id: 'p3', name: 'Switch 24 Ports Gigabit PoE+', ref: 'SW-24-POE+', price: 25000, isSerialized: true },
  { id: 'p4', name: 'Câble RJ45 Cat6 305m', ref: 'CAB-RJ45-C6', price: 9500, isSerialized: false },
  { id: 'p5', name: 'Connecteur RJ45 (Lot de 100)', ref: 'CONN-RJ45-100', price: 1500, isSerialized: false },
];

const LOCATION_OPTIONS = [
  { value: 'A-01', label: 'Rayon A, Niv 1' },
  { value: 'A-02', label: 'Rayon A, Niv 2' },
  { value: 'B-01', label: 'Rayon B, Niv 1' },
  { value: 'SAV', label: 'Zone SAV' }
];

const ETAT_OPTIONS = [
  { value: 'conforme', label: 'Conforme' },
  { value: 'abime', label: 'Abîmé' },
  { value: 'incomplet', label: 'Incomplet' }
];

const OUI_NON = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' }
];

const MOCK_COMMANDES = [
  { value: 'CF-0001', label: 'CF-0001 - Hikvision Algérie - 12/10/2026 - En attente - 20 restants' },
  { value: 'CF-0002', label: 'CF-0002 - TP-Link DZ - 15/10/2026 - Partielle - 5 restants' }
];

const MOCK_ORDER_DATA: Record<string, any> = {
  'CF-0001': {
    fournisseurId: 'Hikvision',
    reference: 'CF-0001',
    dateLivraison: '2026-10-25',
    lines: [
      { id: '1', productId: 'p1', productName: 'Caméra IP Dôme 4K', refFournisseur: 'CAM-DOM-4K', qteCmd: 20, qteRecue: 20, prixU: 12000, emplacement: '', etat: 'conforme', isSerialized: true, serials: '' },
      { id: '2', productId: 'p2', productName: 'NVR 16 Voies PoE', refFournisseur: 'NVR-16-POE', qteCmd: 2, qteRecue: 2, prixU: 45000, emplacement: '', etat: 'conforme', isSerialized: true, serials: '' }
    ]
  },
  'CF-0002': {
   fournisseurId: 'TPLink',
   reference: 'CF-0002',
   dateLivraison: '2026-10-28',
   lines: [
     { id: '3', productId: 'p3', productName: 'Switch 24 Ports Gigabit PoE+', refFournisseur: 'SW-24-POE+', qteCmd: 5, qteRecue: 5, prixU: 25000, emplacement: '', etat: 'conforme', isSerialized: true, serials: '' }
   ]
  }
};

const fournisseursOptions = [
  { value: 'Hikvision', label: 'Hikvision Algérie' },
  { value: 'TPLink', label: 'TechDistribution DZ (TP-Link)' },
  { value: 'Dell', label: 'Dell Technologies' }
];

export function FournisseurReceptionModal({ fournisseur, onClose }: FournisseurReceptionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const [fromOrder, setFromOrder] = useState('oui');
  const [orderId, setOrderId] = useState('');

  const [fournisseurId, setFournisseurId] = useState(fournisseur ? fournisseur.name : '');
  const [dateReception, setDateReception] = useState(new Date().toISOString().split('T')[0]);
  const [referenceBL, setReferenceBL] = useState('');
  const [referenceFacture, setReferenceFacture] = useState('');
  const [depot, setDepot] = useState('Dépôt Principal');
  const [responsable, setResponsable] = useState('');
  const [statut, setStatut] = useState('Brouillon');
  const [commentaire, setCommentaire] = useState('');

  const [lines, setLines] = useState<ReceptionLine[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (fromOrder === 'oui' && orderId) {
      const data = MOCK_ORDER_DATA[orderId];
      if (data) {
        setFournisseurId(data.fournisseurId);
        setLines(data.lines.map((l: any) => ({...l, id: Math.random().toString(36).substr(2, 9)})));
        setReferenceBL(`BL-${data.reference}`);
      }
    } else if (fromOrder === 'non') {
      setLines([]);
    }
  }, [fromOrder, orderId]);

  const hasUnsavedChanges = useMemo(() => {
    return fournisseurId !== '' || lines.length > 0 || referenceBL !== '';
  }, [fournisseurId, lines, referenceBL]);

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const addLine = () => {
    const newLine: ReceptionLine = {
      id: Math.random().toString(36).substr(2, 9),
      productId: '',
      productName: '',
      refFournisseur: '',
      qteCmd: 0,
      qteRecue: 1,
      prixU: 0,
      emplacement: '',
      etat: 'conforme',
      serials: '',
      isSerialized: false
    };
    setLines([...lines, newLine]);
  };

  const updateLine = (id: string, updates: Partial<ReceptionLine>) => {
    setLines(lines.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLine = (id: string) => {
    setLines(lines.filter(l => l.id !== id));
  };

  const handleSelectProduct = (lineId: string, productId: string) => {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (product) {
      updateLine(lineId, {
        productId: product.id,
        productName: product.name,
        refFournisseur: product.ref,
        prixU: product.price,
        isSerialized: product.isSerialized
      });
      if(errors.lines || errors.linesData) { setErrors({}); }
    } else {
      updateLine(lineId, { productId, productName: '' });
    }
  };

  const handleAddMockFile = () => {
    const mockDocs = [
      { name: 'BL_Fournisseur_v1.pdf', type: 'PDF', size: '1.2 MB' },
      { name: 'Facture_Recue.pdf', type: 'PDF', size: '850 KB' },
      { name: 'Certificat_Origine.pdf', type: 'PDF', size: '2.4 MB' }
    ];
    const template = mockDocs[documents.length % mockDocs.length];
    
    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      name: template.name,
      type: template.type,
      size: template.size,
      date: safeFormatDate(new Date().toISOString())
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const stats = useMemo(() => {
    const nbProducts = lines.filter(l => l.productId || l.productName).length;
    const qteTotal = lines.reduce((acc, l) => acc + (Number(l.qteRecue) || 0), 0);
    const valeurTotal = lines.reduce((acc, l) => acc + ((Number(l.qteRecue) || 0) * (Number(l.prixU) || 0)), 0);
    const ecarts = lines.filter(l => 
        (l.qteCmd > 0 && l.qteCmd !== l.qteRecue) || 
        l.etat !== 'conforme'
    ).length;
    let serialsCount = 0;
    lines.forEach(l => {
      if (l.isSerialized && l.serials) {
        serialsCount += (l.serials || '').split('\n').map(s => s.trim()).filter(Boolean).length;
      }
    });

    return { nbProducts, qteTotal, valeurTotal, ecarts, serialsCount };
  }, [lines]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fournisseurId) newErrors.fournisseurId = 'Veuillez sélectionner un fournisseur';
    if (!dateReception) newErrors.dateReception = 'Veuillez spécifier la date';
    if (lines.length === 0) newErrors.lines = 'Veuillez ajouter au moins un produit';
    
    let hasInvalidLine = false;
    lines.forEach(l => {
        if (!l.productName && !l.productId) hasInvalidLine = true;
        if (l.qteRecue < 0) hasInvalidLine = true;
        if (l.prixU < 0) hasInvalidLine = true;
        
        if (l.isSerialized && l.productId) {
            const parsed = (l.serials || '').split('\n').map(s => s.trim()).filter(Boolean);
            if (parsed.length !== l.qteRecue) {
                hasInvalidLine = true;
            }
            if (new Set(parsed).size !== parsed.length) {
                hasInvalidLine = true; // duplicates
            }
        }
    });
    
    if (hasInvalidLine) newErrors.linesData = 'Certaines lignes (ou numéros de série) sont invalides';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
     setStatut('Brouillon');
     if (!validateForm()) return;
     onClose();
  };

  const handleValidate = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);
    setStatut('Validée');

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const responsablesOptions = [
    { value: 'u1', label: 'Amine Manager' },
    { value: 'u2', label: 'Sarah Logistique' }
  ];

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-md"
            onClick={handleCloseAttempt}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden z-10"
          >
            {/* Success Overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-[200] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-600">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Réception validée !</h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md">La réception a été enregistrée et le stock a été mis à jour.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                   <Package className="w-5 h-5 text-indigo-500" />
                   Réception fournisseur
                </h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
                  Vérifier les produits livrés et préparer l’entrée en stock.
                </p>
              </div>
              <button 
                onClick={handleCloseAttempt}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                disabled={isProcessing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30">
              <div className="p-6 space-y-8">
                
                {/* SECTION 1: Informations réception */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Informations réception</h3>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                          Réception depuis commande ? <span className="text-red-500">*</span>
                        </label>
                        <CustomSelect
                          value={fromOrder}
                          onChange={(v) => { setFromOrder(v); setOrderId(''); }}
                          options={OUI_NON}
                        />
                      </div>
                      
                      {fromOrder === 'oui' ? (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                            Commande fournisseur liée <span className="text-red-500">*</span>
                          </label>
                          <CustomSelect
                            value={orderId}
                            onChange={(v) => { setOrderId(v); if(errors.orderId) { const e = {...errors}; delete e.orderId; setErrors(e); } }}
                            options={[{ value: '', label: 'Sélectionner une commande' }, ...MOCK_COMMANDES]}
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                            Fournisseur <span className="text-red-500">*</span>
                          </label>
                          <CustomSelect
                            value={fournisseurId}
                            onChange={(v) => { setFournisseurId(v); if(errors.fournisseurId) { const e = {...errors}; delete e.fournisseurId; setErrors(e); } }}
                            options={[{ value: '', label: 'Sélectionner un fournisseur' }, ...fournisseursOptions]}
                            error={!!errors.fournisseurId}
                          />
                          {errors.fournisseurId && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.fournisseurId}</p>}
                        </div>
                      )}
                      
                      {fromOrder === 'oui' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                            Fournisseur
                          </label>
                          <input
                            type="text"
                            value={fournisseurId}
                            readOnly
                            className="w-full px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                          Date réception <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={dateReception}
                          onChange={(e) => { setDateReception(e.target.value); if(errors.dateReception) { const err = {...errors}; delete err.dateReception; setErrors(err); } }}
                          className={cn(
                            "w-full px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                            errors.dateReception 
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-500/50" 
                              : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500"
                          )}
                        />
                        {errors.dateReception && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.dateReception}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                          Référence BL fournisseur
                        </label>
                        <input
                          type="text"
                          value={referenceBL}
                          onChange={(e) => setReferenceBL(e.target.value)}
                          placeholder="Ex: BL-2026-009"
                          className="w-full px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors uppercase font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                          Référence facture fournisseur
                        </label>
                        <input
                          type="text"
                          value={referenceFacture}
                          onChange={(e) => setReferenceFacture(e.target.value)}
                          placeholder="Ex: FA-2026-042"
                          className="w-full px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors uppercase font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                          Dépôt <span className="text-red-500">*</span>
                        </label>
                        <CustomSelect
                          value={depot}
                          onChange={setDepot}
                          options={[
                            { value: 'Dépôt Principal', label: 'Dépôt Principal' },
                            { value: 'Dépôt Alger', label: 'Dépôt Alger' },
                            { value: 'SAV', label: 'SAV / Quarantaine' }
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                          Responsable réception
                        </label>
                        <CustomSelect
                          value={responsable}
                          onChange={setResponsable}
                          options={[{ value: '', label: 'Sélectionner responsable' }, ...responsablesOptions]}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                        Commentaire
                      </label>
                      <textarea
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                        placeholder="Instructions ou observations sur la réception..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                      />
                    </div>
                  </div>
                 </section>

                {/* SECTION 2: Produits reçus */}
                <section>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                       <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Produits reçus</h3>
                    </div>
                    {errors.lines && <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md">{errors.lines}</span>}
                    {errors.linesData && <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md">{errors.linesData}</span>}
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            <tr>
                                <th className="px-4 py-3 w-[25%]">Produit</th>
                                <th className="px-4 py-3 w-[15%]">Réf. Fournisseur</th>
                                <th className="px-4 py-3 w-[10%] text-center">QtéCmd</th>
                                <th className="px-4 py-3 w-[10%] text-center">QtéReçue</th>
                                <th className="px-4 py-3 w-[15%] text-right">Prix Achat HT</th>
                                <th className="px-4 py-3 w-[12%]">Emplacement</th>
                                <th className="px-4 py-3 w-[10%]">État</th>
                                <th className="px-4 py-3 w-[3%] text-right"></th>
                            </tr>
                        </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                              <AnimatePresence>
                                  {lines.map((l) => {
                                      const isInvalidProd = errors.linesData && !l.productId && !l.productName;
                                      const isInvalidQte = errors.linesData && l.qteRecue < 0;
                                      const isInvalidPrix = errors.linesData && l.prixU < 0;
                                      
                                      const serials = (l.serials || '').split('\n').map(s=>s.trim()).filter(Boolean);
                                      const hasSerialsError = errors.linesData && l.isSerialized && (serials.length !== l.qteRecue || new Set(serials).size !== serials.length);

                                      return (
                                      <React.Fragment key={l.id}>
                                      <motion.tr 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                                      >
                                          <td className="px-4 py-2">
                                              <CustomSelect
                                                value={l.productId}
                                                onChange={(v) => handleSelectProduct(l.id, v)}
                                                options={[{ value: '', label: 'Select' }, ...MOCK_PRODUCTS.map(p => ({ value: p.id, label: p.name }))]}
                                                error={isInvalidProd}
                                                disabled={fromOrder === 'oui'}
                                              />
                                              {/* Badges and tags */}
                                              {l.productId && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                  {l.qteCmd > 0 && l.qteRecue < l.qteCmd && (
                                                      <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
                                                         Partiel
                                                      </span>
                                                  )}
                                                  {l.qteCmd > 0 && l.qteRecue === l.qteCmd && (
                                                      <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                         Complet
                                                      </span>
                                                  )}
                                                  {l.qteCmd > 0 && l.qteRecue > l.qteCmd && (
                                                      <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                                                         Surplus
                                                      </span>
                                                  )}
                                                </div>
                                              )}
                                          </td>
                                          <td className="px-4 py-2">
                                              <input
                                                  type="text"
                                                  value={l.refFournisseur}
                                                  onChange={(e) => updateLine(l.id, { refFournisseur: e.target.value })}
                                                  placeholder="Réf Frs"
                                                  readOnly={fromOrder === 'oui'}
                                                  className={cn(
                                                    "w-full px-2 py-1.5 h-[38px] text-sm font-medium border rounded-lg outline-none transition-colors font-mono",
                                                    fromOrder === 'oui' ? "bg-transparent border-transparent text-slate-500 cursor-not-allowed" : "bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                  )}
                                              />
                                          </td>
                                          <td className="px-4 py-2">
                                              <input
                                                  type="number"
                                                  min="0"
                                                  value={l.qteCmd === 0 ? '' : l.qteCmd}
                                                  readOnly
                                                  className="w-full px-2 py-1.5 h-[38px] text-sm font-bold bg-transparent border-transparent text-slate-400 rounded-lg outline-none transition-colors text-center cursor-not-allowed"
                                              />
                                          </td>
                                          <td className="px-4 py-2">
                                              <input
                                                  type="number"
                                                  min="0"
                                                  value={l.qteRecue === 0 ? '' : l.qteRecue}
                                                  onChange={(e) => {
                                                    updateLine(l.id, { qteRecue: parseInt(e.target.value) || 0 });
                                                    if(errors.lines || errors.linesData) { setErrors({}); }
                                                  }}
                                                  className={cn(
                                                      "w-full px-2 py-1.5 h-[38px] text-sm font-black bg-white dark:bg-slate-900 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-center shadow-sm",
                                                      isInvalidQte ? "border-red-300 focus:ring-red-500 focus:border-red-500 text-red-600" : (l.qteCmd > 0 && l.qteRecue !== l.qteCmd) ? "border-amber-400 text-amber-600 focus:ring-amber-500" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
                                                  )}
                                              />
                                          </td>
                                          <td className="px-4 py-2 flex items-center gap-2">
                                              <input
                                                  type="number"
                                                  min="0"
                                                  value={l.prixU === 0 ? '' : l.prixU}
                                                  onChange={(e) => updateLine(l.id, { prixU: parseFloat(e.target.value) || 0 })}
                                                  className={cn(
                                                      "w-full px-2 py-1.5 h-[38px] text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-right",
                                                      isInvalidPrix ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
                                                  )}
                                              />
                                          </td>
                                          <td className="px-4 py-2">
                                              <CustomSelect
                                                value={l.emplacement}
                                                onChange={(v) => updateLine(l.id, { emplacement: v })}
                                                options={[{ value: '', label: 'Select' }, ...LOCATION_OPTIONS]}
                                              />
                                          </td>
                                          <td className="px-4 py-2">
                                              <CustomSelect
                                                value={l.etat}
                                                onChange={(v) => updateLine(l.id, { etat: v })}
                                                options={ETAT_OPTIONS}
                                              />
                                          </td>
                                          <td className="px-4 py-2 text-right">
                                              <button
                                                onClick={() => removeLine(l.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                                                title="Supprimer la ligne"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                          </td>
                                      </motion.tr>

                                      {/* Serial Number Row */}
                                      {l.productId && l.isSerialized && l.qteRecue > 0 && (
                                        <tr className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800/50">
                                            <td colSpan={8} className="py-3 px-12">
                                                <div className={cn("bg-white dark:bg-slate-950 p-4 rounded-xl border shadow-sm", hasSerialsError ? "border-red-300 dark:border-red-500/50" : "border-slate-200 dark:border-slate-800")}>
                                                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                                                        <div className="flex-1 w-full">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                                  <Barcode className="w-3.5 h-3.5 text-indigo-500" />
                                                                  Numéros de série ({l.qteRecue} requis)
                                                                </label>
                                                                {(() => {
                                                                    const count = serials.length;
                                                                    const total = l.qteRecue;
                                                                    const isComplete = count === total;
                                                                    const hasDuplicates = new Set(serials).size !== serials.length;

                                                                    if (hasDuplicates) {
                                                                       return <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Doublons détectés</span>;
                                                                    }
                                                                    if (isComplete) {
                                                                       return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3"/> Série complète</span>;
                                                                    }
                                                                    return <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{count} saisis / {total} requis</span>;
                                                                })()}
                                                            </div>
                                                            <textarea 
                                                               value={l.serials}
                                                               onChange={(e) => updateLine(l.id, { serials: e.target.value })}
                                                               placeholder="Saisir ou flasher un numéro par ligne..."
                                                               rows={3}
                                                               className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 outline-none resize-y"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                      )}
                                      </React.Fragment>
                                      )
                                  })}
                              </AnimatePresence>
                          </tbody>
                      </table>
                    </div>
                    {lines.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 px-4 bg-slate-50/50 dark:bg-slate-900/20">
                          <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Aucun produit réceptionné pour le moment.</p>
                          {fromOrder === 'non' && (
                            <button
                              onClick={addLine}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 dark:bg-indigo-900/20 dark:border-indigo-800/30 dark:text-indigo-400 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" /> Ajouter un produit
                            </button>
                          )}
                      </div>
                    )}
                    {(lines.length > 0 && fromOrder === 'non') && (
                      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <button
                          onClick={addLine}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 rounded-md transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                        </button>
                      </div>
                    )}
                  </div>
                 </section>

                {/* SECTION 3: Documents liés */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Documents liés</h3>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex justify-between items-center mb-2">
                       <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Ajouter les documents commerciaux (BL, facture...)</p>
                       <button
                         onClick={handleAddMockFile}
                         className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 hover:border-purple-300 dark:bg-purple-900/20 dark:border-purple-800/30 dark:text-purple-400 dark:hover:bg-purple-900/40 rounded-lg transition-colors"
                       >
                         <Upload className="w-3.5 h-3.5" /> Ajouter un document
                       </button>
                    </div>

                    {documents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                         <AnimatePresence>
                           {documents.map((doc) => (
                             <motion.div
                               key={doc.id}
                               initial={{ opacity: 0, scale: 0.95 }}
                               animate={{ opacity: 1, scale: 1 }}
                               exit={{ opacity: 0, scale: 0.95 }}
                               className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl"
                             >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                                    <FileText className="w-4 h-4 text-purple-500" />
                                  </div>
                                  <div className="truncate">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">{doc.size}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveDoc(doc.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors shrink-0 ml-2"
                                  title="Supprimer document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                             </motion.div>
                           ))}
                         </AnimatePresence>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                          <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Aucun document rattaché.</p>
                      </div>
                    )}
                  </div>
                 </section>

                {/* SECTION 4: Résumé réception */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Résumé de la réception</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Produits reçus</div>
                       <div className="text-2xl font-black text-slate-900 dark:text-white text-center">{stats.nbProducts}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Qté totale</div>
                       <div className="text-2xl font-black text-slate-900 dark:text-white text-center">{stats.qteTotal}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Val. totale HT</div>
                       <div className="text-2xl font-black text-slate-900 dark:text-white text-center">{stats.valeurTotal.toLocaleString()} {fromOrder === 'oui' ? 'DZD' : ''}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Écarts détectés</div>
                       <div className="text-2xl font-black text-slate-900 dark:text-white text-center">{stats.ecarts}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Séries saisis</div>
                       <div className="text-2xl font-black text-slate-900 dark:text-white text-center">{stats.serialsCount}</div>
                    </div>
                  </div>
                 </section>

              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
               <button
                 type="button"
                 onClick={() => {}}
                 className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
               >
                 <FileWarning className="w-4 h-4" /> Signaler écart
               </button>
               
               <div className="flex items-center gap-3">
                 <button
                   type="button"
                   onClick={handleCloseAttempt}
                   disabled={isProcessing}
                   className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
                 >
                   Annuler
                 </button>
                 <button
                   type="button"
                   onClick={handleSaveDraft}
                   disabled={isProcessing}
                   className="px-4 py-2 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm hover:bg-indigo-100 uppercase tracking-wide dark:bg-indigo-900/30 dark:border-indigo-800/50 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
                 >
                   Enregistrer brouillon
                 </button>
                 <button
                   type="button"
                   onClick={handleValidate}
                   disabled={isProcessing}
                   className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center gap-2 uppercase tracking-wide"
                 >
                   {isProcessing ? (
                     <>
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                       Validation...
                     </>
                   ) : (
                     <>
                       <CheckCircle2 className="w-4 h-4" />
                       Valider réception
                     </>
                   )}
                 </button>
               </div>
            </div>
          </motion.div>
          
          {/* Confirmation Dialog (Close with unsaved changes) */}
          <AnimatePresence>
            {showConfirmClose && (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                  onClick={() => setShowConfirmClose(false)}
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm z-10"
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Fermer sans enregistrer ?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Vous avez des données non enregistrées. Êtes-vous sûr de vouloir fermer le formulaire ? Vos modifications seront perdues.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowConfirmClose(false)}
                      className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        setShowConfirmClose(false);
                        onClose();
                      }}
                      className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      Fermer
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
    </AnimatePresence>,
    document.body
  );
}
