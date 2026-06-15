import React, { useState } from 'react';
import { FournisseursList } from './FournisseursList';
import { FournisseurFiche } from './FournisseurFiche';
import { Fournisseur } from './types';
import { MOCK_FOURNISSEURS } from './mockData';
import { AnimatePresence, motion } from 'motion/react';
import { useApi } from '../../hooks/useApi';

export function FournisseursModule() {
  const { data: suppliers, loading, refetch } = useApi<Fournisseur[]>('/api/suppliers', MOCK_FOURNISSEURS);
  const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null);

  const handleFournisseurSelect = (f: Fournisseur) => {
    const current = suppliers.find(s => s.id === f.id) || f;
    setSelectedFournisseur(current);
  };

  const handleAddFournisseur = async (newF: Fournisseur) => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newF)
      });
      if (response.ok) {
        refetch();
      } else {
        console.error('Failed to add supplier');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedFournisseur ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col relative"
          >
            <FournisseurFiche fournisseur={selectedFournisseur} onBack={() => setSelectedFournisseur(null)} />
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
            <FournisseursList 
              suppliers={suppliers} 
              onFournisseurSelect={handleFournisseurSelect} 
              onAddFournisseur={handleAddFournisseur} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
