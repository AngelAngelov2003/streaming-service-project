import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home.jsx';
import TvShows from './pages/TvShows/TvShows.jsx';
import Movies from './pages/Movies/Movies.jsx';
import NewPopular from './pages/NewPopular/NewPopular.jsx';
import List from './pages/List/List.jsx';

function App() {
  return (
    <Router>
      <Header />
      <main className="bg-[#141414] text-white pt-[64px] w-full min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tvshows" element={<TvShows />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/newpopular" element={<NewPopular />} />
          <Route path="/mylist" element={<List />} />
        </Routes>
      </main>
      <Footer /> 
    </Router>
  );
}

export default App;