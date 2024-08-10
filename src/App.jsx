import './App.css'
import Counters from './Counters.jsx'

function App() {
  return (
    // react can only return one component so enclose components with a "fragment" (empty angle brackets)
    <>
      <Counters/>
    </>
  )
}

export default App
