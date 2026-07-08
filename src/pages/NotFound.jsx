import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container">
      <p className="eyebrow">404</p>
      <h1>This route doesn't exist.</h1>
      <p><Link to="/">Back to the homepage</Link></p>
    </div>
  );
}
