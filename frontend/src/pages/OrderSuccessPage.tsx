import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { orderApi } from '../api/client';
import { Order } from '../types';
import { Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      orderApi.trackOrder(orderNumber)
        .then(res => setOrder(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  const copyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPaid = order?.status === 'PAID' || location.state?.paymentId;

  return (
    <main className="flex-1 bg-background text-foreground py-16 px-6 flex items-center justify-center">
      <div className="w-full max-w-xl paper-shadow border border-foreground/15 bg-card p-8 md:p-12 space-y-6">
        
        {/* Top Indicator */}
        <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-display font-black text-xl">
          ✓
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {isPaid ? 'Payment Verified & Confirmed' : 'Order Recorded · Pending Payment'}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-black uppercase leading-tight tracking-tight">
            {isPaid ? 'Order Confirmed' : 'Order Placed'}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isPaid
              ? 'Your payment was successfully verified via Razorpay modal HMAC-SHA256 signature. Your BETA uniform footwear has been confirmed for dispatch.'
              : 'Your order has been recorded and inventory stock reserved.'}
          </p>
        </div>

        {/* Receipt Box */}
        <div className="border border-foreground/15 p-6 bg-secondary/30 space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-foreground/10 pb-3">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">Order Reference:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-foreground text-sm">{orderNumber}</span>
              <button
                onClick={copyOrderNumber}
                className="border border-foreground/20 p-1 hover:border-foreground transition-colors"
                title="Copy Reference"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-foreground" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            </div>
          </div>

          {order && (
            <div className="flex justify-between items-center border-b border-foreground/10 pb-3">
              <span className="font-bold uppercase tracking-wider text-muted-foreground">Total Amount:</span>
              <span className="font-display font-bold text-foreground text-base">
                ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">Status:</span>
            <span className="border border-foreground/25 bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {order?.status || (isPaid ? 'PAID' : 'PENDING_PAYMENT')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-4">
          <Link
            to={`/track?orderNumber=${orderNumber}`}
            className="flex-1 flex items-center justify-center gap-2 bg-primary py-4 font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground hover:paper-shadow-sm transition-all"
          >
            <span>Track Delivery</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/catalogue"
            className="flex-1 flex items-center justify-center border border-foreground/25 py-4 font-display text-xs font-bold uppercase tracking-[0.2em] text-foreground hover:border-foreground hover:bg-secondary/40 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="border-t border-foreground/15 pt-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-foreground" />
          <span>Official BETA Footwear Distributor Guarantee</span>
        </div>

      </div>
    </main>
  );
};
