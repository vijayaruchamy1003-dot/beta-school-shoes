import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/client';
import { ShieldCheck, Lock, AlertCircle, ArrowRight, Check } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    recipientName: user ? `${user.firstName} ${user.lastName}` : '',
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
          <p className="text-sm text-muted-foreground">Add official uniform footwear before checking out.</p>
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

      // 1. Create order and reserve stock in PostgreSQL backend
      const res = await orderApi.checkout(formData);
      const checkoutData = res.data;

      // 2. Open Razorpay Standard Checkout Popup
      if (typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection and refresh.');
      }

      const options = {
        key: checkoutData.razorpayKeyId || 'rzp_test_TtHF4jwCRWFsGV',
        amount: checkoutData.razorpayAmountInPaise || Math.round(checkoutData.totalAmount * 100),
        currency: checkoutData.currency || 'INR',
        name: 'BETA School Footwear',
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
          email: user?.email,
          contact: formData.phone,
        },
        notes: {
          orderNumber: checkoutData.orderNumber,
          address: `${formData.addressLine1}, ${formData.city}, ${formData.state} - ${formData.postalCode}`,
        },
        theme: {
          color: '#1e1915', // Octo Primary Dark Charcoal
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
      <section className="border-b border-foreground/15 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Checkout & Reservation
          </p>
          <h1 className="font-display mt-3 text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
            Delivery & Payment
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Stock is reserved in PostgreSQL during checkout · Verified with Razorpay modal
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-14 md:py-20">
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
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight border-b border-foreground/15 pb-4">
                1. Delivery Address & Contact
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                    Recipient / Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
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
                    maxLength={6}
                    placeholder="560001"
                    value={formData.postalCode}
                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                  Delivery Instructions / Student Grade (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Grade 7 Section B, deliver between 10am-2pm..."
                  value={formData.customerNotes}
                  onChange={e => setFormData({ ...formData, customerNotes: e.target.value })}
                  className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground resize-y"
                />
              </div>
            </div>

            {/* Right: Order Summary & Razorpay Trigger (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="paper-shadow border border-foreground/15 bg-card p-6 md:p-8 space-y-6">
                <h2 className="font-display text-xl font-bold uppercase tracking-tight">
                  2. Order Review
                </h2>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-1 divide-y divide-foreground/10 text-xs">
                  {cart.items.map(item => (
                    <div key={item.itemId} className="pt-3 flex justify-between items-start gap-3">
                      <div>
                        <p className="font-bold uppercase text-foreground">{item.productName}</p>
                        <p className="text-muted-foreground">Size: {item.ukSize} · Qty: {item.quantity}</p>
                      </div>
                      <span className="font-display font-bold text-foreground">
                        ₹{item.itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-foreground/15 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-display font-bold text-foreground">
                      ₹{cart.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="font-bold text-foreground uppercase">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-foreground/10">
                    <span className="uppercase tracking-wider">Total Payable (INR)</span>
                    <span className="font-display font-black text-xl">
                      ₹{cart.estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Razorpay Gateway Badge */}
                <div className="border border-foreground/15 p-4 bg-secondary/40 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground font-bold uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Razorpay Standard Checkout Modal</span>
                  </div>
                  <p>
                    Supports UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and Wallets. Server HMAC-SHA256 signature verification.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || verifying}
                  className="w-full flex items-center justify-center gap-3 bg-primary py-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:paper-shadow-sm active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? (
                    <span>Opening Razorpay Popup...</span>
                  ) : verifying ? (
                    <span>Verifying Signature...</span>
                  ) : (
                    <>
                      <span>Pay ₹{cart.estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} with Razorpay</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
      </section>
    </main>
  );
};
