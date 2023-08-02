// Import the functions you need from the SDKs you need
import { initializeApp , getApps , getApp} from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZJOPVVEHzAi_W2E5PHaAfSGGHQ-WBTEc",
  authDomain: "myplatform-50378.firebaseapp.com",
  projectId: "myplatform-50378",
  storageBucket: "myplatform-50378.appspot.com",
  messagingSenderId: "229294200107",
  appId: "1:229294200107:web:4c86c69e54c61adfa1e16e"
};

// Initialize Firebase
const app = !getApps().lenght ?  initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage=getStorage();

export {app , db ,storage}