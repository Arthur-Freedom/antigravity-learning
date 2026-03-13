---
description: How to deploy Firebase Extensions (Delete User Data, Resize Images, Typesense Search)
---

This workflow deploys Firebase Extensions from the local manifest (`firebase.json` + `extensions/*.env`).

> **IMPORTANT**: Always deploy to **dev first**, then production.

> **Typesense Search is NOT YET DEPLOYED.** Read `TYPESENSE_SETUP.md` in the project root for current status and remaining steps before attempting to deploy it.

// turbo-all

## Steps

1. **Check Typesense status**: Read `TYPESENSE_SETUP.md` to see if any setup steps remain.

2. **Deploy extensions to DEV**:
   ```
   npx firebase-tools deploy --only extensions --project antigravity-learning-dev --force
   ```

3. **Verify in Firebase Console**: https://console.firebase.google.com/u/0/project/antigravity-learning-dev/extensions

4. **Deploy extensions to PROD**:
   ```
   npx firebase-tools deploy --only extensions --project antigravity-learning --force
   ```

5. **Verify in Firebase Console**: https://console.firebase.google.com/u/0/project/antigravity-learning/extensions

## Extension Config Files

| Extension | Config | Version |
|-----------|--------|---------|
| Delete User Data | `extensions/delete-user-data.env` | `0.1.27` |
| Resize Images | `extensions/storage-resize-images.env` | `0.3.2` |
| Typesense Search | `extensions/firestore-typesense-search.env` | `2.1.0` |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Secret permission error on dev | The env file may have prod project number — update for dev project (`162710137469`) |
| Cloud Functions v2 error (`INVALID_ARGUMENT`) | Enable Cloud Run, Artifact Registry, Eventarc APIs — then wait for propagation |
| Extension stuck in error state | Uninstall in Console, then redeploy via CLI |
