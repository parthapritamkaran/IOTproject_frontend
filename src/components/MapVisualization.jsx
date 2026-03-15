import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const INITIAL_CENTER = [88.3639, 22.5726];

const HAUL_ROAD_COORDS = [
  [88.3639, 22.5726],
  [88.3645, 22.5730],
  [88.3650, 22.5735],
  [88.3660, 22.5740],
  [88.3670, 22.5745],
  [88.3678, 22.5749],
  [88.3685, 22.5753],
  [88.3691, 22.5758],
  [88.3696, 22.5764],
  [88.3700, 22.5770],
 
];

function buildHaulRoad() {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Haul Road" },
        geometry: {
          type: "LineString",
          coordinates: HAUL_ROAD_COORDS,
        },
      },
    ],
  };
}

function truckToFeature(truck) {
  return {
    type: "Feature",
    properties: {
      truck_id: truck.truck_id,
      speed: truck.speed ?? 0,
      timestamp: truck.timestamp ?? Date.now(),
      route_deviation: !!truck.route_deviation,
      idle: !!truck.idle,
      fuel_alert: !!truck.fuel_alert,
    },
    geometry: {
      type: "Point",
      coordinates: [truck.longitude, truck.latitude],
    },
  };
}

function buildTruckPoints(trucksMap) {
  return {
    type: "FeatureCollection",
    features: Object.values(trucksMap).map(truckToFeature),
  };
}

function buildPathLines(pathsMap) {
  return {
    type: "FeatureCollection",
    features: Object.entries(pathsMap)
      .filter(([, coords]) => coords.length > 1)
      .map(([truckId, coords]) => ({
        type: "Feature",
        properties: { truck_id: truckId },
        geometry: {
          type: "LineString",
          coordinates: coords,
        },
      })),
  };
}

function buildDeviationPoints(deviationHistory) {
  return {
    type: "FeatureCollection",
    features: deviationHistory.map(truckToFeature),
  };
}

function buildIdlePoints(idleHistory) {
  return {
    type: "FeatureCollection",
    features: idleHistory.map(truckToFeature),
  };
}

function buildFuelPoints(fuelHistory) {
  return {
    type: "FeatureCollection",
    features: fuelHistory
      .filter((truck) => !!truck.fuel_alert)
      .map(truckToFeature),
  };
}

function buildHeatmapPoints(pathsMap) {
  const features = [];

  Object.entries(pathsMap).forEach(([truckId, coords]) => {
    coords.forEach((coord, index) => {
      features.push({
        type: "Feature",
        properties: {
          truck_id: truckId,
          weight: index + 1,
        },
        geometry: {
          type: "Point",
          coordinates: coord,
        },
      });
    });
  });

  return {
    type: "FeatureCollection",
    features,
  };
}

export default function MapVisualization({ trucksMap, pathsMap, showHeatmap, deviationHistory, idleHistory, fuelHistory, isReplayMode }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: INITIAL_CENTER,
      zoom: 15,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("truck-points", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addSource("truck-paths", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addSource("deviation-points", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addSource("idle-points", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addSource("fuel-points", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addSource("heatmap-points", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addSource("haul-road", {
        type: "geojson",
        data: buildHaulRoad(),
      });

      map.addLayer({
        id: "truck-paths-layer",
        type: "line",
        source: "truck-paths",
        paint: {
          "line-color": [
            "match",
            ["get", "truck_id"],
            "TRUCK_1", "#3b82f6",
            "TRUCK_2", "#10b981",
            "#94a3b8"
          ],
          "line-width": 4,
          "line-opacity": 0.9,
        },
      });

      map.addLayer({
        id: "heatmap-layer",
        type: "heatmap",
        source: "heatmap-points",
        layout: {
          visibility: "none",
        },
        paint: {
          "heatmap-weight": ["get", "weight"],
          "heatmap-intensity": 1,
          "heatmap-radius": 22,
          "heatmap-opacity": 0.7,
        },
      });

      map.addLayer({
        id: "haul-road-layer",
        type: "line",
        source: "haul-road",
        paint: {
          "line-color": "#000000",
          "line-width": 5,
          "line-opacity": 0.7,
        },
      });

      map.addLayer({
        id: "deviation-layer",
        type: "circle",
        source: "deviation-points",
        paint: {
          "circle-radius": 18,
          "circle-color": "#ef4444",
          "circle-opacity": 0.25,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ef4444",
        },
      });

      map.addLayer({
        id: "idle-layer",
        type: "circle",
        source: "idle-points",
        paint: {
          "circle-radius": 18,
          "circle-color": "#facc15",
          "circle-opacity": 0.25,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#facc15",
        },
      });

      map.addLayer({
        id: "fuel-layer",
        type: "circle",
        source: "fuel-points",
        paint: {
          "circle-radius": 18,
          "circle-color": "#f97316",
          "circle-opacity": 0.25,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#f97316",
        },
      });

      map.addLayer({
        id: "truck-points-layer",
        type: "circle",
        source: "truck-points",
        layout: {
          visibility: "none",
        },
        paint: {
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-color": [
            "match",
            ["get", "truck_id"],
            "TRUCK_1", "#3b82f6",
            "TRUCK_2", "#10b981",
            "#ffffff"
          ],
        },
      });

      map.on("click", "truck-points-layer", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;

        const coords = feature.geometry.coordinates.slice();
        const props = feature.properties;

        new mapboxgl.Popup()
          .setLngLat(coords)
          .setHTML(`
            <div style="color:black">
              <strong>${props.truck_id}</strong><br/>
              Speed: ${props.speed}<br/>
              Deviation: ${props.route_deviation}<br/>
              Idle: ${props.idle}<br/>
              Fuel Alert: ${props.fuel_alert}
            </div>
          `)
          .addTo(map);
      });

      mapRef.current = map;
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    map.getSource("truck-points")?.setData(buildTruckPoints(trucksMap));
    map.getSource("truck-paths")?.setData(buildPathLines(pathsMap));
    map.getSource("deviation-points")?.setData(buildDeviationPoints(deviationHistory));
    map.getSource("idle-points")?.setData(buildIdlePoints(idleHistory));
    map.getSource("fuel-points")?.setData(buildFuelPoints(fuelHistory));
    map.getSource("heatmap-points")?.setData(buildHeatmapPoints(pathsMap));

    map.setLayoutProperty(
      "heatmap-layer",
      "visibility",
      showHeatmap ? "visible" : "none"
    );

    
  }, [trucksMap, pathsMap, showHeatmap, deviationHistory, idleHistory, fuelHistory, isReplayMode,]);

  return <div ref={mapContainerRef} className="map-container" />;
}