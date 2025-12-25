import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme'; 
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Zap, XOctagon, Database, Download, Upload, AlertTriangle, Check, X, Phone } from 'lucide-react'; 

const SettingsTabContent = ({ title, description, children, icon: Icon }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
        <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Icon size={22} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 ml-14">{description}</p>}
        <div className="mt-6">{children}</div>
    </motion.div>
);

// Country codes data
const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳', maxLength: 10 },
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸', maxLength: 10 },
    { code: '+44', country: 'UK', flag: '🇬🇧', maxLength: 10 },
    { code: '+61', country: 'Australia', flag: '🇦🇺', maxLength: 9 },
    { code: '+86', country: 'China', flag: '🇨🇳', maxLength: 11 },
    { code: '+81', country: 'Japan', flag: '🇯🇵', maxLength: 10 },
    { code: '+49', country: 'Germany', flag: '🇩🇪', maxLength: 11 },
    { code: '+33', country: 'France', flag: '🇫🇷', maxLength: 9 },
    { code: '+971', country: 'UAE', flag: '🇦🇪', maxLength: 9 },
    { code: '+65', country: 'Singapore', flag: '🇸🇬', maxLength: 8 },
];

const Settings = () => {
    const { user, updateProfile, deleteAccount, exportData, importData, isLoading } = useAuth();
    const { theme, toggleTheme } = useTheme(); 
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('account');

    // Parse existing mobile number if it exists
    const parseExistingMobile = (mobile) => {
        if (!mobile) return { countryCode: '+91', number: '' };
        
        // Find matching country code
        for (const country of countryCodes) {
            if (mobile.startsWith(country.code)) {
                return {
                    countryCode: country.code,
                    number: mobile.slice(country.code.length)
                };
            }
        }
        
        // Default to India if no match
        return { countryCode: '+91', number: mobile };
    };

    const existingMobile = parseExistingMobile(user?.mobile);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [countryCode, setCountryCode] = useState(existingMobile.countryCode);
    const [mobileNumber, setMobileNumber] = useState(existingMobile.number);
    const [dob, setDob] = useState(user?.dob || '');         
    const [gender, setGender] = useState(user?.gender || ''); 
    const [profileMessage, setProfileMessage] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Confirmation states
    const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateMobile = (number, countryCode) => {
        if (!number) return true; // Optional field
        
        // Get max length for selected country
        const country = countryCodes.find(c => c.code === countryCode);
        const maxLength = country?.maxLength || 10;
        
        // Only digits allowed
        const digitRegex = /^\d+$/;
        if (!digitRegex.test(number)) {
            return false;
        }
        
        // Check length
        if (number.length < 8 || number.length > maxLength) {
            return false;
        }
        
        return true;
    };

    const validateName = (name) => {
        return name.trim().length >= 2;
    };

    const handleMobileChange = (e) => {
        const value = e.target.value;
        // Only allow digits
        const digitsOnly = value.replace(/\D/g, '');
        
        // Get max length for selected country
        const country = countryCodes.find(c => c.code === countryCode);
        const maxLength = country?.maxLength || 10;
        
        // Limit to max length
        const limited = digitsOnly.slice(0, maxLength);
        setMobileNumber(limited);
        
        // Clear mobile error when typing
        if (validationErrors.mobile) {
            setValidationErrors(prev => ({ ...prev, mobile: null }));
        }
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        if (validationErrors.name) {
            setValidationErrors(prev => ({ ...prev, name: null }));
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (validationErrors.email) {
            setValidationErrors(prev => ({ ...prev, email: null }));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMessage(null);
        setValidationErrors({});

        // Validate all fields
        const errors = {};

        if (!validateName(name)) {
            errors.name = 'Name must be at least 2 characters';
        }

        if (!validateEmail(email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (mobileNumber && !validateMobile(mobileNumber, countryCode)) {
            const country = countryCodes.find(c => c.code === countryCode);
            errors.mobile = `Please enter a valid ${country?.country || ''} mobile number (${country?.maxLength || 10} digits)`;
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setProfileMessage({ type: 'error', text: 'Please fix validation errors' });
            return;
        }

        // Show inline confirmation
        if (!showUpdateConfirm) {
            setShowUpdateConfirm(true);
            return;
        }

        // Combine country code and mobile number
        const fullMobile = mobileNumber ? `${countryCode}${mobileNumber}` : '';

        // Proceed with update
        const result = await updateProfile({ 
            name, 
            email, 
            mobile: fullMobile, 
            dob, 
            gender 
        });
        
        setProfileMessage(result);
        setShowUpdateConfirm(false);

        // Clear success message after 3 seconds
        if (result?.type === 'success') {
            setTimeout(() => setProfileMessage(null), 3000);
        }
    };

    const cancelProfileUpdate = () => {
        setShowUpdateConfirm(false);
        setValidationErrors({});
        // Reset form to original values
        const existingMobile = parseExistingMobile(user?.mobile);
        setName(user?.name || '');
        setEmail(user?.email || '');
        setCountryCode(existingMobile.countryCode);
        setMobileNumber(existingMobile.number);
        setDob(user?.dob || '');
        setGender(user?.gender || '');
    };

    const handleDeleteAccount = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }

        const result = await deleteAccount();
        if (result) {
            navigate('/login');
        } else {
            setProfileMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
        }
    };

    const handleExportData = async () => {
        try {
            const data = await exportData();
            
            // Create JSON file
            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            
            // Create download link
            const link = document.createElement('a');
            link.href = url;
            link.download = `taskmaster-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setProfileMessage({ type: 'success', text: 'Data exported successfully!' });
            setTimeout(() => setProfileMessage(null), 3000);
        } catch (error) {
            console.error('Export error:', error);
            setProfileMessage({ type: 'error', text: 'Failed to export data' });
            setTimeout(() => setProfileMessage(null), 3000);
        }
    };

    const handleImportData = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate the backup file
            if (!data.version) {
                setProfileMessage({ type: 'error', text: 'Invalid backup file format' });
                setTimeout(() => setProfileMessage(null), 3000);
                return;
            }

            const result = await importData(data);
            
            if (result?.success) {
                setProfileMessage({ type: 'success', text: 'Data imported successfully!' });
                // Update form fields with imported data
                const existingMobile = parseExistingMobile(user?.mobile);
                setName(user?.name || '');
                setEmail(user?.email || '');
                setCountryCode(existingMobile.countryCode);
                setMobileNumber(existingMobile.number);
                setDob(user?.dob || '');
                setGender(user?.gender || '');
            } else {
                setProfileMessage({ type: 'error', text: 'Failed to import data' });
            }
            
            setTimeout(() => setProfileMessage(null), 3000);
        } catch (error) {
            console.error('Import error:', error);
            setProfileMessage({ type: 'error', text: 'Failed to parse backup file' });
            setTimeout(() => setProfileMessage(null), 3000);
        } finally {
            e.target.value = ''; // Reset file input
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your security, appearance, and data preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                <aside className="lg:w-64 space-y-2">
                    {[
                        { id: 'account', label: 'Account', icon: User },
                        { id: 'appearance', label: 'Appearance', icon: Zap },
                        { id: 'data', label: 'Data Hub', icon: Database }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none translate-x-1' 
                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}>
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </aside>

                <main className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <SettingsTabContent title="Profile Settings" icon={User} description="Update your personal details and contact information.">
                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Name Field */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                                                    Full Name <span className="text-red-500">*</span>
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={name} 
                                                    onChange={handleNameChange}
                                                    required
                                                    disabled={showUpdateConfirm}
                                                    className={`w-full px-4 py-2.5 rounded-xl border ${
                                                        validationErrors.name 
                                                            ? 'border-red-500 focus:ring-red-500' 
                                                            : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500'
                                                    } dark:bg-gray-900/50 dark:text-white focus:ring-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                                                />
                                                {validationErrors.name && (
                                                    <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
                                                )}
                                            </div>

                                            {/* Email Field */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input 
                                                    type="email" 
                                                    value={email} 
                                                    onChange={handleEmailChange}
                                                    required
                                                    disabled={showUpdateConfirm}
                                                    className={`w-full px-4 py-2.5 rounded-xl border ${
                                                        validationErrors.email 
                                                            ? 'border-red-500 focus:ring-red-500' 
                                                            : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500'
                                                    } dark:bg-gray-900/50 dark:text-white focus:ring-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                                                />
                                                {validationErrors.email && (
                                                    <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
                                                )}
                                            </div>

                                            {/* Mobile Field with Country Code */}
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                                    <Phone size={14} />
                                                    Mobile Number
                                                </label>
                                                <div className="flex gap-2">
                                                    {/* Country Code Selector */}
                                                    <select 
                                                        value={countryCode}
                                                        onChange={(e) => {
                                                            setCountryCode(e.target.value);
                                                            setMobileNumber(''); // Clear number when country changes
                                                        }}
                                                        disabled={showUpdateConfirm}
                                                        className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed w-40"
                                                    >
                                                        {countryCodes.map((country) => (
                                                            <option key={country.code} value={country.code}>
                                                                {country.flag} {country.code}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {/* Phone Number Input */}
                                                    <input 
                                                        type="tel" 
                                                        value={mobileNumber} 
                                                        onChange={handleMobileChange}
                                                        placeholder={`Enter ${countryCodes.find(c => c.code === countryCode)?.maxLength || 10} digits`}
                                                        disabled={showUpdateConfirm}
                                                        className={`flex-1 px-4 py-2.5 rounded-xl border ${
                                                            validationErrors.mobile 
                                                                ? 'border-red-500 focus:ring-red-500' 
                                                                : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500'
                                                        } dark:bg-gray-900/50 dark:text-white focus:ring-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    />
                                                </div>
                                                {validationErrors.mobile && (
                                                    <p className="text-xs text-red-500 mt-1">{validationErrors.mobile}</p>
                                                )}
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Format: {countryCode}{mobileNumber || ''.padEnd(countryCodes.find(c => c.code === countryCode)?.maxLength || 10, 'X')}
                                                </p>
                                            </div>

                                            {/* Birthday Field */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Birthday</label>
                                                <input 
                                                    type="date" 
                                                    value={dob} 
                                                    onChange={(e) => setDob(e.target.value)} 
                                                    disabled={showUpdateConfirm}
                                                    max={new Date().toISOString().split('T')[0]} // Can't select future dates
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
                                                />
                                            </div>

                                            {/* Gender Field */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Gender</label>
                                                <select 
                                                    value={gender} 
                                                    onChange={(e) => setGender(e.target.value)}
                                                    disabled={showUpdateConfirm}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">Select gender</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Inline Confirmation for Profile Update */}
                                        <AnimatePresence>
                                            {showUpdateConfirm && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                                                        <div className="flex items-start gap-3">
                                                            <AlertTriangle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={24} />
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-2">Confirm Profile Update</h4>
                                                                <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
                                                                    Are you sure you want to update your profile? This will save all the changes you made.
                                                                </p>
                                                                <div className="flex gap-3">
                                                                    <button
                                                                        type="submit"
                                                                        disabled={isLoading}
                                                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
                                                                    >
                                                                        <Check size={18} />
                                                                        {isLoading ? 'Saving...' : 'Yes, Update'}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={cancelProfileUpdate}
                                                                        disabled={isLoading}
                                                                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
                                                                    >
                                                                        <X size={18} />
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Submit Button */}
                                        {!showUpdateConfirm && (
                                            <div className="flex items-center justify-between pt-4">
                                                <button 
                                                    type="submit" 
                                                    disabled={isLoading} 
                                                    className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    Update Profile
                                                </button>
                                                {profileMessage && (
                                                    <span className={`text-sm font-bold ${profileMessage.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {profileMessage.text}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </form>
                                </SettingsTabContent>

                                {/* Delete Account Section */}
                                <div className="p-8 bg-rose-50/50 dark:bg-rose-900/10 rounded-3xl border-2 border-rose-100 dark:border-rose-900/30">
                                    <h3 className="text-xl font-black text-rose-700 dark:text-rose-400 flex items-center gap-2">
                                        <XOctagon size={22} /> Danger Zone
                                    </h3>
                                    <p className="text-sm text-rose-600 dark:text-rose-400/70 mt-2 mb-6">
                                        Permanently delete your account and all data. This action is irreversible.
                                    </p>

                                    {/* Inline Confirmation for Delete Account */}
                                    <AnimatePresence>
                                        {showDeleteConfirm ? (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="bg-rose-100 dark:bg-rose-900/30 border-2 border-rose-300 dark:border-rose-800 rounded-2xl p-6">
                                                    <div className="flex items-start gap-3">
                                                        <AlertTriangle className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" size={24} />
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-rose-900 dark:text-rose-200 mb-2">⚠️ Final Warning</h4>
                                                            <p className="text-sm text-rose-800 dark:text-rose-300 mb-4">
                                                                This action cannot be undone. This will permanently delete:
                                                            </p>
                                                            <ul className="text-sm text-rose-800 dark:text-rose-300 mb-4 ml-4 list-disc">
                                                                <li>Your profile and account</li>
                                                                <li>All your tasks and data</li>
                                                                <li>All your settings</li>
                                                            </ul>
                                                            <div className="flex gap-3">
                                                                <button
                                                                    onClick={handleDeleteAccount}
                                                                    disabled={isLoading}
                                                                    className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition disabled:opacity-50"
                                                                >
                                                                    <Check size={18} />
                                                                    {isLoading ? 'Deleting...' : 'Yes, Delete Forever'}
                                                                </button>
                                                                <button
                                                                    onClick={() => setShowDeleteConfirm(false)}
                                                                    disabled={isLoading}
                                                                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
                                                                >
                                                                    <X size={18} />
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <button 
                                                onClick={handleDeleteAccount}
                                                disabled={isLoading}
                                                className="px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md disabled:opacity-50 transition"
                                            >
                                                Delete Account
                                            </button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <SettingsTabContent title="Appearance" icon={Zap} description="Customize your viewing experience.">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <span className="font-bold text-gray-700 dark:text-gray-200">Dark Mode</span>
                                    <button onClick={toggleTheme} className={`relative w-14 h-7 rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                        <motion.div animate={{ x: theme === 'dark' ? 28 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm" />
                                    </button>
                                </div>
                            </SettingsTabContent>
                        )}

                        {activeTab === 'data' && (
                            <SettingsTabContent title="Data Management" icon={Database} description="Export and import your entire task list and profile data.">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button 
                                        onClick={handleExportData}
                                        disabled={isLoading}
                                        className="flex items-center justify-center gap-2 p-4 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-50 transition"
                                    >
                                        <Download size={18}/> Export Data
                                    </button>
                                    <label className="flex items-center justify-center gap-2 p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition">
                                        <Upload size={18}/> Import Backup
                                        <input 
                                            type="file" 
                                            accept=".json" 
                                            onChange={handleImportData}
                                            disabled={isLoading}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                {profileMessage && (
                                    <motion.p 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`mt-4 text-center text-sm font-bold ${profileMessage.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}
                                    >
                                        {profileMessage.text}
                                    </motion.p>
                                )}
                            </SettingsTabContent>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Settings;