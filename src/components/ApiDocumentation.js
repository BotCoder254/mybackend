import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ServerIcon,
  DocumentIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  QueueListIcon,
  DocumentDuplicateIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const endpointCategories = [
  {
    name: 'Database',
    icon: ServerIcon,
    endpoints: [
      {
        name: 'Get Collection',
        method: 'GET',
        path: '/api/{collectionName}',
        description: 'Retrieve all documents from a collection',
        params: [
          { name: 'collectionName', type: 'string', required: true },
          { name: 'filters', type: 'array', required: false }
        ]
      },
      {
        name: 'Create Document',
        method: 'POST',
        path: '/api/{collectionName}',
        description: 'Create a new document in a collection',
        params: [
          { name: 'collectionName', type: 'string', required: true },
          { name: 'data', type: 'object', required: true }
        ]
      },
      {
        name: 'Update Document',
        method: 'PUT',
        path: '/api/{collectionName}/{id}',
        description: 'Update an existing document',
        params: [
          { name: 'collectionName', type: 'string', required: true },
          { name: 'id', type: 'string', required: true },
          { name: 'data', type: 'object', required: true }
        ]
      },
      {
        name: 'Delete Document',
        method: 'DELETE',
        path: '/api/{collectionName}/{id}',
        description: 'Delete a document',
        params: [
          { name: 'collectionName', type: 'string', required: true },
          { name: 'id', type: 'string', required: true }
        ]
      }
    ]
  },
  {
    name: 'Files',
    icon: FolderIcon,
    endpoints: [
      {
        name: 'Upload File',
        method: 'POST',
        path: '/api/files/upload',
        description: 'Upload a new file',
        params: [
          { name: 'file', type: 'file', required: true },
          { name: 'path', type: 'string', required: false }
        ]
      },
      {
        name: 'Get File Metadata',
        method: 'GET',
        path: '/api/files/metadata/{path}',
        description: 'Get metadata for a file',
        params: [
          { name: 'path', type: 'string', required: true }
        ]
      },
      {
        name: 'Delete File',
        method: 'DELETE',
        path: '/api/files/{path}',
        description: 'Delete a file',
        params: [
          { name: 'path', type: 'string', required: true }
        ]
      }
    ]
  },
  {
    name: 'Schema',
    icon: DocumentIcon,
    endpoints: [
      {
        name: 'Get Schema',
        method: 'GET',
        path: '/api/schemas/{collectionName}',
        description: 'Get schema for a collection',
        params: [
          { name: 'collectionName', type: 'string', required: true }
        ]
      },
      {
        name: 'Update Schema',
        method: 'PUT',
        path: '/api/schemas/{collectionName}',
        description: 'Update schema for a collection',
        params: [
          { name: 'collectionName', type: 'string', required: true },
          { name: 'schema', type: 'object', required: true }
        ]
      }
    ]
  },
  {
    name: 'Search',
    icon: MagnifyingGlassIcon,
    endpoints: [
      {
        name: 'Search Documents',
        method: 'GET',
        path: '/api/search/{collectionName}',
        description: 'Search documents in a collection',
        params: [
          { name: 'collectionName', type: 'string', required: true },
          { name: 'searchTerm', type: 'string', required: true },
          { name: 'fields', type: 'array', required: false }
        ]
      }
    ]
  },
  {
    name: 'Batch Operations',
    icon: QueueListIcon,
    endpoints: [
      {
        name: 'Batch Create',
        method: 'POST',
        path: '/api/{collectionName}/batch',
        description: 'Create multiple documents',
        params: [
          { name: 'collectionName', type: 'string', required: true },
          { name: 'documents', type: 'array', required: true }
        ]
      },
      {
        name: 'Batch Update',
        method: 'PUT',
        path: '/api/{collectionName}/batch',
        description: 'Update multiple documents',
        params: [
          { name: 'collectionName', type: 'string', required: true },
          { name: 'updates', type: 'array', required: true }
        ]
      },
      {
        name: 'Batch Delete',
        method: 'DELETE',
        path: '/api/{collectionName}/batch',
        description: 'Delete multiple documents',
        params: [
          { name: 'collectionName', type: 'string', required: true },
          { name: 'ids', type: 'array', required: true }
        ]
      }
    ]
  }
];

export function ApiDocumentation() {
  const [selectedCategory, setSelectedCategory] = useState(endpointCategories[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = endpointCategories.map(category => ({
    ...category,
    endpoints: category.endpoints.filter(endpoint =>
      endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.endpoints.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search endpoints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="flex space-x-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {filteredCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category)}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  selectedCategory.name === category.name
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <category.icon className="h-5 w-5 mr-3" />
                {category.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {selectedCategory.name} Endpoints
              </h2>
              <div className="space-y-8">
                {selectedCategory.endpoints.map((endpoint) => (
                  <motion.div
                    key={endpoint.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-gray-200 pb-8 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {endpoint.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          endpoint.method === 'GET'
                            ? 'bg-green-100 text-green-800'
                            : endpoint.method === 'POST'
                            ? 'bg-blue-100 text-blue-800'
                            : endpoint.method === 'PUT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {endpoint.method}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{endpoint.description}</p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <code className="text-sm text-gray-800">{endpoint.path}</code>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Parameters
                      </h4>
                      <ul className="space-y-2">
                        {endpoint.params.map((param) => (
                          <li key={param.name} className="flex items-start">
                            <span className="text-sm font-medium text-gray-900 mr-2">
                              {param.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({param.type})
                              {param.required && (
                                <span className="text-red-500 ml-1">required</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 