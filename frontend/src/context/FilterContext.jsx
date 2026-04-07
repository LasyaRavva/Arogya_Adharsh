import { createContext, useContext, useState, useCallback } from 'react';

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 1500]);
  const [appliedRatings, setAppliedRatings] = useState([]);
  const [onApplyCallback, setOnApplyCallback] = useState(null);

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    let newRange;
    if (e.target.name === 'min') {
      newRange = [value, priceRange[1]];
    } else {
      newRange = [priceRange[0], value];
    }
    setPriceRange(newRange);
    // Instantly apply price filter
    setAppliedPriceRange(newRange);
    if (onApplyCallback) {
      onApplyCallback();
    }
  };

  const handleRatingToggle = (rating) => {
    let newRatings;
    if (selectedRatings.includes(rating)) {
      newRatings = selectedRatings.filter(r => r !== rating);
    } else {
      newRatings = [...selectedRatings, rating];
    }
    setSelectedRatings(newRatings);
    // Instantly apply rating filter
    setAppliedRatings(newRatings);
    if (onApplyCallback) {
      onApplyCallback();
    }
  };

  const applyFilters = useCallback(() => {
    setAppliedPriceRange(priceRange);
    setAppliedRatings(selectedRatings);
    if (onApplyCallback) {
      onApplyCallback();
    }
  }, [priceRange, selectedRatings, onApplyCallback]);

  const resetFilters = () => {
    setPriceRange([0, 1500]);
    setSelectedRatings([]);
    setAppliedPriceRange([0, 1500]);
    setAppliedRatings([]);
  };

  const clearPriceFilter = () => {
    setPriceRange([0, 1500]);
    setAppliedPriceRange([0, 1500]);
  };

  const clearRatingFilter = (rating) => {
    setSelectedRatings(selectedRatings.filter(r => r !== rating));
    setAppliedRatings(appliedRatings.filter(r => r !== rating));
  };

  const value = {
    priceRange,
    setPriceRange,
    handlePriceChange,
    selectedRatings,
    setSelectedRatings,
    handleRatingToggle,
    appliedPriceRange,
    appliedRatings,
    applyFilters,
    resetFilters,
    clearPriceFilter,
    clearRatingFilter,
    setOnApplyCallback
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within FilterProvider');
  }
  return context;
}