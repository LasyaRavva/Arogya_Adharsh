import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config';

const emptyAddress = {
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
};

const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

const parseStoredJson = (storage, key, fallback = null) => {
  try {
    return JSON.parse(storage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
};

const parseApiResponse = async (response, htmlFallbackMessage) => {
  const rawResponse = await response.text();

  if (!rawResponse) {
    return {};
  }

  try {
    return JSON.parse(rawResponse);
  } catch {
    return {
      error: rawResponse.startsWith('<!DOCTYPE')
        ? htmlFallbackMessage
        : 'Unexpected server response.',
    };
  }
};

const RequiredField = ({
  label,
  value,
  onChange,
  placeholder,
  wrapperClassName = '',
  inputClassName = '',
  type = 'text',
}) => (
  <div className={wrapperClassName}>
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {label} <span className="text-red-500">*</span>
    </label>
    <input
      required
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border border-gray-300 rounded px-3 py-2 ${inputClassName}`.trim()}
    />
  </div>
);

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const existingScript = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_SRC}"]`);
    const handleLoad = () => resolve(window.Razorpay);
    const handleError = () => reject(new Error('Failed to load Razorpay checkout. Please try again.'));

    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        resolve(window.Razorpay);
        return;
      }

      existingScript.addEventListener('load', handleLoad, { once: true });
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve(window.Razorpay);
    };
    script.onerror = handleError;
    document.body.appendChild(script);
  });

const buildPaymentLabel = (paymentMethod, paymentLabel) => {
  if (paymentLabel) return paymentLabel;
  if (paymentMethod === 'cod') return 'Cash On Delivery';
  if (paymentMethod === 'paypal') return 'PayPal';
  if (paymentMethod === 'upi') return 'Razorpay UPI';
  return 'Unknown';
};

