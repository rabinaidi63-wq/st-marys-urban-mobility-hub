// Signature visual device for the app: a four-colour bar echoing
// the route-line colour coding used throughout (bus/rail/cycle/walk).
export default function RouteDivider() {
  return (
    <div className="route-divider" aria-hidden="true">
      <span className="bus" />
      <span className="rail" />
      <span className="cycle" />
      <span className="walk" />
    </div>
  );
}
