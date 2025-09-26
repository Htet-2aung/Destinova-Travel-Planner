// src/components/CardNav.jsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoArrowUpRight } from 'react-icons/go';
import { Link } from 'react-router-dom';
import Search from './Search';

const CardNav = ({ onSearchResults }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { label: 'Explore', to: '/' },
    { label: 'Plan', to: '/plan' },
    { label: 'Connect', to: '/connect' },
  ];

  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20 },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <nav className="modern-nav">
        <div className="nav-content">
          <div className="nav-left">
            <img src="/logo.png" alt="Travel App Logo" className="nav-logo" />
            <div className="nav-links-desktop">
              {navLinks.map((link) => (
                <Link key={link.label} to={link.to} className="nav-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="nav-right">
            <Search onSearchResults={onSearchResults} />
            <button
              className="hamburger-menu-modern"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <motion.span className="hamburger-line" animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 5 : 0 }} />
              <motion.span className="hamburger-line" animate={{ opacity: isMenuOpen ? 0 : 1 }} />
              <motion.span className="hamburger-line" animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -5 : 0 }} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {navLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.to}
                className="mobile-menu-link"
                variants={linkVariants}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label} <GoArrowUpRight />
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CardNav;