import { Download, CreditCard, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

export function BillingSettings() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Billing & Subscription</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your plan, billing details, and invoices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Plan Details */}
         <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-start justify-between">
            <div className="space-y-4">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <h4 className="font-bold text-slate-900 dark:text-white text-lg">Professional Plan</h4>
                     <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">Active</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Billed annually ($1,188.00 / year)</p>
               </div>
               
               <div className="flex gap-8 pt-4">
                  <div>
                     <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">4<span className="text-sm text-slate-400 font-sans font-medium">/10</span></p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active Users</p>
                  </div>
                  <div>
                     <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">12<span className="text-sm text-slate-400 font-sans font-medium">GB</span></p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Storage Used (50GB limit)</p>
                  </div>
               </div>
            </div>
            
            <div className="w-full sm:w-auto bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 text-center">
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Next Billing Date</p>
               <p className="font-bold text-slate-900 dark:text-white mb-4">Oct 14, 2026</p>
               <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> Upgrade Plan
               </button>
            </div>
         </div>

         {/* Payment Method */}
         <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
               <CreditCard className="w-4 h-4 text-slate-400" /> Payment Method
            </h4>
            <div className="flex items-center gap-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
               <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-white font-bold text-xs italic tracking-wider">
                  VISA
               </div>
               <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">•••• 4242</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Expires 12/28</p>
               </div>
            </div>
            <button className="mt-4 w-full py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
               Update Payment Info
            </button>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
         <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Billing History</h4>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                     <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Date</th>
                     <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Description</th>
                     <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Amount</th>
                     <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                     <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Invoice</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {[
                     { date: 'Oct 14, 2025', desc: 'Professional Plan (Annual)', amount: '$1,188.00', status: 'Paid' },
                     { date: 'Oct 14, 2024', desc: 'Professional Plan (Annual)', amount: '$1,188.00', status: 'Paid' },
                     { date: 'Oct 14, 2023', desc: 'Starter Plan (Annual)', amount: '$588.00', status: 'Paid' },
                  ].map((inv, i) => (
                     <tr key={i} className="hover:bg-slate-50 dark:bg-slate-950/50 transition-colors">
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{inv.date}</td>
                        <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{inv.desc}</td>
                        <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">{inv.amount}</td>
                        <td className="px-6 py-4">
                           <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                              {inv.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="text-indigo-600 hover:text-indigo-800 p-1">
                              <Download className="w-4 h-4" />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
