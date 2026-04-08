import { useState, useEffect, useContext } from 'react';
import { CountryContext } from '../context/CountryContext';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCategory } from '../context/CategoryContext';
import logo from '../assets/logo1.png';
import { API_BASE_URL } from '../config';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  const [countries, setCountries] = useState([]);
const { selectedCountry, setSelectedCountry } = useContext(CountryContext);
const [restrictedProducts, setRestrictedProducts] = useState([]);

const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
const [expandedCategoryId, setExpandedCategoryId] = useState(null);

const [categoryList, setCategoryList] = useState([]);
const { selectedCategory, setSelectedCategory } = useCategory();


// Search state + handler
const [search, setSearch] = useState("");


useEffect(() => {
  function handleClickOutside(event) {
    if (!event.target.closest('.category-dropdown-parent')) {
      setShowCategoryDropdown(false);
    }
  }
  if (showCategoryDropdown) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showCategoryDropdown]);




// Search input change handler (real-time navigate karta hai)
const handleSearchChange = (e) => {
  const value = e.target.value;
  setSearch(value);
  navigate("/shop", { state: { search: value } });
};





useEffect(() => {
  fetch(`${API_BASE_URL}/api/categories`)
    .then(res => res.json())
    .then(data => setCategoryList(data))
    .catch(err => setCategoryList([]));
}, []);

const parentCategories = categoryList.filter((category) => !category.parent_id);
const getSubcategories = (parentId) =>
  categoryList.filter((category) => String(category.parent_id) === String(parentId));

const handleNavbarCategoryClick = (category) => {
  const subcategories = getSubcategories(category.cat_id);

  if (subcategories.length > 0) {
    setExpandedCategoryId((current) => (current === category.cat_id ? null : category.cat_id));
    return;
  }

  setSelectedCategory(category);
  setExpandedCategoryId(null);
  setShowCategoryDropdown(false);
  navigate('/shop');
};

const handleNavbarSubcategoryClick = (subcategory, parentId) => {
  setExpandedCategoryId(parentId);
  setSelectedCategory(subcategory);
  setShowCategoryDropdown(false);
  navigate('/shop');
};





  useEffect(() => {
    const syncAuthUser = () => {
      const token = localStorage.getItem('token');
      const customerData = localStorage.getItem('customer');
      if (!token || !customerData) {
        setUser(null);
        return;
      }

      try {
        const customer = JSON.parse(customerData);
        setUser(customer);
      } catch (error) {
        console.error('Error parsing customer data:', error);
        setUser(null);
      }
    };

    syncAuthUser();
    window.addEventListener('storage', syncAuthUser);
    window.addEventListener('auth-changed', syncAuthUser);

    return () => {
      window.removeEventListener('storage', syncAuthUser);
      window.removeEventListener('auth-changed', syncAuthUser);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest('.user-menu-parent')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showUserMenu]);

  const getFirstLetter = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };



  useEffect(() => {
  if (!selectedCountry) return;
  fetch(`${API_BASE_URL}/api/products/country/${selectedCountry.country_id}`)
    .then(res => res.json())
    .then(data => setRestrictedProducts(data))
    .catch(err => console.error('Error fetching restrictions:', err));
}, [selectedCountry]);



// If restriction_type is 'HIDE', filter out those products
const restrictedIds = restrictedProducts
  .filter(r => r.restriction_type === 'HIDE')
  .map(r => r.product_id);

// const visibleProducts = products.filter(
//   p => !restrictedIds.includes(p.pro_id)
// );



useEffect(() => {
  fetch(`${API_BASE_URL}/api/countries`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch countries");
      return res.json();
    })
    .then(data => setCountries(data))
    .catch(err => console.error("Error fetching countries:", err));
}, []);




useEffect(() => {
  if (!countries.length) return;

  const india = countries.find(
    c => c.code === 'IN' || c.code === 'IND' || c.name?.toLowerCase() === 'india'
  );

  const defaultCountry = india || countries[0];
  setSelectedCountry(defaultCountry);
  localStorage.setItem("country", defaultCountry.code);
}, [countries]);





