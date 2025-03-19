import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' }
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium ${
          theme === 'dark'
            ? 'text-white bg-gray-800 hover:bg-gray-700 border-gray-700'
            : 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
      >
        <GlobeAltIcon className="h-5 w-5 mr-2" />
        {languages.find(lang => lang.code === i18n.language)?.name}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } ring-1 ring-black ring-opacity-5 z-50`}
          >
            <div className="py-1" role="menu">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => changeLanguage(language.code)}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    theme === 'dark'
                      ? 'text-white hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${
                    i18n.language === language.code
                      ? theme === 'dark'
                        ? 'bg-gray-700'
                        : 'bg-gray-100'
                      : ''
                  }`}
                  role="menuitem"
                >
                  {language.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 