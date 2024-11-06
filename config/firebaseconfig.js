import { initializeApp } from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCcRDw5Vkcyt0FEzH6LW3nc6sMImnDgINU",
  authDomain: "snapngo-d1422.firebaseapp.com",
  projectId: "snapngo-d1422",
  storageBucket: "snapngo-d1422.appspot.com",
  messagingSenderId: "536394095250",
  appId: "1:536394095250:web:7cd1f700f61d020056244b",
  measurementId: "G-ZWFB2GDD4E",
};

const app = initializeApp(firebaseConfig);

export default app;
