import React, { useState } from 'react';
import { StockLocation } from './types';
import { LocationsList } from './LocationsList';
import { LocationDetails } from './LocationDetails';
import { LocationEditModal } from './LocationEditModal';
import { MOCK_LOCATIONS } from './mockData';
import { AnimatePresence, motion } from 'motion/react';

export function LocationsModule() {
  const [locations, setLocations] = useState<StockLocation[]>(MOCK_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<StockLocation | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddLocation = (newLocation: StockLocation) => {
    setLocations(prev => [newLocation, ...prev]);
  };

  const handleUpdateLocation = (updatedLocation: StockLocation) => {
    setLocations(prev => prev.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc));
    if (selectedLocation?.id === updatedLocation.id) {
      setSelectedLocation(updatedLocation);
    }
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
    setSelectedLocation(null);
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedLocation ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col relative"
          >
            <LocationDetails 
              location={selectedLocation} 
              onBack={() => setSelectedLocation(null)} 
              onUpdate={handleUpdateLocation}
              onDelete={() => handleDeleteLocation(selectedLocation.id)}
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
            <LocationsList 
              locations={locations} 
              onSelectLocation={setSelectedLocation} 
              onAddClick={() => setIsAddModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <LocationEditModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddLocation}
      />
    </div>
  );
}
