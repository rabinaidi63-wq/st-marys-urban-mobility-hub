import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import RouteDivider from '../components/RouteDivider.jsx';
import { TRANSPORT_MODES } from '../data/transportModes.js';
import { estimateEmissionsGrams } from '../data/carbonFactors.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import './Sustainability.css';

export default function Sustainability() {
  const [distance, setDistance] = useLocalStorage('sustain:distance', 8);
  const [weeklyGoalKm, setWeeklyGoalKm] = useLocalStorage('sustain:goalKm', 20);
  const [loggedKm, setLoggedKm] = useLocalStorage('sustain:loggedKm', 0);
  const [logInput, setLogInput] = useState('');

  const d = Number(distance) || 0;

  const chartData = useMemo(
    () =>
      TRANSPORT_MODES.map((m) => ({
        name: m.name,
        grams: Math.round(estimateEmissionsGrams(m.id, d)),
      })),
    [d]
  );

  const busEmissions = estimateEmissionsGrams('bus', d);
  const cycleSaving = busEmissions; // cycling/walking emit ~0

  function logDistance(e) {
    e.preventDefault();
    const val = Number(logInput);
    if (val > 0) {
      setLoggedKm(Number((loggedKm + val).toFixed(1)));
      setLogInput('');
    }
  }

  const goalPct = weeklyGoalKm > 0 ? Math.min(100, Math.round((loggedKm / weeklyGoalKm) * 100)) : 0;

  return (
    <div className="container">
      <p className="eyebrow">Sustainability</p>
      <h1>Carbon footprint & goals</h1>
      <p className="page-lede">
        Compare estimated CO2e across modes for a given distance, and track weekly
        low-carbon travel — for example, a cycling distance goal.
      </p>
      <RouteDivider />

      <div className="card" style={{ marginBottom: '1.5rem', maxWidth: 260 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="sdistance">Distance to compare (km)</label>
          <input id="sdistance" type="number" min="0.1" step="0.1" value={distance}
            onChange={(e) => setDistance(e.target.value)} />
        </div>
      </div>

      <div className="card sustain-chart">
        <span className="eyebrow">Estimated emissions by mode (g CO2e)</span>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--ink-soft)" fontSize={12} />
            <YAxis stroke="var(--ink-soft)" fontSize={12} />
            <Tooltip formatter={(v) => [`${v} g CO2e`, 'Emissions']} />
            <Bar dataKey="grams" fill="var(--line-cycle)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {busEmissions > 0 && (
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
            Choosing cycling or walking instead of the bus for this trip saves roughly{' '}
            <strong>{Math.round(cycleSaving)}g CO2e</strong>.
          </p>
        )}
      </div>

      <h2 style={{ marginTop: '2.5rem' }}>Weekly low-carbon goal</h2>
      <div className="grid-2">
        <div className="card">
          <div className="field">
            <label htmlFor="goal">Weekly cycling/walking goal (km)</label>
            <input id="goal" type="number" min="1" value={weeklyGoalKm} onChange={(e) => setWeeklyGoalKm(Number(e.target.value))} />
          </div>
          <form onSubmit={logDistance} style={{ display: 'flex', gap: '0.6rem', alignItems: 'end' }}>
            <div className="field" style={{ marginBottom: 0, flex: 1 }}>
              <label htmlFor="log">Log a trip (km)</label>
              <input id="log" type="number" min="0.1" step="0.1" value={logInput} onChange={(e) => setLogInput(e.target.value)} />
            </div>
            <button className="btn btn-sm" type="submit">Log</button>
          </form>
          <button className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => setLoggedKm(0)}>
            Reset week
          </button>
        </div>

        <div className="card">
          <span className="eyebrow">Progress</span>
          <p className="data-figure" style={{ fontSize: '2rem', margin: '0.4rem 0' }}>
            {loggedKm} / {weeklyGoalKm} km
          </p>
          <div className="goal-bar">
            <div className="goal-bar__fill" style={{ width: `${goalPct}%` }} />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginTop: '0.5rem' }}>
            {goalPct >= 100 ? "Goal reached — nice work." : `${goalPct}% of this week's goal.`}
          </p>
        </div>
      </div>
    </div>
  );
}
