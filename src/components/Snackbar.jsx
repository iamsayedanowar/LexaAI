// Modules

import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const Snackbar = ({ snackbar }) => {
    const snackbarVariant = {
        hidden: {
            scaleY: 0,
        },
        visible: {
            scaleY: 1,
            transition: {
                duration: 0.2,
                ease: [0.05, 0.7, 0.1, 1]
            }
        }
    };
    const snackbarChildVariant = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
        }
    };

    const renderIcon = () => {
        if (snackbar.type === 'error') {
            return <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mr-2" />;
        }
        if (snackbar.type === 'info') {
            return <Info className="w-4 h-4 text-light-primary dark:text-dark-primary shrink-0 mr-2" />;
        }
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mr-2" />;
    };

    return (
        <AnimatePresence>
            {snackbar.open && (
                <motion.div exit={{ opacity: 0, transition: { duration: 0.15, ease: 'easeOut' } }} variants={snackbarVariant} initial='hidden' animate='visible' className={`snackbar ${snackbar.type || ''}`}>
                    <motion.div variants={snackbarChildVariant} transition={{ duration: 0.2, delay: 0.1, ease: 'easeOut' }} className="flex items-center">
                        {renderIcon()}
                        <span>{snackbar.message}</span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

Snackbar.propTypes = {
    snackbar: PropTypes.object
};

export default Snackbar;