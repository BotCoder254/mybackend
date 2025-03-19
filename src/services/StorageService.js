import { storage } from '../config/firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  uploadBytesResumable
} from 'firebase/storage';

export class StorageService {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  // Upload a file with progress tracking and metadata
  async uploadFile(file, path = '', metadata = {}, progressCallback = null) {
    try {
      const storageRef = ref(storage, `${this.collectionName}/${path}/${file.name}`);
      const fileMetadata = {
        contentType: file.type,
        customMetadata: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
          size: file.size.toString(),
          originalName: file.name
        }
      };

      const uploadTask = uploadBytesResumable(storageRef, file, fileMetadata);
      
      if (progressCallback) {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressCallback(progress);
          },
          (error) => {
            throw new Error(`Upload failed: ${error.message}`);
          }
        );
      }

      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        name: file.name,
        size: file.size,
        type: file.type,
        metadata: snapshot.metadata
      };
    } catch (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }
  }

  // Get file metadata
  async getFileMetadata(path) {
    try {
      const storageRef = ref(storage, path);
      const metadata = await getMetadata(storageRef);
      return metadata;
    } catch (error) {
      throw new Error(`Error getting file metadata: ${error.message}`);
    }
  }

  // Update file metadata
  async updateFileMetadata(path, metadata) {
    try {
      const storageRef = ref(storage, path);
      await updateMetadata(storageRef, metadata);
      return true;
    } catch (error) {
      throw new Error(`Error updating file metadata: ${error.message}`);
    }
  }

  // Delete a file
  async deleteFile(path) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  // List all files in a directory with pagination
  async listFiles(path = '', pageSize = 20, pageToken = null) {
    try {
      const storageRef = ref(storage, `${this.collectionName}/${path}`);
      const result = await listAll(storageRef);
      
      const files = await Promise.all(
        result.items.map(async (item) => {
          const metadata = await getMetadata(item);
          const url = await getDownloadURL(item);
          return {
            name: item.name,
            path: item.fullPath,
            url,
            metadata,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated
          };
        })
      );

      // Implement pagination
      const startIndex = pageToken ? parseInt(pageToken) : 0;
      const endIndex = startIndex + pageSize;
      const paginatedFiles = files.slice(startIndex, endIndex);
      const nextPageToken = endIndex < files.length ? endIndex.toString() : null;

      return {
        files: paginatedFiles,
        nextPageToken
      };
    } catch (error) {
      throw new Error(`Error listing files: ${error.message}`);
    }
  }

  // Get download URL for a file
  async getDownloadUrl(path) {
    try {
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      throw new Error(`Error getting download URL: ${error.message}`);
    }
  }

  // Set file access control (public/private)
  async setFileAccess(path, isPublic = true) {
    try {
      const metadata = {
        customMetadata: {
          isPublic: isPublic.toString(),
          updatedAt: new Date().toISOString()
        }
      };
      await this.updateFileMetadata(path, metadata);
      return true;
    } catch (error) {
      throw new Error(`Error setting file access: ${error.message}`);
    }
  }

  // Link file with database record
  async linkFileToRecord(filePath, recordId, recordType) {
    try {
      const metadata = {
        customMetadata: {
          recordId,
          recordType,
          linkedAt: new Date().toISOString()
        }
      };
      await this.updateFileMetadata(filePath, metadata);
      return true;
    } catch (error) {
      throw new Error(`Error linking file to record: ${error.message}`);
    }
  }

  // Search files by metadata
  async searchFiles(path = '', searchCriteria = {}) {
    try {
      const { files } = await this.listFiles(path);
      
      return files.filter(file => {
        return Object.entries(searchCriteria).every(([key, value]) => {
          return file.metadata.customMetadata[key] === value;
        });
      });
    } catch (error) {
      throw new Error(`Error searching files: ${error.message}`);
    }
  }

  // Get files by record ID
  async getFilesByRecordId(recordId) {
    try {
      const { files } = await this.listFiles();
      return files.filter(file => 
        file.metadata.customMetadata.recordId === recordId
      );
    } catch (error) {
      throw new Error(`Error getting files by record ID: ${error.message}`);
    }
  }

  // Batch delete files
  async batchDeleteFiles(paths) {
    try {
      await Promise.all(paths.map(path => this.deleteFile(path)));
      return true;
    } catch (error) {
      throw new Error(`Error batch deleting files: ${error.message}`);
    }
  }

  // Get file size and type statistics
  async getFileStats(path = '') {
    try {
      const { files } = await this.listFiles(path);
      
      const stats = {
        totalFiles: files.length,
        totalSize: 0,
        fileTypes: {},
        sizeRanges: {
          '0-1MB': 0,
          '1-5MB': 0,
          '5-10MB': 0,
          '10MB+': 0
        }
      };

      files.forEach(file => {
        const size = parseInt(file.metadata.size);
        stats.totalSize += size;
        
        // Count file types
        const type = file.metadata.contentType;
        stats.fileTypes[type] = (stats.fileTypes[type] || 0) + 1;
        
        // Count size ranges
        if (size <= 1024 * 1024) stats.sizeRanges['0-1MB']++;
        else if (size <= 5 * 1024 * 1024) stats.sizeRanges['1-5MB']++;
        else if (size <= 10 * 1024 * 1024) stats.sizeRanges['5-10MB']++;
        else stats.sizeRanges['10MB+']++;
      });

      return stats;
    } catch (error) {
      throw new Error(`Error getting file stats: ${error.message}`);
    }
  }
} 