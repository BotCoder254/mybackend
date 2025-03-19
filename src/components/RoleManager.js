import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRBAC } from '../contexts/RBACContext';
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const PERMISSION_CATEGORIES = {
  'User Management': [
    'manage:users',
    'read:users',
    'manage:roles',
    'manage:permissions'
  ],
  'Database': [
    'manage:database',
    'read:database'
  ],
  'Files': [
    'manage:files',
    'read:files',
    'delete:files'
  ],
  'Monitoring': [
    'view:activity_logs',
    'view:analytics'
  ]
};

export function RoleManager() {
  const {
    roles,
    permissions,
    loading,
    error,
    createRole,
    deleteRole,
    updateRolePermissions
  } = useRBAC();

  const [newRoleName, setNewRoleName] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (selectedRole) {
      setSelectedPermissions(selectedRole.permissions || []);
      setIsEditing(true);
    } else {
      setSelectedPermissions([]);
      setIsEditing(false);
    }
  }, [selectedRole]);

  const handleCreateRole = async () => {
    try {
      await createRole({
        name: newRoleName,
        permissions: selectedPermissions,
        createdAt: new Date()
      });
      setNewRoleName('');
      setIsCreating(false);
      setSelectedPermissions([]);
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const handleUpdateRole = async () => {
    try {
      await updateRolePermissions(selectedRole.id, selectedPermissions);
      setIsEditing(false);
      setSelectedRole(null);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(roleId);
        setSelectedRole(null);
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const togglePermission = (permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const toggleCategory = (category) => {
    const categoryPermissions = PERMISSION_CATEGORIES[category];
    const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p));
    
    setSelectedPermissions(prev => {
      if (allSelected) {
        return prev.filter(p => !categoryPermissions.includes(p));
      } else {
        const newPermissions = [...prev];
        categoryPermissions.forEach(p => {
          if (!newPermissions.includes(p)) {
            newPermissions.push(p);
          }
        });
        return newPermissions;
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Role List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Roles</h2>
              <div className="space-y-2">
                {roles.map((role) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                      selectedRole?.id === role.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedRole(role)}
                  >
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 mr-2" />
                      <span>{role.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {role.permissions?.length || 0} permissions
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(role.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {isCreating ? 'Create New Role' : selectedRole ? 'Edit Role' : 'Select a Role'}
              </h2>

              {isCreating && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    placeholder="Enter role name"
                  />
                </div>
              )}

              <div className="space-y-6">
                {Object.entries(PERMISSION_CATEGORIES).map(([category, categoryPermissions]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{category}</h3>
                      <button
                        onClick={() => toggleCategory(category)}
                        className="text-sm text-primary hover:text-primary-dark"
                      >
                        {categoryPermissions.every(p => selectedPermissions.includes(p))
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {categoryPermissions.map((permission) => (
                        <motion.div
                          key={permission}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-center p-3 rounded-lg cursor-pointer ${
                            selectedPermissions.includes(permission)
                              ? 'bg-primary text-white'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => togglePermission(permission)}
                        >
                          {selectedPermissions.includes(permission) ? (
                            <CheckIcon className="h-5 w-5 mr-2" />
                          ) : (
                            <XMarkIcon className="h-5 w-5 mr-2" />
                          )}
                          <span className="text-sm">{permission}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {(isCreating || isEditing) && (
                  <>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setIsEditing(false);
                        setSelectedRole(null);
                        setNewRoleName('');
                        setSelectedPermissions([]);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={isCreating ? handleCreateRole : handleUpdateRole}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      {isCreating ? 'Create Role' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 