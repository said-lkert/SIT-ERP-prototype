import { Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';

const MOVEMENTS = [
  { id: 'MV-9921', date: '2026-05-01 14:30', product: 'ProSensor X1', code: 'SEN-X1-001', type: 'EXIT', doc: 'SO-10492', location: 'WH-A / Z1 / S2', qty: -15, user: 'A. Sterling' },
  { id: 'MV-9920', date: '2026-05-01 11:15', product: 'Industrial Servo M4', code: 'SRV-M4-200', type: 'ENTRY', doc: 'PO-4401', location: 'WH-A / Z2 / S1', qty: 10, user: 'Warehouse Bot #2' },
  { id: 'MV-9919', date: '2026-04-30 09:00', product: 'Cat6 Cable 10m', code: 'CBL-CAT6-10M', type: 'EXIT', doc: 'WO-882', location: 'WH-B / Z1 / S1', qty: -50, user: 'System Auto' },
  { id: 'MV-9918', date: '2026-04-29 16:45', product: 'Logic Controller Z', code: 'PLC-Z-99', type: 'TRANSFER', doc: 'TR-102', location: 'WH-C -> WH-A', qty: 5, user: 'M. Scott' },
  { id: 'MV-9917', date: '2026-04-29 14:20', product: 'Thermal Paste 50g', code: 'THM-P50', type: 'ENTRY', doc: 'PO-4399', location: 'WH-A / Z3 / S4', qty: 250, user: 'J. Smith' },
];

export function InventoryMovements() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Movements Log</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Audit trail of all inventory changes across all locations.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search reference, SKU..." 
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Date / Time</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Movement Type</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Product</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Reference / Location</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">Quantity</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOVEMENTS.map((mov) => (
                <tr key={mov.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                    {mov.date}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit border
                      ${mov.type === 'ENTRY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        mov.type === 'EXIT' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-blue-50 text-blue-700 border-blue-200'}`}
                    >
                      {mov.type === 'ENTRY' && <ArrowDownRight className="w-3 h-3" />}
                      {mov.type === 'EXIT' && <ArrowUpRight className="w-3 h-3" />}
                      {mov.type === 'TRANSFER' && <RefreshCcw className="w-3 h-3" />}
                      {mov.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white">{mov.product}</span>
                      <span className="text-[10px] font-mono text-slate-400">{mov.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-white text-xs font-semibold">{mov.doc}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{mov.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-mono font-bold ${mov.qty > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {mov.qty > 0 ? `+${mov.qty}` : mov.qty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {mov.user}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>Showing latest 5 movements</span>
        </div>
      </div>
    </div>
  );
}
