import React, { useState, useEffect, useRef } from 'react'
import { db } from '../../firebase'
import { doc, updateDoc, getDoc, addDoc, collection } from 'firebase/firestore'

const SeasonManager = ({ showId, onBack, newSeriesData, setMoviesAndSeries }) => {
  const [seasons, setSeasons] = useState([])
  const [seasonTitle, setSeasonTitle] = useState('')
  const [seasonThumbnail, setSeasonThumbnail] = useState('')
  const [episodes, setEpisodes] = useState([{ title: '', youtubeId: '', thumbnail: '' }])
  const [editingSeason, setEditingSeason] = useState(null)
  const [editingEpisodes, setEditingEpisodes] = useState([])
  const [editingSeasonTitle, setEditingSeasonTitle] = useState('')
  const [editingSeasonThumbnail, setEditingSeasonThumbnail] = useState('')
  const carouselRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!showId) return
      const docRef = doc(db, 'moviesAndSeries', showId)
      const snap = await getDoc(docRef)
      if (snap.exists()) setSeasons(snap.data().seasons || [])
    }
    fetchData()
  }, [showId])

  const handleEpisodeChange = (index, field, value) => {
    const updated = [...episodes]
    updated[index][field] = value
    setEpisodes(updated)
  }

  const addEpisodeField = () => {
    setEpisodes([...episodes, { title: '', youtubeId: '', thumbnail: '' }])
  }

  const saveSeason = async () => {
    const validEpisodes = episodes.filter(e => e.title.trim() && e.youtubeId.trim())
    if (!seasonTitle.trim() || validEpisodes.length === 0) return

    const newSeason = { title: seasonTitle, thumbnail: seasonThumbnail, episodes: validEpisodes }
    const updatedSeasons = [...seasons, newSeason]

    if (showId) {
      // Only update the seasons field
      await updateDoc(doc(db, 'moviesAndSeries', showId), { seasons: updatedSeasons })
    } else if (newSeriesData) {
      // Create a new document with full data
      const docRef = await addDoc(collection(db, 'moviesAndSeries'), { ...newSeriesData, seasons: updatedSeasons })
      setMoviesAndSeries(prev => [...prev, { id: docRef.id, ...newSeriesData, seasons: updatedSeasons }])
    }

    setSeasons(updatedSeasons)
    setSeasonTitle('')
    setSeasonThumbnail('')
    setEpisodes([{ title: '', youtubeId: '', thumbnail: '' }])
    if (!showId) onBack()
  }

  const deleteSeason = async (seasonIndex) => {
    const updatedSeasons = seasons.filter((_, i) => i !== seasonIndex)
    if (showId) await updateDoc(doc(db, 'moviesAndSeries', showId), { seasons: updatedSeasons })
    setSeasons(updatedSeasons)
  }

  const startEditingSeason = (index) => {
    setEditingSeason(index)
    setEditingEpisodes(seasons[index].episodes.map(ep => ({ ...ep })))
    setEditingSeasonTitle(seasons[index].title)
    setEditingSeasonThumbnail(seasons[index].thumbnail || '')
  }

  const saveEditedSeason = async (index) => {
    const updatedSeasons = [...seasons]
    updatedSeasons[index] = {
      title: editingSeasonTitle,
      thumbnail: editingSeasonThumbnail,
      episodes: editingEpisodes.filter(e => e.title.trim() && e.youtubeId.trim())
    }
    if (showId) await updateDoc(doc(db, 'moviesAndSeries', showId), { seasons: updatedSeasons })
    setSeasons(updatedSeasons)
    setEditingSeason(null)
    setEditingEpisodes([])
    setEditingSeasonTitle('')
    setEditingSeasonThumbnail('')
  }

  const handleEditingEpisodeChange = (index, field, value) => {
    const updated = [...editingEpisodes]
    updated[index][field] = value
    setEditingEpisodes(updated)
  }

  const addEditingEpisode = () => {
    setEditingEpisodes([...editingEpisodes, { title: '', youtubeId: '', thumbnail: '' }])
  }

  const deleteEpisode = async (seasonIndex, episodeIndex) => {
    const updatedSeasons = [...seasons]
    updatedSeasons[seasonIndex].episodes.splice(episodeIndex, 1)
    if (showId) await updateDoc(doc(db, 'moviesAndSeries', showId), { seasons: updatedSeasons })
    setSeasons(updatedSeasons)
  }

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300
      carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#141414] px-3 py-6">
      {/* Add Season Form */}
      <div className="bg-[#1f1f1f] p-6 rounded-xl shadow-lg max-w-md w-full mb-6">
        <h2 className="text-lg font-bold text-white mb-3">Add Season</h2>
        <input
          type="text"
          placeholder="Season Title"
          value={seasonTitle}
          onChange={e => setSeasonTitle(e.target.value)}
          className="w-full p-2 rounded bg-[#2a2a2a] border border-gray-700 mb-3 text-white"
        />
        <input
          type="text"
          placeholder="Season Thumbnail URL"
          value={seasonThumbnail}
          onChange={e => setSeasonThumbnail(e.target.value)}
          className="w-full p-2 rounded bg-[#2a2a2a] border border-gray-700 mb-3 text-white"
        />
        {seasonThumbnail && <img src={seasonThumbnail} alt="Season Thumbnail" className="mb-3 w-full h-32 object-cover rounded" />}
        <h3 className="text-sm font-semibold mb-2 text-white">Episodes</h3>
        {episodes.map((ep, index) => (
          <div key={index} className="flex flex-col space-y-2 mb-3 bg-[#2a2a2a] p-3 rounded">
            <input type="text" placeholder="Episode Title" value={ep.title} onChange={e => handleEpisodeChange(index, 'title', e.target.value)} className="w-full p-2 rounded bg-[#141414] border border-gray-600 text-sm text-white" />
            <input type="text" placeholder="YouTube ID" value={ep.youtubeId} onChange={e => handleEpisodeChange(index, 'youtubeId', e.target.value)} className="w-full p-2 rounded bg-[#141414] border border-gray-600 text-sm text-white" />
            <input type="text" placeholder="Thumbnail URL" value={ep.thumbnail} onChange={e => handleEpisodeChange(index, 'thumbnail', e.target.value)} className="w-full p-2 rounded bg-[#141414] border border-gray-600 text-sm text-white" />
            {ep.thumbnail && <img src={ep.thumbnail} alt="Thumbnail" className="mt-1 w-full h-24 object-cover rounded" />}
          </div>
        ))}
        <button onClick={addEpisodeField} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm mb-3">+ Add Episode</button>
        <button onClick={saveSeason} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full">Save Season</button>
      </div>

      {/* Carousel */}
      <div className="relative w-full max-w-6xl flex items-center">
        <button onClick={() => scrollCarousel('left')} className="absolute left-0 z-10 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full">&#8592;</button>
        <div ref={carouselRef} className="flex space-x-6 overflow-x-auto scrollbar-hide px-8 py-3">
          {seasons.map((season, i) => (
            <div key={i} className="bg-[#1f1f1f] p-5 rounded-xl shadow-lg min-w-[250px] flex-shrink-0">
              <div className="flex justify-between items-center mb-2">
                {editingSeason === i ? (
                  <div className="flex flex-col w-full">
                    <input type="text" value={editingSeasonTitle} onChange={e => setEditingSeasonTitle(e.target.value)} className="bg-[#2a2a2a] p-1 rounded border border-gray-600 text-xs text-white mb-2" />
                    <input type="text" value={editingSeasonThumbnail} onChange={e => setEditingSeasonThumbnail(e.target.value)} placeholder="Season Thumbnail URL" className="bg-[#2a2a2a] p-1 rounded border border-gray-600 text-xs text-white mb-2" />
                    {editingSeasonThumbnail && <img src={editingSeasonThumbnail} alt="Season Thumbnail" className="w-full h-24 object-cover rounded mb-2" />}
                  </div>
                ) : (
                  <h3 className="text-white font-bold text-sm">{season.title}</h3>
                )}
                <div className="flex space-x-1">
                  <button onClick={() => startEditingSeason(i)} className="bg-red-600 px-2 py-1 rounded text-xs">Edit</button>
                  <button onClick={() => deleteSeason(i)} className="bg-red-600 px-2 py-1 rounded text-xs">Delete</button>
                </div>
              </div>

              {!editingSeason && season.thumbnail && <img src={season.thumbnail} alt="Season Thumbnail" className="w-full h-24 object-cover rounded mb-3" />}

              <ul className="space-y-2">
                {(editingSeason === i ? editingEpisodes : season.episodes).map((ep, j) => (
                  <li key={j} className="flex flex-col bg-[#141414] p-2 rounded text-white">
                    {editingSeason === i ? (
                      <>
                        <input type="text" value={ep.title} onChange={e => handleEditingEpisodeChange(j, 'title', e.target.value)} className="bg-[#2a2a2a] p-1 rounded border border-gray-600 text-xs mb-1 text-white" />
                        <input type="text" value={ep.youtubeId} onChange={e => handleEditingEpisodeChange(j, 'youtubeId', e.target.value)} className="bg-[#2a2a2a] p-1 rounded border border-gray-600 text-xs mb-1 text-white" />
                        <input type="text" value={ep.thumbnail} onChange={e => handleEditingEpisodeChange(j, 'thumbnail', e.target.value)} placeholder="Thumbnail URL" className="bg-[#2a2a2a] p-1 rounded border border-gray-600 text-xs mb-1 text-white" />
                        {ep.thumbnail && <img src={ep.thumbnail} alt="Thumbnail" className="mt-1 w-full h-24 object-cover rounded" />}
                        <button onClick={() => setEditingEpisodes(editingEpisodes.filter((_, idx) => idx !== j))} className="bg-red-600 px-2 py-1 rounded text-xs self-end mt-1">Delete Episode</button>
                      </>
                    ) : (
                      <>
                        <p className="text-xs mb-1">Title: {ep.title}</p>
                        <p className="text-xs mb-1">YouTube ID: {ep.youtubeId}</p>
                        {ep.thumbnail && <img src={ep.thumbnail} alt="Thumbnail" className="mt-1 w-full h-24 object-cover rounded" />}
                      </>
                    )}
                  </li>
                ))}
              </ul>

              {editingSeason === i && (
                <>
                  <button onClick={addEditingEpisode} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded mt-2 w-full">+ Add Episode</button>
                  <button onClick={() => saveEditedSeason(i)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded mt-3 w-full">Save Changes</button>
                </>
              )}
            </div>
          ))}
        </div>
        <button onClick={() => scrollCarousel('right')} className="absolute right-0 z-10 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full">&#8594;</button>
      </div>

      <button onClick={onBack} className="mt-6 bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Back to Admin</button>
    </div>
  )
}

export default SeasonManager
