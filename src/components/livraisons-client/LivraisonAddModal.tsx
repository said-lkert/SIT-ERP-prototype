import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ClientLivraison, LivraisonProduct, LivraisonStatus } from './types';
import { X, Check, Search, Plus, Trash2, AlertCircle, Save, Send, WandSparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';

interface LivraisonAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (res: ClientLivraison, isDraft?: boolean) => void;
}

const PROJECTS = ['Déploiement Fibre Zone Nord', 'Maintenance Serveurs DB', 'Installation Caméras', 'Mise à niveau Routeurs', 'Événement Tech Summit'];
const SOURCES = ['Sélection manuelle', 'Réservation de stock', 'Besoins du projet', 'Bon de sortie'];
const TRANSPORT_MODES = ['Interne', 'Transporteur', 'Retrait sur place'];
const CARRIERS = ['Camion Interne 1', 'Camion Interne 2', 'DHL Express', 'UPS', 'FedEx'];

export function LivraisonAddModal({ isOpen, onClose, onSave }: LivraisonAddModalProps) {
  const [formData, setFormData] = useState<Partial<ClientLivraison>>({
    projectName: '',
    clientName: '',
    deliverySite: '',
    status: 'Brouillon',
    plannedDate: '',
    responsible: 'Utilisateur Connecté',
    carrier: '',
    products: []
  });

  const [address, setAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [priority, setPriority] = useState('Normale');
  const [comment, setComment] = useState('');
  
  const [source, setSource] = useState('Sélection manuelle');
  const [transportMode, setTransportMode] = useState('Interne');
  const [expeditionReference, setExpeditionReference] = useState('');
  const [authorizedPerson, setAuthorizedPerson] = useState('');
  const [outbounds, setOutbounds] = useState<any[]>([]);
  const [selectedOutboundId, setSelectedOutboundId] = useState('');

  const [products, setProducts] = useState<Partial<LivraisonProduct>[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        projectName: '',
        clientName: '',
        deliverySite: '',
        status: 'Brouillon',
        plannedDate: '',
        responsible: 'Jean Admin',
        carrier: 'Camion Interne 1',
        reference: `LIV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        deliverySlipNumber: `BL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString().split('T')[0],
      });
      setAddress('');
      setContactName('');
      setContactPhone('');
      setPriority('Normale');
      setComment('');
      setSource('Sélection manuelle');
      setTransportMode('Interne');
      setExpeditionReference('');
      setAuthorizedPerson('');
      setSelectedOutboundId('');
      setProducts([]);
      setErrors({});
      setHasChanges(false);
      setShowConfirmClose(false);
      fetch('/api/outbounds')
        .then(response => response.json())
        .then(data => setOutbounds(Array.isArray(data) ? data : []))
        .catch(() => setOutbounds([]));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (hasChanges) {
       setShowConfirmClose(true);
    } else {
       onClose();
    }
  };

  const confirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  const cancelClose = () => {
    setShowConfirmClose(false);
  };


  const handleChange = (updater: any) => {
    setHasChanges(true);
    updater();
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!selectedOutboundId) newErrors.outbound = 'Sélectionnez un bon de sortie';
    if (!formData.projectName) newErrors.projectName = 'Ce champ est requis';
    if (!formData.plannedDate) newErrors.plannedDate = 'Ce champ est requis';
    
    products.forEach((p, index) => {
      if (!p.productId) {
        newErrors[`product_${index}_id`] = 'Produit requis';
      }
      if (!p.requestedQty || p.requestedQty <= 0) {
        newErrors[`product_${index}_qty`] = 'Quantité valide requise';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (statusChange?: LivraisonStatus) => {
    if (validate()) {
      const formattedProducts: LivraisonProduct[] = products.map((p, i) => ({
        id: `temp_p_${i}`,
        productId: p.productId || '',
        productReference: p.productReference || '',
        productName: p.productName || '',
        requestedQty: p.requestedQty || 0,
        deliveredQty: statusChange === 'À préparer' ? 0 : 0,
      }));

      const livraison: ClientLivraison = {
        ...formData,
        id: `temp_${Date.now()}`,
        products: formattedProducts,
        status: statusChange || 'Brouillon',
      } as ClientLivraison;

      onSave(livraison, statusChange === 'Brouillon');
      onClose();
    }
  };

  const markChanged = () => setHasChanges(true);

  const addProductLine = () => {
    markChanged();
    setProducts([...products, { productId: '', requestedQty: 1, productName: '', productReference: '' }]);
  };

  const removeProductLine = (index: number) => {
    markChanged();
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProductLine = (index: number, field: string, value: any) => {
    markChanged();
    const updated = [...products];

    updated[index] = { ...updated[index], [field]: value };
    
    // Simulate auto-fill on product selection
    if (field === 'productName' && value === 'Câble Fibre Optique') {
      updated[index].productReference = 'FIB-100';
      updated[index].productId = '101';
    } else if (field === 'productName' && value === 'Routeur Cisco 9000') {
      updated[index].productReference = 'ROUT-C';
      updated[index].productId = '106';
    } else if (field === 'productName') {
      updated[index].productReference = 'REF-AUTO';
      updated[index].productId = `999${index}`;
    }

    setProducts(updated);
  };

  const handleProjectChange = (projectName: string) => {
    markChanged();
    setFormData({ 
      ...formData, 
      projectName, 
      clientName: projectName ? 'Client Auto ' + projectName.substring(0,5) : '',
      deliverySite: projectName ? 'Site Principal' : ''
    });
    setAddress(projectName ? '123 Rue de la République, 75001 Paris' : '');
    setContactName(projectName ? 'Marie Durand' : '');
    setContactPhone(projectName ? '06 12 34 56 78' : '');
    if (errors.projectName) setErrors({ ...errors, projectName: '' });
  };

  const applyOutbound = (outboundId: string) => {
    const outbound = outbounds.find(item => item.id === outboundId);
    setSelectedOutboundId(outboundId);
    if (!outbound) return;

    const projectName = outbound.destinationName || 'Projet client';
    setFormData(current => ({
      ...current,
      projectName,
      clientName: projectName,
      deliverySite: 'Site principal',
      warehouse: outbound.warehouseName || outbound.sourceWarehouse || 'Entrepot principal',
      sourceOutboundReference: outbound.reference,
      carrier: 'Camion Interne 1',
      plannedDate: new Date().toISOString().split('T')[0],
    }));
    setAddress('Adresse principale du client');
    setContactName('Responsable du site');
    setContactPhone('0550 12 34 56');
    setSource('Bon de sortie');
    setComment(`Livraison preparee depuis le bon de sortie ${outbound.reference}.`);
    setProducts((outbound.products || []).map((product: any) => ({
      productId: product.id,
      productReference: product.reference,
      productName: product.name,
      requestedQty: product.qtyOut || product.qtyRequested || 1,
    })));
    setHasChanges(true);
    setErrors({});
  };

  const fillDemo = () => {
    const outbound = outbounds.find(item => (item.products || []).length > 0) || outbounds[0];
    if (outbound) {
      applyOutbound(outbound.id);
      return;
    }

    setSelectedOutboundId('demo-outbound');
    setFormData(current => ({
      ...current,
      projectName: 'Installation reseau - Hotel Les Oliviers',
      clientName: 'Hotel Les Oliviers',
      deliverySite: 'Site principal',
      warehouse: 'Entrepot principal',
      sourceOutboundReference: 'SOR-0001',
      plannedDate: new Date().toISOString().split('T')[0],
      carrier: 'Camion Interne 1',
    }));
    setAddress('Tizi-Ouzou, site principal');
    setContactName('Responsable du site');
    setContactPhone('0550 12 34 56');
    setSource('Bon de sortie');
    setProducts([
      { productId: 'demo-product-1', productReference: 'CAM-IP-001', productName: 'Camera IP', requestedQty: 4 },
      { productId: 'demo-product-2', productReference: 'SW-POE-001', productName: 'Switch PoE', requestedQty: 1 },
    ]);
    setHasChanges(true);
    setErrors({});
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[100vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nouvelle livraison client</h2>
            <p className="text-sm text-slate-500">Préparez l'expédition de matériel vers un site client.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fillDemo}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <WandSparkles className="w-4 h-4" /> Remplissage demo
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <section>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Informations générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bon de sortie a livrer *</label>
                <select
                  value={selectedOutboundId}
                  onChange={(event) => event.target.value === 'demo-outbound' ? fillDemo() : applyOutbound(event.target.value)}
                  className={cn(
                    "w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500",
                    errors.outbound ? "border-red-300 focus:ring-red-500" : "border-slate-300 dark:border-slate-700"
                  )}
                >
                  <option value="">Selectionner un bon de sortie</option>
                  {outbounds.map(outbound => (
                    <option key={outbound.id} value={outbound.id}>
                      {outbound.reference} - {outbound.destinationName} - {outbound.totalQty || 0} produit(s)
                    </option>
                  ))}
                  {outbounds.length === 0 && <option value="demo-outbound">SOR-0001 - Demonstration</option>}
                </select>
                <p className="mt-1 text-xs text-slate-500">Le projet et les produits sortis sont repris automatiquement.</p>
                {errors.outbound && <p className="mt-1 text-xs text-red-500">{errors.outbound}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">N° Livraison (Auto)</label>
                <input
                  type="text"
                  value={formData.reference}
                  disabled
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Projet / Affaire *</label>
                <select
                  value={formData.projectName}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500",
                    errors.projectName ? "border-red-300 dark:border-red-700 focus:ring-red-500" : "border-slate-300 dark:border-slate-700"
                  )}
                >
                  <option value="">Sélectionner un projet</option>
                  {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.projectName && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.projectName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client *</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => { markChanged(); setFormData({ ...formData, clientName: e.target.value }); }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Site de livraison</label>
                <input
                  type="text"
                  value={formData.deliverySite}
                  onChange={(e) => { markChanged(); setFormData({ ...formData, deliverySite: e.target.value }); }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adresse de livraison (Auto)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => { markChanged(); setAddress(e.target.value); }}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm text-slate-700 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact client</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => { markChanged(); setContactName(e.target.value); }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Téléphone contact</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => { markChanged(); setContactPhone(e.target.value); }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date prévue *</label>
                <input
                  type="date"
                  value={formData.plannedDate}
                  onChange={(e) => {
                    markChanged();
                    setFormData({ ...formData, plannedDate: e.target.value });
                    if (errors.plannedDate) setErrors({ ...errors, plannedDate: '' });
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100",
                    errors.plannedDate ? "border-red-300 dark:border-red-700 focus:ring-red-500" : "border-slate-300 dark:border-slate-700"
                  )}
                />
                {errors.plannedDate && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.plannedDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsable interne</label>
                <input
                  type="text"
                  value={formData.responsible}
                  onChange={(e) => { markChanged(); setFormData({ ...formData, responsible: e.target.value }); }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Commentaire interne</label>
                <textarea
                  value={comment}
                  onChange={(e) => { markChanged(); setComment(e.target.value); }}
                  rows={1}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 resize-none"
                  placeholder="Notes..."
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Source des produits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {SOURCES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 border rounded-xl transition-all",
                    source === s 
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" 
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <span className="text-sm font-medium">{s}</span>
                </button>
              ))}
            </div>
            {source === 'Réservation de stock' && (
              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-amber-200 dark:border-amber-800/30">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Veuillez sélectionner une réservation liée au projet pour importer les produits. (Simulation)
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Produits à livrer</h3>
              <button
                type="button"
                onClick={addProductLine}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
                disabled={source !== 'Sélection manuelle'}
              >
                <Plus className="w-4 h-4" /> Ajouter une ligne
              </button>
            </div>

            <div className="space-y-4">
              {products.map((p, index) => (
                <div key={index} className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                  <button
                    type="button"
                    onClick={() => removeProductLine(index)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-4">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Produit</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={p.productName}
                          onChange={(e) => updateProductLine(index, 'productName', e.target.value)}
                          placeholder="Rechercher..."
                          className={cn(
                            "w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100",
                            errors[`product_${index}_id`] ? "border-red-300 dark:border-red-700" : "border-slate-300 dark:border-slate-700"
                          )}
                        />
                      </div>
                      {p.productReference && (
                        <div className="mt-1 text-xs text-slate-500 font-mono">Réf: {p.productReference}</div>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                       <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Entrepôt</label>
                       <select
                         className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                       >
                         <option value="Magasin Central">Magasin Central</option>
                         <option value="Magasin IT">Magasin IT</option>
                       </select>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 text-center truncate">Prévue</label>
                      <div className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 text-center">
                        {p.productName ? '10' : '-'}
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 text-center truncate">Réservé</label>
                      <div className="px-3 py-2 text-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-lg text-emerald-700 dark:text-emerald-400 text-center font-medium">
                        {p.productName ? '5' : '-'}
                      </div>
                    </div>
                    
                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 text-center truncate">Livrée</label>
                      <div className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 text-center">
                        {p.productName ? '0' : '-'}
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">À livrer mtnt</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={p.requestedQty || ''}
                          onChange={(e) => updateProductLine(index, 'requestedQty', parseInt(e.target.value) || 0)}
                          className={cn(
                            "w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 text-center",
                            errors[`product_${index}_qty`] ? "border-red-300 dark:border-red-700" : "border-slate-300 dark:border-slate-700"
                          )}
                        />
                        {/* Numéro de série toggle */}
                        <button className="px-3 py-2 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                          S/N
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {products.length === 0 && (
                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aucun produit ajouté pour le moment.</p>
                  <button
                    type="button"
                    onClick={addProductLine}
                    className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    Ajouter le premier produit
                  </button>
                </div>
              )}
            </div>
          </section>
          
          <section>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Transport et remise</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mode de livraison</label>
                <CustomSelect
                  value={transportMode}
                  onChange={(val) => { markChanged(); setTransportMode(val); }}
                  options={TRANSPORT_MODES.map(m => ({ value: m, label: m }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Transporteur / Véhicule</label>
                <select
                  value={formData.carrier}
                  onChange={(e) => { markChanged(); setFormData({ ...formData, carrier: e.target.value }); }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Sélectionner</option>
                  {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Réf. d'expédition (Tracking)</label>
                <input
                  type="text"
                  value={expeditionReference}
                  onChange={(e) => { markChanged(); setExpeditionReference(e.target.value); }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Personne autorisée à réceptionner</label>
                <input
                  type="text"
                  value={authorizedPerson}
                  onChange={(e) => { markChanged(); setAuthorizedPerson(e.target.value); }}
                  placeholder="Laisser vide si contact client"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Consignes de livraison</label>
                <textarea
                  rows={1}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 resize-none"
                  placeholder="Ex: Livrer par l'entrée de service..."
                />
              </div>
            </div>
          </section>

        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 rounded-b-2xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
          >
            Annuler
          </button>
          <div className="flex items-center gap-3">
             <button
                onClick={() => handleSave('Brouillon')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
             >
                <Save className="w-4 h-4" /> Brouillon
             </button>
             <button
                onClick={() => handleSave('À préparer')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-transparent rounded-lg shadow-sm hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
             >
                <Check className="w-4 h-4" /> Enregistrer et préparer
             </button>
             <button
                onClick={() => handleSave('Prête')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
             >
                <Send className="w-4 h-4" /> Valider la livraison
             </button>
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmClose && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={cancelClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Modifications non enregistrées</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Voulez-vous vraiment quitter ? Toutes vos modifications seront perdues.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Quitter sans sauvegarder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {isOpen && modalContent}
    </AnimatePresence>,
    document.body
  );
}
