import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import organicoil from '../assets/organic oil.jpg'; // adjust path if needed

import { API_BASE_URL } from '../config';

const resolveMediaSrc = (value, fallback = organicoil) => {
  if (!value) return fallback;
  if (value.startsWith('data:') || value.startsWith('blob:')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE_URL}/${String(value).replace(/^\/+/, '')}`;
};

export default function AccountMobile() {

    const navigate = useNavigate();
  const { addToCart } = useCart();

  // Navigation states
  const [showOrders, setShowOrders] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false); // ← NEW
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSuggestProducts, setShowSuggestProducts] = useState(false);
  const [user] = useState(() => {
    try {
      const customerData = localStorage.getItem('customer');
      return customerData ? JSON.parse(customerData) : null;
    } catch {
      return null;
    }
  });


  // Toggle states for notifications (match your screenshot: WhatsApp ON, Push OFF)
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Orders states
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Support states
  const [expandedFaq, setExpandedFaq] = useState(null);

  const [suggestText, setSuggestText] = useState('');

  // Addresses states (copied from desktop version)
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    firstName: '',
    lastName: '',
    company: '',
    street: '',
    addressLine2: '',
    city: '',
    country: '',
    state: '',
    zip: '',
    email: '',
    phone: ''
  });
  const [editAddressId, setEditAddressId] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const primaryAddress =
    addresses.find((addr) => String(addr.type || '').toLowerCase() === 'default') ||
    addresses[0] ||
    null;


  // Profile states (copied from desktop)
  const [profileData, setProfileData] = useState(() => {
    const defaultProfile = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    };

    let storedProfile = {};
    try {
      const rawStoredProfile = localStorage.getItem('profileData');
      storedProfile = rawStoredProfile ? JSON.parse(rawStoredProfile) : {};
    } catch {
      storedProfile = {};
    }

    const rawName = String(user?.name || '').trim();
    const nameParts = rawName ? rawName.split(/\s+/) : [];
    const firstFromUser = nameParts[0] || '';
    const lastFromUser = nameParts.slice(1).join(' ');

    return {
      ...defaultProfile,
      ...storedProfile,
      firstName: storedProfile.firstName || firstFromUser || '',
      lastName: storedProfile.lastName || lastFromUser || '',
      email: storedProfile.email || user?.email || '',
      phone: storedProfile.phone || user?.phone || '',
    };
    // profileImage: avatarImage // optional - can add later
  });


  const [orders, setOrders] = useState([]);

  const formatOrderDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString();
  };

  const formatOrderStatus = (status) => {
    const normalized = String(status || 'PENDING').toUpperCase();
    if (normalized === 'DELIVERED') return 'Order delivered';
    if (normalized === 'SHIPPED') return 'Order shipped';
    return 'Order confirmed';
  };

  const formatPaymentStatus = (status) => {
    const normalizedPayment = String(status || 'PAID').toUpperCase();

    if (normalizedPayment !== 'PAID') return 'Unpaid';
    return 'Paid';
  };

  const buildTimeline = (status, createdAt, shippedAt, deliveredAt, paymentStatus, shippingCarrier) => {
    const normalized = String(status || 'PENDING').toUpperCase();
    const normalizedPayment = String(paymentStatus || 'UNPAID').toUpperCase();
    const normalizedMethod = String(shippingCarrier || '').toUpperCase();
    const isCod = normalizedMethod === 'CASH ON DELIVERY';
    const confirmedCompleted =
      normalized === 'CONFIRMED' ||
      normalized === 'SHIPPED' ||
      normalized === 'DELIVERED' ||
      (!isCod && normalizedPayment === 'PAID');
    return [
      { step: 'Ordered', date: formatOrderDate(createdAt), completed: true },
      { step: 'Confirmed', date: confirmedCompleted ? formatOrderDate(createdAt) : 'Pending', completed: confirmedCompleted },
      {
        step: 'Shipped',
        date: normalized === 'SHIPPED' || normalized === 'DELIVERED'
          ? (shippedAt ? formatOrderDate(shippedAt) : 'Pending')
          : 'Pending',
        completed: normalized === 'SHIPPED' || normalized === 'DELIVERED',
      },
      {
        step: 'Delivered',
        date: normalized === 'DELIVERED'
          ? (deliveredAt ? formatOrderDate(deliveredAt) : 'Pending')
          : 'Pending',
        completed: normalized === 'DELIVERED',
      },
    ];
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setOrders([]);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok || !Array.isArray(data)) {
          return;
        }

        const transformed = data.map((order) => {
          const imagePath = resolveMediaSrc(order.items?.[0]?.product_image, organicoil);

          const orderAddress = order.address || {};
          const deliveryAddress = [
            [orderAddress.first_name, orderAddress.last_name].filter(Boolean).join(' ').trim(),
            orderAddress.company_name,
            orderAddress.address_line1,
            orderAddress.address_line2,
            [orderAddress.city, orderAddress.state, orderAddress.postal_code].filter(Boolean).join(' ').trim(),
            orderAddress.country_name,
          ]
            .filter(Boolean)
            .join(', ');

          return {
            id: order.order_id,
            image: imagePath,
            status: formatOrderStatus(order.status),
            paymentStatus: formatPaymentStatus(order.payment_status),
            shippingCarrier: order.shipping_carrier || '',
            placedDate: formatOrderDate(order.created_at),
            amount: `${order.currency_code} ${Number(order.total_amount || 0).toFixed(2)}`,
            items: (order.items || []).map((item) => {
              const lineTotal = Number((item.price || 0) * (item.quantity || 0)).toFixed(2);
              const variantText = item.variant_label || item.variant_sku;
              return `${item.product_name || 'Product'}${variantText ? ` (${variantText})` : ''} - ${item.quantity}x - ${order.currency_code} ${lineTotal}`;
            }),
            rawItems: order.items || [],
            deliveryAddress,
            timeline: buildTimeline(order.status, order.created_at, order.shipped_at, order.delivered_at, order.payment_status, order.shipping_carrier),
          };
        });

        setOrders(transformed);
      } catch (error) {
        console.error('Failed to fetch mobile orders:', error);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAddresses([]);
      return;
    }

    const fetchAddresses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/customer-addresses/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok || !Array.isArray(data)) {
          return;
        }

        const transformed = data.map((addr) => ({
          id: addr.address_id,
          type: addr.is_default ? 'Default' : 'Billing',
          address: addr.address_line1 || '',
          addressLine2: addr.address_line2 || '',
          city: addr.city || '',
          country: addr.country_name || '',
          state: addr.state || '',
          zipCode: addr.postal_code || '',
          firstName: addr.first_name || '',
          lastName: addr.last_name || '',
          company: addr.company_name || '',
          email: addr.email || '',
          phone: addr.phone || '',
        }));

        setAddresses(transformed);

        if (transformed.length > 0) {
          const defaultAddress =
            transformed.find((addr) => String(addr.type || '').toLowerCase() === 'default') ||
            transformed[0];

          setProfileData((prev) => ({
            ...prev,
            firstName: defaultAddress.firstName || prev.firstName,
            lastName: defaultAddress.lastName || prev.lastName,
            email: defaultAddress.email || prev.email,
            phone: defaultAddress.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch mobile addresses:', error);
      }
    };

    fetchAddresses();
  }, []);

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setEditAddressId(null);
    setNewAddress({
      firstName: '',
      lastName: '',
      company: '',
      street: '',
      addressLine2: '',
      city: '',
      country: '',
      state: '',
      zip: '',
      email: '',
      phone: '',
    });
  };

  const handleAddressSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in again to save address.');
      return;
    }

    if (
      !newAddress.firstName.trim() ||
      !newAddress.lastName.trim() ||
      !newAddress.street.trim() ||
      !newAddress.addressLine2.trim() ||
      !newAddress.city.trim() ||
      !newAddress.country.trim() ||
      !newAddress.state.trim() ||
      !newAddress.zip.trim() ||
      !newAddress.email.trim() ||
      !newAddress.phone.trim()
    ) {
      alert('Please fill in all required address fields.');
      return;
    }

    const payload = {
      address_line1: newAddress.street.trim(),
      address_line2: newAddress.addressLine2.trim(),
      city: newAddress.city.trim(),
      country: newAddress.country.trim(),
      state: newAddress.state.trim(),
      postal_code: newAddress.zip.trim(),
      first_name: newAddress.firstName.trim(),
      last_name: newAddress.lastName.trim(),
      company_name: newAddress.company.trim(),
      email: newAddress.email.trim(),
      phone: newAddress.phone.trim(),
      is_default: addresses.length === 0,
    };

    try {
      const endpoint = editAddressId
        ? `${API_BASE_URL}/api/customer-addresses/${editAddressId}`
        : `${API_BASE_URL}/api/customer-addresses`;
      const method = editAddressId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || 'Failed to save address');
        return;
      }

      const mapped = {
        id: data.address_id,
        type: data.is_default ? 'Default' : 'Billing',
        address: data.address_line1 || '',
        addressLine2: data.address_line2 || '',
        city: data.city || '',
        country: newAddress.country.trim(),
        state: data.state || '',
        zipCode: data.postal_code || '',
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        company: data.company_name || '',
        email: data.email || '',
        phone: data.phone || '',
      };

      if (editAddressId) {
        setAddresses((prev) => prev.map((addr) => (addr.id === editAddressId ? mapped : addr)));
      } else {
        setAddresses((prev) => [mapped, ...prev]);
      }

      resetAddressForm();
    } catch (error) {
      console.error('Save mobile address error:', error);
      alert('Failed to save address');
    }
  };

  const handleAddressDelete = async (addressId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!window.confirm('Delete this address?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/customer-addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data?.error || 'Failed to delete address');
        return;
      }

      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
    } catch (error) {
      console.error('Delete mobile address error:', error);
      alert('Failed to delete address');
    }
  };

  const openAddressEditor = (addr = null) => {
    setShowAddressForm(true);

    if (!addr) {
      setEditAddressId(null);
      setNewAddress({
        firstName: '',
        lastName: '',
        company: '',
        street: '',
        addressLine2: '',
        city: '',
        country: '',
        state: '',
        zip: '',
        email: '',
        phone: '',
      });
      return;
    }

    setEditAddressId(addr.id);
    setNewAddress({
      firstName: addr.firstName || '',
      lastName: addr.lastName || '',
      company: addr.company || '',
      street: addr.address || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      country: addr.country || '',
      state: addr.state || '',
      zip: addr.zipCode || '',
      email: addr.email || '',
      phone: addr.phone || '',
    });
  };

  // FAQ data
  const faqs = [
    { id: 1, question: 'Coupons & Offers', answer: 'Find the latest coupons and offers in the Offers section of our app or website. Apply them at checkout to save more!' },
    { id: 2, question: 'General Inquiry', answer: 'For general inquiries, please contact our support team via email or phone.' },
    { id: 3, question: 'Payment Related', answer: 'We accept all major credit/debit cards, UPI, and net banking. For payment issues, contact support.' },
    { id: 4, question: 'Feedback & Suggestions', answer: 'We value your feedback! Please use the feedback form or email us your suggestions.' },
    { id: 5, question: 'Order / Products Related', answer: 'For order or product issues, go to My Orders and select the relevant order to raise a concern.' },
    { id: 6, question: 'Gift Card', answer: 'Gift cards can be purchased and redeemed during checkout. For issues, contact support.' },
    { id: 7, question: 'No-Cost EMI', answer: 'No-Cost EMI is available on select products. Check eligibility at checkout.' },
    { id: 8, question: 'Wallet Related', answer: 'Check your wallet balance in your profile. For wallet issues, contact support.' }
  ];

  // ────────────────────────────────────────────────
  // Order action handlers
  // ────────────────────────────────────────────────
  const handleReorder = (order) => {
    if (Array.isArray(order.rawItems) && order.rawItems.length > 0) {
      order.rawItems.forEach((item) => {
        addToCart(
          {
            id: item.product_variant_id,
            product_variant_id: item.product_variant_id,
            name: item.product_name,
            variant_sku: item.variant_sku,
            variant_label: item.variant_label || item.variant_sku,
            price: Number(item.price || 0),
            image: resolveMediaSrc(item.product_image, order.image),
          },
          Number(item.quantity || 1)
        );
      });
    }

    alert(`Items from Order #${order.id} added to cart!`);
  };

  const handleTrackOrder = (order) => {
    alert(`Tracking Order #${order.id}\nStatus: ${order.status}\nPlaced: ${order.placedDate}`);
  };

  const handleReturn = (order) => {
    if (order.status !== 'Order delivered') {
      alert('Only delivered orders can be returned.');
      return;
    }
    if (window.confirm(`Return Order #${order.id}?`)) {
      alert('Return request submitted!');
    }
  };

  // ────────────────────────────────────────────────
  // Orders Screen
  // ────────────────────────────────────────────────
  if (showOrders) {
    return (
      <div className="bg-gray-50 min-h-screen w-full md:hidden">
        <div className="flex items-center p-4 bg-white border-b sticky top-0 z-10">
          <button onClick={() => setShowOrders(false)} className="mr-3 text-2xl font-bold">←</button>
          <h1 className="font-semibold font-poppins text-lg">Your Orders</h1>
        </div>

        <div className="p-4 space-y-4">
          {orders.length === 0 ? (
            <p className="text-center  font-poppins text-gray-500 py-10">No orders yet</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50"
                >
                  <img src={order.image} alt="" className="w-14 h-14 object-cover rounded-md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${order.status.includes('delivered') ? 'text-green-700' : 'text-gray-800'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Placed {order.placedDate.split(',')[0]}</p>
                    <p className={`text-[11px] font-semibold mt-1 ${order.paymentStatus === 'Unpaid' ? 'text-yellow-700' : 'text-green-700'}`}>
                      Payment: {order.paymentStatus}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {order.items[0]} {order.items.length > 1 && ` +${order.items.length - 1} more`}
                    </p>
                    {order.deliveryAddress && (
                      <p className="text-[11px] text-gray-500 mt-1">Address: {order.deliveryAddress}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base">{order.amount}</p>
                  </div>
                </button>

                {expandedOrder === order.id && (
                  <div className="border-t px-4 py-4 bg-gray-50">
                    <div className="mb-5">
                      <h4 className="text-sm  font-poppins font-medium mb-2">Items</h4>
                      <div className="space-y-1.5 text-sm text-gray-700">
                        {order.items.map((item, i) => (
                          <div key={i}>• {item}</div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-5">
                      <h4 className="text-sm  font-poppins font-medium mb-2">Delivery Timeline</h4>
                      <div className="space-y-3">
                        {order.timeline.map((event, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-2.5 h-2.5 rounded-full mt-1 ${event.completed ? 'bg-green-700' : 'bg-gray-300'}`} />
                              {idx < order.timeline.length - 1 && (
                                <div className={`w-0.5 flex-1 mt-1 ${event.completed ? 'bg-green-700' : 'bg-gray-300'}`} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{event.step}</p>
                              <p className="text-xs text-gray-500">{event.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
                      <button
                        onClick={() => handleTrackOrder(order)}
                        className="flex-1 py-2.5 px-4  font-poppins border border-green-700 text-green-700 rounded-lg text-sm font-medium active:bg-green-50"
                      >
                        Track Order
                      </button>
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex-1 py-2.5 px-4  font-poppins border border-gray-300 rounded-lg text-sm font-medium active:bg-gray-100"
                      >
                        Reorder
                      </button>
                      <button
                        onClick={() => handleReturn(order)}
                        disabled={order.status !== 'Order delivered'}
                        className={`flex-1 py-2.5 px-4 border  font-poppins text-sm font-medium rounded-lg ${
                          order.status === 'Order delivered'
                            ? 'border-red-400 text-red-600 active:bg-red-50'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Return
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }




  // ────────────────────────────────────────────────
  // Suggest Products Screen (matches your screenshot)
  // ────────────────────────────────────────────────
  if (showSuggestProducts) {
    return (
      <div className="bg-gray-50 min-h-screen w-full md:hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 bg-white border-b sticky top-0 z-10">
          <button 
            onClick={() => {
              setShowSuggestProducts(false);
              setSuggestText(''); // clear input on close
            }}
            className="mr-3 text-2xl font-bold"
          >
            ←
          </button>
          <h1 className="font-semibold font-poppins text-lg">Suggest Products</h1>
        </div>

        {/* Main content - centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <h2 className="text-xl font-semibold  font-poppins text-gray-800 mb-4 text-center">
            Didn't find what you are looking for?<br />
            Please suggest the products
          </h2>

          <textarea
            placeholder="Enter the name of the products you would like to see in Zepto"
            value={suggestText}
            onChange={(e) => setSuggestText(e.target.value)}
            className="w-full max-w-md h-32 p-4 border font-poppins border-gray-300 rounded-lg text-base resize-none focus:outline-none focus:border-[#007048] focus:ring-1 focus:ring-[#007048] mb-6"
          />

          <button
            onClick={() => {
              if (suggestText.trim()) {
                alert(`Suggestion sent: ${suggestText}\n\n(You can connect this to backend/API later)`);
                setSuggestText('');
                setShowSuggestProducts(false);
              } else {
                alert('Please enter some product names');
              }
            }}
            className="w-full max-w-md  font-poppins bg-pink-500 text-white py-3.5 rounded-lg font-medium text-lg active:bg-pink-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    );
  }



// ────────────────────────────────────────────────
  // Notifications Screen (matches your screenshot 100%)
  // ────────────────────────────────────────────────
  if (showNotifications) {
    return (
      <div className="bg-gray-50 min-h-screen w-full md:hidden">
        {/* Header */}
        <div className="flex items-center p-4 bg-white border-b sticky top-0 z-10">
          <button 
            onClick={() => setShowNotifications(false)}
            className="mr-3 text-2xl font-bold"
          >
            ←
          </button>
          <h1 className="font-semibold font-poppins text-lg">Notifications</h1>
        </div>

        {/* Notifications list */}
        <div className="p-5 bg-white">
          <div className="space-y-6 divide-y divide-gray-200">
            {/* WhatsApp Messages */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium  font-poppins text-base">WhatsApp Messages</p>
                <p className="text-sm  font-poppins text-gray-500 mt-0.5">
                  Get updates from us on WhatsApp
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={() => setWhatsappEnabled(!whatsappEnabled)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full transition duration-200 ease-in-out ${
                  whatsappEnabled ? 'bg-green-600' : 'bg-gray-300'
                } peer peer-focus:ring-2 peer-focus:ring-green-300`}>
                  <div className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition duration-200 ease-in-out shadow-md ${
                    whatsappEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
              </label>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium  font-poppins text-base">Push notifications</p>
                <p className="text-sm  font-poppins text-gray-500 mt-0.5">
                  Turn on to get live updates & offers
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={() => setPushEnabled(!pushEnabled)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full transition duration-200 ease-in-out ${
                  pushEnabled ? 'bg-green-600' : 'bg-gray-300'
                } peer peer-focus:ring-2 peer-focus:ring-green-300`}>
                  <div className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition duration-200 ease-in-out shadow-md ${
                    pushEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }



  // ────────────────────────────────────────────────
  // Help & Support Screen
  // ────────────────────────────────────────────────
  if (showSupport) {
    return (
      <div className="bg-gray-50 min-h-screen w-full md:hidden">
        <div className="flex items-center p-4 bg-white border-b sticky top-0 z-10">
          <button onClick={() => setShowSupport(false)} className="mr-3 text-2xl font-bold">←</button>
          <h1 className="font-semibold font-poppins text-lg">Help & Support</h1>
        </div>

        <div className="p-4">
          <h2 className="text-lg font-semibold font-poppins mb-4">Frequently Asked Questions</h2>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white  font-poppins border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full text-left px-4 py-3.5  font-poppins flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="font-medium  font-poppins text-base">{faq.question}</span>
                  <span className={`text-xl transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {expandedFaq === faq.id && (
                  <div className="px-4 pb-4 pt-1  font-poppins text-gray-700 text-sm border-t">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600  font-poppins mb-3">Still need help?</p>
            <button className="bg-[#007048]  font-poppins text-white font-medium px-6 py-3 rounded-lg w-full max-w-xs">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }



  // ────────────────────────────────────────────────
  // Addresses Screen (same logic as desktop)
  // ────────────────────────────────────────────────
  if (showAddresses) {
    return (
      <div className="bg-gray-50 min-h-screen w-full md:hidden">
        {/* Header */}
        <div className="flex items-center p-4 bg-white border-b sticky top-0 z-10">
          <button 
            onClick={() => setShowAddresses(false)}
            className="mr-3 text-2xl  font-poppins font-bold"
          >
            ←
          </button>
          <h1 className="font-semibold  font-poppins font-poppins text-lg">Saved Addresses</h1>
        </div>

        <div className="p-4">
          {showAddressForm ? (
            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
              <h3 className="text-lg  font-poppins font-semibold mb-4">Add / Edit Address</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block  font-poppins text-sm mb-1">First Name <span className="text-red-500">*</span></label>
                    <input
                      required
                      className="w-full border  font-poppins rounded px-3 py-2 text-sm"
                      value={newAddress.firstName}
                      onChange={e => setNewAddress({ ...newAddress, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block  font-poppins text-sm mb-1">Last Name <span className="text-red-500">*</span></label>
                    <input
                      required
                      className="w-full border  font-poppins rounded px-3 py-2 text-sm"
                      value={newAddress.lastName}
                      onChange={e => setNewAddress({ ...newAddress, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block  font-poppins text-sm mb-1">Company</label>
                  <input
                    
                    className="w-full border  font-poppins rounded px-3 py-2 text-sm"
                    value={newAddress.company}
                    onChange={e => setNewAddress({ ...newAddress, company: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block  font-poppins text-sm mb-1">Street Address <span className="text-red-500">*</span></label>
                  <input
                    required
                    className="w-full  font-poppins border rounded px-3 py-2 text-sm"
                    value={newAddress.street}
                    onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block  font-poppins text-sm mb-1">Address Line 2 <span className="text-red-500">*</span></label>
                  <input
                    required
                    className="w-full  font-poppins border rounded px-3 py-2 text-sm"
                    value={newAddress.addressLine2}
                    onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block  font-poppins text-sm mb-1">City <span className="text-red-500">*</span></label>
                    <input
                      required
                      className="w-full border  font-poppins rounded px-3 py-2 text-sm"
                      value={newAddress.city}
                      onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block  font-poppins text-sm mb-1">Country / Region <span className="text-red-500">*</span></label>
                    <input
                      required
                      className="w-full border  font-poppins rounded px-3 py-2 text-sm"
                      value={newAddress.country}
                      onChange={e => setNewAddress({ ...newAddress, country: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block  font-poppins text-sm mb-1">State <span className="text-red-500">*</span></label>
                    <input
                      required
                      className="w-full border  font-poppins rounded px-3 py-2 text-sm"
                      value={newAddress.state}
                      onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-poppins text-sm mb-1">Zip Code <span className="text-red-500">*</span></label>
                    <input
                      required
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={newAddress.zip}
                      onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-poppins text-sm mb-1">Email <span className="text-red-500">*</span></label>
                    <input
                      required
                      className="w-full border font-poppins rounded px-3 py-2 text-sm"
                      value={newAddress.email}
                      onChange={e => setNewAddress({ ...newAddress, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-poppins text-sm mb-1">Phone <span className="text-red-500">*</span></label>
                    <input
                      required
                      className="w-full border font-poppins rounded px-3 py-2 text-sm"
                      value={newAddress.phone}
                      onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  className="w-full bg-[#007048] font-poppins text-white py-3 rounded-lg font-medium mt-4 active:bg-[#005a3c]"
                  onClick={handleAddressSave}
                >
                  Save Address
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <p className="text-center font-poppins text-gray-500 py-10">No addresses saved yet</p>
              ) : (
                addresses.map(addr => (
                  <div key={addr.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold font-poppins">{addr.type || 'Home'}</p>
                        <p className="text-gray-700 font-poppins">{addr.address}</p>
                        <p className="text-sm font-poppins text-gray-500">{addr.addressLine2}</p>
                        <p className="text-sm font-poppins text-gray-500">
                          {addr.city}, {addr.state} {addr.zipCode}
                        </p>
                        <p className="text-sm font-poppins text-gray-500">{addr.country}</p>
                        <p className="text-sm font-poppins text-gray-500 mt-1">
                          {addr.firstName} {addr.lastName} • {addr.phone}
                        </p>
                        {addr.email && <p className="text-sm font-poppins text-gray-500">{addr.email}</p>}
                      </div>
                      <div className="flex gap-3 font-poppins text-sm">
                        <button
                          className="text-blue-600 font-poppins hover:underline"
                          onClick={() => {
                            openAddressEditor(addr);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 font-poppins hover:underline"
                          onClick={() => handleAddressDelete(addr.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <button
                onClick={() => openAddressEditor(null)}
                className="w-full py-3 border-2 border-gray-300 rounded-lg font-poppins text-gray-700 font-medium hover:bg-gray-50 mt-4"
              >
                + Add New Address
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }






  if (showProfile) {
    return (
      <div className="bg-gray-50 min-h-screen w-full md:hidden">
        {/* Header */}
        <div className="flex items-center p-4 bg-white border-b sticky top-0 z-10">
          <button 
            onClick={() => setShowProfile(false)}
            className="mr-3 text-2xl font-bold"
          >
            ←
          </button>
          <h1 className="font-semibold font-poppins text-lg">Profile</h1>
        </div>

        <div className="p-5">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-poppins font-medium text-gray-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={primaryAddress?.firstName || profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full border font-poppins border-gray-300 rounded-lg px-4 py-3 text-base outline-none focus:border-[#007048] focus:ring-1 focus:ring-[#007048]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={primaryAddress?.lastName || profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full border font-poppins border-gray-300 rounded-lg px-4 py-3 text-base outline-none focus:border-[#007048] focus:ring-1 focus:ring-[#007048]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={primaryAddress?.email || profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full border font-poppins border-gray-300 rounded-lg px-4 py-3 text-base outline-none focus:border-[#007048] focus:ring-1 focus:ring-[#007048]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={primaryAddress?.phone || profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins outline-none focus:border-[#007048] focus:ring-1 focus:ring-[#007048]"
                />
              </div>
            </div>

            <button
              onClick={() => {
                // Here you can add real save logic (API call, context, etc.)
                alert('Profile updated successfully!');
                // Optional: persist to localStorage if needed
                localStorage.setItem('profileData', JSON.stringify(profileData));
              }}
              className="w-full bg-[#007048] font-poppins text-white py-3.5 rounded-lg font-medium mt-8 active:bg-[#005a3c] transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }







  // ────────────────────────────────────────────────
  // Main Account Screen
  // ────────────────────────────────────────────────
  const displayFirstName = (primaryAddress?.firstName || profileData.firstName || '').trim();
  const displayLastName = (primaryAddress?.lastName || profileData.lastName || '').trim();
  const fallbackName = String(user?.name || '').trim();
  const displayName = [displayFirstName, displayLastName].filter(Boolean).join(' ') || fallbackName || 'Guest';
  const displayPhone = primaryAddress?.phone || profileData.phone || user?.phone || '';
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'G';

  return (
    <div className="bg-gray-50 min-h-screen w-full md:hidden">
      {/* Header */}
      <div className="flex items-center p-4 bg-white border-b">
        <span className="font-semibold font-poppins text-lg">Account</span>
      </div>

      {/* Profile */}
      <div className="flex flex-col items-center py-6 bg-white">
        <div className="w-16 h-16 rounded-full bg-[#007048] flex items-center justify-center text-3xl text-white mb-2">
          {avatarLetter}
        </div>
        <div className="font-semibold font-poppins text-xl">{displayName}</div>
        <div className="text-gray-500 font-poppins text-sm">{displayPhone || 'No phone added'}</div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-around py-5 bg-white border-b">
        <button
          onClick={() => setShowOrders(true)}
          className="cursor-pointer flex flex-col items-center active:opacity-70"
        >
          <span className="text-2xl">📦</span>
          <span className="text-xs font-poppins mt-1">Your Orders</span>
        </button>

        <button
          onClick={() => setShowSupport(true)}
          className="cursor-pointer flex flex-col items-center active:opacity-70"
        >
          <span className="text-2xl">💬</span>
          <span className="text-xs font-poppins mt-1">Help & Support</span>
        </button>

        <div onClick={() => navigate('/wishlist')}          // ← navigate to route
  className="cursor-pointer flex flex-col items-center active:opacity-70">
          <span className="text-2xl">❤️</span>
          <span className="text-xs font-poppins mt-1">Wishlist</span>
        </div>
      </div>

      


      {/* Update Available */}
      <div className="bg-white p-4 border-b flex items-center justify-between">
        <div>
          <div className="font-semibold font-poppins text-sm">Update Available</div>
          <div className="text-xs font-poppins text-gray-500">Enjoy a more seamless shopping experience</div>
        </div>
        <span className="bg-green-200 text-green-700 font-poppins text-xs px-2 rounded">New</span>
      </div>

      {/* Your Information */}
      <div className="bg-white mt-4 p-4 rounded-lg">
        <div className="font-semibold font-poppins mb-2">Your Information</div>
        <div className="space-y-3">
          <div onClick={() => navigate('/wishlist')}          // ← navigate to route
  
          className="flex items-center justify-between">
            <span className="font-poppins">&#10084; Your Wishlist</span>
            <span>&#8250;</span>
          </div>
          <div onClick={() => setShowSupport(true)}
          className="flex items-center justify-between">
            <span className="font-poppins">&#128172; Help & Support</span>
            <span>&#8250;</span>
          </div>

          <div onClick={() => setShowAddresses(true)}
          className="flex items-center justify-between">
            <span className="font-poppins">&#128205; Saved Addresses <span className="text-xs text-gray-500 ml-1">{addresses.length} Addresses</span></span>
            <span>&#8250;</span>
          </div>
          <div onClick={() => setShowProfile(true)}
          className="flex items-center justify-between">
            <span className="font-poppins">&#128100; Profile</span>
            <span>&#8250;</span>
          </div>
          
        </div>
      </div>

      {/* Other Information */}
      <div className="bg-white mt-4 p-4 rounded-lg">
        <div className="font-semibold font-poppins mb-2">Other Information</div>
        <div className="space-y-3">
          <div onClick={() => setShowSuggestProducts(true)}
          className="flex items-center justify-between">
            <span className="font-poppins">&#11088; Suggest Products</span>
            <span>&#8250;</span>
          </div>
          <div onClick={() => setShowNotifications(true)}
          className="flex items-center justify-between">
            <span className="font-poppins">&#128276; Notifications</span>
            <span>&#8250;</span>
          </div>
          
        </div>
      </div>


      {/* Log Out */}
      <div className="mt-6 mb-4 px-4">
        <button className="w-full bg-white border border-red-400 text-red-600 py-3 rounded-lg font-medium">
          Log Out
        </button>
      </div>
    </div>
  );
}
