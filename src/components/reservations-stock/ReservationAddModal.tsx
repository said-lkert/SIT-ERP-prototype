import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, Check, Lock, Package, X } from 'lucide-react';
import { api } from '../../api';
import { cn, safeFormatDate } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';
import { StockReservation } from './types';

interface ReservationAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (res: StockReservation) => void;
}

export function ReservationAddModal({ isOpen, onClose, onSave }: ReservationAddModalProps) {
  const [projectNeeds, setProjectNeeds] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setSelectedProjectId('');
    setError('');
    setIsSaving(false);
    api.getProjectNeeds()
      .then((needs: any[]) => setProjectNeeds((needs || []).filter((need) => (need.products || []).length > 0)))
      .catch(() => setError('Impossible de charger les besoins produits des projets.'));
  }, [isOpen]);

  const selectedNeed = useMemo(
    () => projectNeeds.find((need) => need.projectId === selectedProjectId),
    [projectNeeds, selectedProjectId]
  );

  const totals = useMemo(() => {
    const products = selectedNeed?.products || [];
    const requested = products.reduce((sum: number, product: any) => sum + Number(product.requestedQty || 0), 0);
    const reserved = products.reduce((sum: number, product: any) => sum + Number(product.reservedQty || 0), 0);
    return {
      requested,
      reserved,
      missing: Math.max(0, requested - reserved),
      coverage: requested > 0 ? Math.round((reserved / requested) * 100) : 0
    };
  }, [selectedNeed]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedNeed) {
      setError('Sélectionnez un projet contenant des besoins produits.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const response = await api.createReservation({ projetId: selectedNeed.projectId });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Impossible de confirmer la réservation.');

      const reservations = await api.getReservations();
      const createdReservation = (reservations || []).find((reservation: StockReservation) => reservation.id === result.id);
      if (!createdReservation) throw new Error('La réservation a été créée mais son détail est introuvable.');

      onSave(createdReservation);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de confirmer la réservation.');
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Réserver depuis un besoin projet</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sélectionnez un projet ayant déjà des besoins produits. Les quantités réservées viennent du stock réel.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">1. Besoin produit du projet</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Projet *</label>
                  <CustomSelect
                    value={selectedProjectId}
                    onChange={setSelectedProjectId}
                    options={projectNeeds.map((need) => ({
                      value: need.projectId,
                      label: `${need.projectName} - ${need.clientName}`
                    }))}
                    placeholder="Sélectionner un projet avec besoins..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Client</label>
                  <div className="h-10 flex items-center px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-300">
                    {selectedNeed?.clientName || '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Date prévue</label>
                  <div className="h-10 flex items-center px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-300">
                    {selectedNeed?.plannedDate ? safeFormatDate(selectedNeed.plannedDate) : '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Responsable</label>
                  <div className="h-10 flex items-center px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-300">
                    {selectedNeed?.responsible || '-'}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">2. Produits réservés</h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Lock className="w-4 h-4 text-amber-500" />
                  {totals.reserved} / {totals.requested} réservé(s)
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/70">
                    <tr>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Produit</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Demandé</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Réservé</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Manquant</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Emplacement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(selectedNeed?.products || []).map((product: any) => (
                      <tr key={product.id}>
                        <td className="px-5 py-3">
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{product.label}</div>
                          <div className="text-[10px] font-mono font-bold text-slate-400">{product.reference}</div>
                        </td>
                        <td className="px-5 py-3 text-center text-sm font-bold text-slate-700 dark:text-slate-300">{product.requestedQty}</td>
                        <td className="px-5 py-3 text-center text-sm font-bold text-indigo-600 dark:text-indigo-400">{product.reservedQty}</td>
                        <td className={cn("px-5 py-3 text-center text-sm font-bold", product.missingQty > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>
                          {product.missingQty}
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">{product.location || 'EMPL-A-01'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!selectedNeed && (
                  <div className="p-10 text-center text-sm font-medium text-slate-400">
                    Sélectionnez un projet pour afficher ses besoins produits réservés.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedNeed || isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'Confirmation...' : 'Confirmer la réservation'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
