import { Plus, Maximize, MapPin, Grid2X2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function InventoryWarehouses() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Warehouses & Locations</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage physical spaces, zones, and storage bins.</p>
        </div>
        <div className="flex gap-2">
          <select className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
            <option>Warehouse A - Main Tech</option>
            <option>Warehouse B - Cables</option>
            <option>Warehouse C - Heavy</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
            <Plus className="w-4 h-4" />
            New Location
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Layout Sidebar */}
        <div className="w-1/3 flex flex-col gap-6">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <MapPin className="w-4 h-4 text-slate-400" /> Structure
              </h3>
              <div className="space-y-1">
                 {/* Tree view mockup */}
                 <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <span className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                       <Grid2X2 className="w-4 h-4 text-indigo-500" /> Zone 1 - Electronics
                    </span>
                    <div className="ml-6 mt-2 space-y-1">
                       <div className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 cursor-pointer p-1">Aisle 1 (High Value)</div>
                       <div className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 cursor-pointer p-1">Aisle 2 (Sensors)</div>
                       <div className="text-xs font-medium text-indigo-600 bg-white dark:bg-slate-900 border border-slate-100 rounded shadow-sm p-1">Aisle 3 (Actuators)</div>
                    </div>
                 </div>
                 <div className="p-2 border border-transparent hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">Zone 2 - Bulk Items</div>
                 <div className="p-2 border border-transparent hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">Zone 3 - Packaging</div>
              </div>
           </div>
           
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-4 flex-1">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Location Details</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-xl mb-4">
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Current Selection</p>
                 <p className="font-bold text-slate-800 dark:text-slate-200">Zone 1 / Aisle 3</p>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Utilization</span>
                    <span className="font-bold text-slate-900 dark:text-white">85%</span>
                 </div>
                 <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[85%]"></div>
                 </div>
                 <div className="flex justify-between items-center text-sm pt-2">
                    <span className="text-slate-500 dark:text-slate-400">SKUs Stored</span>
                    <span className="font-bold text-slate-900 dark:text-white">142</span>
                 </div>
              </div>
              <button className="w-full mt-6 py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                Manage Bins
              </button>
           </div>
        </div>

        {/* Visual Map Mockup */}
        <div className="flex-1 bg-slate-100 border border-slate-300 rounded-2xl shadow-inner relative overflow-hidden flex items-center justify-center">
           <div className="absolute top-4 right-4 flex gap-2">
             <div className="flex items-center gap-1 bg-white dark:bg-slate-900/80 backdrop-blur px-2 py-1 rounded shadow-sm text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-400"></div>Empty</div>
             <div className="flex items-center gap-1 bg-white dark:bg-slate-900/80 backdrop-blur px-2 py-1 rounded shadow-sm text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"><div className="w-2 h-2 rounded-full bg-amber-400"></div>Medium</div>
             <div className="flex items-center gap-1 bg-white dark:bg-slate-900/80 backdrop-blur px-2 py-1 rounded shadow-sm text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"><div className="w-2 h-2 rounded-full bg-rose-500"></div>Full</div>
           </div>
           
           <button className="absolute bottom-4 right-4 p-2 bg-white dark:bg-slate-900 rounded-lg shadow border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-600">
             <Maximize className="w-4 h-4" />
           </button>
           
           <div className="grid grid-cols-4 gap-8 p-12 w-full max-w-2xl">
              {[
                 [0, 1, 0, 1],
                 [1, 2, 2, 0],
                 [0, 0, 1, 0],
                 [1, 1, 1, 2]
              ].map((row, r) => (
                 <div key={r} className="flex flex-col gap-2">
                    {row.map((col, c) => (
                       <div 
                         key={c} 
                         title={`Aisle ${r+1} Bin ${c+1}`}
                         className={cn(
                           "h-12 w-full rounded border-2 cursor-pointer transition-colors shadow-sm",
                           col === 0 ? "bg-emerald-100 border-emerald-300" : 
                           col === 1 ? "bg-amber-100 border-amber-400" : 
                           "bg-rose-200 border-rose-500"
                         )}
                       ></div>
                    ))}
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
