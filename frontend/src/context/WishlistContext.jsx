import { createContext, useContext, useState, useEffect } from 'react';
import { CountryContext } from './CountryContext';
import { API_BASE_URL } from '../config';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [notification, setNotification] = useState(null);
  const { selectedCountry } = useContext(CountryContext);

  const getToken = () => localStorage.getItem('token');

  const redirectToSignIn = () => {
    const currentPath = `${window.location.pathname}${window.location.search || ''}`;
    sessionStorage.setItem('postAuthRedirect', currentPath);
    window.location.href = '/signin';
  };

  const fetchFromDB = async (countryId) => {
    const token = getToken();
    if (!token) return null;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/wishlists?country_id=${countryId || ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.map((item) => ({
        id: item.product_id,
        name: item.name,
        price: parseFloat(item.price) || 0,
        image: item.image_url || '',
        currency_code: item.currency_code || 'INR',
      }));
    } catch {
      return null;
    }
  };

  // Initial load on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchFromDB(selectedCountry?.country_id).then((items) => {
        if (items) setWishlistItems(items);
      });
    } else {
      try {
        setWishlistItems(JSON.parse(localStorage.getItem('wishlist') || '[]'));
      } catch {
        setWishlistItems([]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when selected country changes (updates prices for logged-in users)
  useEffect(() => {
    if (!getToken() || !selectedCountry?.country_id) return;
    fetchFromDB(selectedCountry.country_id).then((items) => {
      if (items) setWishlistItems(items);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry?.country_id]);

  // Persist to localStorage for guests only
  useEffect(() => {
    if (!getToken()) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const addToWishlist = async (product) => {
    const token = getToken();
    if (!token) {
      showNotification('Please sign in to add items to wishlist');
      redirectToSignIn();
      return;
    }

    if (token) {
      const already = wishlistItems.some((i) => i.id === product.id);
      if (already) {
        showNotification(`${product.name} is already in wishlist!`);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/wishlists/${product.id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok || res.status === 201 || res.status === 200) {
          setWishlistItems((prev) => [...prev, product]);
          showNotification(`${product.name} added to wishlist!`);
        } else {
          showNotification('Failed to add to wishlist');
        }
      } catch {
        showNotification('Failed to add to wishlist');
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    const token = getToken();
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/wishlists/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // best-effort; update UI regardless
      }
    }
    setWishlistItems((prev) => prev.filter((i) => i.id !== productId));
    showNotification('Item removed from wishlist');
  };

  const clearWishlist = async () => {
    const token = getToken();
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/wishlists`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // best-effort
      }
    } else {
      localStorage.removeItem('wishlist');
    }
    setWishlistItems([]);
    showNotification('Wishlist cleared');
  };

  const isInWishlist = (productId) => wishlistItems.some((item) => item.id === productId);

  const getWishlistCount = () => wishlistItems.length;

  // Call this after login to migrate guest wishlist and load from DB
  const refreshWishlist = () => {
    fetchFromDB(selectedCountry?.country_id).then((items) => {
      if (items) setWishlistItems(items);
    });
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    notification,
    refreshWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
