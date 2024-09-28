import admin, { ServiceAccount } from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import service from "./service.json";

admin.initializeApp({
  credential: admin.credential.cert(service as ServiceAccount),
});

export const db = getFirestore();

//getAuth().setCustomUserClaims("PWdjdzsZw3N323twIAFIzm38Xeh2", { admin: true });
