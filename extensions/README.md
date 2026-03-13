# Firebase Extensions

This directory contains the configuration (`.env`) files for all Firebase Extensions installed on this project.

## Installed Extensions

| Extension | Instance ID | Version | Config File |
|---|---|---|---|
| [Delete User Data](https://extensions.dev/extensions/firebase/delete-user-data) | `delete-user-data` | 0.1.27 | [delete-user-data.env](./delete-user-data.env) |
| [Resize Images](https://extensions.dev/extensions/firebase/storage-resize-images) | `storage-resize-images` | 0.3.2 | [storage-resize-images.env](./storage-resize-images.env) |
| [Trigger Email from Firestore](https://extensions.dev/extensions/firebase/firestore-send-email) | `firestore-send-email` | 0.2.6 | [firestore-send-email.env](./firestore-send-email.env) |
| [Distributed Counter](https://extensions.dev/extensions/firebase/firestore-counter) | `firestore-counter` | 0.2.14 | [firestore-counter.env](./firestore-counter.env) |

All extensions are registered in [`firebase.json`](../firebase.json) under the `"extensions"` key.

---

## ⚠️ Critical: Region Differences Between Environments

Dev and prod use **different Firestore regions**, which affects some extension params:

| Project | Firestore Region | Cloud Functions Region |
|---|---|---|
| `antigravity-learning-dev` | `nam5` (multi-region, US) | `us-central1` |
| `antigravity-learning` (prod) | `asia-southeast1` (Singapore) | `us-central1` |

The `DATABASE_REGION` param in `firestore-send-email.env` must match the target project's Firestore region before deploying. See [`deploy-extensions.md`](../.agents/workflows/deploy-extensions.md) for full deploy instructions.

---

## Extension: Trigger Email from Firestore

**Collection:** `ext_mail` (separate from the `mail` collection used by Cloud Functions)

**How it works:** Write a document to `ext_mail` → extension sends email via Gmail SMTP → updates the document with delivery status.

**Test document format:**
```json
{
  "to": "yasseen.de.herdt@gmail.com",
  "message": {
    "subject": "Test Email",
    "html": "<p>Hello from the extension!</p>",
    "text": "Hello from the extension!"
  }
}
```

**Security:** The `ext_mail` collection has deny-all Firestore rules. Only the extension's service account can write delivery status back.

---

## Extension: Distributed Counter

**How it works:** Instead of incrementing a single document field (which has write limits), this extension shards the counter across multiple documents and aggregates them periodically.

**Use case:** High-frequency counters like page views, lesson completions, etc.

**Collection path for counter state:** `_firebase_ext_/sharded_counter`

**Aggregation frequency:** Every 1 minute (configurable)

---

## Security Notes

- `SMTP_CONNECTION_URI` in `firestore-send-email.env` contains a Gmail App Password embedded in the URI. This is a known limitation — the extension's `SMTP_PASSWORD` param requires Secret Manager, but the URI approach avoids that dependency.
- These `.env` files are committed to the repository. **Do not use production credentials in plaintext** beyond what is already present.
- If the Gmail App Password needs rotation, update `SMTP_CONNECTION_URI` in this file and redeploy via `npx firebase-tools deploy --only extensions --project <project>`.
