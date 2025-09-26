import React, { useState } from 'react';

function ReviewForm({ onSubmit }) {
  const [reviewText, setReviewText] = useState('');
  const isValid = reviewText.trim().length >= 5;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(reviewText);
      setReviewText('');
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Share your experience..."
        rows="3"
      />
      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  );
}

export default ReviewForm;