import React from 'react';
import { motion } from 'framer-motion';

const InteractiveBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-dark">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            {/* Animated Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal dark:bg-primary/10"
            />

            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, -30, 0],
                    y: [0, 50, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-300/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal dark:bg-sky-900/10"
            />

            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, 40, 0],
                    y: [0, -40, 0],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-normal dark:bg-indigo-900/10"
            />
        </div>
    );
};

export default InteractiveBackground;
