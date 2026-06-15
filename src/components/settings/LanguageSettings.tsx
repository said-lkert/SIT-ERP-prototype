import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';
import { useSettings } from './SettingsContext';

type Language = 'en' | 'fr' | 'ar' | 'es' | 'de' | 'it' | 'pt';

export function LanguageSettings() {
  const { language, setLanguage, showToast } = useSettings();

  const languages: {id: Language, name: string, region: string, flag: string, dir?: string}[] = [
    { id: 'en', name: 'English', region: 'US', flag: '🇺🇸' },
    { id: 'fr', name: 'Français', region: 'FR', flag: '🇫🇷' },
    { id: 'es', name: 'Español', region: 'ES', flag: '🇪🇸' },
    { id: 'de', name: 'Deutsch', region: 'DE', flag: '🇩🇪' },
    { id: 'it', name: 'Italiano', region: 'IT', flag: '🇮🇹' },
    { id: 'pt', name: 'Português', region: 'BR', flag: '🇧🇷' },
    { id: 'ar', name: 'العربية', region: 'SA', flag: '🇸🇦', dir: 'rtl' },
  ];

  const confirmations: Record<Language, string> = {
    en: "Language updated successfully.",
    fr: "Langue mise à jour avec succès.",
    ar: "تم تحديث اللغة بنجاح.",
    es: "Idioma actualizado con éxito.",
    de: "Sprache erfolgreich aktualisiert.",
    it: "Lingua aggiornata con successo.",
    pt: "Idioma atualizado com sucesso."
  };

  const handleLanguageChange = (langId: Language) => {
    setLanguage(langId);
    showToast(confirmations[langId] || confirmations.en);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Language & Region</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage local formats and system language.</p>
      </div>

      <section className="space-y-4">
         <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Interface Language</h4>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
           {languages.map(lang => (
             <button
               key={lang.id}
               onClick={() => handleLanguageChange(lang.id)}
               className={cn(
                 "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                 language === lang.id 
                   ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500 shadow-sm" 
                   : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
               )}
             >
                <div className="flex items-center gap-3">
                   <span className="text-2xl" aria-hidden="true">{lang.flag}</span>
                   <div>
                     <p className={cn("text-sm font-bold", language === lang.id ? "text-indigo-900" : "text-slate-900")}>{lang.name}</p>
                   </div>
                </div>
                {language === lang.id && <Check className="w-5 h-5 text-indigo-600" />}
             </button>
           ))}
         </div>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-sm">
         <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 pb-3">Formatting Defaults</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Number Format</label>
               <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none">
                  <option value="us">1,000.00</option>
                  <option value="eu">1.000,00</option>
                  <option value="fr">1 000,00</option>
               </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date Format</label>
               <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none">
                  <option value="MDY">MM/DD/YYYY</option>
                  <option value="DMY">DD/MM/YYYY</option>
                  <option value="YMD">YYYY-MM-DD</option>
               </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">First Day of Week</label>
               <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none">
                  <option value="mon">Monday</option>
                  <option value="sun">Sunday</option>
               </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Currency Position</label>
               <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none">
                  <option value="before">$ 1,000.00 (Before amount)</option>
                  <option value="after">1,000.00 $ (After amount)</option>
               </select>
            </div>
         </div>
      </section>

    </div>
  );
}
