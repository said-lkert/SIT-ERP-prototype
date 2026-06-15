import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, FileText, Plus, Trash2, ShoppingCart, Calendar, Building, DollarSign, Package, MapPin, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, safeFormatDate } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { Fournisseur } from './types';

interface FournisseurOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  fournisseur: Fournisseur;
  onSave: (order: any) => void;
}

const STATUS_OPTIONS = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'validee', label: 'Validée' },
  { value: 'envoyee', label: 'Envoyée' },
  { value: 'annulee', label: 'Annulée' },
];

const CURRENCY_OPTIONS = [
  { value: 'DZD', label: 'DZD (Dinar Algérien)' },
  { value: 'EUR', label: 'EUR (Euro)' },
  { value: 'USD', label: 'USD (Dollar AM)' },
];

const PAYMENT_OPTIONS = [
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'especes', label: 'Espèces' },
  { value: 'reception', label: 'Paiement à réception' },
];

const DEMO_PRODUCTS = [
  { id: 'p1', name: 'DS-2CD2143G0 Camera Dome 4MP', ref: 'CAM-DS-01' },
  { id: 'p2', name: 'Switch PoE Managed 24p TP-Link', ref: 'SW-POE-24' },
  { id: 'p3', name: 'Smart-UPS 1500VA APC', ref: 'UPS-APC-1500' },
  { id: 'p4', name: 'Routeur CCR2004 MikroTik', ref: 'RT-MIK-04' },
  { id: 'p5', name: 'PowerEdge T350 Xeon Server', ref: 'SRV-DELL-350' },
  { id: 'p6', name: 'K40 Lecteur Empreintes ZKTeco', ref: 'ACC-ZK-K40' },
  { id: 'p7', name: 'Bobine Fibre Monomode 300m', ref: 'FIB-SM-300' }
];

const EXEMPLES_DOCUMENTS = [
  { name: 'Devis fournisseur', type: 'PDF', size: '1.2 MB' },
  { name: 'Proforma', type: 'PDF', size: '850 KB' },
  { name: 'Grille tarifaire', type: 'XLSX', size: '540 KB' },
  { name: 'Contrat fournisseur', type: 'PDF', size: '2.1 MB' },
  { name: 'Conditions commerciales', type: 'DOCX', size: '120 KB' }
];

