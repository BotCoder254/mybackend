const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Activity Logging Functions
exports.logUserActivity = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    let action = 'update';
    if (!change.before.exists) {
      action = 'create';
    } else if (!change.after.exists) {
      action = 'delete';
    }

    const activityLog = {
      userId,
      userEmail: afterData?.email || beforeData?.email,
      action,
      resourceType: 'user',
      resourceName: afterData?.email || beforeData?.email,
      timestamp,
      details: {
        before: beforeData,
        after: afterData
      }
    };

    await admin.firestore().collection('activity_logs').add(activityLog);
  });

exports.logDocumentActivity = functions.firestore
  .document('{collection}/{docId}')
  .onWrite(async (change, context) => {
    const { collection, docId } = context.params;
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    let action = 'update';
    if (!change.before.exists) {
      action = 'create';
    } else if (!change.after.exists) {
      action = 'delete';
    }

    const activityLog = {
      docId,
      collection,
      action,
      resourceType: 'document',
      resourceName: `${collection}/${docId}`,
      timestamp,
      details: {
        before: beforeData,
        after: afterData
      }
    };

    await admin.firestore().collection('activity_logs').add(activityLog);
  });

exports.logFileActivity = functions.storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const metadata = object.metadata || {};

    const activityLog = {
      filePath,
      action: 'create',
      resourceType: 'file',
      resourceName: filePath,
      timestamp,
      details: {
        contentType: object.contentType,
        size: object.size,
        metadata
      }
    };

    await admin.firestore().collection('activity_logs').add(activityLog);
  });

exports.logFileDelete = functions.storage
  .object()
  .onDelete(async (object) => {
    const filePath = object.name;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const activityLog = {
      filePath,
      action: 'delete',
      resourceType: 'file',
      resourceName: filePath,
      timestamp,
      details: {
        contentType: object.contentType,
        size: object.size
      }
    };

    await admin.firestore().collection('activity_logs').add(activityLog);
  });

// Analytics Functions
exports.updateResourceUsage = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const db = admin.firestore();

    // Get total documents count
    const collections = await db.listCollections();
    let totalDocuments = 0;
    for (const collection of collections) {
      const snapshot = await collection.count().get();
      totalDocuments += snapshot.data().count;
    }

    // Get total files count and size
    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles();
    const totalFiles = files.length;
    const totalSize = files.reduce((acc, file) => acc + file.metadata.size, 0);

    // Get active users count (users who have activity in the last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const activeUsersSnapshot = await db
      .collection('activity_logs')
      .where('timestamp', '>=', oneDayAgo)
      .get();
    const activeUsers = new Set(activeUsersSnapshot.docs.map(doc => doc.data().userId)).size;

    // Store resource usage data
    await db.collection('resource_usage').add({
      timestamp,
      documents: totalDocuments,
      files: totalFiles,
      storage: totalSize,
      activeUsers
    });

    // Clean up old data (keep last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const oldDataSnapshot = await db
      .collection('resource_usage')
      .where('timestamp', '<', ninetyDaysAgo)
      .get();
    
    const batch = db.batch();
    oldDataSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  });

exports.updateApiUsage = functions.https
  .onRequest(async (req, res) => {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const db = admin.firestore();

    // Log API call
    await db.collection('api_logs').add({
      timestamp,
      method: req.method,
      path: req.path,
      userId: req.user?.uid,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    // Clean up old data (keep last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const oldDataSnapshot = await db
      .collection('api_logs')
      .where('timestamp', '<', ninetyDaysAgo)
      .get();
    
    const batch = db.batch();
    oldDataSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.status(200).send('OK');
  }); 