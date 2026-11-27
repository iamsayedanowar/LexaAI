// Modules
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import PropTypes from 'prop-types';

const THEME_OPTIONS = [
    {
        id: 'light',
        label: 'Light',
        icon: Sun
    },
    {
        id: 'dark',
        label: 'Dark',
        icon: Moon
    },
    {
        id: 'system',
        label: 'System',
        icon: Monitor
    }
];

const ThemeToggle = ({ classes = '', showLabel = false }) => {
    const { theme, resolvedTheme, systemPrefersDark, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const CurrentIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

    return (
        <div className={`relative inline-flex items-center ${classes}`} ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:text-light-onSurface dark:hover:text-dark-onSurface hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest active:scale-95 transition-all"
                title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
                aria-label="Toggle theme"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <CurrentIcon className="w-4 h-4" />
                {showLabel && (
                    <span className="ms-2 text-bodySmall font-medium capitalize">
                        {theme}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full mt-1.5 z-50 w-44 bg-light-surface dark:bg-dark-surface border border-light-outline/15 dark:border-dark-outline/15 rounded-xl shadow-elevation3 py-1 flex flex-col overflow-hidden"
                        role="menu"
                    >
                        <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-light-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60">
                            Theme
                        </div>
                        {THEME_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = theme === opt.id;
                            const systemDetail = opt.id === 'system' ? (systemPrefersDark ? 'Dark' : 'Light') : null;

                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setTheme(opt.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest text-bodySmall font-medium transition-colors ${
                                        isSelected
                                            ? 'text-light-primary dark:text-dark-primary font-semibold'
                                            : 'text-light-onSurface dark:text-dark-onSurface'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon className="w-4 h-4 shrink-0" />
                                        <span>{opt.label}</span>
                                        {systemDetail && (
                                            <span className="text-[10px] opacity-60 font-normal">
                                                ({systemDetail})
                                            </span>
                                        )}
                                    </div>
                                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-light-primary dark:text-dark-primary" />}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

ThemeToggle.propTypes = {
    classes: PropTypes.string,
    showLabel: PropTypes.bool
};

export default ThemeToggle;
