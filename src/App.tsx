import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MindMap } from './components/MindMap';
import { ModuleStore } from './components/ModuleStore';
import { CRMModule } from './components/crm/CRMModule';
import { InventoryModule } from './components/inventory/InventoryModule';
import { InterventionForm } from './components/intervention/InterventionForm';
import { SettingsModule } from './components/settings/SettingsModule';
import { ArchivesModule } from './components/archives/ArchivesModule';
import { ReportModule } from './components/ReportModule';
import { ServicesModule } from './components/services/ServicesModule';
import { ProductsModule } from './components/produits/ProductsModule';
import { FournisseursModule } from './components/fournisseurs/FournisseursModule';
import { StockModule } from './components/stock/StockModule';
import { SerialNumbersModule } from './components/numeros-serie/SerialNumbersModule';
import { InstalledEquipmentsModule } from './components/equipements-installes/InstalledEquipmentsModule';
import { DocumentsModule } from './components/documents-techniques/DocumentsModule';
import { ClientsModule } from './components/clients/ClientsModule';
import { LocationsModule } from './components/stock/locations/LocationsModule';
import { MovementsModule } from './components/stock/movements/MovementsModule';
import { ReceiptsModule } from './components/stock/receipts/ReceiptsModule';
import { OutboundsModule } from './components/stock/outbounds/OutboundsModule';
import { ReturnsModule } from './components/stock/returns/ReturnsModule';
import { CommandesFournisseurModule } from './components/commandes-fournisseur/CommandesFournisseurModule';
import { ProjetsClientsModule } from './components/projets-clients/ProjetsClientsModule';
import { BesoinsModule } from './components/besoins/BesoinsModule';
import { ReservationsStockModule } from './components/reservations-stock/ReservationsStockModule';
import { LivraisonsModule } from './components/livraisons-client/LivraisonsModule';
import { RetoursClientModule } from './components/retours-client/RetoursClientModule';
import { PVModule } from './components/pv-installation/PVModule';
import { AppTab } from './types';
import { cn } from './lib/utils';
import { ALL_MODULES, MODULE_FAMILIES } from './data/modules';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useModules } from './contexts/ModuleContext';

