import React, { useState, useRef, useEffect } from 'react';
import { ClientLivraison, LivraisonStatus } from './types';
import { ArrowLeft, Edit, Copy, Archive, FileText, CheckCircle2, PackageOpen, Truck, AlertTriangle, AlertCircle, ShoppingCart, User, MapPin, Calendar, Clock, Phone, File as FileIcon, Download, Eye, ExternalLink, Activity, Info } from 'lucide-react';
import { cn, safeFormatDate } from '../../lib/utils';
import { motion } from 'motion/react';
import { DeliverySlipPreview } from './DeliverySlipPreview';

interface LivraisonDetailsProps {
  livraison: ClientLivraison;
  onBack: () => void;
  onUpdate: (updated: ClientLivraison) => void;
  onEdit: (livraison: ClientLivraison) => void;
}

export function LivraisonDetails({ livraison: initialLivraison, onBack, onUpdate, onEdit }: LivraisonDetailsProps) {
  const [livraison, setLivraison] = useState<ClientLivraison>(initialLivraison);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isDeliverySlipOpen, setIsDeliverySlipOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLivraison(initialLivraison);
  }, [initialLivraison]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = (newStatus: LivraisonStatus) => {
    const updated = { ...livraison, status: newStatus };
    if (['Livrée', 'Partiellement livrée'].includes(newStatus)) {
      if (!updated.actualDate) {
        updated.actualDate = new Date().toISOString().split('T')[0];
      }
      if (newStatus === 'Livrée') {
        const notification = {
          id: `delivery-${livraison.id}`,
          title: 'Produits livrés chez le client',
          message: `${livraison.reference} est arrivée. Vous pouvez réaliser et faire signer le PV d'installation.`,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('sit-erp-technician-notification', JSON.stringify(notification));
        window.dispatchEvent(new CustomEvent('sit-erp-technician-notification', { detail: notification }));
      }
    }
    setLivraison(updated);
    onUpdate(updated);
    setIsOptionsOpen(false);
  };

  const getStatusColor = (status: LivraisonStatus) => {
    switch (status) {
      case 'Livrée': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Partiellement livrée': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800';
      case 'Prête': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'En cours': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'À préparer': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Avec anomalie':
      case 'Refusée':
      case 'Annulée': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Brouillon': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Basse': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
      case 'Haute': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Critique': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Normale':
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const calculateProgress = () => {
    if (!livraison.products || livraison.products.length === 0) return 0;
    const totalReq = livraison.products.reduce((acc, p) => acc + p.requestedQty, 0);
    const totalDelv = livraison.products.reduce((acc, p) => acc + (p.deliveredQty || 0), 0);
    return totalReq > 0 ? Math.round((totalDelv / totalReq) * 100) : 0;
  };

  const progress = calculateProgress();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-6 h-6 text-indigo-500" />
                {livraison.reference}
              </h2>
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(livraison.status))}>
                {livraison.status}
              </span>
              {(progress > 0 && progress < 100 && livraison.status !== 'Brouillon') && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {progress}% livré
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Client: {livraison.clientName} | Affaire: {livraison.projectName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(livraison)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
          >
            <Edit className="w-4 h-4" /> Modifier
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-lg shadow-sm transition-colors"
            >
               Actions
            </button>
            {isOptionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-1.5 text-slate-700 dark:text-slate-300">
                  {livraison.status === 'Brouillon' && (
                    <button onClick={() => handleStatusChange('À préparer')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Préparer la livraison
                    </button>
                  )}
                  {livraison.status === 'À préparer' && (
                    <button onClick={() => handleStatusChange('Prête')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <PackageOpen className="w-4 h-4 text-blue-500 shrink-0" /> Marquer Prête (Colisage terminé)
                    </button>
                  )}
                  {livraison.status === 'Prête' && (
                    <>
                      <button onClick={() => handleStatusChange('En cours')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Truck className="w-4 h-4 text-indigo-500 shrink-0" /> Confirmer le départ
                      </button>
                    </>
                  )}
                  {livraison.status === 'En cours' && (
                    <>
                      <button onClick={() => handleStatusChange('Livrée')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Confirmer la livraison (Totale)
                      </button>
                      <button onClick={() => handleStatusChange('Partiellement livrée')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> Déclarer livraison partielle
                      </button>
                      <button onClick={() => handleStatusChange('Refusée')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" /> Refus client
                      </button>
                    </>
                  )}
                  {livraison.status === 'Partiellement livrée' && (
                    <button onClick={() => handleStatusChange('Livrée')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Compléter la livraison (Totale)
                    </button>
                  )}
                  
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-1 line-separator" />
                  
                  {livraison.status !== 'Brouillon' && (
                    <button onClick={() => setIsOptionsOpen(false)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" /> Générer/Imprimer le BL
                    </button>
                  )}
                  <button onClick={() => setIsOptionsOpen(false)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-indigo-500 shrink-0" /> Dupliquer
                  </button>
                  <button onClick={() => handleStatusChange('Avec anomalie')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> Signaler une anomalie
                  </button>
                  {['Brouillon', 'À préparer', 'Prête'].includes(livraison.status) && (
                    <button onClick={() => handleStatusChange('Annulée')} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-red-600 dark:text-red-400">
                      <Archive className="w-4 h-4 text-red-500 shrink-0" /> Annuler la livraison
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Colonne Principale (Gauche, 2/3) */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Informations Générales */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/20">
                  <Info className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Informations de livraison</h3>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Client</span>
                    <div className="flex items-center gap-2">
                       <User className="w-4 h-4 text-slate-400" />
                       <span className="text-sm font-medium text-slate-900 dark:text-white">{livraison.clientName}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Projet / Affaire</span>
                    <div className="flex items-center gap-2">
                       <PackageOpen className="w-4 h-4 text-slate-400" />
                       <span className="text-sm font-medium text-slate-900 dark:text-white">{livraison.projectName}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Site de livraison</span>
                     <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-slate-400" />
                       <span className="text-sm font-medium text-slate-900 dark:text-white">{livraison.deliverySite}</span>
                     </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Adresse</span>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {livraison.address || '123 Rue Principale, 75000 Paris'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Contact client</span>
                     <div className="flex items-center gap-2">
                       <User className="w-4 h-4 text-slate-400" />
                       <span className="text-sm text-slate-700 dark:text-slate-300">{livraison.contactName || 'Non spécifié'}</span>
                     </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Téléphone</span>
                     <div className="flex items-center gap-2">
                       <Phone className="w-4 h-4 text-slate-400" />
                       <span className="text-sm text-slate-700 dark:text-slate-300">{livraison.contactPhone || 'Non spécifié'}</span>
                     </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Transporteur / Livreur</span>
                     <div className="flex items-center gap-2">
                       <Truck className="w-4 h-4 text-slate-400" />
                       <span className="text-sm text-slate-700 dark:text-slate-300">{livraison.carrier || 'Non assigné'}</span>
                     </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Date prévue</span>
                     <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-slate-400" />
                       <span className="text-sm text-slate-700 dark:text-slate-300">{safeFormatDate(livraison.plannedDate)}</span>
                     </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Date réelle</span>
                     <div className="flex items-center gap-2">
                       <Clock className="w-4 h-4 text-slate-400" />
                       <span className="text-sm text-slate-700 dark:text-slate-300">
                          {safeFormatDate(livraison.actualDate)}
                       </span>
                     </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Priorité</span>
                    <div>
                      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium border", getPriorityColor(livraison.priority))}>
                        {livraison.priority || 'Normale'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Produits livrés */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="flex items-center gap-2">
                     <PackageOpen className="w-4 h-4 text-slate-500" />
                     <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Produits livrés</h3>
                  </div>
                  <span className="text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded">
                    {livraison.products.length} articles
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-5 py-3 font-medium">Produit</th>
                        <th className="px-5 py-3 font-medium">Prévue</th>
                        <th className="px-5 py-3 font-medium">Livrée</th>
                        <th className="px-5 py-3 font-medium">Restante</th>
                        <th className="px-5 py-3 font-medium">Emplacement</th>
                        <th className="px-5 py-3 font-medium">Numéros de Série</th>
                        <th className="px-5 py-3 font-medium">État</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {livraison.products.map((product, idx) => {
                         const restant = product.requestedQty - (product.deliveredQty || 0);
                         return (
                           <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                             <td className="px-5 py-3">
                               <div className="font-medium text-slate-900 dark:text-white">
                                 {product.productName}
                               </div>
                               <div className="text-xs text-slate-500 font-mono mt-0.5">
                                 {product.productReference}
                               </div>
                             </td>
                             <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                               {product.requestedQty}
                             </td>
                             <td className="px-5 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                               {product.deliveredQty || 0}
                             </td>
                             <td className="px-5 py-3 text-slate-500">
                               {restant > 0 ? (
                                 <span className="text-amber-600 dark:text-amber-400">{restant}</span>
                               ) : (
                                 <span className="text-slate-400">-</span>
                               )}
                             </td>
                             <td className="px-5 py-3 text-slate-500">
                               <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">
                                 {livraison.warehouse}
                               </span>
                             </td>
                             <td className="px-5 py-3">
                               {product.deliveredQty > 0 ? (
                                 <div className="flex flex-col gap-1 text-xs font-mono text-slate-500">
                                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 w-fit">SN-{Math.floor(1000 + Math.random()*9000)}</span>
                                 </div>
                               ) : (
                                 <span className="text-slate-400 text-xs italic">En attente</span>
                               )}
                             </td>
                             <td className="px-5 py-3">
                               {restant === 0 ? (
                                 <span className="inline-flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                    Complète
                                 </span>
                               ) : restant < product.requestedQty ? (
                                 <span className="inline-flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                    Partielle
                                 </span>
                               ) : (
                                 <span className="inline-flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                                    À livrer
                                 </span>
                               )}
                             </td>
                           </tr>
                         );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confirmation client */}
              {['Livrée', 'Partiellement livrée', 'Avec anomalie', 'Refusée'].includes(livraison.status) && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Confirmation client</h3>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <div className="space-y-1">
                         <span className="text-xs text-slate-500 dark:text-slate-400">Réceptionné par</span>
                         <div className="text-sm font-medium text-slate-900 dark:text-white">
                           {livraison.authorizedPerson || livraison.contactName || 'Inconnu'}
                         </div>
                       </div>
                       <div className="space-y-1">
                         <span className="text-xs text-slate-500 dark:text-slate-400">Date et heure de remise</span>
                         <div className="text-sm font-medium text-slate-900 dark:text-white">
                           {livraison.actualDate ? `${safeFormatDate(livraison.actualDate)} à 14:30` : '-'}
                         </div>
                       </div>
                       <div className="space-y-1">
                         <span className="text-xs text-slate-500 dark:text-slate-400">Signature</span>
                         <div className="h-16 w-48 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded flex items-center justify-center italic text-slate-400 text-xl font-serif mt-1">
                           Signé
                         </div>
                       </div>
                    </div>
                    {livraison.status === 'Avec anomalie' || livraison.status === 'Partiellement livrée' ? (
                       <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-4 h-full">
                          <div className="flex items-center gap-2 text-red-800 dark:text-red-400 mb-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5" />
                            <h4 className="text-sm font-medium">Réserves / Anomalies</h4>
                          </div>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            - 1x Switch manquant dans le carton (Erreur préparation).
                            - Emballage Routeur légèrement abimé (Accepté sous réserve).
                          </p>
                       </div>
                    ) : (
                       <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-4 h-full">
                          <div className="flex items-start gap-2 text-emerald-800 dark:text-emerald-400">
                             <CheckCircle2 className="w-4 h-4 mt-0.5" />
                             <div>
                                <h4 className="text-sm font-medium">Livraison conforme</h4>
                                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Aucune réserve émise, tous les articles prévus ont été réceptionnés.</p>
                             </div>
                          </div>
                       </div>
                    )}
                  </div>
                </div>
              )}

              {/* Historique court */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                 <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/20">
                    <Activity className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Historique</h3>
                 </div>
                 <div className="p-5">
                    <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
                       
                       {['Livrée', 'Partiellement livrée', 'Avec anomalie'].includes(livraison.status) && (
                         <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                               <span className="text-sm font-medium text-slate-900 dark:text-white">Livraison effectuée</span>
                               <span className="text-xs text-slate-500">{safeFormatDate(livraison.actualDate)} - par Livreurs</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{livraison.status === 'Avec anomalie' ? 'Réception avec réserves.' : 'Remis au client.'}</p>
                         </div>
                       )}

                       {['En cours', 'Livrée', 'Partiellement livrée', 'Avec anomalie'].includes(livraison.status) && (
                         <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                               <span className="text-sm font-medium text-slate-900 dark:text-white">Départ expédition</span>
                               <span className="text-xs text-slate-500">{safeFormatDate(livraison.plannedDate)} - par Magasin</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Colis remis au transporteur ({livraison.carrier}).</p>
                         </div>
                       )}

                       {['Prête', 'En cours', 'Livrée', 'Partiellement livrée', 'Avec anomalie'].includes(livraison.status) && (
                         <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                               <span className="text-sm font-medium text-slate-900 dark:text-white">Colisage terminé</span>
                               <span className="text-xs text-slate-500">{safeFormatDate(livraison.createdAt)} - par Préparateur</span>
                            </div>
                         </div>
                       )}

                       <div className="relative">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-900" />
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                             <span className="text-sm font-medium text-slate-900 dark:text-white">Création livraison</span>
                             <span className="text-xs text-slate-500">{safeFormatDate(livraison.createdAt)} - par {livraison.responsible}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Colonne Documentaire (Droite, 1/3) */}
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4" />
                  Documents rattachés
                </h3>
                
                <div className="space-y-3">
                  {/* BL */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 group hover:border-indigo-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                        <FileIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Bon de Livraison</p>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">PDF</span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{livraison.deliverySlipNumber}</p>
                        
                        <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => setIsDeliverySlipOpen(true)} className="text-xs flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                             <Eye className="w-3 h-3" /> Voir
                           </button>
                           <span className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                           <button onClick={() => window.print()} className="text-xs flex items-center gap-1 font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
                             <Download className="w-3 h-3" /> Télécharger
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bon de sortie */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 group hover:border-indigo-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Bon de Sortie Stock</p>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">SYS</span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{livraison.sourceOutboundReference || 'Bon de sortie lié'}</p>
                        <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="text-xs flex items-center gap-1 font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400">
                             <ExternalLink className="w-3 h-3" /> Ouvrir la sortie
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preuve de livraison */}
                  {['Livrée', 'Partiellement livrée'].includes(livraison.status) && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 group hover:border-indigo-300 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                          <FileIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Preuve de Livraison</p>
                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">PDF</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Signé le {safeFormatDate(livraison.actualDate)}</p>
                          
                          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="text-xs flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                               <Eye className="w-3 h-3" /> Voir
                             </button>
                             <span className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                             <button className="text-xs flex items-center gap-1 font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
                               <Download className="w-3 h-3" /> Télécharger
                             </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 dark:text-slate-400 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20 transition-all">
                    Ajouter un document
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <DeliverySlipPreview livraison={livraison} isOpen={isDeliverySlipOpen} onClose={() => setIsDeliverySlipOpen(false)} />
    </div>
  );
}
