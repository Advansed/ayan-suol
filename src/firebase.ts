// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB8xPP3BYu2SBg03FARl46pde0wNWd8wic",
  authDomain: "chat-test-716d1.firebaseapp.com",
  projectId: "chat-test-716d1",
  storageBucket: "chat-test-716d1.appspot.com",
  messagingSenderId: "197637854259",
  appId: "1:197637854259:web:db7cf9738afe9121837f46"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
