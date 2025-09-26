import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';

const Search = ({ onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // --- Debounce API calls ---
  useEffect(() => {
    if (searchTerm.length < 3) {
      setSuggestions([]);
      return;
    }

    const debounceTimeout = setTimeout(() => {
      fetchAutocomplete(searchTerm);
    }, 500); // Wait 500ms after user stops typing

    // Cleanup function to cancel the timeout if the user types again
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  // --- Fetch autocomplete suggestions from Nominatim API ---
  const fetchAutocomplete = async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Failed to fetch autocomplete suggestions:", error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Pass the display name of the suggestion to the search handler
    onSearchResults(suggestion.display_name.split(',')[0]); // Use the primary name
    setSearchTerm(suggestion.display_name.split(',')[0]);
    setSuggestions([]); // Clear suggestions
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm) {
      onSearchResults(searchTerm);
      setSuggestions([]);
    }
  };

  return (
    <form onSubmit={handleSearch} className="search-form">
      <div className="search-container-modern">
        <FiSearch className="search-icon-modern" />
        <input
          type="text"
          placeholder="Search for a city or place..."
          className="search-input-modern"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <div className="autocomplete-suggestions">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.display_name}
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
};

export default Search;