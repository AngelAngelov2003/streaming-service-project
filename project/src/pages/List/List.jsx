import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaThumbsDown, FaRegListAlt, FaList } from 'react-icons/fa';

const List = () => {
  const { currentUser } = useAuth();
  const [movies, setMovies] = useState([]);
  const [userLikes, setUserLikes] = useState({});
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserList = async () => {
      try {
        const listQuery = query(collection(db, 'userLists'), where('userId', '==', currentUser.uid));
        const listSnap = await getDocs(listQuery);
        const movieIds = listSnap.docs.map(doc => doc.data().movieId);
        setUserList(movieIds);

        if (movieIds.length === 0) {
          setMovies([]);
          return;
        }

        const moviesData = [];
        for (let id of movieIds) {
          const docRef = doc(db, 'moviesAndSeries', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            moviesData.push({ id: docSnap.id, ...docSnap.data() });
          }
        }
        setMovies(moviesData);

        const likesSnap = await getDocs(query(collection(db, 'userLikes'), where('userId', '==', currentUser.uid)));
        const likesData = {};
        likesSnap.docs.forEach(doc => {
          likesData[doc.data().movieId] = doc.data().liked;
        });
        setUserLikes(likesData);

      } catch (error) {
        console.error('Error fetching user list:', error);
      }
    };

    fetchUserList();
  }, [currentUser]);

  const handleAddToList = async (movieId) => {
    if (!currentUser) return;

    if (userList.includes(movieId)) {
      const listQuery = query(
        collection(db, 'userLists'),
        where('userId', '==', currentUser.uid),
        where('movieId', '==', movieId)
      );
      const listSnap = await getDocs(listQuery);
      listSnap.forEach(async docSnap => await deleteDoc(doc(db, 'userLists', docSnap.id)));
      setUserList(prev => prev.filter(id => id !== movieId));
      setMovies(prev => prev.filter(movie => movie.id !== movieId));
    } else {
      await addDoc(collection(db, 'userLists'), { userId: currentUser.uid, movieId });
      setUserList(prev => [...prev, movieId]);
    }
  };

  const handleToggleLike = async (movieId) => {
    if (!currentUser) return;

    const likeRef = query(collection(db, 'userLikes'), where('userId', '==', currentUser.uid), where('movieId', '==', movieId));
    const snap = await getDocs(likeRef);

    if (!snap.empty) {
      const docId = snap.docs[0].id;
      const currentStatus = snap.docs[0].data().liked;
      const newStatus = currentStatus === true ? null : true;
      await updateDoc(doc(db, 'userLikes', docId), { liked: newStatus });
      setUserLikes(prev => ({ ...prev, [movieId]: newStatus }));
    } else {
      await addDoc(collection(db, 'userLikes'), { userId: currentUser.uid, movieId, liked: true });
      setUserLikes(prev => ({ ...prev, [movieId]: true }));
    }
  };

  const handleToggleDislike = async (movieId) => {
    if (!currentUser) return;

    const likeRef = query(collection(db, 'userLikes'), where('userId', '==', currentUser.uid), where('movieId', '==', movieId));
    const snap = await getDocs(likeRef);

    if (!snap.empty) {
      const docId = snap.docs[0].id;
      const currentStatus = snap.docs[0].data().liked;
      const newStatus = currentStatus === false ? null : false;
      await updateDoc(doc(db, 'userLikes', docId), { liked: newStatus });
      setUserLikes(prev => ({ ...prev, [movieId]: newStatus }));
    } else {
      await addDoc(collection(db, 'userLikes'), { userId: currentUser.uid, movieId, liked: false });
      setUserLikes(prev => ({ ...prev, [movieId]: false }));
    }
  };

  const renderMovieCard = (movie) => {
    const isInList = userList.includes(movie.id);
    const likedStatus = userLikes[movie.id];

    return (
      <div key={movie.id} className="relative group">
        <div
          className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video cursor-pointer transform transition-all duration-300 ease-in-out hover:scale-110 hover:z-50 hover:shadow-2xl"
          onClick={() => navigate(`/details/${movie.id}`)}
        >
          <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-3 transition-opacity duration-300">
            <div className="flex justify-between text-2xl">
              <span onClick={e => { e.stopPropagation(); handleAddToList(movie.id); }} className="cursor-pointer">
                {isInList ? <FaList className="text-red-600" /> : <FaRegListAlt className="text-white" />}
              </span>
              <span onClick={e => { e.stopPropagation(); handleToggleLike(movie.id); }} className="cursor-pointer">
                {likedStatus === true ? <FaHeart className="text-red-600" /> : <FaRegHeart className="text-white" />}
              </span>
              <span onClick={e => { e.stopPropagation(); handleToggleDislike(movie.id); }} className="cursor-pointer">
                {likedStatus === false ? <FaThumbsDown className="text-red-600" /> : <FaThumbsDown className="text-white" />}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!currentUser) return <div className="text-white text-center pt-20">Please log in to view your list.</div>;
  if (movies.length === 0) return <div className="text-white text-center pt-20">Your list is empty.</div>;

  return (
    <div className="pt-16 px-6 text-white w-full">
      <h1 className="text-3xl font-bold mb-6">My List</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {movies.map(renderMovieCard)}
      </div>
    </div>
  );
};

export default List;
