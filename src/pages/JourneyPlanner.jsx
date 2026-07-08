import { useState } from 'react';
import RouteDivider from '../components/RouteDivider.jsx';
import { planJourney } from '../api/tflApi.js';
import { useApiData } from '../hooks/useApiData.js';
import './JourneyPlanner.css';

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function JourneyPlanner() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [query, setQuery] = useState(null);

  const { data, loading, error } = useApiData(
    () => planJourney(query.from, query.to),
    [query],
    Boolean(query)
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (from.trim() && to.trim()) setQuery({ from: from.trim(), to: to.trim() });
  }

  return (
    <div className="container">
      <p className="eyebrow">Live tool · TfL Journey API</p>
      <h1>Journey planner</h1>
      <p className="page-lede">
        Enter a start and end location (place names, postcodes, or station names) to
        get real route options with live timing from TfL.
      </p>
      <RouteDivider />

      <form className="card planner-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="from">From</label>
          <input id="from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="e.g. Twickenham" required />
        </div>
        <div className="field">
          <label htmlFor="to">To</label>
          <input id="to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g. Waterloo" required />
        </div>
        <button className="btn" type="submit">Plan journey</button>
      </form>

      {loading && <p>Fetching live route options…</p>}
      {error && (
        <p className="planner-error">
          Couldn't fetch journey options right now — check the location names and try again.
        </p>
      )}

      {data?.journeys?.length > 0 && (
        <ul className="planner-results">
          {data.journeys.slice(0, 4).map((j, i) => (
            <li key={i} className="card">
              <div className="planner-results__head">
                <span className="data-figure">{formatDuration(j.duration)}</span>
                <span className="eyebrow">
                  {j.startDateTime && new Date(j.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <ol className="planner-legs">
                {j.legs?.map((leg, li) => (
                  <li key={li}>
                    {leg.mode?.name} — {leg.instruction?.summary || `${leg.departurePoint?.commonName} → ${leg.arrivalPoint?.commonName}`}
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
