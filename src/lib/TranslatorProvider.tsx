import React, { useEffect, useRef } from 'react';
import translations from '../translations.json';
import { useSettings } from '../components/settings/SettingsContext';

export function TranslatorProvider({ children }: { children: React.ReactNode }) {
  const { language } = useSettings();
  const langRef = useRef(language);

  useEffect(() => {
    langRef.current = language;
    
    // We only observe `#root`
    const rootEl = document.getElementById('root');
    if (!rootEl) return;

    let isTranslating = false;

    const translateNode = (node: Node) => {
      const currentLang = langRef.current;
      
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        if (!parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') return;
        
        let original = (node as any)._originalText;
        if (original === undefined) {
           original = node.nodeValue || '';
           (node as any)._originalText = original;
        }
        
        const trimmed = original.trim();
        let newText = original;
        
        if (trimmed && currentLang !== 'en') {
           const dict = (translations as any)[trimmed];
           if (dict && dict[currentLang]) {
              newText = original.replace(trimmed, dict[currentLang]);
           }
        }
        
        if (node.nodeValue !== newText) {
            node.nodeValue = newText;
        }
      } 
      else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
           const input = el as HTMLInputElement;
           let origPlaceholder = (input as any)._originalPlaceholder;
           if (origPlaceholder === undefined) {
               origPlaceholder = input.getAttribute('placeholder') || '';
               (input as any)._originalPlaceholder = origPlaceholder;
           }
           
           if (origPlaceholder) {
               const trimmedP = origPlaceholder.trim();
               let newP = origPlaceholder;
               if (trimmedP && currentLang !== 'en') {
                   const dict = (translations as any)[trimmedP];
                   if (dict && dict[currentLang]) {
                       newP = origPlaceholder.replace(trimmedP, dict[currentLang]);
                   }
               }
               if (input.getAttribute('placeholder') !== newP) {
                   input.setAttribute('placeholder', newP);
               }
           }
        }
        node.childNodes.forEach(translateNode);
      }
    };

    const observer = new MutationObserver((mutations) => {
      if (isTranslating) return;
      isTranslating = true;
      try {
          mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach(node => translateNode(node));
            } else if (mutation.type === 'characterData') {
               const node = mutation.target;
               const original = (node as any)._originalText;
               // If React set it to something new, update original
               if (node.nodeValue !== original && node.nodeValue !== undefined) {
                   const currentLang = langRef.current;
                   let isOurTranslation = false;
                   if (currentLang !== 'en' && original) {
                       const dict = (translations as any)[original.trim()];
                       if (dict && dict[currentLang]) {
                           const expectedNodeValue = original.replace(original.trim(), dict[currentLang]);
                           if (node.nodeValue === expectedNodeValue) isOurTranslation = true;
                       }
                   }
                   if (!isOurTranslation) {
                       (node as any)._originalText = node.nodeValue;
                   }
               }
               translateNode(node);
            } else if (mutation.type === 'attributes') {
               translateNode(mutation.target);
            }
          });
      } finally {
          isTranslating = false;
      }
    });

    isTranslating = true;
    rootEl.childNodes.forEach(translateNode);
    isTranslating = false;

    observer.observe(rootEl, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder']
    });

    // When language changes, we re-translate existing DOM
    return () => observer.disconnect();
  }, [language]);

  return <>{children}</>;
}
