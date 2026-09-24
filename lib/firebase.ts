import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBbINDf6eEVm36SEVN5eaE8c9KuNDKoGaw",
  authDomain: "asistencia-qr-762a0.firebaseapp.com",
  projectId: "asistencia-qr-762a0",
  storageBucket: "asistencia-qr-762a0.firebasestorage.app",
  messagingSenderId: "458420010237",
  appId: "1:458420010237:web:b9bbc52dc88b2108d0d294",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
