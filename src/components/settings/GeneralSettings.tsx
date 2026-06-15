export function GeneralSettings() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">General</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Basic information about your company.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-8 shadow-sm">
        <div className="flex items-start gap-6">
           <div className="w-20 h-20 bg-slate-100 border border-slate-200 dark:border-slate-700 border-dashed rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:bg-slate-950 hover:text-indigo-600 transition-colors cursor-pointer shrink-0">
             <span className="text-xs font-bold uppercase">Upload<br/>Logo</span>
           </div>
           <div className="flex-1 space-y-4">
              <div>
                 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                 <input type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm max-w-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" defaultValue="SIT-ERP Corp Ltd." />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
           <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Default Currency</label>
              <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none">
                 <option value="USD">USD ($)</option>
                 <option value="EUR">EUR (€)</option>
                 <option value="GBP">GBP (£)</option>
                 <option value="JPY">JPY (¥)</option>
              </select>
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fiscal Year Start</label>
              <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none">
                 <option value="jan">January</option>
                 <option value="apr">April</option>
                 <option value="jul">July</option>
                 <option value="oct">October</option>
              </select>
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Timezone</label>
              <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none" defaultValue="UTC">
                 <option value="UTC">UTC (Coordinated Universal Time)</option>
                 <option value="EST">EST (Eastern Standard Time)</option>
                 <option value="PST">PST (Pacific Standard Time)</option>
                 <option value="CET">CET (Central European Time)</option>
              </select>
           </div>
        </div>
      </div>
    </div>
  );
}
