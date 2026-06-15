import { Plus, MoreHorizontal, Calendar, DollarSign, GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

const STAGES = [
  { id: 'lead', title: 'Lead', color: 'border-slate-300', bg: 'bg-slate-100' },
  { id: 'qualified', title: 'Qualified', color: 'border-blue-300', bg: 'bg-blue-50' },
  { id: 'proposal', title: 'Proposal', color: 'border-indigo-300', bg: 'bg-indigo-50' },
  { id: 'negotiation', title: 'Negotiation', color: 'border-amber-300', bg: 'bg-amber-50' },
  { id: 'won', title: 'Closed Won', color: 'border-emerald-300', bg: 'bg-emerald-50' },
];

const DEALS = [
  { id: 1, title: 'TechGlobal Enterprise License', company: 'TechGlobal', amount: '$45,000', closeDate: 'Oct 24', stage: 'proposal', rep: 'AS' },
  { id: 2, title: 'Acme Corp API Integration', company: 'Acme Corp', amount: '$12,500', closeDate: 'Nov 02', stage: 'qualified', rep: 'SJ' },
  { id: 3, title: 'Stark Ind. Security Audit', company: 'Stark Ind.', amount: '$120,000', closeDate: 'Dec 15', stage: 'negotiation', rep: 'MS' },
  { id: 4, title: 'Wayne Ent. Cloud Migration', company: 'Wayne Ent.', amount: '$85,000', closeDate: 'Oct 10', stage: 'lead', rep: 'AS' },
  { id: 5, title: 'Daily Planet Subscription', company: 'Daily Planet', amount: '$4,200', closeDate: 'Sep 28', stage: 'won', rep: 'SJ' },
  { id: 6, title: 'LexCorp Data Processing', company: 'LexCorp', amount: '$210,000', closeDate: 'Nov 20', stage: 'proposal', rep: 'MS' },
];

export function CRMPipeline() {
  return (
    <div className="p-8 h-full flex flex-col space-y-6 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Q3 Pipeline</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Drag and drop deals to update their stage.</p>
        </div>
        <div className="flex gap-2">
          <select className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500">
            <option>All Pipelines</option>
            <option>Enterprise Sales</option>
            <option>SMB Sales</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Deal
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
        {STAGES.map(stage => {
          const stageDeals = DEALS.filter(d => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((sum, deal) => sum + parseInt(deal.amount.replace(/[^0-9]/g, '')), 0) || 0;
          
          return (
            <div key={stage.id} className="flex-none w-80 flex flex-col h-full shrink-0">
              {/* Stage Header */}
              <div className={cn("px-4 py-3 rounded-t-xl border-t-4 border-l border-r border-slate-200 bg-white flex items-center justify-between sticky top-0 z-10", stage.color)}>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{stage.title}</h3>
                  <span className="bg-slate-100 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                </div>
                <button className="text-slate-400 hover:text-slate-700 dark:text-slate-300">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="px-4 py-3 bg-white dark:bg-slate-900 border-l border-r border-b border-slate-200 dark:border-slate-700 border-t-0 shadow-sm rounded-b-xl mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Value</p>
                <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">${stageTotal.toLocaleString()}</p>
              </div>

              {/* Deals Container */}
              <div className={cn("flex-1 rounded-xl p-3 space-y-3 overflow-y-auto border border-dashed border-slate-200", stage.bg)}>
                {stageDeals.map(deal => (
                  <div key={deal.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab hover:border-indigo-300 transition-colors group relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab">
                      <GripVertical className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className="flex justify-between items-start mb-2 group-hover:pl-4 transition-all">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{deal.title}</h4>
                      <button className="text-slate-300 hover:text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 group-hover:pl-4 transition-all">{deal.company}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 group-hover:pl-4 transition-all">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold text-xs bg-emerald-50 text-emerald-700 w-fit px-1.5 py-0.5 rounded">
                          <DollarSign className="w-3 h-3" />
                          {deal.amount}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-medium">
                          <Calendar className="w-3 h-3" />
                          {deal.closeDate}
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shadow-sm border border-indigo-200 shrink-0">
                        {deal.rep}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
