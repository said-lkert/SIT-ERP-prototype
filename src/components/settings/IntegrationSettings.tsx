import { Check, Mail, MessageSquare, CreditCard, Cloud, BarChart } from 'lucide-react';
import { cn } from '../../lib/utils';

export function IntegrationSettings() {
  const integrations = [
    { id: 1, name: 'QuickBooks Online', desc: 'Sync invoices, expenses, and accounts.', icon: BarChart, status: 'Connected', color: 'text-green-600 bg-green-50' },
    { id: 2, name: 'Stripe', desc: 'Process payments and manage subscriptions.', icon: CreditCard, status: 'Not Connected', color: 'text-indigo-600 bg-indigo-50' },
    { id: 3, name: 'Google Workspace', desc: 'Sync calendar, contacts, and drive.', icon: Cloud, status: 'Connected', color: 'text-blue-600 bg-blue-50' },
    { id: 4, name: 'Mailchimp', desc: 'Sync CRM contacts to email lists.', icon: Mail, status: 'Not Connected', color: 'text-yellow-600 bg-yellow-50' },
    { id: 5, name: 'Twilio SMS', desc: 'Send automated text messages to clients.', icon: MessageSquare, status: 'Not Connected', color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Integrations</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Connect your workspace with third-party tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {integrations.map((integration) => (
            <div key={integration.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
               <div>
                  <div className="flex items-start justify-between mb-4">
                     <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", integration.color)}>
                        <integration.icon className="w-6 h-6" />
                     </div>
                     {integration.status === 'Connected' && (
                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                           <Check className="w-3 h-3" /> Connected
                        </span>
                     )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">{integration.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{integration.desc}</p>
               </div>
               
               <button className={cn(
                  "w-full py-2 rounded-lg text-sm font-bold transition-colors",
                  integration.status === 'Connected' 
                     ? "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200" 
                     : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100"
               )}>
                  {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
               </button>
            </div>
         ))}

         {/* API Card */}
         <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed p-6 flex flex-col items-center justify-center text-center">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Developer API</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-[200px]">Build custom integrations with our REST API.</p>
            <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
               Generate Token
            </button>
         </div>
      </div>
    </div>
  );
}
