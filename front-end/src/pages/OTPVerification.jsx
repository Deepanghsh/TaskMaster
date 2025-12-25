import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { Mail, ArrowLeft, RefreshCw, ShieldCheck, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import OTPInput from '../components/OTPInput';

const API_BASE_URL = 'http://localhost:5000/api';

const OTPVerification = () => {
    const { theme } = useTheme();
    const { verifyEmail, completeLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { email, name, password, isSignup } = location.state || {};

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState(3);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate(isSignup ? '/signup' : '/login');
            return;
        }

        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer, email, navigate, isSignup]);

    const handleOTPComplete = async (otpValue) => {
        setOtp(otpValue);
        await verifyOTP(otpValue);
    };

    const verifyOTP = async (otpValue) => {
        if (attemptsLeft <= 0) {
            setError('Too many failed attempts. Please request a new OTP.');
            return;
        }

        setIsVerifying(true);
        setError('');

        localStorage.clear();
        sessionStorage.clear();

        try {
            const response = await fetch(`${API_BASE_URL}/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpValue })
            });

            const result = await response.json();

            if (result.success) {
                if (isSignup) {
                    const verifyResult = await verifyEmail(email);

                    if (verifyResult.success) {
                        navigate('/', { replace: true });
                    } else {
                        setError(verifyResult.message || 'Verification failed.');
                    }
                } else {
                    const loginResult = await completeLogin(email);

                    if (loginResult.success) {
                        navigate('/', { replace: true });
                    } else {
                        setError(loginResult.message || 'Login failed.');
                    }
                }
            } else {
                if (result.attemptsLeft !== undefined) {
                    setAttemptsLeft(result.attemptsLeft);
                } else {
                    const newAttemptsLeft = attemptsLeft - 1;
                    setAttemptsLeft(newAttemptsLeft);
                }
                
                setError(result.message || 'Invalid OTP. Please try again.');
                setOtp('');
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError('Verification failed. Please try again.');
            setOtp('');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/otp/resend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name })
            });

            const result = await response.json();

            if (result.success) {
                setResendTimer(60);
                setCanResend(false);
                setAttemptsLeft(3);
                setOtp('');
            } else {
                setError(result.message || 'Failed to resend OTP.');
            }
        } catch (err) {
            console.error('Resend error:', err);
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!email) {
        return null;
    }

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${
            theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900' 
                : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
        } relative overflow-hidden`}>
            
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 0.15 }}
                    transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
                    className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl"
                />
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.15 }}
                    transition={{ duration: 7, repeat: Infinity, repeatType: 'reverse', delay: 2 }}
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl"
                />
            </div>

            <div className="w-full max-w-md relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20"
                >
                    <button
                        onClick={() => navigate(isSignup ? '/signup' : '/login')}
                        className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back</span>
                    </button>

                    <div className="flex justify-center mb-6">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                            className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                        >
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </motion.div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Verify Your Email
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            We've sent a 6-digit code to
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                {email}
                            </p>
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm flex items-center gap-2"
                            >
                                <XCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mb-6">
                        <OTPInput 
                            length={6} 
                            onComplete={handleOTPComplete}
                            disabled={isVerifying || attemptsLeft <= 0}
                        />
                    </div>

                    {attemptsLeft < 3 && attemptsLeft > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-4 text-center text-sm text-amber-600 dark:text-amber-400 font-medium"
                        >
                            ⚠️ {attemptsLeft} attempt{attemptsLeft > 1 ? 's' : ''} remaining
                        </motion.div>
                    )}

                    {isVerifying && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-6 text-center"
                        >
                            <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="text-sm font-medium">Verifying...</span>
                            </div>
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-sm">
                            {!canResend ? (
                                <>
                                    <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Resend code in{' '}
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                            {formatTime(resendTimer)}
                                        </span>
                                    </span>
                                </>
                            ) : (
                                <button
                                    onClick={handleResendOTP}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    <span>Resend Code</span>
                                </button>
                            )}
                        </div>

                        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                            Didn't receive the code? Check your spam folder
                        </div>
                    </div>
                </motion.div>

                <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                    🔒 Your information is secure and encrypted
                </p>
            </div>
        </div>
    );
};

export default OTPVerification;