const handleChange = (e) => {
  const country = countries.find(
    c => c.country_id === parseInt(e.target.value, 10)
  );

  if (!country) return;

  setSelectedCountry(country);
  localStorage.setItem("country", country.code);

  // reload like behavior but react friendly
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('customer');
  window.dispatchEvent(new Event('auth-changed'));
  setShowUserMenu(false);
  navigate('/home', { replace: true });
};




  return (
    <header className="bg-[#00613E] text-[#EBDCC3] font-poppins " >
      {/* Top Header Bar */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 py-2 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
              <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
            </svg>
            <span>Store Location: Lincoln- 344, abbnjcosjqd.ertyujkl</span>
          </span>

        <div className="flex items-center gap-4">
  <span>Eng</span>

  <div className="relative  ">

<select
      value={selectedCountry?.country_id || ""}
      onChange={handleChange}
      className="bg-[#007048] border-none text-white text-sm font-medium 
                 rounded px-2 py-1 cursor-pointer appearance-none pr-6 min-w-[70px]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.5rem center",
        backgroundSize: "1.2em"
      }}
    >
      {countries.map(country => (
        <option
          key={country.country_id}
          value={country.country_id}
        >
          🌍 {country.code}
        </option>
      ))}
    </select>






  </div>

  <span className="hidden md:flex items-center gap-2">
    <span>📞</span> (123) 456-7890
  </span>
