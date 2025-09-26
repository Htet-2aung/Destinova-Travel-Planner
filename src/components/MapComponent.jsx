import React, { useEffect, useRef, useState, useCallback } from 'react';

// --- Helper functions to load external libraries ---
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load error for ${src}`));
    document.body.appendChild(script);
  });
};

const loadCss = (href) => {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};


function MapComponent({ pois, userLocation, itinerary, onSelectPOI, mapRef, onViewChange, theme }) {
  const mapContainerRef = useRef(null);
  const markersLayerRef = useRef(null); // Will now be a cluster group
  const routingControlRef = useRef(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  // --- 1. Load all necessary libraries, including MarkerCluster ---
  useEffect(() => {
    loadCss('https://unpkg.com/leaflet@1.7.1/dist/leaflet.css');
    loadCss('https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css');
    loadCss('https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css');
    loadCss('https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css');
    
    loadScript('https://unpkg.com/leaflet@1.7.1/dist/leaflet.js')
      .then(() => loadScript('https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js'))
      .then(() => loadScript('https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js'))
      .then(() => setIsLeafletReady(true))
      .catch((error) => console.error('Failed to load Leaflet libraries:', error));
  }, []);

  // --- 2. Initialize the map with a modern theme and clustering ---
  useEffect(() => {
    if (isLeafletReady && mapContainerRef.current && !mapRef.current) {
      // ✅ MODERN THEME: Using a modern, clean map theme from Stadia
      const lightTileLayer = window.L.tileLayer(
        'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
          attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }
      );
      const darkTileLayer = window.L.tileLayer(
        'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
           maxZoom: 20,
           attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }
      );

      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        layers: [theme === 'dark' ? darkTileLayer : lightTileLayer]
      }).setView([10.7769, 106.7009], 14);

      map.tileLayers = { light: lightTileLayer, dark: darkTileLayer };
      window.L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapRef.current = map;

      // ✅ CLUSTERING: Initialize the marker cluster group
      markersLayerRef.current = window.L.markerClusterGroup().addTo(map);

      map.on('moveend', () => {
        const center = map.getCenter();
        onViewChange({ lat: center.lat, lng: center.lng });
      });
    }
  }, [isLeafletReady, mapRef, onViewChange, theme]);

  // Handle theme switching
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.tileLayers) return;
    if (theme === 'dark') {
      if (!map.hasLayer(map.tileLayers.dark)) map.addLayer(map.tileLayers.dark);
      if (map.hasLayer(map.tileLayers.light)) map.removeLayer(map.tileLayers.light);
    } else {
      if (!map.hasLayer(map.tileLayers.light)) map.addLayer(map.tileLayers.light);
      if (map.hasLayer(map.tileLayers.dark)) map.removeLayer(map.tileLayers.dark);
    }
  }, [theme, mapRef]);
  
  // ✅ "FLY TO" ANIMATION: Smoothly move the map to the user's location
  useEffect(() => {
    if (mapRef.current && userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 15, { // Zoom in closer
        animate: true,
        duration: 2.5
      });
    }
  }, [userLocation, mapRef]);

  // --- 3. Add clustered photo markers to the map ---
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;
    
    markersLayerRef.current.clearLayers();
    
    if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      const userMarkerIcon = window.L.divIcon({
        className: 'user-location-marker', html: `<div></div>`, iconSize: [24, 24], iconAnchor: [12, 12],
      });
      window.L.marker([userLocation.lat, userLocation.lng], { icon: userMarkerIcon, zIndexOffset: 1000 }).addTo(markersLayerRef.current);
    }

    pois.forEach((poi) => {
      if (typeof poi.lat === 'number' && typeof poi.lng === 'number') {
        const markerHtml = `<div class="poi-photo-marker" style="background-image: url('${poi.image || '/placeholder.jpg'}')"><span class="poi-marker-name">${poi.name}</span></div>`;
        const photoMarker = window.L.divIcon({
          className: '', html: markerHtml, iconSize: [50, 50], iconAnchor: [25, 25],
        });
        const marker = window.L.marker([poi.lat, poi.lng], { icon: photoMarker });
        marker.on('click', () => onSelectPOI(poi));
        markersLayerRef.current.addLayer(marker); // Add to the cluster group
      }
    });
  }, [pois, userLocation, mapRef, onSelectPOI]);

  // --- 4. Logic for displaying the itinerary route ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLeafletReady) return;
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    if (itinerary && itinerary.length >= 2) {
      const waypoints = itinerary.map((p) => window.L.latLng(p.lat, p.lng));
      const routeColor = theme === 'light' ? '#333333' : 'white';
      const routingControl = window.L.Routing.control({
        waypoints,
        routeWhileDragging: false,
        lineOptions: { styles: [{ color: routeColor, opacity: 0.8, weight: 6 }] },
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        createMarker: () => null,
      }).addTo(map);
      routingControlRef.current = routingControl;
    }
  }, [itinerary, isLeafletReady, mapRef, theme]);

  return (
    <div ref={mapContainerRef} className="map-view" style={{ height: '100%', width: '100%' }} />
  );
}

// --- ✅ NEW: Travel Time Calculation Function ---
// This function can now be passed as a prop to your POI cards
export const calculateTravelTime = (userLocation, poi) => {
  return new Promise((resolve) => {
    if (!window.L || !userLocation) return resolve(null);

    const router = window.L.Routing.osrmv1({
        serviceUrl: `https://router.project-osrm.org/route/v1`
    });
    
    router.route([
        window.L.latLng(userLocation.lat, userLocation.lng),
        window.L.latLng(poi.lat, poi.lng)
    ], (err, routes) => {
        if (!err && routes && routes[0]) {
            const summary = routes[0].summary;
            // OSRM provides time in seconds and distance in meters
            const timeInMinutes = Math.round(summary.totalTime / 60);
            const distanceInKm = (summary.totalDistance / 1000).toFixed(1);
            resolve({ time: timeInMinutes, distance: distanceInKm });
        } else {
            resolve(null);
        }
    });
  });
};

export default MapComponent;