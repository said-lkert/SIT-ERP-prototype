import React, { useState } from 'react';
import { LayoutDashboard, Store, Settings, X, ChevronRight, ChevronDown, Archive, LogOut } from 'lucide-react';
import { AppTab } from '../types';
import { cn } from '../lib/utils';
import { ALL_MODULES, MODULE_FAMILIES } from '../data/modules';

interface SidebarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  activeModuleIds: string[];
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  onLogout?: () => void;
}

export function Sidebar({ currentTab, onTabChange, activeModuleIds, isOpen, setIsOpen, onLogout }: SidebarProps) {
  const activeModules = ALL_MODULES.filter(m => activeModuleIds.includes(m.id));
  const [isHovered, setIsHovered] = useState(false);
  const [expandedFamilies, setExpandedFamilies] = useState<Record<string, boolean>>({
    'referentiel': true
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Desktop expansion state: either explicitly open (pinned) or hovered temporarily
  const isExpandedDesktop = isOpen || isHovered;

  const toggleFamily = (familyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFamilies(prev => ({
      ...prev,
      [familyId]: !prev[familyId]
    }));
  };

  const handleFamilyClick = (familyId: string) => {
    // Open the family main page logic
    onTabChange(`family-${familyId}`);
    setExpandedFamilies(prev => ({
      ...prev,
      [familyId]: true // Ensure it opens when clicking the family
    }));
  };

  // Group active modules by family
  const activeFamilies = MODULE_FAMILIES.map(family => {
    const modulesInFamily = activeModules.filter(m => m.familyId === family.id);
    return { ...family, modules: modulesInFamily };
  }).filter(family => family.modules.length > 0);

  return (
    <>
      {/* Mobile backdrop (when sidebar is open via hamburger menu) */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen?.(false)}
      />

      {/* Desktop hover backdrop (blue-ish overlay over content) */}
      <div 
        className={cn(
          "fixed inset-0 bg-indigo-900/10 dark:bg-indigo-900/20 backdrop-blur-[1px] z-30 hidden md:block transition-opacity pointer-events-none duration-300",
          (isHovered && !isOpen) ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Spacer for Desktop to push content when pinned or maintain mini width */}
      <div className={cn(
        "hidden md:block shrink-0 transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-[72px]"
      )} />

      {/* Visual Sidebar */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out fixed md:absolute inset-y-0 left-0 z-40 group",
          // Mobile rules:
          !isOpen && "max-md:-translate-x-full",
          isOpen && "max-md:translate-x-0 w-64",
          // Desktop rules:
          "md:translate-x-0",
          isExpandedDesktop ? "md:w-64" : "md:w-[72px]",
          // Show focus effect on hover when not pinned
          (isHovered && !isOpen) && "md:shadow-2xl md:shadow-indigo-500/10 md:border-r-slate-300 dark:md:border-r-slate-700"
        )}
      >
        <div className="flex items-center justify-between px-6 pt-6 md:pt-0 mb-[-1.5rem] md:mb-0 md:hidden">
          <span className="font-bold tracking-tight text-slate-900 dark:text-white">Menu</span>
          <button onClick={() => setIsOpen?.(false)} className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-6 space-y-8 pb-6 flex flex-col w-64 pt-6">
          <div className="px-3 space-y-2">
            <h2 className={cn(
              "text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4 px-3 transition-opacity duration-300",
              isExpandedDesktop ? "opacity-100" : "opacity-0"
            )}>
               Système
            </h2>
            
            <button
              onClick={() => onTabChange('mindmap')}
              className={cn(
                "w-full flex items-center px-1 py-2 rounded-xl text-sm font-medium transition-colors mb-1",
                currentTab === 'mindmap' 
                  ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent"
              )}
              title={!isExpandedDesktop ? "Vue d'ensemble" : undefined}
            >
              <div className="w-10 shrink-0 flex items-center justify-center">
                <LayoutDashboard className={cn("w-5 h-5", currentTab === 'mindmap' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500")} />
              </div>
              <span className={cn("whitespace-nowrap transition-opacity duration-300 overflow-hidden", isExpandedDesktop ? "opacity-100" : "opacity-0 w-0")}>
                Vue d'ensemble
              </span>
            </button>
            
            <button
              onClick={() => onTabChange('store')}
              className={cn(
                "w-full flex items-center px-1 py-2 rounded-xl text-sm font-medium transition-colors mb-1",
                currentTab === 'store' 
                  ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent"
              )}
              title={!isExpandedDesktop ? "Module Store" : undefined}
            >
              <div className="w-10 shrink-0 flex items-center justify-center">
                <Store className={cn("w-5 h-5", currentTab === 'store' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500")} />
              </div>
              <span className={cn("whitespace-nowrap transition-opacity duration-300 overflow-hidden", isExpandedDesktop ? "opacity-100" : "opacity-0 w-0")}>
                Module Store
              </span>
            </button>

            <button
              onClick={() => onTabChange('archives')}
              className={cn(
                "w-full flex items-center px-1 py-2 rounded-xl text-sm font-medium transition-colors mb-1",
                currentTab === 'archives' 
                  ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent"
              )}
              title={!isExpandedDesktop ? "Archives" : undefined}
            >
              <div className="w-10 shrink-0 flex items-center justify-center">
                <Archive className={cn("w-5 h-5", currentTab === 'archives' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500")} />
              </div>
              <span className={cn("whitespace-nowrap transition-opacity duration-300 overflow-hidden", isExpandedDesktop ? "opacity-100" : "opacity-0 w-0")}>
                Archives
              </span>
            </button>

            <button
              onClick={() => onTabChange('settings')}
              className={cn(
                "w-full flex items-center px-1 py-2 rounded-xl text-sm font-medium transition-colors mb-1",
                currentTab === 'settings' 
                  ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent"
              )}
              title={!isExpandedDesktop ? "Paramètres" : undefined}
            >
              <div className="w-10 shrink-0 flex items-center justify-center">
                <Settings className={cn("w-5 h-5", currentTab === 'settings' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500")} />
              </div>
              <span className={cn("whitespace-nowrap transition-opacity duration-300 overflow-hidden", isExpandedDesktop ? "opacity-100" : "opacity-0 w-0")}>
                Paramètres
              </span>
            </button>

          </div>

          {activeFamilies.length > 0 && (
            <div className="px-3 xl:mt-4 space-y-4">
              {activeFamilies.map(family => {
                const isFamilyExpanded = expandedFamilies[family.id];
                const FamilyIcon = family.icon || LayoutDashboard;

                return (
                  <div key={`family-${family.id}`} className="space-y-1">
                    <button 
                      onClick={() => handleFamilyClick(family.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors",
                        isExpandedDesktop ? "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50" : "justify-center"
                      )}
                      title={!isExpandedDesktop ? family.name : undefined}
                    >
                      <div className="flex items-center gap-0 w-full">
                        {!isExpandedDesktop ? (
                          <div className="w-10 shrink-0 flex items-center justify-center mx-auto">
                            <FamilyIcon className="w-4 h-4 text-slate-400" />
                          </div>
                        ) : (
                          <>
                            <span onClick={(e) => toggleFamily(family.id, e)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md shrink-0 mr-1 text-slate-400 dark:text-slate-500 cursor-pointer">
                               {isFamilyExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </span>
                            <span className="truncate flex-1 text-left">{family.name}</span>
                          </>
                        )}
                      </div>
                    </button>
                    
                    {/* Render children only if expanded and desktop is expanded */}
                    {(isFamilyExpanded && isExpandedDesktop) && (
                      <div className="space-y-1 pl-4 border-l border-slate-100 dark:border-slate-800 ml-4 hidden md:block">
                        {family.modules.map(module => {
                          const Icon = module.icon;
                          const isActiveModule = currentTab === module.id;
                          return (
                            <button 
                              key={`nav-${module.id}`}
                              onClick={() => onTabChange(module.id)}
                              className={cn(
                                "w-full flex items-center px-2 py-1.5 rounded-lg text-sm transition-colors relative group",
                                isActiveModule
                                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                              )}
                            >
                              {isActiveModule && (
                                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-0.5 h-full bg-indigo-600 rounded-r-full" />
                              )}
                              <Icon className={cn("w-3.5 h-3.5 mr-2 shrink-0 transition-colors", isActiveModule ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600")} />
                              <span className="truncate whitespace-nowrap text-[13px]">{module.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Mobile/Collapsed specific rendering overlay */}
                    {!isExpandedDesktop && (
                       <div className="w-10 mx-auto px-1 flex flex-col items-center gap-1 opacity-50 mt-2">
                           <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                           <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </nav>
        <div className="px-3 pb-4 shrink-0">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center px-1 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent"
            title={!isExpandedDesktop ? "Déconnexion" : undefined}
          >
            <div className="w-10 shrink-0 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span className={cn("whitespace-nowrap transition-opacity duration-300 overflow-hidden", isExpandedDesktop ? "opacity-100" : "opacity-0 w-0")}>
              Déconnexion
            </span>
          </button>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900">Se déconnecter ?</h3>
            <p className="mt-2 text-sm text-slate-500">Vous retournerez à la page de connexion.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">
                Annuler
              </button>
              <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
