import React, { useEffect, useState, useRef } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart, FaThumbsDown, FaRegListAlt, FaList } from 'react-icons/fa'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

const TvShows = () => {
  const [tvShows, setTvShows] = useState([])
  const [userList, setUserList] = useState([])
  const [userLikes, setUserLikes] = useState({})
  const { currentUser, subscriptionStatus, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && subscriptionStatus === 'active') {
      const fetchTvShows = async () => {
        const snapshot = await getDocs(collection(db, 'moviesAndSeries'))
        const series = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item => item.type === 'series')
        setTvShows(series)
      }
      const fetchUserData = async () => {
        if (!currentUser) return
        const listSnapshot = await getDocs(query(collection(db, 'userLists'), where('userId', '==', currentUser.uid)))
        setUserList(listSnapshot.docs.map(doc => doc.data().movieId))
        const likesSnapshot = await getDocs(query(collection(db, 'userLikes'), where('userId', '==', currentUser.uid)))
        const likesData = {}
        likesSnapshot.docs.forEach(doc => { likesData[doc.data().movieId] = doc.data().liked })
        setUserLikes(likesData)
      }
      fetchTvShows()
      fetchUserData()
    }
  }, [subscriptionStatus, loading, currentUser])

  if (loading) return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>

  if (subscriptionStatus !== 'active')
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold">Access Denied</h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-400">You need an active subscription to view TV Shows.</p>
        <button
          onClick={() => navigate('/subscribe')}
          className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
        >
          Go to Subscription Plans
        </button>
      </div>
    )

  const handleAddToList = async (id) => {
    if (!currentUser) return
    if (userList.includes(id)) {
      const listQuery = query(collection(db, 'userLists'), where('userId', '==', currentUser.uid), where('movieId', '==', id))
      const listSnap = await getDocs(listQuery)
      listSnap.forEach(async docSnap => await deleteDoc(doc(db, 'userLists', docSnap.id)))
      setUserList(prev => prev.filter(i => i !== id))
    } else {
      await addDoc(collection(db, 'userLists'), { userId: currentUser.uid, movieId: id })
      setUserList(prev => [...prev, id])
    }
  }

  const handleToggleLike = async (id) => {
    if (!currentUser) return
    const likeRef = query(collection(db, 'userLikes'), where('userId', '==', currentUser.uid), where('movieId', '==', id))
    const snap = await getDocs(likeRef)
    if (!snap.empty) {
      const docId = snap.docs[0].id
      const currentStatus = snap.docs[0].data().liked
      const newStatus = currentStatus === true ? null : true
      await updateDoc(doc(db, 'userLikes', docId), { liked: newStatus })
      setUserLikes(prev => ({ ...prev, [id]: newStatus }))
    } else {
      await addDoc(collection(db, 'userLikes'), { userId: currentUser.uid, movieId: id, liked: true })
      setUserLikes(prev => ({ ...prev, [id]: true }))
    }
  }

  const handleToggleDislike = async (id) => {
    if (!currentUser) return
    const likeRef = query(collection(db, 'userLikes'), where('userId', '==', currentUser.uid), where('movieId', '==', id))
    const snap = await getDocs(likeRef)
    if (!snap.empty) {
      const docId = snap.docs[0].id
      const currentStatus = snap.docs[0].data().liked
      const newStatus = currentStatus === false ? null : false
      await updateDoc(doc(db, 'userLikes', docId), { liked: newStatus })
      setUserLikes(prev => ({ ...prev, [id]: newStatus }))
    } else {
      await addDoc(collection(db, 'userLikes'), { userId: currentUser.uid, movieId: id, liked: false })
      setUserLikes(prev => ({ ...prev, [id]: false }))
    }
  }

  const ShowRow = ({ title, filter }) => {
    const rowRef = useRef(null)
    const slideLeft = () => rowRef.current.scrollBy({ left: -500, behavior: 'smooth' })
    const slideRight = () => rowRef.current.scrollBy({ left: 500, behavior: 'smooth' })
    const filteredShows = filter ? tvShows.filter(filter) : tvShows

    return (
      <section className="mb-12 relative group">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <MdChevronLeft
          onClick={slideLeft}
          className="hidden group-hover:block absolute top-1/2 left-0 -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 cursor-pointer z-20"
        />
        <div ref={rowRef} className="flex space-x-2 overflow-x-auto hide-scrollbar scroll-smooth py-2">
          {filteredShows.map(show => (
            <div
              key={show.id}
              className="relative w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] flex-shrink-0 group cursor-pointer"
            >
              <div
                className="group relative bg-gray-800 rounded-lg overflow-hidden aspect-video transform transition-all duration-300 ease-in-out hover:scale-110 hover:z-50 hover:shadow-2xl"
                onClick={() => navigate(`/details/${show.id}`)} // ✅ Navigate to Details page
              >
                <img
                  src={show.thumbnailUrl || 'https://via.placeholder.com/300x200.png?text=No+Thumbnail'}
                  alt={show.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-3 space-y-2 transition-opacity duration-300">
                  <div className="flex justify-between text-2xl">
                    <span onClick={e => { e.stopPropagation(); handleAddToList(show.id) }} className="cursor-pointer">
                      {userList.includes(show.id) ? <FaList className="text-red-600" /> : <FaRegListAlt className="text-white" />}
                    </span>
                    <span onClick={e => { e.stopPropagation(); handleToggleLike(show.id) }} className="cursor-pointer">
                      {userLikes[show.id] === true ? <FaHeart className="text-red-600" /> : <FaRegHeart className="text-white" />}
                    </span>
                    <span onClick={e => { e.stopPropagation(); handleToggleDislike(show.id) }} className="cursor-pointer">
                      {userLikes[show.id] === false ? <FaThumbsDown className="text-red-600" /> : <FaThumbsDown className="text-white" />}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-sm">{show.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
        <MdChevronRight
          onClick={slideRight}
          className="hidden group-hover:block absolute top-1/2 right-0 -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 cursor-pointer z-20"
        />
      </section>
    )
  }

  return (
    <div className="pt-20 px-4">
      <ShowRow title="All TV Shows" />
      <ShowRow title="Trending" filter={show => show.category === 'Trending'} />
      <ShowRow title="Action" filter={show => show.category === 'Action'} />
      <ShowRow title="Comedy" filter={show => show.category === 'Comedy'} />
    </div>
  )
}

export default TvShows
