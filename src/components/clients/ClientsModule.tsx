import React, { useState } from 'react';
import { Client } from './types';
import { ClientsList } from './ClientsList';
import { ClientDetails } from './ClientDetails';
import { MOCK_CLIENTS } from './mockData';
import { AnimatePresence, motion } from 'motion/react';
import { ClientEditModal } from './ClientEditModal';
import { useApi } from '../../hooks/useApi';

export function ClientsModule() {
  const { data: clients, loading, refetch } = useApi<Client[]>('/api/clients', MOCK_CLIENTS);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleUpdateClient = (updatedClient: Client) => {
    // Ideally use api.updateClient
    refetch();
  };

  const handleAddClient = (newClient: Client) => {
    refetch();
    setIsAddModalOpen(false);
  };

  const handleDeleteClient = (clientId: string) => {
    // Ideally use api.deleteClient
    refetch();
    setSelectedClient(null);
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedClient ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col relative"
          >
            <ClientDetails 
              client={selectedClient} 
              onBack={() => setSelectedClient(null)} 
              onUpdate={handleUpdateClient}
              onDelete={handleDeleteClient}
              onViewParc={(clientId) => console.log('Navigating to Parc for client:', clientId)}
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
            <ClientsList 
              clients={clients} 
              onSelectClient={setSelectedClient} 
              onAddClick={() => setIsAddModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ClientEditModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddClient}
        mode="edit"
      />
    </div>
  );
}
