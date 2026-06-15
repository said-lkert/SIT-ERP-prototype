import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Truck, 
  CalendarDays, 
  ArrowRightLeft,
  FileText,
  AlertTriangle,
  MinusCircle,
  Edit2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { jsPDF } from 'jspdf';
import Barcode from 'react-barcode';

interface InventoryProductDetailProps {
  key?: string | number;
  product: any;
  onBack: () => void;
  onEdit: () => void;
  onUpdateStock?: (delta: number) => void;
  onUpdateProduct?: (product: any) => void;
}

export function InventoryProductDetail({ product, onBack, onEdit, onUpdateStock, onUpdateProduct }: InventoryProductDetailProps) {
  const isOOS = product.stock === 0;
  const isLow = product.stock > 0 && product.stock <= (product.thresholds?.low || 5);
  const [documents, setDocuments] = useState<any[]>(product.documents || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [docNameOfDelete, setDocNameOfDelete] = useState<string>('');

  const handleFileUpload = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newDoc = {
          name: file.name,
          isFile: true,
          dataUrl: e.target?.result
        };
        const updatedDocs = [...documents, newDoc];
        setDocuments(updatedDocs);
        onUpdateProduct?.({ ...product, documents: updatedDocs });
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmDeleteDocument = (index: number) => {
    setDocumentToDelete(index);
    const doc = documents[index];
    setDocNameOfDelete(typeof doc === 'string' ? doc : doc.name);
  };

  const handleConfirmDelete = () => {
    if (documentToDelete !== null) {
      const updatedDocs = documents.filter((_, i) => i !== documentToDelete);
      setDocuments(updatedDocs);
      onUpdateProduct?.({ ...product, documents: updatedDocs });
      setDocumentToDelete(null);
    }
  };

  const handleViewDocument = (doc: any) => {
    if (doc.isFile && doc.dataUrl) {
      // It's a real uploaded document, open in new tab
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${doc.dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
      return;
    }

    const docName = typeof doc === 'string' ? doc : doc.name;
    // Generate a basic PDF to be readable dynamically
    try {
      const docPdf = new jsPDF();
      docPdf.text(docName, 14, 20);
      docPdf.setFontSize(12);
      docPdf.text(`Document for: ${product.name}`, 14, 30);
      docPdf.text(`Description: This document contains specifications and details`, 14, 45);
      docPdf.text(`about the ${product.name} (${product.category}).`, 14, 52);
      docPdf.text(`It is used to verify warranty information, check technical specifications,`, 14, 59);
      docPdf.text(`and provide user guidelines for its operation and maintenance.`, 14, 66);
      docPdf.text(`Internal Reference: ${product.sn}`, 14, 80);
      
      const pdfBlob = docPdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    } catch (e) {
      alert(`Opening document: ${docName} (Failed to generate preview)`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
         <button 
           onClick={onBack}
           className="w-10 h-10 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
         >
           <ArrowLeft className="w-5 h-5" />
         </button>
         <div>
            <div className="flex items-center gap-3">
               <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{product.name}</h2>
               {isOOS && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">Out of Stock</span>}
               {isLow && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">Low Stock</span>}
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{product.sn} <span className="mx-1 text-slate-300 dark:text-slate-600">•</span> {product.category}</p>
         </div>
         
         <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
               <button onClick={() => onUpdateStock?.(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm hover:text-rose-600 transition-all font-bold select-none">-</button>
               <span className="w-12 text-center text-sm font-bold text-slate-800 dark:text-slate-200">{product.stock || 0}</span>
               <button onClick={() => onUpdateStock?.(1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm hover:text-emerald-600 transition-all font-bold select-none">+</button>
            </div>
            <button onClick={onEdit} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors">
              Edit Info
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Details */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                       <Package className="w-4 h-4 text-indigo-500" />
                       Inventory Status
                   </h3>
                   
                   <div className="mb-4">
                      <div className="flex justify-between items-end mb-3">
                         <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{product.stock || 0} <span className="text-base text-slate-400 font-medium tracking-normal ml-1">units available</span></p>
                         <p className="text-xs font-bold text-slate-500 dark:text-slate-400 text-right bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 uppercase tracking-widest">Capacity: 3,000</p>
                      </div>
                      
                      <div className="relative pt-8 pb-2">
                         {/* Gauge thresholds */}
                         <div className="absolute top-0 w-full flex text-[10px] font-bold text-slate-400 uppercase">
                            <div style={{ width: `${(1500 / 3000) * 100}%` }} className="border-r-2 border-dashed border-indigo-200 relative">
                               <span className="absolute -top-6 right-0 translate-x-1/2 text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/50">Target</span>
                            </div>
                         </div>
                         <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex relative z-10 shadow-inner">
                            {product.stock > 0 && (
                               <div 
                                 className={cn("h-full transition-all duration-1000 ease-out relative", isOOS ? "bg-slate-300" : isLow ? "bg-amber-400" : "bg-emerald-500")} 
                                 style={{ width: `${(product.stock / 3000) * 100}%` }}
                               >
                                 <div className="absolute inset-0 w-full animate-pulse bg-white/20 dark:bg-white/10"></div>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100 dark:bg-slate-800/80">
                  <div className="bg-white dark:bg-slate-900 p-5">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3 text-indigo-400" /> Location</p>
                     <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{product.location || '-'}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1"><CircleDollarSignIcon /> Unit Cost</p>
                     <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">${(product.value || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1"><Package className="w-3 h-3 text-emerald-400" /> Total Value</p>
                     <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">${(product.stock * (product.value || 0)).toLocaleString(undefined, {minimumFractionDigits:2})}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1"><Truck className="w-3 h-3 text-amber-400" /> Brand</p>
                     <p className="font-bold text-indigo-600 text-sm cursor-pointer hover:underline">{product.brand || '-'}</p>
                  </div>
               </div>
            </div>

            {/* Acquisition & Financials */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 flex items-center gap-2">
                         <CircleDollarSignIcon />
                         Acquisition & Financials
                      </h3>
                      <button onClick={onEdit} className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800/80">
                    <div className="bg-white dark:bg-slate-900 p-6 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <Truck className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1.5">Supplier / Vendor</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{product.supplier || 'Not specified'}</p>
                            {product.poNumber && <p className="text-sm font-medium text-slate-500 mt-0.5 dark:text-slate-400">PO: {product.poNumber}</p>}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <CalendarDays className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2">Lifecycle</p>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-sm gap-4">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Purchased:</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{product.purchaseDate || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm gap-4">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Warranty:</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300 text-sm flex items-center gap-1">
                                      {product.warrantyDate || '-'}
                                      {product.warrantyDate && (() => {
                                         const diffDays = Math.ceil((new Date(product.warrantyDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                         if (diffDays < 0) return <span className="text-xs text-rose-600 dark:text-rose-500 font-bold">(expired)</span>;
                                         if (diffDays <= 60) return <span className="text-xs text-amber-600 dark:text-amber-500 font-bold">(expiring soon)</span>;
                                         return null;
                                      })()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm gap-4">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Expected EOL:</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{product.eolDate || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Movement History */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                     <ArrowRightLeft className="w-4 h-4 text-slate-400" /> Recent Movements
                  </h3>
                  <button className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
               </div>
               
               <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                  {[
                     { type: 'OUT', qty: -45, reason: 'Sales Order #SO-9921', user: 'System', date: 'Today, 10:45 AM', color: 'text-amber-600', bg: 'bg-amber-100' },
                     { type: 'IN', qty: 200, reason: 'Purchase Receipt #RC-102', user: 'J. Smith', date: 'Oct 15, 08:30 AM', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                     { type: 'OUT', qty: -12, reason: 'Sales Order #SO-9915', user: 'System', date: 'Oct 14, 14:20 PM', color: 'text-amber-600', bg: 'bg-amber-100' },
                     { type: 'ADJ', qty: -2, reason: 'Inventory Count (Damage)', user: 'A. Sterling', date: 'Oct 10, 09:00 AM', color: 'text-rose-600', bg: 'bg-rose-100' },
                  ].map((mov, i) => (
                     <div key={i} className="relative flex items-start gap-4">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-white z-10 text-[9px] font-bold", mov.bg, mov.color)}>
                           {mov.type}
                        </div>
                        <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-xl p-3 flex justify-between items-center">
                           <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{mov.reason}</p>
                              <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                 <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {mov.date}</span>
                                 <span>By: {mov.user}</span>
                              </div>
                           </div>
                           <span className={cn("font-mono font-bold", mov.qty > 0 ? "text-emerald-600" : "text-slate-600")}>
                              {mov.qty > 0 ? `+${mov.qty}` : mov.qty}
                           </span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar contents */}
         <div className="space-y-6">
            {/* 30 Day Trend mini chart */}
            <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-sm overflow-hidden relative">
               <div className="absolute inset-x-0 bottom-0 top-1/2 opacity-20 bg-gradient-to-t from-indigo-500 to-transparent"></div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 relative z-10">30-Day Trend</h3>
               <div className="flex items-end gap-1 h-24 relative z-10">
                  {/* Just some dummy bars for a quick sparkline effect */}
                  {[40,40,40,35,35,32,32,100,100,95,90,85,85,80].map((h, i) => (
                     <div key={i} className="flex-1 bg-indigo-400 rounded-t-sm opacity-80" style={{ height: `${h}%` }}></div>
                  ))}
               </div>
               <div className="flex justify-between items-center mt-4 relative z-10">
                 <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Current Rate</p>
                    <p className="text-lg font-bold">~15/day avg</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Proj. Empty</p>
                    <p className="text-lg font-bold text-amber-400">in 2wks</p>
                 </div>
               </div>
            </div>

            {/* Documents */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden overflow-x-hidden">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> Attached Documents
               </h3>
               <div className="space-y-3 relative">
                  <AnimatePresence initial={false}>
                     {documents.map((doc, i) => (
                        <motion.div 
                          key={`doc-${typeof doc === 'string' ? doc : doc.name}-${i}`}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, x: 0 }}
                          exit={{ opacity: 0, x: 150, transition: { duration: 0.4, delay: 0.5 } }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-3 p-3 border border-slate-100 bg-slate-50 dark:bg-slate-950 rounded-lg hover:bg-slate-100 cursor-pointer group"
                        >
                           <div onClick={() => handleViewDocument(doc)} className="flex items-center gap-3 flex-1 min-w-0">
                             <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                             </div>
                             <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{typeof doc === 'string' ? doc : doc.name}</p>
                           </div>
                           <button 
                             onClick={(e) => { e.stopPropagation(); confirmDeleteDocument(i); }}
                             title="Remove Document"
                             className="flex items-center justify-center p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded transition-all shrink-0"
                           >
                             <MinusCircle className="w-6 h-6" />
                           </button>
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
               <input
                 type="file"
                 ref={fileInputRef}
                 onChange={handleFileUpload}
                 accept=".pdf,.docx,.xlsx"
                 className="hidden"
               />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="w-full mt-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg py-3 text-slate-500 dark:text-slate-400 font-bold text-xs hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
               >
                 + Upload Document
               </button>
            </div>

            {/* Barcode Display */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
               <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 relative z-10 w-full text-center">Item Barcode</h3>
               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 w-full flex justify-center">
                 <Barcode value={product.sn} format="CODE128" height={60} width={1.8} displayValue={true} background="transparent" lineColor="#0f172a" />
               </div>
            </div>
         </div>
      </div>
      
      {/* Delete Document Modal */}
      <AnimatePresence>
        {documentToDelete !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
               onClick={() => setDocumentToDelete(null)}
            ></motion.div>
            <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 10 }}
               className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl max-w-sm w-full"
            >
               <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4 text-rose-600">
                  <AlertTriangle className="w-6 h-6" />
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Document?</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                 Are you sure you want to remove <span className="font-semibold text-slate-700 dark:text-slate-300">"{docNameOfDelete}"</span>? This action cannot be undone.
               </p>
               <div className="flex gap-3 mt-6">
                 <button 
                   onClick={() => setDocumentToDelete(null)}
                   className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                 >
                   Discard
                 </button>
                 <button 
                   onClick={handleConfirmDelete}
                   className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors shadow-sm"
                 >
                   Delete
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CircleDollarSignIcon() {
   return (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
   );
}
