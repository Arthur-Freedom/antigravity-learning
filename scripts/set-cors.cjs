// Quick script to set CORS on the Firebase Storage bucket.
// Uses the @google-cloud/storage from the functions directory.

const { resolve } = require('path');

// Point to the functions node_modules
const functionsModules = resolve(__dirname, '..', 'functions', 'node_modules');
const { Storage } = require(resolve(functionsModules, '@google-cloud/storage'));

const BUCKET = 'antigravity-learning.firebasestorage.app';

async function main() {
  const storage = new Storage({ projectId: 'antigravity-learning' });
  const bucket = storage.bucket(BUCKET);

  await bucket.setCorsConfiguration([
    {
      origin: [
        'http://localhost:5173',
        'http://localhost:4173',
        'https://antigravity-learning.web.app',
        'https://antigravity-learning.firebaseapp.com',
      ],
      method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
      maxAgeSeconds: 3600,
      responseHeader: [
        'Content-Type',
        'Authorization',
        'Content-Length',
        'x-goog-resumable',
        'x-firebase-appcheck',
      ],
    },
  ]);

  console.log('✅ CORS set on', BUCKET);
}

main().catch((err) => {
  console.error('❌', err.message);
  if (err.message.includes('default credentials')) {
    console.log('\nRun: gcloud auth application-default login');
  }
});
