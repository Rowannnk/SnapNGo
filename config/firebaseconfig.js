import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDIV308O4Pq31AtwHS-Ye6ywesEgzm_sko",
  authDomain: "snapngo-4e18b.firebaseapp.com",
  projectId: "snapngo-4e18b",
  storageBucket: "snapngo-4e18b.firebasestorage.app",
  messagingSenderId: "263960076808",
  appId: "1:263960076808:web:c45e690e46463cfc5f27bd",
  measurementId: "G-MRS859MMYC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
