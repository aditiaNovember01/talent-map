import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBk7Y739u9DwlUz6JitEuFx98AgME1YFqw",
  authDomain: "talent-mapping-e7a9a.firebaseapp.com",
  projectId: "talent-mapping-e7a9a",
  storageBucket: "talent-mapping-e7a9a.firebasestorage.app",
  messagingSenderId: "516456586141",
  appId: "1:516456586141:web:74e8e77b84a913ebc7ad74",
  measurementId: "G-63HKF7T40N",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
