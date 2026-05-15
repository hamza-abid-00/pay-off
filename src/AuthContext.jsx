import { createContext, useContext, useEffect, useState } from "react";
import {
  subscribeAuth,
  signIn as fbSignIn,
  signUp as fbSignUp,
  signOut as fbSignOut,
  FIREBASE_ENABLED,
} from "./firebase.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = subscribeAuth((u) => {
      setUser(u);
      setReady(true);
    });
    return unsub;
  }, []);

  const value = {
    user,
    ready,
    firebaseEnabled: FIREBASE_ENABLED,
    signIn: fbSignIn,
    signUp: fbSignUp,
    signOut: fbSignOut,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
