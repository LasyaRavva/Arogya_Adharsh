import { useState, useEffect, useMemo } from 'react';
import { useFilter } from '../context/FilterContext';
import { useCategory } from '../context/CategoryContext';
import { API_BASE_URL } from '../config';

// Accept availableRatings as a prop, fallback to [5,4,3,2,1] if not provided
export default function Sidebar({ onApplyFilters, availableRatings = [5,4,3,2,1], saleProducts = [] }) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isRatingOpen, setIsRatingOpen] = useState(true);
  const [isTagOpen, setIsTagOpen] = useState(true);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [selectedTags, setSelectedTags] = useState(['Low fat']);
  const { selectedCategory, setSelectedCategory } = useCategory();
  const { priceRange, handlePriceChange, selectedRatings, handleRatingToggle, applyFilters, setOnApplyCallback } = useFilter();


  useEffect(() => {
  if (onApplyFilters) {
    setOnApplyCallback(() => onApplyFilters);
  }
}, []); // run only once



  // Fetch categories from API
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    // Replace the URL below with your actual API endpoint
    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  const parentCategories = useMemo(
    () => categories.filter((category) => !category.parent_id),
    [categories]
  );

  const subcategoriesByParent = useMemo(() => {
    const map = {};
    categories.forEach((category) => {
      if (!category.parent_id) return;
      if (!map[category.parent_id]) {
        map[category.parent_id] = [];
      }
      map[category.parent_id].push(category);
    });
    return map;
  }, [categories]);

  const handleParentCategoryClick = (category) => {
    const subcategories = subcategoriesByParent[category.cat_id] || [];

    if (subcategories.length > 0) {
      setExpandedCategoryId((current) =>
        current === category.cat_id ? null : category.cat_id
      );
      setSelectedCategory(null);
      if (onApplyFilters) {
        onApplyFilters({ category: null });
      }
      return;
    }

    setExpandedCategoryId(null);
    setSelectedCategory(category);
    if (onApplyFilters) {
      onApplyFilters({ category });
    }
  };

  const handleSubcategoryClick = (subcategory, parentId) => {
    setExpandedCategoryId(parentId);
    setSelectedCategory(subcategory);
    if (onApplyFilters) {
      onApplyFilters({ category: subcategory });
    }
  };

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };


  // Generate ratings dynamically from availableRatings
  const ratings = availableRatings.map(r => ({
    value: r.toString(),
    label: `${r}.0 & up`
  }));

  const tags = ['Healthy', 'Low fat', 'Vegetarian', 'Kid foods', 'Vitamins', 'Bread'];

  const resolveMediaSrc = (value) => {
    if (!value) return '';
    if (value.startsWith('data:') || value.startsWith('blob:')) return value;
    if (/^https?:\/\//i.test(value)) return value;
    return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
  };

  const saleProductsToShow = saleProducts;

  return (
    <div className="w-full lg:w-60 bg-white rounded-lg py-0 px-2">
      {/* Apply Filters Button */}
      <button 
        onClick={() => applyFilters()}
        className="w-full bg-[#007048] hover:bg-[#005a3a] text-white font-semibold py-2.5 px-4 rounded-full flex items-center justify-center gap-3 transition mb-4 font-poppins"
      >
        <span className="text-base">Apply Filters</span>
      </button>

      {/* All Categories Section */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button 
          onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
          className="w-full flex items-center justify-between mb-6"
        >
          <h3 className="text-1xl font-semibold text-gray-900 font-poppins">All Categories</h3>
          <svg 
            className={`w-4 h-4 text-gray-900 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isCategoriesOpen && (
          <div className="space-y-2.5">
            {parentCategories.length === 0 ? (
              <div className="text-gray-500 text-sm">Loading categories...</div>
            ) : (
              parentCategories.map((category) => {
                const subcategories = subcategoriesByParent[category.cat_id] || [];
                const isExpanded = expandedCategoryId === category.cat_id;
                const isParentSelected = selectedCategory?.cat_id === category.cat_id;
                const selectedSubcategoryBelongsHere =
                  selectedCategory?.parent_id === category.cat_id;

                return (
                <div
                  key={category.cat_id}
                  className="space-y-2"
                >
                  <button
                    type="button"
                    onClick={() => handleParentCategoryClick(category)}
                    className={`w-full flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition ${
                      isParentSelected || selectedSubcategoryBelongsHere
                        ? 'bg-[#f2f9f5] text-[#007048]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-poppins">{category.name}</span>
                    {subcategories.length > 0 && (
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {isExpanded && subcategories.length > 0 && (
                    <div className="ml-4 space-y-1 border-l border-gray-200 pl-3">
                      {subcategories.map((subcategory) => (
                        <button
                          key={subcategory.cat_id}
                          type="button"
                          onClick={() => handleSubcategoryClick(subcategory, category.cat_id)}
                          className={`block w-full rounded-md px-2 py-1.5 text-left text-sm font-poppins transition ${
                            selectedCategory?.cat_id === subcategory.cat_id
                              ? 'bg-[#007048] text-white'
                              : 'text-gray-600 hover:bg-[#f4e7cf]'
                          }`}
                        >
                          {subcategory.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )})
            )}
          </div>
        )}
      </div>

      {/* Price Section */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button 
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full flex items-center justify-between mb-6"
        >
          <h3 className="text-1xl font-semibold text-gray-900 font-poppins">Price</h3>
          <svg 
            className={`w-4 h-4 text-gray-900 transition-transform ${isPriceOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isPriceOpen && (
          <div>
            {/* Price Range Slider */}
            <div className="relative mb-8">
              <div className="relative h-2 bg-gray-200 rounded-full">
                <div 
                  className="absolute h-2 bg-[#007048] rounded-full"
                  style={{
                    left: `${(priceRange[0] / 1500) * 100}%`,
                    right: `${100 - (priceRange[1] / 1500) * 100}%`
                  }}
                ></div>
              </div>
              
              {/* Min Range Slider */}
              <input
                type="range"
                name="min"
                min="0"
                max="1500"
                value={priceRange[0]}
                onChange={handlePriceChange}
                className="absolute top-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[#007048] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-[#007048] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:shadow-md"
              />
              
              {/* Max Range Slider */}
              <input
                type="range"
                name="max"
                min="0"
                max="1500"
                value={priceRange[1]}
                onChange={handlePriceChange}
                className="absolute top-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[#007048] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-[#007048] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:shadow-md"
              />
            </div>

            {/* Price Display */}
            <div className="text-base text-sm text-gray-700 font-poppins">
              Price: <span className="text-sm font-semibold">{priceRange[0]} — {priceRange[1]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Rating Section */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button 
          onClick={() => setIsRatingOpen(!isRatingOpen)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-1xl font-semibold text-gray-900 font-poppins">Rating</h3>
          <svg 
            className={`w-4 h-4 text-gray-900 transition-transform ${isRatingOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isRatingOpen && (
          <div className="space-y-3">
            {ratings.map((rating) => (
              <label 
                key={rating.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedRatings.includes(rating.value)}
                    onChange={() => handleRatingToggle(rating.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${
                    selectedRatings.includes(rating.value)
                      ? 'bg-[#007048] border-[#007048]' 
                      : 'border-gray-300 bg-white group-hover:border-[#007048]'
                  }`}>
                    {selectedRatings.includes(rating.value) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const ratingNum = parseFloat(rating.value);
                    const starPosition = index + 1;
                    const isFilled = starPosition <= Math.floor(ratingNum);
                    
                    return (
                      <svg 
                        key={index}
                        className={`w-4 h-4 ${isFilled ? 'text-[#007048]' : 'text-gray-300'}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    );
                  })}
                  <span className="text-gray-700 text-base text-sm ml-1 font-poppins">{rating.label}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Popular Tag Section */}
      <div>
        <button 
          onClick={() => setIsTagOpen(!isTagOpen)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-1xl font-semibold text-gray-900 font-poppins">Popular Tag</h3>
          <svg 
            className={`w-4 h-4 text-gray-900 transition-transform ${isTagOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isTagOpen && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition font-poppins ${
                  selectedTags.includes(tag)
                    ? 'bg-[#007048] text-sm text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Discount Banner */}
      <div className="mt-6 mb-4 bg-black rounded-2xl p-4 text-center bg-cover bg-center" style={{backgroundImage: "url('/src/assets/banner.jpg')"}}>
        <div className="text-2xl font-bold text-green-400 mb-0.5">79%</div>
        <div className="text-white text-sm mb-2">Discount</div>
        <div className="text-white text-xs mb-3">on your first order</div>
        <button className="text-green-400 text-sm font-semibold flex items-center justify-center gap-2 hover:text-green-300 transition mx-auto">
          Shop Now <span>→</span>
        </button>
      </div>

      {/* Sale Products Section */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 font-poppins">Sale Products</h3>
        <div className="space-y-3">
          {saleProductsToShow.map((product) => (
            <div key={product.id} className="flex gap-2 p-2 border border-gray-200 rounded-lg hover:border-[#007048] transition cursor-pointer">
              <img 
                src={resolveMediaSrc(product.image)} 
                alt={product.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1 font-poppins">{product.name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-gray-900">{product.currency_code} {Number(product.price || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <svg 
                      key={index}
                      className={`w-3 h-3 ${index < product.rating ? 'fill-[#007048]' : 'fill-gray-300'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
