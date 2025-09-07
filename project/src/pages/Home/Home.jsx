import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import ContentRow from '../../components/ContentRow/ContentRow.jsx';

const Home = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const { subscriptionStatus, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      const snapshot = await getDocs(collection(db, 'moviesAndSeries'));
      const allItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(allItems);

      const allCategories = new Set();
      allItems.forEach(item => {
        const cats = Array.isArray(item.category) ? item.category : [item.category];
        cats.forEach(c => allCategories.add(c));
      });
      setCategories([...allCategories]);
    };
    fetchItems();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;

  if (subscriptionStatus !== 'active')
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold">Access Denied</h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-400">You need an active subscription to view Home.</p>
        <button onClick={() => navigate('/subscribe')} className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
          Go to Subscription Plans
        </button>
      </div>
    );

  return (
    <div className="pt-20 px-4 space-y-8">
      {categories.map(category => (
        <ContentRow
          key={category}
          title={category}
          category={category}
        />
      ))}
    </div>
  );
};

export default Home;
