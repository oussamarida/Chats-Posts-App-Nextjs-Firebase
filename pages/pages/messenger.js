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
  const [message, setmessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (session) {
        const userEmail = session.user.email;
        const usersCollectionRef = collection(db, 'users');
        const usersQuery = query(usersCollectionRef,where('email', '!=', userEmail));
        
        const unsubscribe = onSnapshot(
          usersQuery,
          (snapshot) => {
            const userList = snapshot.docs.map((doc) => doc.data());
            setChats(userList);
          },
          (error) => {
            console.error('Error fetching users:', error);
          }
        );
        return () => unsubscribe();
      }
    };
  
    fetchUsers();
  }, [session]);

  const handleCreateChat = async (selectedUser) => {
    if (!session) return null;
  
    // Assuming 'chats' collection exists
    const chatsCollectionRef = collection(db, 'chats');
  
    try {
      const user1 = session.user.email;
      const user2 = selectedUser.email;
      const existingChatQuery = query(chatsCollectionRef, where('user1', '==', user1), where('user2', '==', user2));
      const existingChatSnapshot = await getDocs(existingChatQuery);
  
      if (!existingChatSnapshot.empty) {
        console.log('Chat already exists between these users.');
        const existingChat = existingChatSnapshot.docs[0].data();
        console.log('Existing Chat:', existingChat);
        setSelectedChat(existingChat); // Store the existing chat in selectedChat state
        return {
          id: existingChatSnapshot.docs[0].id,
          user1: existingChat.user1,
          user2: existingChat.user2,
          timestamp: serverTimestamp(),
        };
      }
  
      const existingChatQueryReverse = query(chatsCollectionRef, where('user1', '==', user2), where('user2', '==', user1));
      const existingChatSnapshotReverse = await getDocs(existingChatQueryReverse);
      if (!existingChatSnapshotReverse.empty) {
        console.log('Chat already exists between these users (reverse).');
        // Return the existing chat object from the reverse case
        const existingChatReverse = existingChatSnapshotReverse.docs[0].data();
        console.log('Existing Chat (Reverse):', existingChatReverse);
        setSelectedChat(existingChatReverse); // Store the existing chat in selectedChat state
        return {
          id: existingChatSnapshotReverse.docs[0].id,
          user1: existingChatReverse.user1,
          user2: existingChatReverse.user2,
          timestamp: serverTimestamp(), // Use `serverTimestamp()` instead of `timestap`
        };
      }
  
      // If no existing chat found, then create the chat document with user1 and user2 attributes
      const newChatRef = doc(chatsCollectionRef); // Get a reference to a new document with a generated ID
      const newChatId = newChatRef.id; // Get the generated ID
      await setDoc(newChatRef, { // Save the chat document with the generated ID and user1, user2 attributes
        id: newChatId,
        user1: user1,
        user2: user2,
        timestamp: serverTimestamp(), 
      });
  
      console.log('Chat created successfully:', newChatId);
      setSelectedChat({ id: newChatId, user1: user1, user2: user2 }); // Store the newly created chat in selectedChat state
  
      // Return the newly created chat object
      return {
        id: newChatId,
        user1: user1,
        user2: user2,
      };
    } catch (error) {
      console.error('Error creating chat:', error);
      return null; // Return null in case of error
    }
  };

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
