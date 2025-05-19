// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCQumQAkqlSZJM5Og1zlS84Jp3nT7we9BA",
    authDomain: "bodanoeliajuanjo-74171.firebaseapp.com",
    projectId: "bodanoeliajuanjo-74171",
    storageBucket: "bodanoeliajuanjo-74171.firebasestorage.app",
    messagingSenderId: "903483217332",
    appId: "1:903483217332:web:52f790b1a63b33a2bb4ee1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
