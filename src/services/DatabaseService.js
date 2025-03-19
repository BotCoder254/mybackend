import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  setDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

export class DatabaseService {
  constructor(collectionName) {
    if (!collectionName) {
      throw new Error('Collection name is required');
    }
    this.collectionName = collectionName;
    this.collectionRef = collection(db, collectionName);
  }

  // Schema Management
  async createSchema(schema) {
    try {
      const schemaRef = doc(db, 'schemas', this.collectionName);
      await setDoc(schemaRef, {
        schema,
        updatedAt: serverTimestamp()
      });
      return schema;
    } catch (error) {
      console.error('Error creating schema:', error);
      throw error;
    }
  }

  async getSchema() {
    try {
      const schemaRef = doc(db, 'schemas', this.collectionName);
      const schemaDoc = await getDoc(schemaRef);
      return schemaDoc.exists() ? schemaDoc.data().schema : null;
    } catch (error) {
      console.error('Error getting schema:', error);
      throw error;
    }
  }

  // CRUD Operations
  async createDocument(data) {
    try {
      const docRef = await addDoc(this.collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async getDocument(id) {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  async updateDocument(id, data) {
    try {
      const docRef = doc(this.collectionRef, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  async deleteDocument(id) {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Query Operations
  async queryDocuments(filters = [], sort = null, limitCount = null) {
    try {
      let q = query(this.collectionRef);
      
      // Apply filters
      filters.forEach(({ field, operator, value }) => {
        q = query(q, where(field, operator, value));
      });

      // Apply sorting
      if (sort) {
        q = query(q, orderBy(sort.field, sort.direction));
      }

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }

  // Pagination
  async getPaginatedDocuments(pageSize = 10, lastDoc = null) {
    try {
      let q = query(this.collectionRef, limit(pageSize));
      
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      const hasMore = querySnapshot.docs.length === pageSize;

      return {
        documents,
        lastVisible,
        hasMore
      };
    } catch (error) {
      console.error('Error getting paginated documents:', error);
      throw error;
    }
  }

  // Real-time Updates
  subscribeToUpdates(callback) {
    try {
      const q = query(this.collectionRef);
      return onSnapshot(q, (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(documents);
      });
    } catch (error) {
      console.error('Error subscribing to updates:', error);
      throw error;
    }
  }

  // Search with Indexing
  async searchDocuments(searchField, searchTerm, limitCount = 10) {
    try {
      const q = query(
        this.collectionRef,
        where(searchField, '>=', searchTerm),
        where(searchField, '<=', searchTerm + '\uf8ff'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  // Batch Operations
  async batchCreate(documents) {
    try {
      const batch = writeBatch(db);
      const createdDocs = [];

      documents.forEach(doc => {
        const docRef = doc(this.collectionRef);
        batch.set(docRef, {
          ...doc,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        createdDocs.push(docRef);
      });

      await batch.commit();
      return createdDocs;
    } catch (error) {
      console.error('Error batch creating documents:', error);
      throw error;
    }
  }

  async batchUpdate(updates) {
    try {
      const batch = writeBatch(db);

      updates.forEach(({ id, data }) => {
        const docRef = doc(this.collectionRef, id);
        batch.update(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      return updates;
    } catch (error) {
      console.error('Error batch updating documents:', error);
      throw error;
    }
  }

  async batchDelete(ids) {
    try {
      const batch = writeBatch(db);

      ids.forEach(id => {
        const docRef = doc(this.collectionRef, id);
        batch.delete(docRef);
      });

      await batch.commit();
      return ids;
    } catch (error) {
      console.error('Error batch deleting documents:', error);
      throw error;
    }
  }
} 