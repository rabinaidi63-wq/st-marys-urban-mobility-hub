import { useState } from 'react';
import RouteDivider from '../components/RouteDivider.jsx';
import { getLineStatus } from '../api/tflApi.js';
import { useApiData } from '../hooks/useApiData.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import './Alerts.css';

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function Alerts() {
  const [subscriptions, setSubscriptions] = useLocalStorage('alerts:subscriptions', []);
  const [lineName, setLineName] = useState('');
  const [priority, setPriority] = useState('normal');

  const { data: lines } = useApiData(() => getLineStatus(), []);

  function addSubscription(e) {
    e.preventDefault();
    if (!lineName.trim()) return;
    setSubscriptions([...subscriptions, { id: newId(), line: lineName.trim(), priority }]);
    setLineName('');
  }

  function removeSubscription(id) {
    setSubscriptions(subscriptions.filter((s) => s.id !== id));
  }

  // Cross-reference each subscription against the live status feed to
  // surface active alerts — this is what makes it "live", not just a list.
  const activeAlerts = subscriptions
    .map((sub) => {
      const line = lines?.find((l) => l.name.toLowerCase() === sub.line.toLowerCase());
      const status = line?.lineStatuses?.[0]?.statusSeverityDescription;
      const disrupted = status && status !== 'Good Service';
      return disrupted ? { ...sub, status, reason: line.lineStatuses[0].reason } : null;
    })
    .filter(Boolean);

  return (
    <div className="container">
      <p className="eyebrow">Personalised · Live</p>
      <h1>Travel alerts</h1>
      <p className="page-lede">
        Subscribe to lines or routes you use regularly. When TfL reports a
        disruption on one of them, it surfaces here, prioritised by how you've
        flagged it.
      </p>
      <RouteDivider />

      {activeAlerts.length > 0 && (
        <div className="alerts-active">
          <h2>Active alerts</h2>
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
