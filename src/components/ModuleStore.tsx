import { useState } from 'react';
import { ALL_MODULES, MODULE_FAMILIES } from '../data/modules';
import { cn } from '../lib/utils';
import { Check, Plus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useModules } from '../contexts/ModuleContext';

export function ModuleStore() {
  const { activeModuleIds, toggleModule } = useModules();
  const [moduleToDeactivate, setModuleToDeactivate] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    if (activeModuleIds.includes(id)) {
      if (id === 'services' || id === 'numeros-serie') {
        setModuleToDeactivate(id);
      } else {
        toggleModule(id);
      }
    } else {
      toggleModule(id);
    }
  };

  const confirmDeactivate = () => {
    if (moduleToDeactivate) {
      toggleModule(moduleToDeactivate);
      setModuleToDeactivate(null);
    }
  };

  return (
    <div className="w-full h-full max-w-6xl mx-auto flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Module Store</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Browse and activate the capabilities your enterprise needs. Build your bespoke ERP one module at a time.</p>
      </div>

      <div className="flex-1 space-y-12 pb-12">
        {MODULE_FAMILIES.map((family) => {
          const familyModules = ALL_MODULES.filter(m => m.familyId === family.id);
          
          if (familyModules.length === 0) return null;

          const FamilyIcon = family.icon;

          return (
            <section key={family.id} className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  {FamilyIcon && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FamilyIcon className="w-5 h-5" />
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {family.name}
                  </h2>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-3xl">
                  {family.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {familyModules.map(module => {
                  const isActive = activeModuleIds.includes(module.id);
                  const Icon = module.icon;

                  return (
                    <motion.div 
                      layout
                      key={module.id} 
                      className={cn(
                        "relative bg-white dark:bg-slate-900/50 p-6 rounded-2xl border transition-all duration-300 flex flex-col h-full",
                        isActive 
                          ? "border-indigo-300 dark:border-indigo-700/50 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)] ring-1 ring-indigo-100 dark:ring-indigo-900/40" 
                          : "border-slate-200 dark:border-slate-800 shadow-sm grayscale-[0.2] hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm",
                          isActive 
                            ? "bg-indigo-600 text-white" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex items-center gap-3">
                           {!isActive && module.id === 'services' && (
                             <span className="text-xs font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-1">Désactivé</span>
                           )}
                           <button
                             onClick={() => handleToggle(module.id)}
                             className={cn(
                               "relative overflow-hidden h-9 px-3 rounded-xl flex items-center justify-center border transition-all z-10 text-sm font-medium",
                               isActive 
                                 ? "bg-indigo-50 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-600 dark:hover:text-slate-300 group"
                                 : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600"
                             )}
                             title={isActive ? "Deactivate Module" : "Activate Module"}
                           >
                              {isActive ? "Désactiver" : "Activer"}
                           </button>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={cn("font-bold text-lg leading-tight mb-2 transition-colors", isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-800 dark:text-slate-200")}>
                          {module.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                          {module.description}
                        </p>
                      </div>

                      {isActive && (
                        <div className="absolute inset-0 rounded-2xl ring-2 ring-indigo-500/5 dark:ring-indigo-500/10 pointer-events-none"></div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <AnimatePresence>
        {moduleToDeactivate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setModuleToDeactivate(null)}
             />
             <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
             >
                <div className="p-6">
                   <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                       <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                     </div>
                     <div>
                       <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                         {moduleToDeactivate === 'services' 
                           ? "Désactiver le module Services ?" 
                           : "Désactiver le suivi par numéros de série ?"}
                       </h3>
                       <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                         {moduleToDeactivate === 'services' 
                           ? "Le module Services et ses intégrations seront masqués dans l'ensemble de l'ERP. Les données existantes seront conservées et redeviendront accessibles après réactivation." 
                           : "Le suivi individuel des équipements sera masqué dans l’ensemble de l’ERP. Les produits seront gérés uniquement par quantité. Les données existantes seront conservées et redeviendront accessibles après réactivation."}
                       </p>
                     </div>
                   </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                   <button
                     onClick={() => setModuleToDeactivate(null)}
                     className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                   >
                     Annuler
                   </button>
                   <button
                     onClick={confirmDeactivate}
                     className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
                   >
                     Désactiver
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
