import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, MoreHorizontal, LayoutGrid, List, Plus, 
  ArrowRight, Edit2, Trash2, MapPin, X, TrendingDown, Calendar,
  XCircle, AlertCircle, CheckCircle2, Activity, Check, Download, Upload, ScanLine, FileText,
  Smartphone, Monitor, Router, Laptop, Camera, Printer, Server, CalendarDays, FileDown, MinusCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InventoryProductDetail } from './InventoryProductDetail';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Product {
  id: string;
  name: string;
  brand: string;
  sn: string;
  category: string;
  location: string;
  warrantyDate: string;
  stock: number;
  value: number;
  thresholds: { low: number };
  status?: string;
  documents?: any[];
  supplier?: string;
  poNumber?: string;
  purchaseDate?: string;
  eolDate?: string;
}

const getCategoryIcon = (category: string) => {
  const t = category.toLowerCase();
  switch (t) {
    case 'phones': return Smartphone;
    case 'screens': return Monitor;
    case 'routers': return Router;
    case 'pc': return Laptop;
    case 'cameras': return Camera;
    case 'printers': return Printer;
    default: return Server;
  }
};

const BASE_PRODUCTS: Product[] = [
  { id: '1', sn: 'PHN882', name: 'Google Pixel 8 Pro', brand: 'Google', category: 'phones', location: 'zone 1', warrantyDate: '2027-05-24', stock: 12, value: 899, thresholds: { low: 5 }, purchaseDate: '2024-05-24', eolDate: '2028-05-24', supplier: 'TechData', poNumber: 'PO-10024' },
  { id: '2', sn: 'SCR551', name: 'Dell Ultrasharp 27', brand: 'Dell', category: 'screens', location: 'zone 2', warrantyDate: '2026-06-20', stock: 4, value: 450, thresholds: { low: 5 }, purchaseDate: '2023-06-20', eolDate: '2028-06-20', supplier: 'Dell Direct', poNumber: 'PO-99812' },
  { id: '3', sn: 'RT909X', name: 'Cisco Meraki MX64', brand: 'Cisco', category: 'routers', location: 'zone 3', warrantyDate: '2029-02-27', stock: 8, value: 1200, thresholds: { low: 5 }, purchaseDate: '2024-02-27', eolDate: '2030-02-27', supplier: 'Ingram Micro', poNumber: 'PO-10088' },
  { id: '4', sn: 'ACC442', name: 'Logitech MX Master 3', brand: 'Logitech', category: 'pc', location: 'zone 1', warrantyDate: '2025-05-28', stock: 0, value: 99, thresholds: { low: 5 }, purchaseDate: '2024-05-28', eolDate: '2026-05-28', supplier: 'Amazon Business', poNumber: 'PO-10045' },

  // Existing Items
  { id: '5', sn: 'EXP001', name: 'Expired Laptop 1', brand: 'Dell', category: 'pc', location: 'zone 1', warrantyDate: '2026-04-01', stock: 10, value: 500, thresholds: { low: 5 }, purchaseDate: '2023-04-01', eolDate: '2027-04-01', supplier: 'Dell Direct', poNumber: 'PO-90021' }, 
  { id: '6', sn: 'EXP002', name: 'Expired Server 1', brand: 'HP', category: 'routers', location: 'zone 2', warrantyDate: '2025-12-31', stock: 2, value: 2000, thresholds: { low: 5 }, purchaseDate: '2020-12-31', eolDate: '2026-12-31', supplier: 'CDW', poNumber: 'PO-88123' }, 
  { id: '7', sn: 'SOO001', name: 'Soon Laptop 1', brand: 'Lenovo', category: 'pc', location: 'zone 3', warrantyDate: '2026-05-30', stock: 6, value: 800, thresholds: { low: 5 }, purchaseDate: '2023-05-30', eolDate: '2027-05-30', supplier: 'Lenovo Retail', poNumber: 'PO-98111' }, 
  { id: '8', sn: 'SOO002', name: 'Soon Screen 1', brand: 'LG', category: 'screens', location: 'zone 2', warrantyDate: '2026-06-15', stock: 3, value: 300, thresholds: { low: 5 }, purchaseDate: '2024-06-15', eolDate: '2029-06-15', supplier: 'Amazon Business', poNumber: 'PO-10555' }, 
  { id: '9', sn: 'CAM001', name: 'Pro Camera 1', brand: 'Sony', category: 'cameras', location: 'zone 1', warrantyDate: '2027-01-01', stock: 2, value: 1500, thresholds: { low: 5 }, purchaseDate: '2025-01-01', eolDate: '2030-01-01', supplier: 'B&H Photo Video', poNumber: 'PO-11001' },
  { id: '10', sn: 'PRI001', name: 'Office Printer A', brand: 'Canon', category: 'printers', location: 'zone 4', warrantyDate: '2027-02-01', stock: 5, value: 200, thresholds: { low: 5 }, purchaseDate: '2024-02-01', eolDate: '2029-02-01', supplier: 'Staples Business', poNumber: 'PO-10022' },
  { id: '11', sn: 'PHN002', name: 'iPhone 15', brand: 'Apple', category: 'phones', location: 'zone 5', warrantyDate: '2027-08-01', stock: 15, value: 1000, thresholds: { low: 5 }, purchaseDate: '2024-08-01', eolDate: '2028-08-01', supplier: 'Apple Store', poNumber: 'PO-10899' },
  { id: '12', sn: 'RT002', name: 'Home Router', brand: 'TP-Link', category: 'routers', location: 'zone 6', warrantyDate: '2026-10-01', stock: 20, value: 50, thresholds: { low: 5 }, purchaseDate: '2023-10-01', eolDate: '2028-10-01', supplier: 'Amazon Business', poNumber: 'PO-98212' },
  { id: '13', sn: 'PC002', name: 'Desktop Tower', brand: 'Custom', category: 'pc', location: 'zone 2', warrantyDate: '2028-01-01', stock: 3, value: 1200, thresholds: { low: 5 }, purchaseDate: '2025-01-01', eolDate: '2030-01-01', supplier: 'TechData', poNumber: 'PO-11005' },
  { id: '14', sn: 'CAM002', name: 'Webcam Pro', brand: 'Logitech', category: 'cameras', location: 'zone 3', warrantyDate: '2027-03-01', stock: 8, value: 150, thresholds: { low: 5 }, purchaseDate: '2025-03-01', eolDate: '2029-03-01', supplier: 'BestBuy Business', poNumber: 'PO-11012' },

  // 10 New Items
  { id: '15', sn: 'PHN003', name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'phones', location: 'zone 1', warrantyDate: '2028-02-15', stock: 20, value: 850, thresholds: { low: 5 }, purchaseDate: '2025-02-15', eolDate: '2029-02-15', supplier: 'Samsung Direct', poNumber: 'PO-11044' },
  { id: '16', sn: 'SCR003', name: 'Asus ProArt 32', brand: 'Asus', category: 'screens', location: 'zone 2', warrantyDate: '2027-11-20', stock: 6, value: 700, thresholds: { low: 5 }, purchaseDate: '2024-11-20', eolDate: '2029-11-20', supplier: 'Amazon Business', poNumber: 'PO-10655' },
  { id: '17', sn: 'RT003', name: 'Netgear Nighthawk', brand: 'Netgear', category: 'routers', location: 'zone 3', warrantyDate: '2028-05-10', stock: 11, value: 250, thresholds: { low: 5 }, purchaseDate: '2025-05-10', eolDate: '2030-05-10', supplier: 'CDW', poNumber: 'PO-11099' },
  { id: '18', sn: 'PC003', name: 'MacBook Air M3', brand: 'Apple', category: 'pc', location: 'zone 1', warrantyDate: '2027-07-22', stock: 25, value: 1100, thresholds: { low: 5 }, purchaseDate: '2024-07-22', eolDate: '2029-07-22', supplier: 'Apple Store', poNumber: 'PO-10255' },
  { id: '19', sn: 'CAM003', name: 'Logitech Brio 4K', brand: 'Logitech', category: 'cameras', location: 'zone 4', warrantyDate: '2026-09-30', stock: 14, value: 180, thresholds: { low: 5 }, purchaseDate: '2024-09-30', eolDate: '2028-09-30', supplier: 'Ingram Micro', poNumber: 'PO-10333' },
  { id: '20', sn: 'PRI002', name: 'HP LaserJet Pro', brand: 'HP', category: 'printers', location: 'zone 5', warrantyDate: '2027-04-18', stock: 4, value: 350, thresholds: { low: 5 }, purchaseDate: '2025-04-18', eolDate: '2030-04-18', supplier: 'HP Direct', poNumber: 'PO-11112' },
  { id: '21', sn: 'PHN004', name: 'Google Pixel 7a', brand: 'Google', category: 'phones', location: 'zone 6', warrantyDate: '2026-12-05', stock: 9, value: 450, thresholds: { low: 5 }, purchaseDate: '2024-12-05', eolDate: '2028-12-05', supplier: 'TechData', poNumber: 'PO-10444' },
  { id: '22', sn: 'SCR004', name: 'BenQ Designer 27', brand: 'BenQ', category: 'screens', location: 'zone 1', warrantyDate: '2027-08-30', stock: 7, value: 400, thresholds: { low: 5 }, purchaseDate: '2025-08-30', eolDate: '2030-08-30', supplier: 'B&H Photo Video', poNumber: 'PO-11155' },
  { id: '23', sn: 'RT004', name: 'Unifi Dream Machine', brand: 'Ubiquiti', category: 'routers', location: 'zone 2', warrantyDate: '2028-10-12', stock: 3, value: 380, thresholds: { low: 5 }, purchaseDate: '2025-10-12', eolDate: '2030-10-12', supplier: 'Ubiquiti Store', poNumber: 'PO-11188' },
  { id: '24', sn: 'PC004', name: 'ThinkPad T14', brand: 'Lenovo', category: 'pc', location: 'zone 3', warrantyDate: '2027-06-14', stock: 12, value: 1050, thresholds: { low: 5 }, purchaseDate: '2024-06-14', eolDate: '2029-06-14', supplier: 'Lenovo Retail', poNumber: 'PO-10222' },
  { id: '25', sn: 'PRI003', name: 'Epson EcoTank', brand: 'Epson', category: 'printers', location: 'zone 4', warrantyDate: '2028-01-20', stock: 7, value: 250, thresholds: { low: 5 }, purchaseDate: '2025-01-20', eolDate: '2030-01-20', supplier: 'Staples Business', poNumber: 'PO-10999' },
];