export function FournisseurOrderModal({ isOpen, onClose, fournisseur, onSave }: FournisseurOrderModalProps) {
  const [dateCommande, setDateCommande] = useState('');
  const [referenceCommande, setReferenceCommande] = useState('');
  const [dateLivraison, setDateLivraison] = useState('');
  const [responsable, setResponsable] = useState('John Doe'); // Default user
  const [statut, setStatut] = useState('brouillon');
  const [commentaire, setCommentaire] = useState('');
  
  const [orderItems, setOrderItems] = useState<any[]>([]);
  
  const [modePaiement, setModePaiement] = useState('virement');
  const [devise, setDevise] = useState('DZD');
  const [remiseGlobale, setRemiseGlobale] = useState('0');
  const [fraisLivraison, setFraisLivraison] = useState('0');
  const [conditionsParticulieres, setConditionsParticulieres] = useState('');
  
  const [documents, setDocuments] = useState<any[]>([]);
  const [nextDocIndex, setNextDocIndex] = useState(0);

  const [showConfirmClose, setShowConfirmClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDateCommande(new Date().toISOString().split('T')[0]);
      setReferenceCommande(`CMD-${fournisseur.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDateLivraison(nextWeek.toISOString().split('T')[0]);
      setResponsable('Mina Admin');
      setStatut('brouillon');
      setCommentaire('');
      setOrderItems([]);
      setModePaiement('virement');
      setDevise(fournisseur.modePaiement?.includes('EUR') ? 'EUR' : fournisseur.modePaiement?.includes('USD') ? 'USD' : 'DZD');
      setRemiseGlobale('0');
      setFraisLivraison('0');
      setConditionsParticulieres('');
      setDocuments([]);
      setNextDocIndex(0);
      setShowConfirmClose(false);
    }
  }, [isOpen, fournisseur]);

  const isFormDirty = () => {
    return orderItems.length > 0 || commentaire.trim() !== '' || conditionsParticulieres.trim() !== '' || documents.length > 0;
  };

  const handleCloseAttempt = () => {
    if (isFormDirty()) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleAddItem = () => {
    const randomProduct = DEMO_PRODUCTS[Math.floor(Math.random() * DEMO_PRODUCTS.length)];
    const newItem = {
      id: `item-${Date.now()}`,
      produit: randomProduct.name,
      reference: randomProduct.ref,
      quantite: 1,
      prixUnitaire: Math.floor(Math.random() * 10000) + 1000,
      delaiPrev: '7 jours'
    };
    setOrderItems([...orderItems, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setOrderItems(orderItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddDocument = () => {
    const template = EXEMPLES_DOCUMENTS[nextDocIndex % EXEMPLES_DOCUMENTS.length];
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: template.name,
      type: template.type,
      size: template.size
    };
    setDocuments([...documents, newDoc]);
    setNextDocIndex(prev => prev + 1);
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  const getSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantite * item.prixUnitaire), 0);
  };

  const getTotalQuantity = () => {
    return orderItems.reduce((sum, item) => sum + item.quantite, 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const discount = parseFloat(remiseGlobale) || 0;
    const shipping = parseFloat(fraisLivraison) || 0;
    return subtotal - discount + shipping;
  };

  const handleSave = (targetStatut: string) => {
    const newOrder = {
      id: `order-${Date.now()}`,
      reference: referenceCommande,
      dateCommande,
      dateLivraison,
      fournisseur: fournisseur.name,
      fournisseurId: fournisseur.id,
      statut: targetStatut,
      amount: getTotal(),
      currency: devise,
      items: orderItems,
      itemsCount: orderItems.length,
      quantiteTotale: getTotalQuantity(),
      responsable,
    };
    onSave(newOrder);
    onClose();
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
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-md"
            onClick={handleCloseAttempt}
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-700 dark:text-slate-200"
          >
            {/* Form Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-indigo-500" />
                  Nouvelle commande fournisseur
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Préparer une commande de produits auprès du fournisseur sélectionné.
                </p>
              </div>
              <button 
                onClick={handleCloseAttempt}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-amber-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* SECTION 1: Informations commande */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">1. Informations commande</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Fournisseur
                    </label>
                    <div className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-400" />
                      {fournisseur.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Référence commande
                    </label>
                    <input 
                      type="text" 
                      value={referenceCommande}
                      onChange={e => setReferenceCommande(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Date de commande
                    </label>
                    <input 
                      type="date" 
                      value={dateCommande}
                      onChange={e => setDateCommande(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Date de livraison prévue
                    </label>
                    <input 
                      type="date" 
                      value={dateLivraison}
                      onChange={e => setDateLivraison(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Responsable
                    </label>
                    <input 
                      type="text" 
                      value={responsable}
                      onChange={e => setResponsable(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Commentaire
                    </label>
                    <textarea 
                      value={commentaire}
                      onChange={e => setCommentaire(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 2: Produits à commander */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">2. Produits à commander</h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg border border-indigo-200 dark:border-indigo-800/60 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter un produit
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">Produit</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">Réf. Fournisseur</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap w-32">Qté</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap w-40">Prix Achat</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap w-32">Délai Prévu</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap w-16 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {orderItems.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center bg-slate-50/30 dark:bg-slate-900/20">
                              <Package className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aucun produit sélectionné</p>
                              <p className="text-xs text-slate-400 mt-1">Cliquez sur « Ajouter un produit » pour commencer</p>
                            </td>
                          </tr>
                        ) : (
                          orderItems.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="px-4 py-2.5">
                                <input 
                                  type="text" 
                                  value={item.produit}
                                  onChange={e => updateItem(item.id, 'produit', e.target.value)}
                                  className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white border-0 p-0 focus:ring-0 placeholder:text-slate-400"
                                />
                              </td>
                              <td className="px-4 py-2.5">
                                <input 
                                  type="text" 
                                  value={item.reference}
                                  onChange={e => updateItem(item.id, 'reference', e.target.value)}
                                  className="w-full bg-transparent text-sm text-slate-600 dark:text-slate-300 border-0 p-0 focus:ring-0 font-mono"
                                />
                              </td>
                              <td className="px-4 py-2.5">
                                <input 
                                  type="number" 
                                  min="1"
                                  value={item.quantite}
                                  onChange={e => updateItem(item.id, 'quantite', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                />
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="relative">
                                  <input 
                                    type="number"
                                    min="0"
                                    value={item.prixUnitaire}
                                    onChange={e => updateItem(item.id, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1.5 pl-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                  />
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">{devise}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5">
                                <input 
                                  type="text" 
                                  value={item.delaiPrev}
                                  onChange={e => updateItem(item.id, 'delaiPrev', e.target.value)}
                                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                />
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <button 
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* SECTION 3: Conditions commerciales */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">3. Conditions commerciales</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
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
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Devise
                    </label>
                    <CustomSelect 
                      value={devise}
                      onChange={setDevise}
                      options={CURRENCY_OPTIONS}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Remise globale
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={remiseGlobale}
                        onChange={e => setRemiseGlobale(e.target.value)}
                        className="w-full pl-6 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">-</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Frais de port / annexes
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={fraisLivraison}
                        onChange={e => setFraisLivraison(e.target.value)}
                        className="w-full pl-6 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">+</span>
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Conditions particulières (Incoterm, Livraison partiel...)
                    </label>
                    <input 
                      type="text" 
                      value={conditionsParticulieres}
                      onChange={e => setConditionsParticulieres(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 4: Documents */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-pink-500 rounded-full" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">4. Documents liés</h3>
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
                    <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Aucun document joint à la commande.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <AnimatePresence initial={false}>
                      {documents.map(doc => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 transition-all border-l-4 border-l-indigo-500 group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                            <div className="overflow-hidden">
                              <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate pr-2">{doc.name}</div>
                              <div className="text-[10px] text-slate-500">{doc.type} • {doc.size}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveDocument(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </section>

              {/* SECTION 5: Résumé */}
              <section className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-end">
                <div className="flex flex-wrap gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 px-4 shadow-sm min-w-[120px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Tag className="w-3 h-3" /> Produits</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{orderItems.length}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 px-4 shadow-sm min-w-[120px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Package className="w-3 h-3" /> Quantité</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{getTotalQuantity()}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 px-4 shadow-sm min-w-[120px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Prévue le</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none pt-1">
                      {dateLivraison ? safeFormatDate(dateLivraison) : '-'}
                    </p>
                  </div>
                </div>

                <div className="text-right bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-4 shadow-sm min-w-[200px]">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 flex items-center justify-end gap-1.5"><DollarSign className="w-3 h-3" /> Valeur estimée</p>
                  <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400 leading-none">
                    {getTotal().toLocaleString()} <span className="text-lg text-indigo-500 font-bold">{devise}</span>
                  </p>
                </div>
              </section>

            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between rounded-b-2xl">
              <button
                type="button"
                onClick={handleCloseAttempt}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors uppercase tracking-widest text-[10px]"
              >
                Annuler
              </button>
              
              <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest">
                <button
                  type="button"
                  onClick={() => handleSave('brouillon')}
                  className="px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  Brouillon
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('validee')}
                  className="flex items-center gap-2 px-5 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-lg shadow-md transition-all"
                >
                  <Check className="w-4 h-4" />
                  Valider la commande
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSave('envoyee');
                    // Simulate export logic here
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 dark:border-indigo-800 dark:hover:bg-indigo-900/50 rounded-lg shadow-sm transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Exporter bon</span>
                </button>
              </div>
            </div>

            {/* Confirm Close */}
            <AnimatePresence>
              {showConfirmClose && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-700 dark:text-slate-200"
                  >
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Fermer sans enregistrer ?</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                      Toutes les informations saisies pour cette commande seront perdues.
                    </p>
                    <div className="flex justify-end gap-3 text-xs font-bold uppercase tracking-widest">
                      <button
                        onClick={() => setShowConfirmClose(false)}
                        className="px-4 py-2.5 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 rounded-lg"
                      >
                        Continuer
                      </button>
                      <button
                        onClick={() => {
                          setShowConfirmClose(false);
                          onClose();
                        }}
                        className="px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-colors"
                      >
                        Fermer définitivement
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
