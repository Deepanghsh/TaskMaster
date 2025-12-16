import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, gradient, delay, icon: Icon }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: delay }}
            className={`p-6 ${gradient} rounded-2xl shadow-2xl text-white 
                        transform hover:scale-[1.03] transition-transform duration-300 
                        cursor-pointer overflow-hidden relative`}
        >
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
                    <p className="text-4xl font-extrabold">{value}</p>
                </div>
                {Icon && <Icon className="w-8 h-8 opacity-50 flex-shrink-0" />}
            </div>
            <div className="absolute inset-0 opacity-10 bg-white dark:bg-black rounded-2xl"></div>
        </motion.div>
    );
};

export default StatCard;