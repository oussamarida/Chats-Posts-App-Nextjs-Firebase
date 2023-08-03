import { db, storage } from "@/firebase";
import { useSession } from "next-auth/react";
import React, { useRef, useState } from "react";
import { useRecoilState } from "recoil";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "@firebase/firestore";
import { ref, getDownloadURL, uploadString } from "firebase/storage";

export default function Upload() {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const [addimage, setimage] = useState(null);
  const caption = useRef(null);
  const [cap , setcap]=useState('')
  const filePicker = useRef(null);

  const add = (e) => {
    e.preventDefault();
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      setimage(readerEvent.target.result);
    };
  };

  const uploadPost = async () => {
    if (loading) return;
    setLoading(true);
    const docRef = await addDoc(collection(db, "posts"), {
      id: "", // Will be populated with the generated ID
      username: session.user.name,
      caption: caption.current.value,
      profil: session.user.image,
      timestamp: serverTimestamp(),
    });

    // Generate unique ID using the document ID
    const id = docRef.id;

    // Update the document with the generated ID
    await updateDoc(doc(db, "posts", id), {
      id: id,
    });

    console.log("new doc added", id);
    setcap('')

    const imageref = ref(storage, `posts/${id}/image`);
    await uploadString(imageref, addimage, "data_url").then(
      async (Snapshot) => {
        const downloadURL = await getDownloadURL(imageref);
        await updateDoc(doc(db, "posts", id), {
          image: downloadURL,
        });
      }
    );
    
  };

  return (
    <div className="flex py-7 flex-col bg-gray-200 rounded-2xl pb-10 gap-10 p-10 justify-center items-center  shadow-xl">
      <div>
        <div className="flex justify-between">
          <div className="">
          <input type="file" ref={filePicker} hidden onChange={add}></input>
            <span className="bg-[#F3F4F6] rounded-md font-semibold cursor-pointer p-2">
              Write
            </span>
          </div>
          <div className="flex gap-3 text-[#9CA3AF]"
          onClick={()=>filePicker.current.click()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="#4F46E5"
              class="bi bi-camera-fill"
              viewBox="0 0 16 16"
            >
              <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
              <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z" />
            </svg>
          </div>
        </div>
        <textarea
          ref={caption}
          value={cap}
          placeholder="Add your comment..."
          className="p-2 focus:outline-1 focus:outline-blue-500 font-bold border-[0.1px] resize-none h-[100px] border-[#9EA5B1] rounded-md w-[50vw]"
          defaultValue={""}
          onChange={(e) => setcap(e.target.value)}
        />
        <div className="flex justify-end">
          <button
           onClick={uploadPost}
           className="text-sm font-semibold absolute bg-[#4F46E5] w-fit text-white py-2 rounded px-6">
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

{
  /* <div className="flex justify-center items-center">
        <input
          className="border-black border-[4px] "
          type="text"
          ref={caption}
        />
        <input type="file" ref={filePicker} hidden onChange={add}></input>
      </div>
      <div>
        <button
          onClick={uploadPost}
          className="bg-blue-800 rounded-xl text-white "
        >
          Upload Post
        </button>
      </div> */
}
