const admin = require('firebase-admin');
admin.initializeApp({
  projectId: 'antigravity-learning-dev'
});
const db = admin.firestore();
db.collection('users').add({
  displayName: 'Test User',
  email: 'test@example.com',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
}).then(() => {
  console.log('Test user created');
  process.exit(0);
}).catch(console.error);
