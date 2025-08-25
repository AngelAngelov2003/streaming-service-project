import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import SeasonManager from '../../components/SeasonManager/SeasonManager.jsx';
import { useAuth } from '../../AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminPage = () => {
  const { role } = useAuth();
  const [formData, setFormData] = useState({
    type: 'movie',
    title: '',
    description: '',
    category: '',
    youtubeId: '',
    thumbnailUrl: '',
    relatedContent: []
  });
  const [moviesAndSeries, setMoviesAndSeries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [managingSeasons, setManagingSeasons] = useState(null);
  const [newSeriesData, setNewSeriesData] = useState(null);
  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'moviesAndSeries'));
      setMoviesAndSeries(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch movies and series. Please try again.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (formData.type === 'movie' && !/^[\w-]{11}$/.test(formData.youtubeId)) newErrors.youtubeId = "Invalid YouTube ID";
    if (formData.thumbnailUrl && !/^https?:\/\/.+\..+/.test(formData.thumbnailUrl)) newErrors.thumbnailUrl = "Invalid URL";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRelatedChange = (id) => {
    if (formData.relatedContent.includes(id)) {
      setFormData(prev => ({ ...prev, relatedContent: prev.relatedContent.filter(r => r !== id) }));
    } else {
      setFormData(prev => ({ ...prev, relatedContent: [...prev.relatedContent, id] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const categoriesArray = formData.category.split(',').map(c => c.trim());
    const dataToSave = {
      type: formData.type,
      title: formData.title,
      description: formData.description,
      category: categoriesArray,
      youtubeId: formData.type === 'movie' ? formData.youtubeId : '',
      thumbnailUrl: formData.thumbnailUrl || 'https://via.placeholder.com/300x200.png?text=No+Thumbnail',
      relatedContent: formData.relatedContent,
      createdAt: new Date()
    };

    if (formData.type === 'series' && !editingId) {
      dataToSave.seasons = [];
    }

    try {
      if (editingId) {
        const existingItem = moviesAndSeries.find(item => item.id === editingId);
        const dataToUpdate = {
          ...existingItem,
          type: formData.type,
          title: formData.title,
          description: formData.description,
          category: categoriesArray,
          youtubeId: formData.type === 'movie' ? formData.youtubeId : existingItem.youtubeId || '',
          thumbnailUrl: formData.thumbnailUrl || existingItem.thumbnailUrl || 'https://via.placeholder.com/300x200.png?text=No+Thumbnail',
          relatedContent: formData.relatedContent
        };
        if (existingItem.type === 'series') dataToUpdate.seasons = existingItem.seasons || [];

        const docRef = doc(db, 'moviesAndSeries', editingId);
        await updateDoc(docRef, dataToUpdate);
        setMoviesAndSeries(prev => prev.map(item => item.id === editingId ? { id: editingId, ...dataToUpdate } : item));
        setEditingId(null);
        toast.success('Item updated successfully.');
      } else if (formData.type === 'series') {
        setNewSeriesData(dataToSave);
        setManagingSeasons('new');
      } else {
        const docRef = await addDoc(collection(db, 'moviesAndSeries'), dataToSave);
        setMoviesAndSeries(prev => [...prev, { id: docRef.id, ...dataToSave }]);
        toast.success('Item added successfully.');
      }

      setFormData({ type: 'movie', title: '', description: '', category: '', youtubeId: '', thumbnailUrl: '', relatedContent: [] });
      setErrors({});
    } catch (err) {
      console.error(err);
      toast.error('Failed to save the item. Please try again.');
    }
  };

  const handleEdit = (item) => {
    const categoryString = Array.isArray(item.category) ? item.category.join(', ') : item.category;
    setFormData({
      type: item.type,
      title: item.title,
      description: item.description,
      category: categoryString,
      youtubeId: item.youtubeId || '',
      thumbnailUrl: item.thumbnailUrl || '',
      relatedContent: item.relatedContent || []
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, 'moviesAndSeries', id));
        setMoviesAndSeries(prev => prev.filter(item => item.id !== id));
        toast.success('Item deleted successfully.');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete the item. Please try again.');
      }
    }
  };

  if (role !== 'admin') return null;

  if (managingSeasons) {
    return (
      <SeasonManager
        showId={managingSeasons === 'new' ? null : managingSeasons}
        onBack={() => {
          setManagingSeasons(null);
          setNewSeriesData(null);
          fetchData();
        }}
        newSeriesData={newSeriesData}
        setMoviesAndSeries={setMoviesAndSeries}
      />
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#141414] text-white px-4 py-10">
      <div className="bg-[#1f1f1f] p-8 rounded-2xl shadow-lg max-w-lg w-full mb-10">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Admin Panel</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500">
              <option value="movie">Movie</option>
              <option value="series">TV Series</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500" required />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500" rows="3" required></textarea>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category (comma-separated)</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500" required />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>
          {formData.type === 'movie' && (
            <div>
              <label className="block text-sm font-medium mb-1">YouTube Video ID</label>
              <input type="text" name="youtubeId" value={formData.youtubeId} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500" required />
              {errors.youtubeId && <p className="text-red-500 text-sm mt-1">{errors.youtubeId}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
            <input type="text" name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:border-yellow-500" />
            {errors.thumbnailUrl && <p className="text-red-500 text-sm mt-1">{errors.thumbnailUrl}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Related Content</label>
            <div className="max-h-40 overflow-y-auto border border-gray-700 rounded p-2 bg-[#2a2a2a]">
              {moviesAndSeries.filter(m => !editingId || m.id !== editingId).map(item => (
                <label key={item.id} className="flex items-center mb-1">
                  <input type="checkbox" checked={formData.relatedContent.includes(item.id)} onChange={() => handleRelatedChange(item.id)} className="mr-2" />
                  {item.title}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Add'}</button>
        </form>
      </div>

      <div className="bg-[#1f1f1f] p-6 rounded-2xl shadow-lg max-w-3xl w-full">
        <h2 className="text-xl font-bold text-red-500 mb-4">Existing Movies & Series</h2>
        <ul className="space-y-3">
          {moviesAndSeries.map(item => (
            <li key={item.id} className="flex justify-between items-center bg-[#2a2a2a] p-3 rounded">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-gray-400 text-sm">{item.type} | {Array.isArray(item.category) ? item.category.join(', ') : item.category}</p>
              </div>
              <div className="flex space-x-2">
                {item.type === 'series' && <button className="bg-blue-600 px-3 py-1 rounded" onClick={() => setManagingSeasons(item.id)}>Manage Seasons</button>}
                <button className="bg-yellow-500 px-3 py-1 rounded" onClick={() => handleEdit(item)}>Edit</button>
                <button className="bg-red-600 px-3 py-1 rounded" onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminPage;
