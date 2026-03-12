---
description: Save all work to GitHub — use at end of every work session
---

This workflow commits and pushes all current changes to GitHub as a safe backup.

// turbo-all

## Pre-flight Checks

1. **Type-check frontend** — don't push broken code:
   ```
   npx tsc --noEmit
   ```
   If this fails, fix the errors before continuing. Never push code that doesn't compile.

2. **Type-check Cloud Functions** (if any functions files changed):
   ```
   npm --prefix functions run build
   ```
   If this fails, fix the errors before continuing.

## Save Steps

3. **Check what changed**: `& "C:\Program Files\Git\bin\git.exe" status`
   Review the list. If anything looks unexpected, investigate before committing.

4. **Stage all changes**: `& "C:\Program Files\Git\bin\git.exe" add -A`

5. **Verify no secrets are staged**:
   ```
   & "C:\Program Files\Git\bin\git.exe" diff --cached --name-only | Select-String -Pattern "\.env$|\.env\.|secret|password|api.key"
   ```
   If any matches appear, **STOP** — unstage them and add to `.gitignore`.

6. **Commit with a descriptive message**:
   ```
   & "C:\Program Files\Git\bin\git.exe" commit --no-gpg-sign -m "<type>: <what changed>"
   ```

   Types: `feat:` `fix:` `docs:` `refactor:` `style:` `chore:`
   
   If the commit hangs (GPG sign prompt), tell the user to run it manually in their terminal.

7. **Push to GitHub**: `& "C:\Program Files\Git\bin\git.exe" push`
   If push fails:
   - **Rejected (behind remote)**: `git pull --rebase` first
   - **Authentication error**: Run `git credential-manager github login`

8. **Confirm**: Tell the user:
   - ✅ Code is backed up on GitHub
   - 📝 Summary of what was committed (number of files, key changes)
   - 🔗 Link: https://github.com/Arthur-Freedom/antigravity-learning

## When to use

- At the end of every work session
- Before deploying (the `/git-safe-deploy` workflow does this automatically)
- Anytime the user asks to "save" or "back up" their work

## Important Notes

- **Git path**: On this system, git is at `C:\Program Files\Git\bin\git.exe`. Use `& "C:\Program Files\Git\bin\git.exe"` syntax in PowerShell.
- **GPG signing**: If `git commit` hangs, it's likely waiting for a GPG passphrase. Use `--no-gpg-sign` or ask the user to commit manually.
- **Never push `.env` files** — they contain Firebase API keys.
- **Never push `node_modules/`** — already in `.gitignore`.
