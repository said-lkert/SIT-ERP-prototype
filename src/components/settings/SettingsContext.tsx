import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { flushSync } from 'react-dom';

type Language = 'en' | 'fr' | 'ar' | 'es' | 'de' | 'it' | 'pt';

interface ToastMessage {
  id: number;
  message: string;
}

interface SettingsContextType {
  accentColor: string;
  setAccentColor: (color: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  showToast: (message: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// HSL utilities for generating theme shades
function hexToHSL(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [accentColor, setAccentColorState] = useState(() => {
    return localStorage.getItem('accentColor') || '#4f46e5'; 
  });
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });
  const [isDarkMode, setIsDarkModeState] = useState(() => {
    return localStorage.getItem('erp_dark') === 'true';
  });
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
  };
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setIsDarkMode = (isDark: boolean) => {
    const updateDOM = () => {
      setIsDarkModeState(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('erp_dark', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('erp_dark', 'false');
      }
    };

    if (!document.startViewTransition) {
      updateDOM();
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => {
        updateDOM();
      });
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Apply accent color using CSS variables
  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    
    // Generate shades based on the picked color
    const { h, s, l } = hexToHSL(accentColor);
    
    const root = document.documentElement;
    const l600 = l;
    
    root.style.setProperty('--accent-50', `hsl(${h}, ${s}%, 96%)`);
    root.style.setProperty('--accent-100', `hsl(${h}, ${s}%, 90%)`);
    root.style.setProperty('--accent-200', `hsl(${h}, ${s}%, 80%)`);
    root.style.setProperty('--accent-300', `hsl(${h}, ${s}%, 70%)`);
    root.style.setProperty('--accent-400', `hsl(${h}, ${s}%, 60%)`);
    root.style.setProperty('--accent-500', `hsl(${h}, ${s}%, ${Math.min(100, l600 + 10)}%)`);
    root.style.setProperty('--accent-600', `hsl(${h}, ${s}%, ${l600}%)`);
    root.style.setProperty('--accent-700', `hsl(${h}, ${s}%, ${Math.max(0, l600 - 10)}%)`);
    root.style.setProperty('--accent-800', `hsl(${h}, ${s}%, ${Math.max(0, l600 - 20)}%)`);
    root.style.setProperty('--accent-900', `hsl(${h}, ${s}%, ${Math.max(0, l600 - 30)}%)`);
    
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('language', language);
    const root = document.documentElement;
    if (language === 'ar') {
      root.dir = 'rtl';
    } else {
      root.dir = 'ltr';
    }
  }, [language]);

  return (
    <SettingsContext.Provider value={{ accentColor, setAccentColor, language, setLanguage, showToast, isDarkMode, setIsDarkMode }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl shadow-slate-900/10 text-sm font-medium animate-in slide-in-from-bottom-2 fade-in duration-300 pointer-events-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            {toast.message}
          </div>
        ))}
      </div>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
