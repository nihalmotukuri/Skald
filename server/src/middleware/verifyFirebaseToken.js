import admin from '../config/firebaseAdmin.cjs'

export const verifyFirebaseToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1]
    if (!idToken) return res.status(401).json({ error: 'No token provided' });

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.firebaseUid = decodedToken.uid;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}