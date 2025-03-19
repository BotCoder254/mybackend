import { auth } from '../config/firebase';
import { getIdToken } from 'firebase/auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export class ApiGatewayService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getAuthToken() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    return await getIdToken(user);
  }

  async request(endpoint, options = {}) {
    try {
      const token = await this.getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Database Operations
  async getCollection(collectionName, filters = []) {
    return this.request(`/api/${collectionName}`, {
      method: 'GET',
      params: { filters }
    });
  }

  async createDocument(collectionName, data) {
    return this.request(`/api/${collectionName}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateDocument(collectionName, id, data) {
    return this.request(`/api/${collectionName}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteDocument(collectionName, id) {
    return this.request(`/api/${collectionName}/${id}`, {
      method: 'DELETE'
    });
  }

  // File Operations
  async uploadFile(file, path = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    return this.request('/api/files/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    });
  }

  async getFileMetadata(path) {
    return this.request(`/api/files/metadata/${encodeURIComponent(path)}`);
  }

  async deleteFile(path) {
    return this.request(`/api/files/${encodeURIComponent(path)}`, {
      method: 'DELETE'
    });
  }

  // Schema Operations
  async getSchema(collectionName) {
    return this.request(`/api/schemas/${collectionName}`);
  }

  async updateSchema(collectionName, schema) {
    return this.request(`/api/schemas/${collectionName}`, {
      method: 'PUT',
      body: JSON.stringify(schema)
    });
  }

  // Search Operations
  async search(collectionName, searchTerm, fields = []) {
    return this.request(`/api/search/${collectionName}`, {
      method: 'GET',
      params: { searchTerm, fields }
    });
  }

  // Batch Operations
  async batchCreate(collectionName, documents) {
    return this.request(`/api/${collectionName}/batch`, {
      method: 'POST',
      body: JSON.stringify({ documents })
    });
  }

  async batchUpdate(collectionName, updates) {
    return this.request(`/api/${collectionName}/batch`, {
      method: 'PUT',
      body: JSON.stringify({ updates })
    });
  }

  async batchDelete(collectionName, ids) {
    return this.request(`/api/${collectionName}/batch`, {
      method: 'DELETE',
      body: JSON.stringify({ ids })
    });
  }
} 