import React, { useState } from 'react';
import { SerialNumbersDashboard } from './SerialNumbersDashboard';
import { SerialNumbersFiche } from './SerialNumbersFiche';
import { SerialNumber } from './types';
import { mockSerialNumbers } from './mockData';
import { AnimatePresence, motion } from 'motion/react';
import { useApi } from '../../hooks/useApi';

export function SerialNumbersModule() {
  const [selectedSerial, setSelectedSerial] = useState<SerialNumber | null>(null);
  const { data: receivedSerialNumbers } = useApi<SerialNumber[]>('/api/serial-numbers', []);
  const serialNumbers = [
    ...receivedSerialNumbers,
    ...mockSerialNumbers.filter((mock) => !receivedSerialNumbers.some((received) => received.serial === mock.serial))
  ];

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedSerial ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col relative"
          >
            <SerialNumbersFiche serial={selectedSerial} onBack={() => setSelectedSerial(null)} />
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
            <SerialNumbersDashboard data={serialNumbers} onSelectSerial={setSelectedSerial} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
