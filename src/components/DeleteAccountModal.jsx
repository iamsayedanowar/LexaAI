// Modules
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Form } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { CircularProgress } from "./Progress";

const DeleteAccountModalContent = ({ onClose, isSubmitting }) => {
    const [confirmText, setConfirmText] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 50);

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !isSubmitting) {
                e.stopPropagation();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSubmitting, onClose]);

    const isDeleteAllowed = confirmText === 'DELETE';

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => {
                if (!isSubmitting) onClose();
            }}
            role="presentation"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="bg-light-surface dark:bg-dark-surface border border-light-outline/20 dark:border-dark-outline/20 rounded-2xl shadow-elevation4 p-6 max-w-sm w-full flex flex-col"
                // className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-elevation4 p-6 max-w-md w-full flex flex-col"
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-account-title"
                aria-describedby="delete-account-desc"
            >
                {/* Warning Icon Badge */}
                <div className="w-10 h-10 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mb-3.5">
                    <AlertTriangle className="w-5 h-5" />
                </div>

                {/* Dialog Heading */}
                <h2
                    id="delete-account-title"
                    className="text-titleMedium font-semibold text-light-onSurface dark:text-dark-onSurface leading-snug"
                >
                    Delete account?
                </h2>

                {/* Dialog Description */}
                <p
                    id="delete-account-desc"
                    className="text-bodyMedium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1.5 leading-relaxed"
                >
                    This will permanently delete your account, active session, and all conversation history. This action cannot be undone.
                </p>

                {/* Form for Confirmation */}
                <Form method="POST" className="flex flex-col gap-4 mt-5">
                    <input type="hidden" name="request_type" value="delete_account" />

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="modal-delete-confirm-field"
                            className="text-bodySmall font-medium text-light-onSurface dark:text-dark-onSurface select-none"
                        >
                            Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm permanent deletion
                        </label>
                        <input
                            ref={inputRef}
                            id="modal-delete-confirm-field"
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="DELETE"
                            disabled={isSubmitting}
                            autoComplete="off"
                            className="w-full h-11 px-3.5 rounded-md bg-light-surfaceContainerLow dark:bg-dark-surfaceContainerLow border border-light-outline/25 dark:border-dark-outline/25 text-light-onSurface dark:text-dark-onSurface text-bodyMedium focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                        />
                    </div>

                    {/* Action Buttons: Cancel and Delete */}
                    <div className="flex items-center justify-end gap-2.5 mt-2">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={onClose}
                            className="px-4 py-2 rounded-md text-bodySmall font-medium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isDeleteAllowed || isSubmitting}
                            className="px-4 py-2 rounded-md text-bodySmall font-medium bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-subtle active:scale-95 flex items-center justify-center gap-1.5"
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress size="small" />
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                'Confirm delete'
                            )}
                        </button>
                    </div>
                </Form>
            </motion.div>
        </div>
    );
};

DeleteAccountModalContent.propTypes = {
    onClose: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool
};

/**
 * Accessible popup dialogue modal for confirming permanent account deletion.
 * Traps focus, supports Escape light-dismiss, and requires typing 'DELETE'.
 */
const DeleteAccountModal = ({ isOpen, onClose, isSubmitting }) => {
    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <DeleteAccountModalContent onClose={onClose} isSubmitting={isSubmitting} />
        </AnimatePresence>,
        document.body
    );
};

DeleteAccountModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool
};

export default DeleteAccountModal;
