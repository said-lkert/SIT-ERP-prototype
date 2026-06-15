import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  PackageSearch, 
  ArrowLeftRight, 
  Map, 
  BellRing, 
  ClipboardCheck, 
  CircleDollarSign, 
  Truck, 
  LineChart,
  Store,
  LayoutGrid
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InventoryDashboard } from './InventoryDashboard';
import { InventoryCatalog } from './InventoryCatalog';
import { InventoryMovements } from './InventoryMovements';
import { InventoryWarehouses } from './InventoryWarehouses';
import { InventoryAlerts } from './InventoryAlerts';
import { InventoryCounting } from './InventoryCounting';
import { InventoryValuation } from './InventoryValuation';
import { InventoryReplenishment, InventoryAnalytics } from './InventoryAnalyticsAndMore';
import { InventorySuppliers } from './InventorySuppliers';

export type InventoryTab = 'dashboard' | 'catalog' | 'movements' | 'warehouses' | 'alerts' | 'counting' | 'valuation' | 'replenishment' | 'analytics' | 'suppliers';

export function InventoryModule() {
  const [activeTab, setActiveTab] = useState<InventoryTab>('catalog');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'catalog', label: 'Produits', icon: PackageSearch },
    { id: 'movements', label: 'Mouvements', icon: ArrowLeftRight },
    { id: 'warehouses', label: 'Entrepôts', icon: Map },
    { id: 'suppliers', label: 'Fournisseurs', icon: Store },
    { id: 'alerts', label: 'Alertes', icon: BellRing },
    { id: 'counting', label: 'Inventaire', icon: ClipboardCheck },
    { id: 'valuation', label: 'Valorisation', icon: CircleDollarSign },
    { id: 'replenishment', label: 'Réassort', icon: Truck },
    { id: 'analytics', label: 'Analyses', icon: LineChart }
  ];

  const handleTabChange = (tabId: InventoryTab) => {
    setActiveTab(tabId);
    if (tabId !== 'catalog') {
      setSelectedProductId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100/50 dark:bg-slate-950/50 overflow-hidden w-full relative transition-colors font-sans">
      
      {/* Header Bezel Area */}
      <div className="px-4 md:px-6 lg:px-10 pt-8 pb-0 flex flex-col shrink-0 relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center shadow-md">
                <PackageSearch className="w-7 h-7 text-white dark:text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Gestion de Stock</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Gérez en temps réel vos produits, mouvements et entrepôts.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
                <BellRing className="w-4 h-4" />
                <span className="hidden sm:inline">Alertes</span>
                <span className="flex items-center justify-center min-w-5 h-5 px-1 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-full ml-1">3</span>
             </button>
             <button className="h-10 px-5 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-sm shadow-indigo-600/20 active:scale-95 flex items-center gap-2">
                + <span className="hidden sm:inline">Créer</span>
             </button>
          </div>
        </div>

        {/* Dynamic Bubble / Pill Tabs connecting to the Workspace */}
        <div className="flex flex-col relative w-full overflow-visible">
            <div className="flex items-end gap-1 overflow-x-auto hide-scrollbar z-20 pb-0">
               {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                     <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id as InventoryTab)}
                        className={cn(
                           "relative px-5 py-3 text-sm font-bold transition-all duration-300 flex items-center gap-2 outline-none rounded-t-2xl min-w-max select-none pb-4 -mb-1",
                           isActive 
                             ? "text-indigo-700 dark:text-indigo-400 bg-white dark:bg-[#111318]" 
                             : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 pb-3 mb-0"
                        )}
                        style={isActive ? {
                            boxShadow: '0 -4px 12px -6px rgba(0,0,0,0.05)'
                        } : {}}
                     >
                        <tab.icon className={cn("w-4 h-4", isActive ? "text-indigo-600 dark:text-indigo-400" : "opacity-70 group-hover:text-slate-600")} strokeWidth={isActive ? 2.5 : 2} />
                        {tab.label}
                        
                        {isActive && (
                            <motion.div 
                                layoutId="active-tab-pill-highlight" 
                                className="absolute inset-x-0 -bottom-1 h-2 bg-white dark:bg-[#111318] z-30" 
                            />
                        )}
                        {/* Fillet Left */}
                        {isActive && (
                            <svg className="absolute -left-3 bottom-1 w-3 h-3 text-white dark:text-[#111318] z-30" aria-hidden="true" viewBox="0 0 12 12">
                                <path d="M 0 12 C 6.627 12 12 6.627 12 0 L 12 12 Z" fill="currentColor" />
                            </svg>
                        )}
                        {/* Fillet Right */}
                        {isActive && (
                            <svg className="absolute -right-3 bottom-1 w-3 h-3 text-white dark:text-[#111318] z-30" aria-hidden="true" viewBox="0 0 12 12">
                                <path d="M 12 12 C 5.373 12 0 6.627 0 0 L 0 12 Z" fill="currentColor" />
                            </svg>
                        )}
                     </button>
                  )
               })}
            </div>
        </div>
      </div>

      {/* Main Workspace Area (Arc Browser / Glassmorphism aesthetic) */}
      <div className="flex-1 px-4 md:px-6 lg:px-10 pb-6 overflow-hidden relative z-10 flex flex-col">
         <div className="flex-1 bg-white dark:bg-[#111318] rounded-[2rem] rounded-tl-none shadow-xl shadow-slate-200/40 dark:shadow-black/40 overflow-hidden relative flex flex-col items-stretch">
           <div className="flex-1 overflow-y-auto w-full relative z-0">
             {activeTab === 'dashboard' && <InventoryDashboard onNavigate={handleTabChange} />}
             {activeTab === 'catalog' && <InventoryCatalog selectedProductId={selectedProductId} onSelectProduct={setSelectedProductId} />}
             {activeTab === 'movements' && <InventoryMovements />}
             {activeTab === 'warehouses' && <InventoryWarehouses />}
             {activeTab === 'suppliers' && <InventorySuppliers />}
             {activeTab === 'alerts' && <InventoryAlerts />}
             {activeTab === 'counting' && <InventoryCounting />}
             {activeTab === 'valuation' && <InventoryValuation />}
             {activeTab === 'replenishment' && <InventoryReplenishment />}
             {activeTab === 'analytics' && <InventoryAnalytics />}
           </div>
         </div>
      </div>
    </div>
  );
}
