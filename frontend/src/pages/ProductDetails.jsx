// src/pages/ProductDetails.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CountryContext } from '../context/CountryContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import organicOil from '../assets/organic oil.jpg';
import coconutOil from '../assets/coconut oils.jpg';
import oilsImage from '../assets/oils.jpg';
import productVideo from '../assets/product_video.webm';
import featureProduct from '../assets/feature.png';
import { API_BASE_URL } from '../config';

export default function ProductDetails() {
  // Use id from URL params for dynamic product fetching
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('descriptions');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
      const [name, setName] = useState('');
    
  




   const { selectedCountry } = useContext(CountryContext);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

 const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [price, setPrice] = useState(null);



  const [testimonials, setTestimonials] = useState([]);
  const [reviews, setReviews] = useState([]);


  const [relatedProducts, setRelatedProducts] = useState([]);



// Fetch product details by country and id
useEffect(() => {
  if (!selectedCountry || !id) return;
  fetch(`${API_BASE_URL}/api/products/country/${selectedCountry.country_id}`)
    .then(res => res.json())
    .then(data => {
      // Find product by pro_id (or id)
      const found = data.find(p => String(p.pro_id) === String(id));
      setProduct(found || null);
    })
    .catch(() => {
      setError('Failed to load product details');
    });
}, [id, selectedCountry]);











useEffect(() => {
  if (!selectedCountry || !product) return;

  fetch(`${API_BASE_URL}/api/products/country/${selectedCountry.country_id}`)
    .then(res => res.json())
    .then(data => {

      // same category ke products filter karo
      const filtered = data.filter(
        p =>
          p.category_id === product.category_id &&
          String(p.pro_id) !== String(id)
      );

      setRelatedProducts(filtered.slice(0, 4)); // max 4 products
    })
    .catch(err => console.error(err));

}, [product, selectedCountry, id]);
























 // Fetch all variants for the product
  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE_URL}/api/product_variants/${id}`)
      .then(res => res.json())
      .then(data => {
        setVariants(data);
        if (data.length > 0) setSelectedVariant(data[0]);
      })
      .catch(() => {
        setError('Failed to load variants');
      });
  }, [id]);







   // Fetch price for the selected variant and country
  useEffect(() => {
    if (!selectedVariant || !selectedCountry) return;
    fetch(`${API_BASE_URL}/api/variant_prices/${selectedVariant.pro_var_id}`)
      .then(res => res.json())
      .then(data => {
        const priceForCountry = data.find(p => p.country_id === selectedCountry.country_id);
        setPrice(priceForCountry);
      })
      .catch(() => {
        setError('Failed to load price');
      });
  }, [selectedVariant, selectedCountry]);





  // Reset state when product id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);




useEffect(() => {
  if (!product) return;
  fetch(`${API_BASE_URL}/api/testimonials?product_id=${product?.pro_id || product?.id}`)
    .then((res) => res.json())
    .then((data) => setTestimonials(Array.isArray(data) ? data : []))
    .catch((err) => console.error(err));
}, [product]);

useEffect(() => {
  fetch(`${API_BASE_URL}/api/reviews`)
    .then((res) => res.json())
    .then((data) => setReviews(Array.isArray(data) ? data : []))
    .catch((err) => console.error(err));
}, []);



  const handleQuantityChange = (type) => {
    const stockCandidates = [
      selectedVariant?.available_stock,
      selectedVariant?.product_stock,
      selectedVariant?.quantity,
      selectedVariant?.qty,
      selectedVariant?.available_quantity,
      selectedVariant?.stock,
      product?.stocks,
      product?.available_stock,
      product?.quantity,
      product?.qty,
      product?.available_quantity,
    ];
    const variantStockValue = stockCandidates.find((value) => Number.isFinite(Number(value)));
    const availableStock = Number(variantStockValue ?? 0);

    if (type === 'increase') {
      if (availableStock > 0) {
        setQuantity((currentQuantity) => Math.min(currentQuantity + 1, availableStock));
      }
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const _discountPercentage = product && product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;





    // Handler to change selected variant
  const _handleVariantChange = (e) => {
    const v = variants.find(v => v.pro_var_id === parseInt(e.target.value, 10));
    setSelectedVariant(v);
    setQuantity(1);
  };





if (error) return <div>{error}</div>;





// console.log('selectedVariant:', selectedVariant);
// console.log('selectedCountry:', selectedCountry);
// console.log('price:', price);

// console.log('product:', product);

const resolveVideoUrl = (value) => {
  if (!value) return '';
  if (value.startsWith('data:') || value.startsWith('blob:')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
};

const resolveImageUrl = (value) => {
  if (!value) return coconutOil;
  if (value.startsWith('data:') || value.startsWith('blob:')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
};

const getYouTubeEmbedUrl = (value) => {
  if (!value) return '';
  const watchMatch = value.match(/(?:youtube\.com\/watch\?v=)([^&]+)/i);
  if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortsMatch = value.match(/(?:youtube\.com\/shorts\/)([^?&/]+)/i);
  if (shortsMatch?.[1]) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  const shortMatch = value.match(/(?:youtu\.be\/)([^?&]+)/i);
  if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const embedMatch = value.match(/youtube\.com\/embed\/([^?&]+)/i);
  if (embedMatch?.[1]) return value;
  return '';
};

const resolvedVideoUrl = resolveVideoUrl(product?.video_url);
const youtubeEmbedUrl = getYouTubeEmbedUrl(resolvedVideoUrl);
const stockCandidates = [
  selectedVariant?.available_stock,
  selectedVariant?.product_stock,
  selectedVariant?.quantity,
  selectedVariant?.qty,
  selectedVariant?.available_quantity,
  selectedVariant?.stock,
  product?.stocks,
  product?.available_stock,
  product?.quantity,
  product?.qty,
  product?.available_quantity,
];
const variantStockValue = stockCandidates.find((value) => Number.isFinite(Number(value)));
const availableStock = Number(variantStockValue ?? 0);
const isOutOfStock = availableStock <= 0;
const effectiveQuantity = isOutOfStock ? 1 : Math.min(Math.max(quantity, 1), Math.max(availableStock, 1));
const normalizedProductName = String(product?.name || '').trim().toLowerCase();
const matchedProductReviews = normalizedProductName
  ? reviews.filter((review) => String(review?.product || '').trim().toLowerCase() === normalizedProductName)
  : [];
const fallbackProductReviewCount = Math.max(
  0,
  Number(product?.reviews ?? product?.review_count ?? product?.reviews_count ?? product?.total_reviews ?? product?.rating_count ?? 0)
);
const exactProductReviewCount = matchedProductReviews.length;
const exactAverageRating = exactProductReviewCount > 0
  ? matchedProductReviews.reduce((sum, review) => sum + Number(review?.rating || 0), 0) / exactProductReviewCount
  : null;
const productRating = Math.max(
  0,
  Math.min(5, Math.round(Number(exactAverageRating ?? product?.rating ?? 0)))
);
const productReviewCount = exactProductReviewCount > 0 ? exactProductReviewCount : fallbackProductReviewCount;
const isLoading = Boolean(
  !error && (
    !selectedCountry ||
    !product ||
    String(product?.pro_id || product?.id || '') !== String(id) ||
    !selectedVariant ||
    String(selectedVariant?.product_id || '') !== String(id) ||
    !price
  )
);

if (isLoading) return <div>Loading...</div>;
if (!selectedVariant) return <div>No variant found for this product.</div>;





  const handleCommentSubmit = async (e) => {
  e.preventDefault();

  // console.log("Submitting review for product:", product); // Debug line

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
        product_id: Number(product?.pro_id || product?.id),
      }),
    });

    if (res.ok) {
      alert("✅ Review submitted successfully!");
      setName("");
      setComment("");
      setRating(0);
      // Refresh testimonials for this product
      if (product?.pro_id || product?.id) {
        fetch(`${API_BASE_URL}/api/testimonials?product_id=${product?.pro_id || product?.id}`)
          .then((res) => res.json())
          .then((data) => setTestimonials(Array.isArray(data) ? data : []));
      }
    } else {
      alert("❌ Something went wrong!");
    }

  } catch (err) {
    alert("❌ Server error!");
    console.error(err);
  }
};



  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4 px-4 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm font-poppins">
            <button onClick={() => navigate('/')} className="text-gray-600 hover:text-emerald-700">Home</button>
            <span className="text-gray-400">/</span>
            <button onClick={() => navigate('/shop')} className="text-gray-600 hover:text-emerald-700">Shop</button>
            <span className="text-gray-400">/</span>
            <span className="text-emerald-700 font-medium font-poppins">{product ? product.name : ''}</span>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="py-12 px-4 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Product Images - Left Side with Vertical Thumbnails */}
            <div className="flex flex-row gap-4">
  {/* Thumbnail Images - Vertical, always left */}
  <div className="flex flex-col gap-3 flex-shrink-0">
    {[
      product?.image_1 || organicOil,
      product?.image_2 || coconutOil,
      product?.image_3 || oilsImage
    ].map((image, index) => (
      <button
        key={index}
        onClick={() => setSelectedImage(index)}
        className={`w-16 h-16 overflow-hidden rounded-lg border-2 ${
          selectedImage === index ? 'border-emerald-700' : 'border-gray-200'
        } hover:border-emerald-500 transition`}
      >
        <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
      </button>
    ))}
  </div>
              {/* Main Image */}
              <div className="flex-1 aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img
                  src={[
                    product?.image_1 || organicOil,
                    product?.image_2 || coconutOil,
                    product?.image_3 || oilsImage
                  ][selectedImage]}
                  alt={product ? product.name : "Product"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Info - Right Side */}
            <div className="space-y-5">
              {/* Product Name */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-1xl md:text-2xl font-bold font-poppins text-gray-900">{product?.name}</h1>
              </div>

              {/* Rating and Reviews */}

              <div className="flex items-center gap-3 font-poppins">

                {product && (
  <div className="flex items-center gap-1 mb-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`w-3.5 h-3.5 ${star <= productRating ? 'fill-[#FF8A00]' : 'fill-gray-300'}`}
        viewBox="0 0 20 20"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ))}
    {productReviewCount > 0 && (
      <span className="text-sm text-poppins text-gray-500 ml-1">
        {productReviewCount} Review{productReviewCount === 1 ? '' : 's'}
      </span>
    )}
  </div>
)}


                      
                {/* You can add reviews if you fetch them */}
                {/* <span className="text-gray-400">•</span>
                <span className="text-1xl text-gray-600">SKU: <span className="text-1xl text-gray-900">{selectedVariant?.sku}</span></span> */}
              </div>

              {/* Price */}

              <div className="flex items-center gap-3 font-poppins">
                {/* If you have original price, show it here */}
                {/* <span className="text-gray-400 line-through text-lg">{originalPrice ? `₹${originalPrice.toFixed(2)}` : ''}</span> */}
                <span className="text-2xl font text-[#2C742F]">
                  {price ? `${price.currency_code} ${price.price}` : 'N/A'}
                </span>
              </div>

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* Brand and Share */}
              <div className="flex items-center justify-between font-poppins">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm ">Brand:</span>
                  <div className="flex flex-col items-center gap-1 px-2 py-1.5 border border-gray-300 rounded-lg">
                    <svg width="32" height="13" viewBox="0 0 32 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.13333 6.09503C17.2644 -6.50258 31.2617 6.09504 31.2617 6.09504C31.2617 6.09504 17.2644 18.6927 5.13333 6.09503Z" fill="#36C63F"/>
                      <path d="M22.8938 11.2895C27.954 9.70077 31.4454 6.5927 31.5916 6.46113L32 6.09351L31.5916 5.72588C31.4454 5.59432 27.954 2.48618 22.8938 0.897488C19.902 -0.0417661 16.9897 -0.245017 14.2377 0.293485C10.858 0.954737 7.72564 2.73987 4.92432 5.59888L2.87974e-07 5.59888L2.44735e-07 6.58807L4.92432 6.58807C7.7257 9.44708 10.8579 11.2322 14.2377 11.8935C16.9897 12.4319 19.9021 12.2287 22.8938 11.2895ZM14.4097 10.9193C11.5163 10.3494 8.80595 8.89402 6.33845 6.58807L13.3259 6.58807L15.9805 9.24271L16.6798 8.54327L14.7247 6.58813L20.5294 6.58814L20.5294 5.59894L17.0575 5.59894L19.0127 3.64375L18.3133 2.94437L15.6587 5.59894L10.992 5.59894L12.4806 4.11031L11.7812 3.41093L9.59314 5.59901L6.33839 5.59901C8.80595 3.29306 11.5163 1.83762 14.4097 1.26774C16.9942 0.758737 19.7388 0.94855 22.5674 1.83187C26.4272 3.03725 29.4068 5.22644 30.4887 6.09357C29.4067 6.96076 26.4272 9.14983 22.5674 10.3553C19.7389 11.2385 16.9942 11.4283 14.4097 10.9193Z" fill="#009F06"/>
                      <path opacity="0.3" d="M22.3945 6.58676L22.3945 5.59766L21.4615 5.59766L21.4615 6.58676L22.3945 6.58676Z" fill="white"/>
                      <path opacity="0.2" d="M24.2617 6.58676L24.2617 5.59766L23.3287 5.59766L23.3287 6.58676L24.2617 6.58676Z" fill="#1A1A1A"/>
                    </svg>
                    <span className="text-xs font-medium italic text-gray-700">{product?.brand}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 font">Share item:</span>
                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 rounded-full hover:bg-[#009606] flex items-center justify-center transition">
                      <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                    <button className="w-9 h-9 rounded-full hover:bg-[#009606] flex items-center justify-center transition">
                      <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </button>
                    <button className="w-9 h-9 rounded-full hover:bg-[#009606] flex items-center justify-center transition">
                      <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                      </svg>
                    </button>
                    <button className="w-9 h-9 rounded-full hover:bg-[#009606] flex items-center justify-center transition">
                      <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed font-poppins">
                {product?.description}
              </p>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-2 font-poppins">
                <div className="flex items-center h-14 px-4 border border-gray-300 bg-white rounded-full">
                  <button
                    onClick={() => handleQuantityChange('decrease')}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition text-gray-700 text-xl rounded-full"
                  >
                    −
                  </button>
                  <span className="w-14 flex items-center justify-center font-semibold text-gray-900 text-lg">
                    {effectiveQuantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange('increase')}
                    disabled={isOutOfStock || effectiveQuantity >= availableStock}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition text-gray-700 text-xl rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={() => {
                    if (!product || isOutOfStock || effectiveQuantity > availableStock) return;
                    const productId = product.pro_id || product.id;
                    const cartProduct = {
                      id: productId,
                      name: product.name,
                      image: resolveImageUrl(product.image_1 || product.image_url || product.image_2 || product.image_3),
                      price: Number(price?.price || product?.price || 0),
                      currency_code: price?.currency_code || selectedCountry?.currency_code || 'INR',
                      country_id: selectedCountry?.country_id,
                      product_variant_id: selectedVariant?.pro_var_id,
                      variant_sku: selectedVariant?.sku,
                      variant_label: selectedVariant?.variant_label,
                    };
                    addToCart(cartProduct, effectiveQuantity);
                  }}
                  disabled={isOutOfStock || effectiveQuantity > availableStock}
                  className="flex-1 h-14 bg-[#007048] text-white font-semibold text-base px-4 rounded-full hover:bg-[#005a3c] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    const productId = product?.pro_id || product?.id;
                    if (!productId) return;

                    if (isInWishlist(productId)) {
                      removeFromWishlist(productId);
                      return;
                    }

                    const imageUrl = resolveImageUrl(product?.image_1 || product?.image_url || product?.image_2 || product?.image_3);

                    addToWishlist({
                      id: productId,
                      name: product?.name,
                      price: Number(price?.price || product?.price || 0),
                      image: imageUrl,
                      currency_code: price?.currency_code || selectedCountry?.currency_code || 'INR',
                    });
                  }}
                  className={`w-14 h-14 flex items-center justify-center rounded-full transition ${
                    isInWishlist(product?.pro_id || product?.id)
                      ? 'bg-red-50 hover:bg-red-100'
                      : 'bg-green-50 hover:bg-green-100'
                  }`}
                  aria-label={isInWishlist(product?.pro_id || product?.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <svg
                    className={`w-6 h-6 ${isInWishlist(product?.pro_id || product?.id) ? 'text-red-500' : 'text-gray-700'}`}
                    fill={isInWishlist(product?.pro_id || product?.id) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* Category */}
              <div className="flex items-start gap-2 font-poppins">
                <span className="text-gray-600 font-medium min-w-[80px]">Category:</span>
                <span className="text-gray-900">{selectedVariant?.category_name || 'N/A'}</span>
              </div>

              {/* Variant Selector */}
              <div className="flex flex-col gap-2 font-poppins">
                <label className="text-sm md:text-base text-gray-600 font-medium">Variant:</label>
                <select
                  value={selectedVariant?.pro_var_id || ''}
                  onChange={(e) => {
                    const variant = variants.find(v => v.pro_var_id === parseInt(e.target.value, 10));
                    if (variant) {
                      setSelectedVariant(variant);
                      setQuantity(1);
                    }
                  }}
                  className="w-full px-2 md:px-4 py-1 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:border-[#007048] focus:ring-2 focus:ring-[#007048] focus:ring-opacity-20"
                >
                  {variants.map((v) => (
                    <option key={v.pro_var_id} value={v.pro_var_id}>
                      {v.variant_label} - {v.weight_grams}{v.unit || 'g'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Information Tabs */}
          <div className="mt-16">
            {/* Tabs Navigation */}
            <div className="flex justify-center gap-8 border-b-2 border-gray-200 mb-8">
              <button
                onClick={() => setActiveTab('descriptions')}
                className={`pb-4 px-2 font-poppins font transition relative ${
                  activeTab === 'descriptions'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Descriptions
                {activeTab === 'descriptions' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2C742F]"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('additional')}
                className={`pb-4 px-2 font-poppins font transition relative ${
                  activeTab === 'additional'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Additional Information
                {activeTab === 'additional' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2C742F]"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`pb-4 px-2 font-poppins font transition relative ${
                  activeTab === 'feedback'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Customer Feedback
                {activeTab === 'feedback' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2C742F]"></div>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Content - Text */}
              <div className="space-y-6">
                {activeTab === 'descriptions' && (
                  <>
                    <p className="text-gray-600 text-sm leading-relaxed font-poppins">
                      {product?.additional_description || 'No additional description available.'}
                    </p>
                  </>
                )}
                {activeTab === 'additional' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold font-poppins text-gray-900 mb-4">Product Details</h3>
                    {product?.additional_information && typeof product.additional_information === 'object' ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm font-poppins text-gray-900">
                          <tbody>
                            {Object.entries(product.additional_information).map(([key, value]) => (
                              <tr key={key} className="border-b border-gray-200">
                                <td className="py-2 pr-4 font-medium text-gray-600 w-48">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</td>
                                <td className="py-2 text-gray-900">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : product?.additional_information ? (
                      <div className="text-gray-600 text-sm font-poppins bg-gray-50 p-3 rounded">{product.additional_information}</div>
                    ) : (
                      <div className="text-gray-600 text-sm font-poppins bg-gray-50 p-3 rounded">No additional information.</div>
                    )}
                  </div>
                )}

{activeTab === 'feedback' && (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold font-poppins text-gray-900 mb-4">
      Customer Feedback
    </h3>

    {/* Scrollable testimonials list */}
    <div className="space-y-6 max-h-[350px] overflow-y-auto pr-1">
      {testimonials.length > 0 ? (
        testimonials.map((item) => {
          const initials = item.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

          return (
            <div
              key={item.id}
              className="flex gap-4 bg-white p-6 rounded-xl shadow-sm border"
            >
              {/* Avatar */}
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-200 text-green-800 font-semibold text-lg">
                {initials}
              </div>
              {/* Content */}
              <div className="flex-1">
                {/* Name + Time */}
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-900">
                    {item.name}
                  </h4>
                  <span className="text-sm text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                {/* Rating */}
                <div className="flex mt-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <span key={i} className="text-orange-400 text-lg">
                      ★
                    </span>
                  ))}
                </div>
                {/* Description */}
                <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 text-sm">No reviews yet.</p>
      )}
    </div>
  </div>
)}






              </div>

              {/* Right Content - Video */}
              <div className="space-y-6">
                <div className="relative">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                    {youtubeEmbedUrl ? (
                      <iframe
                        className="w-full h-full"
                        src={youtubeEmbedUrl}
                        title="Product Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        className="w-full h-full object-cover"
                        controls
                        poster={organicOil}
                      >
                        <source src={resolvedVideoUrl || productVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>

                {/* Feature Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 64% Discount */}
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_107_2067)">
                          <path d="M28.0671 24.2501C28.326 24.2501 28.5359 24.0402 28.5359 23.7813V12.5313C28.5359 11.9718 28.3178 11.3995 27.9219 10.9198L24.4454 6.70769C24.2633 6.487 24.0539 6.301 23.8265 6.15287C23.8405 6.00962 23.8484 5.86494 23.8484 5.71887V0.468872C23.8484 0.209997 23.6385 0.00012207 23.3797 0.00012207C23.1208 0.00012207 22.9109 0.209997 22.9109 0.468872C22.9109 0.468872 22.91 5.76356 22.9096 5.78593C22.7762 5.76231 22.6409 5.75012 22.5047 5.75012H16.4422C16.0154 5.75012 15.597 5.86987 15.2224 6.08994C15.2062 6.09575 15.1902 6.10225 15.1744 6.10994L10.605 8.33568C10.0987 8.58962 9.69392 9.01556 9.46498 9.535C9.46248 9.54069 9.46011 9.54637 9.45786 9.55212L7.56861 14.3441C7.47367 14.585 7.59192 14.8572 7.83279 14.9522C7.88923 14.9744 7.94736 14.9849 8.00461 14.9849C8.19148 14.9849 8.36811 14.8724 8.44079 14.688L10.3264 9.90525C10.4682 9.58844 10.7161 9.32887 11.0204 9.17612L13.4347 8.00019L11.0249 10.9199C10.6641 11.357 10.4734 11.9143 10.4734 12.5314V28.7189C10.4734 28.9074 10.49 29.092 10.52 29.2719L5.68992 27.1316C4.59879 26.6482 4.10429 25.364 4.58779 24.269C4.58986 24.2642 4.59186 24.2594 4.59386 24.2547L7.64904 16.6619C7.74567 16.4217 7.62936 16.1487 7.38917 16.0521C7.14886 15.9554 6.87598 16.0718 6.77929 16.3119L3.72679 23.8976C3.04042 25.4632 3.74942 27.2971 5.31011 27.9886L10.9741 30.4984C10.981 30.5014 10.9881 30.5037 10.9951 30.5064C11.57 31.4046 12.5639 32.0001 13.6922 32.0001H25.2547C27.0333 32.0001 28.5359 30.4974 28.5359 28.7188V25.9688C28.5359 25.7099 28.326 25.5001 28.0672 25.5001C27.8083 25.5001 27.5984 25.7099 27.5984 25.9688V28.7188C27.5984 29.9893 26.5251 31.0626 25.2547 31.0626H13.6922C12.4343 31.0626 11.4109 30.0112 11.4109 28.7188V12.5313C11.4109 12.1289 11.5243 11.7875 11.748 11.5166L15.2244 7.30444C15.548 6.91244 15.9919 6.68756 16.4422 6.68756H22.5047C22.593 6.68756 22.681 6.6965 22.7679 6.71337C22.4745 7.71406 21.7476 8.54906 20.766 8.9675C20.5094 8.53819 20.0401 8.25006 19.5046 8.25006C18.6947 8.25006 18.0359 8.90894 18.0359 9.71881C18.0359 10.5287 18.6947 11.1876 19.5046 11.1876C20.2535 11.1876 20.8729 10.6239 20.962 9.89862C22.2244 9.42112 23.179 8.40937 23.6044 7.17444C23.6452 7.2155 23.6847 7.25869 23.7224 7.30444L27.1989 11.5166C27.4565 11.8287 27.5984 12.1891 27.5984 12.5314V23.7814C27.5984 24.0402 27.8082 24.2501 28.0671 24.2501ZM19.5046 10.2501C19.2117 10.2501 18.9734 10.0117 18.9734 9.71881C18.9734 9.42587 19.2117 9.18756 19.5046 9.18756C19.7975 9.18756 20.0359 9.42587 20.0359 9.71881C20.0359 10.0117 19.7975 10.2501 19.5046 10.2501Z" fill="#007048"/>
                          <path d="M15.4424 24.9375C15.5623 24.9375 15.6823 24.8917 15.7738 24.8002L23.7738 16.8002C23.9569 16.6171 23.9569 16.3203 23.7738 16.1373C23.5908 15.9542 23.294 15.9542 23.111 16.1373L15.111 24.1373C14.8121 24.4159 15.0414 24.9517 15.4424 24.9375Z" fill="#007048"/>
                          <path d="M16.4414 20C17.5614 20 18.4727 19.0887 18.4727 17.9687C18.4727 16.8487 17.5614 15.9375 16.4414 15.9375H16.3789C15.2589 15.9375 14.3477 16.8487 14.3477 17.9687C14.3477 19.0887 15.2589 20 16.3789 20H16.4414ZM15.2852 17.9687C15.2852 17.3657 15.7758 16.875 16.3789 16.875H16.4414C17.0445 16.875 17.5352 17.3657 17.5352 17.9687C17.5352 18.5718 17.0445 19.0625 16.4414 19.0625H16.3789C15.7758 19.0625 15.2852 18.5718 15.2852 17.9687Z" fill="#007048"/>
                          <path d="M22.5039 24.9375H22.5664C23.6864 24.9375 24.5977 24.0262 24.5977 22.9062C24.5977 21.7862 23.6864 20.875 22.5664 20.875H22.5039C21.3839 20.875 20.4727 21.7862 20.4727 22.9062C20.4727 24.0262 21.3839 24.9375 22.5039 24.9375ZM22.5039 21.8125H22.5664C23.1695 21.8125 23.6602 22.3032 23.6602 22.9062C23.6602 23.5093 23.1695 24 22.5664 24H22.5039C21.9008 24 21.4102 23.5093 21.4102 22.9062C21.4102 22.3032 21.9008 21.8125 22.5039 21.8125Z" fill="#007048"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_107_2067">
                            <rect width="32" height="32" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold font-poppins text-gray-900 mb-1">64% Discount</h3>
                      <p className="text-sm text-gray-600 font-poppins">Save your 64% money with us</p>
                    </div>
                  </div>

                  {/* 100% Organic */}
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_107_2077)">
                          <path d="M31.9759 0.871204C31.9127 0.678579 31.7368 0.545392 31.5343 0.536954C30.5147 0.494517 27.7279 0.501829 23.8822 1.4852C20.3025 2.40064 16.9433 3.90533 14.1675 5.8367C13.9472 5.99002 13.893 6.29283 14.0462 6.51314C14.1994 6.73345 14.5022 6.78777 14.7226 6.63452C17.4039 4.7687 20.6546 3.31377 24.1229 2.42683C25.4189 2.09545 26.7587 1.84389 28.029 1.68627C27.5082 1.9112 26.95 2.17439 26.369 2.48289C22.4401 4.56858 20.245 7.23552 19.032 9.3792C18.8726 8.66395 18.8289 7.84189 18.8286 7.47552C18.8285 7.2072 18.611 6.98977 18.3427 6.98977C18.0743 6.98977 17.8567 7.20733 17.8567 7.4757C17.8567 7.69077 17.8739 9.48302 18.4167 10.5878C17.6686 12.1852 16.9689 13.7821 16.2918 15.3286C16.0042 15.9855 15.7211 16.632 15.4404 17.2649C15.0026 16.4405 14.4256 14.9479 14.5839 12.9956C14.6055 12.7282 14.4063 12.4937 14.1387 12.472C13.872 12.4508 13.6368 12.6496 13.6151 12.9171C13.3877 15.7219 14.503 17.6801 14.9555 18.348C14.1074 20.2223 13.271 21.9484 12.3902 23.4217C11.9367 22.395 11.2263 20.4387 11.2263 18.2604C11.2263 17.992 11.0087 17.7745 10.7404 17.7745C10.472 17.7745 10.2544 17.992 10.2544 18.2604C10.2544 21.1498 11.372 23.6069 11.7742 24.3975C10.8119 25.8353 9.78436 26.9596 8.62367 27.6438C5.08779 23.8037 4.74292 16.5988 10.9201 9.92739C11.6223 9.16902 12.3929 8.44508 13.2107 7.77577C13.4184 7.60577 13.4489 7.29964 13.2789 7.09195C13.1089 6.88427 12.8027 6.85377 12.5951 7.0237C11.7429 7.72133 10.9394 8.47614 10.207 9.26708C3.69104 16.3043 4.05817 23.9746 7.79436 28.1765C4.54073 30.3661 0.514981 30.5029 0.472856 30.5041C0.204731 30.5113 -0.00683118 30.7344 0.000168815 31.0026C0.00710632 31.2665 0.223231 31.4758 0.485731 31.4758C0.490044 31.4758 0.494419 31.4757 0.498731 31.4756C0.685231 31.4707 4.97954 31.33 8.49723 28.8732C9.56311 29.7429 11.235 30.272 13.2621 30.272C15.557 30.272 18.3072 29.5937 21.148 27.9638C23.7798 26.4538 25.6666 24.1438 26.7561 21.0981C27.6891 18.4901 28.0037 15.3521 27.666 12.0234C27.0639 6.08933 29.3056 3.41164 31.8177 1.40202C31.9759 1.27533 32.0389 1.06383 31.9759 0.871204ZM27.6832 4.84633C26.7273 6.84727 26.4054 9.22702 26.699 12.1214C27.0222 15.3071 26.7255 18.298 25.8409 20.7707C24.8315 23.5926 23.0898 25.729 20.6643 27.1208C17.6035 28.877 15.0344 29.2749 13.418 29.2995C11.7655 29.3254 10.3365 28.9726 9.37767 28.3195C10.1757 27.8018 10.9084 27.1075 11.5969 26.2693C11.6348 26.2696 11.6757 26.2698 11.7214 26.2698C12.1986 26.2698 13.0877 26.2493 14.1367 26.1268C16.2354 25.8815 17.8898 25.3636 19.0541 24.5875C19.2774 24.4386 19.3377 24.1369 19.1889 23.9136C19.04 23.6904 18.7383 23.6301 18.515 23.7789C16.7214 24.9746 13.8324 25.2343 12.3412 25.2856C13.2865 23.9374 14.1572 22.3185 15.0159 20.5255C15.8609 20.5234 18.104 20.3406 20.2367 18.6404C20.4465 18.4731 20.481 18.1673 20.3137 17.9575C20.1464 17.7476 19.8407 17.7132 19.6309 17.8805C18.0646 19.1291 16.407 19.4518 15.4841 19.5291C16.0444 18.3166 16.6045 17.0374 17.182 15.7185C17.48 15.0377 17.7827 14.3468 18.0915 13.6512C18.1248 13.652 18.16 13.6525 18.197 13.6525C18.9295 13.6525 20.3882 13.4738 21.9912 12.2861C22.2068 12.1264 22.2521 11.822 22.0923 11.6064C21.9325 11.3908 21.6282 11.3455 21.4125 11.5053C20.4235 12.238 19.5133 12.5133 18.9238 12.6152C18.7809 12.64 18.6501 12.6556 18.5319 12.6656C18.8151 12.0371 19.1042 11.4065 19.401 10.7768C21.2114 6.93527 24.423 4.62058 26.7985 3.35527C27.8283 2.80677 28.7948 2.40214 29.5879 2.11302C28.8911 2.84727 28.2111 3.74133 27.6832 4.84633Z" fill="#007048"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_107_2077">
                            <rect width="32" height="32" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold font-poppins text-gray-900 mb-1">100% Organic</h3>
                      <p className="text-sm text-gray-600 font-poppins">100% Organic Vegetables</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-1xl md:text-2xl font-bold font-poppins text-gray-900">Related Products</h2>
              <button onClick={() => navigate('/shop')} className="text-orange-500 font font-poppins flex items-center gap-2 hover:text-orange-600 transition">
                View All
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div 
                  // key={relatedProduct.id} 
                  key={relatedProduct.pro_id}
                  className="bg-white rounded-lg border border-gray-300 overflow-hidden hover:shadow-lg transition cursor-pointer"
                >
                  <div 
                    onClick={() => {
                      // navigate(`/product/${relatedProduct.id}`);
                      navigate(`/product/${relatedProduct.pro_id}`)
                      window.scrollTo(0, 0);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-gray-50 relative group">
                      {/* <img src={relatedProduct.image} alt={relatedProduct.name} className="w-full h-full object-cover" /> */}
                      <img
  src={resolveImageUrl(relatedProduct.image_1 || relatedProduct.image_url || relatedProduct.image_2 || relatedProduct.image_3)}
  alt={relatedProduct.name}
  className="w-full h-full object-cover"
/>
                      <img src={featureProduct} alt="Frame" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 
                      onClick={() => {
                        // navigate(`/product/${relatedProduct.id}`);
                        navigate(`/product/${relatedProduct.pro_id}`)
                        window.scrollTo(0, 0);
                      }}
                      className="font-semibold font-poppins text-gray-900 mb-2 cursor-pointer hover:text-[#00B207] transition"
                    >
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-poppins font-bold text-gray-900">
                        {Number.isFinite(Number(relatedProduct.price ?? relatedProduct.product_price ?? relatedProduct.min_price))
                          ? `${relatedProduct.currency_code || selectedCountry?.currency_code || 'INR'} ${Number(relatedProduct.price ?? relatedProduct.product_price ?? relatedProduct.min_price).toFixed(2)}`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.max(0, Math.min(5, Math.round(Number(relatedProduct.rating ?? relatedProduct.avg_rating ?? relatedProduct.average_rating ?? 0)))) ? 'fill-[#FF8A00]' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                        {Math.max(0, Number(relatedProduct.reviews ?? relatedProduct.review_count ?? relatedProduct.reviews_count ?? relatedProduct.total_reviews ?? relatedProduct.rating_count ?? 0)) > 0 && (
                          <span className="text-xs text-poppins text-gray-500">({Math.max(0, Number(relatedProduct.reviews ?? relatedProduct.review_count ?? relatedProduct.reviews_count ?? relatedProduct.total_reviews ?? relatedProduct.rating_count ?? 0))})</span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const cartProduct = {
                            id: relatedProduct.pro_id || relatedProduct.id,
                            name: relatedProduct.name,
                            image: resolveImageUrl(relatedProduct.image_1 || relatedProduct.image_url || relatedProduct.image_2 || relatedProduct.image_3),
                            price: Number(relatedProduct.price ?? relatedProduct.product_price ?? relatedProduct.min_price ?? 0),
                            currency_code: relatedProduct.currency_code || selectedCountry?.currency_code || 'INR',
                            country_id: selectedCountry?.country_id,
                          };
                          addToCart(cartProduct, 1);
                        }}
                        className="bg-gray-50 hover:bg-[#00B207] text-gray-700 hover:text-white p-2 rounded-full transition group"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sm:hidden flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-4 px-2">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={`mobile-${relatedProduct.pro_id}`}
                  onClick={() => {
                    navigate(`/product/${relatedProduct.pro_id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="w-[130px] bg-white rounded-lg border border-gray-300 overflow-hidden hover:shadow-lg transition cursor-pointer group flex-shrink-0"
                >
                  <div className="aspect-square w-full overflow-hidden bg-gray-50 relative">
                    <img
                      src={resolveImageUrl(relatedProduct.image_1 || relatedProduct.image_url || relatedProduct.image_2 || relatedProduct.image_3)}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                    />
                    <img
                      src={featureProduct}
                      alt="Frame"
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold font-poppins text-gray-900 mb-1 text-sm line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-bold text-gray-900">
                        {Number.isFinite(Number(relatedProduct.price ?? relatedProduct.product_price ?? relatedProduct.min_price))
                          ? `${relatedProduct.currency_code || selectedCountry?.currency_code || 'INR'} ${Number(relatedProduct.price ?? relatedProduct.product_price ?? relatedProduct.min_price).toFixed(2)}`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-[4px]">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3 h-3 ${star <= Math.max(0, Math.min(5, Math.round(Number(relatedProduct.rating ?? relatedProduct.avg_rating ?? relatedProduct.average_rating ?? 0)))) ? 'fill-[#FF8A00]' : 'fill-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const cartProduct = {
                            id: relatedProduct.pro_id || relatedProduct.id,
                            name: relatedProduct.name,
                            image: resolveImageUrl(relatedProduct.image_1 || relatedProduct.image_url || relatedProduct.image_2 || relatedProduct.image_3),
                            price: Number(relatedProduct.price ?? relatedProduct.product_price ?? relatedProduct.min_price ?? 0),
                            currency_code: relatedProduct.currency_code || selectedCountry?.currency_code || 'INR',
                            country_id: selectedCountry?.country_id,
                          };
                          addToCart(cartProduct, 1);
                        }}
                        className="ml-auto bg-emerald-700 text-white font-poppins font-semibold text-xs py-1 px-3 rounded hover:bg-emerald-800 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Comment / Rating Section */}
        <section className="py-10 md:py-16 -mb-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full p-6 md:p-8">
              <form onSubmit={handleCommentSubmit}>
                <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                  {/* Avatar */}
                  <div className="flex flex-col items-center">
                    <img
                      src="https://www.w3schools.com/howto/img_avatar.png"
                      alt="avatar"
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-gray-300"
                    />
                  </div>

                  {/* Textarea + Stars */}
                  <div className="flex-1 w-full">
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-3 md:mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          onClick={() => setRating(star)}
                          className={`w-7 h-7 md:w-8 md:h-8 cursor-pointer transition ${star <= rating ? 'fill-yellow-400' : 'fill-gray-200'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>


                  <input
  type="text"
  placeholder="Your Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="w-full px-4 py-3 mb-4 border border-blue-200 rounded-lg text-base font-poppins focus:outline-none focus:border-blue-400 shadow-sm transition"
/>


                    <textarea
                      rows="5"
                      placeholder="Write a message..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-4 py-3 border border-blue-200 rounded-lg text-base font-poppins focus:outline-none focus:border-blue-400 resize-none shadow-sm transition"
                      style={{ minHeight: "120px" }}
                    />

                    <button
                      type="submit"
                      className="mt-4 bg-[#007048] text-white px-6 py-3 rounded font-poppins font-medium hover:bg-[#005a3c] transition"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}
