import { ClipboardCheck, Play } from 'lucide-react';

export function InventoryCounting() {
  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100 shadow-sm">
        <ClipboardCheck className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Physical Inventory Counting</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
        Conduct cyclic counts or full physical inventory checks. Scan items on the floor, compare with theoretical stock, and resolve discrepancies before finalizing.
      </p>
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm w-full max-w-md">
         <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-left">Start New Session</h3>
         <div className="space-y-4">
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 text-left">Location</label>
               <select className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Warehouse A - Entire</option>
                  <option>Warehouse A - Zone 1 Only</option>
                  <option>Warehouse B</option>
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 text-left">Assignee</label>
               <select className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Me (Adrian Sterling)</option>
                  <option>Sarah Jenks</option>
               </select>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold mt-2 shadow-sm hover:bg-indigo-700 transition-colors">
               <Play className="w-4 h-4 fill-white" /> Start Counting
            </button>
         </div>
      </div>
    </div>
  );
}