export default function Address() {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const formTopRef = useRef(null);

  const pendingOrderPayload = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('pendingOrderPayload') || 'null');
    } catch {
      return null;
    }
  }, []);

  const pendingOrderMeta = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('pendingOrderMeta') || '{}');
    } catch {
      return {};
    }
  }, []);

  const storedCustomer = useMemo(() => parseStoredJson(localStorage, 'customer', null), []);
  const isCheckoutFlow = Boolean(pendingOrderPayload);
  const isRazorpayUpiCheckout = pendingOrderMeta.paymentMethod === 'upi';
  const paymentLabel = buildPaymentLabel(
    pendingOrderMeta.paymentMethod,
    pendingOrderMeta.paymentLabel
  );

  const selectedAddress = useMemo(
    () => addresses.find((address) => Number(address.id) === Number(selectedAddressId)) || null,
    [addresses, selectedAddressId]
  );

  const fetchAddresses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/customer-addresses/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) {
        setAddresses([]);
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
      const primary =
        transformed.find((address) => String(address.type || '').toLowerCase() === 'default') ||
        transformed[0] ||
        null;
      setSelectedAddressId(primary?.id || null);
    } catch (error) {
      console.error('Fetch addresses error:', error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {


    fetchAddresses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showAddressForm) return;
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [showAddressForm]);

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setEditAddressId(null);
    setNewAddress(emptyAddress);
  };

  const openAddressEditor = (addr = null) => {
    setShowAddressForm(true);
    if (!addr) {
      setEditAddressId(null);
      setNewAddress(emptyAddress);
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

  const handleAddressSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

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
      setSubmitting(true);
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

      resetAddressForm();
      await fetchAddresses();
    } catch (error) {
      console.error('Save address error:', error);
      alert('Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddressDelete = async (addressId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!window.confirm('Delete this address?')) return;

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

      await fetchAddresses();
    } catch (error) {
      console.error('Delete address error:', error);
      alert('Failed to delete address');
    }
  };

  const createAppOrder = async (token, overrides = {}) => {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...pendingOrderPayload,
        address_id: selectedAddressId,
        ...overrides,
      }),
    });

    const data = await parseApiResponse(
      response,
      'Orders API not found. Restart backend server and ensure it runs on the API URL.'
    );

    if (!response.ok) {
      throw new Error(data.error || `Failed to place order (${response.status})`);
    }

    return data;
  };

  const verifyRazorpayPayment = async (token, paymentResult) => {
    const response = await fetch(`${API_BASE_URL}/api/payments/razorpay/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentResult),
    });

    const data = await parseApiResponse(
      response,
      'Payments API not found. Restart backend server and ensure it runs on the API URL.'
    );

    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify Razorpay payment.');
    }

    return data;
  };

  const startRazorpayUpiCheckout = async (token) => {
    if (!pendingOrderPayload?.total_amount) {
      throw new Error('Pending order total is missing. Please restart checkout.');
    }

    await loadRazorpayScript();




    if (!window.Razorpay) {
      throw new Error('Razorpay checkout is unavailable. Please refresh and try again.');
    }

    const createRazorpayOrderResponse = await fetch(`${API_BASE_URL}/api/payments/razorpay/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: pendingOrderPayload.total_amount,
        currency: pendingOrderPayload.currency_code || 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          address_id: selectedAddressId,
          customer_email: selectedAddress?.email || storedCustomer?.email || '',
          customer_name:
            `${selectedAddress?.firstName || ''} ${selectedAddress?.lastName || ''}`.trim() ||
            storedCustomer?.name ||
            '',
        },
      }),
    });



    const razorpayOrder = await parseApiResponse(
      createRazorpayOrderResponse,
      'Payments API not found. Restart backend server and ensure it runs on the API URL.'
    );

    if (!createRazorpayOrderResponse.ok) {
      throw new Error(razorpayOrder.error || 'Failed to start Razorpay checkout.');
    }

    return new Promise((resolve, reject) => {
      let finished = false;
      let handlerInvoked = false;

      const resolveOnce = (value) => {
        if (finished) return;
        finished = true;
        resolve(value);
      };

      const rejectOnce = (error) => {
        if (finished) return;
        finished = true;
        reject(error instanceof Error ? error : new Error(String(error)));
      };

      const prefillName =
        `${selectedAddress?.firstName || ''} ${selectedAddress?.lastName || ''}`.trim() ||
        storedCustomer?.name ||
        '';

      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: razorpayOrder.name || 'Arogya Adharsh',
        description: razorpayOrder.description || 'UPI payment',
        order_id: razorpayOrder.orderId,
        prefill: {
          name: prefillName,
          email: selectedAddress?.email || storedCustomer?.email || '',
          contact: selectedAddress?.phone || '',
        },
        notes: {
          address_id: String(selectedAddressId || ''),
          customer_id: String(storedCustomer?.cus_id || ''),
          payment_method: 'UPI',
        },
        theme: {
          color: '#007048',
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            if (handlerInvoked) return;
            rejectOnce(new Error('Razorpay checkout was cancelled.'));
          },
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay using UPI',
                instruments: [
                  {
                    method: 'upi',
                  },
                ],
              },
            },
            sequence: ['block.upi'],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        handler: async (paymentResult) => {
          handlerInvoked = true;
          let verifiedPaymentId = null;

          try {
            const verification = await verifyRazorpayPayment(token, paymentResult);
            verifiedPaymentId = verification?.payment?.id || paymentResult.razorpay_payment_id;

            await createAppOrder(token, {
              shipping_carrier: 'Razorpay UPI',
              payment_status: 'PAID',
              payment_gateway: 'RAZORPAY',
              payment_reference: verifiedPaymentId,
            });

            resolveOnce({ paymentId: verifiedPaymentId });
          } catch (error) {
            if (verifiedPaymentId) {
              rejectOnce(
                new Error(
                  `Payment succeeded but the order could not be created. Please contact support with payment ID ${verifiedPaymentId}.`
                )
              );
              return;
            }

            rejectOnce(error);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', (event) => {
        rejectOnce(
          new Error(event?.error?.description || 'Razorpay payment failed. Please try again.')
        );
      });

      razorpayInstance.open();
    });
  };

  const finishCheckout = () => {
    sessionStorage.removeItem('pendingOrderPayload');
    sessionStorage.removeItem('pendingOrderMeta');
    clearCart();

    alert(
      `Order placed successfully!\nPayment Method: ${paymentLabel}\nTotal: ${
        pendingOrderMeta.totalFormatted || pendingOrderMeta.total || ''
      }`
    );

    navigate('/account');
  };

  const handleConfirmAddressAndPlaceOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!pendingOrderPayload) {
      alert('No pending order found. Please place order from cart.');
      navigate('/cart');
      return;
    }

    if (!selectedAddressId) {
      alert('Please select an address to continue.');
      return;
    }

    if (isRazorpayUpiCheckout && pendingOrderPayload.currency_code !== 'INR') {
      alert('UPI via Razorpay is available only for INR orders.');
      return;
    }

    try {
      setSubmitting(true);

      if (isRazorpayUpiCheckout) {
        await startRazorpayUpiCheckout(token);
      } else {
        await createAppOrder(token);
      }

      finishCheckout();
    } catch (error) {
      console.error('Place order error:', error);
      alert(error.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 md:px-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-poppins font-bold text-gray-900">Address</h1>
          <button
            onClick={() => openAddressEditor()}
            className="bg-[#007048] text-white px-5 py-2.5 rounded-full font-semibold font-poppins hover:bg-[#005a3a] transition"
          >
            Add Address
          </button>
        </div>

        {isCheckoutFlow && (
          <div className="mb-6 p-4 rounded-lg bg-[#F4E7CF] text-gray-800 font-poppins text-sm">
            {isRazorpayUpiCheckout
              ? 'Confirm your delivery address to continue to Razorpay UPI payment.'
              : 'Confirm your delivery address to place the order.'}
          </div>
        )}

        {showAddressForm && (
          <div ref={formTopRef} className="mb-8 border border-gray-200 rounded-lg p-5 bg-white">
            <h2 className="text-lg font-poppins font-semibold text-gray-900 mb-4">
              {editAddressId ? 'Edit Address' : 'Add Address'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <RequiredField
                label="First Name"
                value={newAddress.firstName}
                onChange={(e) => setNewAddress((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="First Name"
              />
              <RequiredField
                label="Last Name"
                value={newAddress.lastName}
                onChange={(e) => setNewAddress((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Last Name"
              />
              <RequiredField
                label="Company Name"
                value={newAddress.company}
                onChange={(e) => setNewAddress((p) => ({ ...p, company: e.target.value }))}
                placeholder="Company Name"
              />
              <RequiredField
                label="Email"
                type="email"
                value={newAddress.email}
                onChange={(e) => setNewAddress((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email"
              />
              <RequiredField
                label="Phone"
                type="tel"
                value={newAddress.phone}
                onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Phone"
              />
              <RequiredField
                label="Country"
                value={newAddress.country}
                onChange={(e) => setNewAddress((p) => ({ ...p, country: e.target.value }))}
                placeholder="Country"
              />
              <RequiredField
                label="Address Line 1"
                value={newAddress.street}
                onChange={(e) => setNewAddress((p) => ({ ...p, street: e.target.value }))}
                placeholder="Address Line 1"
                wrapperClassName="md:col-span-2"
              />
              <RequiredField
                label="Address Line 2"
                value={newAddress.addressLine2}
                onChange={(e) => setNewAddress((p) => ({ ...p, addressLine2: e.target.value }))}
                placeholder="Address Line 2"
                wrapperClassName="md:col-span-2"
              />
              <RequiredField
                label="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                placeholder="City"
              />
              <RequiredField
                label="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress((p) => ({ ...p, state: e.target.value }))}
                placeholder="State"
              />
              <RequiredField
                label="Zip / Postal Code"
                value={newAddress.zip}
                onChange={(e) => setNewAddress((p) => ({ ...p, zip: e.target.value }))}
                placeholder="Zip / Postal Code"
              />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleAddressSave}
                disabled={submitting}
                className="bg-[#007048] text-white px-5 py-2.5 rounded-full font-semibold hover:bg-[#005a3a] transition"
              >
                {submitting ? 'Saving...' : 'Save Address'}
              </button>
              <button
                onClick={resetAddressForm}
                className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-gray-600 font-poppins">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <div className="border border-gray-200 rounded-lg p-6 bg-white text-gray-600 font-poppins">
            No addresses found. Please add address to continue.
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between gap-4">
                  <label className="flex items-start gap-3 cursor-pointer flex-1">
                    {isCheckoutFlow && (
                      <input
                        type="radio"
                        name="selectedAddress"
                        checked={Number(selectedAddressId) === Number(addr.id)}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 w-4 h-4 accent-[#007048]"
                      />
                    )}
                    <div className="font-poppins text-sm text-gray-800">
                      <p className="font-semibold text-gray-900">{addr.firstName} {addr.lastName} {addr.type === 'Default' ? '(Default)' : ''}</p>
                      <p>{addr.company}</p>
                      <p>{addr.address}, {addr.addressLine2}</p>
                      <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                      <p>{addr.country}</p>
                      <p>{addr.email} | {addr.phone}</p>
                    </div>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAddressEditor(addr)}
                      className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleAddressDelete(addr.id)}
                      className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isCheckoutFlow && (
          <div className="mt-8">
            <button
              onClick={handleConfirmAddressAndPlaceOrder}
              disabled={submitting || !selectedAddressId}
              className="w-full bg-[#007048] text-white font-bold font-poppins text-base py-3 rounded-full hover:bg-[#005a3a] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? isRazorpayUpiCheckout
                  ? 'Opening Razorpay...'
                  : 'Processing...'
                : isRazorpayUpiCheckout
                  ? 'Confirm Address & Pay with Razorpay'
                  : 'Confirm Address & Place Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
