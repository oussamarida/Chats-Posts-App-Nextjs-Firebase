import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

export function Comment({ id }) {
      const [comments, setComments] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "posts", id, "comments"), (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => doc.data());
      setComments(commentsData);
    });

    // Unsubscribe from the snapshot listener when the component unmounts
    return () => unsubscribe();
  }, [db, id]);

  return (
    <div>
      {comments.length > 0 &&
        comments.map((com, index) => (
          <h1 className="bg-red-600" key={index}>{com.comment}</h1>
        ))}
    </div>
  );
}