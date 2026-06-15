import React, { useMemo, useState } from 'react';
import { StockDashboard } from './StockDashboard';
import { ProductStockFiche } from './ProductStockFiche';
import { StockItem } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { useApi } from '../../hooks/useApi';

export function StockModule() {
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const { data: products } = useApi<any[]>('/api/products', []);
  const data = useMemo<StockItem[]>(() => products.map((product) => {
    const physicalStock = Number(product.physicalStock || 0);
    const reservedStock = Number(product.reservedStock || 0);
    const availableStock = Number(product.availableStock || 0);
    const minStockThreshold = Number(product.minThreshold || 0);
    return {
      id: product.id,
      reference: product.reference,
      name: product.name,
      family: product.family || 'Non classé',
      physicalStock,
      reservedStock,
      availableStock,
      orderedStock: Number(product.orderedStock || 0),
      minStockThreshold,
      mainLocation: 'Entrepôt principal - EMPL-A-01',
      status: availableStock <= 0 ? 'rupture' : availableStock <= minStockThreshold ? 'sous_seuil' : 'en_stock',
      locations: physicalStock > 0 ? [{ id: 'loc1', name: 'Entrepôt principal - EMPL-A-01', quantity: physicalStock, type: 'depot' as const }] : [],
      movements: [],
      reservations: [],
      isSerialized: product.requiresSerialNumber === true,
      serialNumbers: []
    };
  }), [products]);

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {selectedProduct ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col relative"
          >
            <ProductStockFiche product={selectedProduct} onBack={() => setSelectedProduct(null)} />
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
            <StockDashboard data={data} onSelectProduct={setSelectedProduct} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
