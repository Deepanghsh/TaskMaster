// src/components/ThemeToggle.jsx

import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            aria-label="Toggle theme"
        >
            {/* If theme is 'dark', show Sun icon (to switch to light mode) */}
            {theme === 'dark' ? (
                <Sun className="w-6 h-6" />
            ) : (
                // If theme is 'light', show Moon icon (to switch to dark mode)
                <Moon className="w-6 h-6" />
            )}
        </button>
    );
}