import { Laptop, AlertTriangle } from 'lucide-react';

export function SecuritySettings() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Security</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Secure your account and monitor access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <section className="space-y-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 pb-3">Authentication</h4>
            
            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password Policy</label>
                  <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none">
                     <option>Standard (Min 8 characters)</option>
                     <option>Strong (Min 12 + Symbols + Numbers)</option>
                     <option>Strict (Strong + 90 Day Rotation)</option>
                  </select>
               </div>
               
               <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-sm mt-4">
                  <div>
                     <p className="font-bold text-slate-900 dark:text-white text-sm">Two-Factor Authentication (2FA)</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Require an extra step on login.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                     <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
               </div>
            </div>
         </section>

         <section className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 pb-3">Active Sessions</h4>
            
            <div className="space-y-3">
               <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-indigo-50/30 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                     <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                        <Laptop className="w-4 h-4" />
                     </div>
                     <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Mac OS - Chrome (Current Session)</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">London, UK • IP: 192.168.1.1</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-2">Active Right Now</p>
                     </div>
                  </div>
               </div>

               <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 flex items-start justify-between group hover:border-rose-200 transition-colors">
                  <div className="flex items-start gap-3">
                     <div className="p-2 bg-slate-100 text-slate-500 dark:text-slate-400 rounded-lg shrink-0 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                        <Laptop className="w-4 h-4" />
                     </div>
                     <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Windows 11 - Edge</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Berlin, DE • IP: 10.0.0.45</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">Last active: 2 hours ago</p>
                     </div>
                  </div>
                  <button className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                     Revoke
                  </button>
               </div>
            </div>
            
            <button className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white underline mt-4">
               Log out of all other sessions
            </button>
         </section>
      </div>

      <div className="pt-8 border-t border-slate-100">
         <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-400" /> Audit Log
         </h4>
         <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
               <input type="text" placeholder="Search audit logs..." className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:bg-slate-900 transition-colors" />
               <button className="text-xs font-bold text-indigo-600">Export CSV</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-100">
                     <tr>
                        <th className="px-6 py-3 font-semibold text-[10px] uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-3 font-semibold text-[10px] uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 font-semibold text-[10px] uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 font-semibold text-[10px] uppercase tracking-wider">IP Address</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {[
                        { time: 'May 03, 13:05', user: 'Adrian Sterling', action: 'Changed active module settings', ip: '192.168.1.1' },
                        { time: 'May 03, 11:20', user: 'Adrian Sterling', action: 'Invited Jane Doe', ip: '192.168.1.1' },
                        { time: 'May 02, 09:14', user: 'System', action: 'Automated backup completed', ip: 'Internal' },
                     ].map((log, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                           <td className="px-6 py-3 text-slate-500 dark:text-slate-400 text-xs font-mono">{log.time}</td>
                           <td className="px-6 py-3 text-slate-700 dark:text-slate-300 font-medium text-xs">{log.user}</td>
                           <td className="px-6 py-3 text-slate-700 dark:text-slate-300 text-xs">{log.action}</td>
                           <td className="px-6 py-3 text-slate-400 font-mono text-[10px]">{log.ip}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

    </div>
  );
}
