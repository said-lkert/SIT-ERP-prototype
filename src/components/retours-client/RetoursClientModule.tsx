import React, { useState } from 'react';
import { ClientReturn } from './types';
import { RetoursClientList } from './RetoursClientList';
import { MOCK_CLIENT_RETURNS } from './mockData';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { RetoursClientAddModal } from './RetoursClientAddModal';
import { RetoursClientDetails } from './RetoursClientDetails';

export function RetoursClientModule() {
  const [returns, setReturns] = useState<ClientReturn[]>(MOCK_CLIENT_RETURNS);
  const [selectedReturn, setSelectedReturn] = useState<ClientReturn | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddReturn = (newReturn: ClientReturn) => {
    setReturns([newReturn, ...returns]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedReturn ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm relative"
          >
            <RetoursClientDetails 
              returnItem={selectedReturn} 
              onBack={() => setSelectedReturn(null)} 
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
            <RetoursClientList 
              returns={returns} 
              onSelectReturn={setSelectedReturn} 
              onAddClick={() => setIsAddModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <RetoursClientAddModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddReturn}
      />
    </div>
  );
}
