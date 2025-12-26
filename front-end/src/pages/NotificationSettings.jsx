import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../hooks/useTheme';
import { Bell, Volume2, VolumeX, Clock, AlertCircle, CheckCircle, ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotificationSettings = () => {
  const { settings, updateSettings, requestNotificationPermission } = useNotifications();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleToggle = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    
    if (key === 'browserNotifications' && value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setSaveMessage('Please allow notifications in your browser settings');
        setTimeout(() => setSaveMessage(''), 3000);
        return;
      }
    }

    setSaving(true);
    const success = await updateSettings(newSettings);
    setSaving(false);

    if (success) {
      setSaveMessage('Settings saved successfully!');
    } else {
      setSaveMessage('Failed to save settings');
    }
    
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleTimeChange = async (key, value) => {
    setSaving(true);
    await updateSettings({ [key]: value });
    setSaving(false);
    
    setSaveMessage('Time updated!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    } p-4 md:p-6`}>
      
      {/* Centered Container */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-xl transition-all mb-6 font-medium shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl mb-4">
              <Bell className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Notification Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Customize how and when you receive notifications
            </p>
          </div>
        </motion.div>

        {/* Save Message */}
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl flex items-center justify-center gap-2 max-w-2xl mx-auto"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{saveMessage}</span>
          </motion.div>
        )}

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              General Settings
            </h2>

            <div className="space-y-4">
              {/* Enable Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Enable Notifications
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Master switch for all notifications
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => handleToggle('enabled', e.target.checked)}
                    className="sr-only peer"
                    disabled={saving}
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Browser Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Browser Notifications
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Pop-ups like WhatsApp (Medium & High priority)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.browserNotifications}
                    onChange={(e) => handleToggle('browserNotifications', e.target.checked)}
                    className="sr-only peer"
                    disabled={saving || !settings.enabled}
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Sound */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex-1 flex items-center gap-3">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Notification Sound
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Play sound (High priority only)
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => handleToggle('soundEnabled', e.target.checked)}
                    className="sr-only peer"
                    disabled={saving || !settings.enabled}
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Task Notification Types */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-600" />
              Task Reminders
            </h2>

            <div className="space-y-4">
              {/* Due Today */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                      📅 Tasks Due Today
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Morning reminder
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">Time:</label>
                  <input
                    type="time"
                    value={settings.dueTodayTime}
                    onChange={(e) => handleTimeChange('dueTodayTime', e.target.value)}
                    disabled={saving || !settings.enabled}
                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* One Day Before - NEW & HIGHLIGHTED */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl hover:shadow-md transition-shadow border-2 border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        📆 Due in 1 Day
                      </h3>
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">NEW</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Advance reminder (All priorities)
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.oneDayBefore}
                      onChange={(e) => handleToggle('oneDayBefore', e.target.checked)}
                      className="sr-only peer"
                      disabled={saving || !settings.enabled}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* One Hour Before */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                    ⏰ Due in 1 Hour
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Urgent reminder (Medium & High)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.oneHourBefore}
                    onChange={(e) => handleToggle('oneHourBefore', e.target.checked)}
                    className="sr-only peer"
                    disabled={saving || !settings.enabled}
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Overdue Tasks */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                      🔴 Overdue Tasks
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Daily reminder (High priority only)
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.overdueDaily}
                      onChange={(e) => handleToggle('overdueDaily', e.target.checked)}
                      className="sr-only peer"
                      disabled={saving || !settings.enabled}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                {settings.overdueDaily && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">Time:</label>
                    <input
                      type="time"
                      value={settings.overdueTime}
                      onChange={(e) => handleTimeChange('overdueTime', e.target.value)}
                      disabled={saving || !settings.enabled}
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Priority Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="font-bold text-green-900 dark:text-green-300">Low Priority</h3>
            </div>
            <p className="text-xs text-green-700 dark:text-green-400">
              • No notifications<br/>
              • In-app display only<br/>
              • Silent tasks
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <h3 className="font-bold text-orange-900 dark:text-orange-300">Medium Priority</h3>
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-400">
              • Optional browser notification<br/>
              • Silent (no sound)<br/>
              • User can enable
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h3 className="font-bold text-red-900 dark:text-red-300">High Priority</h3>
            </div>
            <p className="text-xs text-red-700 dark:text-red-400">
              • Always notify<br/>
              • Browser + Sound<br/>
              • Even in silent mode
            </p>
          </motion.div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6"
        >
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                How Notifications Work
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Browser notifications work even when the app is closed</li>
                <li>• You must allow notifications in your browser settings</li>
                <li>• Notification priority determines notification behavior</li>
                <li>• All settings sync across devices</li>
                <li className="font-semibold">• 🎉 NEW: Get reminded 1 day before tasks are due!</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationSettings;