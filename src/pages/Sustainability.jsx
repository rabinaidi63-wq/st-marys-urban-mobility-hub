import { useMemo, useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import RouteDivider from '../components/RouteDivider.jsx';
import { TRANSPORT_MODES } from '../data/transportModes.js';
import { estimateEmissionsGrams, CARBON_FACTORS_G_PER_KM } from '../data/carbonFactors.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import './Sustainability.css';

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

const TREND_DAYS = 14;

export default function Sustainability() {
  const [distance, setDistance] = useLocalStorage('sustain:distance', 8);
  const [weeklyGoalKm, setWeeklyGoalKm] = useLocalStorage('sustain:goalKm', 20);
  // History of logged low-carbon trips: [{ id, km, date }]. This is the
  // real record everything else (weekly progress, trend chart, total
  // emissions saved) is derived from — nothing is a floating counter.
  const [history, setHistory] = useLocalStorage('sustain:history', []);
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

  function logDistance(e) {
    e.preventDefault();
    const val = Number(logInput);
    if (val > 0) {
      setHistory([...history, { id: newId(), km: val, date: new Date().toISOString() }]);
      setLogInput('');
    }
  }

  function removeEntry(id) {
    setHistory(history.filter((h) => h.id !== id));
  }

  const weekStart = startOfWeek(new Date());
  const weekEntries = history.filter((h) => new Date(h.date) >= weekStart);
  const loggedKm = Number(weekEntries.reduce((sum, h) => sum + Number(h.km), 0).toFixed(1));
  const goalPct = weeklyGoalKm > 0 ? Math.min(100, Math.round((loggedKm / weeklyGoalKm) * 100)) : 0;

  // Extended goal tracking: a real cumulative trend over the last 14
  // days, not just a single-week snapshot — built from the same
  // history the log form writes to.
  const trendData = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = TREND_DAYS - 1; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({ key: dayKey(date), label: date.toLocaleDateString([], { day: '2-digit', month: 'short' }), km: 0 });
    }
    const byDay = Object.fromEntries(days.map((dd) => [dd.key, dd]));
    history.forEach((h) => {
      const key = dayKey(h.date);
      if (byDay[key]) byDay[key].km += Number(h.km);
    });
    let cumulative = 0;
    return days.map((dd) => {
      cumulative += dd.km;
      return { ...dd, km: Number(dd.km.toFixed(1)), cumulative: Number(cumulative.toFixed(1)) };
    });
  }, [history]);

  const totalKmLogged = Number(history.reduce((sum, h) => sum + Number(h.km), 0).toFixed(1));
  const totalEmissionsSavedG = Math.round(totalKmLogged * CARBON_FACTORS_G_PER_KM.bus);

  return (
    <div className="container">
      <p className="eyebrow">Sustainability</p>
      <h1>Carbon footprint & goals</h1>
      <p className="page-lede">
        Compare estimated CO2e across modes for a given distance, and track low-carbon
        travel over time against a weekly goal.
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
        <ResponsiveContainer width="100%" height={240}>
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
            <strong>{Math.round(busEmissions)}g CO2e</strong>.
          </p>
        )}
      </div>

      <h2 style={{ marginTop: '2.5rem' }}>Low-carbon travel trend</h2>
      <div className="card sustain-chart">
        <span className="eyebrow">Cumulative distance logged — last {TREND_DAYS} days</span>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trendData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" stroke="var(--ink-soft)" fontSize={11} interval={2} />
            <YAxis stroke="var(--ink-soft)" fontSize={12} />
            <Tooltip formatter={(v) => [`${v} km`, 'Cumulative']} />
            <Area type="monotone" dataKey="cumulative" stroke="var(--line-rail)" fill="var(--line-rail)" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
          <strong>{totalKmLogged} km</strong> logged in total — an estimated{' '}
          <strong>{(totalEmissionsSavedG / 1000).toFixed(2)} kg CO2e</strong> saved versus taking the bus instead.
        </p>
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
        </div>

        <div className="card">
          <span className="eyebrow">Progress this week</span>
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

      {weekEntries.length > 0 && (
        <ul className="sustain-log">
          {weekEntries.slice().reverse().map((h) => (
            <li key={h.id}>
              <span>{h.km} km — {new Date(h.date).toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' })}</span>
              <button className="btn btn-outline btn-sm" onClick={() => removeEntry(h.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}