import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import RatingWidget from './RatingWidget';
import ReviewForm from './ReviewForm';
import ReviewsList from './ReviewsList';

function POIDetailsModal({ poi, onClose, onAddToItinerary }) {
  return (
    <AnimatePresence>
      {poi && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="close-button" aria-label="Close modal">
              <IoClose />
            </button>
            <h2>{poi.name}</h2>
            <p className="modal-description">{poi.description}</p>
            
            <div className="modal-section">
              <h4>Rate this Place</h4>
              <RatingWidget poiId={poi.id} onRate={(id, rating) => console.log(id, rating)} />
            </div>

            <div className="modal-section">
              <h4>Leave a Review</h4>
              <ReviewForm poiId={poi.id} onSubmit={(text) => console.log(text)} />
            </div>
            
            <div className="modal-section">
               <h4>Reviews</h4>
               <ReviewsList reviews={poi.reviews || []} />
            </div>

            <button onClick={() => onAddToItinerary(poi)} className="modal-cta-button">
              Add to Trip
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default POIDetailsModal;