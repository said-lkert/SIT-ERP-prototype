import { ElementType } from 'react';

export type AppTab = 'mindmap' | 'store' | 'report' | 'emplacements' | string;

export interface ModuleFamily {
  id: string;
  name: string;
  description: string;
  icon?: ElementType;
}

export interface ERPModule {
  id: string;
  name: string;
  description: string;
  icon: ElementType;
  category: string; 
  familyId?: string;
}
