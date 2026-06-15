import { useEffect, useRef, useState } from 'react';
import { Bell, Moon, Sun, Menu, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useSettings } from './settings/SettingsContext';

interface HeaderProps {
  toggleSidebar?: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const { isDarkMode, setIsDarkMode } = useSettings();
  const actors = [
    { role: 'Administrateur', name: 'Adrian Sterling', initials: 'AS' },
    { role: 'Commercial', name: 'Samia Kaci', initials: 'SK' },
    { role: 'Magasinier', name: 'Karim Amrane', initials: 'KA' },
    { role: 'Technicien', name: 'Yacine Meziane', initials: 'YM' },
  ];
  const [currentActor, setCurrentActor] = useState(() => {
    const role = localStorage.getItem('sit-erp-demo-role') || 'Administrateur';
    return actors.find((actor) => actor.role === role) || actors[0];
  });
  const [isActorMenuOpen, setIsActorMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notification, setNotification] = useState<any>(() => {
    const saved = localStorage.getItem('sit-erp-technician-notification');
    return saved ? JSON.parse(saved) : null;
  });
  const actorMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const receiveNotification = (event: Event) => setNotification((event as CustomEvent).detail);
    window.addEventListener('sit-erp-technician-notification', receiveNotification);
    return () => window.removeEventListener('sit-erp-technician-notification', receiveNotification);
  }, []);

  const selectActor = (actor: typeof actors[number]) => {
    localStorage.setItem('sit-erp-demo-role', actor.role);
    setCurrentActor(actor);
    setIsActorMenuOpen(false);
    setIsNotificationOpen(false);
  };

  const technicianHasNotification = currentActor.role === 'Technicien' && notification;

  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 z-40 shrink-0 transition-colors relative">
      <div className="flex items-center flex-1 w-1/3">
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg mr-1 md:mr-3 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-center flex-1 w-1/3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white hidden sm:block">SIT<span className="text-indigo-600">-ERP</span></span>
        </div>
      </div>
      
      <div className="flex items-center justify-end flex-1 w-1/3 gap-2 md:gap-4">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors hidden sm:block"
        >
           {isDarkMode ? <Moon className="w-5 h-5 md:w-6 md:h-6" /> : <Sun className="w-5 h-5 md:w-6 md:h-6" />}
        </button>
        <div className="relative">
        <button
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors"
        >
          <Bell className="w-5 h-5 md:w-6 md:h-6" />
          {technicianHasNotification && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>}
        </button>
        {isNotificationOpen && (
          <div className="absolute right-0 top-12 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900 z-50">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Notifications</p>
            {technicianHasNotification ? (
              <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <div className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{notification.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{notification.message}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-slate-500">Aucune notification pour ce compte.</p>
            )}
          </div>
        )}
        </div>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 md:mx-2 transition-colors"></div>
        <div className="relative" ref={actorMenuRef}>
        <button
          onClick={() => setIsActorMenuOpen(!isActorMenuOpen)}
          className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-slate-100">{currentActor.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{currentActor.role}</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold shrink-0 transition-colors text-sm md:text-base">
            {currentActor.initials}
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
        {isActorMenuOpen && (
          <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Basculer vers un compte</p>
            {actors.map((actor) => (
              <button
                key={actor.role}
                onClick={() => selectActor(actor)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{actor.initials}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{actor.name}</p>
                  <p className="text-xs text-slate-500">{actor.role}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        </div>
      </div>
    </header>
  );
}
