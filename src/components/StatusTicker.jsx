import { useApiData } from '../hooks/useApiData.js';
import { getLineStatus } from '../api/tflApi.js';
import './StatusTicker.css';

const SEVERITY_GOOD = new Set(['Good Service']);

// Deliberately excludes 'bus': London has hundreds of numbered bus
// routes ("1", "100", "101"...) which would flood out the handful of
// recognisable Tube/Overground/DLR/Elizabeth line names a snapshot
// widget like this is meant to surface at a glance.
const TICKER_MODES = ['tube', 'overground', 'dlr', 'elizabeth-line'];

export default function StatusTicker() {
  const { data, loading, error } = useApiData(() => getLineStatus(TICKER_MODES), []);

  // Surface disrupted lines first so the widget earns its "live" label —
  // otherwise a long good-service list buries the one thing worth seeing.
  const sorted = data
    ? [...data].sort((a, b) => {
        const aGood = SEVERITY_GOOD.has(a.lineStatuses?.[0]?.statusSeverityDescription);
        const bGood = SEVERITY_GOOD.has(b.lineStatuses?.[0]?.statusSeverityDescription);
        return Number(aGood) - Number(bGood);
      })
    : [];

  return (
    <section className="status-ticker card" aria-label="Live service status">
      <div className="status-ticker__head">
        <span className="eyebrow">Live service status</span>
        {loading && <span className="status-ticker__meta">Checking…</span>}
      </div>

      {error && (
        <p className="status-ticker__error">
          Live status is temporarily unavailable. Try again shortly.
        </p>
      )}

      {!error && !loading && sorted.length > 0 && (
        <ul className="status-ticker__list">
          {sorted.slice(0, 8).map((line) => {
            const status = line.lineStatuses?.[0]?.statusSeverityDescription || 'Unknown';
            const good = SEVERITY_GOOD.has(status);
            return (
              <li key={line.id} className={good ? 'is-good' : 'is-disrupted'}>
                <span className="status-ticker__name">{line.name}</span>
                <span className="status-ticker__status">{status}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}