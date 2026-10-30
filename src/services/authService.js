import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase';

/* ------------------------------------------------------------------ */
/* Friendly error messages                                             */
/* ------------------------------------------------------------------ */
const ERRORS = {
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and retry.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/operation-not-allowed':
    'Email/Password sign-in is not enabled in your Firebase console.',
};

export function friendlyError(err) {
  return ERRORS[err?.code] || err?.message || 'Something went wrong.';
}

/* ------------------------------------------------------------------ */
/* Firebase implementation                                             */
/* ------------------------------------------------------------------ */
const firebaseAuth = {
  async signUp(name, email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    return cred.user;
  },
  logIn: (email, password) =>
    signInWithEmailAndPassword(auth, email, password).then((c) => c.user),
  logOut: () => signOut(auth),
  resetPassword: (email) => sendPasswordResetEmail(auth, email),
  onChange: (cb) =>
    onAuthStateChanged(auth, (u) =>
      cb(
        u
          ? {
              uid: u.uid,
              email: u.email,
              displayName: u.displayName || u.email?.split('@')[0],
            }
          : null
      )
    ),
};

/* ------------------------------------------------------------------ */
/* Demo-mode implementation (localStorage, NOT secure – demo only)     */
/* ------------------------------------------------------------------ */
const USERS_KEY = 'taskflow_demo_users';
const SESSION_KEY = 'taskflow_demo_session';
const listeners = new Set();

const readUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
const readSession = () => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
const emit = () => listeners.forEach((cb) => cb(readSession()));
const fail = (code) => Object.assign(new Error(code), { code });

const demoAuth = {
  async signUp(name, email, password) {
    const users = readUsers();
    const key = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(key)) throw fail('auth/invalid-email');
    if (password.length < 6) throw fail('auth/weak-password');
    if (users[key]) throw fail('auth/email-already-in-use');
    const user = { uid: 'demo-' + Date.now(), email: key, displayName: name || key.split('@')[0] };
    users[key] = { ...user, password };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    emit();
    return user;
  },
  async logIn(email, password) {
    const rec = readUsers()[email.trim().toLowerCase()];
    if (!rec || rec.password !== password) throw fail('auth/invalid-credential');
    const { password: _pw, ...user } = rec;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    emit();
    return user;
  },
  async logOut() {
    localStorage.removeItem(SESSION_KEY);
    emit();
  },
  async resetPassword() {
    /* no-op in demo mode */
  },
  onChange(cb) {
    listeners.add(cb);
    cb(readSession());
    return () => listeners.delete(cb);
  },
};

export const authService = isFirebaseConfigured ? firebaseAuth : demoAuth;
