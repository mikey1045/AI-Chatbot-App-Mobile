// VIA AI - Design System Colors
// Dark Mode Theme inspired by Perplexity Pro

const DarkTheme = {
    // Background Colors
    background: '#0F0F0F',      // Nền tối sâu
    surface: '#1A1A1A',         // Nền card/bubble AI
    surfaceHover: '#252525',    // Hover state

    // Primary (Accent)
    primary: '#10B981',         // Teal - màu chủ đạo
    primaryLight: '#34D399',    // Lighter teal for hover
    primaryDark: '#059669',     // Darker teal

    // Text Colors
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',

    // Border & Dividers
    border: '#262626',
    borderLight: '#374151',

    // Status Colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',

    // User message bubble
    userBubble: '#10B981',
    userBubbleText: '#FFFFFF',

    // AI message bubble
    aiBubble: '#1A1A1A',
    aiBubbleText: '#FFFFFF',
};

const LightTheme = {
    // Background Colors
    background: '#F9FAFB',      // Light gray background
    surface: '#FFFFFF',         // White surface
    surfaceHover: '#F3F4F6',    // Light hover state

    // Primary (Accent)
    primary: '#10B981',         // Keep same brand teal
    primaryLight: '#34D399',
    primaryDark: '#059669',

    // Text Colors
    textPrimary: '#111827',     // Deep gray/black
    textSecondary: '#4B5563',   // Medium gray
    textMuted: '#9CA3AF',      // Light gray

    // Border & Dividers
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Status Colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',

    // User message bubble
    userBubble: '#10B981',
    userBubbleText: '#FFFFFF',

    // AI message bubble
    aiBubble: '#E5E7EB',
    aiBubbleText: '#111827',
};

export const Colors = DarkTheme; // Default, but we'll use Context
export { DarkTheme, LightTheme };

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};

export const FontSizes = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};
