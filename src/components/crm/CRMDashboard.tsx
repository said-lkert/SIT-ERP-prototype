import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users,
  Activity
} from 'lucide-react';

export function CRMDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Active Deals', value: '142', change: '+12%', up: true, icon: Target },
          { label: 'Revenue Forecast', value: '$845.2k', change: '+5.4%', up: true, icon: DollarSign },
          { label: 'Avg. Deal Size', value: '$24.5k', change: '-2.1%', up: false, icon: TrendingUp },
          { label: 'Win Rate', value: '64.8%', change: '+4.2%', up: true, icon: Users },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <stat.icon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.change}
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Funnel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white shrink-0">Sales Pipeline Funnel</h3>
            <select className="text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 dark:text-slate-400">
              <option>This Quarter</option>
              <option>Last Quarter</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-2 mt-8">
            <div className="w-full max-w-md bg-indigo-50 border border-indigo-100 rounded-t-lg h-12 flex items-center justify-between px-6">
              <span className="text-sm font-bold text-indigo-900">Leads (840)</span>
              <span className="text-sm font-bold text-indigo-600">$1.2M</span>
            </div>
            <div className="w-[90%] max-w-md bg-indigo-100 border border-indigo-200 h-12 flex items-center justify-between px-6">
              <span className="text-sm font-bold text-indigo-900">Qualified (420)</span>
              <span className="text-sm font-bold text-indigo-600">$840k</span>
            </div>
            <div className="w-[80%] max-w-md bg-indigo-200 border border-indigo-300 h-12 flex items-center justify-between px-6">
              <span className="text-sm font-bold text-indigo-900">Proposal (180)</span>
              <span className="text-sm font-bold text-indigo-700">$420k</span>
            </div>
            <div className="w-[70%] max-w-md bg-indigo-300 border border-indigo-400 h-12 flex items-center justify-between px-6">
              <span className="text-sm font-bold text-indigo-900">Negotiation (90)</span>
              <span className="text-sm font-bold text-indigo-800">$215k</span>
            </div>
            <div className="w-[60%] max-w-md bg-indigo-600 border border-indigo-700 rounded-b-lg h-16 flex items-center justify-between px-6 shadow-lg shadow-indigo-200 text-white">
              <span className="text-lg font-bold">Closed Won (64)</span>
              <span className="text-lg font-bold">+$180k</span>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white shrink-0 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Recent Activity
            </h3>
          </div>
          
          <div className="flex-1 space-y-6 overflow-y-auto pr-2">
            {[
              { text: "Sarah Jenks moved 'Acme Corp Upgrade' to Negotiation.", time: "10 min ago", bg: "bg-amber-100", textCol: "text-amber-700" },
              { text: "Call logged with TechGlobal CXO.", time: "45 min ago", bg: "bg-blue-100", textCol: "text-blue-700" },
              { text: "Michael Scott closed 'Dunder Mifflin Contract'.", time: "2 hours ago", bg: "bg-emerald-100", textCol: "text-emerald-700" },
              { text: "Proposal sent to Vandelay Industries.", time: "3 hours ago", bg: "bg-purple-100", textCol: "text-purple-700" },
              { text: "New lead generated: StartUp Inc. via Website", time: "5 hours ago", bg: "bg-slate-100", textCol: "text-slate-700" },
            ].map((feed, i) => (
              <div key={i} className="flex gap-4 relative">
                {i !== 4 && <div className="absolute top-8 bottom-[-24px] left-3 w-px bg-slate-200"></div>}
                <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center ${feed.bg} ${feed.textCol} ring-4 ring-white relative z-10`}>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                </div>
                <div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-tight">{feed.text}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-semibold">{feed.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
            View All Activity
          </button>
        </div>
      </div>
      
      {/* Top Reps */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Top Performing Reps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Adrian Sterling", role: "Sr. Account Executive", revenue: "$450k", deals: 14, avatar: "AS" },
            { name: "Sarah Jenks", role: "Account Executive", revenue: "$320k", deals: 11, avatar: "SJ" },
            { name: "Michael Scott", role: "Regional Manager", revenue: "$280k", deals: 8, avatar: "MS" },
          ].map((rep, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50 dark:bg-slate-950/50">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
                {rep.avatar}
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{rep.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{rep.role}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">{rep.revenue}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">{rep.deals} Deals</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
