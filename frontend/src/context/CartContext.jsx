import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState(null);
  const [storageKey, setStorageKey] = useState('cart_guest');
  const [isHydrated, setIsHydrated] = useState(false);

  const getCartItemKey = (product) => {
    if (product?.product_variant_id) {
      return `variant-${product.product_variant_id}`;
    }
    return `product-${product.id}`;
  };

  const resolveStorageKey = () => {
    const customerRaw = localStorage.getItem('customer');
    if (!customerRaw) return 'cart_guest';

    try {
      const customer = JSON.parse(customerRaw);
      if (customer?.cus_id) {
        return `cart_${customer.cus_id}`;
      }
    } catch (error) {
      return 'cart_guest';
    }

    return 'cart_guest';
  };

  const mergeGuestCartIntoUserCart = (newStorageKey) => {
    if (newStorageKey === 'cart_guest') return;

    const guestCartRaw = localStorage.getItem('cart_guest');
    const userCartRaw = localStorage.getItem(newStorageKey);

    if (!guestCartRaw) return;

    let guestItems = [];
    let userItems = [];

    try {
      guestItems = JSON.parse(guestCartRaw) || [];
      userItems = JSON.parse(userCartRaw || '[]') || [];
    } catch (error) {
      return;
    }

    if (!Array.isArray(guestItems) || guestItems.length === 0) return;

    const mergedMap = new Map();
    [...userItems, ...guestItems].forEach((item) => {
      const itemKey = item.cartKey || getCartItemKey(item);
      const existing = mergedMap.get(itemKey);
      if (existing) {
        mergedMap.set(itemKey, {
          ...existing,
          quantity: Number(existing.quantity || 0) + Number(item.quantity || 0),
        });
      } else {
        mergedMap.set(itemKey, { ...item, cartKey: itemKey });
      }
    });

    const mergedItems = Array.from(mergedMap.values());
    localStorage.setItem(newStorageKey, JSON.stringify(mergedItems));
    localStorage.removeItem('cart_guest');
  };

  useEffect(() => {
    const syncStorageKey = () => {
      const nextKey = resolveStorageKey();
      mergeGuestCartIntoUserCart(nextKey);
      setStorageKey(nextKey);
    };

    syncStorageKey();
    window.addEventListener('storage', syncStorageKey);
    window.addEventListener('auth-changed', syncStorageKey);

    return () => {
      window.removeEventListener('storage', syncStorageKey);
      window.removeEventListener('auth-changed', syncStorageKey);
    };
  }, []);

  useEffect(() => {
    setIsHydrated(false);
    const savedCart = localStorage.getItem(storageKey);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const normalizedCart = parsedCart.map((item) => ({
          ...item,
          cartKey: item.cartKey || getCartItemKey(item),
        }));
        setCartItems(normalizedCart);
      } catch (error) {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
    setIsHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, storageKey, isHydrated]);

  const redirectToSignIn = () => {
    const currentPath = `${window.location.pathname}${window.location.search || ''}`;
    sessionStorage.setItem('postAuthRedirect', currentPath);
    window.location.href = '/signin';
  };

  const addToCart = (product, quantity = 1) => {
    const token = localStorage.getItem('token');
    const customerRaw = localStorage.getItem('customer');
    if (!token || !customerRaw) {
      showNotification('Please sign in to add items to cart');
      redirectToSignIn();
      return;
    }

    const cartKey = getCartItemKey(product);

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.cartKey === cartKey);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity, cartKey }];
      }
    });

    // Show notification
    showNotification(`${product.name} added to cart!`);
  };

  const removeFromCart = (cartKey) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartKey !== cartKey));
    showNotification('Item removed from cart');
  };

  const updateQuantity = (cartKey, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    showNotification('Cart cleared');
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    notification,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
