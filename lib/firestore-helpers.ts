import { collection, doc } from "firebase/firestore";
import { db } from "./firebase";

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";

export function rootCol(sub: string) {
  return collection(db, ROOT, ROOT_DOC, sub);
}

export function rootDoc(sub: string, id: string) {
  return doc(db, ROOT, ROOT_DOC, sub, id);
}
