// src/pages/Home.jsx
import { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { CountryContext } from '../context/CountryContext';
import { useCategory } from '../context/CategoryContext';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import homeImage from '../assets/home1.png';
import bg from '../assets/bg-home.png';
import leaf from '../assets/leaf.png';
import toy from '../assets/toy.png';
import bean1 from '../assets/bean1.png';
import bean2 from '../assets/bean2.png';
import feature1 from '../assets/features1.png';
import feature2 from '../assets/features2.png';
import category1 from '../assets/category1.png';
import category2 from '../assets/category2.png';
import organicOil from '../assets/organic oil.jpg';
import coconutOil from '../assets/coconut oils.jpg';
import feature3 from '../assets/features3.png';
import featureProduct from '../assets/feature.png';
import home1 from '../assets/home1.png';
import home2 from '../assets/home2.png';
import home3 from '../assets/home3.png';
import home4 from '../assets/home4.png';
import oilsImage from '../assets/oils.jpg';
import sale1 from '../assets/sale1.jpg';
import sale2 from '../assets/sale2.jpg';
import sale3 from '../assets/sale3.jpg';
import news1 from '../assets/news1.jpg';
import news2 from '../assets/news2.jpg';
import news3 from '../assets/news3.jpg';
import { API_BASE_URL } from '../config';

export default function Home() {
    // Map of productId -> price object
    const [productPrices, setProductPrices] = useState({});
  const [activeTab, setActiveTab] = useState('new-arrival');
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const navigate = useNavigate();


   const { selectedCountry } = useContext(CountryContext);
  const [products, setProducts] = useState([]);

  const [name, setName] = useState('');



const [reviews, setReviews] = useState([]);
const [loading, setLoading] = useState(true);
const [isTopFeaturedReady, setIsTopFeaturedReady] = useState(false);




  const [comment, setComment] = useState('');
const [rating, setRating] = useState(0);


const carouselRef = useRef(null);
const [currentIndex, setCurrentIndex] = useState(0);
const [isAtStart, setIsAtStart] = useState(true);
const [isAtEnd, setIsAtEnd] = useState(false);



const { selectedCategory, setSelectedCategory } = useCategory();

// State to control showing all categories
const [showAllCategories, setShowAllCategories] = useState(false);



const [categories, setCategories] = useState([]);

const [blogs, setBlogs] = useState([]);

const resolveMediaSrc = (value) => {
  if (!value) return coconutOil;
  if (value.startsWith('data:') || value.startsWith('blob:')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
};

const getProductImageSrc = (product) => {
  return resolveMediaSrc(product.image_1 || product.image_url || product.image_2 || product.image_3);
};

const getCustomerInitial = (customerName) => {
  const trimmedName = (customerName || '').trim();
  if (!trimmedName) return 'C';
  return trimmedName.charAt(0).toUpperCase();
};

const getNormalizedRating = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(5, Math.round(parsed)));
};


  useEffect(() => {
  fetch(`${API_BASE_URL}/api/categories`)
    .then((res) => res.json())
    .then((data) => {
      // Only keep categories with no parent (not subcategories)
      setCategories(Array.isArray(data) ? data.filter(cat => !cat.parent_id || cat.parent_id === 0) : []);
    })
    .catch((err) => console.error(err));
}, []);


  useEffect(() => {
  fetch(`${API_BASE_URL}/api/blogs`)
    .then((res) => res.json())
    .then((data) => {
      setBlogs(data);
    })
    .catch((err) => console.error(err));
}, []);



//   const handleCommentSubmit = (e) => {
//   e.preventDefault();
//   // Handle form submission here (e.g., send to API)
//   // Example: console.log({ comment, rating });
//   setComment('');
//   setRating(0);
// };



const filteredProducts = products;

const recentProducts = useMemo(() => {
  return [...filteredProducts]
    .sort((firstProduct, secondProduct) => {
      const firstDate = new Date(firstProduct.created_at || firstProduct.createdAt || 0).getTime();
      const secondDate = new Date(secondProduct.created_at || secondProduct.createdAt || 0).getTime();

      if (firstDate && secondDate && firstDate !== secondDate) {
        return secondDate - firstDate;
      }

      return Number(secondProduct.pro_id || 0) - Number(firstProduct.pro_id || 0);
    })
    .slice(0, 4);
}, [filteredProducts]);

const newArrivalProducts = useMemo(() => {
  return [...products]
    .sort((firstProduct, secondProduct) => {
      const firstDate = new Date(firstProduct.created_at || firstProduct.createdAt || 0).getTime();
      const secondDate = new Date(secondProduct.created_at || secondProduct.createdAt || 0).getTime();

      if (firstDate && secondDate && firstDate !== secondDate) {
        return secondDate - firstDate;
      }

      return Number(secondProduct.pro_id || secondProduct.id || 0) - Number(firstProduct.pro_id || firstProduct.id || 0);
    })
    .slice(0, 6)
    .map((product) => {
      const productId = Number(product.pro_id || product.id || 0);
      const countryPrice = productPrices[productId];

      return {
        id: productId,
        name: product.name,
        price: countryPrice?.price ?? product.price ?? '0.00',
        image: getProductImageSrc(product) || featureProduct,
        rating: getNormalizedRating(product.rating ?? 0),
        review_count: Math.max(0, Number(product.reviews ?? product.review_count ?? product.reviews_count ?? product.total_reviews ?? product.rating_count ?? 0)),
      };
    });
}, [products, productPrices]);

const ratingsByProductId = useMemo(() => {
  return products.reduce((acc, product) => {
    const productId = Number(product.pro_id || product.id || 0);
    if (!productId) return acc;
    acc[productId] = getNormalizedRating(product.rating ?? 0);
    return acc;
  }, {});
}, [products]);

const bestSellerCards = useMemo(() => {
  return bestSellerProducts.slice(0, 6).map((product) => {
    const productId = Number(product.pro_id || product.id || 0);
    const countryPrice = productPrices[productId];

    return {
      id: productId,
      name: product.name,
      price: countryPrice?.price ?? product.price ?? '0.00',
      image: getProductImageSrc(product) || featureProduct,
      rating: getNormalizedRating(product.rating ?? ratingsByProductId[productId] ?? 0),
      review_count: Math.max(0, Number(product.reviews ?? product.review_count ?? product.reviews_count ?? product.total_reviews ?? product.rating_count ?? 0)),
    };
  });
}, [bestSellerProducts, productPrices, ratingsByProductId]);

const combinedFeaturedProducts = useMemo(() => {
  const limit = 6;
  const halfLimit = Math.floor(limit / 2);
  const combined = [];
  const seen = new Set();

  const appendUnique = (items, maxCount) => {
    for (const item of items) {
      if (combined.length >= maxCount) break;
      if (!item?.id || seen.has(item.id)) continue;
      seen.add(item.id);
      combined.push(item);
    }
  };

  appendUnique(newArrivalProducts, halfLimit);
  appendUnique(bestSellerCards, limit);
  appendUnique(newArrivalProducts, limit);

  return combined.slice(0, limit);
}, [newArrivalProducts, bestSellerCards]);

const featuredProducts = useMemo(() => ({
  'new-arrival': newArrivalProducts,
  'best-sellers': bestSellerCards,
  featured: combinedFeaturedProducts,
}), [newArrivalProducts, bestSellerCards, combinedFeaturedProducts]);




  const handleCommentSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(`${API_BASE_URL}/api/testimonials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        description: comment,
        rating: rating,
      }),
    });

    if (res.ok) {
      alert("✅ Review submitted successfully!");

      setName("");
      setComment("");
      setRating(0);
    } else {
      alert("❌ Something went wrong!");
    }

  } catch (err) {
    alert("❌ Server error!");
    console.error(err);
  }
};









const scrollLeft = () => {
  if (currentIndex > 0) {
    setCurrentIndex(prev => prev - 1);
  }
};

const scrollRight = () => {
  // Adjust max index based on how many groups of 3 fit
  const maxIndex = Math.max(0, reviews.length - 3);
  if (currentIndex < maxIndex) {
    setCurrentIndex(prev => prev + 1);
  }
};

useEffect(() => {
  const max = Math.max(0, reviews.length - 3);
  setIsAtStart(currentIndex === 0);
  setIsAtEnd(currentIndex >= max);
}, [currentIndex, reviews.length]);




useEffect(() => {
  const interval = setInterval(() => {

    const maxIndex = Math.max(0, reviews.length - 3);

    setCurrentIndex(prev => {
      if (prev >= maxIndex) return 0;
      return prev + 1;
    });

  }, 3000);

  return () => clearInterval(interval);

}, [reviews.length]);










useEffect(() => {
  fetch(`${API_BASE_URL}/api/reviews`) // update URL if needed
    .then((res) => res.json())
    .then((data) => {
      setReviews(data);
      setLoading(false);
    })
    .catch((err) => {
      setLoading(false);
      // Optionally handle error
    });
}, []);




 

useEffect(() => {
  if (!selectedCountry?.country_id) {
    setProducts([]);
    setBestSellerProducts([]);
    setProductPrices({});
    setIsTopFeaturedReady(false);
    return;
  }

  setLoading(true);
  setIsTopFeaturedReady(false);
  setProductPrices({});
  Promise.all([
    fetch(`${API_BASE_URL}/api/products/country/${selectedCountry.country_id}`).then((res) => res.json()),
    fetch(`${API_BASE_URL}/api/orders/top-products?country_id=${selectedCountry.country_id}&limit=6`).then((res) => res.json()),
  ])
    .then(async ([countryProducts, topProducts]) => {
      const productsData = Array.isArray(countryProducts) ? countryProducts : [];
      const bestSellerData = Array.isArray(topProducts) ? topProducts : [];

      // Fetch price for each product (first variant only)
      const prices = {};
      await Promise.all(
        productsData.map(async (product) => {
          try {
            // Fetch variants for this product
            const variantsRes = await fetch(`${API_BASE_URL}/api/product_variants/${product.pro_id}`);
            const variants = await variantsRes.json();
            if (variants && variants.length > 0) {
              // Fetch price for the first variant
              const priceRes = await fetch(`${API_BASE_URL}/api/variant_prices/${variants[0].pro_var_id}`);
              const priceData = await priceRes.json();
              const priceForCountry = priceData.find(p => p.country_id === selectedCountry.country_id);
              if (priceForCountry) {
                prices[product.pro_id] = priceForCountry;
              }
            }
          } catch (e) {
            // Ignore errors for individual products
          }
        })
      );

      setProducts(productsData);
      setBestSellerProducts(bestSellerData);
      setProductPrices(prices);
      setIsTopFeaturedReady(true);
      setLoading(false);
    })
    .catch(() => {
      setProducts([]);
      setBestSellerProducts([]);
      setProductPrices({});
      setIsTopFeaturedReady(false);
      setLoading(false);
    });
}, [selectedCountry]);




  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @media (min-width: 768px) and (max-width: 1280px) {
          .hero-yellow-bg {
            background-size: 100% 100% !important;
          }
        }
      `}</style>
      <section className="bg-white overflow-hidden">
        {/* Hero Section */}
        {/* hero switches to row on md and above */}
        <div className="flex flex-col-reverse md:flex-row min-h-[400px] sm:min-h-[500px] md:min-h-[600px]" style={{ backgroundColor: '#efe1cc' }}>
          {/* Left Content */}
         
          <div className="w-full md:w-1/2 px-5 sm:px-10 md:px-16 py-10 md:py-16 flex flex-col justify-center relative text-center lg:text-left">
            {/* decorative beans hidden on small screens */}
            <img
              src={bean1}
              alt=""
              className="hidden sm:block absolute top-14 left-30 w-8 h-8 opacity-60"
            />
            <img
              src={bean2}
              alt=""
              className="hidden sm:block absolute top-14 left-24 w-5 h-5 opacity-60"
            />
            {/* Discount Badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span
                className="text-emerald-900 text-sm md:text-base font-semibold px-4 py-1.5 rounded-full shadow-sm"
                style={{
                  background: 'linear-gradient(90deg, #8fcf88 0%, #d9d4c2 100%)',
                }}
              >
                Weekend Discount
              </span>
            </div>
             <img src={leaf} alt="" className="hidden sm:block absolute top-32 left-60 w-8 h-8 opacity-60" />
             


            {/* Main Text */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight ">
              <span className="text-emerald-700">Pure </span>
              <span className="text-orange-500">Organic </span>
              <span className="text-emerald-700">Goodness</span>
            </h1>
            {/* Tagline */}
            <p className="text-3xl md:text-4xl font-segoe-script font-semibold text-emerald-800 mb-2">
              No.1 Naturally
            </p>
            <p className="text-3xl md:text-4xl font-segoe-script font-semibold text-black mb-6">
              Homemade
            </p>

            {/* Description */}
            <p className="text-gray-700 text-base md:text-lg mb-8 max-w-md font-inter">
              Traditional foods made with care and integrity.
            </p>

            {/* Price and CTA */}
            <div className="flex justify-center lg:justify-start">
  <div className="relative">
    
    {/* Toy Image Only */}
    <img
      src={toy}
      alt="Toy"
      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
    />

  </div>
</div>
          </div>
          {/* Right Image - Orange Background */}
          <div
            className="w-full md:w-1/2 relative flex items-center justify-center overflow-visible hero-yellow-bg"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Product Image */}
            <img
              src={homeImage}
              alt="Organic Products"
              className="w-full sm:w-[80%] max-w-[520px] h-auto object-contain relative z-10"
            />
            
            {/* Orange Sticks */}
            <img
  src={home2}
  alt="Stick"
  className="hidden lg:block absolute left-0 bottom-10 w-20"
/>

<img
  src={home3}
  alt="Stick"
  className="hidden lg:block absolute left-6 bottom-10 w-20"
/>
          </div>
        </div>

      {/* Featured Benefits Section */}
      <div className="relative mt-0 lg:-mt-16 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg px-6 md:px-12 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Feature 1 */}
        <div className="flex items-start gap-4 feature-card animate-fadeSlideUp" style={{ animationDelay: "0.1s" }}>
  <img src={feature1} alt="New stocks and sales" className="w-12 h-12 animate-softFloat" />
          <div>
            <h3 className="font-bold text-base md:text-lg mb-1">New stocks and sales</h3>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Tasigförsamhet beteendedesign. Mobile checkout. Ylig kärrtorpa.</p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex items-start gap-4 feature-card animate-fadeSlideUp" style={{ animationDelay: "0.3s" }}>
  <img src={feature2} alt="Quality assurance" className="w-12 h-12 animate-softFloat" />
          <div>
            <h3 className="font-bold text-base md:text-lg mb-1">Quality assurance</h3>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Tasigförsamhet beteendedesign. Mobile checkout. Ylig kärrtorpa.</p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex items-start gap-4 feature-card animate-fadeSlideUp" style={{ animationDelay: "0.5s" }}>
  <img src={feature3} alt="Delivery within 1 hour" className="w-12 h-12 animate-softFloat" />
          <div>
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg mb-1">Delivery within 1 hour</h3>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Tasigförsamhet beteendedesign. Mobile checkout. Ylig kärrtorpa.</p>
          </div>
        </div>
      </div>
      </div>

      {/* Popular Categories Section */}
        <section className="bg-white">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8 md:mb-8 lg:mb-8 desktop-gap">
          <h2 className="text-2xl md:text-3xl font-poppins font-bold text-gray-900 ml-4">Popular categories</h2>
          <button
            onClick={() => setShowAllCategories((prev) => !prev)}
            className="text-orange-500 font-medium flex items-center gap-2 hover:text-orange-600 transition mr-5 focus:outline-none"
          >
            {showAllCategories ? 'Show Less' : 'View All'}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Categories Display */}
        {showAllCategories ? (
          // Grid view for all categories
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 px-4 pb-8">
            {categories.map((cat) => (
              <div
                key={cat.cat_id}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => {
                  setSelectedCategory(cat);
                  navigate('/shop');
                }}
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-[#FCD770] flex items-center justify-center mb-3 overflow-hidden">
                  <img
                    src={cat.image_path || category1}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-center font-poppins font-medium text-gray-900 text-sm md:text-base">{cat.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          // Marquee/scroll view (original)
          <div className="overflow-x-auto no-scrollbar">
                  {/* Hide horizontal scrollbar for popular categories */}
                  <style>{`
                    .no-scrollbar::-webkit-scrollbar {
                      display: none;
                    }
                    .no-scrollbar {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                  `}</style>
            <div className="flex gap-6 sm:gap-8 px-2">
              {/* First set */}
              <div className="flex gap-8 flex-shrink-0">
                {categories.map((cat) => (
                  <div
                    key={cat.cat_id}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => {
                      setSelectedCategory(cat);
                      navigate('/shop');
                    }}
                  >
                    <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full bg-[#FCD770] flex items-center justify-center mb-4 overflow-hidden">
                      <img
                        src={cat.image_path || category1}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-center font-poppins font-medium text-gray-900">{cat.name}</h3>
                  </div>
                ))}
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex gap-8 flex-shrink-0">
                {categories.map((cat) => (
                  <div
                    key={`dup-${cat.cat_id}`}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => {
                      setSelectedCategory(cat);
                      navigate('/shop');
                    }}
                  >
                    <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full bg-[#FCD770] flex items-center justify-center mb-4 overflow-hidden">
                      <img
                        src={cat.image_path || category1}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-center font-poppins font-medium text-gray-900">{cat.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
      </section>

      {/* Cold Pressed Oils Section */}

{/* 
 <section>
      <h2>Products in {selectedCountry?.name}</h2>
      <div>
        {products.length === 0 ? (
          <div>No products found for this country.</div>
        ) : (
          products.map(product => (
            <div key={product.pro_id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 320 }}>
              <img
                src={product.image_url || coconutOil}
                alt={product.name}
                style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }}
              />
              <h3 style={{ margin: '8px 0 4px' }}>{product.name}</h3>
              <p style={{ color: '#666', fontSize: 14 }}>{product.description}</p>
              {product.price && (
                <div style={{ fontWeight: 700, color: '#007048', marginTop: 8 }}>
                  {selectedCountry?.currency_code || ''} {product.price}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section> */}







{/* Dynamic Products Section - Cold Pressed Oils style */}
<section className="bg-white py-12">
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section Header */}
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-2xl md:text-3xl font-bold font-poppins text-gray-900">
        Products in {selectedCountry?.name || 'Your Country'}
      </h2>
      <a 
        href="/shop" 
        className="text-orange-500 font-medium flex items-center gap-2 hover:text-orange-600 transition"
      >
        View All
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>
    </div>

    {/* Loading / No Products */}
    {loading ? (
      <div className="text-center py-10 text-gray-500">Loading products...</div>
    ) : recentProducts.length === 0 ? (
      <div className="text-center py-10 text-gray-500">No products found for this country.</div>
    ) : (
      <>
        {/* Desktop Grid */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
          {recentProducts.map((product) => (
            <div
              key={product.pro_id}
              onClick={() => navigate(`/product/${product.pro_id}`)}
              className="bg-white rounded-lg border border-gray-500 overflow-hidden hover:shadow-lg transition cursor-pointer group"
            >
              {/* Image with Hover Frame */}
              <div className="aspect-square w-full overflow-hidden bg-gray-50 relative">
                <img
                  src={getProductImageSrc(product)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <img
                  src={featureProduct}
                  alt="Frame"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                />
              </div>
              {/* Details */}
              <div className="p-4">
                <h3 className="font-semibold font-poppins text-gray-900 mb-2 text-base md:text-lg">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-poppins font-bold text-gray-900">
                    {productPrices[product.pro_id]
                      ? `${productPrices[product.pro_id].currency_code} ${productPrices[product.pro_id].price}`
                      : (selectedCountry?.currency_code || '₹') + ' ' + (product.price ?? 186.00)}
                  </span>
                </div>
                <div className="flex items-center gap-[6px]">
                  {/* Stars */}
                  <div className="flex items-center mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= getNormalizedRating(product.rating ?? product.avg_rating ?? product.average_rating ?? 0) ? 'fill-[#007048]' : 'fill-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                        
                      </div>
                  {/* Add to Cart Button */}
                  <button className="ml-auto bg-emerald-700 text-white font-poppins font-semibold text-xs py-2 px-6 rounded hover:bg-emerald-800 transition">
                    <span className="xl:hidden">ADD</span>
                    <span className="hidden xl:inline">ADD TO CART</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Mobile Carousel */}
        <div className="sm:hidden flex gap-4 overflow-x-auto scroll-smooth pb-4 px-2">
          {recentProducts.map((product) => (
            <div
              key={product.pro_id}
              onClick={() => navigate(`/product/${product.pro_id}`)}
              className="w-[130px] bg-white rounded-lg border border-gray-500 overflow-hidden hover:shadow-lg transition cursor-pointer group flex-shrink-0"

            >
              <div className="aspect-square  w-full overflow-hidden bg-gray-50 relative">
               
                <img
                  src={getProductImageSrc(product)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <img
                  src={featureProduct}
                  alt="Frame"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                />
              </div>
              <div className="p-2">
                <h3 className="font-semibold font-poppins text-gray-900 mb-1 text-sm">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-sm font-bold text-gray-900">
                    {productPrices[product.pro_id]
                      ? `${productPrices[product.pro_id].currency_code} ${productPrices[product.pro_id].price}`
                      : (selectedCountry?.currency_code || '₹') + ' ' + (product.price || '0.00')}
                  </span>
                </div>
                <div className="flex items-center gap-[4px]">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-3 h-3 ${star <= getNormalizedRating(product.rating ?? product.avg_rating ?? product.average_rating ?? 0) ? 'fill-[#007048]' : 'fill-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}

                  </div>
                  <button className="ml-auto bg-emerald-700 text-white font-poppins font-semibold text-xs py-1 px-3 rounded hover:bg-emerald-800 transition">
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
</section>
  

{/* Top Featured Products Section */}
<section  className="bg-white py-12">
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
    
    {/* Section Header */}
    <h2 className="text-2xl md:text-3xl font-bold font-poppins text-gray-900 mb-6 sm:text-center">
      Top Featured Products
    </h2>

    {/* Tabs */}
    <div className="flex flex-wrap gap-6 sm:gap-8 mb-8 border-b border-gray-200 sm:justify-center">
      <button 
        onClick={() => setActiveTab('new-arrival')}
        className={`pb-3 font-poppins font-medium ${
          activeTab === 'new-arrival' 
            ? 'text-[#007048] border-b-2 border-[#007048]' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        New Arrival
      </button>

      <button 
        onClick={() => setActiveTab('best-sellers')}
        className={`pb-3 font-poppins font-medium ${
          activeTab === 'best-sellers' 
            ? 'text-[#007048] border-b-2 border-[#007048]' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Best Sellers
      </button>

      <button 
        onClick={() => setActiveTab('featured')}
        className={`pb-3 font-poppins font-medium ${
          activeTab === 'featured' 
            ? 'text-[#007048] border-b-2 border-[#007048]' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Featured
      </button>
    </div>

    {/* ================= DESKTOP GRID (UNCHANGED) ================= */}
    <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      {isTopFeaturedReady && featuredProducts[activeTab].map((product) => (
        <div
          key={product.id}
          className="product-card bg-[#efe1cc] rounded-lg p-4 flex items-center gap-4 hover:bg-[#e8d8bc] transition relative"
        >
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              onClick={() => navigate(`/product/${product.id}`)}
              className="product-img w-full h-full object-cover rounded cursor-pointer"
            />
          </div>
          <div className="flex-1 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
            <h3 className="font-semibold font-poppins text-gray-900 mb-2">{product.name}</h3>
            <div className="flex items-center mb-1">
              {[1,2,3,4,5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${star <= getNormalizedRating(product.rating) ? 'fill-[#007048]' : 'fill-gray-300'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="product-price text-base font-poppins font-bold text-gray-900">
              {(productPrices[product.id]?.currency_code || selectedCountry?.currency_code || 'INR')} {product.price}
            </span>
          </div>
        </div>
      ))}
    </div>

    {/* ================= MOBILE CAROUSEL (NEW) ================= */}
    <div className="sm:hidden flex gap-4 overflow-x-auto scroll-smooth rtl">
      {isTopFeaturedReady && featuredProducts[activeTab].map((product) => (
        <div
          key={product.id}
          className="min-w-[220px] bg-[#efe1cc] rounded-lg p-3 flex items-center gap-3"
        >
          <div className="w-20 h-20 flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              onClick={() => navigate(`/product/${product.id}`)}
              className="w-full h-full object-cover rounded cursor-pointer"
            />
          </div>
          <div className="flex-1 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
            <h3 className="font-semibold font-poppins text-gray-900 text-sm mb-1">{product.name}</h3>
            <div className="flex items-center mb-1">
              {[1,2,3,4,5].map((star) => (
                <svg
                  key={star}
                  className={`w-3 h-3 ${star <= getNormalizedRating(product.rating) ? 'fill-[#007048]' : 'fill-gray-300'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-bold text-gray-900">
              {(productPrices[product.id]?.currency_code || selectedCountry?.currency_code || 'INR')} {product.price}
            </span>
          </div>
        </div>
      ))}
    </div>

  </div>
</section>


       {/* Traditional Process Section with Background */}
      <section className="relative w-full min-h-[350px] sm:min-h-[450px] md:min-h-[500px] overflow-hidden">
        {/* Background Image */}
        <img src={oilsImage} alt="Oil pressing process" className="absolute inset-0 w-full h-full object-cover" />
        
        {/* Green Panel Overlay at Bottom */}
        <div className="absolute bottom-0 right-0 w-full md:w-[40%] lg:w-[40%] h-[120px] md:h-[160px] lg:h-[250px]">
          <img src={home4} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center px-8 md:px-12 lg:px-20">
            <h2 className="font-poppins text-white text-base sm:text-lg md:text-xl lg:text-3xl font-bold leading-tight max-w-[90vw] sm:max-w-[80vw] md:max-w-md lg:max-w-lg text-center">
              We Use <span className="text-[#FFA500]">100%</span> Pure Traditional Indian Process for coldpressing Our Oils
            </h2>
          </div>
        </div>
      </section> 

       {/* Promotional Deals Section */}
<section className="bg-white py-12">
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

    {/* Grid stays SAME for desktop */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mobile-slider">

      {/* Deal 1 */}
      <div
        className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] rounded overflow-hidden group cursor-pointer mobile-slide"
        style={{ backgroundImage: `url(${sale1})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="absolute inset-0 flex flex-col justify-start p-3 sm:p-4 md:p-6 text-white">
          <div className="flex flex-col justify-center items-center mb-3 sm:mb-4 md:mb-6">
            <p className="text-xs tracking-widest font-poppins font-semibold">BEST DEALS</p>
            <h3 className="text-lg sm:text-2xl md:text-3xl font-bold font-poppins mt-2 text-center">
              Sale of the Month
            </h3>
          </div>

          {/* Countdown Added Back */}
          <div>
            <div className="flex gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 justify-center text-sm sm:text-base">
              <div className="text-center">
                <p className="text-sm sm:text-xl md:text-2xl font-poppins">00</p>
                <p className="text-xs font-poppins tracking-widest">DAYS</p>
              </div>
              <span className="text-sm sm:text-xl md:text-2xl font-poppins">:</span>
              <div className="text-center">
                <p className="text-sm sm:text-xl md:text-2xl font-poppins">02</p>
                <p className="text-xs font-poppins tracking-widest">HOURS</p>
              </div>
              <span className="text-sm sm:text-xl md:text-2xl font-poppins">:</span>
              <div className="text-center">
                <p className="text-sm sm:text-xl md:text-2xl font-poppins">18</p>
                <p className="text-xs font-poppins tracking-widest">MINS</p>
              </div>
              <span className="text-sm sm:text-xl md:text-2xl font-poppins">:</span>
              <div className="text-center">
                <p className="text-sm sm:text-xl md:text-2xl font-poppins">46</p>
                <p className="text-xs font-poppins tracking-widest">SECS</p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => navigate('/shop')}
                className="bg-white text-[#007048] px-4 sm:px-6 py-1 sm:py-2 rounded-full font-poppins font-semibold text-sm sm:text-base flex items-center gap-2 hover:bg-gray-100 transition"
              >
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deal 2 */}
      <div
        className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] rounded overflow-hidden group cursor-pointer mobile-slide"
        style={{ backgroundImage: `url(${sale2})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="absolute inset-0 flex flex-col justify-start p-3 sm:p-4 md:p-6 text-white">
          <div className="flex flex-col justify-center items-center mb-3 sm:mb-4 md:mb-6">
            <p className="text-xs tracking-widest font-poppins font-semibold">
              85% FAT FREE
            </p>
            <h3 className="text-lg sm:text-2xl md:text-3xl font-poppins font-bold mt-2 text-center">
              Freshly Made
            </h3>
          </div>

          {/* Price + Button Added Back */}
          <div className="mb-4">
            <p className="text-xs sm:text-sm text-center font-poppins mb-3 sm:mb-4">
              Started at{" "}
              <span className="text-base sm:text-lg md:text-xl font-bold text-[#FF8A00]">
                ₹179.99
              </span>
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => navigate('/shop')}
                className="bg-white text-[#007048] px-4 sm:px-6 py-1 sm:py-2 rounded-full font-poppins font-semibold text-sm sm:text-base hover:bg-gray-100 transition"
              >
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deal 3 */}
      <div
        className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] rounded overflow-hidden group cursor-pointer mobile-slide"
        style={{ backgroundImage: `url(${sale3})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="absolute inset-0 flex flex-col justify-start p-3 sm:p-4 md:p-6 text-white">
          <div className="flex flex-col justify-center items-center mb-3 sm:mb-4 md:mb-6">
            <p className="text-xs tracking-widest font-poppins font-semibold">
              SUMMER SALE
            </p>
            <h3 className="text-lg sm:text-2xl md:text-3xl font-poppins font-bold mt-2 text-center">
              Organic made
            </h3>
          </div>

          {/* Offer + Button Added Back */}
          <div className="mb-3 flex flex-col items-center">
            <p className="text-xs sm:text-sm text-center font-poppins mb-3 sm:mb-4">
              Up to{" "}
              <span className="bg-white px-2 py-1 rounded font-poppins text-[#007048] text-xs sm:text-sm">
                64% OFF
              </span>
            </p>

            <button
              onClick={() => navigate('/shop')}
              className="bg-white text-[#007048] px-4 sm:px-6 py-1 sm:py-2 rounded-full font-poppins font-semibold text-sm sm:text-base hover:bg-gray-100 transition"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
      
      

 {/* Latest News Section */}
      <section className="py-15 px-4 sm:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-poppins font-bold mb-12">Latest News</h2>
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            


{blogs.slice(0,3).map((blog) => {

  {/* console.log("Blog image path:", blog.image1);   // 👈 yaha add karo */}

  return (
    <div key={blog.id} className="bg-white rounded overflow-hidden hover:shadow-lg transition">

      <div className="relative h-64 overflow-hidden">
        <img
          src={blog.image1}
          alt={blog.title}
          className="w-full h-full object-cover"
        />

        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded text-center shadow-md">
          <p className="text-2xl font-bold">
            {new Date(blog.created_at).getDate()}
          </p>
          <p className="text-xs font-semibold">
            {new Date(blog.created_at)
              .toLocaleString('default',{month:'short'})
              .toUpperCase()}
          </p>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {blog.title}
        </h3>

        <a
          href={`/blog/${blog.id}`}
          className="text-[#007048] font-semibold flex items-center gap-2"
        >
          Read More →
        </a>
      </div>

    </div>
  );
})}


            
          </div>
          
          {/* Mobile Carousel */}
    <div className="sm:hidden overflow-hidden relative">
      <div className="flex gap-4 animate-news-slide">


{blogs.slice(0,3).map((blog) => {

  console.log("Mobile blog image:", blog.image1);

  return (
    <div key={blog.id} className="min-w-[90%] bg-white rounded shadow-md">

      <div className="relative h-44 overflow-hidden">
        <img
          src={blog.image1}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold mb-3">
          {blog.title}
        </h3>

        <Link
          to={`/blog/${blog.id}`}
          className="text-[#007048] font-semibold flex items-center gap-2"
        >
          Read More →
        </Link>
      </div>

    </div>
  );
})}

        
      </div>
    </div>
        </div>
      </section>












{/* Testimonials Section */}
<section className="py-20 px-4 sm:px-8 lg:px-16 bg-gray-50">
  <div className="max-w-7xl mx-auto">



    <div className="flex justify-between items-center mb-10">
      <h2 className="text-3xl font-poppins font-bold">What Our Customer Says</h2>
      <div className="flex gap-3">
        <button 
          onClick={() => scrollLeft()}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#007048] hover:border-[#007048] transition disabled:opacity-40"
          disabled={isAtStart}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          onClick={() => scrollRight()}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#007048] hover:border-[#007048] transition disabled:opacity-40"
          disabled={isAtEnd}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    {/* Carousel Wrapper - hidden on mobile */}





 <div className="relative overflow-hidden testimonial-perspective hidden md:block">
      <div 
        ref={carouselRef}
        className="flex transition-transform duration-500 ease-out "
        style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
      >
        {loading ? (
          <div>Loading testimonials...</div>
        ) : (
          reviews.map((review, idx) => (
            <div 
              key={review.id || idx} 
              // className="flex-shrink-0 mt-7  w-full mb-5 ml-[-15px]  w-[444px] h-[250px] border-b-2 border-gray-300 testimonial-card-3d"
              // className="min-w-[32%] max-w-[95%] h-44 snap-center bg-white p-4 rounded-xl shadow-md flex flex-col justify-between flex-shrink-0 mt-7  w-full mb-5 ml-[-15px]  w-[444px] h-[250px] border-b-2 border-gray-300 testimonial-card-3d"
              className="min-w-[2%] max-w-[95%] h-44 flex-col justify-between flex-shrink-0 mt-7  mb-5 ml-[-15px]  w-[444px] h-[250px] border-b-2 border-gray-300 testimonial-card-3d"



            >
              <div className="bg-white p-4 md:p-6 mt-2 mb-2 rounded-xl border border-gray-200 h-full flex flex-col justify-between testimonial-card-3d">
                <svg className="mb-3" width="44" height="32" viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 20.5714C0 9.25714 6.85714 2.14286 17.9143 0L21.4286 7.14286C12.1429 10.0571 11.1429 15.9143 10.6571 19.5714H23.5714V40H0V20.5714ZM30.4286 20.5714C30.4286 9.25714 37.2857 2.14286 48.3429 0L51.8571 7.14286C42.5714 10.0571 41.5714 15.9143 41.0857 19.5714H54V40H30.4286V20.5714Z" fill="#FF8A47"/>
                </svg>
                <p className="text-gray-600 font-poppins mb-6 leading-relaxed text-sm flex-grow">
                  {review.comment}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#007048] flex items-center justify-center font-poppins font-semibold text-lg avatar-3d">
                      {getCustomerInitial(review.customer)}
                    </div>
                    <div>
                      <p className="font-poppins font-semibold text-gray-800">{review.customer}</p>
                      <p className="text-sm text-gray-500 font-poppins">Customer</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        width="18" 
                        height="18" 
                        viewBox="0 0 18 18" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className={i < review.rating ? "text-[#FF8A00]" : "text-gray-300"}
                      >
                        <path 
                          d="M9 1.5L11.3175 6.195L16.5 6.9525L12.75 10.605L13.635 15.765L9 13.3275L4.365 15.765L5.25 10.605L1.5 6.9525L6.6825 6.195L9 1.5Z" 
                          fill="currentColor" 
                          stroke="currentColor" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  







          {/* ================= MOBILE CAROUSEL ================= */}

<div className="md:hidden overflow-hidden relative">
  <div className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar">
    {loading ? (
      <div>Loading testimonials...</div>
    ) : (
      reviews.map((review, idx) => (
        <div
          key={review.id || idx}
          className="min-w-[86%] h-[200px]  snap-center bg-white p-3 rounded-lg shadow-sm"

        >

<svg className="mb-3" width="44" height="32" viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 20.5714C0 9.25714 6.85714 2.14286 17.9143 0L21.4286 7.14286C12.1429 10.0571 11.1429 15.9143 10.6571 19.5714H23.5714V40H0V20.5714ZM30.4286 20.5714C30.4286 9.25714 37.2857 2.14286 48.3429 0L51.8571 7.14286C42.5714 10.0571 41.5714 15.9143 41.0857 19.5714H54V40H30.4286V20.5714Z" fill="#FF8A47"/>
                </svg>

          {/* Review Comment */}
          <p className="text-gray-600 text-sm mb-4">
            {review.comment}
          </p>

          {/* Customer + Stars Row */}
          <div className="flex items-center justify-between">
            
            {/* Customer Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#007048] flex items-center justify-center font-poppins font-semibold text-sm">
                {getCustomerInitial(review.customer)}
              </div>
              <div>
                <p className="text-sm font-semibold">{review.customer}</p>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
            </div>

            {/* Review Stars */}
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={
                    i < Number(review.rating)
                      ? "text-[#FF8A00]"
                      : "text-gray-300"
                  }
                >
                  <path
                    d="M9 1.5L11.3175 6.195L16.5 6.9525L12.75 10.605L13.635 15.765L9 13.3275L4.365 15.765L5.25 10.605L1.5 6.9525L6.6825 6.195L9 1.5Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ))}
            </div>

          </div>
        </div>
      ))
    )}
  </div>
</div>














          {/* Contact & Newsletter Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Location Info */}
            <div className="hidden md:block bg-white p-4 rounded-lg border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 13.5C13.6569 13.5 15 12.1569 15 10.5C15 8.84315 13.6569 7.5 12 7.5C10.3431 7.5 9 8.84315 9 10.5C9 12.1569 10.3431 13.5 12 13.5Z" stroke="#00B207" strokeWidth="1.5"/>
                  <path d="M12 21C16 17 19.5 13.5 19.5 10.5C19.5 6.35786 16.1421 3 12 3C7.85786 3 4.5 6.35786 4.5 10.5C4.5 13.5 8 17 12 21Z" stroke="#00B207" strokeWidth="1.5"/>
                </svg>
              </div>
              <h3 className="text-xs font-poppins font-semibold tracking-widest text-gray-800 mb-2">OUR LOCATION</h3>
              <p className="text-sm text-gray-600 font-poppins leading-relaxed">1901 Thornridge Cir. Shiloh, Washington DC 20020, United States</p>
            </div>

            {/* Call Us */}
            <div className="hidden md:block bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.9997 16.9201V19.9201C22.0006 20.1986 21.9434 20.4743 21.8319 20.7294C21.7203 20.9846 21.5567 21.2137 21.352 21.402C21.1472 21.5902 20.9058 21.7336 20.6421 21.8228C20.3783 21.912 20.0983 21.9452 19.8197 21.9201C16.7428 21.5857 13.7869 20.5342 11.1897 18.8501C8.77376 17.3148 6.72527 15.2663 5.18974 12.8501C3.49969 10.2413 2.44824 7.27109 2.11974 4.1801C2.09477 3.90356 2.12763 3.62486 2.21639 3.36172C2.30515 3.09859 2.44762 2.85679 2.63482 2.65172C2.82202 2.44665 3.04986 2.28281 3.30385 2.17062C3.55783 2.05843 3.8324 2.00036 4.10974 2.0001H7.10974C7.59513 1.99532 8.06579 2.16718 8.43376 2.48363C8.80173 2.80008 9.04207 3.23954 9.10974 3.7201C9.23654 4.68016 9.47138 5.62282 9.80974 6.5301C9.94373 6.88802 9.97077 7.27701 9.88737 7.65098C9.80398 8.02494 9.61363 8.36821 9.33974 8.6401L8.08974 9.8901C9.51349 12.3892 11.6106 14.4863 14.1097 15.9101L15.3597 14.6601C15.6316 14.3862 15.9749 14.1959 16.3488 14.1125C16.7228 14.0291 17.1118 14.0561 17.4697 14.1901C18.377 14.5285 19.3197 14.7633 20.2797 14.8901C20.7658 14.9586 21.2094 15.2033 21.5265 15.5776C21.8437 15.9519 22.0122 16.4297 21.9997 16.9201Z" stroke="#00B207" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xs font-poppins font-semibold tracking-widest text-gray-800 mb-2">CALL US 24/7</h3>
              <p className="text-2xl text-[#007048] font-poppins font-semibold">(303) 555-0105</p>
            </div>

            
{/* Newsletter */}
<div className="hidden md:block bg-white p-6 sm:p-8 rounded-lg border border-gray-200 w-full">
  {/* Icon */}
  <div className="w-16 h-16 sm:w-10 sm:h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-4">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
        stroke="#00B207" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 6L12 13L2 6"
        stroke="#00B207" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>

  {/* Title */}
  <h3 className="text-xs sm:text-sm font-poppins font-semibold tracking-widest text-gray-800 mb-4">
    LEAVE A COMMENT
  </h3>

  {/* Form */}
  <form onSubmit={handleCommentSubmit}>
    <div className="flex flex-col sm:flex-row gap-3 items-center">
      <div className="flex-1 w-full flex flex-col gap-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-1/2 px-3 py-1 border border-gray-300 rounded-lg text-xs font-poppins focus:outline-none focus:border-[#007048]"
        />
        <textarea
          rows="3"
          placeholder="Description"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-poppins focus:outline-none focus:border-[#007048]"
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        {/* Rating Stars */}
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              onClick={() => setRating(star)}
              className={`w-4 h-4 cursor-pointer transition ${star <= rating ? 'fill-[#FFD700]' : 'fill-gray-300'}`}
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          ))}
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto bg-[#007048] text-white px-6 py-3 rounded-full font-poppins font-semibold text-sm hover:bg-[#005a38] transition"
        >
          Submit
        </button>
      </div>
    </div>
  </form>
</div>

        
        {/* ================= MOBILE CAROUSEL ================= */}
  <div className="md:hidden overflow-x-auto flex gap-4 snap-x snap-mandatory scroll-smooth no-scrollbar">

    {/* Location Info */}
    <div className="min-w-[85%] snap-center bg-white p-4 rounded-lg border border-gray-200">
      <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 13.5C13.6569 13.5 15 12.1569 15 10.5C15 8.84315 13.6569 7.5 12 7.5C10.3431 7.5 9 8.84315 9 10.5C9 12.1569 10.3431 13.5 12 13.5Z" stroke="#00B207" strokeWidth="1.5"/>
          <path d="M12 21C16 17 19.5 13.5 19.5 10.5C19.5 6.35786 16.1421 3 12 3C7.85786 3 4.5 6.35786 4.5 10.5C4.5 13.5 8 17 12 21Z" stroke="#00B207" strokeWidth="1.5"/>
        </svg>
      </div>
      <h3 className="text-xs font-semibold tracking-widest text-gray-800 mb-2">
        OUR LOCATION
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed">
        1901 Thornridge Cir. Shiloh, Washington DC 20020, United States
      </p>
    </div>

    {/* Call Us */}
    <div className="min-w-[85%] snap-center bg-white p-4 rounded-lg border border-gray-200">
      <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21.9997 16.9201V19.9201C22.0006 20.1986 21.9434 20.4743 21.8319 20.7294C21.7203 20.9846 21.5567 21.2137 21.352 21.402C21.1472 21.5902 20.9058 21.7336 20.6421 21.8228C20.3783 21.912 20.0983 21.9452 19.8197 21.9201C16.7428 21.5857 13.7869 20.5342 11.1897 18.8501C8.77376 17.3148 6.72527 15.2663 5.18974 12.8501C3.49969 10.2413 2.44824 7.27109 2.11974 4.1801C2.09477 3.90356 2.12763 3.62486 2.21639 3.36172C2.30515 3.09859 2.44762 2.85679 2.63482 2.65172C2.82202 2.44665 3.04986 2.28281 3.30385 2.17062C3.55783 2.05843 3.8324 2.00036 4.10974 2.0001H7.10974C7.59513 1.99532 8.06579 2.16718 8.43376 2.48363C8.80173 2.80008 9.04207 3.23954 9.10974 3.7201C9.23654 4.68016 9.47138 5.62282 9.80974 6.5301C9.94373 6.88802 9.97077 7.27701 9.88737 7.65098C9.80398 8.02494 9.61363 8.36821 9.33974 8.6401L8.08974 9.8901C9.51349 12.3892 11.6106 14.4863 14.1097 15.9101L15.3597 14.6601C15.6316 14.3862 15.9749 14.1959 16.3488 14.1125C16.7228 14.0291 17.1118 14.0561 17.4697 14.1901C18.377 14.5285 19.3197 14.7633 20.2797 14.8901C20.7658 14.9586 21.2094 15.2033 21.5265 15.5776C21.8437 15.9519 22.0122 16.4297 21.9997 16.9201Z" stroke="#00B207" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="text-xs font-semibold tracking-widest text-gray-800 mb-2">
        CALL US 24/7
      </h3>
      <p className="text-xl text-[#007048] font-semibold">
        (303) 555-0105
      </p>
    </div>

    {/* Newsletter */}
    <div className="min-w-[85%] snap-center bg-white p-4 rounded-lg border border-gray-200">
      <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-3">
        {/* <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 4H20..." stroke="#00B207" strokeWidth="1.5"/>
        </svg> */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
            stroke="#00B207" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 6L12 13L2 6"
            stroke="#00B207" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h3 className="text-xs font-semibold tracking-widest text-gray-800 mb-3">
         LEAVE A COMMENT
      </h3>

      {/* <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Description"
          className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#007048]"
        />
        <button className="bg-[#007048] text-white py-2 rounded-full text-sm font-semibold hover:bg-[#005a38] transition">
          Subscribe
        </button>
      </div> */}


<form className="flex flex-col gap-2">

  {/* Name + Rating in same row */}
  <div className="flex items-center gap-3">

    <input
      type="text"
      placeholder="Name"
      className="w-40 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#007048]"
    />

    {/* Rating Stars */}
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => setRating(star)}
          className={`w-4 h-4 cursor-pointer transition ${
            star <= rating ? "fill-[#FFD700]" : "fill-gray-300"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>

  </div>

  {/* Description */}
  <input
    type="text"
    placeholder="Description"
    className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#007048]"
  />

  <button
    type="submit"
    className="bg-[#007048] text-white py-2 rounded-full text-sm font-semibold hover:bg-[#005a38] transition"
  >
    Submit
  </button>

</form>



    </div>

  </div>


          </div>
        </div>
      </section>
    </div>
  );
}
