import { useState } from 'react';
import { 
  Settings2, 
  Palette, 
  Globe, 
  Users, 
  Bell, 
  Blocks, 
  CreditCard, 
  ShieldCheck 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ThemeSettings } from './ThemeSettings';
import { GeneralSettings } from './GeneralSettings';
import { LanguageSettings } from './LanguageSettings';
import { UsersSettings } from './UsersSettings';
import { NotificationSettings } from './NotificationSettings';
import { IntegrationSettings } from './IntegrationSettings';
import { BillingSettings } from './BillingSettings';
import { SecuritySettings } from './SecuritySettings';

type SettingsTab = 'general' | 'theme' | 'language' | 'users' | 'notifications' | 'integrations' | 'billing' | 'security';

export function SettingsModule() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings2 },
    { id: 'theme', label: 'Theme & Appearance', icon: Palette },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'users', label: 'Users & Permissions', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Blocks },
    { id: 'billing', label: 'Billing & Subscription', icon: CreditCard },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors">
      {/* Sub-sidebar for settings */}
      <div className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shrink-0 h-full flex flex-col overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.01)] relative transition-colors">
        <div className="p-6 pb-2 shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage system preferences</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left",
                activeTab === tab.id
                  ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <tab.icon className={cn("w-4 h-4 shrink-0 transition-colors", activeTab === tab.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Settings Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto min-h-full pb-32">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'theme' && <ThemeSettings />}
          {activeTab === 'language' && <LanguageSettings />}
          {activeTab === 'users' && <UsersSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'integrations' && <IntegrationSettings />}
          {activeTab === 'billing' && <BillingSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}
