import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaThumbsDown, FaRegThumbsDown, FaRegListAlt, FaList } from "react-icons/fa";
import { useSearch } from "../../components/SearchContext/SearchContext.jsx";

const List = () => {
  const { currentUser } = useAuth();
  const { searchQuery = "" } = useSearch() || {};
  const [movies, setMovies] = useState([]);
  const [userLikes, setUserLikes] = useState({});
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserList = async () => {
      setLoading(true);
      try {
        const listQuery = query(collection(db, "userLists"), where("userId", "==", currentUser.uid));
        const listSnap = await getDocs(listQuery);
        const movieIds = listSnap.docs.map((doc) => doc.data().movieId);
        setUserList(movieIds);

        if (movieIds.length === 0) {
          setMovies([]);
          setLoading(false);
          return;
        }

        const moviesPromises = movieIds.map(async (id) => {
          const docRef = doc(db, "moviesAndSeries", id);
          const docSnap = await getDoc(docRef);
          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
        });

        const moviesData = (await Promise.all(moviesPromises)).filter(Boolean);
        setMovies(moviesData);

        const likesSnap = await getDocs(query(collection(db, "userLikes"), where("userId", "==", currentUser.uid)));
        const likesData = {};
        likesSnap.docs.forEach((doc) => {
          likesData[doc.data().movieId] = doc.data().liked;
        });
        setUserLikes(likesData);
      } catch (error) {
        console.error("Error fetching user list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserList();
  }, [currentUser]);

  const handleAddToList = async (movieId) => {
    if (!currentUser) return;

    if (userList.includes(movieId)) {
      const listQuery = query(
        collection(db, "userLists"),
        where("userId", "==", currentUser.uid),
        where("movieId", "==", movieId)
      );
      const listSnap = await getDocs(listQuery);
      listSnap.forEach(async (docSnap) => await deleteDoc(doc(db, "userLists", docSnap.id)));
      setUserList((prev) => prev.filter((id) => id !== movieId));
      setMovies((prev) => prev.filter((movie) => movie.id !== movieId));
    } else {
      await addDoc(collection(db, "userLists"), { userId: currentUser.uid, movieId });
      setUserList((prev) => [...prev, movieId]);
    }
  };

  const handleToggleLike = async (movieId) => {
    if (!currentUser) return;

    const likeRef = query(
      collection(db, "userLikes"),
      where("userId", "==", currentUser.uid),
      where("movieId", "==", movieId)
    );
    const snap = await getDocs(likeRef);

    if (!snap.empty) {
      const docId = snap.docs[0].id;
      const currentStatus = snap.docs[0].data().liked;
      const newStatus = currentStatus === true ? null : true;
      await updateDoc(doc(db, "userLikes", docId), { liked: newStatus });
      setUserLikes((prev) => ({ ...prev, [movieId]: newStatus }));
    } else {
      await addDoc(collection(db, "userLikes"), { userId: currentUser.uid, movieId, liked: true });
      setUserLikes((prev) => ({ ...prev, [movieId]: true }));
    }
  };

  const handleToggleDislike = async (movieId) => {
    if (!currentUser) return;

    const likeRef = query(
      collection(db, "userLikes"),
      where("userId", "==", currentUser.uid),
      where("movieId", "==", movieId)
    );
    const snap = await getDocs(likeRef);

    if (!snap.empty) {
      const docId = snap.docs[0].id;
      const currentStatus = snap.docs[0].data().liked;
      const newStatus = currentStatus === false ? null : false;
      await updateDoc(doc(db, "userLikes", docId), { liked: newStatus });
      setUserLikes((prev) => ({ ...prev, [movieId]: newStatus }));
    } else {
      await addDoc(collection(db, "userLikes"), { userId: currentUser.uid, movieId, liked: false });
      setUserLikes((prev) => ({ ...prev, [movieId]: false }));
    }
  };

  const renderMovieCard = (movie) => {
    const isInList = userList.includes(movie.id);
    const likedStatus = userLikes[movie.id];

    return (
      <div key={movie.id} className="relative w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] flex-shrink-0 cursor-pointer group">
        <div
          className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video transform transition-all duration-300 ease-in-out hover:scale-110 hover:z-50 hover:shadow-2xl"
          onClick={() => navigate(`/details/${movie.id}`)}
        >
          <img
            src={movie.thumbnailUrl || "https://via.placeholder.com/300x200.png?text=No+Thumbnail"}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-3 space-y-2 transition-opacity duration-300">
            <div className="flex justify-between text-2xl">
              <span onClick={(e) => { e.stopPropagation(); handleAddToList(movie.id); }} className="cursor-pointer">
                {isInList ? <FaList className="text-red-600" /> : <FaRegListAlt className="text-white" />}
              </span>
              <span onClick={(e) => { e.stopPropagation(); handleToggleLike(movie.id); }} className="cursor-pointer">
                {likedStatus === true ? <FaHeart className="text-red-600" /> : <FaRegHeart className="text-white" />}
              </span>
              <span onClick={(e) => { e.stopPropagation(); handleToggleDislike(movie.id); }} className="cursor-pointer">
                {likedStatus === false ? <FaThumbsDown className="text-red-600" /> : <FaRegThumbsDown className="text-white" />}
              </span>
            </div>
            <h3 className="text-white font-semibold text-sm truncate">{movie.title}</h3>
            {movie.type && <p className="text-gray-300 text-xs">{String(movie.type).toUpperCase()}</p>}
          </div>
        </div>
      </div>
    );
  };

  const filteredMovies = movies.filter((movie) => {
    const q = searchQuery.toLowerCase();
    return movie.title?.toLowerCase().includes(q);
  });

  if (!currentUser) return <div className="text-white text-center pt-20">Please log in to view your list.</div>;
  if (loading) return <div className="text-white text-center pt-20">Loading your list...</div>;
  if (filteredMovies.length === 0) return <div className="text-white text-center pt-20">No results found in your list.</div>;

  return (
    <div className="pt-16 px-6 text-white w-full">
      <h1 className="text-3xl font-bold mb-6">My List</h1>
      <div className="flex space-x-4 overflow-x-auto hide-scrollbar py-2">
        {filteredMovies.map(renderMovieCard)}
      </div>
    </div>
  );
};

export default List;
