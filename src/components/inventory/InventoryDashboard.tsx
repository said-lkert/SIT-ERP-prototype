import { 
  Package, 
  AlertTriangle, 
  Truck, 
  ArrowDownToLine, 
  TrendingUp, 
  Activity,
  Layers,
  ArrowRight,
  BellRing
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function InventoryDashboard({ onNavigate }: { onNavigate: (tab: any) => void }) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
         <h2 className="text-xl font-bold text-slate-900 dark:text-white">Real-time Overview</h2>
         <p className="text-xs text-slate-500 dark:text-slate-400">Last synced: Just now</p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total SKUs', value: '4,892', sub: 'Across 3 warehouses', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Stock Value', value: '$1.42M', sub: '+2.4% vs last mo', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Low Stock Alerts', value: '24', sub: 'Action required', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', alert: true },
          { label: 'Out of Stock', value: '8', sub: 'Critical shortage', icon: ArrowDownToLine, color: 'text-rose-600', bg: 'bg-rose-50', alert: true },
          { label: 'Pending Deliveries', value: '142', sub: 'Exp. this week', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
            {stat.alert && <div className="absolute top-0 right-0 w-12 h-12 bg-rose-50 rounded-bl-full -z-0"></div>}
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 mb-1">{stat.label}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Value Evolution Chart (Simplified) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 dark:text-white shrink-0">Inventory Value Evolution</h3>
            <select className="text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 dark:text-slate-400">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end gap-2 px-2 h-48 mt-4 relative">
             {/* Grid lines */}
             <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-slate-300 w-full h-0"></div>
                <div className="border-b border-slate-300 w-full h-0"></div>
                <div className="border-b border-slate-300 w-full h-0"></div>
                <div className="border-b border-slate-300 w-full h-0"></div>
             </div>
             
             {/* Bars */}
             {[60, 65, 58, 80, 85, 95].map((h, i) => (
               <div key={i} className="flex-1 flex flex-col gap-1 items-center z-10">
                 <div className="w-full bg-slate-100 rounded-t-lg relative group">
                    <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg transition-all" style={{ height: `${h}%` }}></div>
                    <div className="absolute bottom-0 w-full bg-indigo-400 rounded-t-lg opacity-0 transition-opacity group-hover:opacity-100" style={{ height: `${h}%` }}></div>
                 </div>
               </div>
             ))}
          </div>
          <div className="flex justify-between px-6 mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
          </div>
        </div>

        {/* Health Indicator & Top Moving */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-white shrink-0 mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Overall Stock Health
          </h3>
          
          <div className="mb-8">
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex mb-2">
              <div className="bg-emerald-500 h-full w-[75%]" title="Healthy"></div>
              <div className="bg-amber-400 h-full w-[15%]" title="Low"></div>
              <div className="bg-rose-500 h-full w-[10%]" title="Critical/OOS"></div>
            </div>
            <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              <span className="text-emerald-600">75% Healthy</span>
              <span className="text-rose-600">10% Alerts</span>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white shrink-0 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Top Moving Products
          </h3>
          <div className="space-y-4 flex-1">
             {[
               { name: "ProSensor X1", code: "SEN-X1-001", vol: "1.2k units/mo", status: "Healthy", color: "bg-emerald-500" },
               { name: "Industrial Servo M4", code: "SRV-M4-200", vol: "850 units/mo", status: "Low", color: "bg-amber-400" },
               { name: "Logic Controller Z", code: "PLC-Z-99", vol: "640 units/mo", status: "Critical", color: "bg-rose-500" },
               { name: "Thermal Paste 50g", code: "THM-P50", vol: "500 units/mo", status: "Healthy", color: "bg-emerald-500" },
             ].map((prod, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors leading-tight">{prod.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{prod.code}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{prod.vol}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                       <span className={`w-2 h-2 rounded-full ${prod.color}`}></span>
                       <span className="text-[9px] uppercase font-bold text-slate-400">{prod.status}</span>
                    </div>
                  </div>
                </div>
             ))}
          </div>
          <button 
             onClick={() => onNavigate('catalog')}
             className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            View All Catalog <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Live Alert Feed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white shrink-0 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-rose-500" />
            Live Alert Feed
          </h3>
          <button 
             onClick={() => onNavigate('alerts')}
             className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600"
          >
            Manage Alerts
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { msg: "Industrial Servo M4 dropped below minimum (12 < 20).", time: "10 min ago", bg: "bg-amber-50" },
            { msg: "Logic Controller Z is OUT OF STOCK.", time: "1 hour ago", bg: "bg-rose-50" },
            { msg: "Delivery #PO-992 delayed by 3 days.", time: "2 hours ago", bg: "bg-amber-50" }
          ].map((alert, i) => (
             <div key={i} className={cn("p-4 rounded-xl border border-slate-100 flex gap-3", alert.bg)}>
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center shrink-0">
                  <AlertTriangle className={cn("w-4 h-4", alert.bg === 'bg-rose-50' ? "text-rose-500" : "text-amber-500")} />
                </div>
                <div>
                   <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">{alert.msg}</p>
                   <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mt-1">{alert.time}</p>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
