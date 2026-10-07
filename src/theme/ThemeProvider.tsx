import React, { useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import type { DesignConfig } from '../core/types/menu.types';

export interface ThemeProviderProps {
  children: React.ReactNode;
  designConfig?: DesignConfig;
  isDark?: boolean;
}

const FONT_MAP: Record<string, string> = {
  inter: "'Inter', sans-serif",
  playfair_display: "'Playfair Display', serif",
  outfit: "'Outfit', sans-serif",
  plus_jakarta_sans: "'Plus Jakarta Sans', sans-serif",
  space_grotesk: "'Space Grotesk', sans-serif",
  roboto: "'Roboto', sans-serif",
  poppins: "'Poppins', sans-serif",
};

/**
 * Loads font from Google Fonts dynamically if requested
 */
function dynamicallyLoadGoogleFont(fontName: string) {
  if (!fontName) return;
  const normalized = fontName.trim().replace(/_/g, '+');
  const id = `gfont-${normalized.toLowerCase()}`;

  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      normalized
    )}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  designConfig,
  isDark = false,
}) => {
  useEffect(() => {
    if (!designConfig) return;

    const { colors, fonts } = designConfig;
    const root = document.documentElement;

    // Apply color CSS variables
    if (colors.primary) root.style.setProperty('--color-primary', colors.primary);
    if (colors.secondary) root.style.setProperty('--color-secondary', colors.secondary);
    if (colors.accent) root.style.setProperty('--color-accent', colors.accent);
    if (colors.background) {
      root.style.setProperty('--color-background', colors.background);
      root.style.setProperty('--color-bg', colors.background);
    }
    if (colors.surface) root.style.setProperty('--color-surface', colors.surface);
    if (colors.text) root.style.setProperty('--color-text', colors.text);
    if (colors.text_muted) {
      root.style.setProperty('--color-text-muted', colors.text_muted);
      root.style.setProperty('--color-muted', colors.text_muted);
    }

    // Apply and dynamically load fonts
    if (fonts?.heading) {
      const headingFont = FONT_MAP[fonts.heading] || `'${fonts.heading}', sans-serif`;
      root.style.setProperty('--font-heading', headingFont);
      dynamicallyLoadGoogleFont(fonts.heading);
    }

    if (fonts?.body) {
      const bodyFont = FONT_MAP[fonts.body] || `'${fonts.body}', sans-serif`;
      root.style.setProperty('--font-body', bodyFont);
      dynamicallyLoadGoogleFont(fonts.body);
    }
  }, [designConfig]);

  // Ant Design dynamic tokens synchronized with Qizine design config
  const primaryColor = designConfig?.colors?.primary || '#1F3D2B';
  const textColor = designConfig?.colors?.text || '#1A1A1A';
  const surfaceColor = designConfig?.colors?.surface || '#FFFFFF';

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: primaryColor,
          colorTextBase: textColor,
          colorBgBase: surfaceColor,
          fontFamily: designConfig?.fonts?.body ? FONT_MAP[designConfig.fonts.body] || 'inherit' : 'inherit',
          borderRadius: 12,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};
