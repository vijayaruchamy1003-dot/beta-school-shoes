import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productApi } from '../api/client';
import { PublicProduct, PublicSize } from '../types';
import { ShoeVector } from '../components/ShoeVector';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Check, ShoppingBag, ShieldCheck, Truck, RefreshCw, Minus, Plus } from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<PublicSize | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isSizeInStock = (s?: PublicSize | null) => Boolean(s && (s.available ?? s.isAvailable));

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productApi.getPublicProduct(id)
      .then(res => {
        setProduct(res.data);
        const firstAvailable = res.data.sizes.find(s => Boolean(s.available ?? s.isAvailable)) || res.data.sizes[0] || null;
        if (firstAvailable) setSelectedSize(firstAvailable);
        if (res.data.primaryImageUrl) setSelectedImage(res.data.primaryImageUrl);
      })
      .catch(() => navigate('/catalogue'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setErrorMsg('Please select a size');
      return;
    }

    if (!isSizeInStock(selectedSize)) {
      setErrorMsg('Selected size is out of stock');
      return;
    }

    try {
      setIsAdding(true);
      setErrorMsg('');
      await addToCart(selectedSize.id, quantity, {
        productId: product?.id,
        productName: product?.name,
        sku: product?.sku,
        ukSize: selectedSize.ukSize,
        unitPrice: product?.basePrice,
        imageUrl: product?.primaryImageUrl,
      });
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to add item to bag');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading || !product) {
    return (
      <main className="flex-1 py-24 text-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Loading footwear specifications...
        </p>
      </main>
    );
  }

  const inStock = selectedSize ? isSizeInStock(selectedSize) : false;

  return (
    <main className="flex-1 bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        
        {/* Back Link */}
        <Link
          to="/catalogue"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all shoes
        </Link>

        {/* 2-Column Product Layout */}
        <div className="grid gap-10 md:grid-cols-2 lg:gap-16 items-start">
          
          {/* Left Column: Product Image Stage */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden border border-foreground/15 bg-secondary flex items-center justify-center p-8">
              {/* Category Badge */}
              <span className="absolute top-4 left-4 bg-background/95 border border-foreground/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]">
                {product.category.replace('_', ' ')}
              </span>

              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="w-full max-w-[320px]">
                  <ShoeVector sku={product.sku} className="w-full h-auto drop-shadow-lg" />
                </div>
              )}
            </div>

            {/* Thumbnail switcher if multiple images */}
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="flex gap-3">
                {product.imageUrls.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`h-20 w-20 border bg-secondary p-1 overflow-hidden transition-all ${
                      selectedImage === img ? 'border-foreground paper-shadow-sm' : 'border-foreground/20 hover:border-foreground/50'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i}`} className="h-full w-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions */}
          <div className="flex flex-col">
            
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              SKU: {product.sku} · Shoes Net (Official Walkaroo Partner)
            </p>

            <h1 className="font-display mt-2 text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-5xl">
              {product.name}
            </h1>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-3xl font-black">
                ₹{product.basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                (Inclusive of all taxes)
              </span>
            </div>

            {/* Short Description (Single short description per spec) */}
            <div className="mt-6 text-[15px] leading-relaxed text-foreground/80 border-t border-foreground/15 pt-5">
              {product.shortDescription}
            </div>

            {/* Size Selection Section */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em]">
                  Available Sizes (UK Standard)
                </span>
                <span className={`text-xs font-bold uppercase tracking-wider ${inStock ? 'text-foreground' : 'text-destructive'}`}>
                  {inStock ? '● In Stock' : '✕ Out of Stock'}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map(size => {
                  const available = isSizeInStock(size);
                  const isSelected = selectedSize?.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setErrorMsg('');
                      }}
                      className={`py-3 text-xs font-bold border transition-all ${
                        isSelected
                          ? 'border-foreground bg-primary text-primary-foreground paper-shadow-sm'
                          : available
                          ? 'border-foreground/25 bg-transparent text-foreground hover:border-foreground'
                          : 'border-foreground/10 bg-secondary/20 text-muted-foreground/40 line-through'
                      }`}
                    >
                      {size.ukSize}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="mt-7 flex items-center gap-5">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Qty
              </span>
              <div className="flex items-center border border-foreground/25">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-secondary disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center font-display text-sm font-bold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-secondary"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="mt-3 text-xs font-bold text-destructive">
                {errorMsg}
              </p>
            )}

            {/* Add to Bag CTA Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding || !inStock}
              className="mt-8 flex w-full items-center justify-center gap-3 bg-primary py-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:paper-shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              {addedSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Added to Shopping Bag</span>
                </>
              ) : isAdding ? (
                <span>Reserving in Bag...</span>
              ) : !inStock ? (
                <span>Selected Size Out of Stock</span>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>

            {/* Instant Checkout Prompt if already added */}
            {addedSuccess && (
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="mt-3 w-full border border-foreground py-3 text-xs font-bold uppercase tracking-[0.16em] hover:bg-secondary/40 transition-colors"
              >
                Proceed to Checkout →
              </button>
            )}

            {/* Institutional Trust Features */}
            <div className="mt-10 border-t border-foreground/15 pt-6 space-y-3 text-xs text-muted-foreground font-sans">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-foreground shrink-0" />
                <span>100% genuine Walkaroo manufacture warranty by Shoes Net</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-4 w-4 text-foreground shrink-0" />
                <span>Fast express delivery with online dispatch tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="h-4 w-4 text-foreground shrink-0" />
                <span>Uniform size exchange support within 7 days</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
};
