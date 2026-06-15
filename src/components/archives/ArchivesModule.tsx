import React, { useState } from 'react';
import { ArchiveItem } from './types';
import { ArchivesList } from './ArchivesList';
import { ArchiveDetails } from './ArchiveDetails';
import { MOCK_ARCHIVES } from './mockData';
import { AnimatePresence, motion } from 'motion/react';

export function ArchivesModule() {
  const [archives, setArchives] = useState<ArchiveItem[]>(() => {
    const saved = JSON.parse(localStorage.getItem('sit-erp-demo-archives') || '[]');
    return [...saved, ...MOCK_ARCHIVES.filter((item) => !saved.some((savedItem: ArchiveItem) => savedItem.id === item.id))];
  });
  const [selectedArchive, setSelectedArchive] = useState<ArchiveItem | null>(null);

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedArchive ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col relative"
          >
            <ArchiveDetails archive={selectedArchive} onBack={() => setSelectedArchive(null)} />
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
            <ArchivesList 
              archives={archives} 
              onSelectArchive={setSelectedArchive} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
