import { Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import TravelModes from './pages/TravelModes.jsx';
import FareEstimator from './pages/FareEstimator.jsx';
import JourneyComparison from './pages/JourneyComparison.jsx';
import JourneyPlanner from './pages/JourneyPlanner.jsx';
import NearbyStops from './pages/NearbyStops.jsx';
import BikeShare from './pages/BikeShare.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Alerts from './pages/Alerts.jsx';
import Sustainability from './pages/Sustainability.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/modes" element={<TravelModes />} />
          <Route path="/fare-estimator" element={<FareEstimator />} />
          <Route path="/compare" element={<JourneyComparison />} />
          <Route path="/planner" element={<JourneyPlanner />} />
          <Route path="/nearby" element={<NearbyStops />} />
          <Route path="/bike-share" element={<BikeShare />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
