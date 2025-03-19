import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const RealtimeContext = createContext();

export function useRealtime() {
  return useContext(RealtimeContext);
}

export function RealtimeProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [subscribers, setSubscribers] = useState({});

  const subscribeToCollection = (collectionName, filters = [], callback) => {
    try {
      let q = query(collection(db, collectionName));
      
      // Apply filters
      filters.forEach(({ field, operator, value }) => {
        q = query(q, where(field, operator, value));
      });

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const changes = snapshot.docChanges();
        changes.forEach((change) => {
          if (change.type === 'added') {
            toast.success(`New ${collectionName} added`);
          } else if (change.type === 'modified') {
            toast.info(`${collectionName} updated`);
          } else if (change.type === 'removed') {
            toast.error(`${collectionName} deleted`);
          }
        });
        callback(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      });

      setSubscribers(prev => ({
        ...prev,
        [collectionName]: unsubscribe
      }));

      return unsubscribe;
    } catch (error) {
      console.error(`Error subscribing to ${collectionName}:`, error);
      toast.error(`Error subscribing to ${collectionName}`);
      return null;
    }
  };

  const unsubscribeFromCollection = (collectionName) => {
    if (subscribers[collectionName]) {
      subscribers[collectionName]();
      setSubscribers(prev => {
        const newSubscribers = { ...prev };
        delete newSubscribers[collectionName];
        return newSubscribers;
      });
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup all subscriptions on unmount
      Object.values(subscribers).forEach(unsubscribe => unsubscribe());
    };
  }, [subscribers]);

  const value = {
    subscribeToCollection,
    unsubscribeFromCollection,
    notifications
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            {notification.content}
          </motion.div>
        ))}
      </AnimatePresence>
    </RealtimeContext.Provider>
  );
} 