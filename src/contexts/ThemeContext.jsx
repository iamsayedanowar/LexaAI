// Modules
import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

const THEME_STORAGE_KEY = 'lexaai_theme';

const initialContext = {
    theme: 'system', // 'light' | 'dark' | 'system'
    resolvedTheme: 'light', // 'light' | 'dark'
    systemPrefersDark: false,
    setTheme: () => { }
};

export const ThemeContext = createContext(initialContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        try {
            const saved = localStorage.getItem(THEME_STORAGE_KEY);
            return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
        } catch {
            return 'system';
        }
    });

    const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Listen to system OS color scheme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            setSystemPrefersDark(e.matches);
        };

        setSystemPrefersDark(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Listen for storage events across tabs
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === THEME_STORAGE_KEY && e.newValue) {
                if (['light', 'dark', 'system'].includes(e.newValue)) {
                    setThemeState(e.newValue);
                }
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Resolved theme currently rendered
    const resolvedTheme = useMemo(() => {
        if (theme === 'dark') return 'dark';
        if (theme === 'light') return 'light';
        return systemPrefersDark ? 'dark' : 'light';
    }, [theme, systemPrefersDark]);

    // Apply class, attribute, and color-scheme to documentElement and body
    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;

        if (resolvedTheme === 'dark') {
            root.classList.add('dark');
            root.setAttribute('data-theme', 'dark');
            if (body) body.classList.add('dark');
        } else {
            root.classList.remove('dark');
            root.setAttribute('data-theme', 'light');
            if (body) body.classList.remove('dark');
        }

        const meta = document.querySelector('meta[name="color-scheme"]');
        if (meta) {
            meta.content = theme === 'system' ? 'light dark' : theme;
        }
    }, [resolvedTheme, theme]);

    const setTheme = useCallback((newTheme) => {
        if (!['light', 'dark', 'system'].includes(newTheme)) return;
        setThemeState(newTheme);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        } catch (e) {
            console.error('Failed to save theme to localStorage:', e);
        }
    }, []);

    const contextValue = useMemo(() => ({
        theme,
        resolvedTheme,
        systemPrefersDark,
        setTheme
    }), [theme, resolvedTheme, systemPrefersDark, setTheme]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

ThemeProvider.propTypes = {
    children: PropTypes.node
};

export default ThemeProvider;
