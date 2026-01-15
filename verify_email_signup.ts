
import 'dotenv/config'; // Load .env
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from "firebase/auth";

async function verifyAuth() {
    console.log("Loading configuration...");

    const firebaseConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        appId: process.env.VITE_FIREBASE_APP_ID,
    };

    if (!firebaseConfig.apiKey) {
        console.error("❌ Failed to load VITE_FIREBASE_API_KEY from process.env");
        console.log("Checking specific keys...");
        console.log("API_KEY present:", !!process.env.VITE_FIREBASE_API_KEY);
        console.log("PROJECT_ID present:", !!process.env.VITE_FIREBASE_PROJECT_ID);
        process.exit(1);
    }

    console.log("Initializing Firebase with project:", firebaseConfig.projectId);
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const testEmail = `verify_${Date.now()}@example.com`;
    const testPass = 'TestPass123!';

    try {
        console.log(`Attempting to create user: ${testEmail}`);
        const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPass);
        console.log("✅ User successfully created! User ID:", userCredential.user.uid);

        console.log("Attempting login (sanity check)...");
        await signInWithEmailAndPassword(auth, testEmail, testPass);
        console.log("✅ Login successful.");

        console.log("Cleaning up (deleting test user)...");
        await deleteUser(userCredential.user);
        console.log("✅ Test user deleted.");

        console.log("\n🎉 SUCCESS: Email/Password Auth is fully active!");

    } catch (error) {
        console.error("\n❌ Auth Verification Failed:");
        console.error(error.message);

        if (error.code === 'auth/operation-not-allowed') {
            console.error("\n⚠️  DIAGNOSIS: The Email/Password provider is still DISABLED in Firebase Console.");
        }

        process.exit(1);
    }
}

verifyAuth();
