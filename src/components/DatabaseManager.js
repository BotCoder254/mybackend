import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCollection } from '../hooks/useCollection';
import { 
  TableIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  UploadIcon,
  SearchIcon
} from '@heroicons/react/outline';

export const DatabaseManager = ({ collectionName }) => {
  const {
    documents,
    loading,
    error,
    schema,
    createDocument,
    updateDocument,
    deleteDocument,
    uploadFile,
    deleteFile,
    updateSchema
  } = useCollection(collectionName);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const result = await uploadFile(file, (progress) => {
          setUploadProgress(progress);
        });
        console.log('File uploaded:', result);
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const filteredDocuments = documents.filter(doc =>
    Object.values(doc).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TableIcon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold text-gray-900">
            {collectionName}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
            <UploadIcon className="h-5 w-5 inline-block mr-2" />
            Upload
          </label>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Document
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <motion.div
            className="bg-primary h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${uploadProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {schema && Object.keys(schema).map(field => (
                <th
                  key={field}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {field}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDocuments.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                {schema && Object.keys(schema).map(field => (
                  <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doc[field]}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedDocument(doc)}
                    className="text-primary hover:text-primary-dark mr-4"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 