const INITIAL_PRODUCTS: Product[] = BASE_PRODUCTS.map(p => ({
  ...p,
  documents: [{ name: `${p.name} Specs.pdf` }, { name: `${p.brand} Manual.pdf` }]
}));

export const CATEGORIES = ['pc', 'printers', 'cameras', 'phones', 'screens', 'routers'];
export const LOCATIONS = ['zone 1', 'zone 2', 'zone 3', 'zone 4', 'zone 5', 'zone 6'];

export const PRODUCTS = INITIAL_PRODUCTS;

const getWarrantyStatus = (dateStr: string) => {
  if (!dateStr) return 'normal';
  const warrantyDate = new Date(dateStr);
  const now = new Date();
  const diffTime = warrantyDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 60) return 'expiring soon';
  return 'normal';
};

const getStockStatus = (product: Product) => {
  if (product.status) return product.status;
  if (product.stock === 0) return 'Out of Stock';
  if (product.stock < product.thresholds.low) return 'Low';
  return 'Normal';
};

const getStockBg = (status: string) => {
  if (status === 'Out of Stock') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'Low') return 'bg-orange-50 text-orange-700 border-orange-200';
  if (status === 'Normal') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  if (status === 'Maintenance') return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700/50';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

const getStockDot = (status: string) => {
  if (status === 'Out of Stock') return 'bg-red-500';
  if (status === 'Low') return 'bg-orange-500';
  if (status === 'Normal') return 'bg-emerald-400';
  if (status === 'Maintenance') return 'bg-amber-500';
  return 'bg-slate-400';
};

