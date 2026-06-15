export function CRMCommunication() {
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col h-full items-center justify-center animate-in fade-in duration-500 text-center">
      <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Omnichannel Communication Hub</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">Connect your email client, VoIP provider, and calendar to see all interactions chronologically linked to your deals and contacts.</p>
      
      <div className="flex gap-4">
        <button className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-sm">
          Connect Google Workspace
        </button>
        <button className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-sm">
          Connect Office 365
        </button>
      </div>
    </div>
  );
}
