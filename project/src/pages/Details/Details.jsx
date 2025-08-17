import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../AuthContext'
import { FaHeart, FaRegHeart, FaThumbsDown, FaRegListAlt, FaList } from 'react-icons/fa'

const Details = () => {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [currentEpisode, setCurrentEpisode] = useState(null)
  const [inList, setInList] = useState(false)
  const [likedStatus, setLikedStatus] = useState(null)
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchItem = async () => {
      const docSnap = await getDoc(doc(db, 'moviesAndSeries', id))
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() }
        setItem(data)

        if (data.episodes && data.episodes.length > 0) {
          setCurrentEpisode(data.episodes[0])
        } else {
          setCurrentEpisode({ youtubeId: data.youtubeId, title: data.title })
        }
      }
    }

    const fetchUserData = async () => {
      if (!currentUser) return

      const listSnap = await getDocs(
        query(collection(db, 'userLists'), where('userId', '==', currentUser.uid), where('movieId', '==', id))
      )
      setInList(!listSnap.empty)

      const likeSnap = await getDocs(
        query(collection(db, 'userLikes'), where('userId', '==', currentUser.uid), where('movieId', '==', id))
      )
      setLikedStatus(likeSnap.docs.length > 0 ? likeSnap.docs[0].data().liked : null)
    }

    fetchItem()
    fetchUserData()
  }, [id, currentUser])

  if (!item)
    return <div className="text-white flex items-center justify-center min-h-screen">Loading...</div>

  const handleToggleList = async () => {
    if (!currentUser) return
    if (inList) {
      const listQuery = query(
        collection(db, 'userLists'),
        where('userId', '==', currentUser.uid),
        where('movieId', '==', id)
      )
      const listSnap = await getDocs(listQuery)
      listSnap.forEach(async docSnap => await deleteDoc(doc(db, 'userLists', docSnap.id)))
      setInList(false)
    } else {
      await addDoc(collection(db, 'userLists'), { userId: currentUser.uid, movieId: id })
      setInList(true)
    }
  }

  const handleToggleLike = async () => {
    if (!currentUser) return
    const likeQuery = query(
      collection(db, 'userLikes'),
      where('userId', '==', currentUser.uid),
      where('movieId', '==', id)
    )
    const snap = await getDocs(likeQuery)
    if (!snap.empty) {
      const docId = snap.docs[0].id
      const currentStatus = snap.docs[0].data().liked
      const newStatus = currentStatus === true ? null : true
      await updateDoc(doc(db, 'userLikes', docId), { liked: newStatus })
      setLikedStatus(newStatus)
    } else {
      await addDoc(collection(db, 'userLikes'), { userId: currentUser.uid, movieId: id, liked: true })
      setLikedStatus(true)
    }
  }

  const handleToggleDislike = async () => {
    if (!currentUser) return
    const likeQuery = query(
      collection(db, 'userLikes'),
      where('userId', '==', currentUser.uid),
      where('movieId', '==', id)
    )
    const snap = await getDocs(likeQuery)
    if (!snap.empty) {
      const docId = snap.docs[0].id
      const currentStatus = snap.docs[0].data().liked
      const newStatus = currentStatus === false ? null : false
      await updateDoc(doc(db, 'userLikes', docId), { liked: newStatus })
      setLikedStatus(newStatus)
    } else {
      await addDoc(collection(db, 'userLikes'), { userId: currentUser.uid, movieId: id, liked: false })
      setLikedStatus(false)
    }
  }

  return (
    <div className="pt-20 px-4 text-white max-w-5xl mx-auto">
      <div className="flex flex-col min-h-screen">
        <h1 className="text-4xl font-bold mb-4">{item.title}</h1>
        <p className="mb-4 text-gray-400">{item.category}</p>

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

        <p className="mb-6">{item.description}</p>

        <div className="flex space-x-6 text-3xl mb-6">
          <span onClick={handleToggleList} className="cursor-pointer">
            {inList ? <FaList className="text-red-500" /> : <FaRegListAlt className="text-white" />}
          </span>

          <span onClick={handleToggleLike} className="cursor-pointer">
            {likedStatus === true ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-white" />}
          </span>

          <span onClick={handleToggleDislike} className="cursor-pointer">
            <FaThumbsDown className={likedStatus === false ? 'text-red-500' : 'text-white'} />
          </span>
        </div>

        {item.episodes && item.episodes.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Episodes</h2>
            <ul className="space-y-2">
              {item.episodes.map((ep, index) => (
                <li
                  key={index}
                  className={`p-3 rounded cursor-pointer ${
                    currentEpisode?.youtubeId === ep.youtubeId ? 'bg-red-600' : 'bg-gray-800'
                  }`}
                  onClick={() => setCurrentEpisode(ep)}
                >
                  Episode {ep.number}: {ep.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default Details
