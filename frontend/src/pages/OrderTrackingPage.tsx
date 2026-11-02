import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderApi } from '../api/client';
import { Order } from '../types';
import { Search, AlertCircle, CheckCircle2 } from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';
  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTracking = (ref: string) => {
    if (!ref.trim()) return;
    setLoading(true);
    setErrorMsg('');
    orderApi.trackOrder(ref.trim())
      .then(res => setOrder(res.data))
      .catch(err => {
        setOrder(null);
        setErrorMsg(err.response?.data?.message || 'Order reference not found. Please verify the code.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchTracking(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderNumberInput);
  };

  return (
    <main className="flex-1 bg-background text-foreground">
      {/* Header Banner */}
      <section className="border-b border-foreground/15 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Order Fulfillment
          </p>
          <h1 className="font-display mt-3 text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
            Track Order
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your unique order number to check fulfillment & dispatch status.
          </p>
        </div>
      </section>

      {/* Main Tracking Section */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-6 space-y-8">
          
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              required
              placeholder="e.g. WLK-20261028-1001"
              value={orderNumberInput}
              onChange={e => setOrderNumberInput(e.target.value)}
              className="flex-1 border border-foreground/25 bg-transparent px-4 py-3.5 text-sm font-mono uppercase outline-none focus:border-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary px-8 py-3.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground hover:paper-shadow-sm transition-all disabled:opacity-60"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {errorMsg && (
            <div className="border border-destructive/40 bg-destructive/10 p-5 text-xs font-bold text-destructive flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {order && (
            <div className="paper-shadow border border-foreground/15 bg-card p-8 md:p-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/15 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Order Reference
                  </span>
                  <h2 className="font-mono text-xl font-bold uppercase text-foreground">
                    {order.orderNumber}
                  </h2>
                </div>
                <div className="border border-foreground bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider self-start sm:self-center">
                  {order.status}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground block">
                  Uniform Footwear Items:
                </span>
                <div className="border border-foreground/15 divide-y divide-foreground/10 bg-background/50">
                  {order.items.map(item => (
                    <div key={item.id} className="p-4 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold uppercase text-foreground">{item.productName}</p>
                        <p className="text-muted-foreground">Size: {item.sizeLabel} · Qty: {item.quantity}</p>
                      </div>
                      <span className="font-display font-bold text-sm">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              {(() => {
                let addr: any = {};
                try { addr = JSON.parse(order.shippingAddressJson || '{}'); } catch (e) {}
                return (
                  <div className="border-t border-foreground/15 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="font-bold uppercase tracking-wider text-foreground block mb-1">
                        Recipient & Address:
                      </span>
                      <p>{addr.recipientName || 'Student Delivery'}</p>
                      <p>{addr.addressLine1 || ''}{addr.city ? `, ${addr.city}` : ''}{addr.state ? `, ${addr.state}` : ''}{addr.postalCode ? ` - ${addr.postalCode}` : ''}</p>
                      {addr.phone && <p>Contact: {addr.phone}</p>}
                    </div>

                    <div className="sm:text-right">
                      <span className="font-bold uppercase tracking-wider text-foreground block mb-1">
                        Total Amount:
                      </span>
                      <p className="font-display font-black text-2xl text-foreground">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">Payment verified via Razorpay</p>
                    </div>
                  </div>
                );
              })()}

            </div>
          )}

        </div>
      </section>
    </main>
  );
};
