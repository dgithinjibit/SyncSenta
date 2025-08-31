// FIX: The Firebase imports and initialization were using the v9+ modular syntax,
// but the TypeScript errors ('has no exported member') strongly indicate that an older
// version of the Firebase SDK (likely v8) is installed. Updated the code to use the
// compatible v8 namespaced syntax and types.
// FIX: Switched to firebase/compat imports to support v8 syntax with the v9+ SDK.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

let app: firebase.app.App | null = null;
let auth: firebase.auth.Auth | null = null;
let db: firebase.firestore.Firestore | null = null;

/**
 * Lazily initializes and returns the Firebase services.
 * Throws an error if Firebase environment variables are not set.
 */
export const getFirebaseServices = () => {
  if (!app) {
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    };

    if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
      // This error will be caught by the calling components' try/catch blocks.
      throw new Error("Firebase configuration variables are not set. Please check your environment configuration. Authentication will not work.");
    }

    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
  }
  
  // We can assert non-null because they are all set together inside the `if` block.
  return { app, auth: auth!, db: db! };
};