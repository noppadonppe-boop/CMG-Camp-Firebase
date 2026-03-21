import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  Timestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import type { UserProfile, AppMetaConfig, ActivityLog } from "@/types/auth";

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";

function userDoc(uid: string) {
  return doc(db, ROOT, ROOT_DOC, "users", uid);
}

function appMetaDoc() {
  return doc(db, ROOT, ROOT_DOC, "appMeta", "config");
}

function activityLogsCol() {
  return collection(db, ROOT, ROOT_DOC, "activityLogs");
}

async function logActivity(log: Omit<ActivityLog, "id" | "timestamp">) {
  try {
    await addDoc(activityLogsCol(), {
      ...log,
      timestamp: Timestamp.now(),
    });
  } catch (err) {
    // Never block auth flow
  }
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(userDoc(uid));
    if (!snap.exists()) return null;
    return { uid, ...snap.data() } as UserProfile;
  } catch (err) {
    console.error("fetchUserProfile error:", err);
    return null;
  }
}

async function createUserProfile(
  firebaseUser: FirebaseUser,
  additionalData: {
    firstName: string;
    lastName: string;
    position: string;
  }
): Promise<UserProfile> {
  const { uid, email, photoURL } = firebaseUser;
  if (!email) throw new Error("Email is required");

  const profile = await runTransaction(db, async (transaction) => {
    const metaRef = appMetaDoc();
    const metaSnap = await transaction.get(metaRef);

    const isFirstUser = !metaSnap.exists() || !metaSnap.data()?.firstUserRegistered;

    const newProfile: UserProfile = {
      uid,
      email,
      firstName: additionalData.firstName,
      lastName: additionalData.lastName,
      position: additionalData.position,
      roles: isFirstUser ? ["MasterAdmin"] : ["Staff"],
      status: isFirstUser ? "approved" : "pending",
      assignedProjects: [],
      createdAt: Timestamp.now(),
      photoURL: photoURL || undefined,
      isFirstUser,
    };

    transaction.set(userDoc(uid), newProfile);

    if (isFirstUser) {
      transaction.set(metaRef, {
        firstUserRegistered: true,
        totalUsers: 1,
        createdAt: Timestamp.now(),
      } as AppMetaConfig);
    } else {
      const currentTotal = metaSnap.data()?.totalUsers || 0;
      transaction.update(metaRef, { totalUsers: currentTotal + 1 });
    }

    return newProfile;
  });

  logActivity({ uid, email, action: "REGISTER" });
  return profile;
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<UserProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await fetchUserProfile(userCredential.user.uid);
  
  if (!profile) {
    throw new Error("User profile not found. Please contact administrator.");
  }

  logActivity({ uid: userCredential.user.uid, email, action: "LOGIN" });
  return profile;
}

export async function loginWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const { user } = userCredential;

  let profile = await fetchUserProfile(user.uid);

  if (!profile) {
    const displayNameParts = user.displayName?.split(" ") || ["", ""];
    profile = await createUserProfile(user, {
      firstName: displayNameParts[0] || "User",
      lastName: displayNameParts.slice(1).join(" ") || "",
      position: "Staff",
    });
  }

  logActivity({ uid: user.uid, email: user.email!, action: "LOGIN" });
  return profile;
}

export async function registerWithEmail(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  position: string
): Promise<UserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const profile = await createUserProfile(userCredential.user, {
    firstName,
    lastName,
    position,
  });
  return profile;
}

export async function logout(): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    logActivity({ uid: user.uid, email: user.email!, action: "LOGOUT" });
  }
  await signOut(auth);
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, "uid" | "email" | "createdAt" | "isFirstUser">>
): Promise<void> {
  await updateDoc(userDoc(uid), updates);
}

export async function approveUser(uid: string, adminUid: string): Promise<void> {
  await updateDoc(userDoc(uid), { status: "approved" });
  const userSnap = await getDoc(userDoc(uid));
  const email = userSnap.data()?.email;
  logActivity({ uid: adminUid, email: email || "", action: "APPROVE_USER", metadata: { targetUid: uid } });
}

export async function rejectUser(uid: string, adminUid: string): Promise<void> {
  await updateDoc(userDoc(uid), { status: "rejected" });
  const userSnap = await getDoc(userDoc(uid));
  const email = userSnap.data()?.email;
  logActivity({ uid: adminUid, email: email || "", action: "REJECT_USER", metadata: { targetUid: uid } });
}
