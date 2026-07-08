import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';

// Only the homepage is eager-loaded (it's the first thing every visitor
// sees). Every other route is code-split into its own chunk so the
// initial bundle only ships what's needed for first paint — the rest
// loads on demand as the user navigates.
const TravelModes = lazy(() => import('./pages/TravelModes.jsx'));
const FareEstimator = lazy(() => import('./pages/FareEstimator.jsx'));
const JourneyComparison = lazy(() => import('./pages/JourneyComparison.jsx'));
const JourneyPlanner = lazy(() => import('./pages/JourneyPlanner.jsx'));
const NearbyStops = lazy(() => import('./pages/NearbyStops.jsx'));
const BikeShare = lazy(() => import('./pages/BikeShare.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Alerts = lazy(() => import('./pages/Alerts.jsx'));
const Sustainability = lazy(() => import('./pages/Sustainability.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function RouteFallback() {
  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <p className="eyebrow">Loading…</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main className="page">
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
      </main>
      <Footer />
    </>
  );
}