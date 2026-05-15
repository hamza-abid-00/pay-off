/**
 * Firebase bootstrap.
 *
 * The app gracefully runs in two modes:
 *   1) FIREBASE MODE   — when all VITE_FIREBASE_* env vars are present, we use
 *                        Firebase Auth + Firestore for real persistent login.
 *   2) LOCAL DEMO MODE — when env vars are missing, we fall back to a tiny
 *                        localStorage-backed shim so the prototype still works
 *                        end-to-end without any setup.
 *
 * To go live: copy `.env.example` to `.env`, fill in your Firebase web app
 * credentials, and restart the dev server.
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

const env = import.meta.env;

const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
};

export const FIREBASE_ENABLED = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let auth = null;
let db = null;

if (FIREBASE_ENABLED) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

/* ─────────────────────────────────────────────────────────────────────────────
   AUTH API — same surface in both modes so the rest of the app doesn't care.
   ───────────────────────────────────────────────────────────────────────────── */

const LS_USER_KEY = "payoff:user";
const LS_USERS_KEY = "payoff:users"; // demo "user table"

function readLocalUser() {
  try { return JSON.parse(localStorage.getItem(LS_USER_KEY) || "null"); }
  catch { return null; }
}
function writeLocalUser(u) {
  if (u) localStorage.setItem(LS_USER_KEY, JSON.stringify(u));
  else   localStorage.removeItem(LS_USER_KEY);
}
function readLocalUsers() {
  try { return JSON.parse(localStorage.getItem(LS_USERS_KEY) || "{}"); }
  catch { return {}; }
}
function writeLocalUsers(map) {
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(map));
}

export function subscribeAuth(cb) {
  if (FIREBASE_ENABLED) {
    return onAuthStateChanged(auth, (u) => {
      cb(u ? { uid: u.uid, email: u.email } : null);
    });
  }
  cb(readLocalUser());
  const onStorage = (e) => { if (e.key === LS_USER_KEY) cb(readLocalUser()); };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

export async function signIn(email, password) {
  if (FIREBASE_ENABLED) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { uid: cred.user.uid, email: cred.user.email };
  }
  const users = readLocalUsers();
  const u = users[email.toLowerCase()];
  if (!u)               throw new Error("No account found. Try signing up.");
  if (u.password !== password) throw new Error("Wrong password.");
  const session = { uid: u.uid, email: u.email };
  writeLocalUser(session);
  return session;
}

export async function signUp(email, password) {
  if (FIREBASE_ENABLED) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return { uid: cred.user.uid, email: cred.user.email };
  }
  const users = readLocalUsers();
  const key = email.toLowerCase();
  if (users[key]) throw new Error("Account already exists. Please sign in.");
  const uid = `local-${Date.now()}`;
  users[key] = { uid, email, password };
  writeLocalUsers(users);
  const session = { uid, email };
  writeLocalUser(session);
  return session;
}

export async function signOut() {
  if (FIREBASE_ENABLED) { await fbSignOut(auth); return; }
  writeLocalUser(null);
}

/* ─────────────────────────────────────────────────────────────────────────────
   USER STATE API — read/write the user's goal + wins + streak.
   Firestore path: users/{uid}/state/main
   localStorage key in demo mode: payoff:state:{uid}
   ───────────────────────────────────────────────────────────────────────────── */

function lsStateKey(uid) { return `payoff:state:${uid}`; }

function serialize(state) {
  return {
    ...state,
    wins: (state.wins || []).map(w => ({
      ...w,
      date: typeof w.date === "string" ? w.date : new Date(w.date).toISOString(),
    })),
  };
}

function deserialize(raw) {
  if (!raw) return null;
  return {
    ...raw,
    wins: (raw.wins || []).map(w => ({ ...w, date: new Date(w.date) })),
  };
}

function readLocal(uid) {
  try {
    const raw = JSON.parse(localStorage.getItem(lsStateKey(uid)) || "null");
    return deserialize(raw);
  } catch { return null; }
}

function writeLocal(uid, payload) {
  try { localStorage.setItem(lsStateKey(uid), JSON.stringify(payload)); } catch { /* quota / private mode */ }
}

export async function loadUserState(uid) {
  if (FIREBASE_ENABLED) {
    try {
      const snap = await getDoc(doc(db, "users", uid, "state", "main"));
      if (snap.exists()) return deserialize(snap.data());
    } catch (e) {
      console.warn("[Payoff] Firestore read failed, using local cache.", e?.code || e);
    }
  }
  return readLocal(uid);
}

export async function saveUserState(uid, state) {
  const payload = serialize(state);
  // Always mirror to localStorage so progress survives refreshes even if
  // Firestore is unavailable / not yet configured.
  writeLocal(uid, payload);
  if (FIREBASE_ENABLED) {
    try {
      await setDoc(doc(db, "users", uid, "state", "main"), payload, { merge: true });
    } catch (e) {
      console.warn("[Payoff] Firestore write failed, kept locally.", e?.code || e);
    }
  }
}

export function subscribeUserState(uid, cb) {
  if (FIREBASE_ENABLED) {
    try {
      return onSnapshot(
        doc(db, "users", uid, "state", "main"),
        (snap) => cb(snap.exists() ? deserialize(snap.data()) : null),
        (err) => console.warn("[Payoff] Live sync unavailable.", err?.code || err),
      );
    } catch (e) {
      console.warn("[Payoff] Could not subscribe to live state.", e);
    }
  }
  cb(null);
  return () => {};
}
