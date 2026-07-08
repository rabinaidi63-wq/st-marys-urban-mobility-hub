import { NavLink } from 'react-router-dom';
import './Header.css';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/modes', label: 'Travel modes' },
  { to: '/fare-estimator', label: 'Fare estimator' },
  { to: '/compare', label: 'Compare journeys' },
  { to: '/planner', label: 'Journey planner' },
  { to: '/nearby', label: 'Nearby stops' },
  { to: '/bike-share', label: 'Bike share' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/sustainability', label: 'Sustainability' },
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__row">
        <NavLink to="/" className="site-header__brand" end>
          <span className="site-header__mark" aria-hidden="true">SM</span>
          <span>
            St Mary's<br />Urban Mobility Hub
          </span>
        </NavLink>
        <nav className="site-header__nav" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
