import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme'; 
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Zap, XOctagon, Database, Download, Upload, Lock, Phone, Calendar, Users, Eye, EyeOff, ShieldCheck } from 'lucide-react'; 

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

const Settings = () => {
    const { user, updateProfile, deleteAccount, isLoading } = useAuth();
    const { theme, toggleTheme } = useTheme(); 
    const [activeTab, setActiveTab] = useState('account');
    const [showPassword, setShowPassword] = useState(false);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState(''); 
    const [mobile, setMobile] = useState(user?.mobile || ''); 
    const [dob, setDob] = useState(user?.dob || '');         
    const [gender, setGender] = useState(user?.gender || ''); 
    const [profileMessage, setProfileMessage] = useState(null);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMessage(null);
        const result = await updateProfile({ name, email, password, mobile, dob, gender });
        setProfileMessage(result);
        if (result?.type === 'success') setPassword('');
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
                                    <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Mobile</label>
                                            <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Birthday</label>
                                            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>

                                        <div className="col-span-full pt-6 border-t border-gray-100 dark:border-gray-700">
                                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                                                <label className="block text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2">Security Verification</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 w-4.5 h-4.5 text-indigo-400" />
                                                    <input 
                                                        type={showPassword ? "text" : "password"} 
                                                        value={password} 
                                                        onChange={(e) => setPassword(e.target.value)} 
                                                        placeholder="Enter sign-in password to save changes"
                                                        className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-white dark:border-gray-800 dark:bg-gray-800 dark:text-white focus:border-indigo-500 outline-none" 
                                                    />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-indigo-500">
                                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-full flex items-center justify-between mt-4">
                                            <button type="submit" disabled={isLoading} className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
                                                {isLoading ? 'Saving...' : 'Update Profile'}
                                            </button>
                                            {profileMessage && <span className={`text-sm font-bold ${profileMessage.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>{profileMessage.text}</span>}
                                        </div>
                                    </form>
                                </SettingsTabContent>
                                <div className="p-8 bg-rose-50/50 dark:bg-rose-900/10 rounded-3xl border-2 border-rose-100 dark:border-rose-900/30">
                                    <h3 className="text-xl font-black text-rose-700 dark:text-rose-400 flex items-center gap-2"><XOctagon size={22} /> Danger Zone</h3>
                                    <p className="text-sm text-rose-600 dark:text-rose-400/70 mt-2">Permanently delete your account. This is irreversible.</p>
                                    <button onClick={() => {}} className="mt-6 px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md">Delete Account</button>
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
                            <SettingsTabContent title="Data Management" icon={Database} description="Export and import your entire task list.">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center gap-2 p-4 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700"><Download size={18}/> Export JSON</button>
                                    <button className="flex items-center justify-center gap-2 p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl shadow-md"><Upload size={18}/> Import Backup</button>
                                </div>
                            </SettingsTabContent>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Settings;