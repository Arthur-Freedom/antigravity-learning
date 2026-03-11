// ── Profile Picture Upload Component ────────────────────────────────────
// A modal dialog for uploading and previewing a custom profile picture.
// Uses service layer only — ZERO direct Firebase imports.

import { getCurrentUser, updateAuthProfile } from '../services/authService';
import { uploadProfilePicture, deleteProfilePicture } from '../services/storageService';
import { updateProfilePhoto, removeProfilePhoto } from '../services/userService';
import { showToast } from './toast';

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

      // Update Firestore via service function (no direct Firestore imports!)
      await updateProfilePhoto(user.uid, downloadURL, downloadURL);
      
      // Update Firebase Auth profile so the photo is immediately available
      // on next load via auth.currentUser and when opening this modal again
      await updateAuthProfile({ photoURL: downloadURL });

      showToast({ message: '📷 Profile picture updated!', type: 'success' });
      closeModal();

      // Refresh UI avatars
      const authAvatar = document.querySelector('.auth-avatar') as HTMLImageElement;
      if (authAvatar) authAvatar.src = downloadURL;

      const profileAvatarImg = document.querySelector('.profile-avatar-img') as HTMLImageElement;
      if (profileAvatarImg) {
        profileAvatarImg.src = downloadURL;
      } else {
        const ring = document.querySelector('.profile-avatar-ring');
        const ph = ring?.querySelector('.profile-avatar-placeholder');
        if (ring && ph) {
          const img = document.createElement('img');
          img.src = downloadURL;
          img.alt = user.displayName ?? 'Avatar';
          img.className = 'profile-avatar-img';
          img.referrerPolicy = 'no-referrer';
          ph.replaceWith(img);
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

      // Update Firestore via service function
      await removeProfilePhoto(user.uid, user.photoURL);

      // Update Firebase Auth profile
      await updateAuthProfile({ photoURL: user.photoURL });

      showToast({ message: 'Profile picture removed', type: 'info' });
      closeModal();

      const authAvatar = document.querySelector('.auth-avatar') as HTMLImageElement;
      if (authAvatar && user.photoURL) authAvatar.src = user.photoURL;
    } catch (error) {
      console.error('[profile-picture] Remove failed:', error);
      showToast({ message: 'Failed to remove photo', type: 'error' });
    } finally {
      removeBtn.disabled = false;
      removeBtn.textContent = 'Remove Current Photo';
    }
  });
}
