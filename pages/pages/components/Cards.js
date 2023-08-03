import { signOut, useSession } from "next-auth/react";
import { Inter } from "next/font/google";
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
import { Comment } from "./comment";

export default function Cards({ pos, like }) {
  const { data: session } = useSession();
  const [comment, setcomment] = useState("");

  const [showAllComments, setShowAllComments] = useState(false);

  // Function to toggle visibility of comments
  const handleToggleComments = () => {
    setShowAllComments((prevShowAllComments) => !prevShowAllComments);
  };

  const send = async (e, pos) => {
    e.preventDefault();
    const commentToSend = comment;
    setcomment("");

    await addDoc(collection(db, "posts", pos, "comments"), {
      comment: commentToSend,
      username: session.user.name,
      profil: session.user.image,
      timestamp: serverTimestamp(), // Use `serverTimestamp()` instead of `timestap`
    });
  };




  return (
    <div className="flex-1 rounded-xl overflow-hidden border w-full lg:w-6/12 md:w-6/12 bg-white mx-3 md:mx-0 lg:mx-0">
      <div className="w-full flex justify-between p-3">
        <div className="flex">
          <div className="rounded-full h-8 w-8 bg-gray-500 flex items-center justify-center overflow-hidden">
            <img src={pos.data().profil} alt="profilepic" />
          </div>
          <span className="pt-1 ml-2 font-bold text-sm">
            {pos.data().username}
          </span>
        </div>
        <span className="px-2  hover:bg-gray-300 cursor-pointer rounded">
          <i className="fas fa-ellipsis-h pt-2 text-lg" />
        </span>
      </div>
      <div className="relative">
        <img
          className="w-full h-80 object-contain"
          src={pos.data().image}
          alt="post"
        />
      </div>
      <div className="px-3 pb-2">
        <div className="pt-2">
          <i className="far fa-heart cursor-pointer" />
          <span className="text-sm text-gray-400 font-medium">
            {like} likes
          </span>
        </div>
        <div className="pt-1">
          <div className="mb-2 text-sm">
            <span className="font-medium mr-2">{pos.data().username}</span>{" "}
            {pos.data().caption}
          </div>
        </div>
      
        <div className="mb-2">
          <div className="mb-2 text-sm">
            <Comment id={pos.id} />
          </div>
          <div className="pl-1 flex flex-row justify-center">
            <input
              className="border-[0.5px] rounded-md pl-5"
              placeholder="share your opinion"
              type="text"
              value={comment}
              onChange={(e) => setcomment(e.target.value)}
            />
            <button
              className=" text-black font-bold"
              onClick={(e) => send(e, pos.id)}
            >
              send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
