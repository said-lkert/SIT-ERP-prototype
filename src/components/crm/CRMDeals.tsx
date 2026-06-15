import { Plus, FileText, CheckCircle2 } from 'lucide-react';

export function CRMDeals() {
  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Deals & Opportunities</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed view of all active negotiations and historical deals.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
          <Plus className="w-4 h-4" />
          Create Deal
        </button>
      </div>

      {/* Mockup of a split view for Deals List and Deal Detail Sidebar */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Deal List */}
        <div className="w-1/3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">All Deals</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">12 Total</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className={`p-4 rounded-xl cursor-pointer ${i === 1 ? 'bg-indigo-50 border border-indigo-200' : 'bg-white border border-transparent hover:bg-slate-50'}`}>
                <div className="flex justify-between items-start mb-1">
                  <p className={`font-bold text-sm ${i === 1 ? 'text-indigo-900' : 'text-slate-900'}`}>TechGlobal Enterprise</p>
                  <p className="font-bold text-xs text-emerald-600">$45k</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">TechGlobal Inc.</p>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: i === 1 ? '60%' : '30%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Deal Detail Panel */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-y-auto flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900/90 backdrop-blur z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-indigo-100 text-indigo-700">Proposal</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 dark:text-slate-400">60% Probability</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">TechGlobal Enterprise License</h2>
                <p className="text-indigo-600 font-medium text-sm mt-1 cursor-pointer hover:underline">TechGlobal Inc. (Alice Freeman)</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">$45,000</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Expected Close: Oct 24, 2026</p>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="flex gap-2 mt-6 pb-2">
              <button className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors">Mark as Won</button>
              <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Log Activity</button>
              <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">New Task</button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-8">
               {/* Timeline */}
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" /> Deal Timeline
                </h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                   <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                       <FileText className="w-4 h-4" />
                     </div>
                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                       <div className="flex items-center justify-between mb-1">
                         <h4 className="font-bold text-sm text-slate-900 dark:text-white">Proposal Sent</h4>
                         <time className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Today 10:42 AM</time>
                       </div>
                       <p className="text-sm text-slate-600 dark:text-slate-400">Attached revised SLA and pricing matrix.</p>
                     </div>
                   </div>
                   <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 dark:text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                       <CheckCircle2 className="w-4 h-4" />
                     </div>
                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                       <div className="flex items-center justify-between mb-1">
                         <h4 className="font-bold text-sm text-slate-900 dark:text-white">Discovery Call</h4>
                         <time className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Oct 12</time>
                       </div>
                       <p className="text-sm text-slate-600 dark:text-slate-400">Discussed primary pain points with current provider.</p>
                     </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="col-span-1 space-y-6">
               {/* Deal Details sidebar-ish */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">About this deal</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Deal Owner</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">AS</div>
                      <p className="font-medium text-slate-900 dark:text-white">Adrian Sterling</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Deal Type</p>
                    <p className="font-medium text-slate-900 dark:text-white mt-1">New Business</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Source</p>
                    <p className="font-medium text-slate-900 dark:text-white mt-1">Inbound - Website</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
