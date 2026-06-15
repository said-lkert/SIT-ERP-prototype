import React, { useState } from 'react';
import { StockMovement } from './types';
import { MovementsList } from './MovementsList';
import { MovementDetails } from './MovementDetails';
import { MOCK_MOVEMENTS } from './mockData';
import { AnimatePresence, motion } from 'motion/react';

import { useApi } from '../../../hooks/useApi';

export function MovementsModule() {
  const { data: movements, loading } = useApi<StockMovement[]>('/api/movements', MOCK_MOVEMENTS);
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedMovement ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col relative"
          >
            <MovementDetails 
              movement={selectedMovement} 
              onBack={() => setSelectedMovement(null)} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full flex flex-col min-h-0"
          >
            <MovementsList 
              movements={movements} 
              onSelectMovement={setSelectedMovement} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
