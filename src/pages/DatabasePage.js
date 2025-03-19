import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { DatabaseManager } from '../components/DatabaseManager';
import { SchemaManager } from '../components/SchemaManager';
import { DocumentEditor } from '../components/DocumentEditor';
import { useCollection } from '../hooks/useCollection';
import { 
  TableCellsIcon,
  Cog6ToothIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

export const DatabasePage = ({ collectionName = 'default' }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const {
    documents,
    loading,
    error,
    schema,
    createDocument,
    updateDocument,
    deleteDocument,
    uploadFile,
    updateSchema
  } = useCollection(collectionName);

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSchemaManager, setShowSchemaManager] = useState(false);

  const handleCreateDocument = async (data) => {
    try {
      await createDocument(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  };

  const handleUpdateDocument = async (data) => {
    try {
      await updateDocument(selectedDocument.id, data);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  };

  const handleSchemaUpdate = async (newSchema) => {
    try {
      await updateSchema(newSchema);
      setShowSchemaManager(false);
    } catch (error) {
      console.error('Error updating schema:', error);
      throw error;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <TableCellsIcon className="h-8 w-8 text-primary" />
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('database.title')}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSchemaManager(true)}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                theme === 'dark' 
                  ? 'text-white bg-gray-800 hover:bg-gray-700' 
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            >
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              {t('database.schema')}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              {t('database.newDocument')}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Database Manager */}
          <div className="lg:col-span-2">
            <DatabaseManager
              collectionName={collectionName}
              documents={documents}
              loading={loading}
              error={error}
              schema={schema}
              onEditDocument={setSelectedDocument}
              onDeleteDocument={deleteDocument}
              onFileUpload={uploadFile}
              theme={theme}
            />
          </div>

          {/* Schema Manager */}
          {showSchemaManager && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-1"
            >
              <SchemaManager
                schema={schema}
                onUpdate={handleSchemaUpdate}
                onClose={() => setShowSchemaManager(false)}
                theme={theme}
              />
            </motion.div>
          )}
        </div>

        {/* Document Editor Modal */}
        {(isEditing || selectedDocument) && (
          <DocumentEditor
            document={selectedDocument}
            schema={schema}
            onSave={selectedDocument ? handleUpdateDocument : handleCreateDocument}
            onClose={() => {
              setIsEditing(false);
              setSelectedDocument(null);
            }}
            onFileUpload={uploadFile}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
};

DatabasePage.propTypes = {
  collectionName: PropTypes.string.isRequired
};

DatabasePage.defaultProps = {
  collectionName: 'default'
}; 