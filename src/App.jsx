import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- ✅ CORRECTED IMPORTS ---
import RecommendationCard from './components/RecommendationCard';
import POICard from './components/POICard'; // Import the actual POICard

// --- Other Components & Pages ---
import CardNav from './components/CardNav';
import MapComponent from './components/MapComponent';
import POIDetailsModal from './components/POIDetailsModal';
import ItineraryTimeline from './components/ItineraryTimeline';
import UserIcon from "./components/UserIcon";
import Plan from './components/Plan';
import Connect from './components/Connect';
import Profile from './components/Profile';
import Settings from './components/Settings';

// --- Helper functions ---
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const poiCache = new Map();
let customPoiDatabase = [];

// --- Main App Component ---
function App() {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <div className="app-container">
          <UserIcon /> 
          <Routes>
            <Route path="/" element={<MainMapPage theme={theme} />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/settings"
              element={<Settings theme={theme} toggleTheme={toggleTheme} />}
            />
          </Routes>
        </div>
      </Router>
    </DndProvider>
  );
}

// --- MainMapPage Component ---
const MainMapPage = ({ theme }) => {
    const [pois, setPOIs] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [status, setStatus] = useState('Requesting location access...');
    const [isFetching, setIsFetching] = useState(false);
    const [selectedPOI, setSelectedPOI] = useState(null);
    const [itinerary, setItinerary] = useState([]);
    const mapRef = useRef(null);
    
    // ✅ NEW STATE: To switch between recommendations and search results
    const [displayMode, setDisplayMode] = useState('recommend'); // 'recommend' or 'search'

    // --- Fetch initial recommendations from your custom file ---
    const fetchRecommendedPOIs = useCallback((center) => {
        setIsFetching(true);
        setStatus('Finding recommendations...');
        const nearbyPlaces = customPoiDatabase
            .map(poi => ({
                ...poi,
                distance: haversine(center.lat, center.lng, poi.location.lat, poi.location.lng)
            }))
            .filter(poi => poi.distance <= 100)
            .sort((a, b) => a.distance - b.distance);

        setPOIs(nearbyPlaces.map(p => ({...p, image: p.photo_url, lat: p.location.lat, lng: p.location.lng })));
        setDisplayMode('recommend'); // Set the mode to show the recommendation card
        setStatus(nearbyPlaces.length > 0 ? '' : 'No local recommendations found.');
        setIsFetching(false);
    }, []);
    
    // --- Fetch search results from Overpass API ---
    const fetchSearchedPOIs = useCallback(async (query) => {
        if (!userLocation) return;
        setIsFetching(true);
        setStatus(`Searching for "${query}"...`);
        // ... (rest of the search logic is the same)
        const overpassUrl = "https://overpass-api.de/api/interpreter";
        const overpassQuery = `[out:json];(node["name"~"${query}",i](around:20000,${userLocation.lat},${userLocation.lng});way["name"~"${query}",i](around:20000,${userLocation.lat},${userLocation.lng}););out body;>;out skel qt;`;
        try {
            const res = await fetch(`${overpassUrl}?data=${encodeURIComponent(overpassQuery)}`);
            if (!res.ok) throw new Error("Overpass API error");
            const data = await res.json();
            const validPOIs = data.elements.filter(el => el.tags?.name).map(p => ({
                id: p.id,
                name: p.tags.name,
                lat: p.lat || p.center?.lat,
                lng: p.lon || p.center?.lon,
                description: 'A local point of interest.',
                image: '/placeholder.jpg',
                distance: haversine(userLocation.lat, userLocation.lng, p.lat || p.center?.lat, p.lon || p.center?.lon)
            })).sort((a, b) => a.distance - b.distance);
            
            setPOIs(validPOIs);
            setDisplayMode('search'); // Set the mode to show the search results sidebar
            setStatus(validPOIs.length > 0 ? '' : `No results for "${query}".`);
        } catch (err) {
            setStatus('Could not complete search.');
        } finally {
            setIsFetching(false);
        }
    }, [userLocation]);

    // --- Load initial data ---
    useEffect(() => {
        const loadApp = async () => {
            try {
                const response = await fetch('/custom_poi_data.json');
                customPoiDatabase = await response.json();
                console.log("Custom POI database loaded.");
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const detected = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        setUserLocation(detected);
                        fetchRecommendedPOIs(detected);
                    },
                    () => {
                        setStatus('Location denied.');
                        const fallback = { lat: 10.7769, lng: 106.7009 };
                        setUserLocation(fallback);
                        fetchRecommendedPOIs(fallback);
                    }
                );
            } catch (error) {
                setStatus('Could not load recommendations.');
            }
        };
        loadApp();
    }, [fetchRecommendedPOIs]);
 
    // --- ✅ HANDLERS ---
    const handleSelectPOI = (poi) => setSelectedPOI(poi);
    const handleCloseModal = () => setSelectedPOI(null);
    const handleAddToItinerary = (poiToAdd) => {
        if (!userLocation) return;
        const newRoute = [{ lat: userLocation.lat, lng: userLocation.lng, name: 'Your Location' }, { ...poiToAdd }];
        setItinerary(newRoute);
    };
    const handleRemoveFromItinerary = () => setItinerary([]);
    const moveItineraryItem = () => {};

  return (
    <>
      <CardNav onSearchResults={fetchSearchedPOIs} /> 
      <MapComponent
        pois={pois}
        userLocation={userLocation}
        itinerary={itinerary}
        onSelectPOI={handleSelectPOI} // This passes the click handler to the map markers
        mapRef={mapRef}
        onViewChange={() => {}}
        isFetching={isFetching}
        theme={theme}
      />
      
      {/* --- ✅ CONDITIONAL UI RENDERING --- */}
      {displayMode === 'recommend' ? (
        <RecommendationCard 
          pois={pois} 
          onSelect={handleSelectPOI} // Pass the handler to the recommendation card
          onAddToItinerary={handleAddToItinerary} 
        />
      ) : (
        <div className="poi-sidebar">
          {isFetching && pois.length === 0 ? ( <p className="empty-message">{status}</p> ) :
           pois.length > 0 ? ( pois.map((poi) => (
              <POICard 
                key={poi.id} 
                poi={poi} 
                onSelect={() => handleSelectPOI(poi)} // Pass the handler to each search result card
                onAddToItinerary={handleAddToItinerary}
              />
           ))) : ( <p className="empty-message">{status}</p> )}
        </div>
      )}
      
      <ItineraryTimeline itinerary={itinerary} onRemove={handleRemoveFromItinerary} moveItem={moveItineraryItem} />
      
      {/* This modal will appear whenever 'selectedPOI' is not null */}
      <POIDetailsModal 
        poi={selectedPOI} 
        onClose={handleCloseModal} 
        onAddToItinerary={handleAddToItinerary} 
      />
    </>
  );
};

export default App;