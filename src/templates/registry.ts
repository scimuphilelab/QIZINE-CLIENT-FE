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
    name: 'Default (User Interface)',
    description: 'High-conversion mobile-first UX with horizontal food cards, sticky category pills and spring cart bar',
    recommendedFor: 'Cafés, Fast Casual & High-Volume QSR',
    component: lazy(() => import('./tpl_default')),
  },
  tpl_modern_01: {
    id: 'tpl_modern_01',
    name: 'Modern 01 (Vintage Warm Burger)',
    description: 'Warm retro parchment & charcoal aesthetic with complete 6-screen flow: Home, Category, Item Detail, Cart, Customization and Confirmation',
    recommendedFor: 'Artisanal Burger Joints, Retro Diners & Cafés',
    component: lazy(() => import('./tpl_modern_01')),
  },
  tpl_modern_02: {
    id: 'tpl_modern_02',
    name: 'Street Bistro',
    description: 'Vibrant quick-pick layout with tactile category pills and energetic styling',
    recommendedFor: 'Food Trucks, Bistros & Casual Street Eats',
    component: lazy(() => import('./tpl_modern_02')),
  },
};

export const DEFAULT_TEMPLATE_ID = 'tpl_default';

export function resolveTemplate(templateId?: string): TemplateMeta {
  if (templateId) {
    if (TEMPLATE_REGISTRY[templateId]) {
      return TEMPLATE_REGISTRY[templateId];
    }
    if (templateId === 'tpl_modern_01') {
      return TEMPLATE_REGISTRY.tpl_modern_01;
    }
    if (templateId === 'tpl_modern_02') {
      return TEMPLATE_REGISTRY.tpl_modern_02;
    }
  }
  return TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_ID];
}
