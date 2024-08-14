import { useState, useEffect } from 'react';
import { ref, set, onValue, remove } from 'firebase/database';
import { database, auth, updateUserPresence } from './firebase';
import { signInAnonymously } from 'firebase/auth';

function Counters() {
  // useState variables for tracking data in a function 
  // first value is a variable for the current state, second value is a function used to update the state 
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [userId, setUserId] = useState(null); // Store the current user's ID
  const [opponentId, setOpponentId] = useState(null); // Store the opponent's ID
  const [myLastClick, setMyLastClick] = useState(false); // Track the current user's last click status
  const [opponentLastClick, setOpponentLastClick] = useState(false); // Track the opponent's last click status
  const [resetDone, setResetDone] = useState(false); // Track if reset of counters has been done

  // Function to sign in anonymously
  const signInUser = async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;
      setUserId(uid); // Set the current user's ID
      console.log('User signed in anonymously successfully. User ID:', uid);
      await updateUserPresence(uid); // Update presence in Firebase
      setIsOnline(true); // Mark the user as online
    } catch (error) {
      console.error('Failed to sign in anonymously:', error);
    }
  };

  // Function to reset both scores when a new game starts
  const resetScores = async () => {
    if (userId) {
      const myScoreRef = ref(database, `scores/${userId}`);
      await set(myScoreRef, 0);
  
      if (opponentId) {
        const opponentScoreRef = ref(database, `scores/${opponentId}`);
        await set(opponentScoreRef, 0);
      }
    }
  };

  // useEffect allows you to perform side effects in function components - these are operations that affect something outside the scope of the function
  useEffect(() => {
    const init = async () => {
      await signInUser(); // Sign in anonymously

      // Update the current user's score in firebase
      if (userId) {
        // Reference to the current user's score in Firebase
        const myScoreRef = ref(database, `scores/${userId}`);
        onValue(myScoreRef, (snapshot) => {
          const value = snapshot.val();
          setMyScore(value || 0);
        });

        // Reference to the current user's last click status in Firebase
        const myLastClickRef = ref(database, `lastClick/${userId}`);
        onValue(myLastClickRef, (snapshot) => {
          const value = snapshot.val();
          setMyLastClick(value || false); // Update the current user's last click status
        });

        // Listen for changes in the 'onlineUsers' to identify the opponent
        onValue(ref(database, 'onlineUsers'), (snapshot) => {
          const onlineUsersData = snapshot.val();
          const otherUserId = Object.keys(onlineUsersData).find(id => id !== userId); // Identify the opponent's ID
          setOpponentId(otherUserId);

          if (otherUserId) {
            // Reference to the opponent's score in Firebase
            const opponentScoreRef = ref(database, `scores/${otherUserId}`);
            onValue(opponentScoreRef, (snapshot) => {
              const value = snapshot.val();
              setOpponentScore(value || 0); // Update the opponent's score
            });

            // Listen for the opponent's last click status
            const opponentLastClickRef = ref(database, `lastClick/${otherUserId}`);
            onValue(opponentLastClickRef, (snapshot) => {
              const value = snapshot.val();
              setOpponentLastClick(value || false); // Update the opponent's last click status
            });

            // Reset scores when a new game is detected
            if (!resetDone) {
              resetScores(); // Reset scores when a new opponent is found
              setResetDone(true); // Set flag to indicate reset is done
            }
          }
        });
      }

      setLoading(false); // Stop loading once initialized
    };

    init();

    // Cleanup function to remove user presence and reset scores on component unmount
    return () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        remove(ref(database, `onlineUsers/${userId}`)); // Remove user presence from Firebase
        resetScores(); // Reset scores when a user disconnects
        setResetDone(false); // Reset the flag for the next connection
      }
    };
  }, [userId]); // Depend on userId to handle user state changes

  // Function to increment the current user's score and update last click status
  const incrementMyScore = () => {
    if (isOnline && userId) {
      // Allow first click if both scores are 0, otherwise enforce turn-based logic
      if ((myScore === 0 && opponentScore === 0) || opponentLastClick) {
        const myScoreRef = ref(database, `scores/${userId}`);
        const myLastClickRef = ref(database, `lastClick/${userId}`);

        // Update score and set last click to true
        set(myScoreRef, (myScore + 1) % 100);
        set(myLastClickRef, true);

        // Reset opponent's last click status
        if (opponentId) {
          const opponentLastClickRef = ref(database, `lastClick/${opponentId}`);
          set(opponentLastClickRef, false);
        }
      }
    }
  };

  if (loading) return <div>Loading...</div>; // Display loading screen

  return (
    <div className="counters">
      {opponentId ? (
        <>
          <button 
            onClick={incrementMyScore} 
            disabled={(myScore !== 0 || opponentScore !== 0) && !opponentLastClick} // Disable button unless it's the first click or it's the user's turn
          >
            Your Score: {myScore}
          </button>
          <br />
          <br />
          <div>Opponent's Score: {opponentScore}</div>
        </>
      ) : (
        <div>Waiting for another user to join...</div>
      )}
    </div>
  );
}

export default Counters;