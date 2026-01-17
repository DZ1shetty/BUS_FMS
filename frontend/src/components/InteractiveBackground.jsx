import React from 'react';
import { motion } from 'framer-motion';

const InteractiveBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
            {/* CSS Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808035_1px,transparent_1px),linear-gradient(to_bottom,#80808035_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            {/* Radial Gradient Overlay for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(255,255,255,0.1),transparent)] dark:bg-[radial-gradient(circle_800px_at_100%_200px,rgba(29,78,216,0.15),transparent)]"></div>

            {/* Animated Blobs - Enhanced Visibility */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen dark:bg-blue-600/20"
            />

            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, -30, 0],
                    y: [0, 50, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-400/30 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen dark:bg-purple-600/20"
            />

            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, 40, 0],
                    y: [0, -40, 0],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300/30 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen dark:bg-indigo-600/20"
            />
        </div>
    );
};

export default InteractiveBackground;
