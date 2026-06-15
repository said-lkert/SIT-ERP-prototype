import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { RotateCcw, WandSparkles, X } from 'lucide-react';
import { StockOutbound } from './types';

export function OutboundReturnModal({ outbound, isOpen, onClose, onCreated }: { outbound: StockOutbound; isOpen: boolean; onClose: () => void; onCreated: () => void }) {
  const [reason, setReason] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const total = useMemo(() => Object.keys(quantities).reduce((sum, key) => sum + (Number(quantities[key]) || 0), 0), [quantities]);
  if (typeof document === 'undefined') return null;

  const submit = async () => {
    setError('');
    if (!reason.trim() || total <= 0) return setError('Indiquez le motif et au moins une quantité à retourner.');
    setProcessing(true);
    const response = await fetch(`/api/outbounds/${outbound.id}/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason,
        date: new Date().toISOString().split('T')[0],
        lines: outbound.products.map((product) => ({ lineId: product.lineId, quantity: quantities[product.lineId || ''] || 0, locationId: product.locationId, condition: product.condition }))
      })
    });
    const data = await response.json();
    setProcessing(false);
    if (!response.ok) return setError(data.error || 'Retour impossible.');
    onCreated();
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
          <motion.div initial={{ scale: 0.97 }} animate={{ scale: 1 }} exit={{ scale: 0.97 }} className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><div className="flex items-center gap-2 font-semibold"><RotateCcw className="h-4 w-4 text-indigo-600" /> Retour lié à {outbound.reference}</div><div className="flex items-center gap-2"><button onClick={() => { const product = outbound.products.find((item) => item.qtyOut > (item.qtyReturned || 0)); if (product?.lineId) setQuantities({ [product.lineId]: 1 }); setReason('Produit non utilisé, retourné au dépôt après la démonstration.'); }} className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-indigo-700 hover:bg-indigo-100"><WandSparkles className="h-4 w-4" /> Remplir la démo</button><button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-4 w-4" /></button></div></div>
            <div className="max-h-[70vh] overflow-y-auto p-6">
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">Motif du retour</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="mb-5 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-indigo-500" placeholder="Produit non utilisé, matériel retourné par le technicien..." />
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Produit</th><th className="px-4 py-3 text-right">Sorti</th><th className="px-4 py-3 text-right">Déjà retourné</th><th className="px-4 py-3 text-right">À retourner</th></tr></thead>
                  <tbody className="divide-y divide-slate-200">{outbound.products.map((product) => {
                    const remaining = product.qtyOut - (product.qtyReturned || 0);
                    return <tr key={product.lineId}><td className="px-4 py-3"><div className="font-medium">{product.name}</div><div className="font-mono text-xs text-slate-400">{product.reference}</div></td><td className="px-4 py-3 text-right">{product.qtyOut}</td><td className="px-4 py-3 text-right">{product.qtyReturned || 0}</td><td className="px-4 py-3 text-right"><input type="number" min={0} max={remaining} value={quantities[product.lineId || ''] || 0} onChange={(e) => setQuantities({ ...quantities, [product.lineId || '']: Math.min(remaining, Math.max(0, Number(e.target.value))) })} className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-right" /></td></tr>;
                  })}</tbody>
                </table>
              </div>
              {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4"><button onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium">Annuler</button><button onClick={submit} disabled={processing} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{processing ? 'Validation...' : `Valider le retour (${total})`}</button></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
