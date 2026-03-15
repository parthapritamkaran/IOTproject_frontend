import { useEffect, useMemo, useState } from "react";
import { fetchLatestTrucks } from "../api";
import { socket } from "../socket";
import MapVisualization from "./MapVisualization";
import TruckList from "./TruckList";
import AlertsPanel from "./AlertsPanel";
import FilterPanel from "./FilterPanel";
import Legend from "./Legend";

export default function Dashboard() {
  const [trucksMap, setTrucksMap] = useState({});
  const [pathsMap, setPathsMap] = useState({});
  const [selectedTruck, setSelectedTruck] = useState("ALL");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [deviationHistory, setDeviationHistory] = useState([]);
  const [idleHistory, setIdleHistory] = useState([]);
  const [fuelHistory, setFuelHistory] = useState([]);

  const [isReplayMode, setIsReplayMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [replayTrucksMap, setReplayTrucksMap] = useState({});

  const [filters, setFilters] = useState({
    showDeviation: true,
    showIdle: true,
    showFuel: true,
    showNormal: true,
  });

  useEffect(() => {
    async function loadInitialData() {
      try {
        const trucks = await fetchLatestTrucks();

        const nextTruckMap = {};
        const nextPathsMap = {};

        trucks.forEach((truck) => {
          nextTruckMap[truck.truck_id] = truck;
          nextPathsMap[truck.truck_id] = [[truck.longitude, truck.latitude]];
        });

        setTrucksMap(nextTruckMap);
        setPathsMap(nextPathsMap);
      } catch (error) {
        console.error("Initial load failed:", error);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    function handleTruckUpdate(truck) {
      setTrucksMap((prev) => ({
        ...prev,
        [truck.truck_id]: truck,
      }));

      setPathsMap((prev) => {
        const oldPath = prev[truck.truck_id] || [];
        return {
          ...prev,
          [truck.truck_id]: [...oldPath, [truck.longitude, truck.latitude]],
        };
      });

      if (truck.route_deviation === true) {
        setDeviationHistory((prev) => [...prev, truck]);
      }

      if (truck.idle === true) {
        setIdleHistory((prev) => [...prev, truck]);
      }

      if (truck.fuel_alert === true) {
        setFuelHistory((prev) => [...prev, truck]);
      }
    }

    socket.on("truck_update", handleTruckUpdate);

    return () => {
      socket.off("truck_update", handleTruckUpdate);
    };
  }, []);

  const visibleTrucks = useMemo(() => {
    const trucks = Object.values(trucksMap);

    return trucks.filter((truck) => {
      if (selectedTruck !== "ALL" && truck.truck_id !== selectedTruck) return false;

      const isDeviation = truck.route_deviation === true;
      const isIdle = truck.idle === true;
      const isFuel = truck.fuel_alert === true;
      const isNormal = !isDeviation && !isIdle && !isFuel;

      if (isDeviation && !filters.showDeviation) return false;
      if (isIdle && !filters.showIdle) return false;
      if (isFuel && !filters.showFuel) return false;
      if (isNormal && !filters.showNormal) return false;

      return true;
    });
  }, [trucksMap, selectedTruck, filters]);


  const truckListData = useMemo(() => {
  const trucks = Object.values(trucksMap);

  return trucks.filter((truck) => {
    if (selectedTruck !== "ALL" && truck.truck_id !== selectedTruck) return false;
    return true;
  });
}, [trucksMap, selectedTruck]);

  const visibleTruckMap = useMemo(() => {
    const obj = {};
    visibleTrucks.forEach((truck) => {
      obj[truck.truck_id] = truck;
    });
    return obj;
  }, [visibleTrucks]);

  const visiblePathsMap = useMemo(() => {
    if (selectedTruck === "ALL") return pathsMap;

    return selectedTruck in pathsMap
      ? { [selectedTruck]: pathsMap[selectedTruck] }
      : {};
  }, [selectedTruck, pathsMap]);

  useEffect(() => {
    if (!isReplayMode) return;

    const nextReplayMap = {};

    Object.entries(visiblePathsMap).forEach(([truckId, coords]) => {
      if (!coords.length) return;

      const safeIndex = Math.min(replayIndex, coords.length - 1);
      const [longitude, latitude] = coords[safeIndex];

      const originalTruck = trucksMap[truckId];
      if (!originalTruck) return;

      nextReplayMap[truckId] = {
        ...originalTruck,
        longitude,
        latitude,
      };
    });

    setReplayTrucksMap(nextReplayMap);
  }, [isReplayMode, replayIndex, visiblePathsMap, trucksMap]);

  useEffect(() => {
    if (!isReplayMode || !isPlaying) return;

    const maxLength = Math.max(
      ...Object.values(visiblePathsMap).map((coords) => coords.length),
      0
    );

    if (replayIndex >= maxLength - 1) {
      setIsPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      setReplayIndex((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isReplayMode, isPlaying, replayIndex, visiblePathsMap]);

  const visibleDeviationHistory = useMemo(() => {
    if (!filters.showDeviation) return [];

    return deviationHistory.filter((truck) => {
      if (selectedTruck === "ALL") return true;
      return truck.truck_id === selectedTruck;
    });
  }, [deviationHistory, selectedTruck, filters]);

  const visibleIdleHistory = useMemo(() => {
    if (!filters.showIdle) return [];

    return idleHistory.filter((truck) => {
      if (selectedTruck === "ALL") return true;
      return truck.truck_id === selectedTruck;
    });
  }, [idleHistory, selectedTruck, filters]);

  const visibleFuelHistory = useMemo(() => {
    if (!filters.showFuel) return [];

    return fuelHistory.filter((truck) => {
      if (selectedTruck === "ALL") return true;
      return truck.truck_id === selectedTruck;
    });
  }, [fuelHistory, selectedTruck, filters]);

  const mapTruckData = isReplayMode ? replayTrucksMap : visibleTruckMap;

  const mapPathsData = useMemo(() => {
  if (!isReplayMode) return visiblePathsMap;

  const trimmedPaths = {};

  Object.entries(visiblePathsMap).forEach(([truckId, coords]) => {
    trimmedPaths[truckId] = coords.slice(0, replayIndex + 1);
  });

  return trimmedPaths;
}, [isReplayMode, visiblePathsMap, replayIndex]);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Mining Fleet Dashboard</h2>

        <FilterPanel
          selectedTruck={selectedTruck}
          setSelectedTruck={setSelectedTruck}
          truckIds={Object.keys(trucksMap)}
          filters={filters}
          setFilters={setFilters}
          showHeatmap={showHeatmap}
          setShowHeatmap={setShowHeatmap}
        />

        <TruckList trucks={truckListData} />

        <div className="panel">
          <h3>Replay</h3>

          <button
            onClick={() => {
              setIsReplayMode(true);
              setIsPlaying(true);
              setReplayIndex(0);
            }}
          >
            Start Replay
          </button>

          <button onClick={() => setIsPlaying(true)} disabled={!isReplayMode}>
            Play
          </button>

          <button onClick={() => setIsPlaying(false)} disabled={!isReplayMode}>
            Pause
          </button>

          

          <button
            onClick={() => {
              setIsReplayMode(false);
              setIsPlaying(false);
              setReplayIndex(0);
            }}
          >
            Exit Replay
          </button>

          <p>Step: {replayIndex}</p>
        </div>

        <AlertsPanel trucks={visibleTrucks} />
        <Legend />
      </aside>

      <main className="map-area">
        <MapVisualization
          trucksMap={mapTruckData}
          pathsMap={mapPathsData}
          showHeatmap={showHeatmap}
          deviationHistory={visibleDeviationHistory}
          idleHistory={visibleIdleHistory}
          fuelHistory={visibleFuelHistory}
          isReplayMode={isReplayMode}
        />
      </main>
    </div>
  );
}