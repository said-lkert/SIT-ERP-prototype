export function CRMLeads() {
  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col justify-center items-center text-center animate-in fade-in duration-500">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-sm">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Lead Inbox</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-lg mb-8">This is the holding pen for unqualified prospects before they enter your pipeline. Import a CSV or connect a web form to get started.</p>
      
      <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">
        Import Leads (CSV)
      </button>
    </div>
  );
}
