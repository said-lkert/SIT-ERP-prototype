import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Mail, Smartphone, BellRing } from 'lucide-react';

export function NotificationSettings() {
  const events = [
    { id: 1, name: 'New Order Received', desc: 'When a customer places a new order.', inapp: true, email: true, sms: false },
    { id: 2, name: 'Stock Level Alert', desc: 'When inventory drops below minimum threshold.', inapp: true, email: true, sms: true },
    { id: 3, name: 'Invoice Overdue', desc: 'When a payment is past its due date.', inapp: true, email: false, sms: false },
    { id: 4, name: 'Task Assigned', desc: 'When you are assigned a new task.', inapp: true, email: true, sms: false },
    { id: 5, name: 'Intervention Scheduled', desc: 'When a new field intervention is assigned.', inapp: true, email: true, sms: true },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Notifications</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Control how and when you receive system alerts.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                     <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider w-1/2">Event</th>
                     <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">
                        <div className="flex flex-col items-center gap-1">
                           <BellRing className="w-4 h-4 text-slate-400" />
                           In-App
                        </div>
                     </th>
                     <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">
                        <div className="flex flex-col items-center gap-1">
                           <Mail className="w-4 h-4 text-slate-400" />
                           Email
                        </div>
                     </th>
                     <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">
                        <div className="flex flex-col items-center gap-1">
                           <Smartphone className="w-4 h-4 text-slate-400" />
                           SMS
                        </div>
                     </th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {events.map((evt) => (
                     <tr key={evt.id} className="hover:bg-slate-50 dark:bg-slate-950/50 transition-colors">
                        <td className="px-6 py-4">
                           <p className="font-bold text-slate-900 dark:text-white">{evt.name}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{evt.desc}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked={evt.inapp} />
                              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                           </label>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked={evt.email} />
                              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                           </label>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked={evt.sms} />
                              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                           </label>
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
