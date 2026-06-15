import React, { useState } from 'react';
import { Besoin } from './types';
import { MOCK_BESOINS } from './mockData';
import { BesoinsList } from './BesoinsList';
import { BesoinDetails } from './BesoinDetails';
import { BesoinFormModal } from './BesoinFormModal';
import { AnimatePresence, motion } from 'motion/react';
import { useApi } from '../../hooks/useApi';

export function BesoinsModule() {
  const { data: apiBesoins, refetch } = useApi<Besoin[]>('/api/project-needs', []);
  const [besoins, setBesoins] = useState<Besoin[]>(MOCK_BESOINS);
  const [selectedBesoin, setSelectedBesoin] = useState<Besoin | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBesoin, setEditingBesoin] = useState<Besoin | null>(null);

  React.useEffect(() => {
    if (apiBesoins.length > 0) setBesoins(apiBesoins);
  }, [apiBesoins]);

  const handleSelectBesoin = (besoin: Besoin) => {
    setSelectedBesoin(besoin);
  };

  const handleBackToList = () => {
    setSelectedBesoin(null);
  };

  const handleAddBesoin = () => {
    setEditingBesoin(null);
    setIsFormModalOpen(true);
  };

  const handleEditBesoin = (besoin: Besoin) => {
    setEditingBesoin(besoin);
    setIsFormModalOpen(true);
  };

  const handleSaveBesoin = (savedBesoin: Besoin) => {
    refetch();
    if (editingBesoin) {
      setBesoins(prev => prev.map(b => b.id === savedBesoin.id ? savedBesoin : b));
      if (selectedBesoin?.id === savedBesoin.id) {
        setSelectedBesoin(savedBesoin);
      }
    } else {
      setBesoins(prev => [savedBesoin, ...prev]);
    }
  };

  const handleUpdateBesoin = (updatedBesoin: Besoin) => {
    setBesoins(prev => prev.map(b => b.id === updatedBesoin.id ? updatedBesoin : b));
    if (selectedBesoin?.id === updatedBesoin.id) {
      setSelectedBesoin(updatedBesoin);
    }
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedBesoin ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-0 z-50 flex flex-col bg-white dark:bg-slate-900"
          >
            <BesoinDetails 
              besoin={selectedBesoin} 
              onBack={handleBackToList} 
              onEdit={() => handleEditBesoin(selectedBesoin)}
              onUpdate={handleUpdateBesoin}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex-1 w-full flex flex-col min-h-0"
          >
            <BesoinsList 
              allBesoins={besoins} 
              onSelectBesoin={handleSelectBesoin} 
              onAddClick={handleAddBesoin}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <BesoinFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveBesoin}
        initialData={editingBesoin}
      />
    </div>
  );
}
