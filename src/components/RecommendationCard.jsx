import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegImage } from 'react-icons/fa';

function RecommendationCard({ pois, onSelect, onAddToItinerary }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (pois.length > 1) {
      const timer = setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % pois.length);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [index, pois]);

  if (pois.length === 0) {
    return null;
  }

  const activePoi = pois[index];

  const handleAddToItineraryClick = (e) => {
    e.stopPropagation();
    onAddToItinerary(activePoi);
  };
  
  const handleDetailsClick = (e) => {
    e.stopPropagation();
    onSelect(activePoi);
  };

  return (
    <div className="recommendation-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={activePoi.id}
          className="poi-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="poi-image-container">
            {activePoi.image ? (
              <img src={activePoi.image} alt={activePoi.name} className="poi-image" />
            ) : (
              <div className="poi-image-placeholder">
                <FaRegImage />
              </div>
            )}
          </div>
          <div className="poi-info">
            <h3>{activePoi.name}</h3>
            {activePoi.distance !== null && typeof activePoi.distance === 'number' && (
              <p className="poi-distance">{activePoi.distance.toFixed(1)} km away</p>
            )}
          </div>
          <div className="poi-actions">
            <button onClick={handleDetailsClick} className="poi-button">Details</button>
            <button onClick={handleAddToItineraryClick} className="poi-button">Add to Trip</button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default RecommendationCard;