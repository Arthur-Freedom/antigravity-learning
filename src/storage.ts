// ── Firebase Storage — Profile Picture Uploads ─────────────────────────
// Handles uploading, compressing, and retrieving custom profile pictures.
// Files are stored at: profilePictures/{uid}/avatar.{ext}

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  type FirebaseStorage,
} from 'firebase/storage';

// ── Firebase app (reuse existing instance) ──────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const storage: FirebaseStorage = getStorage(app);

// ── Constants ───────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_DIMENSION = 512; // px — resize to this for avatars

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Upload a profile picture for the given user.
 * The image is resized client-side before upload for fast loading.
 *
 * @returns The public download URL of the uploaded image.
 */
export async function uploadProfilePicture(
  uid: string,
  file: File
): Promise<string> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, GIF.`
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: 5 MB.`
    );
  }

  // Resize the image client-side
  const resizedBlob = await resizeImage(file, MAX_DIMENSION);

  // Determine extension from original type
  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];

  // Upload to Firebase Storage
  const storageRef = ref(storage, `profilePictures/${uid}/avatar.${ext}`);
  const metadata = {
    contentType: file.type,
    customMetadata: {
      uploadedAt: new Date().toISOString(),
      originalName: file.name,
    },
  };

  // Wrap with timeout — Firebase Storage can hang indefinitely when
  // App Check token exchange fails (403), so we fail fast after 30s.
  await withTimeout(
    uploadBytes(storageRef, resizedBlob, metadata),
    30_000,
    'Upload timed out. This may be caused by a network issue or App Check configuration. Please try again.'
  );
  const downloadURL = await withTimeout(
    getDownloadURL(storageRef),
    10_000,
    'Failed to get download URL. Please try again.'
  );

  console.info('[storage] Profile picture uploaded:', downloadURL);
  return downloadURL;
}

/**
 * Get the profile picture URL for a user.
 * Returns null if no custom picture exists.
 */
export async function getProfilePictureURL(uid: string): Promise<string | null> {
  const extensions = ['jpg', 'png', 'webp', 'gif'];

  for (const ext of extensions) {
    try {
      const storageRef = ref(storage, `profilePictures/${uid}/avatar.${ext}`);
      return await getDownloadURL(storageRef);
    } catch {
      // File doesn't exist with this extension, try next
      continue;
    }
  }

  return null;
}

/**
 * Delete the user's profile picture from Storage.
 */
export async function deleteProfilePicture(uid: string): Promise<void> {
  const extensions = ['jpg', 'png', 'webp', 'gif'];

  for (const ext of extensions) {
    try {
      const storageRef = ref(storage, `profilePictures/${uid}/avatar.${ext}`);
      await deleteObject(storageRef);
      console.info('[storage] Deleted profile picture:', ext);
      return;
    } catch {
      continue;
    }
  }
}

// ── Client-side Image Resize ────────────────────────────────────────────

/**
 * Resizes an image file to fit within maxDim × maxDim while preserving
 * aspect ratio. Returns a Blob of the resized image.
 */
function resizeImage(file: File, maxDim: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Only resize if larger than max
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height / width) * maxDim);
          width = maxDim;
        } else {
          width = Math.round((width / height) * maxDim);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      // High quality resize
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to resize image'));
          }
        },
        file.type,
        0.85 // Quality for JPEG/WebP
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for resizing'));
    };

    img.src = url;
  });
}

// ── Timeout utility ─────────────────────────────────────────────────────

/**
 * Wraps a promise with a timeout. Rejects with the given message
 * if the promise doesn't resolve within `ms` milliseconds.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}
