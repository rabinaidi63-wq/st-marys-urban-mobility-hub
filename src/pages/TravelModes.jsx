import RouteDivider from '../components/RouteDivider.jsx';
import { TRANSPORT_MODES } from '../data/transportModes.js';
import './TravelModes.css';

export default function TravelModes() {
  return (
    <div className="container">
      <p className="eyebrow">Reference</p>
      <h1>Travel modes</h1>
      <p className="page-lede">
        A quick guide to what each mode is good for, so you can pick the right one
        before reaching for the fare estimator or comparison tool.
      </p>
      <RouteDivider />

      <div className="mode-cards">
        {TRANSPORT_MODES.map((m) => (
          <article key={m.id} className="mode-card card" style={{ borderTopColor: m.lineColour }}>
            <h3>{m.name}</h3>
            <p>{m.description}</p>
            <div className="mode-card__lists">
              <div>
                <span className="eyebrow">Benefits</span>
                <ul>{m.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
              </div>
              <div>
                <span className="eyebrow">Limitations</span>
                <ul>{m.limitations.map((l) => <li key={l}>{l}</li>)}</ul>
              </div>
            </div>
            <p className="mode-card__speed data-figure">~{m.avgSpeedKmh} km/h average</p>
          </article>
        ))}
      </div>
    </div>
  );
}
