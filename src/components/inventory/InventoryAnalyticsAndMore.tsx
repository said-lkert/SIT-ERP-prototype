import { Truck } from 'lucide-react';

export function InventoryReplenishment() {
  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Supplier & Replenishment</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage incoming stock and purchase orders.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm relative overflow-hidden group">
           <span className="absolute inset-0 bg-white dark:bg-slate-900/20 -translate-x-full group-hover:animate-[shimmer_1s_ease-in-out]"></span>
           New Purchase Order
        </button>
      </div>
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
         <Truck className="w-12 h-12 mb-4 text-slate-300" />
         <p className="font-bold text-slate-700 dark:text-slate-300 text-lg">No Pending Deliveries</p>
         <p className="text-sm text-slate-400 mt-1">Your supply chain is fully caught up.</p>
      </div>
    </div>
  );
}

export function InventoryAnalytics() {
  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics & Reports</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">ABC Analysis, Stock Rotation, and Performance Metrics.</p>
        </div>
        <select className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
           <option>Last 30 Days</option>
           <option>Last Quarter</option>
           <option>Year to Date</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="col-span-1 lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm h-80 flex flex-col items-center justify-center">
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Stock Turnover Rate Chart</p>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm h-80 flex flex-col items-center justify-center">
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">ABC Classification Pie</p>
         </div>
         <div className="col-span-1 lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm h-64 flex flex-col items-center justify-center">
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Slow Moving & Dead Stock List</p>
         </div>
      </div>
    </div>
  );
}
