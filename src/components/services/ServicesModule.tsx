import React, { useState } from 'react';
import { ServicesList } from './ServicesList';
import { ServiceDetails } from './ServiceDetails';
import { ServiceAddModal } from './ServiceAddModal';
import { Service } from './types';
import { MOCK_SERVICES } from './mockData';
import { AnimatePresence, motion } from 'motion/react';
import { useApi } from '../../hooks/useApi';

export function ServicesModule() {
  const { data: services, refetch } = useApi<Service[]>('/api/services', MOCK_SERVICES);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddService = async (newService: Service) => {
    const response = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newService)
    });
    if (response.ok) {
      await refetch();
    }
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedService ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col relative"
          >
            <ServiceDetails service={selectedService} onBack={() => setSelectedService(null)} />
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
            <ServicesList 
              services={services}
              onServiceClick={setSelectedService} 
              onAddClick={() => setIsAddModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <ServiceAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddService}
      />
    </div>
  );
}
