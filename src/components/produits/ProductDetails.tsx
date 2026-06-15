import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Product, ProductStatus } from './types';
import { ArrowLeft, Edit, Copy, MoreHorizontal, Box, Tag, FileText, CheckCircle2, History, Plus, AlertCircle, ShoppingCart, Truck, ShieldAlert, BadgeCheck, Package, AlertTriangle, Archive, Settings, ChevronDown, Calendar, Clock, User } from 'lucide-react';
import { cn, safeFormatDate, safeFormatDateTime } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ProductEditModal } from './ProductEditModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useModules } from '../../contexts/ModuleContext';

const priceHistoryData = [
  { period: 'Janv', nouveau: 165, ancien: 155 },
  { period: 'Févr', nouveau: 170, ancien: 165 },
  { period: 'Mars', nouveau: 172, ancien: 170 },
  { period: 'Avril', nouveau: 175, ancien: 172 },
  { period: 'Mai', nouveau: 178, ancien: 175 },
  { period: 'Juin', nouveau: 180, ancien: 178 },
];

const PriceTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl shadow-slate-200/50 dark:shadow-none min-w-[180px]">
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {entry.name === 'nouveau' ? 'Nouveau prix' : 'Ancien prix'} :
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{entry.value} DA</span>
            </div>
          ))}
        </div>
        {payload.length === 2 && (
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between gap-4 items-center">
            <span className="text-slate-500 font-medium">Variation :</span>
            <span className={cn(
              "font-bold px-1.5 py-0.5 rounded", 
              payload[0].value > payload[1].value ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : 
              payload[0].value < payload[1].value ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : 
              "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            )}>
               {(payload[0].value - payload[1].value > 0 ? "+" : "")}{(payload[0].value - payload[1].value).toFixed(2)} DA
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onArchive?: (product: Product) => void;
}

type TabId = 'resume' | 'prix' | 'fournisseurs' | 'sn' | 'garanties';

export function ProductDetails({ product: initialProduct, onBack, onArchive }: ProductDetailsProps) {
  const { isModuleEnabled } = useModules();
  const serialNumbersEnabled = isModuleEnabled('numeros-serie');

  const [activeTab, setActiveTab] = useState<TabId>('resume');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [product, setProduct] = useState<any>(initialProduct);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isDuplicateChoiceModalOpen, setIsDuplicateChoiceModalOpen] = useState(false);
  const [isDuplicateEditModalOpen, setIsDuplicateEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isTitleVisible, setIsTitleVisible] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/products/${initialProduct.id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
      }
    };
    fetchDetails();
  }, [initialProduct.id]);

  // Fallback if tab is invalid when disabled
  useEffect(() => {
    if (!serialNumbersEnabled && activeTab === 'sn') {
      setActiveTab('resume');
    }
  }, [serialNumbersEnabled, activeTab]);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTitleVisible(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" } // Offset for the header itself so it triggers sooner
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    return () => {
      if (titleRef.current) {
        observer.unobserve(titleRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOptionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case 'Actif': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'En rupture': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Sous seuil': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Obsolète': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      case 'Désactivé': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const tabs = useMemo(() => {
    const list: { id: TabId; label: string; icon: React.ElementType }[] = [
      { id: 'resume', label: 'Résumé', icon: FileText },
      { id: 'prix', label: 'Prix & Marge', icon: Tag },
      { id: 'fournisseurs', label: 'Fournisseurs', icon: Truck },
      { id: 'sn', label: 'Numéros de Série', icon: BadgeCheck },
      { id: 'garanties', label: 'Garanties', icon: CheckCircle2 }
    ];
    if (!serialNumbersEnabled) {
      return list.filter(t => t.id !== 'sn');
    }
    return list;
  }, [serialNumbersEnabled]);

  // Quick stats mock
  const inStockSeries = Math.max(0, product.physicalStock - 2);
  const warrantiesExpiring = Math.floor(product.physicalStock / 4);

  const warrantyEndDate = useMemo(() => {
    const d = new Date(product.createdAt);
    if (isNaN(d.getTime())) return null;
    d.setMonth(d.getMonth() + (product.clientWarrantyMonths || 12));
    return d;
  }, [product.createdAt, product.clientWarrantyMonths]);

  const { isExpired, isExpiringSoon, warrantyStatus } = useMemo(() => {
    if (!warrantyEndDate) return { isExpired: false, isExpiringSoon: false, warrantyStatus: 'N/A' };
    const expired = warrantyEndDate < new Date();
    const soon = !expired && (warrantyEndDate.getTime() - new Date().getTime()) < 30 * 24 * 60 * 60 * 1000;
    const status = expired ? 'Expirée' : soon ? 'Expire bientôt' : 'Valide';
    return { isExpired: expired, isExpiringSoon: soon, warrantyStatus: status };
  }, [warrantyEndDate]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Top Actions Bar */}
      <div className="relative flex items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0 transition-all duration-300">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors relative z-10 shrink-0"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Retour à la liste</span>
          <span className="sm:hidden">Retour</span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 flex justify-center overflow-hidden max-w-[40%] pointer-events-none z-0">
          <AnimatePresence>
            {!isTitleVisible && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex items-center gap-3 overflow-hidden pointer-events-auto"
              >
                <div className="font-bold text-slate-900 dark:text-white truncate">{product.name}</div>
                <div className="hidden md:flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                    {product.reference}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
          >
            <Edit className="w-4 h-4" /> Modifier
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
              Options
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  isOptionsOpen && "rotate-180",
                )}
              />
            </button>
            {isOptionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <style>{`
                  .group:hover .animate-scroll-text {
                    animation: scroll-text-x 2.5s linear infinite alternate;
                  }
                  @keyframes scroll-text-x {
                    0%, 15% { transform: translateX(0); }
                    85%, 100% { transform: translateX(-40px); }
                  }
                `}</style>
                <div className="p-1.5 text-slate-700 dark:text-slate-300">
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      setIsArchiveModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Archive className="w-4 h-4 text-red-500 shrink-0" /> Archiver le produit
                  </button>
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      setIsDuplicateChoiceModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-indigo-500 shrink-0" /> Dupliquer le produit
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      setIsHistoryModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group relative"
                  >
                    <History className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" /> 
                    <div className="flex-1 overflow-hidden relative text-left">
                      <span className="block w-full truncate group-hover:opacity-0 transition-opacity">
                        Historique des changements
                      </span>
                      <div className="absolute top-0 left-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                         <span className="inline-block animate-scroll-text">Historique des changements</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full">
          {/* Left MAIN area */}
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
          
          {/* Header Info */}
          <div className="px-8 pt-8 pb-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center justify-between mb-4" ref={titleRef}>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{product.name}</h1>
              <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border", getStatusColor(product.status))}>
                {product.status}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-8">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Famille</span>
                <span className="font-medium text-slate-900 dark:text-white">{product.family}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Marque</span>
                <span className="font-medium text-slate-900 dark:text-white">{product.brand}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Modèle</span>
                <span className="font-medium text-slate-900 dark:text-white">{product.model}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Fournisseur</span>
                <span className="font-medium text-slate-900 dark:text-white">{product.mainSupplier}</span>
              </div>
            </div>

            {/* Quick Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Box className="w-4 h-4" /> Stock physique
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{product.physicalStock}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Prix de vente HT
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{product.sellingPrice.toFixed(2)} DA</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Truck className="w-4 h-4 shrink-0" /> Fournisseur
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white truncate" title={product.mainSupplier || "Non défini"}>
                  {product.mainSupplier || "Non défini"}
                </div>
              </div>
              <div className={cn(
                "rounded-xl p-4 border transition-colors",
                isExpired ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800" 
                : isExpiringSoon ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800"
                : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              )}>
                <div className={cn(
                  "text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-2",
                  isExpired ? "text-red-800 dark:text-red-400"
                  : isExpiringSoon ? "text-orange-800 dark:text-orange-400"
                  : "text-slate-500 dark:text-slate-400"
                )}>
                  <ShieldAlert className="w-4 h-4 shrink-0" /> Fin de garantie
                </div>
                <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                  <div className={cn(
                    "text-lg font-bold leading-none",
                    isExpired ? "text-red-600 dark:text-red-500"
                    : isExpiringSoon ? "text-orange-600 dark:text-orange-500"
                    : "text-slate-900 dark:text-white"
                  )}>{warrantyEndDate ? safeFormatDate(warrantyEndDate.toISOString()) : '-'}</div>
                  <div className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                    isExpired ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : isExpiringSoon ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  )}>{warrantyStatus}</div>
                </div>
              </div>
            </div>

          </div>

          {/* Horizontal Tabs */}
          <div className="px-8 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <nav className="flex space-x-6 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                      isActive 
                        ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" 
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab content area */}
          <div className="flex-1 p-8">
            <div className="w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'resume' && (
                    <div className="space-y-6">
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Informations essentielles */}
                        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Box className="w-4 h-4 text-slate-400" /> Informations essentielles
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Type d'article</span>
                              <span className="text-sm font-medium text-slate-900 dark:text-white">{product.type}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Produit stockable</span>
                              <span className="text-sm font-medium text-slate-900 dark:text-white">{product.isStockable ? 'Oui' : 'Non'}</span>
                            </div>
                            {serialNumbersEnabled && (
                              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">N° série obligatoire</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{product.requiresSerialNumber ? 'Oui' : 'Non'}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Statut commercial</span>
                              <span className="text-sm font-medium text-slate-900 dark:text-white">{product.status}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Fournisseur principal</span>
                              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{product.mainSupplier}</span>
                            </div>
                          </div>
                        </div>

                        {/* Description & Caractéristiques */}
                        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" /> Description
                          </h3>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {product.description}
                          </p>
                        </div>

                        {/* Compatibilités / usage métier */}
                        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-400" /> Compatibilités & Installation
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div>
                               <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Usage typique</h4>
                               <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                                 {product.family === 'CCTV' ? (
                                    <>
                                      <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Vidéosurveillance extérieure</li>
                                      <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Protection périmétrique</li>
                                    </>
                                 ) : product.family === 'Réseau' ? (
                                    <>
                                      <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Cœur de réseau entreprise</li>
                                      <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Distribution accès postes</li>
                                    </>
                                 ) : (
                                    <>
                                      <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Installation professionnelle</li>
                                      <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Intégration système</li>
                                    </>
                                 )}
                               </ul>
                             </div>
                             <div>
                               <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Compatible avec</h4>
                               <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                                 {product.brand === 'Hikvision' ? (
                                    <>
                                      <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> NVR Hikvision (Série I ou K)</li>
                                      <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Switch PoE 802.3af/at</li>
                                      <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Alimentation 12V DC 1A</li>
                                    </>
                                 ) : product.brand === 'TP-Link' || product.brand === 'MikroTik' ? (
                                    <>
                                      <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Câblage Cat6 / Cat6a</li>
                                      <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Modules SFP multimode</li>
                                      <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Onduleur 1000VA+</li>
                                    </>
                                 ) : (
                                    <>
                                      <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Équipements standards</li>
                                      <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Câblerie universelle</li>
                                    </>
                                 )}
                               </ul>
                             </div>
                             <div>
                               <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Lieux d'installation</h4>
                               <div className="flex flex-wrap gap-2 mt-2">
                                 {product.family === 'CCTV' ? (
                                   <>
                                     <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">Entrée bâtiment</span>
                                     <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">Parking</span>
                                     <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">Façade</span>
                                   </>
                                 ) : product.family === 'Réseau' || product.family === 'Serveur' ? (
                                   <>
                                     <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">Local technique</span>
                                     <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">Baie brassage</span>
                                     <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">Desktop</span>
                                   </>
                                 ) : (
                                   <>
                                     <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">Intérieur</span>
                                     <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">Environnement sec</span>
                                   </>
                                 )}
                               </div>
                             </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {activeTab === 'prix' && (
                    <div className="space-y-6">
                      {/* KPI cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Prix d'achat H.T</label>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{product.purchasePrice.toFixed(2)} DA</p>
                          <p className="text-xs text-slate-400 mt-2">Moyen: {(product.averagePurchasePrice || product.purchasePrice * 0.95).toFixed(2)} DA</p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Prix de vente H.T</label>
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{product.sellingPrice.toFixed(2)} DA</p>
                          <p className="text-xs text-slate-400 mt-2">Maj: {safeFormatDate(product.lastPriceUpdate)}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                          {product.marginRate < 15 && <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500 rounded-r-xl"></div>}
                          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">Marge H.T {product.marginRate < 15 && <AlertCircle className="w-3 h-3 text-red-500" />}</label>
                          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{product.margin.toFixed(2)} DA</p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                          {product.marginRate < 15 && <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500 rounded-r-xl"></div>}
                          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Taux de marge</label>
                          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{product.marginRate.toFixed(2)} %</p>
                        </div>
                      </div>

                      {/* Price History */}
                      <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mt-6">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Tag className="w-4 h-4 text-slate-400" /> Évolution du prix de vente
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">6 derniers mois</p>
                        </div>
                        <div className="h-[240px] w-full mt-8">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={priceHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                              <XAxis 
                                dataKey="period" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#64748B' }} 
                                dy={10}
                              />
                              <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#64748B' }} 
                                domain={['dataMin - 5', 'dataMax + 5']}
                              />
                              <RechartsTooltip content={<PriceTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                              <Legend 
                                iconType="circle" 
                                iconSize={8}
                                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                                formatter={(value) => <span className="text-slate-600 dark:text-slate-400 font-medium">{value === 'nouveau' ? 'Nouveau prix' : 'Ancien prix'}</span>}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="nouveau" 
                                stroke="#4F46E5" 
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }}
                                animationDuration={1000}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="ancien" 
                                stroke="#94A3B8" 
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#94A3B8' }}
                                animationDuration={1000}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}



                  {activeTab === 'fournisseurs' && (
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Liste des fournisseurs</h3>
                            <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                              <Plus className="w-4 h-4" /> Ajouter
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead>
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fournisseur</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Référence Frs</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Prix Achat HT</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Délai (j)</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Qté Min</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dernier Achat</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {product.offers && product.offers.length > 0 ? (
                                  product.offers.map((offer: any, index: number) => (
                                    <tr key={offer.id}>
                                      <td className="px-4 py-4 text-sm whitespace-nowrap">
                                        <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                          {offer.supplierName}
                                          {index === 0 && (
                                            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Principal</span>
                                          )}
                                        </div>
                                        <div className="text-xs text-slate-500">{offer.supplierEmail}</div>
                                      </td>
                                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">
                                        {offer.reference}
                                      </td>
                                      <td className="px-4 py-4 text-sm font-medium text-slate-900 dark:text-white text-right">
                                        {(offer.purchasePrice || 0).toLocaleString()} {offer.currency}
                                      </td>
                                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300 text-right">
                                        {offer.deliveryDays}
                                      </td>
                                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300 text-right">
                                        -
                                      </td>
                                      <td className="px-4 py-4 text-sm text-slate-500 text-left">
                                        {offer.updatedAt ? safeFormatDate(offer.updatedAt) : '-'}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500 italic">
                                      Aucun fournisseur référencé pour ce produit.
                                    </td>
                                  </tr>
                                )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'sn' && (
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Vue détaillée des numéros de série</h3>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <input type="text" placeholder="Rechercher N° de série..." className="w-full sm:w-64 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">N° Série</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Emplacement / Client</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date d'entrée</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fin garantie</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                              {[1, 2, 3, 4].map(i => {
                                  let status = 'En stock';
                                  let color = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
                                  let location = 'Dépôt principal';
                                  if (i === 3) {
                                    status = 'Réservé';
                                    color = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
                                    location = 'Chantier Hôtel X';
                                  }
                                  if (i === 4) {
                                    status = 'Installé';
                                    color = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
                                    location = 'Client ABC / Site Alger';
                                  }

                                  return (
                                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-mono text-slate-900 dark:text-white font-medium">
                                      SN-{product.model.substring(0,3).toUpperCase()}-00{i}A9B
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded font-medium border", color)}>{status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                      {location}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">
                                      12/03/2026
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">
                                      12/03/2028
                                    </td>
                                  </tr>
                                  );
                              })}
                            </tbody>
                          </table>
                          {(!product.requiresSerialNumber) && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-center text-sm text-slate-500 border-t border-slate-200 dark:border-slate-800">
                              Note : La gestion par numéro de série n'est pas obligatoire pour ce produit, l'historique peut être incomplet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'garanties' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="col-span-2 bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6">Suivi des garanties matérielles</h3>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                  <div>
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">Garantie Fournisseur Constructeur</div>
                                    <div className="text-xs text-slate-500 mt-1">Couverture des défauts de fabrication</div>
                                  </div>
                                  <div className="text-lg font-bold text-slate-900 dark:text-white">{product.supplierWarrantyMonths} mois</div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                  <div>
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">Garantie Client (Solutions IT)</div>
                                    <div className="text-xs text-slate-500 mt-1">Garantie offerte au client final après installation</div>
                                  </div>
                                  <div className="text-lg font-bold text-slate-900 dark:text-white">{product.clientWarrantyMonths} mois</div>
                                </div>
                            </div>

                            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Statistiques du parc</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10">
                                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">18</div>
                                  <div className="text-[10px] sm:text-xs text-emerald-800 dark:text-emerald-500 uppercase font-semibold mt-1">En cours</div>
                                </div>
                                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-amber-50/50 dark:bg-amber-900/10">
                                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{warrantiesExpiring}</div>
                                  <div className="text-[10px] sm:text-xs text-amber-800 dark:text-amber-500 uppercase font-semibold mt-1">Expirant &lt;30j</div>
                                </div>
                                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                  <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">45</div>
                                  <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-semibold mt-1">Hors garantie</div>
                                </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                             <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                               <FileText className="w-8 h-8 text-slate-400" />
                             </div>
                             <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Documents de garantie</h4>
                             <p className="text-xs text-slate-500 mb-6">Conditions générales et accords fournisseurs liés à ce produit.</p>
                             <button className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors">
                               <Plus className="w-4 h-4" /> Ajouter un PDF
                             </button>
                          </div>
                      </div>
                    </div>
                  )}



                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right SIDEBAR (Fixed panel) */}
        <div className="w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-6 shrink-0 flex flex-col gap-8 hidden lg:flex">
          
          {/* Photo */}
          <div>
            <div className="w-full aspect-square rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4">
              <Box className="w-16 h-16 text-slate-300 dark:text-slate-700" />
            </div>
            <div className="text-center">
              <span className="inline-block bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-700 dark:text-slate-300">
                {product.reference}
              </span>
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-800" />

          {/* Documents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Documents utiles</h3>
            </div>
            
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Fiche technique</div>
                    <div className="text-xs text-slate-500">PDF • 1.2 MB</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Manuel utilisateur</div>
                    <div className="text-xs text-slate-500">PDF • 4.5 MB</div>
                  </div>
                </div>
              </button>
            </div>

            <button className="mt-4 w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors">
              <Plus className="w-4 h-4" />
              Ajouter un document
            </button>
          </div>

        </div>
        </div>
      </div>

      <ProductEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        product={product} 
        onSave={async (updatedProduct) => {
          try {
            const response = await fetch(`/api/products/${product.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedProduct)
            });
            if (response.ok) {
              setProduct(updatedProduct);
            }
          } catch (err) {
            console.error("Error updating product:", err);
          }
        }}
      />

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isArchiveModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden relative z-10"
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                    <Archive className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Archiver le produit</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Voulez-vous vraiment archiver ce produit ? Il ne sera plus proposé dans les nouvelles opérations, mais son historique restera conservé.
                  </p>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsArchiveModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      const archive = {
                        id: `archive-product-${product.id}`,
                        name: product.name,
                        reference: product.reference,
                        type: 'Produit',
                        module: 'Produits',
                        family: 'Référentiel',
                        archivedAt: new Date().toISOString(),
                        archivedBy: 'Admin',
                        reason: 'Produit archivé depuis sa fiche',
                        status: 'Archivé',
                        isRestorable: true,
                        isProtected: false,
                        originalData: product,
                      };
                      const archives = JSON.parse(localStorage.getItem('sit-erp-demo-archives') || '[]');
                      localStorage.setItem(
                        'sit-erp-demo-archives',
                        JSON.stringify([archive, ...archives.filter((item: any) => item.id !== archive.id)])
                      );
                      onArchive?.(product);
                      setIsArchiveModalOpen(false);
                      onBack();
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-lg shadow-sm transition-colors"
                  >
                    Confirmer l'archivage
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isDuplicateChoiceModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden relative z-10"
              >
                 <div className="p-6 pb-2">
                   <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                     <Copy className="w-6 h-6 text-indigo-600 dark:text-indigo-500" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Dupliquer le produit</h3>
                   <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                     {serialNumbersEnabled ? 
                       "Comment souhaitez-vous dupliquer ce produit ? Le stock, les numéros de série et l'historique ne seront pas copiés." :
                       "Comment souhaitez-vous dupliquer ce produit ? Le stock et l'historique ne seront pas copiés."
                     }
                   </p>

                   <div className="space-y-3">
                     <button
                       onClick={() => {
                          setIsDuplicateChoiceModalOpen(false);
                          onBack();
                       }}
                       className="w-full flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all text-left group"
                     >
                       <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 flex items-center justify-center shrink-0 transition-colors">
                         <Copy className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                       </div>
                       <div>
                         <h4 className="font-medium text-slate-900 dark:text-white mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">Dupliquer directement</h4>
                         <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Crée une copie immédiate avec le suffixe -COPY sur la référence.</p>
                       </div>
                     </button>

                     <button
                       onClick={() => {
                          setIsDuplicateChoiceModalOpen(false);
                          setIsDuplicateEditModalOpen(true);
                       }}
                       className="w-full flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all text-left group"
                     >
                       <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 flex items-center justify-center shrink-0 transition-colors">
                         <Edit className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                       </div>
                       <div>
                         <h4 className="font-medium text-slate-900 dark:text-white mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">Modifier avant duplication</h4>
                         <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Ouvre le formulaire pour ajuster les informations avant la création.</p>
                       </div>
                     </button>
                   </div>
                 </div>
                 
                 <div className="px-6 py-4 mt-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                   <button
                     onClick={() => setIsDuplicateChoiceModalOpen(false)}
                     className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
                   >
                     Annuler
                   </button>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <ProductEditModal
        isOpen={isDuplicateEditModalOpen}
        onClose={() => setIsDuplicateEditModalOpen(false)}
        product={product}
        mode="duplicate"
        onSave={async (newProduct) => {
          try {
            const response = await fetch('/api/products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newProduct)
            });
            if (response.ok) {
              setIsDuplicateEditModalOpen(false);
              onBack(); 
            }
          } catch (err) {
            console.error("Error duplicating product:", err);
          }
        }}
      />

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isHistoryModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh]"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Historique des changements
                  </h3>
                </div>

                <div className="p-6 overflow-y-auto">
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 md:ml-4 space-y-8 pb-4">
                    {/* Event item */}
                    <div className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                        <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-2">
                          28/05/2026, 09:42 
                          <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-slate-500">Mouvement</span>
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">4 unités réservées pour Projet Hôtel X</div>
                        <div className="text-xs text-slate-500">Par Technicien Lead (T. Mourad)</div>
                    </div>
                    
                    <div className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                        <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-2">
                          15/03/2026, 14:20
                          <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Réception</span>
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">Entrée en stock: +10 unités (BL-26-0043)</div>
                        <div className="text-xs text-slate-500">Par Magasinier (A. Karim)</div>
                    </div>
                    
                    <div className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-amber-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                        <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-2">
                          01/02/2026, 10:15
                          <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Tarification</span>
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">Modification du prix de vente vers {product.sellingPrice} DA</div>
                        <div className="text-xs text-slate-500">Par Admin Commercial (K. Samia)</div>
                    </div>

                    <div className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-slate-300 dark:bg-slate-700 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                        <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-2">
                          {safeFormatDate(product.createdAt)}, 18:30
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Création</span>
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">Création de la fiche produit</div>
                        <div className="text-xs text-slate-500">Par Admin Système</div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => setIsHistoryModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
