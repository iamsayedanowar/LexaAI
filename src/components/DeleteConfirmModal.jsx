// Modules
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

/**
 * Modern modal dialog for confirming chat deletion.
 * Traps focus with autofocus on safe action (Cancel)
 * Light-dismiss on backdrop click or Escape key
 */
const DeleteConfirmModal = ({ isOpen, title, onConfirm, onCancel }) => {
    const cancelButtonRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        cancelButtonRef.current?.focus();

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
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="delete-dialog-title"
                    aria-describedby="delete-dialog-desc"
                >
                    {/* Warning Icon Badge */}
                    <div className="w-10 h-10 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mb-3.5">
                        <Trash2 className="w-5 h-5" />
                    </div>

                    {/* Dialog Heading */}
                    <h2 id="delete-dialog-title" className="text-titleMedium font-semibold text-light-onSurface dark:text-dark-onSurface leading-snug">
                        Delete chat?
                    </h2>

                    {/* Dialog Description */}
                    <p id="delete-dialog-desc" className="text-bodyMedium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1.5 leading-relaxed">
                        This will permanently delete <strong className="text-light-onSurface dark:text-dark-onSurface font-semibold">&ldquo;{title || 'this chat'}&rdquo;</strong>. This action cannot be undone.
                    </p>

                    {/* Action Buttons: Cancel and Delete */}
                    <div className="flex items-center justify-end gap-2.5 mt-6">
                        <button
                            ref={cancelButtonRef}
                            type="button"
                            onClick={onCancel}
                            className="px-3.5 py-1.5 rounded-md text-bodySmall font-medium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="px-4 py-1.5 rounded-md text-bodySmall font-medium bg-red-600 hover:bg-red-700 text-white transition-colors shadow-subtle active:scale-95"
                        >
                            Delete
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

DeleteConfirmModal.propTypes = {
    isOpen: PropTypes.bool,
    title: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default DeleteConfirmModal;
