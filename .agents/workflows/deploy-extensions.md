---
description: How to deploy Firebase Extensions (Delete User Data, Resize Images, Trigger Email, Distributed Counter)
---

# Deploy Firebase Extensions

## ⚠️ Critical: Environment-Specific Regions

The biggest gotcha with Firebase Extensions is that **dev and prod use different Firestore regions**. The CLI shares one env file per extension across all projects, so you MUST verify the region before deploying.

| Project | Firestore Region | Cloud Functions Location |
|---|---|---|
| `antigravity-learning-dev` | `nam5` | `us-central1` |
| `antigravity-learning` (prod) | `asia-southeast1` | `us-central1` |

Extensions that reference Firestore (like `firestore-send-email`) have a `DATABASE_REGION` param that **must match the project's Firestore region** — NOT the Cloud Functions location.

> **Rule of thumb:** `firebaseextensions.v1beta.function/location` = where the Cloud Function runs (always `us-central1`). `DATABASE_REGION` or `FIRESTORE_DATABASE_REGION` = where the Firestore database lives (varies per project).

---

## Installed Extensions

| Extension | Instance ID | Config File | Notes |
|---|---|---|---|
| Delete User Data | `delete-user-data` | `extensions/delete-user-data.env` | Bucket is hardcoded to prod |
| Resize Images | `storage-resize-images` | `extensions/storage-resize-images.env` | Bucket is hardcoded to prod |
| Trigger Email | `firestore-send-email` | `extensions/firestore-send-email.env` | SMTP password in URI (plaintext) |
| Distributed Counter | `firestore-counter` | `extensions/firestore-counter.env` | No region-specific params |

All extensions are registered in `firebase.json` under the `"extensions"` key.

---

## Step-by-Step: Deploy Extensions

### 1. Verify the region in env files

Before deploying, check that region params match the **target project**:

```bash
# Check which region values are set
grep -r "REGION\|LOCATION" extensions/
```

Update `DATABASE_REGION` in `extensions/firestore-send-email.env`:
- **Dev:** `DATABASE_REGION=nam5`
- **Prod:** `DATABASE_REGION=asia-southeast1`

### 2. Deploy to dev first

```bash
# Deploy all extensions to dev
// turbo
npx firebase-tools deploy --only extensions --project antigravity-learning-dev
```

### 3. Verify on dev

- Check Firebase Console: https://console.firebase.google.com/u/0/project/antigravity-learning-dev/extensions
- All extensions should show ✅ Installed
- Test email: create a doc in `ext_mail` collection (see Testing section below)

### 4. Switch region and deploy to prod

```bash
# IMPORTANT: Update DATABASE_REGION in firestore-send-email.env to asia-southeast1

# Deploy all extensions to prod
npx firebase-tools deploy --only extensions --project antigravity-learning
```

### 5. Verify on prod

- Check Firebase Console: https://console.firebase.google.com/u/0/project/antigravity-learning/extensions
- All extensions should show ✅ Installed

### 6. Restore dev region

After deploying to prod, **restore** `DATABASE_REGION=nam5` in the env file so dev deploys work next time.

---

## Testing the Email Extension

Create a document in the `ext_mail` collection with this structure:

```json
{
  "to": "yasseen.de.herdt@gmail.com",
  "message": {
    "subject": "Test from Trigger Email Extension",
    "html": "<h1>It works!</h1><p>Sent by the extension.</p>",
    "text": "It works! Sent by the extension."
  }
}
```

The extension will:
1. Pick up the document within seconds
2. Send the email via Gmail SMTP
3. Add a `delivery` field to the document with status (`SUCCESS` or `ERROR`)

---

## Common Errors & Fixes

### "Database '(default)' does not exist in region X"

**Cause:** `DATABASE_REGION` doesn't match the project's Firestore location.
**Fix:** Set `DATABASE_REGION` to `nam5` (dev) or `asia-southeast1` (prod).

### "param LOCATION is immutable and cannot be updated"

**Cause:** Trying to change an extension's `LOCATION` param after installation.
**Fix:** Uninstall the extension from the Console, then reinstall with the correct LOCATION.

### "Found 'xxx' for secret param, but expected a secret version"

**Cause:** A param marked as `secret` type can't be plaintext in the env file.
**Fix:** Either embed the password in the connection URI (like `SMTP_CONNECTION_URI`) or use Firebase Secret Manager.

### "this instance already has an ongoing operation"

**Cause:** A previous install/configure/uninstall is still running on that extension.
**Fix:** Wait 5-10 minutes for the operation to finish, then retry. Check status in the Console.

### CLI deploy hangs or fails due to unrelated extension

**Cause:** `--only extensions` deploys ALL extensions together. If one has issues, all fail.
**Fix:** Firebase CLI doesn't support `--only extensions:instance-name`. Workaround: install/configure the extension individually via the Firebase Console.

---

## Security Notes

- `SMTP_CONNECTION_URI` in `firestore-send-email.env` contains the Gmail App Password in plaintext. This file is committed to git.
- Consider using Firebase Secret Manager for credentials in production.
- The `ext_mail` collection has deny-all Firestore rules — only the extension's service account can access it.
- The existing `mail` collection (used by Cloud Functions Nodemailer) is separate from `ext_mail`.

---

## Architecture: Email Extension vs Cloud Functions

The project has **two email systems** running side-by-side on dev:

| | Cloud Functions (existing) | Email Extension (new) |
|---|---|---|
| **Collection** | `mail` (audit records) | `ext_mail` (input docs) |
| **How** | Nodemailer sends directly | Write doc → extension sends |
| **Templates** | JS strings in `helpers/mail.ts` | Handlebar templates in Firestore |
| **Retries** | Manual try/catch | Built-in with delivery tracking |

To migrate an existing email to use the extension, refactor the Cloud Function to write the email content to `ext_mail` instead of calling Nodemailer directly.
