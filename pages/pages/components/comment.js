import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

export function Comment({ id, lastOnly }) {
  const [comments, setComments] = useState([]);
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "posts", id, "comments"),
      (snapshot) => {
        const commentsData = snapshot.docs.map((doc) => doc.data());
        setComments(commentsData);
      }
    );

    // Unsubscribe from the snapshot listener when the component unmounts
    return () => unsubscribe();
  }, [db, id]);

  useEffect(() => {
    setShowAllComments(lastOnly);
  }, [lastOnly]);

  const handleToggleComments = () => {
    setShowAllComments((prevShowAllComments) => !prevShowAllComments);
  };

 return (
    <div>
      {comments.length > 0 && (
        <div>
          {comments.length > 1 && (
            <div
              className="text-sm mb-2 text-gray-400 cursor-pointer font-medium"
              onClick={handleToggleComments}
            >
              {showAllComments ? "Hide comments" : `View all ${comments.length} comments`}
            </div>
          )}

          {showAllComments
            ? comments.map((com, index) => (
                <h1 key={index}>
                  <span className="font-medium mr-2">{com.username} : </span>
                  {com.comment}
                </h1>
              ))
            : comments.length > 0 && (
                <h1>
                  <span className="font-medium mr-2">{comments[comments.length - 1].username} :</span>
                  {comments[comments.length - 1].comment}
                </h1>
              )}
        </div>
      )}
    </div>
  );
}