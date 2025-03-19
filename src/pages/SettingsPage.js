import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { 
  SunIcon, 
  MoonIcon,
  SwatchIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {t('settings.title')}
          </h3>
          <div className="mt-5">
            <div className="space-y-6">
              {/* Theme Settings */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <SwatchIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {t('settings.theme')}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {t('settings.themeDescription')}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  >
                    {theme === 'dark' ? (
                      <MoonIcon className="h-5 w-5 text-gray-800" />
                    ) : (
                      <SunIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </span>
                </motion.button>
              </div>

              {/* Layout Settings */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {t('settings.layout')}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {t('settings.layoutDescription')}
                    </p>
                  </div>
                </div>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option value="default">{t('settings.layoutDefault')}</option>
                  <option value="compact">{t('settings.layoutCompact')}</option>
                  <option value="spacious">{t('settings.layoutSpacious')}</option>
                </select>
              </div>

              {/* Additional settings can be added here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 