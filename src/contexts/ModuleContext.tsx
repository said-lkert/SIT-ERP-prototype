import React, { createContext, useContext, useState, useEffect } from 'react';
import { ALL_MODULES } from '../data/modules';

interface ModuleContextType {
  activeModuleIds: string[];
  toggleModule: (id: string) => void;
  isModuleEnabled: (id: string) => boolean;
}

const ModuleContext = createContext<ModuleContextType>({
  activeModuleIds: [],
  toggleModule: () => {},
  isModuleEnabled: () => false,
});

export const useModules = () => useContext(ModuleContext);

export const ModuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModuleIds, setActiveModuleIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('erp_activeModules');
    return saved ? JSON.parse(saved) : ['fournisseurs', 'produits', 'services', 'stock-disponibilite', 'emplacements', 'receptions-fournisseur', 'sorties-stock', 'retours-fournisseur', 'utilisateurs', 'projets-clients', 'besoins-projets', 'reservations-stock', 'livraisons-client', 'pv-installation', 'numeros-serie'];
  });

  useEffect(() => {
    localStorage.setItem('erp_activeModules', JSON.stringify(activeModuleIds));
  }, [activeModuleIds]);

  const toggleModule = (id: string) => {
    setActiveModuleIds(prev => 
      prev.includes(id) 
        ? prev.filter(m => m !== id)
        : [...prev, id]
    );
  };

  const isModuleEnabled = (id: string) => activeModuleIds.includes(id);

  return (
    <ModuleContext.Provider value={{ activeModuleIds, toggleModule, isModuleEnabled }}>
      {children}
    </ModuleContext.Provider>
  );
};
