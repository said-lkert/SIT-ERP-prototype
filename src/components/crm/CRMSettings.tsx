export function CRMSettings() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Module Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your CRM pipelines, tags, and automation rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold">Pipelines & Stages</button>
          <button className="w-full text-left px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm font-medium">Custom Fields</button>
          <button className="w-full text-left px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm font-medium">Tags & Categories</button>
          <button className="w-full text-left px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm font-medium">Email Templates</button>
          <button className="w-full text-left px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm font-medium">User Permissions</button>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Pipeline Configuration</h3>
          
          <div className="space-y-4">
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Enterprise Sales Flow</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">5 Stages • Default</p>
              </div>
              <button className="text-sm font-bold text-indigo-600">Edit</button>
            </div>
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">SMB Self-Serve</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">3 Stages</p>
              </div>
              <button className="text-sm font-bold text-indigo-600">Edit</button>
            </div>
            
            <button className="w-full mt-4 py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-bold hover:text-slate-800 dark:text-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-950 transition-colors">
              + New Pipeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
