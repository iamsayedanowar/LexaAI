// Modules
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil } from "lucide-react";

/**
 * Accessible dialogue modal for renaming a conversation.
 * Pre-fills current title, auto-selects text for fast editing,
 * supports Enter to save and Escape/backdrop to cancel.
 */
const RenameModal = ({ isOpen, currentTitle = '', onSave, onCancel }) => {
    const [title, setTitle] = useState(currentTitle);
    const inputRef = useRef(null);

    // Sync input title whenever modal opens or currentTitle changes
    useEffect(() => {
        if (isOpen) {
            setTitle(currentTitle);
            const timer = setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen, currentTitle]);

    // Handle Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onCancel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const trimmed = title.trim();
    const canSave = trimmed.length > 0 && trimmed !== currentTitle.trim();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (canSave) {
            onSave(trimmed);
        } else if (trimmed === currentTitle.trim()) {
            onCancel();
        }
    };

    return createPortal(
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                onClick={onCancel}
                role="presentation"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 6 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="bg-light-surface dark:bg-dark-surface border border-light-outline/20 dark:border-dark-outline/20 rounded-2xl shadow-elevation4 p-6 max-w-sm w-full flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="rename-dialog-title"
                >
                    {/* Icon Badge */}
                    <div className="w-10 h-10 rounded-md bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary flex items-center justify-center mb-3.5">
                        <Pencil className="w-5 h-5" />
                    </div>

                    {/* Dialog Heading */}
                    <h2
                        id="rename-dialog-title"
                        className="text-titleMedium font-semibold text-light-onSurface dark:text-dark-onSurface leading-snug"
                    >
                        Rename chat
                    </h2>

                    {/* Dialog Description */}
                    <p className="text-bodyMedium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1 leading-relaxed">
                        Enter a new title for this conversation.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <input
                                ref={inputRef}
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                                placeholder="Conversation title"
                                className="w-full h-11 px-3.5 rounded-md bg-light-surfaceContainerLow dark:bg-dark-surfaceContainerLow border border-light-outline/25 dark:border-dark-outline/25 text-light-onSurface dark:text-dark-onSurface text-bodyMedium focus:outline-none focus:border-light-primary dark:focus:border-dark-primary focus:ring-1 focus:ring-light-primary dark:focus:ring-dark-primary transition-colors"
                            />
                            <div className="flex justify-end text-[11px] text-light-onSurfaceVariant/50 dark:text-dark-onSurfaceVariant/50">
                                {title.length}/100
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-3.5 py-2 rounded-md text-bodySmall font-medium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!canSave}
                                className="px-4 py-2 rounded-md text-bodySmall font-medium bg-light-primary text-light-onPrimary dark:bg-dark-primary dark:text-dark-onPrimary shadow-subtle hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

RenameModal.propTypes = {
    isOpen: PropTypes.bool,
    currentTitle: PropTypes.string,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default RenameModal;
