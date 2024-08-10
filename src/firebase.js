import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBWRy13lELKvIlVljH4jjc6jw0itr8YezA",
  authDomain: "realtime-counter-a4f75.firebaseapp.com",
  databaseURL: "https://realtime-counter-a4f75-default-rtdb.firebaseio.com",
  projectId: "realtime-counter-a4f75",
  storageBucket: "realtime-counter-a4f75.appspot.com",
  messagingSenderId: "132244146650",
  appId: "1:132244146650:web:f6eed0c36c2ccd50c618e3",
  measurementId: "G-LSXPF8KJLJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database
const database = getDatabase(app);

export { database };