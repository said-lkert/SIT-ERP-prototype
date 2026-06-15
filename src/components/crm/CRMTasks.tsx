import { CheckSquare, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';

const TASKS = [
  { id: 1, title: 'Follow up on proposal', type: 'Email', relatedTo: 'TechGlobal Enterprise', dueDate: 'Today', priority: 'High', status: 'pending' },
  { id: 2, title: 'Schedule Discovery Call', type: 'Call', relatedTo: 'Wayne Ent.', dueDate: 'Tomorrow', priority: 'Medium', status: 'pending' },
  { id: 3, title: 'Send contract draft', type: 'To-do', relatedTo: 'LexCorp Data', dueDate: 'Oct 20', priority: 'High', status: 'completed' },
  { id: 4, title: 'Check in with Alice', type: 'Call', relatedTo: 'Alice Freeman', dueDate: 'Oct 22', priority: 'Low', status: 'pending' },
];

export function CRMTasks() {
  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tasks & Activities</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your daily sales activities and follow-ups.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-200 p-1 rounded-lg flex text-sm font-medium">
             <button className="px-4 py-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded shadow-sm">List view</button>
             <button className="px-4 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300">Calendar view</button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm ml-2">
            New Task
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex-1">
        <ul className="divide-y divide-slate-100">
          {TASKS.map((task) => (
             <li key={task.id} className="p-4 hover:bg-slate-50 dark:bg-slate-950 flex items-start gap-4 transition-colors group">
               <button className={`mt-0.5 shrink-0 ${task.status === 'completed' ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}>
                 <CheckSquare className="w-5 h-5" />
               </button>
               <div className="flex-1">
                 <div className="flex items-center gap-2">
                   <h4 className={`text-sm font-bold ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</h4>
                   {task.priority === 'High' && task.status !== 'completed' && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                 </div>
                 <div className="flex gap-4 mt-2 text-xs">
                   <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                     <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 dark:border-slate-700">{task.type}</span>
                   </span>
                   <span className="flex items-center gap-1 text-indigo-600 font-medium cursor-pointer hover:underline">
                     Related to: {task.relatedTo}
                   </span>
                 </div>
               </div>
               <div className="text-right">
                 <div className={`flex items-center gap-1.5 text-xs font-bold ${task.dueDate === 'Today' ? 'text-rose-600 bg-rose-50 px-2 py-1 rounded' : 'text-slate-500'}`}>
                   {task.dueDate === 'Today' ? <Clock className="w-3 H-3" /> : <CalendarIcon className="w-3 h-3" />}
                   {task.dueDate}
                 </div>
               </div>
             </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
