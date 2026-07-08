import { useMemo, useState } from 'react';
import RouteDivider from '../components/RouteDivider.jsx';
import { TRANSPORT_MODES, getMode } from '../data/transportModes.js';
import { estimateFare, estimateTimeHours } from '../data/fareRates.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import './Dashboard.css';

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Scores a mode for a given distance the same way the journey
// comparison tool does — lower is better. Used to find whether a
// saved journey's current mode is actually the best option available.
function scoreMode(modeId, distanceKm) {
  const mode = getMode(modeId);
  const fare = estimateFare(modeId, distanceKm);
  const hours = estimateTimeHours(modeId, distanceKm, mode.avgSpeedKmh);
  if (!fare || !hours) return Infinity;
  return fare.mid + hours * 60 * 0.05;
}

function bestModeFor(distanceKm, excludeModeId) {
  let best = null;
  let bestScore = Infinity;
  TRANSPORT_MODES.forEach((m) => {
    if (m.id === excludeModeId) return;
    const score = scoreMode(m.id, distanceKm);
    if (score < bestScore) {
      bestScore = score;
      best = m;
    }
  });
  return best;
}

export default function Dashboard() {
  const [journeys, setJourneys] = useLocalStorage('dashboard:journeys', []);
  const [preferredMode, setPreferredMode] = useLocalStorage('dashboard:preferredMode', 'bus');
  const [form, setForm] = useState({ label: '', from: '', to: '', mode: 'bus', minutes: 20, distanceKm: '' });

  function addJourney(e) {
    e.preventDefault();
    if (!form.label.trim()) return;
    setJourneys([{ ...form, id: newId() }, ...journeys]);
    setForm({ label: '', from: '', to: '', mode: 'bus', minutes: 20, distanceKm: '' });
  }

  function removeJourney(id) {
    setJourneys(journeys.filter((j) => j.id !== id));
  }

  const avgMinutes = journeys.length
    ? Math.round(journeys.reduce((sum, j) => sum + Number(j.minutes || 0), 0) / journeys.length)
    : null;

  // Intelligent recommendation, built from the user's own saved
  // journeys rather than a generic tip: find the most-used mode, then
  // check whether it's actually cheapest/fastest for the journeys it's
  // used on, based on their logged distances.
  const insight = useMemo(() => {
    const withDistance = journeys.filter((j) => Number(j.distanceKm) > 0);
    if (withDistance.length === 0) return null;

    const frequency = {};
    withDistance.forEach((j) => { frequency[j.mode] = (frequency[j.mode] || 0) + 1; });
    const [favouriteMode] = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0];

    const relevant = withDistance.filter((j) => j.mode === favouriteMode);
    const avgDistance = relevant.reduce((sum, j) => sum + Number(j.distanceKm), 0) / relevant.length;
    const alternative = bestModeFor(avgDistance, favouriteMode);
    const favouriteModeInfo = getMode(favouriteMode);

    if (!alternative || alternative.id === favouriteMode) return null;

    const currentScore = scoreMode(favouriteMode, avgDistance);
    const altScore = scoreMode(alternative.id, avgDistance);
    if (currentScore <= altScore) return null; // current choice already best — no tip needed

    return {
      favouriteModeInfo,
      alternative,
      avgDistance: avgDistance.toFixed(1),
      journeyCount: relevant.length,
    };
  }, [journeys]);

  return (
    <div className="container">
      <p className="eyebrow">Personalised</p>
      <h1>Your travel dashboard</h1>
      <p className="page-lede">
        Save the journeys you take often, and set the mode you default to. Everything
        here is stored on this device only.
      </p>
      <RouteDivider />

      <div className="dashboard-summary grid-3">
        <div className="card">
          <span className="eyebrow">Saved journeys</span>
          <p className="data-figure" style={{ fontSize: '2rem', margin: '0.3rem 0 0' }}>{journeys.length}</p>
        </div>
        <div className="card">
          <span className="eyebrow">Typical travel time</span>
          <p className="data-figure" style={{ fontSize: '2rem', margin: '0.3rem 0 0' }}>
            {avgMinutes ? `${avgMinutes} min` : '—'}
          </p>
        </div>
        <div className="card">
          <span className="eyebrow">Preferred mode</span>
          <select value={preferredMode} onChange={(e) => setPreferredMode(e.target.value)} style={{ marginTop: '0.5rem', width: '100%' }}>
            {TRANSPORT_MODES.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      {insight && (
        <div className="card dashboard-insight">
          <span className="eyebrow">Based on your saved journeys</span>
          <p style={{ margin: '0.5rem 0 0' }}>
            You use <strong>{insight.favouriteModeInfo.name}</strong> for {insight.journeyCount} saved{' '}
            {insight.journeyCount === 1 ? 'journey' : 'journeys'} averaging{' '}
            <strong>{insight.avgDistance}km</strong>. For that distance,{' '}
            <strong>{insight.alternative.name}</strong> typically works out cheaper and/or faster —
            worth trying next time.
          </p>
        </div>
      )}

      <h2 style={{ marginTop: '2.5rem' }}>Save a favourite journey</h2>
      <form className="card dashboard-form" onSubmit={addJourney}>
        <div className="field">
          <label htmlFor="label">Journey name</label>
          <input id="label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Home to campus" required />
        </div>
        <div className="field">
          <label htmlFor="dfrom">From</label>
          <input id="dfrom" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="dto">To</label>
          <input id="dto" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="dmode">Mode</label>
          <select id="dmode" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            {TRANSPORT_MODES.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="ddistance">Distance (km)</label>
          <input id="ddistance" type="number" min="0.1" step="0.1" value={form.distanceKm}
            onChange={(e) => setForm({ ...form, distanceKm: e.target.value })} placeholder="optional" />
        </div>
        <div className="field">
          <label htmlFor="dminutes">Typical time (min)</label>
          <input id="dminutes" type="number" min="1" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} />
        </div>
        <button className="btn" type="submit">Save journey</button>
      </form>

      {journeys.length > 0 && (
        <ul className="dashboard-list">
          {journeys.map((j) => {
            const mode = getMode(j.mode);
            return (
              <li key={j.id} className="card" style={{ borderLeft: `5px solid ${mode?.lineColour}` }}>
                <div>
                  <strong>{j.label}</strong>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                    {j.from || '—'} → {j.to || '—'} · {mode?.name} · ~{j.minutes} min
                    {j.distanceKm ? ` · ${j.distanceKm}km` : ''}
                  </p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => removeJourney(j.id)}>Remove</button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}