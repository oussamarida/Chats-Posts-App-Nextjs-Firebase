import { signOut, useSession } from "next-auth/react";
import { Inter } from "next/font/google";
import Upload from "./pages/components/upload";
import { Snapshot, useRecoilState } from "recoil";
import { modelstate } from "@/atoms/modelAtom";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Comment } from "./pages/components/comment"; // Make sure to use the correct path to the Comment component
import Header from "./components/header";
import Cards from "./pages/components/Cards";
import Chats from "./pages/components/Chats";

const inter = Inter({ subsets: ["latin"] });

const saveUserToFirestore = async (user, session) => {
  try {
    const userRef = doc(db, "users", user.email); // Use email as the primary key

    // Check if the user already exists in the database
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // If the user doesn't exist, add them to the database
      await setDoc(userRef, {
        name: user.name,
        email: user.email,
        image: user.image,
        username: session.user.username,
        isConnected: true, // Add the isConnected field with a value of true
      });
    } else {
      // If the user exists, update the isConnected field to true
      await updateDoc(userRef, {
        isConnected: true,
      });
    }
  } catch (error) {
    console.error("Error saving user data to Firestore:", error);
  }
};

export default function Home() {
  const { data: session } = useSession();
  const [posts, setposts] = useState([]);
  const [users, setUser] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // State to store the selected chat

  useEffect(() => {
    const fetchUsers = async () => {
      if (session) {
        const userEmail = session.user.email;
        const usersCollectionRef = collection(db, "users");
        const usersQuery = query(
          usersCollectionRef,
          where("email", "!=", userEmail)
        );

        const unsubscribe = onSnapshot(
          usersQuery,
          (snapshot) => {
            const userList = snapshot.docs.map((doc) => doc.data());
            setUser(userList);
          },
          (error) => {
            console.error("Error fetching users:", error);
          }
        );
        return () => unsubscribe();
      }
    };

    fetchUsers();
  }, [session]);

  useEffect(() => {
    if (session) {
      saveUserToFirestore(session.user, session);
    }
  }, [session]);

  useEffect(() => {
    return onSnapshot(collection(db, "posts"), (snapshot) => {
      setposts(snapshot.docs);
    });
  }, [db]);

  const like = async (e, pos) => {
    e.preventDefault();
    await addDoc(collection(db, "posts", pos, "likes"), {
      username: session.user.name,
      profil: session.user.image,
      timestamp: serverTimestamp(), // Use `serverTimestamp()` instead of `timestap`
    });
  };

  const [likesCount, setLikesCount] = useState({});

  const getLikesCount = async (postId) => {
    const likesCollectionRef = collection(db, "posts", postId, "likes");
    const likesSnapshot = await getDocs(likesCollectionRef);
    return likesSnapshot.docs.length;
  };
  useEffect(() => {
    const fetchLikesCount = async () => {
      const counts = {};
      for (const post of posts) {
        const postId = post.id;
        const count = await getLikesCount(postId);
        counts[postId] = count;
      }
      setLikesCount(counts);
    };
    fetchLikesCount();
  }, [posts]);

  const handleSignOut = async () => {
    if (session && session.user.email) {
      const userRef = doc(db, "users", session.user.email);
      await updateDoc(userRef, {
        isConnected: false,
      });
    }
    // Then, sign out the user
    await signOut();
  };

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
        detailsuser1:session.user,
        detailsuser2:selectedUser,
        timestamp: serverTimestamp(), 
      });
  
      console.log('Chat created successfully:', newChatId);
      setSelectedChat({
        id: newChatId,
        user1: { name: session.user.name, email: session.user.email , image: session.user.image  },
        user2: { name: selectedUser.name, email: selectedUser.email,image: selectedUser.user.image },
      });
  
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

  return (
    <div className="bg-white flex flex-col  h-[100vh]">
      <Header handleSignOut={handleSignOut} />
      <div className="flex-1 flex flex-row gap-10 py-10 p-20 justify-center items-start bg-gray-200">
        <div className="w-[23%] left-0 top-15 fixed   flex flex-col gap-10">
          <div className="bg-white shadow-xl rounded-2xl flex-1 justify-center items-center flex flex-col">
          {selectedChat && (
            <Chats chat={selectedChat} />
          )}
          </div>
        </div>
        <div className="flex-1 ml-10 gap-8 flex justify-center items-center flex-col">
          <Upload />
          {posts.map((pos) => (
            <Cards key={pos.id} like={likesCount[pos.id]} pos={pos} />
          ))}
        </div>
        <div className="fixed rounded-2xl overflow-hidden right-4 gap-10 flex flex-col top-15 justify-center w-[20%] h-[80vh] ">
          <div className="flex-1 p-6  bg-white">
            <ul role="list" className="divide-y divide-gray-100">
              {users.map((person) => (
                <li
                  key={person.email}
                  className="flex justify-between gap-x-6 py-5"
                >
                  <div className="flex gap-x-4">
                    <img
                      className="h-12 w-12 flex-none rounded-full bg-gray-50"
                      src={person.image}
                      alt=""
                    />
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        {person.name}
                      </p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        {person.email}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex sm:flex-col sm:items-end">
                    {person.isConnected ? (
                      <div className="mt-1 flex items-center gap-x-1.5">
                        <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-xs leading-5 text-gray-500">
                          Online
                        </p>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-x-1.5">
                        <div className="flex-none rounded-full bg-gray-500/20 p-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-900" />
                        </div>
                        <p className="text-xs leading-5 text-gray-500">
                          Offline
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCreateChat(person)}
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none"
                    >
                      <span className="font-bold">Send</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-6 w-6 ml-2 transform rotate-90"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
