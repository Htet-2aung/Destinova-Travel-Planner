import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaTrash, FaGripLines } from 'react-icons/fa';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

// --- Draggable Itinerary Item ---
function ItineraryItem({ item, index, moveItem, onRemove }) {
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: 'itinerary-item',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'itinerary-item',
    item: { id: item.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Attach drag and drop refs
  drag(drop(ref));

  return (
    <motion.div
      ref={preview(ref)} // Use preview for the component, drag for the handle
      className="itinerary-item"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="drag-handle" ref={drag}>
        <FaGripLines />
      </div>
      <FaMapMarkerAlt className="item-icon" />
      <span className="item-name">{item.name}</span>
      <button onClick={() => onRemove(item.id)} className="remove-button" aria-label={`Remove ${item.name}`}>
        <FaTrash />
      </button>
    </motion.div>
  );
}

// --- Main Itinerary Timeline Panel ---
function ItineraryTimeline({ itinerary, onRemove, moveItem }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`itinerary-panel ${isOpen ? 'open' : ''}`}>
      <button className="itinerary-toggle" onClick={() => setIsOpen(!isOpen)}>
        <h3>Your Itinerary</h3>
        {isOpen ? <FiChevronDown /> : <FiChevronUp />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="itinerary-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {itinerary.length === 0 ? (
              <p className="empty-message">Your itinerary is empty.</p>
            ) : (
              <div className="itinerary-list">
                <AnimatePresence>
                  {itinerary.map((item, index) => (
                    <ItineraryItem
                      key={item.id}
                      item={item}
                      index={index}
                      moveItem={moveItem}
                      onRemove={onRemove}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ItineraryTimeline;