import React, { useState } from 'react';
import { StockReservation } from './types';
import { ReservationsList } from './ReservationsList';
import { ReservationDetails } from './ReservationDetails';
import { ReservationAddModal } from './ReservationAddModal';
import { AnimatePresence, motion } from 'motion/react';

import { useApi } from '../../hooks/useApi';

export function ReservationsStockModule() {
  const { data: reservations, refetch, mutate } = useApi<StockReservation[]>('/api/reservations', []);
  const [selectedReservation, setSelectedReservation] = useState<StockReservation | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddReservation = (newRes: StockReservation) => {
    mutate([newRes, ...reservations.filter((reservation) => reservation.id !== newRes.id)]);
    setIsAddModalOpen(false);
    refetch();
  };

  const handleUpdateReservation = (updatedRes: StockReservation) => {
    refetch();
    setSelectedReservation(updatedRes);
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedReservation ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col relative"
          >
            <ReservationDetails reservation={selectedReservation} onBack={() => setSelectedReservation(null)} onUpdate={handleUpdateReservation} />
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
            <ReservationsList 
              reservations={reservations} 
              onSelectReservation={setSelectedReservation} 
              onAddClick={() => setIsAddModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ReservationAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddReservation}
      />
    </div>
  );
}
