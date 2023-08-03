import { db } from "@/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

export default function Chats({ chat }) {
  console.log(chat);
  const { data: session } = useSession();

  const send = async (e, chat) => {
    e.preventDefault();
    const commentToSend = message;

    try {
      setmessage("");
      console.log(commentToSend);
      await addDoc(collection(db, "chats", chat, "message"), {
        message: commentToSend,
        username: session.user.name,
        profil: session.user.image,
        timestamp: serverTimestamp(), // Use `serverTimestamp()` instead of `timestap`
      });

      // Set the comment state after the message is sent successfully
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const [message, setmessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (chat) {
        const messagesCollectionRef = query(
          collection(db, "chats", chat.id, "message"),
          orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(
          messagesCollectionRef,
          (snapshot) => {
            const messageList = snapshot.docs.map((doc) => doc.data());
            setMessages(messageList);
          },
          (error) => {
            console.error("Error fetching messages:", error);
          }
        );
        return () => unsubscribe();
      }
    };

    fetchMessages();
  }, [chat]);

  return (
    <div>
      <div>
        <div className="flex-1 p:2 sm:p-6 justify-between flex flex-col h-[80vh] ">
          <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
            <div className="relative flex items-center space-x-4">
              <div className="relative">
                <span className="absolute text-green-500 right-0 bottom-0">
                  <svg width={20} height={20}>
                    <circle cx={8} cy={8} r={8} fill="currentColor" />
                  </svg>
                </span>
                <img
                  src={chat.detailsuser2.image}
                  className="h-18
                 w-18 flex-none rounded-full bg-gray-50"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <div className="text-2xl mt-1 flex items-center">
                  <span className="text-gray-700 mr-3">
                    {chat.detailsuser2.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-end space-x-2"></div>
          </div>
          <div
            id="messages"
            className="flex  flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${
                  message.username === session.user.name
                    ? "flex items-end justify-end"
                    : "flex items-start"
                }`}
              >
                <div
                  className={`flex flex-col space-y-2 text-xs max-w-xs mx-2 ${
                    message.username === session.user.name
                      ? "order-1 items-end"
                      : "order-2"
                  }`}
                >
                  <div>
                    <span
                      className={`px-4 py-2 rounded-lg inline-block ${
                        message.username === session.user.name
                          ? "rounded-br-none bg-blue-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {message.message}
                    </span>
                  </div>
                </div>
                <img
                  src={
                    message.username === session.user.name
                      ? session.user.image
                      : chat.detailsuser2.image
                  }
                  alt="Profile"
                  className="w-6 h-6 rounded-full"
                />
              </div>
            ))}
          </div>
          <div className="border-t-2 border-gray-200 w-[400px] pt-4 mb-2 sm:mb-0">
            <div className="relative flex">
              <span className="absolute inset-y-0 flex items-center"></span>
              <input
                value={message}
                onChange={(e) => setmessage(e.target.value)}
                type="text"
                placeholder="Write your message!"
                className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-md py-3"
              />
              <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
                <button
                  onClick={(e) => send(e, chat.id)}
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none"
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
            </div>
          </div>
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "\n.scrollbar-w-2::-webkit-scrollbar {\n  width: 0.25rem;\n  height: 0.25rem;\n}\n\n.scrollbar-track-blue-lighter::-webkit-scrollbar-track {\n  --bg-opacity: 1;\n  background-color: #f7fafc;\n  background-color: rgba(247, 250, 252, var(--bg-opacity));\n}\n\n.scrollbar-thumb-blue::-webkit-scrollbar-thumb {\n  --bg-opacity: 1;\n  background-color: #edf2f7;\n  background-color: rgba(237, 242, 247, var(--bg-opacity));\n}\n\n.scrollbar-thumb-rounded::-webkit-scrollbar-thumb {\n  border-radius: 0.25rem;\n}\n",
          }}
        />
      </div>
    </div>
  );
}
