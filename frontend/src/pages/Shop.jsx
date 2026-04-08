// src/pages/Shop.jsx
import { useState, useMemo, useEffect, useContext } from 'react';
import { CountryContext } from '../context/CountryContext';
import { useCategory } from '../context/CategoryContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocation } from 'react-router-dom';
import { useFilter } from '../context/FilterContext';
import { useWishlist } from '../context/WishlistContext';
import coconutOil from '../assets/coconut oils.jpg';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config';

export default function Shop() {
    // Map of productId -> price object
    const [productPrices, setProductPrices] = useState({});
  const [productPrimaryVariants, setProductPrimaryVariants] = useState({});
  const [topOrderedProducts, setTopOrderedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedMobileCategoryId, setExpandedMobileCategoryId] = useState(null);
  const availableRatings = [5, 4, 3, 2, 1, 0];

  function getFilterRatingValue(product) {
    const parsed = Number(product?.avg_rating ?? product?.rating);
    if (!Number.isFinite(parsed)) return null;
    return Math.max(0, Math.min(5, Math.round(parsed)));
  }

    const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState('Latest');
  const [currentPage, setCurrentPage] = useState(1);
  // const [selectedCategory, setSelectedCategory] = useState('All');
  // const [selectedCategory, setSelectedCategory] = useState(null);
  // const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  

    const { selectedCategory, setSelectedCategory } = useCategory();

    // Always scroll to top on mount and when selectedCategory changes
    useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, []);
    useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [selectedCategory]);



    const location = useLocation();
const searchQuery = location.state?.search || "";

const [search, setSearch] = useState(searchQuery);

useEffect(() => {
  setSearch(searchQuery);
}, [searchQuery]);




  const { selectedCountry } = useContext(CountryContext);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { appliedPriceRange, appliedRatings, resetFilters, clearPriceFilter, clearRatingFilter } = useFilter();
  const itemsPerPage = 12;

  const deriveVariantLabel = (variant) => {
    if (!variant) return null;

    const directLabel =
      variant.variant_label ||
      variant.label ||
      variant.display_label ||
      variant.size_label ||
      variant.weight_label ||
      variant.volume_label;

    if (directLabel) return directLabel;

    const value =
      variant.variant_value ??
      variant.value ??
      variant.size ??
      variant.weight ??
      variant.volume ??
      variant.qty ??
      variant.quantity;

    const unit =
      variant.variant_unit ||
      variant.unit ||
      variant.uom ||
      variant.measure_unit;

    if (value !== undefined && value !== null && unit) {
      return `${value} ${unit}`;
    }

    if (value !== undefined && value !== null) {
      return String(value);
    }

    return null;
  };

  const resolveMediaSrc = (value) => {
    if (!value) return coconutOil;
    if (value.startsWith('data:') || value.startsWith('blob:')) return value;
    if (/^https?:\/\//i.test(value)) return value;
    return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
  };

  const getProductImageSrc = (product) => {
    return resolveMediaSrc(product.image_1 || product.image_url || product.image_2 || product.image_3);
  };

  const getAvailableStock = (product) => {
    const stockCandidates = [
      product?.stocks,
      product?.stock,
      product?.available_stock,
      product?.available_quantity,
      product?.qty,
      product?.quantity,
    ];
    const numericStock = stockCandidates.find((value) => Number.isFinite(Number(value)));
    return Number(numericStock ?? 0);
  };

  const getOutOfStockStampSrc = (product) => {
    const stampValue =
      product?.out_of_stock_image ||
      product?.out_of_stock_stamp ||
      product?.stock_stamp_image ||
      product?.stock_stamp ||
      product?.stamp_image ||
      product?.stamp;

    if (!stampValue) return '';
    if (stampValue.startsWith('data:') || stampValue.startsWith('blob:')) return stampValue;
    if (/^https?:\/\//i.test(stampValue)) return stampValue;
    const looksLikeBase64 = /^[A-Za-z0-9+/=\s]+$/.test(stampValue) && stampValue.length > 100;
    if (looksLikeBase64) {
      return `data:image/png;base64,${stampValue.replace(/\s+/g, '')}`;
    }
    return `${API_BASE_URL}/${String(stampValue).replace(/^\/+/, '')}`;
  };

  const getNormalizedRating = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(5, Math.round(parsed)));
  };

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

  const visibleMobileSubcategories = expandedMobileCategoryId
    ? subcategoriesByParent[expandedMobileCategoryId] || []
    : [];

  const handleClearAllFilters = () => {
    resetFilters();
    setShowFilters(false);
    setCurrentPage(1);
  };


useEffect(() => {
  if (!selectedCountry) return;
  fetch(`${API_BASE_URL}/api/products/country/${selectedCountry.country_id}`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    })
    .then(async data => {
      setProducts(data);
      // Fetch price for each product (first variant only)
      const prices = {};
      const primaryVariants = {};
      await Promise.all(
        data.map(async (product) => {
          try {
            // Fetch variants for this product
            const variantsRes = await fetch(`${API_BASE_URL}/api/product_variants/${product.pro_id}`);
            const variants = await variantsRes.json();
            if (variants && variants.length > 0) {
              primaryVariants[product.pro_id] = variants[0];
              // Fetch price for the first variant
              const priceRes = await fetch(`${API_BASE_URL}/api/variant_prices/${variants[0].pro_var_id}`);
              const priceData = await priceRes.json();
              const priceForCountry = priceData.find(p => p.country_id === selectedCountry.country_id);
              if (priceForCountry) {
                prices[product.pro_id] = priceForCountry;
              }
            }
          } catch {
            // Ignore errors for individual products
          }
        })
      );
      setProductPrices(prices);
      setProductPrimaryVariants(primaryVariants);
    })
    .catch(() => {
      setProducts([]);
    });
}, [selectedCountry]);

