import RouteDivider from '../components/RouteDivider.jsx';
import { TRANSPORT_MODES, getMode } from '../data/transportModes.js';
import { estimateFare, estimateTimeHours } from '../data/fareRates.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import './JourneyComparison.css';

function ModeResult({ modeId, distance }) {
  const mode = getMode(modeId);
  const fare = estimateFare(modeId, distance);
  const hours = estimateTimeHours(modeId, distance, mode.avgSpeedKmh);
  const minutes = hours ? Math.round(hours * 60) : null;

  return (
    <div className="compare-result" style={{ borderTopColor: mode.lineColour }}>
      <h3>{mode.name}</h3>
      <dl>
        <div><dt>Cost</dt><dd className="data-figure">£{fare.low.toFixed(2)}–£{fare.high.toFixed(2)}</dd></div>
        <div><dt>Time</dt><dd className="data-figure">{minutes} min</dd></div>
      </dl>
    </div>
  );
}

export default function JourneyComparison() {
  const [distance, setDistance] = useLocalStorage('compare:distance', 8);
  const [modeA, setModeA] = useLocalStorage('compare:modeA', 'bus');
  const [modeB, setModeB] = useLocalStorage('compare:modeB', 'rail');

  const d = Number(distance) || 0;
  const fareA = estimateFare(modeA, d);
  const fareB = estimateFare(modeB, d);
  const modeAInfo = getMode(modeA);
  const modeBInfo = getMode(modeB);
  const timeA = estimateTimeHours(modeA, d, modeAInfo.avgSpeedKmh) * 60;
  const timeB = estimateTimeHours(modeB, d, modeBInfo.avgSpeedKmh) * 60;

  let verdict = null;
  if (d > 0) {
    const scoreA = fareA.mid + timeA * 0.05; // weight cost & time roughly comparably
    const scoreB = fareB.mid + timeB * 0.05;
    verdict = scoreA <= scoreB ? modeAInfo.name : modeBInfo.name;
  }

  return (
    <div className="container">
      <p className="eyebrow">Tool</p>
      <h1>Compare two journeys</h1>
      <p className="page-lede">
        See cost and time side by side for the same distance across two travel modes.
      </p>
      <RouteDivider />

      <div className="card compare-form">
        <div className="field">
          <label htmlFor="cdistance">Distance (km)</label>
          <input id="cdistance" type="number" min="0.1" step="0.1" value={distance}
            onChange={(e) => setDistance(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="modeA">Mode A</label>
          <select id="modeA" value={modeA} onChange={(e) => setModeA(e.target.value)}>
            {TRANSPORT_MODES.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="modeB">Mode B</label>
          <select id="modeB" value={modeB} onChange={(e) => setModeB(e.target.value)}>
            {TRANSPORT_MODES.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      {d > 0 && (
        <>
          <div className="grid-2 compare-results">
            <ModeResult modeId={modeA} distance={d} />
            <ModeResult modeId={modeB} distance={d} />
          </div>
          <p className="compare-verdict">
            For this trip, <strong>{verdict}</strong> looks like the better balance of cost and time.
          </p>
        </>
      )}
    </div>
  );
}
