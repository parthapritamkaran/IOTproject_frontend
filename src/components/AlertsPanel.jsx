export default function AlertsPanel({ trucks }) {
  const deviationAlerts = trucks.filter((t) => t.route_deviation === true);
  const idleAlerts = trucks.filter((t) => t.idle === true);
  const fuelAlerts = trucks.filter((t) => t.fuel_alert === true);

  return (
    <div className="panel">
      <h3>Live Alerts</h3>

      <div className="alert-group">
        <h4>Deviation Alerts</h4>
        {deviationAlerts.length === 0 ? (
          <p>None</p>
        ) : (
          deviationAlerts.map((t) => (
            <p key={`dev-${t.truck_id}`}>{t.truck_id}</p>
          ))
        )}
      </div>

      <div className="alert-group">
        <h4>Idle Alerts</h4>
        {idleAlerts.length === 0 ? (
          <p>None</p>
        ) : (
          idleAlerts.map((t) => (
            <p key={`idle-${t.truck_id}`}>{t.truck_id}</p>
          ))
        )}
      </div>

      <div className="alert-group">
        <h4>Fuel Alerts</h4>
        {fuelAlerts.length === 0 ? (
          <p>None</p>
        ) : (
          fuelAlerts.map((t) => (
            <p key={`fuel-${t.truck_id}`}>{t.truck_id}</p>
          ))
        )}
      </div>
    </div>
  );
}