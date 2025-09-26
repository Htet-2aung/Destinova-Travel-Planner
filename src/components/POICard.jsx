import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaRegImage } from 'react-icons/fa';
import { calculateTravelTime } from './MapComponent'; // Import the new function

// Add userLocation as a prop
function POICard({ poi, onSelect, onAddToItinerary, userLocation }) { 
  const [travelInfo, setTravelInfo] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleGetTimeClick = async (e) => {
    e.stopPropagation();
    setIsCalculating(true);
    const time = await calculateTravelTime(userLocation, poi);
    setTravelInfo(time);
    setIsCalculating(false);
  };

  return (
    <motion.div
      className="poi-card"
      onClick={onSelect}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className="poi-image-container">
        {poi.image ? (
          <img src={poi.image} alt={poi.name} className="poi-image" />
        ) : (
          <div className="poi-image-placeholder"><FaRegImage /></div>
        )}
      </div>

      <div className="poi-info">
        <h3>{poi.name}</h3>
        {/* --- ✅ NEW: Display travel time when available --- */}
        {travelInfo ? (
          <p className="poi-distance">
            🚗 Approx. {travelInfo.time} min ({travelInfo.distance} km)
          </p>
        ) : (
          (poi.distance !== null && typeof poi.distance === 'number') && (
            <p className="poi-distance">{poi.distance.toFixed(1)} km away</p>
          )
        )}
      </div>
      <div className="poi-actions">
        {/* --- ✅ NEW: Button to calculate time --- */}
        <button onClick={handleGetTimeClick} className="poi-button" disabled={isCalculating}>
          {isCalculating ? '...' : 'Get Time'}
        </button>
        <button onClick={() => onAddToItinerary(poi)} className="poi-button">Add to Trip</button>
      </div>
    </motion.div>
  );
}

export default POICard;