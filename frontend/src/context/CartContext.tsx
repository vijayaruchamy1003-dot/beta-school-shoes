import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, CartItem } from '../types';
import { cartApi } from '../api/client';
import { useAuth } from './AuthContext';

export interface CartItemMeta {
  productId?: string;
  productName?: string;
  sku?: string;
  ukSize?: string;
  unitPrice?: number;
  imageUrl?: string;
}

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productSizeId: string, quantity: number, meta?: CartItemMeta) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getGuestCartItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'sm_guest_cart';

const computeCartTotals = (items: CartItem[]): Cart => {
  const totalItemsCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = items.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
  const estimatedTax = Math.round(subtotal * 0.05 * 100) / 100;
  const estimatedShipping = 0;
  const estimatedTotal = Math.round((subtotal + estimatedTax + estimatedShipping) * 100) / 100;

  return {
    cartId: 'guest-cart',
    items,
    totalItemsCount,
    subtotal,
    estimatedTax,
    estimatedShipping,
    estimatedTotal,
  };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load guest cart from local storage
  const loadGuestCart = useCallback((): Cart | null => {
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      if (saved) {
        const items: CartItem[] = JSON.parse(saved);
        if (Array.isArray(items) && items.length > 0) {
          return computeCartTotals(items);
        }
      }
    } catch {
      localStorage.removeItem(GUEST_CART_KEY);
    }
    return null;
  }, []);

  const saveGuestCart = (items: CartItem[]) => {
    if (items.length === 0) {
      localStorage.removeItem(GUEST_CART_KEY);
      setCart(null);
    } else {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
      setCart(computeCartTotals(items));
    }
  };

  const refreshCart = async () => {
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        const res = await cartApi.getCart();
        setCart(res.data);
      } catch {
        setCart(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCart(loadGuestCart());
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated, loadGuestCart]);

  const addToCart = async (productSizeId: string, quantity: number, meta?: CartItemMeta) => {
    if (isAuthenticated) {
      const res = await cartApi.addToCart(productSizeId, quantity);
      setCart(res.data);
    } else {
      // Guest cart management
      const currentItems = cart ? [...cart.items] : [];
      const existingIndex = currentItems.findIndex(it => it.productSizeId === productSizeId);

      if (existingIndex >= 0) {
        currentItems[existingIndex].quantity += quantity;
        currentItems[existingIndex].itemTotal = currentItems[existingIndex].unitPrice * currentItems[existingIndex].quantity;
      } else {
        const unitPrice = meta?.unitPrice || 649;
        const newItem: CartItem = {
          itemId: `guest-${productSizeId}-${Date.now()}`,
          productId: meta?.productId || 'prod-default',
          productName: meta?.productName || 'Shoes Net School Footwear',
          sku: meta?.sku || 'SN-SCH-01',
          productSizeId,
          ukSize: meta?.ukSize || 'Standard',
          unitPrice,
          quantity,
          itemTotal: unitPrice * quantity,
          imageUrl: meta?.imageUrl,
          isAvailable: true,
        };
        currentItems.push(newItem);
      }
      saveGuestCart(currentItems);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    if (isAuthenticated) {
      const res = await cartApi.updateQuantity(itemId, quantity);
      setCart(res.data);
    } else {
      const currentItems = cart ? [...cart.items] : [];
      const item = currentItems.find(it => it.itemId === itemId);
      if (item) {
        item.quantity = quantity;
        item.itemTotal = item.unitPrice * quantity;
        saveGuestCart(currentItems);
      }
    }
  };

  const removeItem = async (itemId: string) => {
    if (isAuthenticated) {
      const res = await cartApi.removeItem(itemId);
      setCart(res.data);
    } else {
      const currentItems = cart ? cart.items.filter(it => it.itemId !== itemId) : [];
      saveGuestCart(currentItems);
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartApi.clearCart();
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(GUEST_CART_KEY);
    setCart(null);
  };

  const getGuestCartItems = (): CartItem[] => {
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const itemCount = cart?.totalItemsCount || 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, isLoading, refreshCart, addToCart, updateQuantity, removeItem, clearCart, getGuestCartItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
