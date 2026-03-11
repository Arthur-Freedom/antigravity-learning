/**
 * Set CORS on Firebase Storage bucket using the GCS JSON API.
 * Tries multiple bucket naming patterns for the newer .firebasestorage.app format.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getAccessToken() {
  const loc = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  const config = JSON.parse(fs.readFileSync(loc, 'utf8'));
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: config.tokens.refresh_token,
      client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
    }).toString();
    const req = https.request({
      hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) },
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        const data = JSON.parse(body);
        if (data.access_token) resolve(data.access_token);
        else reject(new Error('Token exchange failed'));
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function gcsRequest(method, apiPath, token, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'storage.googleapis.com',
      path: apiPath,
      method,
      headers: { Authorization: `Bearer ${token}` },
    };
    if (body) {
      const jsonBody = JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(jsonBody);
    }
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Also try the Firebase-specific storage API
function firebaseStorageRequest(method, apiPath, token, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'firebasestorage.googleapis.com',
      path: apiPath,
      method,
      headers: { Authorization: `Bearer ${token}` },
    };
    if (body) {
      const jsonBody = JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(jsonBody);
    }
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const CORS = [
  {
    origin: ['http://localhost:5173', 'http://localhost:4173',
             'https://antigravity-learning.web.app', 'https://antigravity-learning.firebaseapp.com'],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
    maxAgeSeconds: 3600,
    responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'x-goog-resumable', 'x-firebase-appcheck'],
  },
];

async function main() {
  const token = await getAccessToken();
  console.log('✅ Authenticated\n');

  // Step 1: List ALL buckets including Firebase-managed ones
  console.log('📋 Listing ALL buckets...');
  const listResult = await gcsRequest('GET', '/storage/v1/b?project=antigravity-learning&maxResults=50', token);
  
  if (listResult.status === 200) {
    const data = JSON.parse(listResult.body);
    const buckets = (data.items || []).map(b => b.id);
    console.log('Standard GCS buckets:', buckets);
  }

  // Step 2: Try different bucket name formats for the Firebase Storage bucket
  const bucketNames = [
    'antigravity-learning.firebasestorage.app',
    'antigravity-learning.appspot.com',
    'antigravity-learning',
  ];

  for (const bucket of bucketNames) {
    // Try standard GCS API
    console.log(`\n📦 GCS API → ${bucket}`);
    const r1 = await gcsRequest('PATCH', `/storage/v1/b/${encodeURIComponent(bucket)}?fields=cors`, token, { cors: CORS });
    console.log(`  Status: ${r1.status}`);
    if (r1.status === 200) {
      console.log('  ✅ CORS set via GCS API!');
      console.log(JSON.parse(r1.body));
      return;
    } else {
      const err = JSON.parse(r1.body);
      console.log(`  ❌ ${err.error?.message || r1.body.substring(0, 100)}`);
    }

    // Try Firebase Storage API
    console.log(`  Firebase API → ${bucket}`);
    const r2 = await firebaseStorageRequest('PATCH', `/v1beta/projects/antigravity-learning/buckets/${encodeURIComponent(bucket)}`, token, { cors: CORS });
    console.log(`  Status: ${r2.status}`);
    if (r2.status === 200) {
      console.log('  ✅ CORS set via Firebase API!');
      return;
    } else {
      console.log(`  ❌ ${r2.body.substring(0, 150)}`);
    }
  }

  // Step 3: Try using the Firebase Management API to find the default bucket
  console.log('\n📋 Checking Firebase project default bucket...');
  const fbResult = await firebaseStorageRequest('GET', '/v1beta/projects/antigravity-learning/defaultBucket', token);
  console.log('Status:', fbResult.status);
  console.log('Body:', fbResult.body.substring(0, 300));

  console.error('\n❌ Could not set CORS. You may need to install Google Cloud SDK and run:');
  console.error('   gcloud auth login');
  console.error('   gsutil cors set cors.json gs://YOUR_BUCKET_NAME');
}

main().catch(e => console.error('Fatal:', e.message));