</div>
  
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-4 bg-[#007048]">
        <div className="flex items-center justify-between gap-4 md:gap-4 lg:gap-6">
          {/* Logo */}
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 font-semibold text-lg md:text-base lg:text-xl text-[#EBDCC3] font-poppins hover:opacity-80 transition cursor-pointer border-none bg-none p-0"
          >
            <img src={logo} alt="Arogya Adharsh" className="w-10 h-10 md:w-20 md:h-20 lg:w-20 lg:h-20" />
            <span className="leading-none text-[#EBDCC3] text-xl">Arogya Adarsh</span>
          </button>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-4 md:gap-4 lg:gap-6 text-xs md:text-xs lg:text-sm">
            <Link to="/home" className="text-white hover:text-[#EBDCC3] transition">Home</Link>
            <Link to="/shop" className="text-white hover:text-[#EBDCC3] transition">Shop</Link>
            
            <Link to="/blog" className="text-white hover:text-[#EBDCC3] transition">Blog</Link>
            <Link to="/about" className="text-white hover:text-[#EBDCC3] transition">About Us</Link>
            <Link to="/contact" className="text-white hover:text-[#EBDCC3] transition">Contact Us</Link>
            <Link to="/account" className="text-white hover:text-[#EBDCC3] transition">My Account</Link>
            <Link to="/address" className="text-white hover:text-[#EBDCC3] transition">Address</Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-3 md:gap-3 lg:gap-4">
            <button 
              onClick={() => navigate('/wishlist')}
              className="relative hover:text-white/80 transition" 
              aria-label="Wishlist"
            >
              <svg className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.999 28.0722C-10.6672 13.3333 7.9995 -2.66666 15.999 7.45075C23.9995 -2.66666 42.6661 13.3333 15.999 28.0722Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#007048] text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => navigate('/cart')}
              className="relative hover:text-white/80 transition" 
              aria-label="Cart"
            >
              <svg className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="20" r="1.6" />
                <circle cx="18" cy="20" r="1.6" />
                <path d="M2 3h2l2.4 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#007048] text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </button>
            {user ? (
  <div className="relative user-menu-parent">
    <button 
      onClick={() => setShowUserMenu((prev) => !prev)}
      className="bg-[#EBDCC3] text-[#007048] w-8 h-8 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full text-xs md:text-xs lg:text-sm font-bold hover:bg-[#d9cdb9] transition flex items-center justify-center"
      title={user.name}
    >
      {getFirstLetter()}
    </button>

    {showUserMenu && (
      <div className="absolute right-0 top-11 z-50 w-52 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-500">Welcome</p>
          <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
        >
          Logout
        </button>
      </div>
    )}
  </div>
) : (
  <>
    {/* Desktop Sign In Button (UNCHANGED STYLE) */}
    <button 
      onClick={() => navigate('/signin')}
      className="hidden md:inline-flex bg-black text-white px-4 md:px-3 md:py-1.5 py-2 rounded-full text-xs md:text-xs lg:text-sm font-semibold hover:bg-gray-800 transition"
    >
      Sign In
    </button>

    {/* Mobile User Icon */}
    <button
      onClick={() => navigate('/signin')}
      className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-black text-white hover:bg-gray-800 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.121 17.804A9 9 0 1118.88 17.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </button>
  </>
)}

            {/* Mobile Menu Button */}
            <button className="md:hidden text-2xl menu-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

{/* 
// SEARCH BAR JSX (Desktop view mein)
// ------------------- */}
<div className="mt-4 hidden md:flex items-center justify-center gap-3 md:gap-2 lg:gap-4">

  {/* Category dropdown (search ke saath saath dikh raha hai, isliye rakha) */}
  <div className="relative category-dropdown-parent" style={{ zIndex: 20 }}>
    <button
      className="bg-[#f4e7cf] text-[#3a3a3a] px-4 md:px-3 py-2 rounded-full text-xs md:text-xs lg:text-sm font-medium flex items-center gap-1 md:gap-1 lg:gap-2"
      onClick={() => setShowCategoryDropdown((prev) => !prev)}
      type="button"
    >
      {selectedCategory ? selectedCategory.name : 'All Categories'} <span className="text-xs">▼</span>
    </button>
    {showCategoryDropdown && (
      <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
        {parentCategories.length === 0 ? (
          <div className="px-4 py-2 text-gray-500 text-sm">Loading...</div>
        ) : (
          <>
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f4e7cf]"
              onClick={() => {
                setSelectedCategory(null);
                setExpandedCategoryId(null);
                setShowCategoryDropdown(false);
                navigate('/shop');
              }}
            >
              All Categories
            </button>
            {parentCategories.map((cat) => {
              const subcategories = getSubcategories(cat.cat_id);
              const isExpanded = expandedCategoryId === cat.cat_id;

              return (
                <div key={cat.cat_id} className="border-t border-gray-100 first:border-t-0">
                  <button
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#f4e7cf]"
                    onClick={() => handleNavbarCategoryClick(cat)}
                  >
                    <span>{cat.name}</span>
                    {subcategories.length > 0 && (
                      <span className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                    )}
                  </button>

                  {isExpanded && subcategories.length > 0 && (
                    <div className="bg-gray-50 py-1">
                      {subcategories.map((subcategory) => (
                        <button
                          key={subcategory.cat_id}
                          className="block w-full px-6 py-2 text-left text-sm text-gray-600 hover:bg-[#f4e7cf]"
                          onClick={() => handleNavbarSubcategoryClick(subcategory, cat.cat_id)}
                        >
                          {subcategory.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    )}
  </div>

  {/* Actual Search Form */}
  <form
    className="flex items-center bg-[#f4e7cf] rounded-full overflow-hidden w-[320px] md:w-[260px] lg:w-[520px]"
  >
    <span className="px-2 md:px-1 flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.5 17.5L13.875 13.875" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
    <input
      type="text"
      placeholder="Search"
      className="bg-transparent flex-1 outline-none text-black text-xs md:text-xs lg:text-sm py-2"
      value={search}
      onChange={handleSearchChange}
    />
    <button 
      type="submit" 
      className="bg-white text-gray-800 px-4 md:px-3 py-2 text-xs md:text-xs lg:text-sm font-semibold"
    >
      Search
    </button>
  </form>
</div>


        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4 text-sm  mobile-menu">
            <Link to="/home" className="hover:text-white/80 transition" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/shop" className="hover:text-white/80 transition" onClick={() => setIsOpen(false)}>Shop</Link>
            <Link to="/blog" className="hover:text-white/80 transition" onClick={() => setIsOpen(false)}>Blog</Link>
            <Link to="/about" className="hover:text-white/80 transition" onClick={() => setIsOpen(false)}>About Us</Link>
            <Link to="/contact" className="hover:text-white/80 transition" onClick={() => setIsOpen(false)}>Contact Us</Link>
            <Link to="/account" className="hover:text-white/80 transition" onClick={() => setIsOpen(false)}>My Account</Link>
            <Link to="/address" className="hover:text-white/80 transition" onClick={() => setIsOpen(false)}>Address</Link>
          </div>
        )}
      


      </div>
    </header>
  );
}
