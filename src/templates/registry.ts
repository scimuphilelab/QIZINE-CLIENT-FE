import React, { lazy } from 'react';
import type { QRBoothContext } from '../core/types/order.types';

export interface TemplateProps {
  booth?: QRBoothContext;
}

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  recommendedFor: string;
  component: React.LazyExoticComponent<React.ComponentType<TemplateProps>>;
}

export const TEMPLATE_REGISTRY: Record<string, TemplateMeta> = {
  tpl_default: {
    id: 'tpl_default',
    name: 'Modern List Menu',
    description: 'High-density, smooth list menu with search bar, veg filter switch, circular category carousel, and full item details page',
    recommendedFor: 'Restaurants, Cafés & High-Volume Dining',
    component: lazy(() => import('./tpl_modern_01')),
  },
  tpl_modern_01: {
    id: 'tpl_modern_01',
    name: 'Modern List Menu (Reference Layout)',
    description: 'Modern list layout with circular category carousel, search, veg filter toggle, and full details ordering page',
    recommendedFor: 'Cafés, Casual Dining, Bistros & Modern Food Halls',
    component: lazy(() => import('./tpl_modern_01')),
  },
};

export const DEFAULT_TEMPLATE_ID = 'tpl_modern_01';

export function resolveTemplate(templateId?: string): TemplateMeta {
  if (templateId) {
    const normalized = templateId.toLowerCase().trim();
    if (TEMPLATE_REGISTRY[normalized]) {
      return TEMPLATE_REGISTRY[normalized];
    }
    if (
      normalized === 'tpl_modern_01' ||
      normalized === 'modern_01' ||
      normalized === 'modern' ||
      normalized === 'tpl_default' ||
      normalized === 'default'
    ) {
      return TEMPLATE_REGISTRY.tpl_modern_01;
    }
  }
  return TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_ID];
}
