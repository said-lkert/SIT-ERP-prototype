import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Edit2, MoreVertical, FileText, CheckCircle2, AlertCircle, Clock, MapPin, Search, Calendar, FileDown, Printer, Copy, RefreshCw, Send, CheckSquare, XCircle, FileSignature, FolderOpen, Image as ImageIcon } from 'lucide-react';
import { InstallationPV, PVStatus, PVResult } from './types';
import { cn, safeFormatDate } from '../../lib/utils';
import { PVAddModal } from './PVAddModal';
import { PVDocumentPreview } from './PVDocumentPreview';

interface PVDetailsProps {
  pv: InstallationPV;
  onBack: () => void;
  onUpdate?: (pv: InstallationPV) => void;
}

export function PVDetails({ pv: initialPV, onBack, onUpdate }: PVDetailsProps) {
  const [pv, setPv] = useState(initialPV);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPVPreviewOpen, setIsPVPreviewOpen] = useState(false);

  const getStatusColor = (status: PVStatus) => {
    switch (status) {
      case 'Signé': return 'bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'Signé avec réserves': return 'bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'En attente de signature': return 'bg-blue-100/80 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'Brouillon': return 'bg-slate-100/80 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
      case 'À compléter': return 'bg-purple-100/80 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
      case 'Refusé':
      case 'Annulé': return 'bg-red-100/80 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      default: return 'bg-slate-100/80 text-slate-700 border-slate-200';
    }
  };

  const getResultColor = (result: PVResult) => {
    switch (result) {
      case 'Installation conforme': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10';
      case 'Conforme avec réserves': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10';
      case 'Non conforme': 
      case 'Tests à reprendre': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10';
    }
  };

  const isEditable = pv.status === 'Brouillon' || pv.status === 'À compléter';

  const documents = [
    { id: 1, name: 'PV_Installation_Signe.pdf', type: 'PV Signé', date: pv.signatureDate || pv.createdAt, size: '450 KB', icon: FileSignature, color: 'text-emerald-500' },
    { id: 2, name: `${pv.reference}.pdf`, type: 'Généré via PV', date: pv.createdAt, size: '430 KB', icon: FileText, color: 'text-blue-500' },
    { id: 3, name: `BL_${pv.projectName.replace(/\s+/g, '_')}.pdf`, type: 'Bon de livraison', date: pv.createdAt, size: '1.2 MB', icon: FileDown, color: 'text-purple-500' },
    { id: 4, name: 'Photos_Installation.zip', type: 'Archive zip', date: pv.createdAt, size: '15.4 MB', icon: ImageIcon, color: 'text-amber-500' }
  ];

  const handleUpdate = (updatedPV: InstallationPV) => {
    setPv(updatedPV);
    setIsEditModalOpen(false);
    if (onUpdate) onUpdate(updatedPV);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900/50 relative">
      {/* Header Sticky */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {pv.reference}
                </h1>
                <span className={cn(
                  "px-2.5 py-0.5 text-xs font-semibold rounded-full border",
                  getStatusColor(pv.status)
                )}>
                  {pv.status}
                </span>
                <span className={cn(
                  "px-2.5 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1",
                  getResultColor(pv.result)
                )}>
                  {pv.result === 'Installation conforme' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {pv.result === 'Conforme avec réserves' && <AlertCircle className="w-3.5 h-3.5" />}
                  {pv.result === 'Non conforme' && <XCircle className="w-3.5 h-3.5" />}
                  {pv.result}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {pv.clientName} • {pv.projectName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditable && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Modifier
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent focus:border-slate-300 dark:focus:border-slate-700"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showOptions && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowOptions(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-40 overflow-hidden py-1">
                    {isEditable && (
                      <button onClick={() => { setShowOptions(false); setIsEditModalOpen(true); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        <Edit2 className="w-4 h-4" /> Modifier
                      </button>
                    )}
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Prévisualiser
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                      <Send className="w-4 h-4" /> Envoyer pour signature
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                      <FileSignature className="w-4 h-4" /> Signer / Faire signer
                    </button>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                      <Printer className="w-4 h-4" /> Imprimer
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" /> Générer nouvelle version
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" /> Ajouter un document
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Consulter l'historique
                    </button>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> Annuler le PV
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Résumé */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Résumé de l'intervention</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <span className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Client & Projet</span>
                      <div className="text-sm text-slate-900 dark:text-white">
                        <p className="font-semibold">{pv.clientName}</p>
                        <p className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">{pv.projectName}</p>
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Site & Adresse</span>
                      <div className="text-sm text-slate-900 dark:text-white flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p>{pv.siteName}</p>
                          {pv.address && <p className="text-slate-500">{pv.address}</p>}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Date d'installation</span>
                      <div className="text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {safeFormatDate(pv.installationDate)}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Équipe d'intervention</span>
                      <div className="text-sm text-slate-900 dark:text-white">
                        <p><span className="text-slate-500">Resp.</span> {pv.technician}</p>
                        {pv.teamMembers && <p><span className="text-slate-500">Membres:</span> {pv.teamMembers}</p>}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <span className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Représentant client</span>
                      <div className="text-sm text-slate-900 dark:text-white">
                        <p>{pv.clientSignatory || 'Non renseigné'} <span className="text-slate-500">({pv.clientRole || 'Client'})</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Équipements */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Équipements installés ({pv.products.length})</h2>
                </div>
                {pv.products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-medium">Produit & Réf.</th>
                          <th className="px-4 py-3 font-medium">N° de série</th>
                          <th className="px-4 py-3 font-medium text-center">Qté</th>
                          <th className="px-4 py-3 font-medium">Emplacement</th>
                          <th className="px-4 py-3 font-medium text-right">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                        {pv.products.map((m, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors max-w-[200px] truncate">{m.productName}</p>
                              <p className="text-xs text-slate-500">{m.productReference}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">{m.serialNumber}</span>
                            </td>
                            <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">{m.installedQty}</td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{m.location || '-'}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={cn(
                                "inline-flex px-2 py-1 text-xs font-medium rounded-md",
                                m.status === 'Terminé' || m.status === 'Opérationnel' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                                m.status === 'En cours' ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" :
                                m.status === 'Annulé' || m.status === 'En panne' ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" :
                                "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              )}>
                                {m.status || m.stateAfter || 'Terminé'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">Aucun équipement installé.</div>
                )}
              </section>

              {/* Travaux réalisés */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Travaux réalisés</h2>
                </div>
                <div className="p-0">
                  {pv.services && pv.services.length > 0 ? (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {pv.services.map((s, i) => (
                        <li key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start">
                           <div>
                             <h4 className="font-medium text-slate-900 dark:text-white text-sm">{s.name}</h4>
                             <p className="text-sm text-slate-500 mt-1">{s.description}</p>
                             {s.comment && <p className="text-xs text-slate-400 mt-1 italic">"{s.comment}"</p>}
                           </div>
                           <div className="shrink-0 text-right">
                             <div className="flex items-center justify-end gap-3 text-xs text-slate-500 mb-2">
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {s.duration}</span>
                             </div>
                             <span className={cn(
                               "inline-flex px-2 py-0.5 text-xs font-medium rounded-md",
                               s.result === 'Validé' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                             )}>
                               {s.result || 'Validé'}
                             </span>
                           </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-8 text-center text-slate-500">Aucun service renseigné.</div>
                  )}
                </div>
              </section>

              {/* Tests */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contrôles et tests</h2>
                </div>
                {pv.tests && pv.tests.length > 0 ? (
                  <div className="overflow-x-auto p-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 break-inside-avoid gap-4">
                        {pv.tests.map((t, i) => (
                           <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                   <p className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</p>
                                   <p className="text-xs text-slate-500">{t.equipment}</p>
                                 </div>
                                 <span className={cn(
                                  "inline-flex px-2 py-0.5 text-xs font-medium rounded-full",
                                  t.status === 'Réussi' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                )}>
                                  {t.status}
                                </span>
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-2">
                                 <p><span className="text-slate-400">Attendu :</span> {t.expectedResult || '-'}</p>
                                 <p><span className="text-slate-400">Obtenu :</span> {t.actualResult}</p>
                              </div>
                              {t.observation && (
                                <p className="text-xs text-slate-500 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">{t.observation}</p>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">Aucun test enregistré.</div>
                )}
              </section>

              {/* Réserves */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Réserves et anomalies</h2>
                </div>
                {pv.hasReserves && pv.reserves && pv.reserves.length > 0 ? (
                  <div className="p-4 space-y-4">
                     {pv.reserves.map((r, i) => (
                        <div key={i} className="flex flex-col gap-2 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30">
                           <div className="flex justify-between items-start">
                             <h4 className="font-medium text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
                               <AlertCircle className="w-4 h-4 text-amber-500" />
                               {r.type} - {r.equipment}
                             </h4>
                             <span className={cn(
                               "px-2 py-0.5 text-xs font-medium rounded-full",
                               r.priority === 'Haute' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                               r.priority === 'Moyenne' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                               'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                             )}>Priorité {r.priority}</span>
                           </div>
                           <p className="text-sm text-slate-700 dark:text-slate-300">{r.description}</p>
                           <div className="flex gap-4 text-xs text-slate-500 mt-2">
                             <p><span className="font-medium">Responsable:</span> {r.responsible}</p>
                             <p><span className="font-medium">Échéance:</span> {safeFormatDate(r.resolutionDate)}</p>
                           </div>
                        </div>
                     ))}
                  </div>
                ) : (
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 flex items-center gap-3 m-4 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
                     <CheckCircle2 className="w-5 h-5 shrink-0" />
                     <p className="text-sm font-medium">Aucune réserve n'a été signalée pour cette installation.</p>
                  </div>
                )}
              </section>

              {/* Signatures */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Signatures</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Tech */}
                  <div className="flex flex-col">
                     <div className="mb-2">
                       <p className="font-medium text-slate-900 dark:text-white text-sm">L'installateur</p>
                       <p className="text-xs text-slate-500">{pv.technician}</p>
                     </div>
                     <div className="flex-1 mt-2 min-h-[100px] border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center p-4 relative">
                        {pv.status === 'Signé' || pv.status === 'Signé avec réserves' || pv.status === 'À compléter' || pv.status === 'En attente de signature' ? (
                          <>
                            <span className="font-serif text-3xl text-indigo-900/60 dark:text-indigo-100/60 italic signature-font">Signé</span>
                            <span className="absolute bottom-2 right-2 text-[10px] text-slate-400">{safeFormatDate(pv.installationDate)}</span>
                          </>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Signature en attente</span>
                        )}
                     </div>
                  </div>
                  {/* Client */}
                  <div className="flex flex-col">
                     <div className="mb-2">
                       <p className="font-medium text-slate-900 dark:text-white text-sm">Le client</p>
                       <p className="text-xs text-slate-500">{pv.clientSignatory || 'Représentant'} ({pv.clientRole || 'Client'})</p>
                     </div>
                     <div className="flex-1 mt-2 min-h-[100px] border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center p-4 relative">
                        {pv.status === 'Signé' || pv.status === 'Signé avec réserves' ? (
                          <>
                            <span className="font-serif text-3xl text-emerald-900/60 dark:text-emerald-100/60 italic signature-font">Signé par le client</span>
                            <span className="absolute bottom-2 right-2 text-[10px] text-slate-400">{safeFormatDate(pv.signatureDate || pv.installationDate)}</span>
                          </>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Signature en attente</span>
                        )}
                     </div>
                  </div>
                </div>
                {pv.clientComment && (
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-200 dark:border-slate-800 text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Commentaire du client : </span>
                    <span className="text-slate-600 dark:text-slate-400 italic">"{pv.clientComment}"</span>
                  </div>
                )}
              </section>

            </div>

            {/* Right Column - Documents */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                  <h3 className="font-medium text-slate-900 dark:text-white">Documents liés</h3>
                  <span className="text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-0.5 px-2 rounded-full">
                    {documents.length}
                  </span>
                </div>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {documents.map((doc) => {
                    const Icon = doc.icon;
                    return (
                      <div key={doc.id} onClick={() => doc.id <= 2 && setIsPVPreviewOpen(true)} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className={cn("mt-1 shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-slate-800", doc.color)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {doc.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {doc.type} • {doc.size}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                            <TargetIcon icon={<Copy className="w-3.5 h-3.5" />} tooltip="Copier lien" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded">
                            <TargetIcon icon={<FileDown className="w-3.5 h-3.5" />} tooltip="Télécharger" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded">
                            <TargetIcon icon={<Printer className="w-3.5 h-3.5" />} tooltip="Imprimer" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  <button className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors border border-dashed border-indigo-200 dark:border-indigo-800">
                    <FolderOpen className="w-4 h-4" />
                    Ajouter un document
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <PVAddModal
           isOpen={isEditModalOpen}
           onClose={() => setIsEditModalOpen(false)}
           onSave={handleUpdate}
           initialData={pv}
        />
      )}
      <PVDocumentPreview pv={pv} isOpen={isPVPreviewOpen} onClose={() => setIsPVPreviewOpen(false)} />
    </div>
  );
}

function TargetIcon({ icon, tooltip }: { icon: React.ReactNode, tooltip: string }) {
  return (
    <div className="relative group/tooltip flex items-center justify-center">
      {icon}
      <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:block whitespace-nowrap bg-slate-800 text-white text-[10px] py-1 px-2 rounded">
        {tooltip}
      </div>
    </div>
  );
}
