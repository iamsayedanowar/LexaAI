// Modules
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Form } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { CircularProgress } from "./Progress";

const DeleteAllChatsModal = ({ isOpen, onClose, isSubmitting }) => {
    const cancelButtonRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        cancelButtonRef.current?.focus();

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !isSubmitting) {
                e.stopPropagation();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                onClick={() => {
                    if (!isSubmitting) onClose();
                }}
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
                    aria-labelledby="delete-all-chats-title"
                    aria-describedby="delete-all-chats-desc"
                >
                    {/* Warning Icon Badge */}
                    <div className="w-10 h-10 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mb-3.5">
                        <Trash2 className="w-5 h-5" />
                    </div>

                    {/* Dialog Heading */}
                    <h2
                        id="delete-all-chats-title"
                        className="text-titleMedium font-semibold text-light-onSurface dark:text-dark-onSurface leading-snug"
                    >
                        Delete all chats?
                    </h2>

                    {/* Dialog Description */}
                    <p
                        id="delete-all-chats-desc"
                        className="text-bodyMedium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1.5 leading-relaxed"
                    >
                        This will permanently delete all your conversation history and message records at once. This action cannot be undone.
                    </p>

                    {/* Action Form */}
                    <Form method="POST" className="flex items-center justify-end gap-2.5 mt-6">
                        <input type="hidden" name="request_type" value="delete_all_chats" />

                        <button
                            ref={cancelButtonRef}
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="h-9 px-4 rounded-md border border-light-outline/25 dark:border-dark-outline/25 text-light-onSurface dark:text-dark-onSurface hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest font-medium text-bodySmall transition-colors disabled:opacity-40"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-9 px-4 rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium text-bodySmall transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-subtle"
                        >
                            {isSubmitting ? (
                                <CircularProgress size="small" />
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete all</span>
                                </>
                            )}
                        </button>
                    </Form>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

DeleteAllChatsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool
};

export default DeleteAllChatsModal;
