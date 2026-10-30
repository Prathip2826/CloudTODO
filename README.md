# TaskFlow – Cloud To-Do App

A web app where users can **sign up / log in, add, edit, complete and delete tasks**, with data stored in **Firebase Firestore** and **synced in real time across devices**.

**Stack:** React 18 (Vite) · Firebase Authentication (Email/Password) · Cloud Firestore · Firebase Hosting (or Vercel)

## Requirements checklist

| Requirement | Where it is implemented |
|---|---|
| Email/Password authentication | `src/services/authService.js`, `src/components/AuthPage.jsx` (sign up, log in, forgot password, log out) |
| Add / edit / delete / complete tasks | `src/components/TaskForm.jsx`, `TaskItem.jsx`, `TodoApp.jsx` |
| Tasks stored in cloud database | Firestore path `users/{uid}/tasks/{taskId}` (`src/services/taskService.js`) |
| Real-time sync across devices | Firestore `onSnapshot` listener |
| Secure login & database access | `firestore.rules` – a user can only read/write their own tasks, with field validation |
| Scalable for many users | Per-user sub-collections, no shared hot documents, no composite indexes needed |
| Cross-platform (desktop & mobile) | Responsive CSS, touch-friendly controls, light/dark theme |

Extras: priority levels, due dates with overdue highlight, filters (All/Active/Completed), search, progress ring, clear completed, dark mode.

## Quick start (try the UI right now)

```bash
npm install
npm run dev
```

Opens at http://localhost:3000. With no Firebase keys the app runs in **Demo mode** (data saved in your browser only) so you can explore the UI immediately.

## Connect Firebase (cloud mode)

1. Go to the [Firebase Console](https://console.firebase.google.com) → **Add project**.
2. **Build → Authentication → Get started** → enable the **Email/Password** provider.
3. **Build → Firestore Database → Create database** (production mode).
4. **Project settings → Your apps → Web (`</>`)** → register an app and copy the config.
5. Copy `.env.example` to `.env` and paste the values:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
6. Publish the security rules: open **Firestore → Rules**, paste the contents of `firestore.rules`, and click **Publish** (or use the CLI below).
7. `npm run dev` – the badge in the top bar changes from *Demo mode* to *Synced*.

Test real-time sync by logging in with the same account in two browser windows/devices and adding a task.

## Deploy

### Firebase Hosting
```bash
npm run build
npm i -g firebase-tools
firebase login
# edit .firebaserc and set your project id
firebase deploy            # deploys hosting + firestore rules
```

### Vercel
Import the repo, framework preset **Vite**, and add the six `VITE_FIREBASE_*` environment variables. Then add your Vercel domain under **Authentication → Settings → Authorized domains** in Firebase.

## Project structure

```
cloud-todo/
├── index.html
├── package.json
├── vite.config.js
├── firebase.json          # hosting + rules config
├── firestore.rules        # per-user security rules
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx            # auth gate + theme
    ├── firebase.js        # Firebase init (+ demo-mode detection)
    ├── styles.css
    ├── services/
    │   ├── authService.js
    │   └── taskService.js
    └── components/
        ├── AuthPage.jsx
        ├── TodoApp.jsx
        ├── TaskForm.jsx
        ├── TaskItem.jsx
        └── Icons.jsx
```

## Notes

- Demo mode is for previewing only (passwords are stored unencrypted in localStorage). Use Firebase keys for real use.
- Never commit `.env`; it is already in `.gitignore`.
