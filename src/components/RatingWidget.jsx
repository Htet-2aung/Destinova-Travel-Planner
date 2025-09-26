import React, { useState } from 'react';
import { motion } from 'framer-motion';

function RatingWidget({ poiId, onRate }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const handleSubmit = () => {
    if (rating > 0) {
      onRate(poiId, rating);
      setRating(0);
    }
  };

  return (
    <div className="rating-widget">
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <motion.button
            key={star}
            style={{ color: star <= (hover || rating) ? '#facc15' : '#d1d5db' }}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            ★
          </motion.button>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={rating === 0}>Submit Rating</button>
    </div>
  );
}

export default RatingWidget;