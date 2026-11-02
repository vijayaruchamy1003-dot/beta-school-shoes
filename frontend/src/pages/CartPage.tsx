import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { ShoeVector } from '../components/ShoeVector';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeItem, isLoading } = useCart();
  const navigate = useNavigate();

  if (isLoading && !cart) {
    return (
      <main className="flex-1 py-24 text-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Updating cart...
        </p>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="flex-1 bg-background text-foreground py-20 px-6">
        <div className="max-w-md mx-auto paper-shadow border border-foreground/15 bg-card p-10 text-center space-y-4">
          <div className="w-16 h-16 border border-foreground flex items-center justify-center mx-auto text-foreground">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight">
            Your Bag is Empty
          </h2>
          <p className="text-sm text-muted-foreground">
            You haven't added any uniform pairs to your shopping bag yet.
          </p>
          <div className="pt-2">
            <Link
              to="/catalogue"
              className="inline-flex items-center justify-center gap-2 w-full bg-primary py-4 font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground hover:paper-shadow-sm transition-all"
            >
              <span>Explore Shoes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background text-foreground">
      {/* Top Banner Header */}
      <section className="border-b border-foreground/15 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Your bag
          </p>
          <h1 className="font-display mt-3 text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
            Shopping Cart
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {cart.totalItemsCount} item{cart.totalItemsCount > 1 ? 's' : ''} in cart · Price & stock verified on server
          </p>
        </div>
      </section>

      {/* Cart Content Grid */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Cart Items List (8 cols) */}
            <div className="lg:col-span-8 border-t border-foreground/15 divide-y divide-foreground/15">
              {cart.items.map(item => (
                <div key={item.itemId} className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  
                  {/* Image & Title */}
                  <div className="flex items-center gap-5">
                    <div className="h-24 w-24 border border-foreground/15 bg-secondary flex items-center justify-center p-2 shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-contain mix-blend-multiply" />
                      ) : (
                        <ShoeVector sku={item.sku} className="h-full w-full" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <Link to={`/products/${item.productId}`} className="font-display text-base font-bold uppercase tracking-tight hover:underline">
                        {item.productName}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-bold uppercase text-foreground">Size: {item.ukSize}</span>
                        <span>·</span>
                        <span>SKU: {item.sku}</span>
                      </div>
                      <p className="text-sm font-display font-bold">
                        ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    {/* Stepper */}
                    <div className="flex items-center border border-foreground/25">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center hover:bg-secondary transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center font-display text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center hover:bg-secondary transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <span className="font-display text-base font-bold">
                        ₹{item.itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.itemId)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Right Column: Order Summary (4 cols) */}
            <div className="lg:col-span-4">
              <div className="paper-shadow border border-foreground/15 bg-card p-6 md:p-8 space-y-6">
                <h2 className="font-display text-xl font-bold uppercase tracking-tight">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm divide-y divide-foreground/10">
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Subtotal ({cart.totalItemsCount} items)</span>
                    <span className="font-display font-bold">
                      ₹{cart.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3">
                    <span className="text-muted-foreground">Standard Delivery</span>
                    <span className="text-foreground font-bold uppercase text-xs">FREE</span>
                  </div>

                  <div className="flex justify-between pt-3 text-base">
                    <span className="font-bold uppercase tracking-wider">Estimated Total</span>
                    <span className="font-display font-black text-xl">
                      ₹{cart.estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center gap-3 bg-primary py-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:paper-shadow-sm active:scale-[0.98]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="pt-2 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-foreground" />
                  <span>Verified Razorpay Modal Payment</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
};
