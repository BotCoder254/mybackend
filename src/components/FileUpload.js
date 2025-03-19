import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  CloudArrowUpIcon,
  XMarkIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

export const FileUpload = ({ onUpload, onDelete, maxFiles = 5, maxSize = 5242880 }) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.webm'],
      'audio/*': ['.mp3', '.wav']
    }
  });

  const handleUpload = async (file) => {
    try {
      setUploadProgress(prev => ({ ...prev, [file.file.name]: 0 }));
      await onUpload(file.file, (progress) => {
        setUploadProgress(prev => ({ ...prev, [file.file.name]: progress }));
      });
      setUploadProgress(prev => ({ ...prev, [file.file.name]: 100 }));
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDelete = (fileToDelete) => {
    setFiles(files.filter(f => f !== fileToDelete));
    URL.revokeObjectURL(fileToDelete.preview);
    if (onDelete) onDelete(fileToDelete);
  };

  const getFileIcon = (file) => {
    const type = file.type;
    if (type.startsWith('image/')) return PhotoIcon;
    if (type.startsWith('video/')) return VideoCameraIcon;
    if (type.startsWith('audio/')) return MusicalNoteIcon;
    return DocumentIcon;
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag and drop files here, or click to select files'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Max {maxFiles} files, up to {maxSize / 1024 / 1024}MB each
        </p>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={file.file.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  {getFileIcon(file) && (
                    <div className="h-10 w-10 text-gray-400">
                      {React.createElement(getFileIcon(file))}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {uploadProgress[file.file.name] !== undefined ? (
                    <div className="w-24">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress[file.file.name]}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-right">
                        {Math.round(uploadProgress[file.file.name])}%
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpload(file)}
                      className="text-sm text-primary hover:text-primary-dark"
                    >
                      Upload
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(file)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 