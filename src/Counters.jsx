import { useState, useEffect } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { database } from './firebase';

function Counters(){
  // use state allows us to track data in a function
  // first value is a variable for current state, second value is a function used to update the state 
  const [myCount, setMyCount] = useState(0) 
  const [yourCount, setYourCount] = useState(0)

  // Reference paths in the Firebase database
  const myCountRef = ref(database, 'myCount');
  const yourCountRef = ref(database, 'yourCount');

  // increment counter here when values change in firestore
  // useEffect allows you to perform side effects in function components - these are operations that affect something outside the scope of the function
  useEffect(() => {
    // Listen for changes in the 'myCount' value in firestore
    // onValue fetches data from reference provided from firestore
    onValue(myCountRef, (snapshot) => {
      const value = snapshot.val();
      setMyCount(value);
    });

    // Listen for changes in the 'yourCount' value in firestore
    onValue(yourCountRef, (snapshot) => {
      const value = snapshot.val();
      setYourCount(value);
    });
  }, []);

  // increment counter in database (first) 
  const incrementMyCount = () => {
    set(myCountRef, myCount + 1);
  };

  const incrementYourCount = () => {
    set(yourCountRef, yourCount + 1);
  };

  return(
    <div className="counters">
      <button onClick={incrementMyCount}>
        My count is {myCount}
      </button>
      <br></br>
      <br></br>
      <button onClick={incrementYourCount}>
        Your count is {yourCount}
      </button>
    </div>
  )
}

export default Counters