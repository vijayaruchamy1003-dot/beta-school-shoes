import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/client';
import { Order } from '../types';
import { Package, ArrowRight } from 'lucide-react';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMyOrders(0, 20)
      .then(res => setOrders(res.data.content))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex-1 py-24 text-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading orders...</p>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="flex-1 bg-background text-foreground py-20 px-6">
        <div className="max-w-md mx-auto paper-shadow border border-foreground/15 bg-card p-10 text-center space-y-4">
          <Package className="w-12 h-12 text-foreground mx-auto" />
          <h2 className="font-display text-2xl font-black uppercase tracking-tight">No orders yet</h2>
          <p className="text-sm text-muted-foreground">Your verified school footwear purchase receipts will appear here.</p>
          <div className="pt-2">
            <Link
              to="/catalogue"
              className="inline-block bg-primary px-8 py-3.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground"
            >
              Shop Collection
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background text-foreground">
      {/* Header Banner */}
      <section className="border-b border-foreground/15 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Account Purchases
          </p>
          <h1 className="font-display mt-3 text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
            My Orders
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review past school footwear orders, status tracking, and invoices.
          </p>
        </div>
      </section>

      {/* Orders List */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6 space-y-6">
          {orders.map(order => (
            <div key={order.id} className="paper-shadow border border-foreground/15 bg-card p-6 md:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                <div>
                  <span className="font-mono text-base font-bold uppercase text-foreground">
                    {order.orderNumber}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="border border-foreground/25 bg-primary text-primary-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                    {order.status}
                  </span>
                  <Link
                    to={`/track?orderNumber=${order.orderNumber}`}
                    className="inline-flex items-center gap-1.5 border-b border-foreground pb-0.5 text-xs font-bold uppercase tracking-wider hover:text-muted-foreground transition-colors"
                  >
                    <span>Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2 text-xs">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between py-1 border-b border-foreground/5">
                    <div>
                      <span className="font-bold uppercase text-foreground">{item.productName}</span>
                      <span className="text-muted-foreground ml-2">(Size: {item.sizeLabel} × {item.quantity})</span>
                    </div>
                    <span className="font-display font-bold">
                      ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              {(() => {
                let addr: any = {};
                try { addr = JSON.parse(order.shippingAddressJson || '{}'); } catch (e) {}
                return (
                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                      Recipient: {addr.recipientName || 'Student'} ({addr.city || 'Delivery'})
                    </span>
                    <div className="text-right">
                      <span className="font-display font-black text-lg text-foreground">
                        Total: ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};
