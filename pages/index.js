import { signOut, useSession } from "next-auth/react";
import { Inter } from "next/font/google";
import Upload from "./components/upload";
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
} from "firebase/firestore";
import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Comment } from "./components/comment"; // Make sure to use the correct path to the Comment component


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
  const [comment, setcomment] = useState("");

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

  const send = async (e,pos) => {
    e.preventDefault();
    const commentToSend = comment;
    setcomment("");

    await addDoc(collection(db, "posts", pos , "comments"), {
      comment: commentToSend,
      username: session.user.name,
      profil: session.user.image,
      timestamp: serverTimestamp(), // Use `serverTimestamp()` instead of `timestap`
    });
  };

  const like = async (e,pos) => {
    e.preventDefault();
    await addDoc(collection(db, "posts", pos , "likes"), {
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
    // Set the isConnected field to false when the user signs out
    if (session && session.user.email) {
      const userRef = doc(db, "users", session.user.email);
      await updateDoc(userRef, {
        isConnected: false,
      });
    }
    // Then, sign out the user
    await signOut();
  };

  return (
    <div className="">
      {session ? (
        <div className="">
<button onClick={handleSignOut}>byyy</button>
          <h1>{session.user.name}</h1>
          <Upload />

          {posts.map((pos) => (
            <div className="bg-blue-400 mt-10" key={pos.id}>
              <h1>{pos.data().caption}</h1>
              <Comment id={pos.id} />
              <input
                className="border-black border-[4px]"
                type="text"
                value={comment}
                onChange={(e) => setcomment(e.target.value)}
              />
              <button
                className="bg-blue-900 text-white"
                onClick={(e) => send(e,pos.id)}
              >
                send
              </button>
              <p>Likes: {likesCount[pos.id]}</p> {/* Display the number of likes */}

              <button       
                        onClick={(e) => like(e,pos.id)}
                    className="bg-gray-400 ml-10">Like</button>
            </div>

            

          ))}
        </div>
      ) : (
        <div>
          <a href="/auth/signIn">gooo</a>
        </div>
      )}
    </div>
  );
}
