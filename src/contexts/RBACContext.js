import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const RBACContext = createContext();

const DEFAULT_PERMISSIONS = {
  admin: [
    'manage:users',
    'manage:roles',
    'manage:permissions',
    'manage:database',
    'manage:files',
    'view:activity_logs',
    'view:analytics'
  ],
  editor: [
    'read:users',
    'manage:database',
    'manage:files',
    'view:activity_logs'
  ],
  viewer: [
    'read:database',
    'read:files',
    'view:activity_logs'
  ]
};

export function RBACProvider({ children }) {
  const { currentUser } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchRolesAndPermissions();
    }
  }, [currentUser]);

  const fetchRolesAndPermissions = async () => {
    try {
      setLoading(true);
      const rolesRef = collection(db, 'roles');
      const rolesQuery = query(rolesRef);
      const rolesSnapshot = await getDocs(rolesQuery);
      const rolesData = rolesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoles(rolesData);

      // Get unique permissions from all roles
      const allPermissions = new Set();
      rolesData.forEach(role => {
        role.permissions?.forEach(permission => allPermissions.add(permission));
      });
      setPermissions(Array.from(allPermissions));

      // Fetch user's role
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    } catch (error) {
      console.error('Error fetching roles and permissions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission) => {
    const userRole = roles.find(role => role.id === 'user')?.permissions || [];
    return userRole.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions) => {
    const userRole = roles.find(role => role.id === 'user')?.permissions || [];
    return requiredPermissions.some(permission => userRole.includes(permission));
  };

  const hasAllPermissions = (requiredPermissions) => {
    const userRole = roles.find(role => role.id === 'user')?.permissions || [];
    return requiredPermissions.every(permission => userRole.includes(permission));
  };

  const updateUserRole = async (userId, roleId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: roleId
      });
      await fetchRolesAndPermissions();
    } catch (error) {
      console.error('Error updating user role:', error);
      setError(error.message);
      throw error;
    }
  };

  const updateRolePermissions = async (roleId, permissions) => {
    try {
      const roleRef = doc(db, 'roles', roleId);
      await updateDoc(roleRef, {
        permissions
      });
      await fetchRolesAndPermissions();
    } catch (error) {
      console.error('Error updating role permissions:', error);
      setError(error.message);
      throw error;
    }
  };

  const createRole = async (roleData) => {
    try {
      const roleRef = doc(collection(db, 'roles'));
      await setDoc(roleRef, {
        ...roleData,
        createdAt: new Date()
      });
      await fetchRolesAndPermissions();
    } catch (error) {
      console.error('Error creating role:', error);
      setError(error.message);
      throw error;
    }
  };

  const deleteRole = async (roleId) => {
    try {
      const roleRef = doc(db, 'roles', roleId);
      await deleteDoc(roleRef);
      await fetchRolesAndPermissions();
    } catch (error) {
      console.error('Error deleting role:', error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    roles,
    permissions,
    userRole,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    updateUserRole,
    updateRolePermissions,
    createRole,
    deleteRole,
    fetchRolesAndPermissions
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
}

export function useRBAC() {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within a RBACProvider');
  }
  return context;
} 