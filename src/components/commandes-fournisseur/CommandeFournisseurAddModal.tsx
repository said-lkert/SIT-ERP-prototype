import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, FileText, CheckCircle2, ChevronDown, Package, Plus, Trash2, Tag, 
  MapPin, ShoppingCart, Info, Archive, Calendar, User, Search, Truck, Upload, Download, WandSparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, safeFormatDate } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { api } from '../../api';

interface CommandeFournisseurAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (commande: any) => void;
}

interface CommandeLine {
  id: string;
  productId: string;
  productName: string;
  refFournisseur: string;
  qteCmd: number;
  prixU: number;
  remise: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
}

export function CommandeFournisseurAddModal({ isOpen, onClose, onSave }: CommandeFournisseurAddModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const [fournisseur, setFournisseur] = useState('');
  const [dateCommande, setDateCommande] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [dateLivraison, setDateLivraison] = useState('');
  const [responsable, setResponsable] = useState('');
  const [statut, setStatut] = useState('Brouillon');
  const [commentaire, setCommentaire] = useState('');

  const [modePaiement, setModePaiement] = useState('');
  const [devise, setDevise] = useState('DZD');
  const [delaiPaiement, setDelaiPaiement] = useState('');
  const [fraisLivraison, setFraisLivraison] = useState(0);
  const [conditions, setConditions] = useState('');

  const [lines, setLines] = useState<CommandeLine[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      Promise.all([api.getSuppliers(), api.getProducts()])
        .then(([supRes, prodRes]) => {
          setSuppliers(supRes);
          setProducts(prodRes);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
       setFournisseur('');
       setLines([]);
       setIsSuccess(false);
       setErrors({});
    }
  }, [isOpen]);

  const hasUnsavedChanges = useMemo(() => {
    return fournisseur !== '' || lines.length > 0 || reference !== '';
  }, [fournisseur, lines, reference]);

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const addLine = () => {
    const newLine: CommandeLine = {
      id: Math.random().toString(36).substr(2, 9),
      productId: '',
      productName: '',
      refFournisseur: '',
      qteCmd: 1,
      prixU: 0,
      remise: 0
    };
    setLines([...lines, newLine]);
  };

  const updateLine = (id: string, updates: Partial<CommandeLine>) => {
    setLines(lines.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLine = (id: string) => {
    setLines(lines.filter(l => l.id !== id));
  };

  const handleAddMockFile = () => {
    const mockDocs = [
      { name: 'Devis_Fournisseur_v1.pdf', type: 'PDF', size: '1.2 MB' },
      { name: 'Conditions_Commerciales.pdf', type: 'PDF', size: '850 KB' },
      { name: 'Grille_tarifaire_2026.xlsx', type: 'XLSX', size: '2.4 MB' }
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

  const handleDemoFill = () => {
    const selectedSupplier = suppliers.find((supplier) => products.some((product) => product.mainSupplierId === supplier.id)) || suppliers[0];
    if (!selectedSupplier) return;
    const matchingProducts = products.filter((product) => product.mainSupplierId === selectedSupplier.id);
    const demoProducts = (matchingProducts.length ? matchingProducts : products).slice(0, 2);
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    const demoCode = Date.now().toString().slice(-6);
    setFournisseur(selectedSupplier.id);
    setDateCommande(new Date().toISOString().split('T')[0]);
    setReference(`CF-DEMO-${demoCode}`);
    setDateLivraison(deliveryDate.toISOString().split('T')[0]);
    setResponsable('Responsable achats');
    setModePaiement(selectedSupplier.modePaiement || 'Virement bancaire');
    setDevise(selectedSupplier.currency || 'DZD');
    setDelaiPaiement('30 jours');
    setFraisLivraison(2500);
    setCommentaire(`Commande de démonstration ${demoCode} destinée au réapprovisionnement du dépôt principal.`);
    setConditions('Livraison au dépôt principal. Produits emballés, identifiés et accompagnés du bon de livraison fournisseur.');
    setLines(demoProducts.map((product, index) => ({
      id: `demo-order-${product.id}-${index}`,
      productId: product.id,
      productName: product.name,
      refFournisseur: product.reference,
      qteCmd: index === 0 ? 5 : 2,
      prixU: product.purchasePrice || 0,
      remise: 0
    })));
    setErrors({});
  };

  const stats = useMemo(() => {
    const nbProducts = lines.filter(l => l.productId || l.productName).length;
    const qteTotal = lines.reduce((acc, l) => acc + (Number(l.qteCmd) || 0), 0);
    const valeurTotal = lines.reduce((acc, l) => acc + ((Number(l.qteCmd) || 0) * (Number(l.prixU) || 0) * (1 - (Number(l.remise) || 0) / 100)), 0);
    return { nbProducts, qteTotal, valeurTotal };
  }, [lines]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fournisseur) newErrors.fournisseur = 'Veuillez sélectionner un fournisseur';
    if (!dateCommande) newErrors.dateCommande = 'Veuillez spécifier la date de la commande';
    if (lines.length === 0) newErrors.lines = 'Veuillez ajouter au moins un produit';
    
    let hasInvalidLine = false;
    lines.forEach(l => {
        if (!l.productName && !l.productId) hasInvalidLine = true;
        if (l.qteCmd <= 0) hasInvalidLine = true;
        if (l.prixU < 0) hasInvalidLine = true;
    });
    
    if (hasInvalidLine) newErrors.linesData = 'Certaines lignes de produits sont invalides';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
     setStatut('Brouillon');
     if (!validateForm()) return;
     const payload = { fournisseurId: fournisseur, dateCommande, reference, dateLivraison, responsable, statut: 'Brouillon', commentaire, modePaiement, devise, delaiPaiement, fraisLivraison, conditions, lines };
     setIsProcessing(true);
     api.createSupplierOrder(payload).then(() => {
       setIsProcessing(false);
       onSave({ statut: 'Brouillon' });
     }).catch(console.error);
  };

  const handleValidate = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);
    setStatut('Validée');

    const payload = { fournisseurId: fournisseur, dateCommande, reference, dateLivraison, responsable, statut: 'Validée', commentaire, modePaiement, devise, delaiPaiement, fraisLivraison, conditions, lines };
    
    try {
      await api.createSupplierOrder(payload);
      setIsSuccess(true);
      setTimeout(() => {
        setIsProcessing(false);
        onSave({ statut: 'Validée' });
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
     // simule un export qui rajoute un doc
     const bcDoc: Document = {
       id: Math.random().toString(36).substr(2, 9),
       name: `BC_${reference || 'NOUVEAU'}.pdf`,
       type: 'PDF',
       size: '150 KB',
       date: safeFormatDate(new Date().toISOString())
     };
     setDocuments(prev => [...prev, bcDoc]);
  };

  // Mock data for selects
  const fournisseursOptions = [
    { value: 'Hikvision', label: 'Hikvision Algérie' },
    { value: 'TPLink', label: 'TechDistribution DZ (TP-Link)' },
    { value: 'Dell', label: 'Dell Technologies' }
  ];
  const responsablesOptions = [
    { value: 'u1', label: 'Amine Manager' },
    { value: 'u2', label: 'Sarah Logistique' }
  ];
  const statutsOptions = [
    { value: 'Brouillon', label: 'Brouillon' },
    { value: 'Validée', label: 'Validée' },
    { value: 'Envoyée', label: 'Envoyée' }
  ];
  const produitsOptions = [
    { value: 'p1', label: 'Caméra IP Dôme 4K' },
    { value: 'p2', label: 'NVR 16 Voies PoE' },
    { value: 'p3', label: 'Switch 24 Ports Gigabit PoE+' }
  ];
  const modesPaiementOptions = [
    { value: 'Virement', label: 'Virement bancaire' },
    { value: 'Chèque', label: 'Chèque' },
    { value: 'Especes', label: 'Espèces' },
    { value: 'LC', label: 'Lettre de crédit' }
  ];
  const devisesOptions = [
    { value: 'DZD', label: 'DZD - Dinar Algérien' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'USD', label: 'USD - Dollar' }
  ];


  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
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
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Commande validée !</h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md">La commande est validée et prête à être envoyée au fournisseur.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                   <ShoppingCart className="w-5 h-5 text-indigo-500" />
                   Nouvelle commande fournisseur
                </h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
                  Préparer une commande de produits auprès d’un fournisseur.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleDemoFill} disabled={!suppliers.length || !products.length} className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-indigo-700 hover:bg-indigo-100 disabled:opacity-40">
                  <WandSparkles className="w-4 h-4" /> Remplir la démo
                </button>
                <button 
                  onClick={handleCloseAttempt}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                  disabled={isProcessing}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30">
              <div className="p-6 space-y-8">
                
                {/* SECTION 1: Informations commande */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Informations commande</h3>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                          Fournisseur <span className="text-red-500">*</span>
                        </label>
                        <CustomSelect
                          value={fournisseur}
                          onChange={(v) => { setFournisseur(v); if(errors.fournisseur) { const e = {...errors}; delete e.fournisseur; setErrors(e); } }}
                          options={[{ value: '', label: 'Sélectionner un fournisseur' }, ...suppliers.map(s => ({ value: s.id, label: s.name }))]}
                          error={!!errors.fournisseur}
                        />
                        {errors.fournisseur && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.fournisseur}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                          Date commande <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={dateCommande}
                          onChange={(e) => { setDateCommande(e.target.value); if(errors.dateCommande) { const err = {...errors}; delete err.dateCommande; setErrors(err); } }}
                          className={cn(
                            "w-full px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                            errors.dateCommande 
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-500/50" 
                              : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500"
                          )}
                        />
                        {errors.dateCommande && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.dateCommande}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                          Référence interne (optionnel)
                        </label>
                        <input
                          type="text"
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          placeholder="Ex: CF-2026-009"
                          className="w-full px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                          Date livraison prévue
                        </label>
                        <input
                          type="date"
                          value={dateLivraison}
                          onChange={(e) => setDateLivraison(e.target.value)}
                          className="w-full px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                          Responsable commande
                        </label>
                        <CustomSelect
                          value={responsable}
                          onChange={setResponsable}
                          options={[{ value: '', label: 'Sélectionner responsable' }, ...responsablesOptions]}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                          Statut
                        </label>
                        <CustomSelect
                          value={statut}
                          onChange={setStatut}
                          options={statutsOptions}
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
                        placeholder="Instructions pour la commande..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* SECTION 2: Produits à commander */}
                <section>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                       <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Produits à commander</h3>
                    </div>
                    {errors.lines && <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md">{errors.lines}</span>}
                    {errors.linesData && <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md">{errors.linesData}</span>}
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            <tr>
                                <th className="px-4 py-3 w-[30%]">Produit</th>
                                <th className="px-4 py-3 w-[15%]">Réf. Fournisseur</th>
                                <th className="px-4 py-3 w-[12%]">QtéCmd</th>
                                <th className="px-4 py-3 w-[15%]">Prix Achat HT</th>
                                <th className="px-4 py-3 w-[10%]">Remise %</th>
                                <th className="px-4 py-3 w-[15%] text-right">Total Ligne</th>
                                <th className="px-4 py-3 w-[3%]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            <AnimatePresence>
                                {lines.map((l) => {
                                    const isInvalidProd = errors.linesData && !l.productId && !l.productName;
                                    const isInvalidQte = errors.linesData && l.qteCmd <= 0;
                                    const isInvalidPrix = errors.linesData && l.prixU < 0;
                                    const totalLigne = l.qteCmd * l.prixU * (1 - l.remise / 100);
                                    
                                    return (
                                    <motion.tr 
                                      key={l.id}
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                                    >
                                        <td className="px-4 py-2">
                                            <CustomSelect
                                              value={l.productId}
                                              onChange={(v) => {
                                                const opt = products.find(o => o.id === v);
                                                updateLine(l.id, { productId: v, productName: opt ? opt.name : '', refFournisseur: opt ? opt.reference : '' });
                                                if(errors.lines || errors.linesData) { setErrors({}); }
                                              }}
                                              options={[{ value: '', label: 'Select' }, ...products.map(p => ({ value: p.id, label: p.name }))]}
                                              error={isInvalidProd}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="text"
                                                value={l.refFournisseur}
                                                onChange={(e) => updateLine(l.id, { refFournisseur: e.target.value })}
                                                placeholder="Réf Frs"
                                                className="w-full px-2 py-1.5 h-[38px] text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="number"
                                                min="1"
                                                value={l.qteCmd === 0 ? '' : l.qteCmd}
                                                onChange={(e) => {
                                                  updateLine(l.id, { qteCmd: parseInt(e.target.value) || 0 });
                                                  if(errors.lines || errors.linesData) { setErrors({}); }
                                                }}
                                                className={cn(
                                                    "w-full px-2 py-1.5 h-[38px] text-sm font-bold bg-slate-50 dark:bg-slate-900/50 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                                                    isInvalidQte ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
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
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={l.remise === 0 ? '' : l.remise}
                                                onChange={(e) => updateLine(l.id, { remise: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-2 py-1.5 h-[38px] text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-right"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <span className="font-bold text-slate-900 dark:text-white">{totalLigne.toLocaleString()} {devise}</span>
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
                                    )
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    {lines.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 px-4 bg-slate-50/50 dark:bg-slate-900/20">
                          <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Aucun produit ajouté à la commande.</p>
                          <button
                            onClick={addLine}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 dark:bg-indigo-900/20 dark:border-indigo-800/30 dark:text-indigo-400 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" /> Ajouter un produit
                          </button>
                      </div>
                    )}
                    {lines.length > 0 && (
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

                {/* SECTION 3: Conditions commerciales */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Conditions commerciales</h3>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                            Mode de paiement
                          </label>
                          <CustomSelect
                            value={modePaiement}
                            onChange={setModePaiement}
                            options={[{ value: '', label: 'Sélectionner' }, ...modesPaiementOptions]}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                            Devise
                          </label>
                          <CustomSelect
                            value={devise}
                            onChange={setDevise}
                            options={devisesOptions}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                            Délai de paiement
                          </label>
                          <input
                            type="text"
                            value={delaiPaiement}
                            onChange={(e) => setDelaiPaiement(e.target.value)}
                            placeholder="Ex: 30 jours fin de mois"
                            className="w-full px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                            Frais de livraison
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={fraisLivraison === 0 ? '' : fraisLivraison}
                              onChange={(e) => setFraisLivraison(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 pl-3 pr-12 text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-xs font-bold text-slate-400">{devise}</span>
                            </div>
                          </div>
                        </div>
                     </div>
                     <div>
                       <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                         Conditions particulières
                       </label>
                       <textarea
                         value={conditions}
                         onChange={(e) => setConditions(e.target.value)}
                         placeholder="Incoterm, lieu de livraison spécifique..."
                         rows={2}
                         className="w-full px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                       />
                     </div>
                  </div>
                </section>

                {/* SECTION 4: Documents liés */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Documents liés</h3>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex justify-between items-center mb-2">
                       <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Ajouter les documents commerciaux (devis, contrat...)</p>
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

                {/* SECTION 5: Résumé commande */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Résumé de la commande</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Nbr produits</div>
                       <div className="text-2xl font-black text-slate-900 dark:text-white text-center">{stats.nbProducts}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Qté totale</div>
                       <div className="text-2xl font-black text-slate-900 dark:text-white text-center">{stats.qteTotal}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Val. totale HT</div>
                       <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 text-center">{stats.valeurTotal.toLocaleString()} {devise}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Date livraison</div>
                       <div className="text-lg font-black text-slate-900 dark:text-white text-center leading-tight mt-1">{dateLivraison ? safeFormatDate(dateLivraison) : 'Non définie'}</div>
                    </div>
                  </div>
                </section>

              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
               <button
                 type="button"
                 onClick={handleExport}
                 className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
               >
                 <Download className="w-4 h-4" /> Exporter BC
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
                       Valider la commande
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
      )}
    </AnimatePresence>,
    document.body
  );
}
