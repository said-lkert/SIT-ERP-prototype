import React, { useState } from 'react';
import { ClientLivraison } from './types';
import { mockLivraisons } from './mockData';
import { LivraisonsList } from './LivraisonsList';
import { LivraisonAddModal } from './LivraisonAddModal';
import { LivraisonDetails } from './LivraisonDetails';
import { motion, AnimatePresence } from 'motion/react';

export function LivraisonsModule() {
  const [livraisons, setLivraisons] = useState<ClientLivraison[]>(mockLivraisons);
  const [selectedLivraison, setSelectedLivraison] = useState<ClientLivraison | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSaveLivraison = (newLivraison: ClientLivraison) => {
    setLivraisons([newLivraison, ...livraisons]);
    setIsAddModalOpen(false);
  };

  const handleUpdateLivraison = (updated: ClientLivraison) => {
    setLivraisons(livraisons.map(l => l.id === updated.id ? updated : l));
    if (selectedLivraison?.id === updated.id) {
       setSelectedLivraison(updated);
    }
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedLivraison ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col relative"
          >
            <LivraisonDetails 
               livraison={selectedLivraison} 
               onBack={() => setSelectedLivraison(null)} 
               onUpdate={handleUpdateLivraison}
               onEdit={() => {}}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 w-full h-full flex flex-col"
          >
            <LivraisonsList 
              livraisons={livraisons}
              onSelectLivraison={setSelectedLivraison}
              onAddClick={() => setIsAddModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <LivraisonAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveLivraison}
      />
    </div>
  );
}

