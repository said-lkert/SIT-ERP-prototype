import React, { useState } from 'react';
import { Product } from './types';
import { ProductsList } from './ProductsList';
import { ProductDetails } from './ProductDetails';
import { ProductAddModal } from './ProductAddModal';
import { MOCK_PRODUCTS } from './mockData';
import { AnimatePresence, motion } from 'motion/react';

import { useApi } from '../../hooks/useApi';

export function ProductsModule() {
  const { data: products, loading, mutate: setProducts, refetch } = useApi<Product[]>('/api/products', MOCK_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const archivedProductIds = new Set(
    JSON.parse(localStorage.getItem('sit-erp-demo-archives') || '[]')
      .filter((item: any) => item.type === 'Produit')
      .map((item: any) => item.originalData?.id)
  );
  const visibleProducts = products.filter((product) => !archivedProductIds.has(product.id));

  const handleArchiveProduct = (product: Product) => {
    setProducts(products.filter((item) => item.id !== product.id));
  };

  const handleAddProduct = async (newProduct: Product) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (response.ok) {
        const created = await response.json();
        const purchasePrice = Number(newProduct.purchasePrice || 0);
        const sellingPrice = Number(newProduct.sellingPrice || 0);
        const physicalStock = Number(newProduct.physicalStock || 0);
        const reservedStock = Number(newProduct.reservedStock || 0);
        const createdProduct: Product = {
          ...newProduct,
          id: created.id,
          reference: created.reference || newProduct.reference,
          physicalStock,
          reservedStock,
          availableStock: physicalStock - reservedStock,
          orderedStock: Number(newProduct.orderedStock || 0),
          margin: sellingPrice - purchasePrice,
          marginRate: sellingPrice
            ? ((sellingPrice - purchasePrice) / sellingPrice) * 100
            : 0,
          createdAt: new Date().toISOString(),
        };
        setProducts([
          createdProduct,
          ...products.filter((product) => product.id !== createdProduct.id)
        ]);
        setIsAddModalOpen(false);
      } else {
        console.error('Failed to add product');
      }
    } catch (err) {
      console.error(err);
    }
  };

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
            <ProductDetails
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
              onArchive={handleArchiveProduct}
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
            <ProductsList 
              products={visibleProducts} 
              onSelectProduct={setSelectedProduct} 
              onAddClick={() => setIsAddModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ProductAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddProduct}
      />
    </div>
  );
}
