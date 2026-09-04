import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDiGzxW5MWrIbsK681Xd0E87621v9vVECc",
  authDomain: "narra-app-c85c6.firebaseapp.com",
  projectId: "narra-app-c85c6",
  storageBucket: "narra-app-c85c6.firebasestorage.app",
  messagingSenderId: "587059745495",
  appId: "1:587059745495:web:8ceb83c79b46fadf9bd692"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)