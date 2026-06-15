import React, { useState } from 'react';
import { ProjetClient } from './types';
import { ProjetsClientsList } from './ProjetsClientsList';
import { ProjetClientDetails } from './ProjetClientDetails';
import { ProjetClientFormModal } from './ProjetClientFormModal';
import { HistorySidebar } from './HistorySidebar';
import { PutOnHoldModal, CloseProjectModal, CancelProjectModal, ArchiveProjectModal } from './ActionModals';
import { MOCK_PROJETS_CLIENTS } from './mockData';
import { AnimatePresence, motion } from 'motion/react';

import { useApi } from '../../hooks/useApi';

export function ProjetsClientsModule() {
  const { data: projets, loading, refetch, mutate } = useApi<ProjetClient[]>('/api/projects', MOCK_PROJETS_CLIENTS);
  const [selectedProjet, setSelectedProjet] = useState<ProjetClient | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [projetToEdit, setProjetToEdit] = useState<ProjetClient | undefined>(undefined);
  
  // Action Modals State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<ProjetClient | null>(null);

  const handleBackToList = () => {
    setSelectedProjet(null);
  };

  const handleSaveProject = (projet: ProjetClient) => {
    mutate([
      projet,
      ...projets.filter((existing) => existing.id !== projet.id)
    ]);
    setIsFormModalOpen(false);
  };

  const handleOpenAddModal = () => {
    setFormMode('add');
    setProjetToEdit(undefined);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (projet: ProjetClient) => {
    setFormMode('edit');
    setProjetToEdit(projet);
    setIsFormModalOpen(true);
  };

  const handleOpenDuplicateModal = (projet: ProjetClient) => {
    setFormMode('duplicate');
    setProjetToEdit(projet);
    setIsFormModalOpen(true);
  };

  const handleArchive = (projet: ProjetClient) => {
    refetch();
    if (selectedProjet?.id === projet.id) setSelectedProjet(null);
    setIsArchiveModalOpen(false);
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
      <AnimatePresence mode="wait">
        {selectedProjet ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-0 z-50 flex flex-col"
          >
            <ProjetClientDetails 
              projet={selectedProjet} 
              onBack={handleBackToList}
              onEdit={handleOpenEditModal}
              onDuplicate={handleOpenDuplicateModal}
              onHold={(p) => { setActiveProject(p); setIsHoldModalOpen(true); }}
              onClose={(p) => { setActiveProject(p); setIsCloseModalOpen(true); }}
              onCancel={(p) => { setActiveProject(p); setIsCancelModalOpen(true); }}
              onHistory={(p) => { setActiveProject(p); setIsHistoryOpen(true); }}
              onArchive={(p) => { setActiveProject(p); setIsArchiveModalOpen(true); }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 w-full flex flex-col min-h-0 p-4 md:p-6 lg:p-8"
          >
            <ProjetsClientsList 
              projets={projets} 
              onSelectProjet={setSelectedProjet} 
              onAddClick={handleOpenAddModal}
              onEdit={handleOpenEditModal}
              onDuplicate={handleOpenDuplicateModal}
              onHold={(p) => { setActiveProject(p); setIsHoldModalOpen(true); }}
              onClose={(p) => { setActiveProject(p); setIsCloseModalOpen(true); }}
              onCancel={(p) => { setActiveProject(p); setIsCancelModalOpen(true); }}
              onHistory={(p) => { setActiveProject(p); setIsHistoryOpen(true); }}
              onArchive={(p) => { setActiveProject(p); setIsArchiveModalOpen(true); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ProjetClientFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveProject}
        initialData={projetToEdit}
        mode={formMode}
      />

      {activeProject && (
        <>
          <HistorySidebar 
            isOpen={isHistoryOpen} 
            onClose={() => setIsHistoryOpen(false)} 
            projet={activeProject} 
          />
          <PutOnHoldModal 
            isOpen={isHoldModalOpen} 
            onClose={() => setIsHoldModalOpen(false)} 
            projet={activeProject}
            onConfirm={(data) => {
              refetch();
            }}
          />
          <CloseProjectModal 
            isOpen={isCloseModalOpen} 
            onClose={() => setIsCloseModalOpen(false)} 
            projet={activeProject}
            onConfirm={() => {
              refetch();
            }}
          />
          <CancelProjectModal 
            isOpen={isCancelModalOpen} 
            onClose={() => setIsCancelModalOpen(false)} 
            projet={activeProject}
            onConfirm={(motif) => {
              refetch();
            }}
          />
          <ArchiveProjectModal 
            isOpen={isArchiveModalOpen} 
            onClose={() => setIsArchiveModalOpen(false)} 
            onConfirm={() => handleArchive(activeProject)}
          />
        </>
      )}
    </div>
  );
}
