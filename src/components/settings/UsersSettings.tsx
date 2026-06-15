import { UserPlus, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export function UsersSettings() {
  const users = [
    { id: 1, name: 'Adrian Sterling', email: 'adrian@nexus.corp', role: 'Admin', status: 'Active', lastLogin: 'Just now', initial: 'AS', color: 'bg-indigo-100 text-indigo-700' },
    { id: 2, name: 'Jane Doe', email: 'jane.d@nexus.corp', role: 'Manager', status: 'Active', lastLogin: '2 hours ago', initial: 'JD', color: 'bg-emerald-100 text-emerald-700' },
    { id: 3, name: 'Mark Logger', email: 'mark.l@nexus.corp', role: 'User', status: 'Active', lastLogin: 'Yesterday', initial: 'ML', color: 'bg-amber-100 text-amber-700' },
    { id: 4, name: 'Sarah Connor', email: 'sarah.c@nexus.corp', role: 'Viewer', status: 'Inactive', lastLogin: '2 weeks ago', initial: 'SC', color: 'bg-slate-100 text-slate-500' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
         <div>
         <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Users & Permissions</h3>
         <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage team access and roles.</p>
         </div>
         <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm">
            <UserPlus className="w-4 h-4" />
            Invite User
         </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                     <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">User</th>
                     <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Role</th>
                     <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                     <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Last Login</th>
                     <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {users.map(user => (
                     <tr key={user.id} className="hover:bg-slate-50 dark:bg-slate-950/50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0", user.color)}>
                                 {user.initial}
                              </div>
                              <div>
                                 <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                              {user.role}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5">
                              <div className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300')}></div>
                              <span className={cn("text-xs font-medium", user.status === 'Active' ? 'text-slate-700' : 'text-slate-500')}>
                                 {user.status}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                           {user.lastLogin}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-400 rounded">
                              <MoreVertical className="w-4 h-4" />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <div className="pt-6">
         <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">Role Permissions Overview</h4>
         <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                     <tr>
                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Module</th>
                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">Admin</th>
                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">Manager</th>
                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">User</th>
                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">Viewer</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {['CRM & Sales', 'Inventory', 'Interventions', 'Financials'].map((module, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:bg-slate-950/50">
                           <td className="px-6 py-3 text-slate-700 dark:text-slate-300 font-medium">{module}</td>
                           <td className="px-6 py-3 text-center text-xs text-indigo-600 font-medium">Full Access</td>
                           <td className="px-6 py-3 text-center text-xs text-emerald-600 font-medium">Can Edit</td>
                           <td className="px-6 py-3 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">{module === 'Financials' ? 'No Access' : 'Create Only'}</td>
                           <td className="px-6 py-3 text-center text-xs text-slate-400 font-medium">View Only</td>
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
