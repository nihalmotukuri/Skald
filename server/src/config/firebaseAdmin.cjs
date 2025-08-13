// firebaseAdmin.cjs
const admin = require("firebase-admin");

// Prefer environment variable; fallback to local JSON file
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);

if (!admin.apps.length) {
  console.log("Initializing Firebase Admin...");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin initialized.");
}

module.exports = admin;
