import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  MoreVertical, 
  Package, 
  User, 
  Calendar, 
  AlertCircle, 
  ShieldCheck, 
  Link as LinkIcon,
  Box,
  Truck,
  FileText,
  Activity,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Eye,
  Camera,
  Factory,
  Wrench,
  PenTool,
  Upload,
  History,
  FileDown
} from 'lucide-react';
import { ClientReturn, ReturnStatus } from './types';
import { cn, safeFormatDate, safeFormatDateTime } from '../../lib/utils';

export function RetoursClientStatusBadge({ status }: { status: ReturnStatus }) {
  const getStatusColor = (s: ReturnStatus) => {
    switch (s) {
      case 'Clôturé':
      case 'Résolu': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'En diagnostic':
      case 'Réparation en cours':
      case 'Remplacement prévu': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'En attente de réception':
      case 'Demande enregistrée':
      case 'Reçu': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Brouillon':
      case 'Annulé':
      case 'Retour refusé': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <span className={cn(
      "px-2.5 py-1 text-xs font-medium rounded-full border",
      getStatusColor(status)
    )}>
      {status}
    </span>
  );
}

interface RetoursClientDetailsProps {
  returnItem: ClientReturn;
  onBack: () => void;
  onUpdateStatus?: (status: any) => void;
}

export function RetoursClientDetails({ returnItem, onBack, onUpdateStatus }: RetoursClientDetailsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  const [showOptions, setShowOptions] = useState(false);

  const MOCK_DOCUMENTS = [
    { id: 1, name: 'Formulaire_Retour.pdf', type: 'PDF', date: returnItem.requestDate, size: '245 KB', color: 'text-red-500', bg: 'bg-red-100', icon: FileText },
    { id: 2, name: 'Bon_Retour_Client.pdf', type: 'PDF', date: returnItem.requestDate, size: '1.2 MB', color: 'text-red-500', bg: 'bg-red-100', icon: FileDown },
    { id: 3, name: 'Preuve_Reception.pdf', type: 'PDF', date: returnItem.receptionDate || returnItem.requestDate, size: '890 KB', color: 'text-red-500', bg: 'bg-red-100', icon: ShieldCheck },
    { id: 4, name: 'Photo_Defaut_1.jpg', type: 'Image', date: returnItem.requestDate, size: '3.4 MB', color: 'text-blue-500', bg: 'bg-blue-100', icon: Camera },
    { id: 5, name: 'Rapport_Diagnostic.pdf', type: 'PDF', date: returnItem.diagnostic?.date || returnItem.requestDate, size: '560 KB', color: 'text-red-500', bg: 'bg-red-100', icon: Activity }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900/50 absolute inset-0 z-10 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {returnItem.returnNumber}
              </h1>
              <RetoursClientStatusBadge status={returnItem.status} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {returnItem.clientName} • {returnItem.productName} ({returnItem.serialNumber})
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 relative">
          <button 
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
          >
            <PenTool className="w-4 h-4" />
            Modifier
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showOptions && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowOptions(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-2 z-40">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions sur la demande
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-slate-500" />
                    Modifier
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Valider la demande
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    Confirmer la réception
                  </button>
                  
                  <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Traitement SAV
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" />
                    Affecter un technicien
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    Démarrer le diagnostic
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    Enregistrer le diagnostic
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                    Valider la garantie
                  </button>
                  
                  <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Résolution
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-slate-500" />
                    Créer un remplacement
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2">
                    <Factory className="w-4 h-4 text-slate-500" />
                    Créer retour fournisseur
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-500" />
                    Confirmer restitution client
                  </button>

                  <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Autres Actions
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-slate-500" />
                    Ajouter un document
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-slate-500" />
                    Imprimer les documents
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-500" />
                    Consulter l'historique
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Clôturer
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Annuler
                  </button>
                  
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          
          {/* Main Content (Left) */}
          <div className="flex-1 space-y-6">
            
            {/* Résumé du retour */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <Box className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Résumé du retour</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Client</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{returnItem.clientName}</p>
                    {returnItem.projectName && <p className="text-xs text-slate-500 mt-1">{returnItem.projectName}</p>}
                    {returnItem.siteName && <p className="text-xs text-slate-500">{returnItem.siteName}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Contact</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{returnItem.contactName || 'Non spécifié'}</p>
                    {returnItem.contactPhone && <p className="text-xs text-slate-500 mt-1">{returnItem.contactPhone}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Produit / Équipement</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{returnItem.productName}</p>
                    <p className="text-xs font-mono text-slate-500 mt-1">SN: {returnItem.serialNumber}</p>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-2">
                    <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">{returnItem.reason}</p>
                        <p className="text-sm text-red-600/80 dark:text-red-300/80 mt-1">{returnItem.description || 'Aucune description détaillée.'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Date de demande</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {safeFormatDate(returnItem.requestDate)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Responsable interne</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {returnItem.technician}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Date de réception</p>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-400" />
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {returnItem.receptionDate ? safeFormatDate(returnItem.receptionDate) : 'En attente'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Origine et traçabilité */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <LinkIcon className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Origine et traçabilité</h2>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors group">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400 transition-colors">
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Fiche Produit</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{returnItem.productReference}</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors group">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400 transition-colors">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Livraison d'origine</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{returnItem.deliveryNumber || 'Non spécifiée'}</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors group">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 text-slate-500 group-hover:text-amber-600 dark:text-slate-400 dark:group-hover:text-amber-400 transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Garantie</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{returnItem.warrantyStatus}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Réception physique */}
            {returnItem.receptionPhysical && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Réception physique</h2>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {returnItem.warehouseZone}
                  </span>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Date et heure</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {safeFormatDateTime(returnItem.receptionPhysical.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Réceptionné par</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{returnItem.receptionPhysical.receivedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Quantité reçue</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{returnItem.receptionPhysical.qty} unité(s)</p>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">État réel constaté</p>
                      <p className="text-sm text-slate-900 dark:text-white font-medium">{returnItem.receptionPhysical.realCondition}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Accessoires et emballage</p>
                      <p className="text-sm text-slate-900 dark:text-white font-medium">
                        {returnItem.receptionPhysical.accessories} • {returnItem.receptionPhysical.packaging ? 'Emballage d\'origine' : 'Sans emballage'}
                      </p>
                    </div>
                    {returnItem.receptionPhysical.discrepancies && (
                      <div className="col-span-1 md:col-span-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30">
                        <p className="text-xs text-amber-700 dark:text-amber-400 mb-1 uppercase tracking-wider">Écarts par rapport à la déclaration</p>
                        <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">{returnItem.receptionPhysical.discrepancies}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Diagnostic */}
            {returnItem.diagnostic && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Diagnostic technique</h2>
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-full",
                    returnItem.diagnostic.warrantyCoverage === 'Pris en charge' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  )}>
                    {returnItem.diagnostic.warrantyCoverage}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5"><User className="w-4 h-4"/> {returnItem.diagnostic.technician}</div>
                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {safeFormatDate(returnItem.diagnostic.date)}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Symptômes constatés</h4>
                      <p className="text-sm text-slate-900 dark:text-white">{returnItem.diagnostic.symptoms}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tests réalisés</h4>
                      <p className="text-sm text-slate-900 dark:text-white">{returnItem.diagnostic.tests}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cause probable</h4>
                      <p className="text-sm text-slate-900 dark:text-white">{returnItem.diagnostic.probableCause}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pièces concernées</h4>
                      <p className="text-sm text-slate-900 dark:text-white">{returnItem.diagnostic.parts}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                    <h4 className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-1">Conclusion technique</h4>
                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">{returnItem.diagnostic.conclusion}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Décision et résolution */}
            {returnItem.decision && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Décision et résolution</h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{returnItem.decision.type}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Prévu pour :</span>
                      <span className="font-medium text-slate-900 dark:text-white">{safeFormatDate(returnItem.decision.expectedDate)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Responsable</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{returnItem.decision.responsible}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Coût estimé / facturé</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{returnItem.decision.cost}</p>
                    </div>
                    {returnItem.decision.replacementSerialNumber && (
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Nouveau N° de Série</p>
                        <p className="text-sm font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded inline-block">{returnItem.decision.replacementSerialNumber}</p>
                      </div>
                    )}
                  </div>
                  
                  {returnItem.decision.comment && (
                     <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                       <p className="text-sm text-slate-700 dark:text-slate-300">"{returnItem.decision.comment}"</p>
                     </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Historique View Toggle */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Historique de la demande</h2>
                  </div>
               </div>
               <div className="p-6">
                 {returnItem.history ? (
                   <div className="space-y-4">
                     {returnItem.history.map((event, index) => (
                       <div key={index} className="flex gap-4">
                         <div className="flex flex-col items-center">
                           <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5" />
                           {index < returnItem.history!.length - 1 && (
                             <div className="w-px h-full bg-slate-200 dark:bg-slate-700 my-1" />
                           )}
                         </div>
                         <div className="pb-4">
                           <div className="flex items-baseline gap-2 mb-1">
                             <p className="text-sm font-medium text-slate-900 dark:text-white">{event.action}</p>
                           </div>
                           <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                             <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {safeFormatDateTime(event.date)}</span>
                             <span className="flex items-center gap-1"><User className="w-3 h-3"/> {event.user}</span>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <p className="text-sm text-slate-500">Aucun historique disponible.</p>
                 )}
               </div>
            </div>

          </div>

          {/* Sidebar / Documents (Right) */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">Documents liés</h3>
                <button className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                  <Upload className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 space-y-1">
                {MOCK_DOCUMENTS.map((doc) => {
                  const Icon = doc.icon;
                  return (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={cn("p-2 rounded-lg shrink-0", doc.bg, doc.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {doc.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>{doc.type}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Printer className="w-4 h-4" />
                  Imprimer le dossier SAV
                </button>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Actions rapides</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors text-left">
                  <Package className="w-4 h-4 text-slate-400" />
                  Générer Bon de Transport
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors text-left">
                  <Truck className="w-4 h-4 text-slate-400" />
                  Créer Demande Enlèvement
                </button>
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
}
