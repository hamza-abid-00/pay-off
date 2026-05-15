# Payoff

> The fitness app for your home goals.

A small habit-loop savings tracker. Pick a goal (Home Deposit, Mortgage Overpayment, Rent Pot), log "wins" when you skip a takeaway / spend less / get a refund, and watch your home get days closer. Built in React + Vite, persisted with Firebase (Auth + Firestore).

---

## Quick start

```bash
npm install
npm run dev
```

The app boots in **local demo mode** by default — sign up with any email/password and your account, goal, wins, and streak are saved to your browser's `localStorage`. No backend required.

## Going live with Firebase (real auth + cloud sync)

1. Create a project at <https://console.firebase.google.com/>.
2. **Build → Authentication → Sign-in method**: enable **Email/Password**.
3. **Build → Firestore Database → Create database** (start in production mode, pick a region).
4. **Project Settings → General → Your apps → Web app**: copy the SDK config values.
5. Copy `.env.example` to `.env` and fill in the values:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

6. Restart `npm run dev`. The login screen no longer shows the "demo mode" notice — accounts and progress now live in your Firebase project.

### Suggested Firestore security rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## Project structure

```
src/
  App.jsx           # AuthProvider + auth gate (AuthScreen ↔ PayoffApp)
  AuthContext.jsx   # React context wrapping Firebase Auth
  AuthScreen.jsx    # Sign in / Sign up screen
  PayoffApp.jsx     # Main app — onboarding, progress, goals, connect
  firebase.js       # Firebase init + state read/write (with localStorage fallback)
  main.jsx          # React entry
```

The app has **three tabs**: **Goals**, **Progress** (default), **Connect** — and a goal-switcher pill in the header so users can switch goals from any page.

---

## Scripts

| Command            | What it does                |
| ------------------ | --------------------------- |
| `npm run dev`      | Start the Vite dev server   |
| `npm run build`    | Production build            |
| `npm run preview`  | Preview the built bundle    |
| `npm run lint`     | ESLint over `src/`          |
