export function CRMReports() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics & Reports</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Deep dive into pipeline velocity, revenue, and rep performance.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm h-80 flex flex-col">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-6">Revenue by Month (Current Year)</h3>
          <div className="flex-1 flex items-end gap-2 shrink-0">
             {[40, 55, 65, 45, 80, 95, 85, 110, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-indigo-100 hover:bg-indigo-500 transition-colors rounded-t-sm flex flex-col justify-end" style={{ height: `${h}%` }}>
                </div>
             ))}
          </div>
          <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest justify-between px-2">
            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm h-80">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-6">Win/Loss Ratio</h3>
          <div className="flex items-center justify-center h-48">
            <div className="relative w-40 h-40 rounded-full border-[20px] border-indigo-600 border-r-slate-200 transform -rotate-45">
              <div className="absolute inset-0 flex items-center justify-center transform rotate-45">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-slate-900 dark:text-white">75%</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Win Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
