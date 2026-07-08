import { useApiData } from '../hooks/useApiData.js';
import { getLineStatus } from '../api/tflApi.js';
import './StatusTicker.css';

const SEVERITY_GOOD = new Set(['Good Service']);

export default function StatusTicker() {
  const { data, loading, error } = useApiData(() => getLineStatus(), []);

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

      {!error && !loading && data && (
        <ul className="status-ticker__list">
          {data.slice(0, 8).map((line) => {
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
