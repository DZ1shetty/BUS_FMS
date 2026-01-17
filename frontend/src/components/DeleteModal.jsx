import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X } from 'lucide-react';

const DeleteModal = ({ isOpen, onClose, onConfirm, title = "Confirm Deletion", message = "Are you sure you want to delete this record? This action cannot be undone." }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white dark:bg-dark-surface w-full max-w-md rounded-2xl shadow-2xl relative z-70 overflow-hidden border border-red-100 dark:border-red-900/30"
                    >
                        {/* Header with gradient for warning effect */}
                        <div className="bg-red-50 dark:bg-red-900/10 px-6 py-8 flex flex-col items-center justify-center text-center border-b border-red-100 dark:border-red-900/20">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.1 }}
                                className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-inner"
                            >
                                <Trash2 size={32} strokeWidth={1.5} />
                            </motion.div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[80%]">{message}</p>
                        </div>

                        {/* Buttons */}
                        <div className="p-6 grid grid-cols-2 gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Delete It</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DeleteModal;
