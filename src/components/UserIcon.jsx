// src/components/UserIcon.jsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom"; // Import Link

const UserIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);

  // (menuVariants remain the same)
  const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };


  return (
    <div className="user-icon-wrapper">
      <button className="user-icon-btn" onClick={toggleDropdown} aria-label="User menu">
        <FaUserCircle className="user-avatar" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="user-dropdown"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setIsOpen(false)} // Close on click
          >
            {/* --- CHANGE: Use <Link> instead of <a> --- */}
            <Link to="/profile">Profile</Link>
            <Link to="/settings">Settings</Link>
            <a href="#">Logout</a> {/* Logout might not be a Link */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserIcon;