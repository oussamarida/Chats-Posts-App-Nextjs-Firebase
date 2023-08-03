import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, where, query, getDocs, addDoc, doc, setDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage'; // Add the correct import statements for Firebase Storage
import Link from 'next/link';
import { useRouter } from 'next/router';


export default function Messenger() {
  const { data: session } = useSession();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // State to store the selected chat
  const [messages, setMessages] = useState([]);


  const [message, setmessage] = useState("");


  const send = async (e, selectedChat) => {
    e.preventDefault();
    const commentToSend = message;
  
    try {
      setmessage("");
      console.log(commentToSend)
      await addDoc(collection(db, "chats", selectedChat, "message"), {
        message: commentToSend,
        username: session.user.name,
        profil: session.user.image,
        timestamp: serverTimestamp(), // Use `serverTimestamp()` instead of `timestap`
      });
  
       // Set the comment state after the message is sent successfully
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };


  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedChat) {
        const messagesCollectionRef = query(collection(db, 'chats', selectedChat.id, 'message'),orderBy('timestamp','asc'));
  
        const unsubscribe = onSnapshot(
          messagesCollectionRef,
          (snapshot) => {
            const messageList = snapshot.docs.map((doc) => doc.data());
            setMessages(messageList);
          },
          (error) => {
            console.error('Error fetching messages:', error);
          }
        );
        return () => unsubscribe();
      }
    };
  
    fetchMessages();
  }, [selectedChat]);

  return (
    <div>
    {session ? (
      <div className="">
        {chats.map((user, index) => (
          <div key={index}>
            <button
              className='mt-10 text-white bg-blue-600'
              onClick={() => handleCreateChat(user)}
            >
              {user.username}
            </button>
            {selectedChat && (user.email === selectedChat.user1 || user.email === selectedChat.user2) && (
              <div>
                <h3>Chat Details:{selectedChat.id}</h3>
                <p>User1: {selectedChat.user1}</p>
                <p>User2: {selectedChat.user2}</p>
                <div>
                {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col p-2 mt-10 ${message.username === session.user.name ? 'bg-blue-300 self-end' : 'bg-gray-300 self-start'}`}
                >
                  <p>{message.username}</p>
                  <p>{message.message}</p>
                </div>
              ))}
                </div>
                <input
                  className="border-black border-[4px]"
                  type="text"
                  value={message}
                  onChange={(e) => setmessage(e.target.value)}
                />
                <button
                  className="bg-blue-900 text-white"
                  onClick={(e) => send(e, selectedChat.id)}
                >
                  send
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div>
        <Link href="/auth/signIn">gooo</Link>
      </div>
    )}
  </div>
  );
}
