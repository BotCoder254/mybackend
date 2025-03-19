import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { FilePreview } from './FilePreview';
import { StorageService } from '../services/StorageService';
import { 
  FolderIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  DocumentIcon,
  TrashIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

export const FileManager = ({ collectionName }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const storageService = new StorageService(collectionName);

  const handleUpload = async (file, progressCallback) => {
    try {
      setIsLoading(true);
      const result = await storageService.uploadFile(file, '', progressCallback);
      setFiles(prev => [...prev, result]);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (file) => {
    try {
      setIsLoading(true);
      await storageService.deleteFile(file.path);
      setFiles(prev => prev.filter(f => f.path !== file.path));
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAccess = async (file) => {
    try {
      setIsLoading(true);
      const isPublic = file.metadata?.customMetadata?.isPublic === 'true';
      await storageService.setFileAccess(file.path, !isPublic);
      setFiles(prev => prev.map(f => 
        f.path === file.path 
          ? { ...f, metadata: { ...f.metadata, customMetadata: { ...f.metadata.customMetadata, isPublic: (!isPublic).toString() } } }
          : f
      ));
    } catch (error) {
      console.error('Access toggle error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (file) => {
    const type = file.type;
    if (type.startsWith('image/')) return PhotoIcon;
    if (type.startsWith('video/')) return VideoCameraIcon;
    if (type.startsWith('audio/')) return MusicalNoteIcon;
    return DocumentIcon;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <FolderIcon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Files</h2>
          </div>
        </div>

        <FileUpload
          onUpload={handleUpload}
          onDelete={handleDelete}
          maxFiles={10}
          maxSize={10485760} // 10MB
        />

        {files.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => {
                const FileIcon = getFileIcon(file);
                const isPublic = file.metadata?.customMetadata?.isPublic === 'true';

                return (
                  <div
                    key={file.path}
                    className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 text-gray-400">
                          <FileIcon />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedFile(file);
                            setIsPreviewOpen(true);
                          }}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleToggleAccess(file)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          {isPublic ? (
                            <LockOpenIcon className="h-5 w-5" />
                          ) : (
                            <LockClosedIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(file)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isPreviewOpen && selectedFile && (
        <FilePreview
          file={selectedFile}
          onClose={() => {
            setIsPreviewOpen(false);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
}; 