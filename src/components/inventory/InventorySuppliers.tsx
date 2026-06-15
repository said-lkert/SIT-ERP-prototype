import React, { useState } from 'react';
import { PackageOpen, Save, Plus, Store, Hash, DollarSign, CalendarClock, Link as LinkIcon, Building2, UploadCloud, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettings } from '../settings/SettingsContext';

export function InventorySuppliers() {
  const { accentColor } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    supplierName: '',
    contactEmail: '',
    productName: '',
    sku: '',
    category: '',
    moq: '100',
    unitPrice: '',
    leadTime: '14'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          supplierName: '',
          contactEmail: '',
          productName: '',
          sku: '',
          category: '',
          moq: '100',
          unitPrice: '',
          leadTime: '14'
        });
      }, 3000);
    }, 1200);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Supplier & Product Registration</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Add a new supplier catalogue item directly into the inventory system.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Import CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Product Details</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Supplier Info */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> Supplier Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Supplier Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      name="supplierName"
                      required
                      value={formData.supplierName}
                      onChange={handleChange}
                      placeholder="e.g. Global Tech Supply" 
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:bg-white dark:bg-slate-900 transition-colors"
                      style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Email</label>
                    <input 
                      type="email" 
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="e.g. sales@supplier.com" 
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:bg-white dark:bg-slate-900 transition-colors"
                      style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full"></div>

              {/* Product Info */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <PackageOpen className="w-3 h-3" /> Product Identification
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Product Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      name="productName"
                      required
                      value={formData.productName}
                      onChange={handleChange}
                      placeholder="e.g. Industrial Servo Motor Series X" 
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:bg-white dark:bg-slate-900 transition-colors"
                      style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Supplier Reference / SKU</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Hash className="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder="e.g. PRD-882-V2" 
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:bg-white dark:bg-slate-900 transition-colors"
                        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                    <div className="relative">
                      <select 
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full appearance-none px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:bg-white dark:bg-slate-900 transition-colors text-slate-700 dark:text-slate-300"
                        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                      >
                        <option value="" disabled>Select a category</option>
                        <option value="hardware">Hardware Components</option>
                        <option value="electronics">Electronics</option>
                        <option value="machinery">Machinery</option>
                        <option value="packaging">Packaging Materials</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full"></div>

              {/* Ordering Info */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <LinkIcon className="w-3 h-3" /> Purchasing Conditions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Unit Price</label>
                     <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <input 
                        type="number" 
                        step="0.01"
                        name="unitPrice"
                        value={formData.unitPrice}
                        onChange={handleChange}
                        placeholder="0.00" 
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:bg-white dark:bg-slate-900 transition-colors"
                        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">MOQ</label>
                    <input 
                      type="number" 
                      name="moq"
                      value={formData.moq}
                      onChange={handleChange}
                      placeholder="100" 
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:bg-white dark:bg-slate-900 transition-colors"
                      style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lead Time</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <CalendarClock className="w-4 h-4" />
                      </div>
                      <input 
                        type="number" 
                        name="leadTime"
                        value={formData.leadTime}
                        onChange={handleChange}
                        placeholder="Days" 
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:bg-white dark:bg-slate-900 transition-colors"
                        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                        D
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Form Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
              <button 
                type="button" 
                className="px-4 py-2 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "px-6 py-2 text-white rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2",
                  isSuccess ? "bg-emerald-500 hover:bg-emerald-600" : "hover:opacity-90",
                  isSubmitting && "opacity-70 cursor-not-allowed"
                )}
                style={!isSuccess ? { backgroundColor: accentColor } : {}}
              >
                {isSubmitting ? (
                  <>Saving...</>
                ) : isSuccess ? (
                  <>Saved Successfully</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Product</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-slate-400" />
              Quick Tips
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
                <p>Ensure the <strong>Supplier Ref / SKU</strong> exactly matches the supplier's catalog to avoid PO errors.</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
                <p><strong>Lead Time</strong> helps the system calculate reorder points automatically.</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
                <p>You can bulk import products using the <strong>Import CSV</strong> tool on the top right.</p>
              </li>
            </ul>
          </div>
          
          <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60">
             <div className="flex items-center gap-3 mb-2">
               <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 dark:text-slate-400">
                 <Store className="w-4 h-4" />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Suppliers</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">248</p>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
