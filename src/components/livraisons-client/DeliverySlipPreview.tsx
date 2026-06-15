import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { FileCheck2, Printer, X } from "lucide-react";
import { ClientLivraison } from "./types";

export function DeliverySlipPreview({ livraison, isOpen, onClose }: {
  livraison: ClientLivraison;
  isOpen: boolean;
  onClose: () => void;
}) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose} className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} onMouseDown={(event) => event.stopPropagation()} className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold"><FileCheck2 className="h-4 w-4 text-indigo-600" /> Aperçu du bon de livraison</div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Imprimer"><Printer className="h-4 w-4" /></button>
                <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Fermer"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="overflow-y-auto bg-slate-100 p-5">
              <article className="mx-auto min-h-[720px] max-w-4xl bg-white p-10 text-slate-900 shadow-sm">
                <header className="flex justify-between border-b-2 border-slate-900 pb-6">
                  <div><div className="text-xl font-bold">SIT ERP</div><div className="text-sm text-slate-500">Solutions IT Algérie</div><div className="text-sm text-slate-500">Livraison client</div></div>
                  <div className="text-right"><h2 className="text-2xl font-bold">BON DE LIVRAISON</h2><div className="mt-2 font-mono text-lg font-semibold text-indigo-700">{livraison.deliverySlipNumber}</div></div>
                </header>
                <section className="grid grid-cols-2 gap-8 border-b border-slate-200 py-6 text-sm">
                  <div className="space-y-2"><Info label="Client" value={livraison.clientName} /><Info label="Projet" value={livraison.projectName} /><Info label="Site" value={livraison.deliverySite} /></div>
                  <div className="space-y-2"><Info label="Date prévue" value={livraison.plannedDate} /><Info label="Transporteur" value={livraison.carrier || "-"} /><Info label="Bon de sortie" value={livraison.sourceOutboundReference || "-"} /></div>
                </section>
                <div className="mt-7 overflow-hidden border border-slate-300">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-left text-xs uppercase text-slate-600"><tr><th className="px-3 py-3">Référence</th><th className="px-3 py-3">Produit</th><th className="px-3 py-3 text-right">Quantité</th></tr></thead>
                    <tbody className="divide-y divide-slate-200">
                      {livraison.products.map((product) => <tr key={product.id}><td className="px-3 py-3 font-mono text-xs">{product.productReference}</td><td className="px-3 py-3 font-medium">{product.productName}</td><td className="px-3 py-3 text-right">{product.requestedQty}</td></tr>)}
                    </tbody>
                  </table>
                </div>
                <footer className="mt-20 grid grid-cols-2 gap-20 text-center text-sm"><div className="border-t border-slate-400 pt-3">Visa du livreur</div><div className="border-t border-slate-400 pt-3">Signature et cachet du client</div></footer>
              </article>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><span className="text-slate-500">{label}</span><span className="font-medium text-right">{value || "-"}</span></div>;
}
