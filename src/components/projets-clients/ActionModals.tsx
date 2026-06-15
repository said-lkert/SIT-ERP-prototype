import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Info, CheckCircle2, PauseCircle, Ban, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { ProjetClient } from './types';

// --- Mettre en attente ---
interface PutOnHoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { motif: string; dateReprise: string; commentaire: string }) => void;
  projet: ProjetClient;
}

export function PutOnHoldModal({ isOpen, onClose, onConfirm, projet }: PutOnHoldModalProps) {
  const [motif, setMotif] = useState('');
  const [dateReprise, setDateReprise] = useState('');
  const [commentaire, setCommentaire] = useState('');

  const handleConfirm = () => {
    onConfirm({ motif, dateReprise, commentaire });
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <PauseCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mettre en attente</h3>
                <p className="text-sm text-slate-500">{projet.reference} - {projet.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Motif</label>
                <input type="text" value={motif} onChange={e => setMotif(e.target.value)} placeholder="Ex: Attente équipement client" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Date de reprise estimée</label>
                <input type="date" value={dateReprise} onChange={e => setDateReprise(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Commentaire</label>
                <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)} rows={3} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
              <button onClick={handleConfirm} disabled={!motif} className="px-4 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-lg shadow-amber-500/20 disabled:opacity-50">Confirmer la mise en attente</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// --- Clôturer le projet ---
interface CloseProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projet: ProjetClient;
}

export function CloseProjectModal({ isOpen, onClose, onConfirm, projet }: CloseProjectModalProps) {
  const checks = [
    { label: "Tâches obligatoires terminées", status: true },
    { label: "Matériel livré ou justifié", status: true },
    { label: "Documents obligatoires présents", status: projet.documents?.length ? projet.documents.length >= 2 : false },
    { label: "PV d'installation disponible", status: false },
  ];

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clôturer le projet</h3>
                <p className="text-sm text-slate-500">Validation finale avant archivage business</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Checklist de clôture</p>
              {checks.map((check, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{check.label}</span>
                  {check.status ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              ))}
            </div>

            {!checks.every(c => c.status) && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-xs text-red-800 dark:text-red-400 font-medium">Certains éléments obligatoires manquent pour une clôture parfaite. Des justifications seront nécessaires dans le rapport final.</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
              <button onClick={onConfirm} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/20">Confirmer la clôture</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// --- Annuler le projet ---
interface CancelProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motif: string) => void;
  projet: ProjetClient;
}

export function CancelProjectModal({ isOpen, onClose, onConfirm, projet }: CancelProjectModalProps) {
  const [motif, setMotif] = useState('');

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Annuler le projet</h3>
                <p className="text-sm text-slate-500">Action irréversible sur le planning opérationnel</p>
              </div>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl flex gap-3">
               <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
               <div>
                  <p className="text-xs font-bold text-red-600 uppercase">Attention - Réservations actives</p>
                  <p className="text-xs text-red-800 dark:text-red-400 mt-0.5">L'annulation libérera automatiquement 42 produits réservés en stock.</p>
               </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Motif obligatoire</label>
              <textarea value={motif} onChange={e => setMotif(e.target.value)} rows={3} placeholder="Pourquoi annulez-vous ce projet ?" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm resize-none" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Retour</button>
              <button onClick={() => onConfirm(motif)} disabled={!motif} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-500/20 disabled:opacity-50">Confirmer l'annulation</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// --- Archivage ---
export function ArchiveProjectModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
              <Archive className="w-8 h-8 text-slate-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Archiver le projet</h3>
              <p className="text-sm text-slate-500 mt-2">Le projet ne sera plus visible dans la liste active mais restera consultable dans les archives.</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button onClick={onConfirm} className="w-full py-3 text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-opacity">Archiver le projet</button>
              <button onClick={onClose} className="w-full py-3 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Annuler</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
