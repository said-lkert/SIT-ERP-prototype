import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { FileSignature, Printer, X } from "lucide-react";
import { InstallationPV } from "./types";

export function PVDocumentPreview({ pv, isOpen, onClose }: { pv: InstallationPV; isOpen: boolean; onClose: () => void }) {
  return createPortal(
    <AnimatePresence>
      {isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose} className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md">
        <motion.div initial={{ scale: .97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onMouseDown={(event) => event.stopPropagation()} className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><div className="flex items-center gap-2 text-sm font-semibold"><FileSignature className="h-4 w-4 text-indigo-600" /> Aperçu du procès-verbal d'installation</div><div className="flex gap-2"><button onClick={() => window.print()} className="rounded-lg border border-slate-200 p-2"><Printer className="h-4 w-4" /></button><button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-4 w-4" /></button></div></div>
          <div className="overflow-y-auto bg-slate-100 p-5"><article className="mx-auto min-h-[720px] max-w-4xl bg-white p-10 shadow-sm">
            <header className="flex justify-between border-b-2 border-slate-900 pb-6"><div><div className="text-xl font-bold">SIT ERP</div><div className="text-sm text-slate-500">Solutions IT Algérie</div></div><div className="text-right"><h2 className="text-2xl font-bold">PROCÈS-VERBAL D'INSTALLATION</h2><div className="mt-2 font-mono text-lg font-semibold text-indigo-700">{pv.reference}</div></div></header>
            <section className="grid grid-cols-2 gap-8 border-b border-slate-200 py-6 text-sm"><div className="space-y-2"><Info label="Client" value={pv.clientName} /><Info label="Projet" value={pv.projectName} /><Info label="Site" value={pv.siteName} /></div><div className="space-y-2"><Info label="Date" value={pv.installationDate} /><Info label="Technicien" value={pv.technician} /><Info label="Résultat" value={pv.result} /></div></section>
            <table className="mt-7 w-full border border-slate-300 text-sm"><thead className="bg-slate-100 text-left text-xs uppercase"><tr><th className="p-3">Référence</th><th className="p-3">Équipement installé</th><th className="p-3">N° série</th><th className="p-3 text-right">Qté</th></tr></thead><tbody>{pv.products.map(product => <tr key={product.id} className="border-t"><td className="p-3 font-mono text-xs">{product.productReference}</td><td className="p-3">{product.productName}</td><td className="p-3 font-mono text-xs">{product.serialNumber}</td><td className="p-3 text-right">{product.installedQty}</td></tr>)}</tbody></table>
            <footer className="mt-20 grid grid-cols-2 gap-20 text-center text-sm"><div className="border-t border-slate-400 pt-3">Signature technicien</div><div className="border-t border-slate-400 pt-3">Signature et cachet client</div></footer>
          </article></div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>,
    document.body,
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4"><span className="text-slate-500">{label}</span><span className="font-medium text-right">{value || "-"}</span></div>; }
