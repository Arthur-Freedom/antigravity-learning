// ── Profile Picture Upload Component ────────────────────────────────────
// A modal dialog for uploading and previewing a custom profile picture.
// Shows a live preview with crop circle before confirming upload.

import { getCurrentUser } from '../auth';
import { uploadProfilePicture, deleteProfilePicture } from '../storage';
import { showToast } from './toast';
import { doc, getFirestore, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getApps, getApp, initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

let modalElement: HTMLElement | null = null;

/**
 * Opens the profile picture upload modal.
 */
export function openProfilePictureModal(): void {
  const user = getCurrentUser();
  if (!user) {
    showToast({ message: 'Please sign in first', type: 'warning' });
    return;
  }

  // Prevent duplicates
  if (modalElement) return;

  const currentPhoto = user.photoURL;

  const overlay = document.createElement('div');
  overlay.className = 'pfp-modal-overlay';
  overlay.innerHTML = `
    <div class="pfp-modal" role="dialog" aria-label="Upload profile picture">
      <button class="pfp-modal-close" aria-label="Close">&times;</button>
      
      <div class="pfp-modal-header">
        <h3>Profile Picture</h3>
        <p>Upload a custom avatar to replace your Google photo</p>
      </div>

      <div class="pfp-preview-area">
        <div class="pfp-preview-ring">
          <img 
            id="pfp-preview-img" 
            src="${currentPhoto ?? ''}" 
            alt="Preview" 
            class="${currentPhoto ? '' : 'pfp-hidden'}"
          />
          <div id="pfp-preview-placeholder" class="pfp-preview-placeholder ${currentPhoto ? 'pfp-hidden' : ''}">
            <span class="pfp-preview-icon">📷</span>
            <span>No image selected</span>
          </div>
        </div>
      </div>

      <div class="pfp-drop-zone" id="pfp-drop-zone">
        <div class="pfp-drop-content">
          <span class="pfp-drop-icon">☁️</span>
          <span class="pfp-drop-text">Drag & drop an image here</span>
          <span class="pfp-drop-sub">or</span>
          <label class="btn pfp-browse-btn" for="pfp-file-input">Browse Files</label>
          <input 
            type="file" 
            id="pfp-file-input" 
            accept="image/jpeg,image/png,image/webp,image/gif" 
            hidden 
          />
          <span class="pfp-drop-hint">JPEG, PNG, WebP or GIF · Max 5 MB</span>
        </div>
      </div>

      <div class="pfp-actions">
        <button id="pfp-upload-btn" class="btn pfp-btn-upload" disabled>
          <span class="pfp-btn-text">Upload Photo</span>
          <span class="pfp-spinner pfp-hidden" id="pfp-spinner"></span>
        </button>
        <button id="pfp-remove-btn" class="btn pfp-btn-remove" ${currentPhoto ? '' : 'style="display:none"'}>
          Remove Current Photo
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  modalElement = overlay;

  // Force reflow then animate in
  requestAnimationFrame(() => overlay.classList.add('pfp-modal-visible'));

  // ── Event Binding ────────────────────────────────────────────────────
  const closeBtn = overlay.querySelector('.pfp-modal-close')!;
  const fileInput = overlay.querySelector('#pfp-file-input') as HTMLInputElement;
  const dropZone = overlay.querySelector('#pfp-drop-zone')!;
  const previewImg = overlay.querySelector('#pfp-preview-img') as HTMLImageElement;
  const placeholder = overlay.querySelector('#pfp-preview-placeholder')!;
  const uploadBtn = overlay.querySelector('#pfp-upload-btn') as HTMLButtonElement;
  const removeBtn = overlay.querySelector('#pfp-remove-btn') as HTMLButtonElement;
  const spinner = overlay.querySelector('#pfp-spinner')!;
  const btnText = overlay.querySelector('.pfp-btn-text')!;

  let selectedFile: File | null = null;

  // Close modal
  const closeModal = () => {
    overlay.classList.remove('pfp-modal-visible');
    setTimeout(() => {
      overlay.remove();
      modalElement = null;
    }, 300);
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // File selection
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast({ message: 'Please select an image file', type: 'warning' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast({ message: 'File too large. Maximum 5 MB.', type: 'warning' });
      return;
    }

    selectedFile = file;
    const url = URL.createObjectURL(file);
    previewImg.src = url;
    previewImg.classList.remove('pfp-hidden');
    placeholder.classList.add('pfp-hidden');
    uploadBtn.disabled = false;

    // Cleanup old URL
    previewImg.onload = () => URL.revokeObjectURL(url);
  };

  fileInput.addEventListener('change', () => {
    if (fileInput.files?.[0]) handleFile(fileInput.files[0]);
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('pfp-drop-active');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('pfp-drop-active');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('pfp-drop-active');
    const dragEvent = e as DragEvent;
    const file = dragEvent.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });

  // Upload
  uploadBtn.addEventListener('click', async () => {
    if (!selectedFile || !user) return;

    uploadBtn.disabled = true;
    spinner.classList.remove('pfp-hidden');
    btnText.textContent = 'Uploading...';

    try {
      const downloadURL = await uploadProfilePicture(user.uid, selectedFile);

      // Update Firestore user document with new photoURL
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: downloadURL,
        customPhotoURL: downloadURL,
        updatedAt: serverTimestamp(),
      });

      showToast({ message: '📷 Profile picture updated!', type: 'success' });
      closeModal();

      // Refresh the auth button avatar
      const authAvatar = document.querySelector('.auth-avatar') as HTMLImageElement;
      if (authAvatar) {
        authAvatar.src = downloadURL;
      }

      // Refresh the profile page avatar (the big circle)
      const profileAvatarImg = document.querySelector('.profile-avatar-img') as HTMLImageElement;
      if (profileAvatarImg) {
        profileAvatarImg.src = downloadURL;
      } else {
        // Replace placeholder with actual image
        const ring = document.querySelector('.profile-avatar-ring');
        const placeholder = ring?.querySelector('.profile-avatar-placeholder');
        if (ring && placeholder) {
          const img = document.createElement('img');
          img.src = downloadURL;
          img.alt = user.displayName ?? 'Avatar';
          img.className = 'profile-avatar-img';
          img.referrerPolicy = 'no-referrer';
          placeholder.replaceWith(img);
        }
      }
    } catch (error) {
      console.error('[profile-picture] Upload failed:', error);
      showToast({
        message: error instanceof Error ? error.message : 'Upload failed',
        type: 'error',
      });
    } finally {
      uploadBtn.disabled = false;
      spinner.classList.add('pfp-hidden');
      btnText.textContent = 'Upload Photo';
    }
  });

  // Remove photo
  removeBtn.addEventListener('click', async () => {
    if (!user) return;

    removeBtn.disabled = true;
    removeBtn.textContent = 'Removing...';

    try {
      await deleteProfilePicture(user.uid);

      // Revert to Google photo
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: user.photoURL, // Revert to Google photo
        customPhotoURL: null,
        updatedAt: serverTimestamp(),
      });

      showToast({ message: 'Profile picture removed', type: 'info' });
      closeModal();

      // Refresh the auth button avatar
      const authAvatar = document.querySelector('.auth-avatar') as HTMLImageElement;
      if (authAvatar && user.photoURL) {
        authAvatar.src = user.photoURL;
      }
    } catch (error) {
      console.error('[profile-picture] Remove failed:', error);
      showToast({ message: 'Failed to remove photo', type: 'error' });
    } finally {
      removeBtn.disabled = false;
      removeBtn.textContent = 'Remove Current Photo';
    }
  });
}