useEffect(() => {
  fetch(`${API_BASE_URL}/api/categories`)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    })
    .then((data) => setCategories(Array.isArray(data) ? data : []))
    .catch(() => setCategories([]));
}, []);

useEffect(() => {
  if (!selectedCountry?.country_id) {
    setTopOrderedProducts([]);
    return;
  }

  fetch(`${API_BASE_URL}/api/orders/top-products?country_id=${selectedCountry.country_id}&limit=3`)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch top ordered products');
      return res.json();
    })
    .then((data) => {
      const transformed = (Array.isArray(data) ? data : []).map((item) => {
        const currentPrice = Number(item.price || 0);
        const rawImage = item.image_1 || item.image_url || item.image_2 || item.image_3;
        const resolvedImage = !rawImage
          ? coconutOil
          : (rawImage.startsWith('data:') || rawImage.startsWith('blob:'))
            ? rawImage
            : /^https?:\/\//i.test(rawImage)
              ? rawImage
              : `${API_BASE_URL}/${String(rawImage).replace(/^\/+/, '')}`;

        return {
          id: item.id,
          name: item.name,
          price: currentPrice,
          rating: Math.max(0, Math.min(5, Math.round(Number(item.rating || 0)))),
          currency_code: item.currency_code || selectedCountry?.currency_code || 'INR',
          image: resolvedImage,
        };
      });
      setTopOrderedProducts(transformed);
    })
    .catch(() => {
      setTopOrderedProducts([]);
    });
}, [selectedCountry]);

  // Filter products based on selected category (if not 'All'), price range, and rating
  // const filteredProducts = useMemo(() => {
  //   // Attach price to each product from productPrices
  //   const productsWithPrice = products.map(product => {
  //     const priceObj = productPrices[product.pro_id];
  //     return {
  //       ...product,
  //       price: priceObj ? priceObj.price : undefined
  //     };
  //   });
  //   let filtered = productsWithPrice;
    // Category filter
    // if (selectedCategory && selectedCategory !== 'All') {
    //   const selectedCategoryId = categoryNameToId[selectedCategory];
    //   filtered = filtered.filter(product => String(product.category_id) === String(selectedCategoryId));
    // }




    const filteredProducts = useMemo(() => {
    const productsWithPrice = products.map(product => {
    const priceObj = productPrices[product.pro_id];
    const normalizedPrice = priceObj?.price !== undefined && priceObj?.price !== null
      ? Number(priceObj.price)
      : undefined;
    const normalizedRating = getFilterRatingValue(product);

    return {
      ...product,
      price: Number.isNaN(normalizedPrice) ? undefined : normalizedPrice,
      rating: normalizedRating ?? product.rating
    };
  });
  let filtered = productsWithPrice;




   // Category filter (simplified)
  if (selectedCategory) {
    // Find all subcategory IDs recursively
    const collectCategoryIds = (catId, cats) => {
      const ids = [String(catId)];
      cats.forEach(c => {
        if (String(c.parent_id) === String(catId)) {
          ids.push(...collectCategoryIds(c.cat_id, cats));
        }
      });
      return ids;
    };
    const allCategoryIds = collectCategoryIds(selectedCategory.cat_id, categories);
    filtered = filtered.filter(product => allCategoryIds.includes(String(product.category_id)));
  }



  if (search) {
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }



    // Price range filter
    filtered = filtered.filter(product => {
      const numericPrice = Number(product.price);
      if (Number.isNaN(numericPrice)) return true;
      return numericPrice >= appliedPriceRange[0] && numericPrice <= appliedPriceRange[1];
    });
    // Rating filter
    if (appliedRatings.length > 0) {
      filtered = filtered.filter(product => {
        const numericRating = getFilterRatingValue(product);
        if (numericRating === null) return false;
        return appliedRatings.some(selectedRating => {
          const ratingNum = Number(selectedRating);
          return Number.isFinite(ratingNum) && numericRating === ratingNum;
        });
      });
    }








    // Sorting
    switch (sortBy) {
      case 'Price: Low to High':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'Price: High to Low':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'Name: A to Z':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Name: Z to A':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return filtered;
  }, [products, productPrices, selectedCategory, appliedPriceRange, appliedRatings, sortBy, search]);

  // If you don't have selectedCategoryId, just show all products or filter by name
  // const currentProducts = filteredProducts;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const generatePageNumbers = () => {
    const pages = [];
    const onEachSide = 2;
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = 1; i <= onEachSide; i++) {
        pages.push(i);
      }
      pages.push('...');
      for (let i = Math.max(currentPage - onEachSide, onEachSide + 2); i <= Math.min(currentPage + onEachSide, totalPages - onEachSide - 1); i++) {
        pages.push(i);
      }
      if (currentPage <= totalPages - onEachSide - 1) {
        pages.push('...');
      }
      for (let i = Math.max(totalPages - onEachSide + 1, currentPage + onEachSide + 1); i <= totalPages; i++) {
        pages.push(i);
      }
    }
    return pages;
  };








  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Search & Header - Only visible on mobile */}
      <div className="lg:hidden sticky top-0 bg-white z-20 border-b border-gray-200">
        <div className="px-4 py-3">
          {/* Search Bar */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              // onChange={(e) => setSearchQuery(e.target.value)}
               onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for products..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007048] focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setExpandedMobileCategoryId(null);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !selectedCategory
                  ? 'bg-[#007048] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {parentCategories.map((category) => {
              const subcategories = subcategoriesByParent[category.cat_id] || [];
              const isActive =
                selectedCategory?.cat_id === category.cat_id ||
                selectedCategory?.parent_id === category.cat_id ||
                expandedMobileCategoryId === category.cat_id;

              return (
              <button
                key={category.cat_id}
                onClick={() => {
                  if (subcategories.length > 0) {
                    setExpandedMobileCategoryId((current) =>
                      current === category.cat_id ? null : category.cat_id
                    );
                    setSelectedCategory(null);
                  } else {
                    setExpandedMobileCategoryId(null);
                    setSelectedCategory(category);
                  }
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#007048] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            )})}
          </div>

          {visibleMobileSubcategories.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {visibleMobileSubcategories.map((subcategory) => (
                <button
                  key={subcategory.cat_id}
                  onClick={() => {
                    setSelectedCategory(subcategory);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory?.cat_id === subcategory.cat_id
                      ? 'bg-[#f4e7cf] text-[#007048]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort & Filter Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-[#007048] transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#007048] bg-white [&>option]:text-xs [&>option]:py-1"
          >
            <option value="Latest" className="text-xs py-1">Latest</option>
            <option value="Price: Low to High" className="text-xs py-1">Price: Low to High</option>
            <option value="Price: High to Low" className="text-xs py-1">Price: High to Low</option>
            <option value="Name: A to Z" className="text-xs py-1">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {showFilters && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowFilters(false)}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 left-0 h-full w-80 bg-white z-50 overflow-y-auto shadow-2xl lg:hidden animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900 font-poppins">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Sidebar Content */}
            <div className="p-4">
              {/* <Sidebar onApplyFilters={handleApplyFilters} /> */}
              <Sidebar
                onApplyFilters={(payload = {}) => {
                  if (Object.prototype.hasOwnProperty.call(payload, 'category')) {
                    setSelectedCategory(payload.category);
                  }
                  setCurrentPage(1);
                }}
                availableRatings={availableRatings}
                saleProducts={topOrderedProducts}
              />
            </div>

            {/* Bottom Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={handleClearAllFilters}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-3 bg-[#007048] text-white rounded-lg font-medium hover:bg-[#005a3a] transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}

      <div className="max-w-8xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
        <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-6 hidden lg:block">Shop</h1>
        
        {/* Shop Layout with Sidebar and Products */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
            {/* <Sidebar onApplyFilters={handleApplyFilters} /> */}
              <Sidebar
              onApplyFilters={(payload = {}) => {
                if (Object.prototype.hasOwnProperty.call(payload, 'category')) {
                  setSelectedCategory(payload.category);
                }
                setCurrentPage(1);
              }}
              availableRatings={availableRatings}
              saleProducts={topOrderedProducts}
            />
          </aside>
          
          {/* Products Section */}
          <main className="flex-1">
            {/* Top Bar - Sort and Results */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-900 font-semibold font-poppins hidden sm:block">
                  <span className="text-2xl">{filteredProducts.length}</span> <span className="text-sm font-normal text-gray-600">Results Found</span>
                </div>
              </div>

              {/* Applied Filters Display */}
              {(appliedPriceRange[0] !== 0 || appliedPriceRange[1] !== 1500 || appliedRatings.length > 0) && (
                <div className="flex flex-wrap gap-2 items-center mb-4">
                  <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
                  {appliedPriceRange[0] !== 0 || appliedPriceRange[1] !== 1500 ? (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                      ₹{appliedPriceRange[0]} - ₹{appliedPriceRange[1]}
                      <button 
                        onClick={clearPriceFilter}
                        className="ml-1 hover:text-blue-600"
                      >
                        ✕
                      </button>
                    </span>
                  ) : null}
                  {appliedRatings.map(rating => (
                    <span key={rating} className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {rating} Star{Number(rating) === 1 ? '' : 's'}
                      <button 
                        onClick={() => clearRatingFilter(rating)}
                        className="ml-1 hover:text-green-600"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Products Grid or No Products Message */}
            {currentProducts.length === 0 ? (
              <div>No products found for this country.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
                {currentProducts.map((product) => (
                  <div key={product.pro_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition group">
                    {/* Product Image */}
                    <div
                      className="relative overflow-hidden bg-gray-100 aspect-square cursor-pointer"
                      onClick={() => navigate(`/product/${product.pro_id}`)}
                    >
                      <img
                        src={getProductImageSrc(product)}
                        alt={product.name}
                        className={`w-full h-full object-cover transition ${getAvailableStock(product) <= 0 ? 'blur-[2px] scale-105' : ''}`}
                      />
                      {getAvailableStock(product) <= 0 && (
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                          {getOutOfStockStampSrc(product) ? (
                            <img
                              src={getOutOfStockStampSrc(product)}
                              alt="Out of stock"
                              className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                            />
                          ) : (
                            <div className="relative w-36 h-36 sm:w-40 sm:h-40">
                              <div className="absolute inset-0 rounded-full border-[6px] border-red-600 opacity-90"></div>
                              <div className="absolute inset-2 rounded-full border-2 border-red-600 opacity-90"></div>
                              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 bg-red-600 px-4 py-3.5 min-w-[150px] text-center">
                                <span className="text-white text-[10px] sm:text-xs font-extrabold tracking-widest uppercase font-poppins">
                                  Out of Stock
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {/* Wishlist Heart Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          if (!isInWishlist(product.pro_id) && getAvailableStock(product) <= 0) {
                            alert('Out of stock');
                            return;
                          }

                          const wishlistProduct = {
                            id: product.pro_id,
                            name: product.name,
                            price: Number(productPrices[product.pro_id]?.price || 0),
                            image: getProductImageSrc(product),
                            currency_code: productPrices[product.pro_id]?.currency_code || selectedCountry?.currency_code || 'INR',
                          };
                          if (isInWishlist(product.pro_id)) {
                            removeFromWishlist(product.pro_id);
                          } else {
                            addToWishlist(wishlistProduct);
                          }
                        }}
                        className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white bg-opacity-90 hover:bg-opacity-100 shadow transition"
                        aria-label={isInWishlist(product.pro_id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <svg
                          className="w-4 h-4"
                          fill={isInWishlist(product.pro_id) ? '#e53e3e' : 'none'}
                          stroke={isInWishlist(product.pro_id) ? '#e53e3e' : '#6b7280'}
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                    </div>
                    {/* Product Info */}
                    <div className="p-2 sm:p-3">
                      <h3
                        onClick={() => navigate(`/product/${product.pro_id}`)}
                        className="text-xs sm:text-base font-medium text-gray-900 mb-1 sm:mb-2 font-poppins cursor-pointer hover:text-[#007048] line-clamp-2"
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-center mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= getNormalizedRating(product.rating ?? 0) ? 'fill-[#007048]' : 'fill-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="text-sm sm:text-lg font-semibold text-gray-900 font-poppins">
                          {productPrices[product.pro_id]
                            ? `${productPrices[product.pro_id].currency_code} ${productPrices[product.pro_id].price}`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-[6px]">
                        
                        <button
                          onClick={() => {
                            if (getAvailableStock(product) <= 0) {
                              alert('Out of stock');
                              return;
                            }

                            const priceInfo = productPrices[product.pro_id];
                            const variantInfo = productPrimaryVariants[product.pro_id];
                            const cartProduct = {
                              id: product.pro_id,
                              name: product.name,
                              image: getProductImageSrc(product),
                              price: Number(priceInfo?.price || 0),
                              currency_code: priceInfo?.currency_code || selectedCountry?.currency_code || 'INR',
                              country_id: selectedCountry?.country_id,
                              product_variant_id: priceInfo?.product_variant_id || variantInfo?.pro_var_id,
                              variant_sku: variantInfo?.sku,
                              variant_label: deriveVariantLabel(variantInfo),
                            };
                            addToCart(cartProduct, 1);
                          }}
                          className="ml-auto bg-emerald-700 text-white font-poppins font-semibold text-xs py-1.5 px-4 rounded hover:bg-emerald-800 transition"
                        >
                          ADD TO CART
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-12 mb-8">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {generatePageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`dots-${index}`} className="px-2 py-1 text-gray-600">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      currentPage === page
                        ? 'bg-[#007048] text-white'
                        : 'border border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}

              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


















































// // src/pages/Shop.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useEffect } from "react";
// import { useCart } from "../context/CartContext";
// import { useWishlist } from "../context/WishlistContext";
// import Sidebar from "../components/Sidebar";

// export default function Shop() {
//   const [sortBy, setSortBy] = useState("Latest");
//   const [currentPage, setCurrentPage] = useState(1);
//   const navigate = useNavigate();
//   const { addToCart } = useCart();
//   const { addToWishlist, isInWishlist } = useWishlist();
//   const itemsPerPage = 12;
//   const [priceRange, setPriceRange] = useState([0, 1500]);
//   const [selectedRatings, setSelectedRatings] = useState([]);
//   const [showSidebar, setShowSidebar] = useState(false);



//   useEffect(() => {
//   window.scrollTo(0, 0);
// }, []);


//   const products = [
//     {
//       id: 1,
//       name: "Organic oils",
//       price: 186.0,
//       rating: 4,
//       reviews: "0.5",
//       image: "/src/assets/organic oil.jpg",
//     },
//     {
//       id: 2,
//       name: "Organic Coconut oils",
//       price: 500.0,
//       rating: 5,
//       reviews: "0.5",
//       image: "/src/assets/oils.jpg",
//     },
//     {
//       id: 3,
//       name: "Organic Almond oils",
//       price: 50.0,
//       rating: 3,
//       reviews: "0.5",
//       image: "/src/assets/organic oil.jpg",
//     },
//     {
//       id: 4,
//       name: "Organic Palm oils",
//       price: 200.0,
//       rating: 2,
//       reviews: "0.5",
//       image: "/src/assets/oils.jpg",
//     },
//     {
//       id: 5,
//       name: "Organic Clove oils",
//       price: 300.0,
//       rating: 5,
//       reviews: "0.5",
//       image: "/src/assets/organic oil.jpg",
//     },
//     {
//       id: 6,
//       name: "Organic Olive oils",
//       price: 200.0,
//       rating: 4,
//       reviews: "0.5",
//       image: "/src/assets/oils.jpg",
//     },
//     {
//       id: 7,
//       name: "Organic Sunflower oils",
//       price: 186.0,
//       rating: 3,
//       reviews: "0.5",
//       image: "/src/assets/organic oil.jpg",
//     },
//     {
//       id: 8,
//       name: "Organic Sesame oils",
//       price: 300.0,
//       rating: 2,
//       reviews: "0.5",
//       image: "/src/assets/oils.jpg",
//     },
//     {
//       id: 9,
//       name: "Organic Mustard oils",
//       price: 500.0,
//       rating: 1,
//       reviews: "0.5",
//       image: "/src/assets/organic oil.jpg",
//     },
//     {
//       id: 10,
//       name: "Organic Castor oils",
//       price: 1000.0,
//       rating: 5,
//       reviews: "0.5",
//       image: "/src/assets/oils.jpg",
//     },
//     {
//       id: 11,
//       name: "Organic Neem oils",
//       price: 1000.0,
//       rating: 4,
//       reviews: "0.5",
//       image: "/src/assets/organic oil.jpg",
//     },
//     {
//       id: 12,
//       name: "Organic Jojoba oils",
//       price: 1400.0,
//       rating: 3,
//       reviews: "0.5",
//       image: "/src/assets/oils.jpg",
//     },
//     {
//       id: 13,
//       name: "Organic Argan oils",
//       price: 1400.0,
//       rating: 2,
//       reviews: "0.5",
//       image: "/src/assets/organic oil.jpg",
//     },
//     {
//       id: 14,
//       name: "Organic Tea Tree oils",
//       price: 600.0,
//       rating: 1,
//       reviews: "0.5",
//       image: "/src/assets/oils.jpg",
//     },
//     {
//       id: 15,
//       name: "Organic Lavender oils",
//       price: 186.0,
//       rating: 5,
//       reviews: "0.5",
//       image: "/src/assets/organic oil.jpg",
//     },
//     {
//       id: 16,
//       name: "Organic Eucalyptus oils",
//       price: 600.0,
//       rating: 4,
//       reviews: "0.5",
//       image: "/src/assets/oils.jpg",
//     },
//     {
//       id: 17,
//       name: "Organic Peppermint oils",
//       price: 700.0,
//       rating: 3,
//       reviews: "0.5",
//       image: "/src/assets/organic oil.jpg",
//     },
//     {
//       id: 18,
//       name: "Organic Lemongrass oils",
//       price: 700.0,
//       rating: 2,
//       reviews: "0.5",
//       image: "/src/assets/oils.jpg",
//     },
//   ];



// const filteredProducts = products.filter((product) => {
//   const matchesPrice =
//     product.price >= priceRange[0] &&
//     product.price <= priceRange[1];

//   const matchesRating =
//     selectedRatings.length === 0 ||
//     selectedRatings.includes(product.rating.toString());

//   return matchesPrice && matchesRating;
// });





//   // Sorting Logic
//   const sortedProducts = [...filteredProducts].sort((a, b) => {
//     switch (sortBy) {
//       case "Price: Low to High":
//         return a.price - b.price;

//       case "Price: High to Low":
//         return b.price - a.price;

//       case "Name: A to Z":
//         return a.name.localeCompare(b.name);

//       case "Name: Z to A":
//         return b.name.localeCompare(a.name);

//       case "Latest":
//       default:
//         return b.id - a.id; // latest = highest id first
//     }
//   });

//   // const totalPages = Math.ceil(products.length / itemsPerPage);
//   const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   // const currentProducts = products.slice(startIndex, endIndex);
//   const currentProducts = sortedProducts.slice(startIndex, endIndex);

//   const generatePageNumbers = () => {
//     const pages = [];
//     const onEachSide = 2;

//     if (totalPages <= 7) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       for (let i = 1; i <= onEachSide; i++) {
//         pages.push(i);
//       }
//       pages.push("...");
//       for (
//         let i = Math.max(currentPage - onEachSide, onEachSide + 2);
//         i <= Math.min(currentPage + onEachSide, totalPages - onEachSide - 1);
//         i++
//       ) {
//         pages.push(i);
//       }
//       if (currentPage <= totalPages - onEachSide - 1) {
//         pages.push("...");
//       }
//       for (
//         let i = Math.max(
//           totalPages - onEachSide + 1,
//           currentPage + onEachSide + 1,
//         );
//         i <= totalPages;
//         i++
//       ) {
//         pages.push(i);
//       }
//     }
//     return pages;
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="max-w-8xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
//         <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-6">
//           Shop
//         </h1>

//         {/* Shop Layout with Sidebar and Products */}
//         <div className="flex flex-col lg:flex-row gap-6">
//           {/* Sidebar */}
//           {/* <aside className="lg:sticky lg:top-8 lg:self-start"> */}
//             {/* <Sidebar /> */}
//             {/* <Sidebar
//   priceRange={priceRange}
//   setPriceRange={setPriceRange}
//   selectedRatings={selectedRatings}
//   setSelectedRatings={setSelectedRatings}
// />
//           </aside> */}


//         <aside className="overflow-y-auto h-[60vh] w-28 lg:w-auto lg:sticky lg:top-8 lg:self-start">
//   <Sidebar
//     priceRange={priceRange}
//     setPriceRange={setPriceRange}
//     selectedRatings={selectedRatings}
//     setSelectedRatings={setSelectedRatings}
//   />
// </aside>



//           {/* Products Section */}
//           <main className="flex-1">

//             {/* Top Bar - Sort and Results */}
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-3">
//                 <span className="text-gray-600 text-sm font-poppins">
//                   Sort by:
//                 </span>
//                 <select
//                   value={sortBy}
//                   onChange={(e) => {
//                     setSortBy(e.target.value);
//                     setCurrentPage(1); // reset to first page
//                   }}
//                   // onChange={(e) => setSortBy(e.target.value)}
//                   className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#007048] focus:border-transparent bg-white font-poppins"
//                 >
//                   <option value="Latest">Latest</option>
//                   <option value="Price: Low to High">Price: Low to High</option>
//                   <option value="Price: High to Low">Price: High to Low</option>
//                   <option value="Name: A to Z">Name: A to Z</option>
//                   <option value="Name: Z to A">Name: Z to A</option>
//                 </select>
//               </div>
//               <div className="text-gray-900 font-semibold font-poppins">
//                 <span className="text-2xl">52</span>{" "}
//                 <span className="text-sm font-normal text-gray-600">
//                   Results Found
//                 </span>
//               </div>
//             </div>

//             {/* Products Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
//               {currentProducts.map((product) => (
//                 <div
//                   key={product.id}
//                   className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition group"
//                 >
//                   {/* Product Image */}
//                   <div
//                     onClick={() => navigate(`/product/${product.id}`)}
//                     className="relative overflow-hidden bg-gray-100 aspect-square cursor-pointer"
//                   >
//                     <img
//                       src={product.image}
//                       alt={product.name}
//                       className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
//                     />
//                     {/* Wishlist Icon */}
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         addToWishlist(product);
//                       }}
//                       className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition ${
//                         isInWishlist(product.id)
//                           ? "bg-[#007048] text-white"
//                           : "bg-white text-gray-700 hover:bg-[#007048] hover:text-white"
//                       }`}
//                       aria-label="Add to wishlist"
//                     >
//                       <svg
//                         className="w-5 h-5"
//                         fill={
//                           isInWishlist(product.id) ? "currentColor" : "none"
//                         }
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         viewBox="0 0 24 24"
//                       >
//                         <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
//                       </svg>
//                     </button>
//                   </div>

//                   {/* Product Info */}
//                   <div className="p-3">
//                     <h3
//                       onClick={() => navigate(`/product/${product.id}`)}
//                       className="text-base font-medium text-gray-900 mb-2 font-poppins cursor-pointer hover:text-[#007048]"
//                     >
//                       {product.name}
//                     </h3>

//                     <div className="flex items-center justify-between mb-3">
//                       <span className="text-lg font-semibold text-gray-900 font-poppins">
//                         ₹ {product.price.toFixed(2)}
//                       </span>
//                     </div>

//                     {/* Rating and Add to Cart - Side by Side */}
//                     <div className="flex items-center gap-[6px]">
//                       <div className="flex items-center">
//                         {[1, 2, 3, 4, 5].map((star) => (
//                           <svg
//                             key={star}
//                             className={`w-3.5 h-3.5 ${
//                               star <= product.rating
//                                 ? "fill-[#007048]"
//                                 : "fill-gray-300"
//                             }`}
//                             viewBox="0 0 20 20"
//                           >
//                             <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
//                           </svg>
//                         ))}
//                       </div>
//                       <span className="text-xs text-poppins text-gray-500">
//                         ({product.reviews})
//                       </span>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           addToCart(product, 1);
//                         }}
//                         className="ml-auto bg-emerald-700 text-white font-poppins font-semibold text-xs py-2 px-6 rounded hover:bg-emerald-800 transition"
//                       >
//                         ADD TO CART
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             <div className="flex items-center justify-center gap-2 mt-12 mb-8">
//               <button
//                 onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                 disabled={currentPage === 1}
//                 className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M15 19l-7-7 7-7"
//                   />
//                 </svg>
//               </button>

//               {generatePageNumbers().map((page, index) =>
//                 page === "..." ? (
//                   <span
//                     key={`dots-${index}`}
//                     className="px-2 py-1 text-gray-600"
//                   >
//                     ...
//                   </span>
//                 ) : (
//                   <button
//                     key={page}
//                     onClick={() => setCurrentPage(page)}
//                     className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
//                       currentPage === page
//                         ? "bg-[#007048] text-white"
//                         : "border border-gray-300 text-gray-600 hover:border-gray-400"
//                     }`}
//                   >
//                     {page}
//                   </button>
//                 ),
//               )}

//               <button
//                 onClick={() =>
//                   setCurrentPage(Math.min(totalPages, currentPage + 1))
//                 }
//                 disabled={currentPage === totalPages}
//                 className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 5l7 7-7 7"
//                   />
//                 </svg>
//               </button>
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }


















































// // // src/pages/Shop.jsx
// // import { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { useEffect } from "react";
// // import { useCart } from "../context/CartContext";
// // import { useWishlist } from "../context/WishlistContext";
// // import Sidebar from "../components/Sidebar";

// // export default function Shop() {
// //   const [sortBy, setSortBy] = useState("Latest");
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const navigate = useNavigate();
// //   const { addToCart } = useCart();
// //   const { addToWishlist, isInWishlist } = useWishlist();
// //   const itemsPerPage = 12;
// //   const [priceRange, setPriceRange] = useState([0, 1500]);
// //   const [selectedRatings, setSelectedRatings] = useState([]);



// //   useEffect(() => {
// //   window.scrollTo(0, 0);
// // }, []);


// //   const products = [
// //     {
// //       id: 1,
// //       name: "Organic oils",
// //       price: 186.0,
// //       rating: 4,
// //       reviews: "0.5",
// //       image: "/src/assets/organic oil.jpg",
// //     },
// //     {
// //       id: 2,
// //       name: "Organic Coconut oils",
// //       price: 500.0,
// //       rating: 5,
// //       reviews: "0.5",
// //       image: "/src/assets/oils.jpg",
// //     },
// //     {
// //       id: 3,
// //       name: "Organic Almond oils",
// //       price: 50.0,
// //       rating: 3,
// //       reviews: "0.5",
// //       image: "/src/assets/organic oil.jpg",
// //     },
// //     {
// //       id: 4,
// //       name: "Organic Palm oils",
// //       price: 200.0,
// //       rating: 2,
// //       reviews: "0.5",
// //       image: "/src/assets/oils.jpg",
// //     },
// //     {
// //       id: 5,
// //       name: "Organic Clove oils",
// //       price: 300.0,
// //       rating: 5,
// //       reviews: "0.5",
// //       image: "/src/assets/organic oil.jpg",
// //     },
// //     {
// //       id: 6,
// //       name: "Organic Olive oils",
// //       price: 200.0,
// //       rating: 4,
// //       reviews: "0.5",
// //       image: "/src/assets/oils.jpg",
// //     },
// //     {
// //       id: 7,
// //       name: "Organic Sunflower oils",
// //       price: 186.0,
// //       rating: 3,
// //       reviews: "0.5",
// //       image: "/src/assets/organic oil.jpg",
// //     },
// //     {
// //       id: 8,
// //       name: "Organic Sesame oils",
// //       price: 300.0,
// //       rating: 2,
// //       reviews: "0.5",
// //       image: "/src/assets/oils.jpg",
// //     },
// //     {
// //       id: 9,
// //       name: "Organic Mustard oils",
// //       price: 500.0,
// //       rating: 1,
// //       reviews: "0.5",
// //       image: "/src/assets/organic oil.jpg",
// //     },
// //     {
// //       id: 10,
// //       name: "Organic Castor oils",
// //       price: 1000.0,
// //       rating: 5,
// //       reviews: "0.5",
// //       image: "/src/assets/oils.jpg",
// //     },
// //     {
// //       id: 11,
// //       name: "Organic Neem oils",
// //       price: 1000.0,
// //       rating: 4,
// //       reviews: "0.5",
// //       image: "/src/assets/organic oil.jpg",
// //     },
// //     {
// //       id: 12,
// //       name: "Organic Jojoba oils",
// //       price: 1400.0,
// //       rating: 3,
// //       reviews: "0.5",
// //       image: "/src/assets/oils.jpg",
// //     },
// //     {
// //       id: 13,
// //       name: "Organic Argan oils",
// //       price: 1400.0,
// //       rating: 2,
// //       reviews: "0.5",
// //       image: "/src/assets/organic oil.jpg",
// //     },
// //     {
// //       id: 14,
// //       name: "Organic Tea Tree oils",
// //       price: 600.0,
// //       rating: 1,
// //       reviews: "0.5",
// //       image: "/src/assets/oils.jpg",
// //     },
// //     {
// //       id: 15,
// //       name: "Organic Lavender oils",
// //       price: 186.0,
// //       rating: 5,
// //       reviews: "0.5",
// //       image: "/src/assets/organic oil.jpg",
// //     },
// //     {
// //       id: 16,
// //       name: "Organic Eucalyptus oils",
// //       price: 600.0,
// //       rating: 4,
// //       reviews: "0.5",
// //       image: "/src/assets/oils.jpg",
// //     },
// //     {
// //       id: 17,
// //       name: "Organic Peppermint oils",
// //       price: 700.0,
// //       rating: 3,
// //       reviews: "0.5",
// //       image: "/src/assets/organic oil.jpg",
// //     },
// //     {
// //       id: 18,
// //       name: "Organic Lemongrass oils",
// //       price: 700.0,
// //       rating: 2,
// //       reviews: "0.5",
// //       image: "/src/assets/oils.jpg",
// //     },
// //   ];



// // const filteredProducts = products.filter((product) => {
// //   const matchesPrice =
// //     product.price >= priceRange[0] &&
// //     product.price <= priceRange[1];

// //   const matchesRating =
// //     selectedRatings.length === 0 ||
// //     selectedRatings.includes(product.rating.toString());

// //   return matchesPrice && matchesRating;
// // });





// //   // Sorting Logic
// //   const sortedProducts = [...filteredProducts].sort((a, b) => {
// //     switch (sortBy) {
// //       case "Price: Low to High":
// //         return a.price - b.price;

// //       case "Price: High to Low":
// //         return b.price - a.price;

// //       case "Name: A to Z":
// //         return a.name.localeCompare(b.name);

// //       case "Name: Z to A":
// //         return b.name.localeCompare(a.name);

// //       case "Latest":
// //       default:
// //         return b.id - a.id; // latest = highest id first
// //     }
// //   });

// //   // const totalPages = Math.ceil(products.length / itemsPerPage);
// //   const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
// //   const startIndex = (currentPage - 1) * itemsPerPage;
// //   const endIndex = startIndex + itemsPerPage;
// //   // const currentProducts = products.slice(startIndex, endIndex);
// //   const currentProducts = sortedProducts.slice(startIndex, endIndex);

// //   const generatePageNumbers = () => {
// //     const pages = [];
// //     const onEachSide = 2;

// //     if (totalPages <= 7) {
// //       for (let i = 1; i <= totalPages; i++) {
// //         pages.push(i);
// //       }
// //     } else {
// //       for (let i = 1; i <= onEachSide; i++) {
// //         pages.push(i);
// //       }
// //       pages.push("...");
// //       for (
// //         let i = Math.max(currentPage - onEachSide, onEachSide + 2);
// //         i <= Math.min(currentPage + onEachSide, totalPages - onEachSide - 1);
// //         i++
// //       ) {
// //         pages.push(i);
// //       }
// //       if (currentPage <= totalPages - onEachSide - 1) {
// //         pages.push("...");
// //       }
// //       for (
// //         let i = Math.max(
// //           totalPages - onEachSide + 1,
// //           currentPage + onEachSide + 1,
// //         );
// //         i <= totalPages;
// //         i++
// //       ) {
// //         pages.push(i);
// //       }
// //     }
// //     return pages;
// //   };

// //   return (
// //     <div className="min-h-screen bg-white">
// //       <div className="max-w-8xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
// //         <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-6">
// //           Shop
// //         </h1>

// //         {/* Shop Layout with Sidebar and Products */}
// //         <div className="flex flex-col lg:flex-row gap-6">
// //           {/* Sidebar */}
// //           <aside className="lg:sticky lg:top-8 lg:self-start">
// //             {/* <Sidebar /> */}
// //             <Sidebar
// //   priceRange={priceRange}
// //   setPriceRange={setPriceRange}
// //   selectedRatings={selectedRatings}
// //   setSelectedRatings={setSelectedRatings}
// // />
// //           </aside>

// //           {/* Products Section */}
// //           <main className="flex-1">
// //             {/* Top Bar - Sort and Results */}
// //             <div className="flex items-center justify-between mb-6">
// //               <div className="flex items-center gap-3">
// //                 <span className="text-gray-600 text-sm font-poppins">
// //                   Sort by:
// //                 </span>
// //                 <select
// //                   value={sortBy}
// //                   onChange={(e) => {
// //                     setSortBy(e.target.value);
// //                     setCurrentPage(1); // reset to first page
// //                   }}
// //                   // onChange={(e) => setSortBy(e.target.value)}
// //                   className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#007048] focus:border-transparent bg-white font-poppins"
// //                 >
// //                   <option value="Latest">Latest</option>
// //                   <option value="Price: Low to High">Price: Low to High</option>
// //                   <option value="Price: High to Low">Price: High to Low</option>
// //                   <option value="Name: A to Z">Name: A to Z</option>
// //                   <option value="Name: Z to A">Name: Z to A</option>
// //                 </select>
// //               </div>
// //               <div className="text-gray-900 font-semibold font-poppins">
// //                 <span className="text-2xl">52</span>{" "}
// //                 <span className="text-sm font-normal text-gray-600">
// //                   Results Found
// //                 </span>
// //               </div>
// //             </div>

// //             {/* Products Grid */}
// //             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
// //               {currentProducts.map((product) => (
// //                 <div
// //                   key={product.id}
// //                   className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition group"
// //                 >
// //                   {/* Product Image */}
// //                   <div
// //                     onClick={() => navigate(`/product/${product.id}`)}
// //                     className="relative overflow-hidden bg-gray-100 aspect-square cursor-pointer"
// //                   >
// //                     <img
// //                       src={product.image}
// //                       alt={product.name}
// //                       className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
// //                     />
// //                     {/* Wishlist Icon */}
// //                     <button
// //                       onClick={(e) => {
// //                         e.stopPropagation();
// //                         addToWishlist(product);
// //                       }}
// //                       className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition ${
// //                         isInWishlist(product.id)
// //                           ? "bg-[#007048] text-white"
// //                           : "bg-white text-gray-700 hover:bg-[#007048] hover:text-white"
// //                       }`}
// //                       aria-label="Add to wishlist"
// //                     >
// //                       <svg
// //                         className="w-5 h-5"
// //                         fill={
// //                           isInWishlist(product.id) ? "currentColor" : "none"
// //                         }
// //                         stroke="currentColor"
// //                         strokeWidth="2"
// //                         viewBox="0 0 24 24"
// //                       >
// //                         <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
// //                       </svg>
// //                     </button>
// //                   </div>

// //                   {/* Product Info */}
// //                   <div className="p-3">
// //                     <h3
// //                       onClick={() => navigate(`/product/${product.id}`)}
// //                       className="text-base font-medium text-gray-900 mb-2 font-poppins cursor-pointer hover:text-[#007048]"
// //                     >
// //                       {product.name}
// //                     </h3>

// //                     <div className="flex items-center justify-between mb-3">
// //                       <span className="text-lg font-semibold text-gray-900 font-poppins">
// //                         ₹ {product.price.toFixed(2)}
// //                       </span>
// //                     </div>

// //                     {/* Rating and Add to Cart - Side by Side */}
// //                     <div className="flex items-center gap-[6px]">
// //                       <div className="flex items-center">
// //                         {[1, 2, 3, 4, 5].map((star) => (
// //                           <svg
// //                             key={star}
// //                             className={`w-3.5 h-3.5 ${
// //                               star <= product.rating
// //                                 ? "fill-[#007048]"
// //                                 : "fill-gray-300"
// //                             }`}
// //                             viewBox="0 0 20 20"
// //                           >
// //                             <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
// //                           </svg>
// //                         ))}
// //                       </div>
// //                       <span className="text-xs text-poppins text-gray-500">
// //                         ({product.reviews})
// //                       </span>
// //                       <button
// //                         onClick={(e) => {
// //                           e.stopPropagation();
// //                           addToCart(product, 1);
// //                         }}
// //                         className="ml-auto bg-emerald-700 text-white font-poppins font-semibold text-xs py-2 px-6 rounded hover:bg-emerald-800 transition"
// //                       >
// //                         ADD TO CART
// //                       </button>
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>

// //             {/* Pagination */}
// //             <div className="flex items-center justify-center gap-2 mt-12 mb-8">
// //               <button
// //                 onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
// //                 disabled={currentPage === 1}
// //                 className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
// //               >
// //                 <svg
// //                   className="w-4 h-4"
// //                   fill="none"
// //                   stroke="currentColor"
// //                   viewBox="0 0 24 24"
// //                 >
// //                   <path
// //                     strokeLinecap="round"
// //                     strokeLinejoin="round"
// //                     strokeWidth={2}
// //                     d="M15 19l-7-7 7-7"
// //                   />
// //                 </svg>
// //               </button>

// //               {generatePageNumbers().map((page, index) =>
// //                 page === "..." ? (
// //                   <span
// //                     key={`dots-${index}`}
// //                     className="px-2 py-1 text-gray-600"
// //                   >
// //                     ...
// //                   </span>
// //                 ) : (
// //                   <button
// //                     key={page}
// //                     onClick={() => setCurrentPage(page)}
// //                     className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
// //                       currentPage === page
// //                         ? "bg-[#007048] text-white"
// //                         : "border border-gray-300 text-gray-600 hover:border-gray-400"
// //                     }`}
// //                   >
// //                     {page}
// //                   </button>
// //                 ),
// //               )}

// //               <button
// //                 onClick={() =>
// //                   setCurrentPage(Math.min(totalPages, currentPage + 1))
// //                 }
// //                 disabled={currentPage === totalPages}
// //                 className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
// //               >
// //                 <svg
// //                   className="w-4 h-4"
// //                   fill="none"
// //                   stroke="currentColor"
// //                   viewBox="0 0 24 24"
// //                 >
// //                   <path
// //                     strokeLinecap="round"
// //                     strokeLinejoin="round"
// //                     strokeWidth={2}
// //                     d="M9 5l7 7-7 7"
// //                   />
// //                 </svg>
// //               </button>
// //             </div>
// //           </main>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
