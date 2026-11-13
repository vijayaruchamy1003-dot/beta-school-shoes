import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicProduct, PublicSize } from '../types';
import { ShoeVector } from './ShoeVector';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Check, Star, Heart } from 'lucide-react';

interface Props {
  product: PublicProduct;
  index?: number;
}

export const ProductCard: React.FC<Props> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isSizeInStock = (s?: PublicSize | null) => Boolean(s && (s.available ?? s.isAvailable));

  const [selectedSize, setSelectedSize] = useState<PublicSize | null>(() => {
    return product.sizes.find(s => Boolean(s.available ?? s.isAvailable)) || (product.sizes.length > 0 ? product.sizes[0] : null);
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const categoryLabels: Record<string, string> = {
    BOYS_FORMAL: 'Boys Formal Uniform',
    GIRLS_FORMAL: 'Girls Formal Buckle',
    SPORTS_PT: 'Sports & PT Canvas',
    JUNIOR_VELCRO: 'Junior Easy-Strap',
  };
  const categoryLabel = categoryLabels[product.category] || 'Official Uniform Footwear';

  // Realistic MRP calculation (Uses admin configured MRP or falls back)
  const mrp = product.mrp && product.mrp > product.basePrice ? product.mrp : Math.round(product.basePrice * 1.38);
  const discountPercent = Math.max(0, Math.round(((mrp - product.basePrice) / mrp) * 100));

  // Consistent rating for Asian Footwears social proof
  const rating = (4.4 + ((product.name.charCodeAt(0) % 6) * 0.1)).toFixed(1);
  const reviewCount = 45 + (product.name.charCodeAt(product.name.length - 1) * 3) % 180;

  // Promotional badge: custom badge text > bestseller > new arrival > discount %
  const badgeType = product.badgeText?.trim()
    ? product.badgeText.trim().toUpperCase()
    : product.isBestseller
    ? 'BESTSELLER'
    : product.isNewArrival
    ? 'NEW ARRIVAL'
    : discountPercent > 0
    ? `${discountPercent}% OFF`
    : index % 3 === 0
    ? 'BESTSELLER'
    : index % 3 === 1
    ? 'NEW ARRIVAL'
    : `${discountPercent}% OFF`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      await addToCart(selectedSize.id, 1, {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        ukSize: selectedSize.ukSize,
        unitPrice: product.basePrice,
        imageUrl: product.primaryImageUrl,
      });
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to add item');
    } finally {
      setIsAdding(false);
    }
  };

  const hasAnyStock = product.sizes.some(s => Boolean(s.available ?? s.isAvailable));

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300">
      <div>
        <Link to={`/products/${product.id}`} className="block" aria-label={`View ${product.name}`}>
          {/* Card Media Stage (Asian Footwears style clean light studio background) */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-50 via-slate-100/40 to-slate-100/70 p-4 flex items-center justify-center">
            
            {/* Walkaroo Promotional Badge */}
            <div className="absolute top-2.5 left-2.5 z-10">
              {badgeType === 'BESTSELLER' ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500 to-[#ED2C23] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs">
                  ★ Bestseller
                </span>
              ) : badgeType === 'NEW ARRIVAL' ? (
                <span className="inline-flex items-center rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs">
                  New Arrival
                </span>
              ) : (
                <span className="inline-flex items-center rounded-md bg-[#ED2C23] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs">
                  {badgeType}
                </span>
              )}
            </div>

            {/* Wishlist Heart Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsWishlisted(!isWishlisted);
              }}
              className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-xs backdrop-blur-xs transition-all hover:bg-white hover:text-rose-500 active:scale-90"
              aria-label="Save to wishlist"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Out of Stock Watermark */}
            {!hasAnyStock && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-xs">
                <span className="rounded-md bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Product Image with Zoom on Hover */}
            {product.primaryImageUrl ? (
              <img
                src={product.primaryImageUrl}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-108"
              />
            ) : (
              <div className="w-full max-w-[190px] transition-transform duration-500 ease-out group-hover:scale-108">
                <ShoeVector sku={product.sku} className="w-full h-auto drop-shadow-md" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="mt-3.5 space-y-1.5">
            {/* Category Subtitle */}
            <p className="text-[11px] font-black uppercase tracking-wider text-[#ED2C23]">
              {categoryLabel}
            </p>

            {/* Product Title */}
            <h3 className="line-clamp-1 text-sm sm:text-base font-bold text-slate-900 transition-colors group-hover:text-[#ED2C23]">
              {product.name}
            </h3>

            {/* Star Rating & Review Count (Asian Footwears style social proof) */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200/60">
                <span>{rating}</span>
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              </span>
              <span className="text-[11px] text-slate-500">
                ({reviewCount})
              </span>
            </div>

            {/* Asian Footwears Pricing Hierarchy */}
            <div className="flex flex-wrap items-baseline gap-2 pt-1">
              <span className="text-base sm:text-lg font-extrabold text-slate-900">
                ₹{Math.round(product.basePrice).toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-medium text-slate-400 line-through">
                ₹{mrp.toLocaleString('en-IN')}
              </span>
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">
                {discountPercent}% OFF
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Size Selection & CTA (Asian Footwears style quick add) */}
      <div className="mt-3 space-y-2.5 pt-2.5 border-t border-slate-100">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-600">Select Size:</span>
          {selectedSize && (
            <span className={isSizeInStock(selectedSize) ? 'font-bold text-emerald-600' : 'font-bold text-rose-600'}>
              {isSizeInStock(selectedSize) ? 'In Stock' : 'Out of Stock'}
            </span>
          )}
        </div>

        {/* Compact Size Pills */}
        <div className="flex flex-wrap gap-1.5">
          {product.sizes.map(size => {
            const inStock = isSizeInStock(size);
            const isSelected = selectedSize?.id === size.id;
            return (
              <button
                key={size.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(size);
                  setErrorMsg('');
                }}
                className={`min-w-[34px] rounded-md px-2 py-1 text-[11px] font-bold transition-all ${
                  isSelected
                    ? 'bg-[#ED2C23] text-white shadow-xs'
                    : inStock
                    ? 'border border-slate-200 bg-white text-slate-800 hover:border-[#ED2C23] hover:text-[#ED2C23]'
                    : 'border border-slate-100 bg-slate-50 text-slate-300 line-through cursor-not-allowed'
                }`}
                title={inStock ? `Size ${size.ukSize} available` : `Size ${size.ukSize} out of stock`}
              >
                {size.ukSize.replace(/^UK\s*/i, '')}
              </button>
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-[11px] font-bold text-rose-600">
            {errorMsg}
          </p>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding || !hasAnyStock}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] ${
            addedSuccess
              ? 'bg-emerald-600 text-white shadow-sm'
              : !hasAnyStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-[#ED2C23] hover:bg-[#D41C14] text-white shadow-sm hover:shadow-md'
          }`}
        >
          {addedSuccess ? (
            <>
              <Check className="h-4 w-4" />
              <span>Added to Bag</span>
            </>
          ) : isAdding ? (
            <span>Adding...</span>
          ) : !hasAnyStock ? (
            <span>Out of Stock</span>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
