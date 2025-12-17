import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { isValidEmail } from '../utils/validationUtils'; // <-- IMPORTED

// --- Password Requirement Checker Component (NO CHANGE, RETAINED FOR CONTEXT) ---
const PasswordChecker = ({ password }) => {
    const checks = [
        { regex: /.{8,}/, label: "8 characters minimum" },
        { regex: /[A-Z]/, label: "1 uppercase letter" },
        { regex: /[a-z]/, label: "1 lowercase letter" },
        { regex: /\d/, label: "1 number" },
        { regex: /[^A-Za-z0-9]/, label: "1 special character" },
    ];

    return (
        <motion.ul 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs space-y-1 mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-inner"
        >
            {checks.map((check, index) => {
                const isValid = check.regex.test(password);
                return (
                    <motion.li 
                        key={index}
                        initial={{ x: -10 }}
                        animate={{ x: 0 }}
                        className={`flex items-center transition-colors font-medium ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}
                    >
                        {isValid 
                            ? <CheckCircle className="w-3 h-3 mr-2 text-green-500" /> 
                            : <XCircle className="w-3 h-3 mr-2 text-red-500" />
                        }
                        {check.label}
                    </motion.li>
                );
            })}
        </motion.ul>
    );
};
// --- End Password Requirement Checker Component ---


const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [generalError, setGeneralError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { signup } = useAuth();
    const { theme } = useTheme();

    const isPasswordValid = () => {
        const checks = [
            /.{8,}/, 
            /[A-Z]/, 
            /[a-z]/, 
            /\d/, 
            /[^A-Za-z0-9]/
        ];
        return checks.every(regex => regex.test(password));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setGeneralError('');

        if (!name.trim()) { // <-- Trim added for Name
            setGeneralError('Please enter your full name.');
            return;
        }
        
        if (!isValidEmail(email)) { // <-- NEW EMAIL VALIDATION
            setGeneralError('Please enter a valid email address.');
            return;
        }

        if (!isPasswordValid()) {
            setGeneralError('Password does not meet all security requirements.');
            return;
        }

        signup(name, email, password);
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
              : 'bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100'
          } relative overflow-hidden`}>

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.1, opacity: 0.2 }}
                    transition={{ duration: 7, repeat: Infinity, repeatType: 'reverse' }}
                    className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl"
                ></motion.div>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.2 }}
                    transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl"
                ></motion.div>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 0.2 }}
                    transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', delay: 3 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl"
                ></motion.div>
            </div>


            <div className="w-full max-w-md relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20"
                >
                    {/* Logo/Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                        <Sparkles className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Create Account
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">Start managing your tasks efficiently</p>
                    </div>

                    {generalError && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm flex items-center gap-2"
                        >
                            <XCircle className="w-5 h-5" />
                            {generalError}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Full Name
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                                <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                                <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <PasswordChecker password={password} /> {/* <-- LIVE CHECKER */}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!isPasswordValid() || !isValidEmail(email) || !name.trim()} // <-- UPDATED DISABLED LOGIC
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create Account
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    {/* Divider, Sign In Link */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
                        </div>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                        <Link 
                        to="/login"
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold hover:underline transition-all"
                        >
                        Sign in
                        </Link>
                    </div>
                </motion.div>

                {/* Footer text */}
                <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
};

export default SignUp;