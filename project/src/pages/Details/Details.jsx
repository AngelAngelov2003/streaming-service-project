import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, getDocs, collection, query, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../AuthContext';
import { FaHeart, FaRegHeart, FaThumbsDown, FaRegListAlt, FaList } from 'react-icons/fa';

const Details = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [item, setItem] = useState(null);
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [inList, setInList] = useState(false);
  const [likedStatus, setLikedStatus] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);

  useEffect(() => {
    const fetchItem = async () => {
      const docSnap = await getDoc(doc(db, 'moviesAndSeries', id));
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setItem(data);
        if (data.type === 'series' && data.seasons?.length > 0) {
          setSelectedSeasonIndex(0);
          setCurrentEpisodeIndex(0);
        }
        if (data.relatedContent?.length > 0) {
          const relatedSnaps = await Promise.all(
            data.relatedContent.map(async rid => {
              const rdoc = await getDoc(doc(db, 'moviesAndSeries', rid));
              return rdoc.exists() ? { id: rdoc.id, ...rdoc.data() } : null;
            })
          );
          setRelatedItems(relatedSnaps.filter(Boolean));
        }
      }
    };

    const fetchUserData = async () => {
      if (!currentUser) return;
      const listSnap = await getDocs(
        query(
          collection(db, 'userLists'),
          where('userId', '==', currentUser.uid),
          where('movieId', '==', id)
        )
      );
      setInList(!listSnap.empty);

      const likeSnap = await getDocs(
        query(
          collection(db, 'userLikes'),
          where('userId', '==', currentUser.uid),
          where('movieId', '==', id)
        )
      );
      if (!likeSnap.empty) setLikedStatus(likeSnap.docs[0].data().liked);
      else setLikedStatus(null);
    };

    fetchItem();
    fetchUserData();
  }, [id, currentUser]);

  if (!item) return <div className="text-white flex items-center justify-center min-h-screen">Loading...</div>;

  const isSeries = item.type === 'series';
  const seasons = item.seasons || [];
  const currentSeason = isSeries ? seasons[selectedSeasonIndex] : null;
  const currentEpisode = isSeries
    ? currentSeason?.episodes[currentEpisodeIndex] || { youtubeId: '', title: '' }
    : { youtubeId: item.youtubeId, title: item.title };

  const handleNextEpisode = () => {
    if (!isSeries || !currentSeason) return;
    if (currentEpisodeIndex < currentSeason.episodes.length - 1) {
      setCurrentEpisodeIndex(prev => prev + 1);
    } else if (selectedSeasonIndex < seasons.length - 1) {
      setSelectedSeasonIndex(prev => prev + 1);
      setCurrentEpisodeIndex(0);
    }
  };

  const handlePrevEpisode = () => {
    if (!isSeries || !currentSeason) return;
    if (currentEpisodeIndex > 0) {
      setCurrentEpisodeIndex(prev => prev - 1);
    } else if (selectedSeasonIndex > 0) {
      const prevSeasonIndex = selectedSeasonIndex - 1;
      setSelectedSeasonIndex(prevSeasonIndex);
      setCurrentEpisodeIndex(seasons[prevSeasonIndex].episodes.length - 1);
    }
  };

  const toggleList = async () => {
    if (!currentUser) return;
    setInList(prev => !prev);
    const listSnap = await getDocs(
      query(
        collection(db, 'userLists'),
        where('userId', '==', currentUser.uid),
        where('movieId', '==', id)
      )
    );
    if (!listSnap.empty) {
      await Promise.all(listSnap.docs.map(docSnap => deleteDoc(doc(db, 'userLists', docSnap.id))));
    } else {
      await addDoc(collection(db, 'userLists'), { userId: currentUser.uid, movieId: id });
    }
  };

  const toggleLike = async (status) => {
    if (!currentUser) return;
    setLikedStatus(prev => (prev === status ? null : status));
    const likeSnap = await getDocs(
      query(
        collection(db, 'userLikes'),
        where('userId', '==', currentUser.uid),
        where('movieId', '==', id)
      )
    );
    if (!likeSnap.empty) {
      const docId = likeSnap.docs[0].id;
      const current = likeSnap.docs[0].data().liked;
      const newStatus = current === status ? null : status;
      await updateDoc(doc(db, 'userLikes', docId), { liked: newStatus });
    } else {
      await addDoc(collection(db, 'userLikes'), { userId: currentUser.uid, movieId: id, liked: status });
    }
  };

  return (
    <div className="pt-20 px-4 text-white max-w-5xl mx-auto">
      <div className="flex flex-col min-h-screen">
        <h1 className="text-4xl font-bold mb-4">{item.title}</h1>
        <p className="mb-4 text-gray-400">
          {Array.isArray(item.category) ? item.category.join(', ') : item.category}
        </p>

        {isSeries && (
          <div className="flex justify-center mb-2 space-x-4">
            <button
              onClick={handlePrevEpisode}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition text-sm"
            >
              Prev
            </button>
            <button
              onClick={handleNextEpisode}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition text-sm"
            >
              Next
            </button>
          </div>
        )}

        <div className="aspect-video mb-6">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${currentEpisode?.youtubeId}`}
            title={currentEpisode?.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {item.description && (
          <p className="mb-6 text-gray-300">{item.description}</p>
        )}

        <div className="flex space-x-6 text-3xl mb-6">
          <span className="cursor-pointer" onClick={toggleList}>
            {inList ? <FaList className="text-red-500" /> : <FaRegListAlt className="text-white" />}
          </span>
          <span className="cursor-pointer" onClick={() => toggleLike(true)}>
            {likedStatus === true ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-white" />}
          </span>
          <span className="cursor-pointer" onClick={() => toggleLike(false)}>
            <FaThumbsDown className={likedStatus === false ? 'text-red-500' : 'text-white'} />
          </span>
        </div>

        {isSeries && seasons.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Seasons</h2>
            <div className="flex space-x-2 mb-4 justify-center">
              {seasons.map((season, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded ${
                    selectedSeasonIndex === index ? 'bg-red-600' : 'bg-gray-700'
                  }`}
                  onClick={() => {
                    setSelectedSeasonIndex(index);
                    setCurrentEpisodeIndex(0);
                  }}
                >
                  {season.title || season.name || `Season ${index + 1}`}
                </button>
              ))}
            </div>
            <div className="flex flex-col space-y-2">
              {currentSeason?.episodes.map((ep, index) => (
                <div
                  key={index}
                  className={`flex items-center p-2 rounded cursor-pointer transition-all duration-200 ${
                    currentEpisodeIndex === index
                      ? 'bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/50'
                      : 'bg-gray-800'
                  }`}
                  onClick={() => setCurrentEpisodeIndex(index)}
                >
                  {ep.thumbnail && (
                    <img
                      src={ep.thumbnail}
                      alt={ep.title}
                      className="w-24 h-14 object-cover rounded mr-4 flex-shrink-0"
                    />
                  )}
                  <div>
                    <p className="text-white text-sm font-semibold">
                      Episode {index + 1}: {ep.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedItems.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Related Content</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedItems.map(ri => (
                <Link
                  key={ri.id}
                  to={`/details/${ri.id}`}
                  className="bg-gray-800 p-2 rounded hover:scale-105 transition transform"
                >
                  <img
                    src={ri.thumbnailUrl || 'https://via.placeholder.com/300x200.png?text=No+Thumbnail'}
                    alt={ri.title}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <p className="text-white text-sm font-semibold">{ri.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;
