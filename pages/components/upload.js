import { db, storage } from '@/firebase';
import { useSession } from 'next-auth/react';
import React, { useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from '@firebase/firestore';
import { ref, getDownloadURL, uploadString } from 'firebase/storage';

export default function Upload() {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const [addimage, setimage] = useState(null);
  const caption = useRef(null);

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

    const docRef = await addDoc(collection(db, 'posts'), {
      id: '', // Will be populated with the generated ID
      username: session.user.name,
      caption: caption.current.value,
      profil: session.user.image,
      timestamp: serverTimestamp(),
    });

    // Generate unique ID using the document ID
    const id = docRef.id;

    // Update the document with the generated ID
    await updateDoc(doc(db, 'posts', id), {
      id: id,
    });

    console.log('new doc added', id);

    const imageref = ref(storage, `posts/${id}/image`);
    await uploadString(imageref, addimage, 'data_url').then(async (Snapshot) => {
      const downloadURL = await getDownloadURL(imageref);
      await updateDoc(doc(db, 'posts', id), {
        image: downloadURL,
      });
    });
  };

  return (
    <div>
      <img src={addimage} />
      <input type='file' onChange={add}></input>
      <input className='border-black border-[4px]' type='text' ref={caption} />
      <button onClick={uploadPost} className='bg-blue-800 rounded-xl text-white p-7 mt-3'>
        add image
      </button>
    </div>
  );
}
