import {useState, useEffect} from 'react'
import {addDoc,collection, serverTimestamp, onSnapshot, query, where, orderBy, QueryOrderByConstraint } from 'firebase/firestore';
import {getDownloadURL, getStorage, ref, uploadBytes} from 'firebase/storage';
import {auth, db, storage } from '../firebase-config';
export const Chat = (props) =>{
    const {room} = props
    const [newMessage, setNewMessage] = useState("");
    const messagesRef = collection(db, "messages")
    const [messages, setMessages] = useState([])
    const [file, setFile] = useState(null);
    
    const handleFileSubmit = async (file) =>{
        if(!file)
        {
            return 
        }

        const storageRef = ref(storage, `files/${file.name}`)

        // upload
        const snapshot = await uploadBytes(storageRef, file)

        // get the file url
        const downloadURL = await getDownloadURL(snapshot.ref)
        console.log("download:", downloadURL)
        // send file url as message

        await addDoc(messagesRef, {
            text: newMessage,
            imageUrl: downloadURL,
            createdAt: serverTimestamp(),
            user: auth.currentUser.displayName,
            room: room
        })
        setFile(null)
    }
    const handleSubmit = async (e) =>{
        e.preventDefault();
        if (newMessage !== "" || file){
            // Check if we have file to send
            if(file){
                console.log("no vo submit file")
                handleFileSubmit(file)
            }else{
                await addDoc(messagesRef, {
                    text: newMessage,
                    createdAt: serverTimestamp(),
                    user: auth.currentUser.displayName,
                    room: room
                })
            }
            setNewMessage("")
        }

    }

    useEffect(() =>{

        const queryMessages = query(messagesRef, where("room", "==", room), orderBy("createdAt"));
        const unsuscribe = onSnapshot(queryMessages, (snapshot)=>{
            let messages = []
            snapshot.forEach((doc) =>{
                console.log("data:", doc.data().room)
                messages.push({...doc.data(), id:doc.id})
            })
            setMessages(messages)
            console.log("mesasfa:",messages)

        })

        return () => unsuscribe();
    }, [])
    return (
        <div className="chat-app">
            <div className='header'>
                <h1>Welcome to: {room.toUpperCase()}</h1>
            </div>
            <div className='messages'>
                {messages.map((message)=>{
                return (
                    <div className='message' key={message.id}>
                        <span className='user'>{message.user}: </span>
                        {message.text}
                        {message.imageUrl && (
                            <div>
                                <img src={message.imageUrl} alt='sent file' style={{maxWidth: '200px'}}/>
                            </div>
                        )} 
                    </div>
                )
            })}
            </div>
            <form onSubmit={handleSubmit} className="new-message-form">
                <input
                type='text'
                value={file ? file.name : ''}
                />
                <input 
                className="new-message-input"
                placeholder="Type your message here..."
                onChange={(e)=>{
                    setNewMessage(e.target.value);
                }}
                value={newMessage}
                />
                <input
                id='file-send'
                type='file'
                onChange={(e)=>{
                    setFile(e.target.files[0])
                    console.log(e.target.files)
                }}
                style={{display: 'none'}}/>
                <label
                htmlFor='file-send'>
                    file
                </label>

                <button type="submit" className="send-button">Send</button>
            </form>
        </div>
    )
}