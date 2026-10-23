import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import TrainDetails from './pages/TrainDetails';
import StationBoard from './pages/StationBoard';
import SpotTrain from './pages/SpotTrain';
import PnrStatus from './pages/PnrStatus';
import useThemeStore from './context/themeStore';
import { useEffect } from 'react';

function App() {
  const initTheme = useThemeStore(state => state.initTheme);
  
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/spot" element={<SpotTrain />} />
          <Route path="/train/:trainNumber" element={<TrainDetails />} />
          <Route path="/station" element={<StationBoard />} />
          <Route path="/station/:code" element={<StationBoard />} />
          <Route path="/pnr" element={<PnrStatus />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
