// useAuth.js
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile, signOut, onAuthStateChanged } from 'firebase/auth';
import appFirebase from '@/firebaseInit';

const auth = getAuth(appFirebase);
const provider = new GoogleAuthProvider();

export function useAuth() {
  async function loginWithEmail(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  async function loginWithGoogle() {
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  }

  async function registerUser(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error registering user: ', error.message);
      throw error;
    }
  }

  async function logoutUser() {
    await signOut(auth);
  }

  function fetchUser() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  return {
    loginWithEmail,
    loginWithGoogle,
    registerUser,
    logoutUser,
    fetchUser,
  };
}
