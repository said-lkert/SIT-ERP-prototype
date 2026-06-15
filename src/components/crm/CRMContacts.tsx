import { Search, Filter, MoreHorizontal, Mail, Phone, ExternalLink, Plus } from 'lucide-react';

const CONTACTS = [
  { id: 1, name: 'Alice Freeman', company: 'TechGlobal', role: 'CTO', email: 'alice@techglobal.io', phone: '+1 (555) 019-2831', status: 'Active', statusColor: 'bg-emerald-100 text-emerald-700' },
  { id: 2, name: 'Bob Richards', company: 'Acme Corp', role: 'VP Sales', email: 'robert.r@acme.com', phone: '+1 (555) 921-3310', status: 'In Negotiation', statusColor: 'bg-amber-100 text-amber-700' },
  { id: 3, name: 'Carol Danvers', company: 'Stark Ind.', role: 'Director', email: 'carol@stark.com', phone: '+1 (555) 441-9922', status: 'Lead', statusColor: 'bg-indigo-100 text-indigo-700' },
  { id: 4, name: 'Dave Lister', company: 'Jupiter Mining', role: 'Technician', email: 'dave@jmc.org', phone: '+44 7700 900077', status: 'Lost', statusColor: 'bg-slate-200 text-slate-600' },
  { id: 5, name: 'Eve Moneypenny', company: 'MI6 Ltd', role: 'Secretary', email: 'eve@mi6.gov.uk', phone: '+44 20 7123 4567', status: 'Active', statusColor: 'bg-emerald-100 text-emerald-700' },
  { id: 6, name: 'Frank Castle', company: 'Punishers LLC', role: 'Consultant', email: 'frank@punishers.com', phone: '+1 (555) 888-0000', status: 'Inactive', statusColor: 'bg-rose-100 text-rose-700' },
];

export function CRMContacts() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700 dark:text-slate-300">
            Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Name</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Company & Role</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Contact Info</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-6 py-4 font-semibold text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CONTACTS.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors group">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs shrink-0">
                        {(contact.name || '').split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 cursor-pointer">{contact.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1 group-hover:text-indigo-600 cursor-pointer">
                      {contact.company} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{contact.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {contact.email}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {contact.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${contact.statusColor}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-auto px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Showing 1 to 6 of 6 entries</span>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 disabled:opacity-50">Prev</button>
            <button className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
