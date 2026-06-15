import { AlertTriangle, TrendingDown, ArrowRight, Share2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PRODUCTS } from './InventoryCatalog';

const getStockStatus = (product: any) => {
  if (product.status) return product.status;
  if (product.stock === 0) return 'Out of Stock';
  if (product.stock < product.thresholds.low) return 'Low';
  return 'Normal';
};

export function InventoryAlerts() {
  const alerts = PRODUCTS.filter(p => getStockStatus(p) !== 'Normal')
    .map(p => ({
      ...p,
      status: getStockStatus(p),
      min: p.thresholds.low,
      isCritical: p.stock === 0 || (p.stock < p.thresholds.low * 0.5)
  }));

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Alerts & Reorder Engine</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Products requiring immediate attention based on thresholds.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
           Auto-Generate POs
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto pb-8">
         {alerts.map((alert, i) => (
            <div key={i} className={cn(
               "bg-white border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:shadow-md",
               alert.isCritical ? "border-rose-200" : "border-amber-200"
            )}>
               <div className="flex items-start gap-4 flex-1">
                  <div className={cn(
                     "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                     alert.isCritical ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                  )}>
                     {alert.isCritical ? <AlertTriangle className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{alert.name}</h3>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{alert.sn}</span>
                     </div>
                     <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {alert.stock === 0 
                           ? <span className="font-bold text-rose-600">Completely Out of Stock</span>
                           : <span>Stock is at <strong className="text-slate-900 dark:text-white">{alert.stock}</strong>, dropping below minimum threshold of <strong className="text-slate-900 dark:text-white">{alert.min}</strong>.</span>
                        }
                     </p>
                     
                     <div className="flex gap-4">
                        <div className="bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100">
                           <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Brand</p>
                           <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{alert.brand}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100">
                           <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Monthly Avg Use</p>
                           <p className="text-sm font-medium text-slate-700 dark:text-slate-300">~120 units</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 w-full md:w-64 shrink-0 flex flex-col items-center text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1">Smart Suggestion</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Reorder <strong className="text-slate-900 dark:text-white">250 units</strong> to restore target capacity.</p>
                  <button className="w-full max-w-[200px] flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm mb-2">
                     Create PO <ArrowRight className="w-3 h-3" />
                  </button>
                  <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:text-slate-400 flex items-center gap-1">
                     <Share2 className="w-3 h-3" /> Request Transfer instead
                  </button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
