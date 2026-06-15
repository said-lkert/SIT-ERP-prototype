import React, { useState } from 'react';
import { CommandeFournisseur } from './types';
import { CommandesFournisseurList } from './CommandesFournisseurList';
import { CommandeFournisseurDetails } from './CommandeFournisseurDetails';
import { CommandeFournisseurAddModal } from './CommandeFournisseurAddModal';
import { MOCK_COMMANDES_FOURNISSEUR } from './mockData';
import { AnimatePresence, motion } from 'motion/react';

import { useApi } from '../../hooks/useApi';

export function CommandesFournisseurModule() {
  const { data: commandes, loading, refetch } = useApi<CommandeFournisseur[]>('/api/supplier-orders', MOCK_COMMANDES_FOURNISSEUR);
  const [selectedCommande, setSelectedCommande] = useState<CommandeFournisseur | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedCommande ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col relative"
          >
            <CommandeFournisseurDetails 
              commande={selectedCommande} 
              onBack={() => setSelectedCommande(null)} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full flex flex-col min-h-0"
          >
            <CommandesFournisseurList 
              commandes={commandes} 
              onSelectCommande={setSelectedCommande} 
              onAddClick={() => setIsAddModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <CommandeFournisseurAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(newCmd) => {
          refetch();
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}
