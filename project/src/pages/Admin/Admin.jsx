import React, { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore'

const AdminPage = () => {
  const [formData, setFormData] = useState({
    type: 'movie',
    title: '',
    description: '',
    category: '',
    youtubeId: '',
    thumbnailUrl: '',
    episodes: []
  })
  const [moviesAndSeries, setMoviesAndSeries] = useState([])
  const [episodeData, setEpisodeData] = useState({ title: '', youtubeId: '', thumbnailUrl: '' })
  const [editingId, setEditingId] = useState(null)

  const fetchData = async () => {
    const snapshot = await getDocs(collection(db, 'moviesAndSeries'))
    setMoviesAndSeries(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEpisodeChange = (e) => {
    setEpisodeData({ ...episodeData, [e.target.name]: e.target.value })
  }

  const addEpisode = () => {
    if (episodeData.title && episodeData.youtubeId) {
      setFormData({
        ...formData,
        episodes: [...formData.episodes, { ...episodeData }]
      })
      setEpisodeData({ title: '', youtubeId: '', thumbnailUrl: '' })
    }
  }

  const removeEpisode = (index) => {
    const updatedEpisodes = [...formData.episodes]
    updatedEpisodes.splice(index, 1)
    setFormData({ ...formData, episodes: updatedEpisodes })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const dataToSave = {
      type: formData.type,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      youtubeId: formData.type === 'movie' ? formData.youtubeId : '',
      thumbnailUrl: formData.thumbnailUrl || 'https://via.placeholder.com/300x200.png?text=No+Thumbnail',
      episodes: formData.type === 'series' ? formData.episodes : [],
      createdAt: new Date()
    }

    if (editingId) {
      const docRef = doc(db, 'moviesAndSeries', editingId)
      await updateDoc(docRef, dataToSave)
      setMoviesAndSeries(prev => prev.map(item => item.id === editingId ? { id: editingId, ...dataToSave } : item))
      setEditingId(null)
    } else {
      const docRef = await addDoc(collection(db, 'moviesAndSeries'), dataToSave)
      setMoviesAndSeries(prev => [...prev, { id: docRef.id, ...dataToSave }])
    }

    setFormData({ type: 'movie', title: '', description: '', category: '', youtubeId: '', thumbnailUrl: '', episodes: [] })
    setEpisodeData({ title: '', youtubeId: '', thumbnailUrl: '' })
  }

  const handleEdit = (item) => {
    setFormData({
      type: item.type,
      title: item.title,
      description: item.description,
      category: item.category,
      youtubeId: item.youtubeId || '',
      thumbnailUrl: item.thumbnailUrl || '',
      episodes: item.episodes || []
    })
    setEditingId(item.id)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, 'moviesAndSeries', id))
      setMoviesAndSeries(prev => prev.filter(item => item.id !== id))
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#141414] text-white px-4 py-10">
      <div className="bg-[#1f1f1f] p-8 rounded-2xl shadow-lg max-w-lg w-full mb-10">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Admin Panel</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500"
            >
              <option value="movie">Movie</option>
              <option value="series">TV Series</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500"
              rows="3"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500"
              required
            />
          </div>
          {formData.type === 'movie' && (
            <div>
              <label className="block text-sm font-medium mb-1">YouTube Video ID</label>
              <input
                type="text"
                name="youtubeId"
                value={formData.youtubeId}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
            <input
              type="text"
              name="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500"
            />
          </div>
          {formData.type === 'series' && (
            <div className="space-y-2">
              <h3 className="font-semibold">Episodes</h3>
              {formData.episodes.map((ep, index) => (
                <div key={index} className="flex justify-between items-center bg-[#2a2a2a] p-2 rounded">
                  <span>{ep.title}</span>
                  <button type="button" onClick={() => removeEpisode(index)} className="bg-red-600 px-2 py-1 rounded">Remove</button>
                </div>
              ))}
              <div className="mt-2">
                <input
                  type="text"
                  name="title"
                  placeholder="Episode Title"
                  value={episodeData.title}
                  onChange={handleEpisodeChange}
                  className="w-full p-2 rounded bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500 mb-2"
                />
                <input
                  type="text"
                  name="youtubeId"
                  placeholder="YouTube ID"
                  value={episodeData.youtubeId}
                  onChange={handleEpisodeChange}
                  className="w-full p-2 rounded bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500 mb-2"
                />
                <input
                  type="text"
                  name="thumbnailUrl"
                  placeholder="Thumbnail URL"
                  value={episodeData.thumbnailUrl}
                  onChange={handleEpisodeChange}
                  className="w-full p-2 rounded bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500 mb-2"
                />
                <button type="button" onClick={addEpisode} className="bg-yellow-500 px-3 py-1 rounded">Add Episode</button>
              </div>
            </div>
          )}
          <button
            type="submit"
            className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded"
          >
            {editingId ? 'Update' : 'Add'}
          </button>
        </form>
      </div>

      <div className="bg-[#1f1f1f] p-6 rounded-2xl shadow-lg max-w-3xl w-full">
        <h2 className="text-xl font-bold text-yellow-500 mb-4">Existing Movies & Series</h2>
        <ul className="space-y-3">
          {moviesAndSeries.map(item => (
            <li key={item.id} className="flex justify-between items-center bg-[#2a2a2a] p-3 rounded">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-gray-400 text-sm">{item.type} | {item.category}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="bg-yellow-500 px-3 py-1 rounded"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 px-3 py-1 rounded"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default AdminPage
