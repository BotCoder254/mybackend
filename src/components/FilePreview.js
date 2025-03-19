import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from '@heroicons/react/outline';

export const FilePreview = ({ file, onClose }) => {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  const isPDF = file.type === 'application/pdf';

  const renderPreview = () => {
    if (isImage) {
      return (
        <img
          src={file.preview}
          alt={file.name}
          className="max-h-[80vh] max-w-full object-contain"
        />
      );
    }

    if (isVideo) {
      return (
        <video
          src={file.preview}
          controls
          className="max-h-[80vh] max-w-full"
        />
      );
    }

    if (isAudio) {
      return (
        <audio
          src={file.preview}
          controls
          className="w-full"
        />
      );
    }

    if (isPDF) {
      return (
        <iframe
          src={file.preview}
          className="w-full h-[80vh]"
          title={file.name}
        />
      );
    }

    return (
      <div className="p-8 text-center">
        <p className="text-lg font-medium text-gray-900">{file.name}</p>
        <p className="text-sm text-gray-500">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
        <p className="text-sm text-gray-500 mt-2">{file.type}</p>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 transition-opacity"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {file.name}
                    </h3>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mt-2">
                    {renderPreview()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 