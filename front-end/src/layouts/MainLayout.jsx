import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Home, ListChecks, TrendingUp, Archive, Settings, LogOut, Menu, X, Sun, Moon, CalendarDays, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import NotificationCenter from '../components/NotificationCenter';
import ToastContainer from '../components/ToastContainer'; // ✅ NEW
import { motion } from 'framer-motion';

const NavItem = ({ to, icon: Icon, name, onLinkClick }) => (
    <NavLink
        to={to}
        onClick={onLinkClick}
        className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
             ${isActive
                ? 'bg-indigo-600 text-white shadow-lg transform scale-[1.02] hover:bg-indigo-700'
                : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700'
            }`
        }
    >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{name}</span>
    </NavLink>
);

export default function MainLayout() {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme(); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const userName = user?.name || "User"; 
    const profileInitial = userName[0].toUpperCase();

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Format date and time
    const formatDate = () => {
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        return currentTime.toLocaleDateString('en-US', options);
    };

    const formatTime = () => {
        return currentTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: Home },
        { name: 'Upcoming', path: '/upcoming', icon: Clock },
        { name: 'Completed', path: '/completed', icon: CheckCircle2 },
        { name: 'Calendar', path: '/calendar', icon: CalendarDays }, 
        { name: 'Categories', path: '/categories', icon: ListChecks },
        { name: 'Analysis', path: '/analysis', icon: TrendingUp },
        { name: 'Archived', path: '/archived', icon: Archive },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors w-full"> 
            
            {/* Toast Notifications - WhatsApp Style */}
            <ToastContainer /> {/* ✅ NEW */}
            
            {/* --- 1. Desktop Sidebar --- */}
            <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 p-4 z-30 transition-transform duration-300 ease-in-out
                             ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0 md:shadow-none'}
                             bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700`}>
                
                <div className="flex items-center justify-between h-16 mb-6">
                    <Link to="/" className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        TaskMaster
                    </Link>
                    <button className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white" onClick={() => setIsSidebarOpen(false)}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="space-y-2 mb-8">
                    {navItems.map(item => (
                        <NavItem 
                            key={item.name} 
                            to={item.path} 
                            icon={item.icon} 
                            name={item.name}
                            onLinkClick={() => setIsSidebarOpen(false)}
                        />
                    ))}
                </nav>

                {/* Profile/Logout Section */}
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-gray-200 dark:bg-gray-700 rounded-xl space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                            {profileInitial}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{userName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Pro Member</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center p-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </button>
                </div>
            </aside>

            {isSidebarOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-20 md:hidden" 
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* --- 2. Main Content Area --- */}
            <main className="flex-1 flex flex-col overflow-x-hidden">
                {/* Header (Top Bar) */}
                <header className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 h-16 flex items-center justify-between px-4 md:px-6">
                    <button className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </button>
                    
                    {/* Date & Time Display - Hidden on mobile, shown on tablet+ */}
                    <div className="hidden sm:flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                            <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-medium">{formatDate()}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium">{formatTime()}</span>
                        </div>
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center gap-2 ml-auto">
                        {/* Notification Bell with label - matching theme toggle pattern */}
                        <NotificationCenter />
                        
                        {/* Theme Toggle with label */}
                        <button
                            onClick={toggleTheme}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all group shadow-sm ${
                                theme === 'light' 
                                    ? 'bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30' 
                                    : 'bg-orange-100 dark:bg-orange-500/20 hover:bg-orange-200 dark:hover:bg-orange-500/30'
                            }`}
                        >
                            {theme === 'light' ? (
                                <>
                                    <Moon className="w-5 h-5 text-purple-700 dark:text-purple-300 group-hover:text-purple-800 dark:group-hover:text-purple-200 transition-colors" />
                                    <span className="hidden lg:inline text-sm font-semibold text-purple-800 dark:text-purple-200">Dark Mode</span>
                                </>
                            ) : (
                                <>
                                    <Sun className="w-5 h-5 text-orange-600 dark:text-orange-300 group-hover:text-orange-700 dark:group-hover:text-orange-200 transition-colors" />
                                    <span className="hidden lg:inline text-sm font-semibold text-orange-700 dark:text-orange-200">Light Mode</span>
                                </>
                            )}
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-8 flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}