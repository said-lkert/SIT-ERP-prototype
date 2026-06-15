import React, { useState } from 'react';
import { StockOutbound } from './types';
import { OutboundsList } from './OutboundsList';
import { OutboundDetails } from './OutboundDetails';
import { OutboundFormModal } from './OutboundFormModal';
import { AnimatePresence, motion } from 'motion/react';
import { useApi } from '../../../hooks/useApi';

export function OutboundsModule() {
  const { data: outbounds, loading, refetch, mutate } = useApi<StockOutbound[]>('/api/outbounds', []);
  const [selectedOutbound, setSelectedOutbound] = useState<StockOutbound | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleNewOutbound = () => {
    setIsFormOpen(true);
  };

  const handleSelectOutbound = (outbound: StockOutbound) => {
    setSelectedOutbound(outbound);
  };

  const handleSubmitOutbound = (createdOutbound?: StockOutbound) => {
    if (createdOutbound?.id) {
      mutate([
        createdOutbound,
        ...outbounds.filter((outbound) => outbound.id !== createdOutbound.id)
      ]);
    }
    setIsFormOpen(false);
    refetch();
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedOutbound ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col relative"
          >
            <OutboundDetails 
              outbound={selectedOutbound} 
              onBack={() => setSelectedOutbound(null)} 
              onEdit={(out) => {
                setSelectedOutbound(null);
                setIsFormOpen(true);
              }}
              onChanged={() => {
                setSelectedOutbound(null);
                refetch();
              }}
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
            <OutboundsList 
              outbounds={outbounds} 
              onSelectOutbound={handleSelectOutbound}
              onNewOutbound={handleNewOutbound}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <OutboundFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSubmitOutbound} 
      />
    </div>
  );
}
