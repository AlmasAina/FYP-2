const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-key.json");

// ✅ Initialize Firebase Admin SDK only if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://caretransact.firebaseio.com", // Make sure this is correct
    });
}

// ✅ Initialize Firestore and export it
const db = admin.firestore(); // This is what was missing

module.exports = { admin, db }; // Export both `admin` and `db`
