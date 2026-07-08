import RouteDivider from '../components/RouteDivider.jsx';
import { TRANSPORT_MODES } from '../data/transportModes.js';
import { estimateFare } from '../data/fareRates.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

export default function FareEstimator() {
  // Last input is remembered via localStorage (2:2-level persistence).
  const [distance, setDistance] = useLocalStorage('fareEstimator:distance', 5);
  const [modeId, setModeId] = useLocalStorage('fareEstimator:mode', 'bus');

  const result = estimateFare(modeId, Number(distance));
  const mode = TRANSPORT_MODES.find((m) => m.id === modeId);

  return (
    <div className="container">
      <p className="eyebrow">Tool</p>
      <h1>Fare estimator</h1>
      <p className="page-lede">
        Enter a distance and travel mode to get an estimated cost range. Figures are
        illustrative, based on typical per-kilometre rates, not live pricing.
      </p>
      <RouteDivider />

      <div className="grid-2">
        <form className="card" onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label htmlFor="distance">Distance (km)</label>
            <input
              id="distance"
              type="number"
              min="0.1"
              max="200"
              step="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="mode">Travel mode</label>
            <select id="mode" value={modeId} onChange={(e) => setModeId(e.target.value)}>
              {TRANSPORT_MODES.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
            Your last inputs are saved automatically on this device.
          </p>
        </form>

        <div className="card" aria-live="polite">
          <span className="eyebrow">Estimated cost</span>
          {result ? (
            <>
              <p className="data-figure" style={{ fontSize: '2.2rem', margin: '0.4rem 0' }}>
                £{result.low.toFixed(2)} – £{result.high.toFixed(2)}
              </p>
              <p style={{ color: 'var(--ink-soft)' }}>
                For a {distance}km trip by {mode?.name.toLowerCase()}.
              </p>
            </>
          ) : (
            <p>Enter a valid distance to see an estimate.</p>
          )}
        </div>
      </div>
    </div>
  );
}
