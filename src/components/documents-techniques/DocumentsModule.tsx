import React from 'react';
import { DocumentsList } from './DocumentsList';
import { AnimatePresence, motion } from 'motion/react';

export function DocumentsModule() {
  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key="list"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 w-full flex flex-col min-h-0"
        >
          <DocumentsList />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
