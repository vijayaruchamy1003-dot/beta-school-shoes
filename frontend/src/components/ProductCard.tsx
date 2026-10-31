import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicProduct, PublicSize } from '../types';
import { ShoeVector } from './ShoeVector';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Check } from 'lucide-react';

interface Props {
  product: PublicProduct;
  index?: number;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isSizeInStock = (s?: PublicSize | null) => Boolean(s && (s.available ?? s.isAvailable));

  const [selectedSize, setSelectedSize] = useState<PublicSize | null>(() => {
    return product.sizes.find(s => Boolean(s.available ?? s.isAvailable)) || (product.sizes.length > 0 ? product.sizes[0] : null);
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const categoryLabels: Record<string, string> = {
    BOYS_FORMAL: 'Boys Formal Uniform',
    GIRLS_FORMAL: 'Girls Formal Buckle',
    SPORTS_PT: 'Sports & PT Canvas',
    JUNIOR_VELCRO: 'Junior Easy-Strap',
  };
  const categoryLabel = categoryLabels[product.category] || 'Official BETA Footwear';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedSize) {
      setErrorMsg('Select a size');
      return;
    }

    if (!isSizeInStock(selectedSize)) {
      setErrorMsg('Size out of stock');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login?redirect=/catalogue');
      return;
    }

    try {
      setIsAdding(true);
      setErrorMsg('');
      await addToCart(selectedSize.id, 1);
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
    <div className="group flex flex-col justify-between">
      <div>
        <Link to={`/products/${product.id}`} className="block" aria-label={`View ${product.name}`}>
          {/* Card Media Stage */}
          <div className="relative aspect-[4/5] overflow-hidden border border-foreground/15 bg-secondary transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:paper-shadow-sm flex items-center justify-center p-6">
            
            {/* Top Category Badge */}
            <span className="absolute top-3 left-3 bg-background/95 border border-foreground/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground">
              {product.category.replace('_', ' ')}
            </span>

            {/* Out of stock watermark if completely out */}
            {!hasAnyStock && (
              <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Out of Stock
              </span>
            )}

            {product.primaryImageUrl ? (
              <img
                src={product.primaryImageUrl}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="w-full max-w-[220px] transition-transform duration-500 group-hover:scale-[1.04]">
                <ShoeVector sku={product.sku} className="w-full h-auto drop-shadow-md" />
              </div>
            )}

            {/* Slide-Up Quick Add Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding || !hasAnyStock}
              className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-primary py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground transition-transform duration-300 group-hover:translate-y-0 disabled:opacity-50"
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
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>

          {/* Product Info */}
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold uppercase tracking-tight text-foreground group-hover:underline">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {categoryLabel}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-display text-base font-bold text-foreground">
                ₹{product.basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Size Selection Action (Required per spec: Product cards display only image, name, price and size-selection action) */}
      <div className="mt-3 pt-3 border-t border-foreground/10 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          <span>Select Size:</span>
          {selectedSize && (
            <span className={isSizeInStock(selectedSize) ? 'text-foreground font-bold' : 'text-destructive font-bold'}>
              {isSizeInStock(selectedSize) ? 'In Stock' : 'Out of Stock'}
            </span>
          )}
        </div>

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
                  setSelectedSize(size);
                  setErrorMsg('');
                }}
                className={`px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                    : inStock
                    ? 'border-border bg-white text-foreground hover:border-primary hover:text-primary'
                    : 'border-border/60 bg-muted/40 text-muted-foreground/40 line-through cursor-not-allowed'
                }`}
                title={inStock ? `Size ${size.ukSize} available` : `Size ${size.ukSize} out of stock`}
              >
                {size.ukSize}
              </button>
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-[11px] text-destructive font-bold mt-1">
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};
