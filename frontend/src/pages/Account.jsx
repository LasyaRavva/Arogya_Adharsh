import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import avatarImage from '../assets/customer1.jpg';
import organicoil from '../assets/organic oil.jpg';
import { API_BASE_URL } from '../config';  

const resolveMediaSrc = (value, fallback = organicoil) => {
  if (!value) return fallback;
  if (value.startsWith('data:') || value.startsWith('blob:')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE_URL}/${String(value).replace(/^\/+/, '')}`;
};

export default function Account() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('orders');
  const [user, setUser] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [ratingSidebar, setRatingSidebar] = useState({ open: false, order: null });
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [itemRating, setItemRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
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

  // Sample referral data
  const [referrals, setReferrals] = useState([
    { id: 1, name: 'Alice', date: '20th Feb 2026', reward: '₹100', status: 'Completed' },
    { id: 2, name: 'Bob', date: '22nd Feb 2026', reward: '₹50', status: 'Pending' },
    { id: 3, name: 'Charlie', date: '24th Feb 2026', reward: '₹75', status: 'Completed' }
  ]);

  // Copy referral code handler
  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText('AROGYA2026');
    alert('Referral code copied!');
  };

  const [orders, setOrders] = useState([]);

  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+91 9567438291',
    profileImage: avatarImage
  });

  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const customerData = localStorage.getItem('customer');
    if (token && customerData) {
      try {
        const customer = JSON.parse(customerData);
        setUser(customer);
        const rawName = String(customer?.name || '').trim();
        const nameParts = rawName ? rawName.split(/\s+/) : [];
        const firstFromUser = nameParts[0] || '';
        const lastFromUser = nameParts.slice(1).join(' ');

        setProfileData((prev) => ({
          ...prev,
          firstName: firstFromUser || prev.firstName,
          lastName: lastFromUser || prev.lastName,
          email: customer?.email || prev.email,
          phone: customer?.phone || prev.phone,
        }));
      } catch (error) {
        console.error('Error parsing customer data:', error);
      }
    }
  }, []);

  const formatOrderDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString();
  };

  const formatOrderStatus = (status) => {
    if (!status) return 'Order confirmed';
    const normalized = String(status).toUpperCase();
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
    if (!token || !user?.cus_id) {
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
          const amount = Number(order.total_amount || 0).toFixed(2);
          const imagePath = resolveMediaSrc(order.items?.[0]?.product_image, organicoil);

          const itemLines = (order.items || []).map((item) => {
            const lineTotal = Number((item.price || 0) * (item.quantity || 0)).toFixed(2);
            const variantText = item.variant_label || item.variant_sku;
            return `${item.product_name || 'Product'}${variantText ? ` (${variantText})` : ''} - ${item.quantity}x - ${order.currency_code} ${lineTotal}`;
          });

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
            deliveredDate: order.status === 'DELIVERED' && order.delivered_at ? formatOrderDate(order.delivered_at) : null,
            amount: `${order.currency_code} ${amount}`,
            itemCount: order.items?.length || 0,
            items: itemLines,
            rawItems: order.items || [],
            deliveryAddress,
            timeline: buildTimeline(order.status, order.created_at, order.shipped_at, order.delivered_at, order.payment_status, order.shipping_carrier),
          };
        });

        setOrders(transformed);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };

    fetchOrders();
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user?.cus_id) {
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
          countryId: addr.country_id,
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
        console.error('Failed to fetch addresses:', error);
      }
    };

    fetchAddresses();
  }, [user]);

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
      !newAddress.company.trim() ||
      !newAddress.street.trim() ||
      !newAddress.addressLine2.trim() ||
      !newAddress.city.trim() ||
      !newAddress.country.trim() ||
      !newAddress.state.trim() ||
      !newAddress.zip.trim() ||
      !newAddress.email.trim() ||
      !newAddress.phone.trim()
    ) {
      alert('All address fields are required.');
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
        countryId: data.country_id,
      };

      if (editAddressId) {
        setAddresses((prev) => prev.map((addr) => (addr.id === editAddressId ? mapped : addr)));
      } else {
        setAddresses((prev) => [mapped, ...prev]);
      }

      resetAddressForm();
    } catch (error) {
      console.error('Save address error:', error);
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
      console.error('Delete address error:', error);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('customer');
    localStorage.removeItem('userProfileImage');
    window.dispatchEvent(new Event('auth-changed'));
    navigate('/home', { replace: true });
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return profileData.firstName.charAt(0).toUpperCase();
  };

  const handleProfileSave = () => {
    const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();

    const updatedCustomer = {
      ...(user || {}),
      name: fullName || user?.name || profileData.firstName,
      email: profileData.email,
      phone: profileData.phone,
    };

    setUser(updatedCustomer);
    localStorage.setItem('customer', JSON.stringify(updatedCustomer));
    window.dispatchEvent(new Event('auth-changed'));
    alert('Profile updated successfully!');
  };

  // Handler functions for order actions
  const handleTrackOrder = (order) => {
    alert(`Tracking Order #${order.id}\n\nStatus: ${order.status}\nPlaced: ${order.placedDate}\n\nYou can track your order in real-time. The courier will contact you before delivery.`);
  };

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
    } else {
      order.items.forEach((item) => {
        const itemName = item.split(' - ')[0];
        const quantity = parseInt(item.split('x')[0].split('-')[1].trim(), 10) || 1;
        const amountNumber = parseFloat(String(order.amount).replace(/[^0-9.]/g, '')) || 0;

        addToCart(
          {
            id: Math.random(),
            name: itemName,
            price: amountNumber / (order.itemCount || 1),
            image: order.image,
          },
          quantity
        );
      });
    }
    
    alert(`Items from Order #${order.id} have been added to your cart!`);
  };

  const handleReturn = (order) => {
    if (order.status !== 'Order delivered') {
      alert('You can only return delivered orders.');
      return;
    }
    
    const confirmReturn = window.confirm(
      `Do you want to return Order #${order.id}?\n\nAmount: ${order.amount}\nDelivered: ${order.deliveredDate}\n\nA return request will be initiated and our team will contact you.`
    );
    
    if (confirmReturn) {
      alert('Return request submitted successfully! Our team will contact you within 24 hours.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div>
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setActiveTab('orders')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-poppins font-bold text-gray-900">Orders</h1>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {orders.length === 0 && (
                <div className="border border-gray-200 rounded-lg p-6 bg-white text-center text-gray-600 font-poppins">
                  No orders yet.
                </div>
              )}
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="w-full font-poppins text-left px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-4 items-start">
                      {/* Product Image */}
                      <div className="relative">
                        <img
                          src={order.image}
                          alt="Product"
                          className="w-16 h-16 object-cover font-poppins rounded-lg"
                        />
                        {/* Item Count Badge */}
                        {/* <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                          {order.itemCount}
                        </div> */}
                      </div> 

                      {/* Order Details */}
                      <div className="flex-1">
                        {/* Status and Date */}
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold font-poppins text-gray-900 text-sm">{order.status}</h3>
                          <svg className="w-4 h-4 text-[#007048]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-xs font-poppins text-gray-500 mb-2">Placed at {order.placedDate}</p>
                        <div className="mb-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-poppins font-semibold ${order.paymentStatus === 'Unpaid' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            Payment: {order.paymentStatus}
                          </span>
                        </div>
                        
                        {/* Item List Preview */}
                        {order.items.length > 0 && (
                          <div className="text-xs font-poppins text-gray-600 mb-2">
                            {order.items.slice(0, 1).map((item, idx) => (
                              <div key={idx}>{item}</div>
                            ))}
                            {order.items.length > 1 && (
                              <div className="text-gray-500">+{order.items.length - 1} more</div>
                            )}
                          </div>
                        )}
                        {order.deliveryAddress && (
                          <p className="text-xs font-poppins text-gray-500 mb-1">Address: {order.deliveryAddress}</p>
                        )}
                      </div>

                      {/* Amount and Expand Icon */}
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-lg font-bold text-gray-900">{order.amount}</p>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedOrder === order.id ? 'rotate-180' : ''
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedOrder === order.id && (
                    <div className="border-t border-gray-200 px-5 py-4 bg-gray-50">
                      {/* Items List */}
                      <div className="mb-6">
                        <h4 className="text-sm font-poppins font-semibold text-gray-900 mb-3">Items in this order</h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm font-poppins text-gray-700 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="mb-6">
                        <h4 className="text-sm font-poppins font-semibold text-gray-900 mb-3">Delivery Timeline</h4>
                        <div className="space-y-3">
                          {order.timeline.map((event, idx) => (
                            <div key={idx} className="flex gap-4">
                              <div className="flex font-poppins flex-col items-center">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    event.completed ? 'bg-[#007048]' : 'bg-gray-300'
                                  }`}
                                />
                                {idx < order.timeline.length - 1 && (
                                  <div
                                    className={`w-0.5 h-8 ${
                                      event.completed ? 'bg-[#007048]' : 'bg-gray-300'
                                    }`}
                                  />
                                )}
                              </div>
                              <div className="pb-3">
                                <p className="text-sm font-poppins font-medium text-gray-900">{event.step}</p>
                                <p className="text-xs font-poppins text-gray-500">{event.date}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 flex-wrap">
                        <button 
                          onClick={() => handleTrackOrder(order)}
                          className="flex-1 font-poppins min-w-[120px] px-4 py-2 border border-[#007048] text-[#007048] rounded-lg text-sm font-medium hover:bg-[#f4e7cf] transition-colors"
                        >
                          Track Order
                        </button>
                        <button 
                          onClick={() => handleReorder(order)}
                          className="flex-1 font-poppins min-w-[120px] px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                          Reorder
                        </button>
                        <button 
                          onClick={() => handleReturn(order)}
                          disabled={order.status !== 'Order delivered'}
                          className={`flex-1 font-poppins min-w-[120px] px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                            order.status === 'Order delivered'
                              ? 'border-red-300 text-red-600 hover:bg-red-50'
                              : 'border-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Return
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Rate Button - Always Visible */}
                  {/* <div className={`text-center py-3 border-t border-gray-100 ${expandedOrder === order.id ? 'bg-gray-50' : 'bg-white'}`}>
                    <button
                      className="text-sm font-poppins font-medium text-gray-600 hover:text-gray-900 transition-colors"
                      onClick={() => handleOpenRatingSidebar(order)}
                    >
                      ⭐ Rate your order
                    </button>
                  </div> */}
                </div>
              ))}
            </div>
          </div>
        );

      case 'addresses':
        return (
          <div>
            <h2 className="text-2xl font-poppins font-bold text-gray-900 mb-6">Addresses</h2>
            {showAddressForm ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-poppins font-bold mb-4">Billing Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block mb-1">First name <span className="text-red-500">*</span></label>
                    <input required className="w-full border rounded px-3 py-2 font-poppins" value={newAddress.firstName} onChange={e => setNewAddress({...newAddress, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block mb-1">Last name <span className="text-red-500">*</span></label>
                    <input required className="w-full border rounded px-3 py-2 font-poppins" value={newAddress.lastName} onChange={e => setNewAddress({...newAddress, lastName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block mb-1">Company Name <span className="text-red-500">*</span></label>
                    <input required className="w-full border rounded px-3 py-2 font-poppins" value={newAddress.company} onChange={e => setNewAddress({...newAddress, company: e.target.value})} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Street Address <span className="text-red-500">*</span></label>
                  <input required className="w-full border rounded px-3 py-2 font-poppins" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Address Line 2 <span className="text-red-500">*</span></label>
                  <input required className="w-full border rounded px-3 py-2 font-poppins" value={newAddress.addressLine2} onChange={e => setNewAddress({...newAddress, addressLine2: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block mb-1">City <span className="text-red-500">*</span></label>
                    <input required className="w-full border rounded px-3 py-2 font-poppins" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                  </div>
                  <div>
                    <label className="block mb-1">Country / Region <span className="text-red-500">*</span></label>
                    <input required className="w-full border rounded px-3 py-2 font-poppins" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} />
                  </div>
                  <div>
                    <label className="block mb-1">States <span className="text-red-500">*</span></label>
                    <input required className="w-full border rounded px-3 py-2 font-poppins" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                  </div>
                  <div>
                    <label className="block mb-1">Zip Code <span className="text-red-500">*</span></label>
                    <input required className="w-full border rounded px-3 py-2 font-poppins" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-1">Email <span className="text-red-500">*</span></label>
                    <input required className="w-full border rounded px-3 py-2 font-poppins" value={newAddress.email} onChange={e => setNewAddress({...newAddress, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block mb-1">Phone <span className="text-red-500">*</span></label>
                    <input required className="w-full border rounded px-3 py-2 font-poppins" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                  </div>
                </div>
                <button
                  className="bg-green-700 text-white font-poppins px-8 py-2 rounded-lg font-semibold hover:bg-green-800"
                  onClick={handleAddressSave}
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold font-poppins text-gray-900 mb-1">{addr.type}</p>
                          <p className="text-gray-700 font-poppins mb-1">{addr.address}</p>
                          <p className="text-sm font-poppins text-gray-500">{addr.addressLine2}</p>
                          <p className="text-sm font-poppins text-gray-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                          <p className="text-sm font-poppins text-gray-500">{addr.country}</p>
                          <p className="text-sm font-poppins text-gray-500">{addr.firstName} {addr.lastName} {addr.company && `(${addr.company})`}</p>
                          <p className="text-sm font-poppins text-gray-500">{addr.email} {addr.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-sm text-blue-600 font-poppins hover:text-blue-700 font-medium" onClick={() => {
                            openAddressEditor(addr);
                          }}>Edit</button>
                          <button className="text-sm text-red-600 font-poppins hover:text-red-700 font-medium" onClick={() => handleAddressDelete(addr.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="mt-4 w-full font-poppins py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50" onClick={() => openAddressEditor(null)}>
                    + Add New Address
                  </button>
                </div>
              </>
            )}
          </div>
        );

      case 'profile':
        return (
          <div>
            <h2 className="text-2xl font-poppins font-bold text-gray-900 mb-6">Profile</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-poppins text-gray-600 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    className="w-full font-poppins border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-poppins text-gray-600 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    className="w-full font-poppins border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-poppins text-gray-600 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full font-poppins border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-poppins text-gray-600 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full border font-poppins border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button className="bg-[#007048] font-poppins text-white px-8 py-2 rounded-lg font-semibold hover:bg-[#005a3c]" onClick={handleProfileSave}>
                Save Changes
              </button>
            </div>
          </div>
        );

        

      case 'customer-support': {
        // FAQ data
        const faqs = [
          {
            question: 'Coupons & Offers',
            answer: 'Find the latest coupons and offers in the Offers section of our app or website. Apply them at checkout to save more!'
          },
          {
            question: 'General Inquiry',
            answer: 'For general inquiries, please contact our support team via email or phone.'
          },
          {
            question: 'Payment Related',
            answer: 'We accept all major credit/debit cards, UPI, and net banking. For payment issues, contact support.'
          },
          {
            question: 'Feedback & Suggestions',
            answer: 'We value your feedback! Please use the feedback form or email us your suggestions.'
          },
          {
            question: 'Order / Products Related',
            answer: 'For order or product issues, go to My Orders and select the relevant order to raise a concern.'
          },
          {
            question: 'Gift Card',
            answer: 'Gift cards can be purchased and redeemed during checkout. For issues, contact support.'
          },
          {
            question: 'No-Cost EMI',
            answer: 'No-Cost EMI is available on select products. Check eligibility at checkout.'
          },
          {
            question: 'Wallet Related',
            answer: 'Check your wallet balance in your profile. For wallet issues, contact support.'
          },
        ];
        return (
          <div>
            <h2 className="text-2xl font-poppins font-bold text-gray-900 mb-4">FAQs</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-0 divide-y divide-gray-200">
              {faqs.map((faq, idx) => (
                <div key={idx}>
                  <button
                    className="w-full flex justify-between items-center px-6 py-5 text-left focus:outline-none hover:bg-gray-50"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <span className="font-medium font-poppins text-gray-900 text-base">{faq.question}</span>
                    <svg className="w-5 h-5 text-[#007048]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-5 text-gray-700 text-sm animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'referrals':
        return (
          <div>
            <h2 className="text-2xl font-bold font-poppins text-gray-900 mb-4">Manage Referrals</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <p className="text-gray-600 font-poppins mb-4">Share your referral code and earn rewards!</p>
              <div className="bg-[#f0f8f0] border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm font-poppins text-gray-600 mb-2">Your Referral Code</p>
                <p className="text-2xl font-bold font-poppins text-[#007048] mb-4 font-mono">AROGYA2026</p>
                <button className="bg-[#007048] font-poppins text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#005a3c]" onClick={handleCopyReferralCode}>
                  Copy Code
                </button>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-s font-poppins font-semibold mb-3">Your Referrals</h3>
              <table className="w-full font-poppins text-left">
                <thead>
                  <tr>
                    <th className="py-2 px-3 border-b">Name</th>
                    <th className="py-2 px-3 border-b">Date</th>
                    <th className="py-2 px-3 border-b">Reward</th>
                    <th className="py-2 px-3 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map(ref => (
                    <tr key={ref.id}>
                      <td className="py-2 px-3 border-b">{ref.name}</td>
                      <td className="py-2 px-3 border-b">{ref.date}</td>
                      <td className="py-2 px-3 border-b">{ref.reward}</td>
                      <td className="py-2 px-3 border-b">{ref.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleCloseRatingSidebar = () => {
    setRatingSidebar({ open: false, order: null });
  };

  const handleSubmitRating = () => {
    // You can send this data to backend or show a confirmation
    alert('Thank you for your feedback!');
    handleCloseRatingSidebar();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row gap-6 w-full mx-0 px-5 lg:px-4 py-4">
        {/* Left Sidebar */}
        <div className="w-full lg:w-60 flex-shrink-0">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#007048] font-poppins flex items-center justify-center text-white text-2xl font-bold">
                {getInitials()}
              </div>
              <div>
                <p className="font-bold font-poppins text-gray-900">{`${profileData.firstName} ${profileData.lastName}`.trim() || user?.name || profileData.firstName}</p>
                <p className="text-sm font-poppins text-gray-500">{profileData.phone || user?.phone}</p>
              </div>
            </div>

            {/* Wallet Card */}
            {/* <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white mb-4">
              <p className="text-sm opacity-90 mb-1">Wallet Balance</p>
              <p className="text-2xl font-bold mb-4">₹{walletBalance}</p>
              <button className="w-full bg-white text-purple-600 font-semibold py-2 rounded-lg hover:bg-gray-100">
                Add Balance
              </button>
            </div> */}
          </div>

          {/* Navigation Menu */}
          <nav className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-6 py-3 flex items-center gap-2 transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[#007048] text-white border-l-4 border-[#007048]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className='text-sm font-poppins'>Orders</div>
            </button>

            <button
              onClick={() => setActiveTab('customer-support')}
              className={`w-full text-left px-6 py-3 flex items-center gap-2 transition-colors border-t border-gray-200 ${
                activeTab === 'customer-support'
                  ? 'bg-[#007048] text-white border-l-4 border-[#007048]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat-text" viewBox="0 0 16 16">
                <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"/>
                <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8m0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5"/>
              </svg>
              <div className='text-sm font-poppins'>Customer Support</div>
            </button>

            <button
              onClick={() => setActiveTab('referrals')}
              className={`w-full text-left px-6 py-3 flex items-center gap-2 transition-colors border-t border-gray-200 ${
                activeTab === 'referrals'
                  ? 'bg-[#007048] text-white border-l-4 border-[#007048]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <div className='text-sm font-poppins'>Manage Referrals</div>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full text-left px-6 py-3 flex items-center gap-2 transition-colors border-t border-gray-200 ${
                activeTab === 'addresses'
                  ? 'bg-[#007048] font-poppins text-white border-l-4 border-[#007048]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div className='text-sm font-poppins'>Addresses</div>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-6 py-3 flex items-center gap-2 transition-colors border-t border-gray-200 ${
                activeTab === 'profile'
                  ? 'bg-[#007048] font-poppins text-white border-l-4 border-[#007048]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <div className='text-sm font-poppins'>Profile</div>
            </button>
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full mt-4 border-2 border-red-500 text-red-500 font-semibold py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            Log Out
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg p-6 md:p-8 border border-gray-200 min-h-[600px]">
          {renderContent()}
        </div>
      </div>
      {/* Rating Sidebar Modal */}
      {ratingSidebar.open && (
        <div className="fixed inset-0 z-50 flex justify-end items-stretch bg-black bg-opacity-30">
          <div className="w-full max-w-[400px] h-full bg-white shadow-xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center px-6 py-4 border-b border-gray-200">
              <button onClick={handleCloseRatingSidebar} className="p-2 mr-2">
                <svg className="w-6 h-6 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-bold text-gray-900">How was your order?</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Delivery Experience */}
              <div className="mb-6 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <img src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" alt="Delivery" className="w-10 h-10 rounded-full" />
                  <span className="font-semibold text-gray-900">Rate delivery experience</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} onClick={() => setDeliveryRating(star)}>
                      <svg className={`w-7 h-7 ${deliveryRating >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.462a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.54 1.118l-3.388-2.462a1 1 0 00-1.175 0l-3.388 2.462c-.785.57-1.84-.197-1.54-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.045 9.401c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {/* Item Rating */}
              <div className="mb-6">
                <span className="font-semibold text-gray-900 mb-2 block">How did you find the items?</span>
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                  <img src={ratingSidebar.order?.image} alt="Item" className="w-10 h-10 rounded-lg" />
                  <span className="font-semibold text-gray-900">{ratingSidebar.order?.items[0]?.split(' - ')[0] || 'Item'}</span>
                  <div className="flex gap-2 ml-auto">
                    {[1,2,3,4,5].map((star) => (
                      <button key={star} onClick={() => setItemRating(star)}>
                        <svg className={`w-7 h-7 ${itemRating >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.462a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.54 1.118l-3.388-2.462a1 1 0 00-1.175 0l-3.388 2.462c-.785.57-1.84-.197-1.54-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.045 9.401c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Feedback */}
              <div className="mb-6">
                <span className="font-semibold text-gray-900 mb-2 block">Any other feedback?</span>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[80px] outline-none focus:border-blue-500"
                  placeholder="Write your suggestions or reviews here..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                className="w-full bg-gray-400 text-white font-semibold py-3 rounded-lg text-lg hover:bg-gray-500 transition-colors"
                onClick={handleSubmitRating}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
