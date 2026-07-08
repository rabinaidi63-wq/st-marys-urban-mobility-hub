import { useEffect, useRef, useState } from 'react';
import RouteDivider from '../components/RouteDivider.jsx';
import { getLineStatus } from '../api/tflApi.js';
import { usePolling } from '../hooks/usePolling.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import './Alerts.css';

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const POLL_INTERVAL_MS = 60_000; // re-check live status every minute

export default function Alerts() {
  const [subscriptions, setSubscriptions] = useLocalStorage('alerts:subscriptions', []);
  const [lineName, setLineName] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notifyEnabled, setNotifyEnabled] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  // Auto-refreshing live status feed — this is what makes alerting
  // "real-time" rather than a one-off check on page load.
  const { data: lines, loading } = usePolling(() => getLineStatus(), POLL_INTERVAL_MS, []);

  function addSubscription(e) {
    e.preventDefault();
    if (!lineName.trim()) return;
    setSubscriptions([...subscriptions, { id: newId(), line: lineName.trim(), priority }]);
    setLineName('');
  }

  function removeSubscription(id) {
    setSubscriptions(subscriptions.filter((s) => s.id !== id));
  }

  async function enableNotifications() {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setNotifyEnabled(result === 'granted');
  }

  // Cross-reference each subscription against the live status feed,
  // prioritised so "high" subscriptions surface first regardless of
  // when they were disrupted.
  const PRIORITY_ORDER = { high: 0, normal: 1, low: 2 };
  const activeAlerts = subscriptions
    .map((sub) => {
      const line = lines?.find((l) => l.name.toLowerCase() === sub.line.toLowerCase());
      const status = line?.lineStatuses?.[0]?.statusSeverityDescription;
      const disrupted = status && status !== 'Good Service';
      return disrupted ? { ...sub, status, reason: line.lineStatuses[0].reason } : null;
    })
    .filter(Boolean)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  // Fire a real OS notification only for alerts that weren't already
  // active on the previous poll — avoids re-notifying every minute for
  // the same ongoing disruption.
  const previousIdsRef = useRef(new Set());
  useEffect(() => {
    if (!notifyEnabled) return;
    const currentIds = new Set(activeAlerts.map((a) => a.id));
    activeAlerts.forEach((a) => {
      if (!previousIdsRef.current.has(a.id)) {
        new Notification(`${a.line}: ${a.status}`, {
          body: a.reason || 'New disruption on a line you follow.',
        });
      }
    });
    previousIdsRef.current = currentIds;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAlerts.map((a) => a.id).join(','), notifyEnabled]);

  return (
    <div className="container">
      <p className="eyebrow">Personalised · Live · Auto-refreshing</p>
      <h1>Travel alerts</h1>
      <p className="page-lede">
        Subscribe to lines or routes you use regularly. Status is rechecked
        automatically every minute, and alerts are ordered by the priority
        you've set.
      </p>
      <RouteDivider />

      {!notifyEnabled && typeof Notification !== 'undefined' && (
        <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem' }}>Get a browser notification the moment a followed line is disrupted.</span>
          <button className="btn btn-sm" onClick={enableNotifications}>Enable notifications</button>
        </div>
      )}

      {activeAlerts.length > 0 && (
        <div className="alerts-active">
          <h2>Active alerts {loading && <span className="eyebrow" style={{ marginLeft: '0.5rem' }}>checking…</span>}</h2>
          <ul>
            {activeAlerts.map((a) => (
              <li key={a.id} className={`card alert-card alert-card--${a.priority}`}>
                <strong>{a.line}</strong> — {a.status}
                {a.reason && <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem' }}>{a.reason}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2>Manage subscriptions</h2>
      <form className="card alerts-form" onSubmit={addSubscription}>
        <div className="field">
          <label htmlFor="lineName">Line or route name</label>
          <input id="lineName" value={lineName} onChange={(e) => setLineName(e.target.value)} placeholder="e.g. Piccadilly" required />
        </div>
        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="high">High — notify me first</option>
            <option value="normal">Normal</option>
            <option value="low">Low — just log it</option>
          </select>
        </div>
        <button className="btn" type="submit">Add subscription</button>
      </form>

      {subscriptions.length > 0 && (
        <ul className="alerts-list">
          {subscriptions.map((s) => (
            <li key={s.id} className="card">
              <span>{s.line} <span className="eyebrow">· {s.priority}</span></span>
              <button className="btn btn-outline btn-sm" onClick={() => removeSubscription(s.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}