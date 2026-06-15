import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product, ProductStatus } from './types';
import { X, Check, Image as ImageIcon, FileText, WandSparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { useModules } from '../../contexts/ModuleContext';

interface ProductAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newProduct: Product) => void;
}

const FAMILY_OPTIONS = [
  { value: 'CCTV', label: 'CCTV' },
  { value: 'Réseau', label: 'Réseau' },
  { value: 'Contrôle d\'accès', label: 'Contrôle d\'accès' },
  { value: 'Incendie', label: 'Incendie' },
  { value: 'Serveur', label: 'Serveur' },
  { value: 'Accessoires', label: 'Accessoires' },
];

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'Actif', label: 'Actif' },
  { value: 'Obsolète', label: 'Obsolète' },
  { value: 'Désactivé', label: 'Désactivé' },
];

const BRAND_OPTIONS = [
  { value: 'Hikvision', label: 'Hikvision' },
  { value: 'Dahua', label: 'Dahua' },
  { value: 'TP-Link', label: 'TP-Link' },
  { value: 'MikroTik', label: 'MikroTik' },
  { value: 'Dell', label: 'Dell' },
  { value: 'APC', label: 'APC' },
  { value: 'Seagate', label: 'Seagate' },
];

const SUPPLIER_OPTIONS = [
  { value: 'TechData', label: 'TechData' },
  { value: 'Ingram', label: 'Ingram' },
  { value: 'DistriSec', label: 'DistriSec' },
  { value: 'Direct Constructeur', label: 'Direct Constructeur' },
];

const LOCATION_OPTIONS = [
  { value: 'Dépôt principal', label: 'Dépôt principal' },
  { value: 'Zone retour', label: 'Zone retour' },
  { value: 'Zone réparation', label: 'Zone réparation' },
  { value: 'Véhicule technicien A', label: 'Véhicule technicien A' },
  { value: 'Véhicule technicien B', label: 'Véhicule technicien B' },
  { value: 'Chantier / site client', label: 'Chantier / site client' },
];

