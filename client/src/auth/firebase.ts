import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_apiKey,
    authDomain: import.meta.env.VITE_authDomain,
    projectId: import.meta.env.VITE_projectId,
    storageBucket: import.meta.env.VITE_storageBucket,
    messagingSenderId: import.meta.env.VITE_messagingSenderId,
    appId: import.meta.env.VITE_appId,
    measurementId: import.meta.env.VITE_measurementId
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const idToken = await result.user.getIdToken()
    return { idToken, user: result.user }
}   