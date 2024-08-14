import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onDisconnect, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';

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

// Get a reference to authentication service
const auth = getAuth(app);

// Function to update user presence
export const updateUserPresence = async (userId) => {
  const userPresenceRef = ref(database, `onlineUsers/${userId}`);
  const userScoreRef = ref(database, `scores/${userId}`);

  // Set user presence to true when connected
  await set(userPresenceRef, true);

  // Initialize user score to 0 if not already set
  await set(userScoreRef, 0);

  // remove user from onlineUsers collection and reset user score
  onDisconnect(userPresenceRef).remove().then(() => {
    set(userScoreRef, 0);
  });
};

export { database, auth };