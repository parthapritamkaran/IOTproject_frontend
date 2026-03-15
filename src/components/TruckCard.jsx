export default function TruckCard({ truck }) {
  const status = truck.route_deviation
    ? "Route Deviation"
    : truck.idle
    ? "Idle"
    : truck.fuel_alert === "HIGH"
    ? "High Fuel"
    : "Normal";

  return (
    <div className="panel truck-card">
      <h3>{truck.truck_id}</h3>
      <p><strong>Latitude:</strong> {truck.latitude?.toFixed(5)}</p>
      <p><strong>Longitude:</strong> {truck.longitude?.toFixed(5)}</p>
      <p><strong>Speed:</strong> {truck.speed}</p>
      
    </div>
  );
}