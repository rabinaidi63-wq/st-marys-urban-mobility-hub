import { useMemo, useState } from 'react';
import RouteDivider from '../components/RouteDivider.jsx';
import { getBikePoints, parseBikePointCounts } from '../api/tflApi.js';
import { useApiData } from '../hooks/useApiData.js';

export default function BikeShare() {
  const [search, setSearch] = useState('');
  const { data, loading, error } = useApiData(() => getBikePoints(), []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    const list = q ? data.filter((p) => p.commonName.toLowerCase().includes(q)) : data;
    return list.slice(0, 15);
  }, [data, search]);

  return (
    <div className="container">
      <p className="eyebrow">Live tool · TfL BikePoint API</p>
      <h1>Bike share availability</h1>
      <p className="page-lede">
        Live bike and dock availability at Santander Cycles docking stations.
      </p>
      <RouteDivider />

      <div className="field" style={{ maxWidth: 360 }}>
        <label htmlFor="bikeSearch">Search docking stations</label>
        <input id="bikeSearch" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. Waterloo" />
      </div>

      {loading && <p>Loading live bike availability…</p>}
      {error && <p style={{ color: '#a3253a' }}>Couldn't load bike share data right now.</p>}

      {filtered.length > 0 && (
        <div className="grid-3">
          {filtered.map((point) => {
            const { bikes, empty, docks } = parseBikePointCounts(point);
            const pct = docks ? Math.round((bikes / docks) * 100) : 0;
            return (
              <div key={point.id} className="card">
                <h3 style={{ fontSize: '1rem' }}>{point.commonName}</h3>
                <p className="data-figure" style={{ fontSize: '1.6rem', margin: '0.4rem 0' }}>
                  {bikes} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink-soft)' }}>bikes</span>
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', margin: 0 }}>{empty} empty docks · {docks} total</p>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, marginTop: '0.6rem', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--line-cycle)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
