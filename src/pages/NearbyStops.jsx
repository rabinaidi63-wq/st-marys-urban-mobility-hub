import { useState } from 'react';
import RouteDivider from '../components/RouteDivider.jsx';
import { getNearbyStops } from '../api/tflApi.js';
import { useApiData } from '../hooks/useApiData.js';

const DEFAULT_LOCATION = { lat: 51.4468, lon: -0.3268, label: "St Mary's, Twickenham" };

export default function NearbyStops() {
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const active = coords || DEFAULT_LOCATION;

  const { data, loading, error } = useApiData(
    () => getNearbyStops(active.lat, active.lon),
    [active.lat, active.lon]
  );

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'Your location' });
        setLocating(false);
      },
      () => {
        setLocationError('Could not get your location — showing the default area instead.');
        setLocating(false);
      }
    );
  }

  return (
    <div className="container">
      <p className="eyebrow">Live tool · TfL StopPoint API</p>
      <h1>Nearby stops</h1>
      <p className="page-lede">Find the closest bus stops and stations to a location.</p>
      <RouteDivider />

      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span>Showing stops near <strong>{active.label}</strong></span>
        <button className="btn btn-outline btn-sm" onClick={useMyLocation} disabled={locating}>
          {locating ? 'Locating…' : 'Use my location'}
        </button>
        {locationError && <span style={{ color: '#a3253a', fontSize: '0.85rem' }}>{locationError}</span>}
      </div>

      {loading && <p>Finding nearby stops…</p>}
      {error && <p style={{ color: '#a3253a' }}>Couldn't load nearby stops right now.</p>}

      {data?.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.75rem' }}>
          {data.slice(0, 12).map((stop) => (
            <li key={stop.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <strong>{stop.commonName}</strong>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                  {(stop.modes || []).join(', ')}
                </p>
              </div>
              <span className="data-figure">{stop.distance ? `${Math.round(stop.distance)} m` : ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
