export default function FilterPanel({
  selectedTruck,
  setSelectedTruck,
  truckIds,
  filters,
  setFilters,
  showHeatmap,
  setShowHeatmap,
}) {
  return (
    <div className="panel">
      <h3>Filters</h3>

      <label>Truck</label>
      <select
        value={selectedTruck}
        onChange={(e) => setSelectedTruck(e.target.value)}
      >
        <option value="ALL">ALL</option>
        {truckIds.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>

      <label>
        <input
          type="checkbox"
          checked={filters.showDeviation}
          onChange={() =>
            setFilters((prev) => ({
              ...prev,
              showDeviation: !prev.showDeviation,
            }))
          }
        />
        Show Deviation
      </label>

      <label>
        <input
          type="checkbox"
          checked={filters.showIdle}
          onChange={() =>
            setFilters((prev) => ({
              ...prev,
              showIdle: !prev.showIdle,
            }))
          }
        />
        Show Idle
      </label>

      <label>
        <input
          type="checkbox"
          checked={filters.showFuel}
          onChange={() =>
            setFilters((prev) => ({
              ...prev,
              showFuel: !prev.showFuel,
            }))
          }
        />
        Show High Consumption
      </label>

      

      <label>
        <input
          type="checkbox"
          checked={showHeatmap}
          onChange={() => setShowHeatmap((prev) => !prev)}
        />
        Show Heatmap
      </label>
    </div>
  );
}