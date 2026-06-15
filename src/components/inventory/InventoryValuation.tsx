import { CircleDollarSign, Download } from 'lucide-react';

export function InventoryValuation() {
  return (
    <div className="p-8 max-w-6xl mx-auto h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Valuation</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Financial overview of inventory assets.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-sm">
             Accounting Sync
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
             <Download className="w-4 h-4" /> Export Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Stock Value</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">$1,424,500.00</p>
            <p className="text-xs font-semibold text-emerald-600 mt-2 bg-emerald-50 w-fit px-2 py-0.5 rounded">+2.4% vs last period</p>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Valuation Method</p>
            <p className="text-lg font-bold text-indigo-700 mt-2 bg-indigo-50 border border-indigo-100 rounded-lg py-2 text-center">FIFO (First In, First Out)</p>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 cursor-pointer hover:underline">Change Method</p>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Value by Category</p>
            <div className="flex h-4 bg-slate-100 rounded-full overflow-hidden mt-3 mb-2">
               <div className="w-[50%] bg-indigo-500" title="Controllers"></div>
               <div className="w-[30%] bg-blue-400" title="Motors"></div>
               <div className="w-[20%] bg-emerald-400" title="Sensors"></div>
            </div>
            <div className="flex gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
               <span className="flex items-center gap-1 text-indigo-700"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div>Controllers</span>
               <span className="flex items-center gap-1 text-blue-700"><div className="w-2 h-2 bg-blue-400 rounded-full"></div>Motors</span>
            </div>
         </div>
      </div>
      
      {/* Empty state for the rest of the table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm h-64 flex flex-col items-center justify-center text-slate-400">
         <CircleDollarSign className="w-8 h-8 mb-2 opacity-50" />
         <p className="text-sm font-medium">Detailed valuation ledger goes here</p>
      </div>
    </div>
  );
}
