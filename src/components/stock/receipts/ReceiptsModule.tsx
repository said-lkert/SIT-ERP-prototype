import React, { useState } from 'react';
import { SupplierReceipt } from './types';
import { ReceiptsList } from './ReceiptsList';
import { ReceiptDetails } from './ReceiptDetails';
import { ReceiptFormModal } from './ReceiptFormModal';
import { MOCK_RECEIPTS } from './mockData';
import { AnimatePresence, motion } from 'motion/react';

import { useApi } from '../../../hooks/useApi';

export function ReceiptsModule() {
  const { data: receipts, loading, refetch } = useApi<SupplierReceipt[]>('/api/supplier-receipts', MOCK_RECEIPTS);
  const [selectedReceipt, setSelectedReceipt] = useState<SupplierReceipt | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleNewReceipt = () => {
    setIsFormOpen(true);
  };

  const handleSelectReceipt = (receipt: SupplierReceipt) => {
    setSelectedReceipt(receipt);
  };

  const handleSubmitReceipt = (data: any) => {
    refetch();
    setIsFormOpen(false);
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedReceipt ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col relative"
          >
            <ReceiptDetails 
              receipt={selectedReceipt} 
              onBack={() => setSelectedReceipt(null)} 
              onEdit={(rc) => {
                setSelectedReceipt(null);
                setIsFormOpen(true);
              }}
              onValidated={() => {
                setSelectedReceipt(null);
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
            <ReceiptsList 
              receipts={receipts} 
              onSelectReceipt={handleSelectReceipt}
              onNewReceipt={handleNewReceipt}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ReceiptFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSubmitReceipt} 
      />
    </div>
  );
}
