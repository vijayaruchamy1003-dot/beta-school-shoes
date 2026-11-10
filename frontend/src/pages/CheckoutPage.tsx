import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, authApi, cartApi } from '../api/client';
import { ShieldCheck, Lock, AlertCircle, ArrowRight, Check, Zap } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, refreshCart, getGuestCartItems } = useCart();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    recipientName: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    customerNotes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!cart || cart.items.length === 0) {
    return (
      <main className="flex-1 bg-background text-foreground py-20 px-6">
        <div className="max-w-md mx-auto paper-shadow border border-foreground/15 bg-card p-10 text-center space-y-4">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground">Add official Walkaroo footwear before checking out.</p>
          <div className="pt-2">
            <Link
              to="/catalogue"
              className="inline-block bg-primary px-8 py-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground"
            >
              Return to Catalogue
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMessage('');

      // If user is not authenticated, perform frictionless guest auto-session
      if (!user) {
        const cleanEmail = formData.email.trim().toLowerCase();
        const cleanPhone = formData.phone.trim();
        const nameParts = formData.recipientName.trim().split(' ');
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || 'Order';
        const guestPassword = `Guest#${cleanPhone.slice(-4) || '2026'}`;

        try {
          // Attempt registration
          const regRes = await authApi.register({
            email: cleanEmail,
            password: guestPassword,
            firstName,
            lastName,
            phone: cleanPhone,
          });
          login(regRes.data.token, {
            id: regRes.data.userId,
            email: regRes.data.email,
            firstName: regRes.data.firstName,
            lastName: regRes.data.lastName,
            roles: regRes.data.roles,
          });
        } catch {
          // If already registered, attempt login with default guest credentials
          try {
            const loginRes = await authApi.login({
              email: cleanEmail,
              password: guestPassword,
            });
            login(loginRes.data.token, {
              id: loginRes.data.userId,
              email: loginRes.data.email,
              firstName: loginRes.data.firstName,
              lastName: loginRes.data.lastName,
              roles: loginRes.data.roles,
            });
          } catch {
            // Proceed to checkout if session is active
          }
        }

        // Sync local guest items into the backend cart
        const guestItems = getGuestCartItems();
        for (const it of guestItems) {
          try {
            await cartApi.addToCart(it.productSizeId, it.quantity);
          } catch {
            // Stock may be validated during order creation
          }
        }
      }

      // 1. Create order and reserve stock in PostgreSQL backend
      const res = await orderApi.checkout({
        recipientName: formData.recipientName,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        customerNotes: formData.customerNotes,
      });
      const checkoutData = res.data;

      // 2. Open Razorpay Standard Checkout Popup
      if (typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection and refresh.');
      }

      const options = {
        key: checkoutData.razorpayKeyId || 'rzp_test_TtHF4jwCRWFsGV',
        amount: checkoutData.razorpayAmountInPaise || Math.round(checkoutData.totalAmount * 100),
        currency: checkoutData.currency || 'INR',
        name: 'Shoes Net - Walkaroo Footwear',
        description: `Order #${checkoutData.orderNumber}`,
        order_id: checkoutData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            setVerifying(true);
            setSubmitting(false);

            // 3. Verify payment signature on backend
            await orderApi.verifyRazorpayPayment({
              orderNumber: checkoutData.orderNumber,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            await refreshCart();
            navigate(`/orders/${checkoutData.orderNumber}/success`, {
              state: {
                order: checkoutData,
                paymentId: response.razorpay_payment_id
              }
            });
          } catch (verifyErr: any) {
            setErrorMessage(verifyErr.response?.data?.message || 'Payment signature verification failed. Please contact support.');
          } finally {
            setVerifying(false);
          }
        },
        prefill: {
          name: formData.recipientName,
          email: formData.email || user?.email,
          contact: formData.phone,
        },
        notes: {
          orderNumber: checkoutData.orderNumber,
          address: `${formData.addressLine1}, ${formData.city}, ${formData.state} - ${formData.postalCode}`,
        },
        theme: {
          color: '#1d4ed8',
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            navigate(`/orders/${checkoutData.orderNumber}/success?pending=true`, {
              state: { order: checkoutData }
            });
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setSubmitting(false);
        setErrorMessage(`Payment failed: ${resp.error?.description || 'Transaction declined by bank/gateway'}`);
      });
      rzp.open();

    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Checkout failed. Please check stock availability and try again.');
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 bg-background text-foreground">
      {/* Top Banner Header */}
      <section className="border-b border-foreground/15 py-10 md:py-14 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
            <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span>Fast Direct Checkout · No Login Required</span>
          </div>
          <h1 className="font-display mt-2 text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-none tracking-tight">
            Delivery & Payment
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Stock is reserved in PostgreSQL during checkout · Verified with Razorpay modal
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-6 space-y-6">
          
          {verifying && (
            <div className="border border-foreground bg-card p-5 text-sm flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
              <span className="font-bold uppercase tracking-wider">Verifying payment signature with Razorpay & confirming stock deduction...</span>
            </div>
          )}

          {errorMessage && (
            <div className="border border-destructive/40 bg-destructive/10 p-5 text-sm font-bold text-destructive flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRazorpayPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left: Shipping Form (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight border-b border-foreground/15 pb-4">
                1. Delivery Address & Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                    Recipient / Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.recipientName}
                    onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98450 12345"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                  Email Address (For Order Tracking & Razorpay Receipt) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="parent@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                  Address Line 1 (House/Flat No., Building, Street) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. No. 14, Sunrise Apartments, 2nd Main"
                  value={formData.addressLine1}
                  onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                  Address Line 2 (Area, Landmark)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near St. Joseph Academy"
                  value={formData.addressLine2}
                  onChange={e => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bengaluru"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Karnataka"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                    Postal PIN *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="560001"
                    maxLength={6}
                    value={formData.postalCode}
                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                  Special Delivery Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Leave at security desk, call upon arrival, etc."
                  value={formData.customerNotes}
                  onChange={e => setFormData({ ...formData, customerNotes: e.target.value })}
                  className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                />
              </div>
            </div>

            {/* Right: Order Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="border border-foreground/20 bg-card p-6 md:p-8 space-y-6">
                
                <h2 className="font-display text-xl font-bold uppercase tracking-tight border-b border-foreground/15 pb-4">
                  2. Order Summary ({cart.totalItemsCount} {cart.totalItemsCount === 1 ? 'Pair' : 'Pairs'})
                </h2>

                {/* Items list */}
                <div className="divide-y divide-foreground/10 max-h-72 overflow-y-auto pr-2 space-y-3">
                  {cart.items.map(item => (
                    <div key={item.itemId} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          Size: <strong className="text-foreground">{item.ukSize}</strong> · Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display font-bold text-sm">
                          ₹{item.itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals & Fees */}
                <div className="border-t border-foreground/15 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{cart.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (Included)</span>
                    <span>₹{cart.estimatedTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Express Delivery</span>
                    <span>FREE</span>
                  </div>
                  <div className="border-t border-foreground/15 pt-3 flex justify-between text-base font-bold text-foreground">
                    <span>Total Payable</span>
                    <span className="font-display text-xl font-black">
                      ₹{cart.estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Submit Payment Button */}
                <button
                  type="submit"
                  disabled={submitting || verifying}
                  className="w-full flex items-center justify-center gap-3 bg-blue-700 py-4 font-display text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-blue-800 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Opening Razorpay Gateway...</span>
                  ) : verifying ? (
                    <span>Confirming Payment...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{cart.estimatedTotal.toLocaleString('en-IN')} with Razorpay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground text-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>256-Bit SSL · UPI, Cards, NetBanking, Wallets supported</span>
                </div>

              </div>
            </div>

          </form>

        </div>
      </section>
    </main>
  );
};
