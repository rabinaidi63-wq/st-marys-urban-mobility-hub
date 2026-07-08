import { Link } from 'react-router-dom';
import RouteDivider from '../components/RouteDivider.jsx';
import StatusTicker from '../components/StatusTicker.jsx';
import { TRANSPORT_MODES } from '../data/transportModes.js';
import './Home.css';

export default function Home() {
  return (
    <div className="container">
      <section className="hero">
        <p className="eyebrow">St Mary's Urban Mobility Hub</p>
        <h1>Plan the journey, not just the destination.</h1>
        <p className="hero__lede">
          Compare cost, time and convenience across bus, rail, cycling and walking —
          all in one place, with live disruption data where it matters.
        </p>
        <div className="hero__actions">
          <Link className="btn" to="/planner">Plan a journey</Link>
          <Link className="btn btn-outline" to="/fare-estimator">Estimate a fare</Link>
        </div>
      </section>

      <RouteDivider />

      <div className="home-grid">
        <div className="home-grid__main">
          <h2>Every mode, one hub</h2>
          <p>
            Urban travel decisions usually mean juggling several apps and websites.
            This hub brings the essentials — fares, comparisons, live status, nearby
            stops and shared bikes — into a single, consistent interface designed for
            everyday commuters, students and occasional travellers alike.
          </p>
          <ul className="mode-strip" aria-label="Supported travel modes">
            {TRANSPORT_MODES.map((m) => (
              <li key={m.id} style={{ borderColor: m.lineColour }}>
                <span className="mode-strip__dot" style={{ background: m.lineColour }} />
                {m.name}
              </li>
            ))}
          </ul>
          <Link to="/modes">See all travel modes →</Link>
        </div>
        <div className="home-grid__aside">
          <StatusTicker />
        </div>
      </div>
    </div>
  );
}
