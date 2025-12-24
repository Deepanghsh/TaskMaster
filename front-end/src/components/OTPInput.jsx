import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const OTPInput = ({ length = 6, onComplete, disabled = false }) => {
    const [otp, setOtp] = useState(new Array(length).fill(''));
    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Move to next input if current field is filled
        if (element.value && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }

        // Call onComplete when all fields are filled
        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === length) {
            onComplete(newOtp.join(''));
        }
    };

    const handleKeyDown = (e, index) => {
        // Move to previous input on backspace if current input is empty
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1].focus();
            } else {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }

        // Move to next input on right arrow
        if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }

        // Move to previous input on left arrow
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length);
        
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            if (i < length) {
                newOtp[i] = char;
            }
        });
        setOtp(newOtp);

        // Focus on the next empty input or the last input
        const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
        if (nextEmptyIndex !== -1) {
            inputRefs.current[nextEmptyIndex].focus();
        } else {
            inputRefs.current[length - 1].focus();
            if (newOtp.every(digit => digit !== '')) {
                onComplete(newOtp.join(''));
            }
        }
    };

    return (
        <div className="flex gap-2 sm:gap-3 justify-center">
            {otp.map((digit, index) => (
                <motion.input
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                        w-11 h-12 sm:w-14 sm:h-16 
                        text-center text-xl sm:text-2xl font-bold
                        rounded-xl border-2 
                        ${digit 
                            ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        text-gray-900 dark:text-gray-100
                        focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400
                        transition-all outline-none
                        hover:border-indigo-400 dark:hover:border-indigo-500
                    `}
                />
            ))}
        </div>
    );
};

export default OTPInput;