export default function App({ onLogout }: { onLogout?: () => void }) {
  const { activeModuleIds, toggleModule, isModuleEnabled } = useModules();
  
  const [currentTab, setCurrentTab] = useState<AppTab>('mindmap');
  
  const [showDeactivatedToast, setShowDeactivatedToast] = useState(false);
  const [deactivatedModuleName, setDeactivatedModuleName] = useState('');

  useEffect(() => {
    const locationPath = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Intercept if they navigate to /services or /stock?tab=services while services is disabled
    const hasServicesTab = searchParams.get('tab') === 'services';
    const isDirectServices = locationPath === '/services' || locationPath.endsWith('/services') || hasServicesTab;

    if ((isDirectServices || currentTab === 'services') && !isModuleEnabled('services')) {
      const referentielModules = ALL_MODULES.filter(m => m.familyId === 'referentiel' && m.id !== 'services');
      const firstActive = referentielModules.find(m => activeModuleIds.includes(m.id));
      const targetTab = firstActive ? firstActive.id : 'store';
      
      setCurrentTab(targetTab as AppTab);
      try {
        if (hasServicesTab) {
          searchParams.delete('tab');
          const newSearch = searchParams.toString();
          window.history.replaceState({}, '', `${locationPath}${newSearch ? '?' + newSearch : ''}`);
        } else if (locationPath.endsWith('/services')) {
          window.history.replaceState({}, '', '/');
        }
      } catch (err) {
        console.error(err);
      }
      
      setDeactivatedModuleName('Services');
      setShowDeactivatedToast(true);
      const timer = setTimeout(() => setShowDeactivatedToast(false), 5000);
      return () => clearTimeout(timer);
    }

    // Intercept if they navigate to /numeros-serie or /stock?tab=numeros-serie while numeros-serie is disabled
    const hasNSTab = searchParams.get('tab') === 'numeros-serie';
    const isDirectNS = locationPath === '/numeros-serie' || locationPath.endsWith('/numeros-serie') || hasNSTab;

    if ((isDirectNS || currentTab === 'numeros-serie') && !isModuleEnabled('numeros-serie')) {
      const stockModules = ALL_MODULES.filter(m => m.familyId === 'stock-logistique' && m.id !== 'numeros-serie');
      const firstActive = stockModules.find(m => activeModuleIds.includes(m.id));
      const targetTab = firstActive ? firstActive.id : 'store';
      
      setCurrentTab(targetTab as AppTab);
      try {
        if (hasNSTab) {
          searchParams.delete('tab');
          const newSearch = searchParams.toString();
          window.history.replaceState({}, '', `${locationPath}${newSearch ? '?' + newSearch : ''}`);
        } else if (locationPath.endsWith('/numeros-serie')) {
          window.history.replaceState({}, '', '/');
        }
      } catch (err) {
        console.error(err);
      }
      
      setDeactivatedModuleName('Numéros de série');
      setShowDeactivatedToast(true);
      const timer = setTimeout(() => setShowDeactivatedToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentTab, activeModuleIds, isModuleEnabled]);

  const [activeModulePerFamily, setActiveModulePerFamily] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('erp_activeModulePerFamily');
    return saved ? JSON.parse(saved) : {};
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const activeModules = ALL_MODULES.filter(m => activeModuleIds.includes(m.id));

  useEffect(() => {
    localStorage.setItem('erp_currentTab', currentTab);
  }, [currentTab]);

  useEffect(() => {
    localStorage.setItem('erp_activeModulePerFamily', JSON.stringify(activeModulePerFamily));
  }, [activeModulePerFamily]);

  // Track the last active module per family
  useEffect(() => {
    const module = ALL_MODULES.find(m => m.id === currentTab);
    if (module && module.familyId) {
      setActiveModulePerFamily(prev => {
         if (prev[module.familyId as string] === module.id) return prev;
         return { ...prev, [module.familyId as string]: module.id };
      });
    }
  }, [currentTab]);

  // Handle clicking on a family in the sidebar -> redirect to the last active module of that family
  useEffect(() => {
    if (currentTab.startsWith('family-')) {
      const familyId = currentTab.replace('family-', '');
      const familyModules = activeModules.filter(m => m.familyId === familyId);
      
      let targetModuleId = activeModulePerFamily[familyId];
      if (!targetModuleId || !familyModules.find(m => m.id === targetModuleId)) {
         targetModuleId = familyModules.length > 0 ? familyModules[0].id : '';
      }
      
      if (targetModuleId && targetModuleId !== currentTab) {
         setCurrentTab(targetModuleId);
      }
    }
  }, [currentTab, activeModules, activeModulePerFamily]);

  // Handle module deactivation: switch to another module or mindmap
  useEffect(() => {
    if (!['mindmap', 'store', 'settings', 'report'].includes(currentTab) && !currentTab.startsWith("family-")) {
      if (!isModuleEnabled(currentTab)) {
        const module = ALL_MODULES.find(m => m.id === currentTab);
        if (module && module.familyId) {
            const familyModules = activeModules.filter(m => m.familyId === module.familyId);
            if (familyModules.length > 0) {
               setCurrentTab(familyModules[0].id);
            } else {
               setCurrentTab('mindmap');
            }
        } else {
           setCurrentTab('mindmap');
        }
      }
    }
  }, [activeModuleIds, currentTab, activeModules, isModuleEnabled]);

  const renderStandaloneTab = () => {
    switch (currentTab) {
      case 'mindmap': return <MindMap activeModuleIds={activeModuleIds} onTabChange={setCurrentTab} />;
      case 'store': return <ModuleStore activeModuleIds={activeModuleIds} toggleModule={toggleModule} />;
      case 'settings': return <SettingsModule />;
      case 'report': return <ReportModule />;
      default: return null;
    }
  };

  const renderModuleContent = (moduleId: string) => {
    switch (moduleId) {
      case 'fournisseurs': return <FournisseursModule />;
      case 'produits': return <ProductsModule />;
      case 'services': return <ServicesModule />;
      case 'commandes-fournisseur': return <CommandesFournisseurModule />;
      case 'stock-disponibilite': return <StockModule />;
      case 'numeros-serie': return <SerialNumbersModule />;
      case 'equipements-installes': return <InstalledEquipmentsModule />;
      case 'documents-techniques': return <DocumentsModule />;
      case 'clients': return <ClientsModule />;
      case 'inventory': return <InventoryModule />;
      case 'emplacements': return <LocationsModule />;
      case 'mouvements-stock': return <MovementsModule />;
      case 'receptions-fournisseur': return <ReceiptsModule />;
      case 'sorties-stock': return <OutboundsModule />;
      case 'retours-fournisseur': return <ReturnsModule />;
      case 'interventions-sav': return <InterventionForm />;
      case 'projets-clients': return <ProjetsClientsModule />;
      case 'besoins-projets': return <BesoinsModule />;
      case 'reservations-stock': return <ReservationsStockModule />;
      case 'livraisons-client': return <LivraisonsModule />;
      case 'pv-installation': return <PVModule />;
      case 'retours-client': return <RetoursClientModule />;
      case 'archives': return <ArchivesModule />;
      default: return (
         <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 p-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <X className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-medium text-lg">Module "{ALL_MODULES.find(m => m.id === moduleId)?.name || moduleId}" en construction.</p>
            <p className="text-sm mt-2 max-w-md text-center">Ce module a été activé mais son interface n'est pas encore implémentée dans cette démo.</p>
         </div>
      );
    }
  };

  let currentFamilyId: string | null = null;
  if (currentTab.startsWith('family-')) {
    currentFamilyId = currentTab.replace('family-', '');
  } else {
    const module = ALL_MODULES.find(m => m.id === currentTab);
    if (module && module.familyId) {
      currentFamilyId = module.familyId;
    }
  }

  return (
    <div className="w-full h-screen bg-slate-50 dark:bg-slate-900 font-sans flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header spanning top */}
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Fixed Sidebar */}
        <Sidebar 
          currentTab={currentTab} 
          onTabChange={(tab) => { 
            setCurrentTab(tab); 
            if (window.innerWidth < 768) setIsSidebarOpen(false); 
          }} 
          activeModuleIds={activeModuleIds}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onLogout={onLogout}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {currentFamilyId ? (
            (() => {
               const family = MODULE_FAMILIES.find(f => f.id === currentFamilyId);
               if (!family) return null;

               const familyModules = activeModules.filter(m => m.familyId === currentFamilyId);
               
               const isStuckOnFamily = currentTab.startsWith('family-');
               const selectedModuleId = isStuckOnFamily ? null : currentTab;

               return (
                 <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden relative z-0">
                   {/* Family Header */}
                   <div className="px-5 py-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0 z-20 shadow-sm shadow-slate-200/20 dark:shadow-black/20">
                     <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                       {family.icon && <family.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                       {family.name}
                     </h1>
                   </div>

                   {/* Family Tabs */}
                   {familyModules.length > 0 && (
                     <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar z-20 px-3 pt-2.5 bg-slate-100/60 dark:bg-slate-950/60 shrink-0 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
                       <AnimatePresence mode="popLayout">
                         {familyModules.map(module => {
                           const isActive = selectedModuleId === module.id;
                           const Icon = module.icon;
                           return (
                             <motion.button
                               key={`maintab-${module.id}`}
                               layout
                               initial={{ opacity: 0, y: 10, scale: 0.95 }}
                               animate={{ opacity: 1, y: 0, scale: 1 }}
                               exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                               onClick={() => setCurrentTab(module.id)}
                               className={cn(
                                   "relative px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 outline-none rounded-t-xl group shrink-0",
                                   isActive 
                                     ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 border-x border-t border-slate-200 dark:border-slate-800 shadow-sm" 
                                     : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border-x border-t border-transparent"
                               )}
                             >
                               <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "opacity-70 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                               <span className="whitespace-nowrap select-none">{module.name}</span>

                               {isActive && (
                                   <div className="absolute inset-x-0 -bottom-[1px] h-0.5 bg-white dark:bg-slate-900 z-10" />
                               )}
                             </motion.button>
                           );
                         })}
                       </AnimatePresence>
                     </div>
                   )}

                   {/* Module Content */}
                   <main className={cn(
                     "flex-1 overflow-y-auto relative w-full z-10",
                     (!selectedModuleId) ? "p-8" : (['clients', 'interventions-sav', 'fournisseurs', 'produits', 'services', 'stock-disponibilite', 'emplacements', 'mouvements-stock', 'receptions-fournisseur', 'sorties-stock', 'retours-fournisseur', 'numeros-serie', 'equipements-installes', 'documents-techniques', 'commandes-fournisseur', 'inventory', 'projets-clients', 'besoins-projets', 'reservations-stock'].includes(selectedModuleId) ? "p-0" : "p-4 md:p-8")
                   )}>
                     {selectedModuleId ? renderModuleContent(selectedModuleId) : (
                       <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                           <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                             {family.icon && <family.icon className="w-8 h-8 opacity-50" />}
                           </div>
                           <p className="font-medium text-lg">Aucun module actif.</p>
                           <p className="text-sm mt-2 max-w-sm text-center">Activez des modules de la famille "{family.name}" dans le Module Store pour commencer.</p>
                       </div>
                     )}
                   </main>
                 </div>
               );
            })()
          ) : (
            <main className={cn(
              "flex-1 overflow-y-auto relative w-full z-10 bg-slate-50 dark:bg-slate-900", 
              ['settings', 'archives', 'report'].includes(currentTab) ? 'p-0' : 'p-4 md:p-8'
            )}>
              {renderStandaloneTab()}
            </main>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {showDeactivatedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-20 right-6 z-[9999] bg-slate-900 text-slate-100 border border-slate-800 dark:bg-white dark:text-slate-950 dark:border-slate-200 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 font-medium text-sm"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Le module {deactivatedModuleName} est désactivé.</span>
            <button 
              onClick={() => setShowDeactivatedToast(false)}
              className="ml-2 hover:opacity-75 transition-opacity text-slate-400 dark:text-slate-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
