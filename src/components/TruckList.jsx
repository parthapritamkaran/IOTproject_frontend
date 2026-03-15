import TruckCard from "./TruckCard";

export default function TruckList({ trucks }) {
  return (
    <div className="panel">
      <h3>Truck Status</h3>
      {trucks.length === 0 ? (
        <p>No trucks visible</p>
      ) : (
        trucks.map((truck) => <TruckCard key={truck.truck_id} truck={truck} />)
      )}
    </div>
  );
}