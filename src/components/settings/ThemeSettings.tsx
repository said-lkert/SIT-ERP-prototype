import React, { useState, useEffect } from 'react';
import { Check, Type, Layout, Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettings } from './SettingsContext';

export function ThemeSettings() {
  const { accentColor, setAccentColor, showToast, isDarkMode, setIsDarkMode } = useSettings();
  const [fontSize, setFontSize] = useState('default');
  const [sidebarStyle, setSidebarStyle] = useState('expanded');
  const [customHex, setCustomHex] = useState(accentColor);

  useEffect(() => {
     setCustomHex(accentColor);
  }, [accentColor]);

  const swatches = [
    { id: '#4f46e5', name: 'Violet', hex: '#4f46e5', value: 'bg-[#4f46e5]', hover: 'hover:bg-[#4338ca]', active: 'ring-[#4f46e5]', headerBg: 'bg-[#eef2ff]', headerBorder: 'border-[#e0e7ff]' },
    { id: '#f43f5e', name: 'Coral Red', hex: '#f43f5e', value: 'bg-rose-500', hover: 'hover:bg-rose-600', active: 'ring-rose-500', headerBg: 'bg-rose-50', headerBorder: 'border-rose-100' },
    { id: '#2563eb', name: 'Corporate Blue', hex: '#2563eb', value: 'bg-blue-600', hover: 'hover:bg-blue-700', active: 'ring-blue-600', headerBg: 'bg-blue-50', headerBorder: 'border-blue-100' },
    { id: '#10b981', name: 'Modern Green', hex: '#10b981', value: 'bg-emerald-500', hover: 'hover:bg-emerald-600', active: 'ring-emerald-500', headerBg: 'bg-emerald-50', headerBorder: 'border-emerald-100' },
  ];

  const handleColorChange = (hex: string) => {
    setAccentColor(hex);
    showToast('Theme updated successfully.');
  };

  const handleCustomHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const val = e.target.value;
     setCustomHex(val);
     if (/^#?[0-9A-Fa-f]{6}$/.test(val)) {
        const hex = val.startsWith('#') ? val : '#' + val;
        setAccentColor(hex);
        // don't show toast on every keystroke, user is dragging or typing
     }
  };

  const handleCustomColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
     setCustomHex(e.target.value);
     setAccentColor(e.target.value);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Theme & Appearance</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customize the visual style of your workspace.</p>
      </div>

      {/* Colors */}
      <section className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
          Accent Color
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {swatches.map((color) => {
            const isActive = accentColor.toLowerCase() === color.hex.toLowerCase();
            return (
            <button
              key={color.id}
              onClick={() => handleColorChange(color.hex)}
              className={cn(
                "group relative border rounded-xl overflow-hidden text-left transition-all",
                isActive 
                  ? "border-slate-800 dark:border-slate-400 ring-1 ring-slate-800 dark:ring-slate-400 shadow-md scale-[1.02]" 
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
              )}
            >
              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center z-10 shadow-sm">
                  <Check className="w-3 h-3 text-white dark:text-slate-900" />
                </div>
              )}
              
              <div className="h-24 w-full bg-slate-50 dark:bg-slate-900 p-3 pt-6 relative border-b border-slate-100 dark:border-slate-800 flex flex-col justify-end transition-colors">
                {/* Mini Preview UI */}
                <div className="flex gap-2 w-full h-full">
                  {/* Fake Sidebar */}
                  <div className="w-8 h-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded shrink-0 flex flex-col gap-1 p-1 transition-colors">
                    <div className={cn("h-3 w-3 rounded-sm mb-1", color.value)}></div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-sm"></div>
                    <div className={cn("h-1.5 w-full rounded-sm", color.headerBg)}></div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-sm"></div>
                  </div>
                  {/* Fake Content area */}
                  <div className="flex-1 flex flex-col gap-2">
                     <div className="h-4 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded flex items-center px-1 justify-between transition-colors">
                       <div className="h-1 w-8 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
                       <div className={cn("h-2 w-2 rounded-full", color.value)}></div>
                     </div>
                     <div className={cn("flex-1 rounded border", color.headerBg, color.headerBorder)}></div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-950 flex items-center justify-between transition-colors">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{color.name}</span>
                <div className={cn("w-4 h-4 rounded-full border border-black/10 dark:border-white/10", color.value)}></div>
              </div>
            </button>
          )})}
        </div>

        {/* Custom hex picker area stub */}
        <div className="flex items-center gap-4 mt-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 relative transition-colors">
          <input 
             type="color" 
             value={customHex.length === 7 ? customHex : '#000000'}
             onChange={handleCustomColorPicker}
             className="absolute opacity-0 w-8 h-8 cursor-pointer inset-y-0 left-4 top-1/2 -translate-y-1/2 z-10"
             title="Choose custom color"
          />
          <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 shadow-inner" style={{ backgroundColor: accentColor }}></div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom Color</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500">Pick your brand's exact hex code</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-600 font-mono text-sm">#</span>
            <input 
              type="text" 
              value={customHex.replace('#', '')}
              onChange={handleCustomHexChange}
              placeholder="HEX Code" 
              className="w-24 text-sm font-mono border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-slate-400 transition-colors uppercase" 
            />
          </div>
        </div>
      </section>

      {/* Light / Dark Mode */}
      <section className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest transition-colors">Interface Mode</h4>
        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={() => setIsDarkMode(false)}
             className={cn("flex items-center gap-4 p-4 rounded-xl border transition-all", !isDarkMode ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/20 ring-1 ring-indigo-600" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700")}
           >
             <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-500 dark:text-orange-400 flex items-center justify-center shrink-0 transition-colors">
               <Sun className="w-5 h-5" />
             </div>
             <div className="text-left">
               <p className={cn("text-sm font-bold", !isDarkMode ? "text-slate-900 dark:text-white" : "text-slate-900 dark:text-white")}>Light Mode</p>
               <p className="text-xs text-slate-500 dark:text-slate-400">Clean and bright (Default)</p>
             </div>
           </button>
           <button 
             onClick={() => setIsDarkMode(true)}
             className={cn("flex items-center gap-4 p-4 rounded-xl border transition-all", isDarkMode ? "border-indigo-500 bg-slate-900 ring-1 ring-indigo-500" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700")}
           >
             <div className="w-10 h-10 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0 transition-colors">
               <Moon className="w-5 h-5" />
             </div>
             <div className="text-left">
               <p className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-slate-900 dark:text-white")}>Dark Mode</p>
               <p className={cn("text-xs", isDarkMode ? "text-slate-400" : "text-slate-500 dark:text-slate-400")}>Easy on the eyes</p>
             </div>
           </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
         {/* Font Size */}
         <section className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <Type className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Typography Scale
            </h4>
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex flex-col gap-1 transition-colors">
               {['Compact', 'Default', 'Comfortable'].map((size) => (
                  <button 
                     key={size}
                     onClick={() => setFontSize(size.toLowerCase())}
                     className={cn("px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors flex items-center justify-between", fontSize === size.toLowerCase() ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900")}
                  >
                     <span>{size}</span>
                     {fontSize === size.toLowerCase() && <Check className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
                  </button>
               ))}
            </div>
         </section>

         {/* Sidebar Style */}
         <section className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <Layout className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Sidebar Style
            </h4>
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex flex-col gap-1 transition-colors">
               {['Icons Only', 'Icons + Labels', 'Expanded'].map((style) => (
                  <button 
                     key={style}
                     onClick={() => setSidebarStyle(style.toLowerCase())}
                     className={cn("px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors flex items-center justify-between", sidebarStyle === style.toLowerCase() ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900")}
                  >
                     <span>{style}</span>
                     {sidebarStyle === style.toLowerCase() && <Check className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
                  </button>
               ))}
            </div>
         </section>
      </div>
      
    </div>
  );
}
