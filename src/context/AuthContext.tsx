import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { fetchUserProfile } from "@/lib/auth-service";
import type { UserProfile } from "@/types/auth";

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!firebaseUser) return;
    const profile = await fetchUserProfile(firebaseUser.uid);
    setUserProfile(profile);
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, ROOT, ROOT_DOC, "users", firebaseUser.uid);
    const unsubProfile = onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          setUserProfile({ uid: firebaseUser.uid, ...snap.data() } as UserProfile);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      },
      () => {
        setUserProfile(null);
        setLoading(false);
      }
    );

    return unsubProfile;
  }, [firebaseUser]);

  return (
    <AuthContext.Provider value={{ firebaseUser, userProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
