export interface Theme {
    // Backgrounds
    background: string;
    cardBackground: string;
    surfaceBackground: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    // Brand Colors
    primary: string;
    accent: string;

    // Status Colors
    success: string;
    warning: string;
    error: string;
    available: string;
    unavailable: string;

    // UI Elements
    border: string;
    overlay: string;

    // Mode identifier
    isDark: boolean;
}

export const LightTheme: Theme = {
    background: '#F8FAFC',
    cardBackground: '#FFFFFF',
    surfaceBackground: '#F1F5F9',

    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',

    primary: '#4F46E5',
    accent: '#8B5CF6',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    available: '#10B981',
    unavailable: '#94A3B8',

    border: '#E2E8F0',
    overlay: 'rgba(15, 23, 42, 0.5)',

    isDark: false,
};

export const DarkTheme: Theme = {
    background: '#0F172A',
    cardBackground: '#1E293B',
    surfaceBackground: '#334155',

    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',

    primary: '#6366F1',
    accent: '#A78BFA',

    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    available: '#34D399',
    unavailable: '#64748B',

    border: '#334155',
    overlay: 'rgba(0, 0, 0, 0.7)',

    isDark: true,
};

// Legacy export for backward compatibility
export const Colors = LightTheme;
