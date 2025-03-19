import { useState, useEffect } from 'react';
import { DatabaseService } from '../services/DatabaseService';
import { StorageService } from '../services/StorageService';

export const useCollection = (collectionName = 'default') => {
  if (!collectionName) {
    throw new Error('Collection name is required');
  }

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schema, setSchema] = useState(null);

  const dbService = new DatabaseService(collectionName);
  const storageService = new StorageService(collectionName);

  useEffect(() => {
    const unsubscribe = dbService.subscribeToUpdates((docs) => {
      setDocuments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName]);

  const createDocument = async (data) => {
    try {
      setLoading(true);
      const result = await dbService.addDocument(data);
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (id, data) => {
    try {
      setLoading(true);
      const result = await dbService.updateDocument(id, data);
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id) => {
    try {
      setLoading(true);
      await dbService.deleteDocument(id);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file, progressCallback) => {
    try {
      const result = await storageService.uploadFile(file, progressCallback);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteFile = async (filePath) => {
    try {
      await storageService.deleteFile(filePath);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateSchema = async (newSchema) => {
    try {
      setLoading(true);
      // Here you would typically save the schema to a separate collection
      setSchema(newSchema);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}; 