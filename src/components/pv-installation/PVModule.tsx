import React, { useState } from 'react';
import { InstallationPV } from './types';
import { mockPVs } from './mockData';
import { PVList } from './PVList';
import { PVAddModal } from './PVAddModal';
import { PVDetails } from './PVDetails';
import { motion, AnimatePresence } from 'motion/react';

export function PVModule() {
  const [pvs, setPvs] = useState<InstallationPV[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sit-erp-installation-pvs') || '[]');
      return [...saved, ...mockPVs.filter((mock) => !saved.some((pv: InstallationPV) => pv.id === mock.id))];
    } catch {
      return mockPVs;
    }
  });
  const [selectedPV, setSelectedPV] = useState<InstallationPV | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSavePV = (pv: InstallationPV, isDraft?: boolean) => {
    const updated = [pv, ...pvs.filter((existing) => existing.id !== pv.id)];
    setPvs(updated);
    localStorage.setItem('sit-erp-installation-pvs', JSON.stringify(updated));
    setIsAddModalOpen(false);
    setSelectedPV(null);
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedPV ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col relative"
          >
             <PVDetails 
               pv={selectedPV}
               onBack={() => setSelectedPV(null)}
               onUpdate={(updatedValue) => handleSavePV(updatedValue)}
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
            <PVList 
              pvs={pvs}
              onSelectPV={setSelectedPV}
              onAddClick={() => setIsAddModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <PVAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSavePV}
      />
    </div>
  );
}
