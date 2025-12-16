import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme'; 
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Zap, XOctagon, Database, Download, Upload, Lock, Phone, Calendar, Users } from 'lucide-react'; 

// --- Helper component for rendering tab content ---
const SettingsTabContent = ({ title, description, children, icon: Icon }) => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2">
            <Icon className="inline w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />{title}
        </h3>
        {description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>}
        {children}
    </div>
);
// ----------------------------------------------------

// --- NEW: Confirmation Modal Component (GitHub Style) ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    // Required phrase for GitHub-style confirmation
    const requiredText = "I want to delete my account";
    const [confirmationText, setConfirmationText] = useState('');

    const isConfirmed = confirmationText.trim() === requiredText;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full shadow-2xl border border-red-300 dark:border-red-700"
            >
                <div className="flex flex-col items-center text-center">
                    <XOctagon className="w-12 h-12 text-red-600 mb-4" />
                    <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                        Are you absolutely sure?
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        This action is **irreversible**. All your data will be permanently deleted.
                    </p>
                    
                    {/* Confirmation Input */}
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 mt-4 text-left w-full">
                        Type "<span className="font-bold text-red-500">{requiredText}</span>" to confirm:
                    </p>
                    <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        className="mb-6 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:border-red-500 focus:ring-red-500"
                        placeholder={requiredText}
                    />

                    <div className="flex justify-center space-x-4 w-full">
                        <button 
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            disabled={isLoading || !isConfirmed} // Disabled until text matches
                        >
                            {isLoading ? 'Deleting...' : 'Confirm Deletion'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
// ----------------------------------------------------


const Settings = () => {
    const { user, updateProfile, deleteAccount, isLoading } = useAuth();
    const { theme, toggleTheme } = useTheme(); 
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('account');
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState(''); 
    const [mobile, setMobile] = useState(user?.mobile || ''); 
    const [dob, setDob] = useState(user?.dob || '');         
    const [gender, setGender] = useState(user?.gender || ''); 
    const [profileMessage, setProfileMessage] = useState(null);
    
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);


    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMessage(null);
        
        if (!password) {
            setProfileMessage({ type: 'error', text: 'Please enter your current password to save changes.' });
            return;
        }

        const result = await updateProfile({ 
            name, 
            email, 
            password, 
            mobile, 
            dob, 
            gender 
        });
        setProfileMessage(result);
        if (result.type === 'success') {
            setPassword(''); 
        }
    };

    const handleAccountDeletion = async () => {
        // Deletion logic is inside the modal's onConfirm prop
        const success = await deleteAccount();
        if (success) {
             navigate('/login');
        } else {
             // In a real app, this should handle network errors.
             alert("Failed to delete account. Please try again.");
             setShowDeleteConfirmation(false);
        }
    };
    
    const initiateDelete = () => {
        setShowDeleteConfirmation(true);
    };

    // --- Data Management Functions (DUMMY) ---
    const handleExportData = () => {
        const data = JSON.stringify({ todos: [], categories: [] }, null, 2); 
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `taskmaster_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        alert("Data export simulated!");
    };

    const handleImportData = () => {
        alert("Import functionality placeholder.");
    };
    // ------------------------------------------

    const renderContent = () => {
        return (
            <AnimatePresence mode="wait">
                {activeTab === 'account' && (
                    <motion.div 
                        key="account"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <SettingsTabContent title="Profile Information" icon={User}>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} 
                                        className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-colors" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-colors" />
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className='relative'>
                                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number (Optional)</label>
                                        <Phone className='absolute left-3 top-9 w-4 h-4 text-gray-400' />
                                        <input type="tel" id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} 
                                            className="mt-1 block w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-colors" />
                                    </div>
                                    
                                    <div className='relative'>
                                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                                        <Calendar className='absolute left-3 top-9 w-4 h-4 text-gray-400' />
                                        <input type="date" id="dob" value={dob} onChange={(e) => setDob(e.target.value)} 
                                            className="mt-1 block w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-colors" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                                    <div className='relative'>
                                        <Users className='absolute left-3 top-4 w-4 h-4 text-gray-400' /> 
                                        <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}
                                            className="mt-1 block w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-colors appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>

                                <hr className='border-gray-200 dark:border-gray-700 pt-4' />
                                
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password (Required to save changes)</label>
                                    <Lock className='absolute left-3 top-9 w-4 h-4 text-gray-400' />
                                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} 
                                        placeholder='Enter current password' required
                                        className="mt-1 block w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-colors" />
                                </div>
                                
                                <div className="mt-6 flex items-center justify-between">
                                    <button type="submit" disabled={isLoading}
                                        className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-xl shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50 transform hover:scale-[1.02] active:scale-95">
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    {profileMessage && (
                                        <motion.p 
                                            key={profileMessage.text} 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }}
                                            className={`text-sm font-medium ${profileMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                          >
                                            {profileMessage.text}
                                        </motion.p>
                                    )}
                                </div>
                            </form>
                        </SettingsTabContent>
                        
                        {/* Danger Zone */}
                        <div className="p-6 bg-red-50 dark:bg-red-900/30 rounded-xl border-2 border-red-300 dark:border-red-700">
                            <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
                                <XOctagon className="inline w-5 h-5 mr-2" /> Danger Zone
                            </h3>
                            <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                                Permanently delete your account and all associated data. This cannot be reversed.
                            </p>
                            <button onClick={initiateDelete}
                                className="px-5 py-2 bg-red-600 text-white font-medium rounded-xl shadow-md hover:bg-red-700 transition-colors transform hover:scale-[1.02] active:scale-95">
                                Delete Account
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'appearance' && (
                    <motion.div 
                        key="appearance"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <SettingsTabContent title="Theme & Display" icon={Zap}>
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <label htmlFor="themeToggle" className="text-base font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                    Dark Mode
                                </label>
                                
                                <button
                                    onClick={toggleTheme}
                                    id="themeToggle"
                                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                >
                                    <span aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </SettingsTabContent>
                    </motion.div>
                )}

                {activeTab === 'data' && (
                    <motion.div 
                        key="data"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <SettingsTabContent 
                            title="Data Management" 
                            icon={Database}
                            description="Export and import your entire task list for backup or migration."
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleExportData} 
                                    className="flex-1 px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl shadow-md transition-colors transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Download className="w-5 h-5" /> Export Tasks (JSON)
                                </button>
                                <button
                                    onClick={handleImportData} 
                                    className="flex-1 px-5 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl shadow-md transition-colors transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                >
                                    <Upload className="w-5 h-5" /> Import Tasks
                                </button>
                            </div>
                        </SettingsTabContent>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 border-b pb-2 border-indigo-200 dark:border-gray-700">
                    Settings
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and application configuration.</p>
            </header>

            <div className="flex flex-col md:flex-row gap-8">
                <nav className="flex-shrink-0 w-full md:w-56">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-1 border border-gray-100 dark:border-gray-700">
                        {['account', 'appearance', 'data'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors transform hover:scale-[1.01] ${
                                    activeTab === tab 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </nav>

                <main className="flex-grow">
                    {renderContent()}
                </main>
            </div>
            
            {/* Render the Confirmation Modal */}
            <AnimatePresence>
                <DeleteConfirmationModal 
                    isOpen={showDeleteConfirmation}
                    onClose={() => setShowDeleteConfirmation(false)}
                    onConfirm={handleAccountDeletion}
                    isLoading={isLoading}
                />
            </AnimatePresence>
        </div>
    );
};

export default Settings;