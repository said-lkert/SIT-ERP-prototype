import React from 'react';
import { Package, AlertCircle, UserX, ShieldAlert } from 'lucide-react';
import { Besoin } from './types';
import { cn } from '../../lib/utils';
import { useModules } from '../../contexts/ModuleContext';

interface BesoinsKPIsProps {
  besoins: Besoin[];
}

export function BesoinsKPIs({ besoins }: BesoinsKPIsProps) {
  const { isModuleEnabled } = useModules();
  
  const stats = {
    actifs: besoins.filter(b => ['À valider', 'Validé', 'Partiellement couvert'].includes(b.status)).length,
    manquants: besoins.filter(b => b.products.some(p => p.missingQty > 0)).length,
    nonAffectes: besoins.filter(b => b.services.some(s => !s.assignedResource)).length,
    bloques: besoins.filter(b => b.status === 'Bloqué').length,
  };

  const cards = [
    {
      id: 'actifs',
      label: 'Besoins actifs',
      value: stats.actifs,
      icon: Package,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
      borderColor: 'border-indigo-100 dark:border-indigo-800/30',
      hoverBorder: 'hover:border-indigo-200 dark:hover:border-indigo-800/50',
      desc: 'En attente ou encours'
    },
    {
      id: 'manquants',
      label: 'Produits manquants',
      value: stats.manquants,
      icon: AlertCircle,
      color: stats.manquants > 0 ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
      borderColor: stats.manquants > 0 ? 'border-amber-100 dark:border-amber-800/30' : 'border-slate-100 dark:border-slate-800/30',
      hoverBorder: stats.manquants > 0 ? 'hover:border-amber-200 dark:hover:border-amber-800/50' : 'hover:border-slate-200 dark:hover:border-slate-700',
      desc: 'Rupture ou stock insuffisant'
    },
    ...(isModuleEnabled('services') ? [{
      id: 'services',
      label: 'Services non affectés',
      value: stats.nonAffectes,
      icon: UserX,
      color: stats.nonAffectes > 0 ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
      borderColor: stats.nonAffectes > 0 ? 'border-orange-100 dark:border-orange-800/30' : 'border-slate-100 dark:border-slate-800/30',
      hoverBorder: stats.nonAffectes > 0 ? 'hover:border-orange-200 dark:hover:border-orange-800/50' : 'hover:border-slate-200 dark:hover:border-slate-700',
      desc: 'Intervenants à planifier'
    }] : []),
    {
      id: 'bloques',
      label: 'Projets bloqués',
      value: stats.bloques,
      icon: ShieldAlert,
      color: stats.bloques > 0 ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
      borderColor: stats.bloques > 0 ? 'border-red-100 dark:border-red-800/30' : 'border-slate-100 dark:border-slate-800/30',
      hoverBorder: stats.bloques > 0 ? 'hover:border-red-200 dark:hover:border-red-800/50' : 'hover:border-slate-200 dark:hover:border-slate-700',
      desc: 'Action critique requise'
    }
  ];

  return (
    <div className={cn("grid gap-6", isModuleEnabled('services') ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3")}>
      {cards.map((card) => (
        <div key={card.id} className={`group bg-white dark:bg-slate-900 rounded-2xl p-6 border ${card.borderColor} shadow-sm transition-all ${card.hoverBorder} flex flex-col gap-2 cursor-default`}>
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mb-1 transition-all", card.color)}>
            <card.icon className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{card.label}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{card.value}</span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 normal-case tracking-normal">{card.desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
