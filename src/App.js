import logo from './logo.svg';
import './App.css';
import { Auth } from './components/Auth';
import {useState, useRef} from 'react';
import Cookies from 'universal-cookie'
import { Chat } from './components/Chat';

const cookies = new Cookies();
function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"))
  const [room, setRoom]  = useState()

  const roomInputRef = useRef(null);

  if (!isAuth) {

    return (
      <div className="">
        <Auth setIsAuth={setIsAuth}/>
      </div>
    );
  }

  return (
    <div>
      {
        room ? (
          <Chat room={room}/>
        ):(
          <div className='room'>
            <h2>vcl dcmaskdjk</h2>
            <label>Enter room name:</label>
            <input ref={roomInputRef}/>
            <button onClick={() => setRoom(roomInputRef.current.value)}>Enter chat</button>
          </div>
        )
      }
    </div>
  )
}

export default App;