export function ProductAddModal({ isOpen, onClose, onSave }: ProductAddModalProps) {
  const { isModuleEnabled } = useModules();
  
  const TYPE_OPTIONS = [
    { value: 'Équipement', label: 'Équipement' },
    { value: 'Consommable', label: 'Consommable' },
    { value: 'Licence', label: 'Licence' },
    ...(isModuleEnabled('services') ? [{ value: 'Service', label: 'Service' }] : []),
  ];

  const [formData, setFormData] = useState<any>({
    status: 'Actif',
    purchasePrice: 0,
    sellingPrice: 0,
    minThreshold: 0,
    availableStock: 0,
    physicalStock: 0,
    reservedStock: 0,
    orderedStock: 0,
    supplierWarrantyMonths: 12,
    clientWarrantyMonths: 12,
    requiresSerialNumber: false,
    isStockable: true,
  });
  const [tagsInput, setTagsInput] = useState('');
  const [defaultLocation, setDefaultLocation] = useState('');
  const [supplierRef, setSupplierRef] = useState('');
  const [suppliersList, setSuppliersList] = useState<{ value: string; label: string }[]>([]);
  const [supplierCatalog, setSupplierCatalog] = useState<any[]>([]);
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState('');
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        status: 'Actif',
        purchasePrice: 0,
        sellingPrice: 0,
        minThreshold: 0,
        availableStock: 0,
        physicalStock: 0,
        reservedStock: 0,
        orderedStock: 0,
        supplierWarrantyMonths: 12,
        clientWarrantyMonths: 12,
        requiresSerialNumber: false,
        isStockable: true,
      });
      setTagsInput('');
      setDefaultLocation('');
      setSupplierRef('');
      setSupplierCatalog([]);
      setSelectedCatalogProduct('');
      setErrors({});

      fetch('/api/suppliers')
        .then(res => res.json())
        .then(data => {
          setSuppliersList(data.map((s: any) => ({ value: s.id, label: s.name })));
        })
        .catch(err => console.error("Error fetching suppliers:", err));
    }
  }, [isOpen]);

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSupplierChange = async (supplierId: string) => {
    handleChange('mainSupplier', supplierId);
    setSelectedCatalogProduct('');
    setSupplierCatalog([]);
    if (!supplierId) return;
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`);
      const supplier = await response.json();
      setSupplierCatalog(Array.isArray(supplier.offers) ? supplier.offers : []);
    } catch {
      setSupplierCatalog([]);
    }
  };

  const handleCatalogProductChange = async (productId: string) => {
    setSelectedCatalogProduct(productId);
    const offer = supplierCatalog.find((item) => item.productId === productId);
    if (!offer) return;
    let product: any = {};
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) product = await response.json();
    } catch {}
    setFormData((current: any) => ({
      ...current,
      reference: `${offer.productReference || product.reference || 'PRD'}-CAT-${Date.now().toString().slice(-3)}`,
      name: offer.productName || product.name || '',
      description: product.description || 'Produit proposé par le fournisseur sélectionné.',
      family: product.family || current.family || 'Accessoires',
      brand: product.brand || '',
      model: product.model || '',
      type: product.type || 'Équipement',
      purchasePrice: offer.purchasePrice || product.purchasePrice || 0,
      sellingPrice: product.sellingPrice || Math.round((offer.purchasePrice || 0) * 1.25),
      requiresSerialNumber: product.requiresSerialNumber || false,
      isStockable: product.isStockable !== false,
    }));
    setSupplierRef(offer.reference || offer.productReference || '');
    setTagsInput((product.tags || []).join(', '));
    setErrors({});
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.reference?.trim()) newErrors.reference = 'Requise';
    if (!formData.name?.trim()) newErrors.name = 'Requis';
    if (!formData.family) newErrors.family = 'Requise';
    if (formData.sellingPrice === undefined || formData.sellingPrice < 0) newErrors.sellingPrice = 'Invalide';
    if (formData.purchasePrice === undefined || formData.purchasePrice < 0) newErrors.purchasePrice = 'Invalide';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      const productToSave = {
        ...formData,
        supplierId: formData.mainSupplier,
        supplierRef: supplierRef,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      };
      
      onSave(productToSave);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const fillDemo = () => {
    const supplier = suppliersList[0];
    setFormData({
      status: 'Actif',
      reference: `CAM-DEMO-${Date.now().toString().slice(-4)}`,
      name: 'Caméra IP Hikvision 4MP',
      description: 'Caméra réseau extérieure avec vision nocturne, destinée aux projets de vidéosurveillance.',
      family: 'CCTV',
      brand: 'Hikvision',
      model: 'DS-2CD2043G0-I',
      type: 'Équipement',
      purchasePrice: 18500,
      sellingPrice: 24500,
      minThreshold: 5,
      availableStock: 0,
      physicalStock: 0,
      reservedStock: 0,
      orderedStock: 0,
      supplierWarrantyMonths: 36,
      clientWarrantyMonths: 24,
      requiresSerialNumber: true,
      isStockable: true,
      mainSupplier: supplier?.value || '',
    });
    setSupplierRef('HIK-DS-2CD2043');
    setTagsInput('caméra, IP, extérieur, vidéosurveillance');
    setDefaultLocation('Dépôt principal');
    setErrors({});
  };

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
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nouveau produit</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Ajouter un produit au catalogue</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={fillDemo} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
                <WandSparkles className="w-4 h-4" /> Remplissage démo
              </button>
              <button 
                onClick={handleClose}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Sec 1: Informations générales */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">1. Informations générales</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Référence <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.reference || ''}
                    onChange={e => handleChange('reference', e.target.value)}
                    placeholder="REF-PRD-001"
                    className={cn(
                      "w-full px-3 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white",
                      errors.reference ? "border-red-300 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                    )}
                  />
                  {errors.reference && <p className="text-red-500 text-[10px] uppercase font-bold mt-1 ml-1">{errors.reference}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom du produit <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.name || ''}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Caméra Dôme IP 4MP"
                    className={cn(
                      "w-full px-3 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white",
                      errors.name ? "border-red-300 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                    )}
                  />
                  {errors.name && <p className="text-red-500 text-[10px] uppercase font-bold mt-1 ml-1">{errors.name}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description Technique</label>
                  <textarea 
                    value={formData.description || ''}
                    onChange={e => handleChange('description', e.target.value)}
                    rows={2}
                    placeholder="Spécifications détaillées du produit..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 md:col-span-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Famille / Catégorie <span className="text-red-500">*</span></label>
                    <CustomSelect 
                      value={formData.family || ''}
                      onChange={v => handleChange('family', v)}
                      options={FAMILY_OPTIONS}
                      className={errors.family ? "!border-red-300 focus:ring-red-500/20" : "focus:ring-indigo-500/20"}
                    />
                    {errors.family && <p className="text-red-500 text-[10px] uppercase font-bold mt-1 ml-1">{errors.family}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Marque</label>
                    <CustomSelect 
                      value={formData.brand || ''}
                      onChange={v => handleChange('brand', v)}
                      options={BRAND_OPTIONS}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Modèle</label>
                    <input 
                      type="text" 
                      value={formData.model || ''}
                      onChange={e => handleChange('model', e.target.value)}
                      placeholder="DS-2CD2143G0"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 md:col-span-2 gap-4">
                   <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Type d'article</label>
                    <CustomSelect 
                      value={formData.type || ''}
                      onChange={v => handleChange('type', v)}
                      options={TYPE_OPTIONS}
                    />
                  </div>
                   <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Statut Commercial</label>
                    <CustomSelect 
                      value={formData.status || 'Actif'}
                      onChange={v => handleChange('status', v as ProductStatus)}
                      options={STATUS_OPTIONS}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Sec 2: Tarification */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">2. Tarification (HT)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1.5 ml-1">Prix d'achat unitaire <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={formData.purchasePrice || 0}
                      onChange={e => handleChange('purchasePrice', parseFloat(e.target.value))}
                      className={cn(
                        "w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white font-mono",
                        errors.purchasePrice ? "border-red-300 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500"
                      )}
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-xs font-bold">DA</span>
                  </div>
                  {errors.purchasePrice && <p className="text-red-500 text-[10px] uppercase font-bold mt-1 ml-1">{errors.purchasePrice}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5 ml-1">Prix de vente public <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={formData.sellingPrice || 0}
                      onChange={e => handleChange('sellingPrice', parseFloat(e.target.value))}
                      className={cn(
                        "w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all sm:text-sm text-slate-900 dark:text-white font-mono",
                        errors.sellingPrice ? "border-red-300 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                      )}
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-xs font-bold">DA</span>
                  </div>
                  {errors.sellingPrice && <p className="text-red-500 text-[10px] uppercase font-bold mt-1 ml-1">{errors.sellingPrice}</p>}
                </div>
              </div>
            </section>

            {/* Sec 3: Stock & Paramètres */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">3. Stock & Paramètres</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                    <input 
                      type="checkbox"
                      id="isStockable"
                      checked={formData.isStockable || false}
                      onChange={e => handleChange('isStockable', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900"
                    />
                    <label htmlFor="isStockable" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest cursor-pointer select-none">
                      Produit Stockable
                    </label>
                  </div>
                  {isModuleEnabled('numeros-serie') && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                      <input 
                        type="checkbox"
                        id="requiresSerialNumber"
                        checked={formData.requiresSerialNumber || false}
                        onChange={e => handleChange('requiresSerialNumber', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900"
                      />
                      <label htmlFor="requiresSerialNumber" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest cursor-pointer select-none">
                        N° de série obligatoire
                      </label>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                   <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Seuil d'alerte (Min)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.minThreshold || 0}
                      onChange={e => handleChange('minThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Emplacement par défaut</label>
                    <CustomSelect 
                      value={defaultLocation}
                      onChange={v => setDefaultLocation(v)}
                      options={LOCATION_OPTIONS}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Sec 4: Fournisseur & Garanties */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">4. Fournisseur & Garanties</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fournisseur Principal</label>
                    <CustomSelect 
                      value={formData.mainSupplier || ''}
                      onChange={handleSupplierChange}
                      options={[{ value: '', label: 'Séléctionner...' }, ...suppliersList]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Produit du catalogue fournisseur</label>
                    <CustomSelect
                      value={selectedCatalogProduct}
                      onChange={handleCatalogProductChange}
                      options={[
                        { value: '', label: formData.mainSupplier ? 'Sélectionner un produit proposé...' : 'Sélectionnez d’abord un fournisseur' },
                        ...supplierCatalog.map((offer) => ({
                          value: offer.productId,
                          label: `${offer.productName} - ${Number(offer.purchasePrice || 0).toLocaleString()} ${offer.currency || 'DZD'}`,
                        })),
                      ]}
                    />
                    {formData.mainSupplier && supplierCatalog.length === 0 && (
                      <p className="mt-1 text-xs text-amber-600">Aucun produit référencé pour ce fournisseur.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Référence Fournisseur</label>
                    <input 
                      type="text" 
                      value={supplierRef}
                      onChange={e => setSupplierRef(e.target.value)}
                      placeholder="Ex: HIK-00234-A"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Garantie Fourn. (m)</label>
                    <input 
                      type="number"
                      min="0"
                      value={formData.supplierWarrantyMonths || 0}
                      onChange={e => handleChange('supplierWarrantyMonths', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Garantie Client (m)</label>
                    <input 
                      type="number"
                      min="0"
                      value={formData.clientWarrantyMonths || 0}
                      onChange={e => handleChange('clientWarrantyMonths', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Sec 5: Informations complémentaires */}
            <section className="space-y-4 pt-2">
               <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">5. Informations complémentaires</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mots-clés (tags)</label>
                    <input 
                      type="text" 
                      placeholder="IP, PoE, 4K, Extérieur..."
                      value={tagsInput}
                      onChange={e => setTagsInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                       <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 mb-1" />
                       <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Photo</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                       <FileText className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 mb-1" />
                       <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Technique</span>
                    </button>
                  </div>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3 rounded-b-2xl">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Check className="w-4 h-4" /> Ajouter le produit
            </button>
          </div>

        </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
