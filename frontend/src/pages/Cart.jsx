import { useContext, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { CountryContext } from '../context/CountryContext';
import { API_BASE_URL } from '../config';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { selectedCountry } = useContext(CountryContext);
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placingOrder, setPlacingOrder] = useState(false);

  const subtotal = getCartTotal();
  const shipping = 0; // Free shipping
  const gstRate = 0.01; // 1% GST
  const gst = subtotal * gstRate;
  const total = subtotal + shipping + gst;
  let cartCurrencyCode = cartItems[0]?.currency_code || selectedCountry?.currency_code || 'INR';
  if (cartCurrencyCode === '₹') cartCurrencyCode = 'INR';
  const isUpiSelected = paymentMethod === 'upi';
  const isUpiAvailable = cartCurrencyCode?.toUpperCase() === 'INR';

  // Debug logs to diagnose UPI enable issue
  console.log('cartCurrencyCode:', cartCurrencyCode);
  console.log('selectedCountry:', selectedCountry);

  const formatMoney = (amount, currencyCode = cartCurrencyCode) => {
    const numericAmount = Number(amount || 0);
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericAmount);
    } catch {
      return `${currencyCode} ${numericAmount.toFixed(2)}`;
    }
  };

  const resolveMediaSrc = (value) => {
    if (!value) return '';
    if (value.startsWith('data:') || value.startsWith('blob:')) return value;
    if (/^https?:\/\//i.test(value)) return value;
    return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
  };

  const handleQuantityChange = (itemId, currentQuantity, type) => {
    if (type === 'increase') {
      updateQuantity(itemId, currentQuantity + 1);
    } else if (type === 'decrease' && currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (placingOrder) return;

    const token = localStorage.getItem('token');
    const customer = localStorage.getItem('customer');

    if (!token || !customer) {
      navigate('/signin', {
        state: {
          from: '/cart',
          message: 'Please sign in to place your order.',
        },
      });
      return;
    }

    const missingVariant = cartItems.find((item) => !item.product_variant_id);
    if (missingVariant) {
      alert('One or more cart items are missing variant details. Please re-add them from product page.');
      return;
    }

    const countryId = selectedCountry?.country_id || cartItems[0]?.country_id;
    if (!countryId) {
      alert('Please select a country before placing the order.');
      return;
    }

    let currencyCode = cartItems[0]?.currency_code || 'INR';
    if (currencyCode === '₹') currencyCode = 'INR';
    const normalizedPaymentMethod = paymentMethod === 'upi'
      ? 'Razorpay UPI'
      : paymentMethod === 'cod'
        ? 'Cash On Delivery'
        : paymentMethod === 'paypal'
          ? 'PayPal'
          : paymentMethod.toUpperCase();

    if (isUpiSelected && !isUpiAvailable) {
      alert('UPI via Razorpay is available only for INR orders.');
      return;
    }

    const payload = {
      country_id: countryId,
      currency_code: currencyCode,
      total_amount: Number(total.toFixed(2)),
      shipping_carrier: normalizedPaymentMethod,
      payment_status: paymentMethod === 'cod' ? 'UNPAID' : paymentMethod === 'upi' ? 'UNPAID' : 'PAID',
      payment_gateway: paymentMethod === 'upi' ? 'RAZORPAY' : null,
      shipping_cost: Number(shipping.toFixed(2)),
      duties_tax: Number(gst.toFixed(2)),
      items: cartItems.map((item) => ({
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        price: Number(item.price || 0),
      })),
    };

    try {
      setPlacingOrder(true);
      sessionStorage.setItem('pendingOrderPayload', JSON.stringify(payload));
      sessionStorage.setItem(
        'pendingOrderMeta',
        JSON.stringify({
          paymentMethod,
          paymentLabel: normalizedPaymentMethod,
          total: Number(total.toFixed(2)),
          totalFormatted: formatMoney(total),
        })
      );

      navigate('/address');
    } catch (error) {
      console.error('Proceed to address error:', error);
      alert('Failed to continue checkout. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 md:px-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold font-poppins text-gray-900 mb-6">My Cart</h1>
          <p className="text-gray-600 font-poppins mb-6">Your cart is empty</p>
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
        <h1 className="text-3xl md:text-4xl font-bold font-poppins text-gray-900 mb-8 text-center">My Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Cart Items */}
          <div className="lg:col-span-2">
            {/* Table Headers */}
            <div className="hidden md:grid grid-cols-12 gap-4 mb-4 font-semibold font-poppins text-[#007048] text-sm">
              <div className="col-span-5">Product Name</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Subtotal</div>
              <div className="col-span-1"></div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.cartKey || item.id}
                  className="bg-[#F4E7CF] rounded-xl p-4 md:p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Product Image and Name */}
                    <div className="md:col-span-5 flex items-center gap-4">
                      <div className="w-10 h-10 md:w-20 md:h-20 bg-white flex-shrink-0 overflow-hidden">
                        <img
                          src={resolveMediaSrc(item.image || item.images?.[0])}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold font-poppins text-gray-900 text-base md:text-lg">
                          {item.name}
                        </h3>
                        {(item.variant_label || item.variant_sku) && (
                          <p className="text-sm text-gray-600 font-poppins">
                            Variant: {item.variant_label || item.variant_sku}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                      <span className="md:hidden font-semibold font-poppins text-[#00B207]">Price:</span>
                      <span className="font-semibold font-poppins text-gray-900">
                        {formatMoney(item.price, item.currency_code || cartCurrencyCode)}
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                      <span className="md:hidden font-semibold font-poppins text-[#00B207]">Quantity:</span>
                      <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(item.cartKey || item.id, item.quantity, 'decrease')}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition text-gray-700 font-semibold"
                        >
                          −
                        </button>
                        <span className="w-12 h-10 flex items-center justify-center font-semibold font-poppins text-gray-900 border-x border-gray-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.cartKey || item.id, item.quantity, 'increase')}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition text-gray-700 font-semibold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                      <span className="md:hidden font-semibold font-poppins text-[#00B207]">Subtotal:</span>
                      <span className="font-bold font-poppins text-gray-900 text-lg">
                        {formatMoney(item.price * item.quantity, item.currency_code || cartCurrencyCode)}
                      </span>
                    </div>

                    {/* Delete Button */}
                    <div className="md:col-span-1 flex justify-center">
                      <button
                        onClick={() => removeFromCart(item.cartKey || item.id)}
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

          {/* Right Side - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#F4E7CF] rounded-xl p-6 sticky top-4">
              {/* Summary Title */}
              <h2 className="text-2xl font-bold font-poppins text-gray-900 mb-6 pb-4 border-b border-gray-300">
                Summary
              </h2>

              {/* Summary Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center font-poppins">
                  <span className="text-gray-700 font-medium">Subtotal</span>
                  <span className="text-gray-900 font-semibold">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center font-poppins">
                  <span className="text-gray-700 font-medium">Shipping</span>
                  <span className="text-gray-900 font-semibold">Free</span>
                </div>
                <div className="flex justify-between items-center font-poppins">
                  <span className="text-gray-700 font-medium">Gst</span>
                  <span className="text-gray-900 font-semibold">{formatMoney(gst)}</span>
                </div>
                <div className="border-t border-gray-300 pt-4 flex justify-between items-center font-poppins">
                  <span className="text-gray-900 font-bold text-lg">Total</span>
                  <span className="text-gray-900 font-bold text-lg">{formatMoney(total)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="text-xl font-bold font-poppins text-gray-900 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  {/* Cash On Delivery */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-[#00B207] focus:ring-[#00B207] accent-[#007048]"
                    />
                    <span className="font-poppins text-gray-900 font-medium">Cash On Delivery</span>
                  </label>



                  {/* UPI */}
                  <label className={`flex items-center gap-3 ${isUpiAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={!isUpiAvailable}
                      className="w-5 h-5 text-[#00B207] focus:ring-[#00B207] accent-[#007048]"
                    />
                    <span className="font-poppins text-gray-900 font-medium">UPI via Razorpay</span>
                  </label>
                </div>
                {!isUpiAvailable && (
                  <p className="mt-3 text-sm text-gray-600 font-poppins">
                    UPI checkout is available only for INR orders.
                  </p>
                )}
                {isUpiSelected && isUpiAvailable && (
                  <p className="mt-3 text-sm text-gray-600 font-poppins">
                    You will confirm your delivery address first, then complete the payment securely in Razorpay.
                  </p>
                )}
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full bg-[#007048] text-white font-bold font-poppins text-base py-3 rounded-full hover:bg-[#005a3a] transition"
              >
                {placingOrder ? 'Processing...' : isUpiSelected ? 'Continue to Razorpay Checkout' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
