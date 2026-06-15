import { AnimatePresence, motion } from 'motion/react';
import { Download, FileCheck2, Printer, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { SupplierReceipt } from './types';

interface EntryVoucherPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: SupplierReceipt;
}

export function EntryVoucherPreview({ isOpen, onClose, receipt }: EntryVoucherPreviewProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && receipt.entryVoucher && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md"
          onMouseDown={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            onMouseDown={(event) => event.stopPropagation()}
            className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FileCheck2 className="h-4 w-4 text-emerald-600" />
                Aperçu du bon d'entrée
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Imprimer">
                  <Printer className="h-4 w-4" />
                </button>
                <button onClick={() => window.print()} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Exporter">
                  <Download className="h-4 w-4" />
                </button>
                <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Fermer">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto bg-slate-100 p-5">
              <article className="mx-auto min-h-[720px] max-w-4xl bg-white p-10 text-slate-900 shadow-sm">
                <header className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
                  <div>
                    <div className="text-xl font-bold">SIT-ERP</div>
                    <div className="mt-1 text-sm text-slate-500">Solutions IT Algérie</div>
                    <div className="text-sm text-slate-500">Gestion des stocks et approvisionnements</div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold">BON D'ENTRÉE</h2>
                    <div className="mt-2 font-mono text-lg font-semibold text-emerald-700">{receipt.entryVoucher.number}</div>
                    <span className="mt-2 inline-flex rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      {receipt.entryVoucher.status}
                    </span>
                  </div>
                </header>

                <section className="grid grid-cols-2 gap-8 border-b border-slate-200 py-6 text-sm">
                  <div className="space-y-2">
                    <Info label="Fournisseur" value={receipt.supplierName} />
                    <Info label="Commande source" value={receipt.purchaseOrderRef || '-'} />
                    <Info label="Réception" value={receipt.reference} />
                  </div>
                  <div className="space-y-2">
                    <Info label="Date de validation" value={receipt.validationDate || receipt.date} />
                    <Info label="Bon de livraison fournisseur" value={receipt.deliveryNoteRef || '-'} />
                    <Info label="Facture fournisseur" value={receipt.supplierInvoiceRef || '-'} />
                    <Info label="Entrepôt" value={receipt.warehouseName} />
                  </div>
                </section>

                <div className="mt-7 overflow-hidden border border-slate-300">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-left text-xs uppercase text-slate-600">
                      <tr>
                        <th className="px-3 py-3">Référence</th>
                        <th className="px-3 py-3">Produit</th>
                        <th className="px-3 py-3 text-right">Qté reçue</th>
                        <th className="px-3 py-3 text-right">Prix unitaire</th>
                        <th className="px-3 py-3 text-right">Total HT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {receipt.products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-3 py-3 font-mono text-xs">{product.reference}</td>
                          <td className="px-3 py-3 font-medium">{product.name}</td>
                          <td className="px-3 py-3 text-right">{product.qtyReceived}</td>
                          <td className="px-3 py-3 text-right">{product.purchasePrice.toLocaleString()} DA</td>
                          <td className="px-3 py-3 text-right font-semibold">{(product.qtyReceived * product.purchasePrice).toLocaleString()} DA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <section className="ml-auto mt-6 w-72 space-y-3 border-t-2 border-slate-900 pt-4 text-sm">
                  <Info label="Quantité totale" value={`${receipt.totalQty} unité(s)`} />
                  <Info label="Valeur totale HT" value={`${receipt.totalValue.toLocaleString()} DA`} strong />
                </section>

                <footer className="mt-16 grid grid-cols-2 gap-16 text-center text-sm">
                  <div className="border-t border-slate-400 pt-3">Visa du magasinier</div>
                  <div className="border-t border-slate-400 pt-3">Visa du responsable</div>
                </footer>
              </article>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function Info({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? 'font-bold' : 'font-medium'}>{value}</span>
    </div>
  );
}
