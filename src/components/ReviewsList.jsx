import React from 'react';
import { motion } from 'framer-motion';

function ReviewsList({ reviews }) {
  return (
    <div className="reviews-list">
      {reviews.length === 0 ? (
        <p className="empty-message">No reviews yet.</p>
      ) : (
        reviews.map((review, index) => (
          <motion.div
            key={index}
            className="review-item"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <p>"{review}"</p>
          </motion.div>
        ))
      )}
    </div>
  );
}

export default ReviewsList;