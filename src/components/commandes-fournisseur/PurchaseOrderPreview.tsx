import { AnimatePresence, motion } from 'motion/react';
import { Download, FileCheck2, Printer, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { safeFormatDate } from '../../lib/utils';
import { CommandeFournisseur } from './types';

interface PurchaseOrderPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  commande: CommandeFournisseur;
}

export function PurchaseOrderPreview({ isOpen, onClose, commande }: PurchaseOrderPreviewProps) {
  if (typeof document === 'undefined') return null;

  const subtotal = commande.lignes.reduce((sum, line) => sum + line.qteCmd * line.prixU, 0);
  const discount = subtotal * ((commande.remise || 0) / 100);
  const total = subtotal - discount + (commande.fraisLivraison || 0);
  const voucherNumber = commande.reference.replace(/^CF-?/i, 'BC-');

  return createPortal(
    <AnimatePresence>
      {isOpen && (
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
                <FileCheck2 className="h-4 w-4 text-indigo-600" />
                Aperçu du bon de commande fournisseur
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
                    <h2 className="text-2xl font-bold">BON DE COMMANDE</h2>
                    <div className="mt-2 font-mono text-lg font-semibold text-indigo-700">{voucherNumber}</div>
                    <span className="mt-2 inline-flex rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                      {commande.statut}
                    </span>
                  </div>
                </header>

                <section className="grid grid-cols-2 gap-8 border-b border-slate-200 py-6 text-sm">
                  <div className="space-y-2">
                    <Info label="Fournisseur" value={commande.fournisseurName} />
                    <Info label="Commande source" value={commande.reference} />
                    <Info label="Responsable" value={commande.responsableName} />
                  </div>
                  <div className="space-y-2">
                    <Info label="Date de commande" value={safeFormatDate(commande.dateCommande)} />
                    <Info label="Livraison prévue" value={safeFormatDate(commande.dateLivraisonPrevue)} />
                    <Info label="Mode de paiement" value={commande.modePaiement || '-'} />
                    <Info label="Devise" value={commande.devise || 'DZD'} />
                  </div>
                </section>

                <div className="mt-7 overflow-hidden border border-slate-300">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-left text-xs uppercase text-slate-600">
                      <tr>
                        <th className="px-3 py-3">Référence</th>
                        <th className="px-3 py-3">Produit</th>
                        <th className="px-3 py-3 text-right">Qté commandée</th>
                        <th className="px-3 py-3 text-right">Prix unitaire</th>
                        <th className="px-3 py-3 text-right">Total HT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {commande.lignes.map((line) => (
                        <tr key={line.id}>
                          <td className="px-3 py-3 font-mono text-xs">{line.refFournisseur || '-'}</td>
                          <td className="px-3 py-3 font-medium">{line.productName}</td>
                          <td className="px-3 py-3 text-right">{line.qteCmd}</td>
                          <td className="px-3 py-3 text-right">{line.prixU.toLocaleString()} {commande.devise}</td>
                          <td className="px-3 py-3 text-right font-semibold">{(line.qteCmd * line.prixU).toLocaleString()} {commande.devise}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <section className="ml-auto mt-6 w-80 space-y-3 border-t-2 border-slate-900 pt-4 text-sm">
                  <Info label="Sous-total HT" value={`${subtotal.toLocaleString()} ${commande.devise}`} />
                  <Info label={`Remise (${commande.remise || 0} %)`} value={`-${discount.toLocaleString()} ${commande.devise}`} />
                  <Info label="Frais de livraison" value={`${(commande.fraisLivraison || 0).toLocaleString()} ${commande.devise}`} />
                  <Info label="Total commande HT" value={`${total.toLocaleString()} ${commande.devise}`} strong />
                </section>

                {(commande.commentaire || commande.conditionsParticulieres) && (
                  <section className="mt-8 border border-slate-200 p-4 text-sm">
                    <div className="font-semibold">Observations et conditions</div>
                    <p className="mt-2 whitespace-pre-line text-slate-600">
                      {[commande.commentaire, commande.conditionsParticulieres].filter(Boolean).join('\n')}
                    </p>
                  </section>
                )}

                <footer className="mt-16 grid grid-cols-2 gap-16 text-center text-sm">
                  <div className="border-t border-slate-400 pt-3">Visa du responsable</div>
                  <div className="border-t border-slate-400 pt-3">Accord du fournisseur</div>
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