interface InventoryCatalogProps {
  selectedProductId: string | null;
  onSelectProduct: (id: string | null) => void;
}

export function InventoryCatalog({ selectedProductId, onSelectProduct }: InventoryCatalogProps) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  
  // Selection & bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [bulkLocation, setBulkLocation] = useState<string>('');
  const [bulkCategory, setBulkCategory] = useState<string>('');
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scannedSn, setScannedSn] = useState('');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '', category: '', location: '', warranty: ''
  });

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleDeleteConfirm = () => {
    setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
  };

  const handleChangeLocation = () => {
    setBulkLocation('');
    setShowLocationModal(true);
  };

  const submitChangeLocation = () => {
    if (bulkLocation && LOCATIONS.includes(bulkLocation.toLowerCase())) {
      setProducts(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, location: bulkLocation.toLowerCase() } : p));
      setSelectedIds(new Set());
      setShowLocationModal(false);
    }
  };

  const handleChangeCategory = () => {
    setBulkCategory('');
    setShowCategoryModal(true);
  };

  const submitChangeCategory = () => {
    if (bulkCategory) {
      setProducts(prev => prev.map(p => {
        if (!selectedIds.has(p.id)) return p;
        return { ...p, category: bulkCategory };
      }));
      setSelectedIds(new Set());
      setShowCategoryModal(false);
    }
  };

  const updateStock = (id: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }
      return p;
    }));
  };

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  
  const handleExportCSV = () => {
    const headers = ['SN', 'Name', 'Brand', 'Category', 'Location', 'Warranty Date', 'Stock', 'Value'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => 
        [p.sn, `"${p.name}"`, `"${p.brand}"`, p.category, p.location, p.warrantyDate, p.stock, p.value].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'catalog_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Inventory Catalog", 14, 15);
      autoTable(doc, {
        head: [['SN', 'Name', 'Brand', 'Category', 'Stock', 'Value']],
        body: products.map(p => [p.sn, p.name, p.brand, p.category, p.stock.toString(), `$${(p.stock * p.value).toLocaleString()}`])
      });
      doc.save('catalog_export.pdf');
    } catch(err) {
      console.error(err);
    }
    setIsExportMenuOpen(false);
  };

  const handleExportWord = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Export HTML to Word Document</title>
    <style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }</style>
    </head><body>`;
    const footer = "</body></html>";
    const html = header + "<h1>Inventory Catalog</h1><table><tr><th>SN</th><th>Name</th><th>Brand</th><th>Category</th><th>Stock</th><th>Value</th></tr>" +
      products.map(p => `<tr><td>${p.sn}</td><td>${p.name}</td><td>${p.brand}</td><td>${p.category}</td><td>${p.stock}</td><td>${p.value}</td></tr>`).join('') +
      "</table>" + footer;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'catalog_export.doc';
    link.click();
    setIsExportMenuOpen(false);
  };

  const handleImport = () => {
    // Simulate importing by triggering a file picker (we'll just use a mock alert or hidden file input)
    const el = document.createElement('input');
    el.type = 'file';
    el.accept = '.csv';
    el.onchange = (e) => {
      // simulate success
      alert('CSV Imported successfully. (Preview)');
    };
    el.click();
  };

  const openEditModalForSelected = () => {
    if (selectedIds.size === 1) {
      const p = products.find(p => p.id === Array.from(selectedIds)[0]);
      if (p) {
        setEditingProduct(p);
        setIsProductModalOpen(true);
      }
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const searchLower = search.toLowerCase();
      const matchesSearch = !search || 
        p.name.toLowerCase().includes(searchLower) || 
        p.sn.toLowerCase().includes(searchLower) || 
        p.brand.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower) ||
        p.location.toLowerCase().includes(searchLower) ||
        p.stock.toString() === searchLower ||
        p.value.toString() === searchLower ||
        (p.warrantyDate && p.warrantyDate.includes(searchLower)) ||
        getWarrantyStatus(p.warrantyDate).toLowerCase().includes(searchLower);
        
      const status = getStockStatus(p);
      const matchesStatus = !filters.status || status.toLowerCase() === filters.status.toLowerCase();
      const matchesCategory = !filters.category || p.category.toLowerCase() === filters.category.toLowerCase();
      const matchesLocation = !filters.location || p.location.toLowerCase() === filters.location.toLowerCase();
      
      const warrantyStatus = getWarrantyStatus(p.warrantyDate);
      const matchesWarranty = !filters.warranty || warrantyStatus === filters.warranty;

      return matchesSearch && matchesStatus && matchesCategory && matchesLocation && matchesWarranty;
    });
  }, [products, search, filters]);

  // We map selection directly to products array for rendering detail, 
  // but we should pass the item to product detail or just let it fetch from PRODUCTS if we keep using static.
  // We'll pass the full product object to InventoryProductDetail actually.
  if (selectedProductId) {
    const product = products.find(p => p.id === selectedProductId);
    if (product) {
      return (
        <div className="flex flex-col h-full relative">
          <InventoryProductDetail 
            key={product.id}
            product={product as any} 
            onBack={() => onSelectProduct(null)} 
            onEdit={() => {
              setEditingProduct(product);
              setIsProductModalOpen(true);
            }}
            onUpdateStock={(delta) => updateStock(product.id, delta)}
            onUpdateProduct={(updatedProduct) => {
              setProducts(prev => prev.map(item => item.id === updatedProduct.id ? updatedProduct : item));
            }}
          />
          {isProductModalOpen && (
            <ProductFormModal
              product={editingProduct}
              existingSns={products.filter(p => p.id !== editingProduct?.id).map(p => p.sn.toLowerCase())}
              onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
              onSave={(p) => {
                if (editingProduct) {
                  setProducts(prev => prev.map(item => item.id === p.id ? p : item));
                } else {
                  setProducts(prev => [...prev, p]);
                }
                setIsProductModalOpen(false);
                setEditingProduct(null);
              }}
            />
          )}
        </div>
      );
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full flex flex-col animate-in fade-in duration-500 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0 z-10 relative">
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search SN, name, brand..." 
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm w-72 md:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 dark:text-slate-100 transition-colors"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn("flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors", isFilterOpen ? "bg-indigo-50 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900")}
            >
              <Filter className="w-4 h-4" />
              Filters {Object.values(filters).some(v => v) && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
            </button>
            
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-4 z-50 transition-colors">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</label>
                    <select className="w-full mt-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-1.5 rounded transition-colors" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                      <option value="">Any</option>
                      <option value="Normal">Normal</option>
                      <option value="Low">Low</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Category</label>
                    <select className="w-full mt-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-1.5 rounded transition-colors" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
                      <option value="">Any</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Location</label>
                    <select className="w-full mt-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-1.5 rounded transition-colors" value={filters.location} onChange={e => setFilters({...filters, location: e.target.value})}>
                      <option value="">Any</option>
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Warranty</label>
                    <select className="w-full mt-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-1.5 rounded transition-colors" value={filters.warranty} onChange={e => setFilters({...filters, warranty: e.target.value})}>
                      <option value="">Any</option>
                      <option value="normal">Normal</option>
                      <option value="expiring soon">Expiring Soon</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  {(filters.status || filters.category || filters.location || filters.warranty) && (
                    <button onClick={() => setFilters({status: '', category: '', location: '', warranty: ''})} className="text-sm text-indigo-600 dark:text-indigo-400 font-medium w-full text-center mt-2 hover:underline">Clear all filters</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden xl:inline">Export</span>
            </button>
            {isExportMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-2 z-50 transition-colors">
                 <button onClick={handleExportCSV} className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-2"><FileDown className="w-4 h-4" /> CSV</button>
                 <button onClick={handleExportPDF} className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-2"><FileDown className="w-4 h-4" /> PDF</button>
                 <button onClick={handleExportWord} className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-2"><FileDown className="w-4 h-4" /> Word</button>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsScanModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors shadow-sm"
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan</span>
          </button>

          <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex text-sm font-medium transition-colors ml-2">
             <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded shadow-sm transition-colors", viewMode === 'list' ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300")}>
               <List className="w-4 h-4" />
             </button>
             <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded shadow-sm transition-colors", viewMode === 'grid' ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300")}>
               <LayoutGrid className="w-4 h-4" />
             </button>
          </div>
          <button 
            onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Product
          </button>
        </div>
      </div>

      <div className="bg-transparent overflow-hidden flex-1 flex flex-col relative z-0 transition-colors">
        {viewMode === 'list' ? (
          <div className="flex-1 flex flex-col min-h-0 bg-transparent">
            <div className="overflow-y-auto p-1 md:p-2 space-y-3 pb-32">
              {/* Header Row */}
              <div className="flex items-center px-4 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                <div className="w-[72px] shrink-0 pl-1"></div>
                <div className="flex-[2.5] min-w-[150px] font-medium">Product Details</div>
                <div className="flex-1 hidden sm:block font-medium">Brand</div>
                <div className="flex-1 hidden lg:block font-medium">Category</div>
                <div className="flex-1 hidden xl:block font-medium">Location</div>
                <div className="flex-1 text-center font-medium">Stock</div>
                <div className="w-[100px] shrink-0 text-center font-medium">Actions</div>
              </div>

              <AnimatePresence>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  const wStatus = getWarrantyStatus(product.warrantyDate);
                  const Icon = getCategoryIcon(product.category);
                  const isSelected = selectedIds.has(product.id);
                  return (
                    <motion.div 
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => toggleSelection(product.id)}
                      onDoubleClick={() => onSelectProduct(product.id)}
                      className={cn(
                        "flex items-center p-4 bg-white dark:bg-slate-950 border rounded-2xl cursor-pointer transition-colors relative overflow-hidden group",
                        isSelected 
                          ? "border-[#2563eb] shadow-[0_0_15px_-3px_rgba(37,99,235,0.3)] dark:shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]" 
                          : "border-slate-200 dark:border-slate-800 shadow-sm"
                      )}
                    >
                      {isSelected && (
                          <motion.div 
                            layoutId={`selection-indicator-${product.id}`}
                            className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#2563eb] z-10"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            exit={{ scaleY: 0 }}
                          />
                      )}
                      
                      <div className="w-[84px] shrink-0 flex items-center justify-center gap-2 h-full relative z-10">
                        <div className={cn(
                          "flex items-center justify-center transition-all overflow-hidden h-full",
                          (selectedIds.size > 0 || isSelected) ? "w-6 opacity-100" : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-100"
                        )}>
                          <div className={cn(
                            "w-[20px] h-[20px] rounded-[5px] border-[2px] flex items-center justify-center transition-all",
                            isSelected 
                              ? "bg-white border-slate-900 text-[#2563eb] dark:bg-slate-900 dark:border-white dark:text-blue-400 shadow-sm" 
                              : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-transparent"
                          )}>
                            <Check className={cn("w-4 h-4 stroke-[2.5]", isSelected ? "opacity-100" : "opacity-0")} />
                          </div>
                        </div>

                        <div className={cn(
                          "w-10 h-10 shrink-0 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center transition-all",
                          isSelected ? "bg-white dark:bg-slate-900 text-indigo-600 border-indigo-200 dark:border-indigo-800" : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                        )}>
                          <Icon strokeWidth={1.5} className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="flex-[2.5] min-w-[150px] pl-3">
                        <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-white uppercase truncate">{product.name || '-'}</h3>
                        <p className="text-[12px] font-extrabold text-slate-400/90 dark:text-slate-500 uppercase mt-0.5">SN: {product.sn || '-'}</p>
                      </div>

                      <div className="flex-1 hidden sm:block">
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{product.brand || '-'}</p>
                      </div>

                      <div className="flex-1 hidden lg:block">
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {product.category || '-'}
                        </span>
                      </div>

                      <div className="flex-1 hidden xl:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="truncate">{product.location || '-'}</span>
                      </div>

                      <div className="flex-1 text-center">
                        <span className="font-extrabold text-slate-900 dark:text-white text-lg">{product.stock}</span>
                      </div>
                      
                      <div className="w-[100px] shrink-0 flex items-center justify-end gap-1">
                         <button 
                             onClick={(e) => { e.stopPropagation(); setEditingProduct(product); setIsProductModalOpen(true); }}
                             className="p-2 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent"
                             title="Edit"
                         >
                             <Edit2 className="w-5 h-5" />
                         </button>
                         <button 
                             onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedIds(new Set([product.id])); 
                                setShowDeleteConfirm(true); 
                             }}
                             className="p-2 rounded-2xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all border border-transparent"
                             title="Delete"
                         >
                             <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                    </motion.div>

                  )
                })}
              </AnimatePresence>
              {filteredProducts.length === 0 && (
                <div className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  No products found.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2 md:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto bg-transparent flex-1">
            {filteredProducts.map((product) => {
              const status = getStockStatus(product);
              const Icon = getCategoryIcon(product.category);
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={product.id}
                  onClick={() => toggleSelection(product.id)}
                  onDoubleClick={() => onSelectProduct(product.id)}
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors space-y-4 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase", getStockBg(status))}>
                      {status}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white uppercase truncate">{product.name || '-'}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">SN: {product.sn || '-'}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                     <span>{product.location || '-'}</span>
                     <div className="flex items-center justify-end gap-1">
                        <span className="w-8 text-center font-extrabold text-slate-900 dark:text-white text-lg">{product.stock}</span>
                     </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0 transition-colors">
          <span>Showing {filteredProducts.length} items</span>
        </div>
      </div>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 100, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 100, x: "-50%" }}
            layout
            className="absolute bottom-8 left-1/2 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl px-2 py-2 flex items-center gap-2 z-50 text-white overflow-hidden"
          >
            <motion.div layout className="flex items-center gap-3 px-3 py-1 border-r border-slate-700/50 pr-4 mr-2">
              <motion.div layout className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-sm">
                {selectedIds.size}
              </motion.div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none whitespace-nowrap">Processing Selection</span>
                <span className="text-sm font-bold leading-none mt-1 whitespace-nowrap">{selectedIds.size} ITEM{selectedIds.size > 1 ? 'S' : ''} SELECTED</span>
              </div>
            </motion.div>
            
            <motion.button layout onClick={handleChangeCategory} className="w-12 h-12 shrink-0 rounded-2xl border border-slate-700 hover:bg-slate-800 flex items-center justify-center text-slate-300 transition-colors" title="Manage Category">
              <LayoutGrid className="w-5 h-5 text-slate-400" />
            </motion.button>
            
            <AnimatePresence mode="popLayout">
              {selectedIds.size === 1 && (
                 <motion.button 
                   layout
                   initial={{ opacity: 0, scale: 0.8, width: 0 }}
                   animate={{ opacity: 1, scale: 1, width: 48 }}
                   exit={{ opacity: 0, scale: 0.8, width: 0 }}
                   onClick={openEditModalForSelected}
                   className="h-12 shrink-0 rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors overflow-hidden" 
                   title="Edit Product"
                 >
                   <Edit2 className="w-5 h-5 text-slate-400 shrink-0" />
                 </motion.button>
              )}
            </AnimatePresence>

            <motion.button layout onClick={handleChangeLocation} className="w-12 h-12 shrink-0 rounded-2xl border border-slate-700 hover:bg-slate-800 flex items-center justify-center text-slate-300 transition-colors" title="Move Location">
              <MapPin className="w-5 h-5 text-slate-400" />
            </motion.button>
            
            <motion.button layout onClick={() => setShowDeleteConfirm(true)} className="w-12 h-12 shrink-0 rounded-2xl border border-rose-900/50 bg-rose-950/20 hover:bg-rose-900/40 text-rose-500 flex items-center justify-center transition-colors" title="Delete">
              <Trash2 className="w-5 h-5 text-rose-500" />
            </motion.button>

            <motion.button layout onClick={() => setSelectedIds(new Set())} className="w-12 h-12 shrink-0 rounded-2xl border border-slate-700 hover:bg-slate-800 flex items-center justify-center text-slate-300 transition-colors" title="Deselect All">
              <X className="w-5 h-5 text-slate-400" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center border-0 p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl relative z-10 w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800 p-6 text-center transition-colors"
          >
             <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Assets?</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6">Are you sure you want to delete {selectedIds.size} selected asset(s)? This action cannot be undone.</p>
             <div className="flex gap-3 justify-center">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button onClick={handleDeleteConfirm} className="px-5 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm">Delete</button>
             </div>
          </motion.div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center border-0 p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowLocationModal(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl relative z-10 w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800 p-6 text-center transition-colors"
          >
             <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Move Location</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6">Select a new location for {selectedIds.size} selected asset(s).</p>
             
             <div className="mb-6 text-left">
               <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">New Location</label>
               <select 
                 className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none transition-colors"
                 value={bulkLocation}
                 onChange={(e) => setBulkLocation(e.target.value)}
               >
                 <option value="" disabled>Select Location</option>
                 {LOCATIONS.map(loc => (
                   <option key={loc} value={loc}>{loc.toUpperCase()}</option>
                 ))}
               </select>
             </div>

             <div className="flex gap-3 justify-center">
                <button onClick={() => setShowLocationModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">Cancel</button>
                <button 
                  onClick={submitChangeLocation} 
                  disabled={!bulkLocation}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm text-sm"
                >Move</button>
             </div>
          </motion.div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center border-0 p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl relative z-10 w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800 p-6 text-center transition-colors"
          >
             <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutGrid className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Update Category</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6">Select a new category to apply to {selectedIds.size} asset(s).</p>
             
             <div className="mb-6 text-left">
               <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">New Category</label>
               <select 
                 className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none transition-colors"
                 value={bulkCategory}
                 onChange={(e) => setBulkCategory(e.target.value)}
               >
                 <option value="" disabled>Select Category</option>
                 {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>

             <div className="flex gap-3 justify-center">
                <button onClick={() => setShowCategoryModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">Cancel</button>
                <button 
                  onClick={submitChangeCategory} 
                  disabled={!bulkCategory}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm text-sm"
                >Update</button>
             </div>
          </motion.div>
        </div>
      )}

      {/* Product Form Modal */}
      {isProductModalOpen && (
        <ProductFormModal
          product={editingProduct}
          existingSns={products.filter(p => p.id !== editingProduct?.id).map(p => p.sn.toLowerCase())}
          onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
          onSave={(p) => {
            if (editingProduct) {
              setProducts(prev => prev.map(item => item.id === p.id ? p : item));
            } else {
              setProducts(prev => [...prev, p]);
            }
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Scanner Modal */}
      {isScanModalOpen && (
        <ScannerModal 
          onClose={() => setIsScanModalOpen(false)}
          onScan={(sn) => {
            setIsScanModalOpen(false);
            const exists = products.find(p => p.sn.toLowerCase() === sn.toLowerCase());
            if (exists) {
              onSelectProduct(exists.id);
            } else {
              if (window.confirm(`Item with barcode/SN ${sn} doesn't exist. Would you like to add it to the catalog?`)) {
                setEditingProduct({ sn, stock: 0, thresholds: {low: 5} } as any);
                setIsProductModalOpen(true);
              }
            }
          }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ 
  product, 
  existingSns, 
  onClose, 
  onSave 
}: { 
  product: Product | null, 
  existingSns: string[], 
  onClose: () => void, 
  onSave: (p: Product) => void 
}) {
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    id: Math.random().toString(36).substring(7),
    name: '', brand: '', sn: '', category: '', 
    location: '', warrantyDate: '', 
    stock: 0, value: 0, thresholds: { low: 5 },
    supplier: '', poNumber: '', purchaseDate: '', eolDate: ''
  });

  const isSnDuplicate = existingSns.includes((formData.sn || '').toLowerCase());
  const canSave = !!formData.sn && !isSnDuplicate;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center border-0 p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl relative z-10 w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{product ? 'Edit Asset' : 'New Asset'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors text-slate-500 dark:text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Asset Model (Name)</label>
              <input 
                type="text" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all dark:text-white"
                placeholder="e.g. Surface Pro"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Brand</label>
              <input 
                type="text" 
                value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all dark:text-white"
                placeholder="e.g. HP / Dell"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                Serial Number {isSnDuplicate && <span className="text-red-500 font-bold lowercase">Must be unique</span>}
              </label>
              <input 
                type="text" 
                value={formData.sn} onChange={e => setFormData({...formData, sn: e.target.value})}
                className={cn(
                  "w-full bg-slate-50 dark:bg-slate-900 border px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all uppercase dark:text-white",
                  isSnDuplicate ? "border-red-500 text-red-600 focus:ring-red-500" : "border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-indigo-500"
                )}
                placeholder="Max 9 chars"
                maxLength={9}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-indigo-500 flex items-center gap-1.5 border-none">
                <Calendar className="w-3.5 h-3.5" />
                Warranty Status
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl px-2 py-1.5 text-center border border-transparent focus-within:border-indigo-500">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Day</span>
                  <input type="text" maxLength={2} className="w-full text-center bg-transparent font-bold text-slate-800 dark:text-slate-100 outline-none" 
                    value={(formData.warrantyDate || '').split('-')[2] || ''} 
                    onChange={e => {
                      const parts = (formData.warrantyDate || '2026-01-01').split('-');
                      setFormData({...formData, warrantyDate: `${parts[0]}-${parts[1]}-${e.target.value.padStart(2, '0')}`});
                    }} />
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl px-2 py-1.5 text-center border border-transparent focus-within:border-indigo-500">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Month</span>
                  <input type="text" maxLength={2} className="w-full text-center bg-transparent font-bold text-slate-800 dark:text-slate-100 outline-none" 
                     value={(formData.warrantyDate || '').split('-')[1] || ''} 
                     onChange={e => {
                       const parts = (formData.warrantyDate || '2026-01-01').split('-');
                       setFormData({...formData, warrantyDate: `${parts[0]}-${e.target.value.padStart(2, '0')}-${parts[2]}`});
                     }} />
                </div>
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl px-2 py-1.5 text-center border-2 border-slate-900 dark:border-slate-700 shadow-sm relative group">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Year</span>
                  <select className="w-full text-center bg-transparent font-bold text-slate-800 dark:text-slate-100 outline-none appearance-none cursor-pointer absolute inset-0 opacity-0"
                     value={(formData.warrantyDate || '').split('-')[0] || '2026'}
                     onChange={e => {
                       const parts = (formData.warrantyDate || '2026-01-01').split('-');
                       setFormData({...formData, warrantyDate: `${e.target.value}-${parts[1]}-${parts[2]}`});
                     }}
                  >
                     {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <span className="block font-bold text-slate-800 dark:text-slate-100">{(formData.warrantyDate || '').split('-')[0] || '2026'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <div className="relative">
                <select 
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 px-4 py-3 rounded-xl text-sm font-bold uppercase outline-none transition-all appearance-none text-slate-700 dark:text-slate-200"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 dark:text-white">v</div>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Area</label>
              <div className="relative">
                <select 
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 px-4 py-3 rounded-xl text-sm font-bold uppercase outline-none transition-all appearance-none text-slate-700 dark:text-slate-200"
                >
                  <option value="">Select Location</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 dark:text-white">v</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 dark:from-indigo-950/20 dark:to-blue-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30 grid grid-cols-2 gap-6 shadow-none">
            <div className="relative group">
              <label className="block text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2 group-hover:text-indigo-600 transition-colors">Current Stock Level</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={formData.stock || 0} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-800 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 px-5 py-4 rounded-xl text-xl font-black text-slate-800 dark:text-slate-100 outline-none transition-all shadow-sm"
                  min="0"
                />
              </div>
            </div>
            <div className="relative group">
              <label className="block text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2 group-hover:text-indigo-600 transition-colors">Unit Value</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 font-bold text-lg">
                  $
                </div>
                <input 
                  type="number" 
                  value={formData.value || 0} onChange={e => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-800 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 pl-9 pr-5 py-4 rounded-xl text-xl font-black text-slate-800 dark:text-slate-100 outline-none transition-all shadow-sm font-mono tracking-tight"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>
          
          {/* Acquisition & Financials */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50 space-y-6">
             <div>
                <label className="block text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-1">Acquisition & Financials</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Supplier details, purchase tracking, and depreciation.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Supplier / Vendor</label>
                  <input 
                    type="text" 
                    value={formData.supplier || ''} onChange={e => setFormData({...formData, supplier: e.target.value})}
                    placeholder="e.g. Dell EMC, Amazon"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">PO Number</label>
                  <input 
                    type="text" 
                    value={formData.poNumber || ''} onChange={e => setFormData({...formData, poNumber: e.target.value})}
                    placeholder="e.g. PO-899120"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Purchase Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="date" 
                      value={formData.purchaseDate || ''} onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Expected EOL (End of Life)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="date" 
                      value={formData.eolDate || ''} onChange={e => setFormData({...formData, eolDate: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    />
                  </div>
                </div>
             </div>
          </div>

          {/* Document Upload */}
          <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
             <label className="block text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Attached Documents
             </label>
             <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Upload technical specs, manuals, or contracts related to this asset.</p>
             
             <div className="space-y-2 mb-4">
                {(formData.documents || []).map((doc: any, i: number) => (
                   <div key={i} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg group">
                      <div className="flex items-center gap-2 overflow-hidden">
                         <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                         <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{typeof doc === 'string' ? doc : doc.name}</span>
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, documents: formData.documents?.filter((_, idx) => idx !== i)})}
                        title="Remove Document"
                        className="flex items-center justify-center p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded transition-all shrink-0"
                      >
                         <MinusCircle className="w-5 h-5" />
                      </button>
                   </div>
                ))}
             </div>
             
             <button 
                onClick={() => {
                  const el = document.createElement('input');
                  el.type = 'file';
                  el.accept = '.pdf,.docx,.xlsx';
                  el.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const newDoc = {
                          name: file.name,
                          isFile: true,
                          dataUrl: event.target?.result
                        };
                        setFormData({...formData, documents: [...(formData.documents || []), newDoc]});
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  el.click();
                }}
                className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl py-4 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors"
             >
                <Upload className="w-5 h-5 mb-2 text-slate-400" />
                <span className="text-sm font-bold">Click to Upload Document</span>
                <span className="text-xs font-medium mt-1 opacity-70">PDF, DOCX, XLSX (Max 10MB)</span>
             </button>
          </div>

          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
             <div>
                <label className="block text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-1">Stock Status Thresholds</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure trigger boundaries for the stock status tags.</p>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Out of Stock */}
                <div>
                  <label className="block text-[11px] font-bold text-rose-500 uppercase mb-2">Out of Stock</label>
                  <div className="relative">
                    <input type="number" readOnly value={0} className="w-full bg-rose-50/50 dark:bg-rose-950/20 border-2 border-rose-300 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl text-sm font-bold outline-none cursor-not-allowed" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 dark:text-rose-400">
                       <XCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[11px] text-rose-500/80 dark:text-rose-400/80 mt-1.5 font-medium">Restricted. Values at 0 hit Out of Stock.</p>
                </div>

                {/* Low */}
                <div>
                  <label className="block text-[11px] font-bold text-amber-500 uppercase mb-2">Low Trigger</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={formData.thresholds?.low || 0} 
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        setFormData({...formData, thresholds: {...(formData.thresholds as any), low: val}});
                      }} 
                      className="w-full bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-400 focus:border-amber-500 dark:border-amber-600/50 dark:focus:border-amber-500 text-amber-600 dark:text-amber-400 px-4 py-3 rounded-xl text-sm font-bold outline-none transition-colors" 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 dark:text-amber-400">
                       <AlertCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-500/80 dark:text-amber-400/80 mt-1.5 font-medium">Stock below this is considered low. Stock above this is Normal.</p>
                </div>
             </div>
          </div>

        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-950 transition-colors">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-sm font-bold border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/80 transition-colors uppercase tracking-wider"
          >
            Discard
          </button>
          <button 
            disabled={!canSave}
            onClick={() => onSave(formData as Product)}
            className="px-6 py-3 rounded-xl text-sm font-bold bg-[#3b82f6] text-white hover:bg-blue-600 transition-colors uppercase tracking-wider shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product ? 'Update Entry' : 'Confirm Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { Html5Qrcode } from 'html5-qrcode';

function ScannerModal({ onClose, onScan }: { onClose: () => void, onScan: (sn: string) => void }) {
  const [sn, setSn] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startCamera = async () => {
    if (!window.confirm("Are you sure you want to open the camera?")) {
      return;
    }
    
    setIsCameraActive(true);
    setCameraError('');
  };

  useEffect(() => {
    if (isCameraActive) {
      const timer = setTimeout(async () => {
        try {
          const qrcode = new Html5Qrcode("reader");
          scannerRef.current = qrcode;
          await qrcode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              onScan(decodedText);
              stopCamera();
            },
            (errorMessage) => {
              // ignore intermediate scan errors
            }
          );
        } catch (err: any) {
          setCameraError('Unable to access camera or element not ready.');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isCameraActive]);

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {}
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center border-0 p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { stopCamera(); onClose(); }}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl relative z-10 w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800 p-8 text-center transition-colors max-h-[90vh] overflow-y-auto"
      >
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
           <ScanLine className="w-8 h-8 relative z-10" />
           <motion.div 
             animate={{ y: [-20, 20, -20] }} 
             transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
             className="absolute inset-x-0 h-0.5 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] z-20"
           ></motion.div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Scan Barcode</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Aim your scanner, or open the camera to read the barcode.</p>
        
        <div className="flex flex-col gap-3 justify-center mb-6">
           {!isCameraActive ? (
             <button type="button" onClick={startCamera} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-200 dark:border-indigo-800">
                <Camera className="w-5 h-5" /> Open Camera
             </button>
           ) : (
             <button type="button" onClick={stopCamera} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors">
                <X className="w-5 h-5" /> Stop Camera
             </button>
           )}
        </div>
        
        {isCameraActive && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black min-h-[250px]">
             <div id="reader"></div>
          </div>
        )}
        {cameraError && <p className="text-rose-500 text-xs font-bold mb-4">{cameraError}</p>}
        
        <form onSubmit={(e) => { e.preventDefault(); if (sn) onScan(sn.toUpperCase()); stopCamera(); }}>
          <input 
            type="text" 
            autoFocus
            value={sn}
            onChange={(e) => setSn(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-center text-xl font-mono uppercase font-bold text-slate-900 dark:text-slate-100 outline-none transition-colors mb-6 shadow-sm"
            placeholder="MANUAL ENTRY"
          />
          <div className="flex gap-3 justify-center">
             <button type="button" onClick={() => { stopCamera(); onClose(); }} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
             <button type="submit" disabled={!sn} className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm">Process</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
