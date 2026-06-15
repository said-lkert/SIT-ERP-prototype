import React, { useState } from 'react';
import { SupplierReturn, ReturnStatus } from './types';
import { ReturnsList } from './ReturnsList';
import { ReturnDetails } from './ReturnDetails';
import { ReturnFormModal } from './ReturnFormModal';
import { MOCK_RETURNS } from './mockData';
import { AnimatePresence, motion } from 'motion/react';
import { safeFormatDate } from '../../../lib/utils';

export function ReturnsModule() {
  const [supplierReturns, setSupplierReturns] = useState<SupplierReturn[]>(MOCK_RETURNS);
  const [selectedReturn, setSelectedReturn] = useState<SupplierReturn | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleNewReturn = () => {
    setIsFormOpen(true);
  };

  const handleSelectReturn = (ret: SupplierReturn) => {
    // Locate live state version
    const found = supplierReturns.find(r => r.id === ret.id);
    if (found) {
      setSelectedReturn(found);
    } else {
      setSelectedReturn(ret);
    }
  };

  const handleSubmitReturn = (formData: any, status: 'Brouillon' | 'Validé') => {
    const rawRef = `RF-2026-${Math.floor(100 + Math.random() * 900)}`;
    
    // Structure lines into types
    const productsMapped = (formData.products || []).map((p: any, idx: number) => ({
      id: `p-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      reference: p.refProduct || 'REF-GEN',
      name: p.productName || 'Produit générique',
      qty: Number(p.qty) || 1,
      locationName: p.sourceLoc || 'Zone SAV',
      condition: p.condition || 'Abîmé',
      isSerialized: !!p.isSerialized,
      serialNumbers: p.serials ? p.serials.split('\n').filter((s: string) => s.trim()) : [],
      reason: formData.comment || 'Panne constatée',
      decision: p.decision || 'Échange',
      isLinkedToInstalledEquipment: !!p.isLinkedToInstalledEquipment
    }));

    const newReturn: SupplierReturn = {
      id: `ret-${Math.random().toString(36).substr(2, 9)}`,
      reference: rawRef,
      supplierName: formData.supplierName,
      date: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0],
      motif: formData.motif,
      linkedReceipt: formData.linkedReceipt || undefined,
      warehouseName: formData.warehouseName,
      responsible: formData.responsible || 'Ahmed.K',
      status: status,
      comment: formData.comment || undefined,
      products: productsMapped,
      documents: (formData.documents || []).map((d: any) => ({
        id: d.id,
        type: d.type,
        name: d.name,
        size: d.size
      })),
      totalQty: formData.totalQty || 1,
      totalValue: formData.totalValue || 0,
      tracking: [
        { name: 'Retour créé', completed: true, date: safeFormatDate(new Date().toISOString()), description: 'Bordereau initial formalisé' },
        { name: 'Retour envoyé', completed: status === 'Validé', date: status === 'Validé' ? safeFormatDate(new Date().toISOString()) : undefined },
        { name: 'Reçu par fournisseur', completed: false },
        { name: 'Diagnostic fournisseur', completed: false },
        { name: 'Échange accepté', completed: false },
        { name: 'Avoir reçu', completed: false },
        { name: 'Retour clôturé', completed: false }
      ],
      history: [
        { 
          id: 'hist-1', 
          date: new Date().toISOString().replace('T', ' ').substring(0, 16), 
          action: status === 'Validé' ? 'Validation du retour (Produit bloqué/retiré du stock)' : 'Création du brouillon de retour', 
          user: formData.responsible || 'Ahmed.K' 
        }
      ]
    };

    setSupplierReturns(prev => [newReturn, ...prev]);
    setIsFormOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: ReturnStatus, eventDetail?: string) => {
    // Update live state list
    setSupplierReturns(prev => prev.map(item => {
      if (item.id === id) {
        const nextHist = [
          ...item.history,
          {
            id: `hist-${Math.random().toString(36).substr(2, 5)}`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            action: eventDetail || `Changement de statut vers ${newStatus}`,
            user: item.responsible
          }
        ];

        // Update tracking steps depending on status
        const nextTracking = item.tracking.map(step => {
          if (newStatus === 'Validé') {
            if (step.name === 'Retour envoyé') return { ...step, completed: true, date: safeFormatDate(new Date().toISOString()), description: 'Mis en attente de transport' };
          }
          if (newStatus === 'Clôturé') {
            if (step.name === 'Retour clôturé' || step.name === 'Avoir reçu' || step.name === 'Échange accepté') {
              return { ...step, completed: true, date: safeFormatDate(new Date().toISOString()), description: eventDetail };
            }
          }
          return step;
        });

        const nextValDate = newStatus === 'Validé' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : item.validationDate;

        const updatedItem = {
          ...item,
          status: newStatus,
          validationDate: nextValDate,
          history: nextHist,
          tracking: nextTracking
        };

        // Also update active selection so visual sheet updates live!
        if (selectedReturn && selectedReturn.id === id) {
          setSelectedReturn(updatedItem);
        }

        return updatedItem;
      }
      return item;
    }));
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedReturn ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col relative"
          >
            <ReturnDetails 
              supplierReturn={selectedReturn} 
              onBack={() => setSelectedReturn(null)} 
              onEdit={(ret) => {
                setSelectedReturn(null);
                setIsFormOpen(true);
              }}
              onStatusChange={handleStatusChange}
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
            <ReturnsList 
              returns={supplierReturns} 
              onSelectReturn={handleSelectReturn}
              onNewReturn={handleNewReturn}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ReturnFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSubmitReturn} 
      />
    </div>
  );
}
