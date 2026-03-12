---
name: gamification
description: How the XP, Level, and Daily Login Streak system works — data model, calculation formulas, UI display, and how to extend it
---

# Gamification System Reference

The gamification system adds XP, Levels, and Daily Login Streaks to encourage engagement.

## Data Model

All gamification data lives on the `users/{uid}` Firestore document:

```typescript
{
  xp: number;          // Total experience points (starts at 0)
  level: number;        // Calculated level (starts at 1)
  streak: number;       // Consecutive login days (resets if a day is missed)
  lastLoginDate: string; // "YYYY-MM-DD" format, tracks last login for streak
}
```

## XP Sources

| Action | XP Awarded | Condition |
|--------|-----------|-----------|
| Daily login | **10 XP** | Once per calendar day |
| Pass a quiz module | **50 XP** | Only on FIRST correct attempt per topic |

## Level Formula

```typescript
level = Math.floor(Math.sqrt(xp / 100)) + 1
```

| XP Range | Level |
|----------|-------|
| 0–99 | 1 |
| 100–399 | 2 |
| 400–899 | 3 |
| 900–1599 | 4 |
| 1600–2499 | 5 |

### XP needed for next level:
```typescript
xpForNextLevel = (level) ** 2 * 100
xpProgress = xp - ((level - 1) ** 2 * 100)
xpNeeded = level ** 2 * 100 - (level - 1) ** 2 * 100
```

## Daily Login Streak

**File:** `src/services/userService.ts` → `applyDailyLoginStreak(uid)`

Called on every authentication event. Logic:

1. Compare `lastLoginDate` against today's date (`YYYY-MM-DD`)
2. If already logged in today → skip (no double-counting)
3. If logged in yesterday → `streak += 1` (consecutive)
4. If missed any day → `streak = 1` (reset)
5. If no previous login → `streak = 1` (first time)
6. Award 10 XP and recalculate level
7. Update `lastLoginDate` to today

## UI Display

### Profile Page (`src/pages/profile.ts`)
- Shows Level badge, XP progress bar, and streak fire icon
- Progress bar shows XP within current level
- Streak shows 🔥 emoji with day count

### Leaderboard (`src/pages/leaderboard.ts`)
- XP and Level columns in the leaderboard table
- Users can be sorted by XP

### Auth Button (`src/components/auth-button.ts`)
- Shows streak count next to auth button when logged in

## Extending the System

### Adding a new XP source:
1. Identify where the action occurs (page init, component callback, etc.)
2. In the relevant service/handler, increment XP:
   ```typescript
   const newXp = existingXp + AMOUNT;
   const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
   await updateDoc(ref, { xp: newXp, level: newLevel, updatedAt: serverTimestamp() });
   ```
3. No server-side validation change needed — the sanitiser only validates quiz-related fields

### Adding achievements/badges:
1. Create a `badges` array field on the user profile
2. Add badge definitions as constants
3. Check conditions on relevant actions (e.g., "Complete first quiz", "7-day streak")
4. Display badges on the profile page
