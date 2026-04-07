import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    removeFromWishlist(item.id);
  };

  const resolveMediaSrc = (value) => {
    if (!value) return '';
    if (value.startsWith('data:') || value.startsWith('blob:')) return value;
    if (/^https?:\/\//i.test(value)) return value;
    return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 md:px-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold font-poppins text-gray-900 mb-6">My Wishlist</h1>
          <p className="text-gray-600 font-poppins mb-6">Your wishlist is empty</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-[#007048] text-white px-8 py-3 rounded-full font-semibold font-poppins hover:bg-[#005a3a] transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold font-poppins text-gray-900 mb-8 text-center">My Wishlist</h1>

        {/* Wishlist Items */}
        <div className="max-w-5xl mx-auto">
          {/* Table Headers */}
          <div className="hidden md:grid grid-cols-12 gap-4 mb-4 font-semibold font-poppins text-[#007048] text-sm">
            <div className="col-span-5">Product Name</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-3 text-center">Action</div>
            <div className="col-span-2"></div>
          </div>

          {/* Wishlist Items */}
          <div className="space-y-4">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#F4E7CF] rounded-xl p-4 md:p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Product Image and Name */}
                  <div className="md:col-span-5 flex items-center gap-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white flex-shrink-0 overflow-hidden">
                      <img
                        src={resolveMediaSrc(item.image || item.images?.[0])}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="font-semibold font-poppins text-gray-900 text-base md:text-lg cursor-pointer hover:text-[#00B207] transition"
                      >
                        {item.name}
                      </h3>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                    <span className="md:hidden font-semibold font-poppins text-[#00B207]">Price:</span>
                    <span className="font-bold font-poppins text-gray-900 text-lg">
                      ₹ {item.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="md:col-span-3 flex items-center justify-between md:justify-center">
                    <span className="md:hidden font-semibold font-poppins text-[#00B207]">Action:</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-[#007048] text-white font-semibold font-poppins text-sm px-6 py-2.5 rounded-full hover:bg-[#005a3a] transition"
                    >
                      Add to Cart
                    </button>
                  </div>

                  {/* Delete Button */}
                  <div className="md:col-span-2 flex justify-center">
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-gray-600 hover:text-red-600 transition"
                      aria-label="Remove item"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
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
