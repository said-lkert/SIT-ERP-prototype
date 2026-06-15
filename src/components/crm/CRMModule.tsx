import { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  KanbanSquare, 
  Briefcase, 
  CheckSquare, 
  MessageSquare, 
  PieChart, 
  Target, 
  Settings 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { CRMDashboard } from './CRMDashboard';
import { CRMContacts } from './CRMContacts';
import { CRMPipeline } from './CRMPipeline';
import { CRMDeals } from './CRMDeals';
import { CRMTasks } from './CRMTasks';
import { CRMCommunication } from './CRMCommunication';
import { CRMReports } from './CRMReports';
import { CRMLeads } from './CRMLeads';
import { CRMSettings } from './CRMSettings';

type CRMTab = 'dashboard' | 'contacts' | 'pipeline' | 'deals' | 'tasks' | 'communication' | 'reports' | 'leads' | 'settings';

export function CRMModule() {
  const [activeTab, setActiveTab] = useState<CRMTab>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'pipeline', label: 'Pipeline', icon: KanbanSquare },
    { id: 'deals', label: 'Deals', icon: Briefcase },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'communication', label: 'Comms', icon: MessageSquare },
    { id: 'reports', label: 'Reports', icon: PieChart },
    { id: 'leads', label: 'Leads', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden w-full relative">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 px-8 pt-6 pb-4 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sales & CRM</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage relationships, track deals, and accelerate growth.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          + New Record
        </button>
      </div>

      {/* Secondary Nav for CRM */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 shrink-0 flex items-center overflow-x-auto hide-scrollbar z-10 relative shadow-sm">
        <div className="flex items-center gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CRMTab)}
              className={cn(
                "flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                activeTab === tab.id 
                  ? "border-indigo-600 text-indigo-600" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* CRM Content Area */}
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
        <div className="h-full">
          {activeTab === 'dashboard' && <CRMDashboard />}
          {activeTab === 'contacts' && <CRMContacts />}
          {activeTab === 'pipeline' && <CRMPipeline />}
          {activeTab === 'deals' && <CRMDeals />}
          {activeTab === 'tasks' && <CRMTasks />}
          {activeTab === 'communication' && <CRMCommunication />}
          {activeTab === 'reports' && <CRMReports />}
          {activeTab === 'leads' && <CRMLeads />}
          {activeTab === 'settings' && <CRMSettings />}
        </div>
      </div>
    </div>
  );
}
