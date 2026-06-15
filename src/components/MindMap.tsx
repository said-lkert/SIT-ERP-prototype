import { motion } from 'motion/react';
import { ALL_MODULES } from '../data/modules';
import { Hexagon } from 'lucide-react';
import { cn } from '../lib/utils';
import { ActiveEcosystemComponent } from './ActiveEcosystemComponent';

import { AppTab } from '../types';

interface MindMapProps {
  activeModuleIds: string[];
  onTabChange?: (tab: AppTab) => void;
}

export function MindMap({ activeModuleIds, onTabChange }: MindMapProps) {
  const activeModules = ALL_MODULES.filter(m => activeModuleIds.includes(m.id));
  const N = activeModules.length;

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Active Ecosystem</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Your personalized enterprise resource network.</p>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center min-h-[600px] border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 shadow-sm transition-colors">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        
        <div className="relative w-full h-full">
          {/* Connection Lines via SVG overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            {activeModules.map((m, i) => {
              const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
              const radiusScale = N > 8 ? 38 : Math.min(30 + N*0.5, 40); 
              const xPct = 50 + Math.cos(angle) * radiusScale;
              const yPct = 50 + Math.sin(angle) * radiusScale;
               
              const isEven = i % 2 === 0;
              const curveOffset = isEven ? 0.6 : -0.6;
              const cp1x = 50 + Math.cos(angle + curveOffset) * (radiusScale * 0.3);
              const cp1y = 50 + Math.sin(angle + curveOffset) * (radiusScale * 0.3);
              const cp2x = 50 + Math.cos(angle - curveOffset) * (radiusScale * 0.7);
              const cp2y = 50 + Math.sin(angle - curveOffset) * (radiusScale * 0.7);

              return (
                <path
                  key={`line-${m.id}`}
                  d={`M 50 50 C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${xPct} ${yPct}`}
                  className="fill-none stroke-slate-200 dark:stroke-slate-800 transition-all duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {/* Orbiting Modules */}
          <div className="absolute inset-0 z-10">
            {activeModules.map((module, i) => {
              const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
              const radiusScale = N > 8 ? 38 : Math.min(30 + N*0.5, 40); 
              const xPct = 50 + Math.cos(angle) * radiusScale;
              const yPct = 50 + Math.sin(angle) * radiusScale;
              const Icon = module.icon;

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, scale: 0.8, left: '50%', top: '50%' }}
                  animate={{ opacity: 1, scale: 1, left: `${xPct}%`, top: `${yPct}%` }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 25, 
                    mass: 1,
                    delay: i * 0.05
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                >
                  <ActiveEcosystemComponent onClick={() => onTabChange?.(module.id as AppTab)}>
                    <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 flex flex-col items-center gap-2 hover:border-indigo-400 dark:hover:border-indigo-700 transition-colors group w-[140px]">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-center w-full">
                        <h3 className="font-bold text-[11px] text-slate-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors leading-tight truncate">{module.name}</h3>
                        <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mt-1">{module.category}</p>
                      </div>
                    </div>
                  </ActiveEcosystemComponent>
                </motion.div>
              );
            })}
          </div>
        </div>


        {/* Central Hub Node */}
        <div className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [1, 1.02, 1], opacity: 1 }}
            transition={{ 
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.5 }
            }}
            className="relative"
          >
            <div className="w-32 h-32 bg-indigo-600 rounded-full flex flex-col items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 relative z-10 border-4 border-white dark:border-slate-950 transition-colors">
              <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Root</p>
              <p className="text-sm font-bold text-center leading-tight">SIT<br/>ERP</p>
            </div>
          </motion.div>
        </div>

        {activeModules.length === 0 && (
          <div className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 mt-32 whitespace-nowrap">
            <p className="text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-6 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-sm transition-colors">
              Your ecosystem is empty. Head to the <strong className="text-slate-700 dark:text-slate-300 font-bold">Module Store</strong> to activate capabilities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
