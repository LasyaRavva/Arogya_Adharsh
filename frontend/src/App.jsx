
import useIsMobile from './hooks/useIsMobile';
// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { FilterProvider } from './context/FilterContext';
import { CountryProvider } from './context/CountryContext';
import { CategoryProvider } from './context/CategoryContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Address from './pages/Address';
import Wishlist from './pages/Wishlist';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Account from './pages/Account';
import AccountMobile from './pages/AccountMobile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Notification from './components/Notification';
import WishlistNotification from './components/WishlistNotification';
import Splash from './pages/Splash';

function AppContent() {
  const location = useLocation();
  const hideNavAndFooter = ['/signin', '/signup', '/'].includes(location.pathname);
  const isMobile = useIsMobile();

  return (
    <>
      {!hideNavAndFooter && <Navbar />}
      {!hideNavAndFooter && <Notification />}
      {!hideNavAndFooter && <WishlistNotification />}


      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/address" element={<Address />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/account" element={isMobile ? <AccountMobile /> : <Account />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
      {!hideNavAndFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <CountryProvider>
      <CategoryProvider>
        <BrowserRouter>
          <CartProvider>
            <WishlistProvider>
              <FilterProvider>
                <AppContent />
              </FilterProvider>
            </WishlistProvider>
          </CartProvider>
        </BrowserRouter>
      </CategoryProvider>
    </CountryProvider>
  );
}