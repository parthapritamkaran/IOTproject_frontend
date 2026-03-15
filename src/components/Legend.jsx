export default function Legend() {
  return (
    <div className="panel">
      <h3>Legend</h3>
      <p><span className="legend-line truck1-line"></span> TRUCK_1</p>
      <p><span className="legend-line truck2-line"></span> TRUCK_2</p>
      <p><span className="legend-dot red"></span> Route Deviation</p>
      <p><span className="legend-dot yellow"></span> Idle</p>
      <p><span className="legend-dot orange"></span> High Consumption</p>
      <p><span className="legend-line haul-road"></span> Haul Road</p>
    </div>
  );
}