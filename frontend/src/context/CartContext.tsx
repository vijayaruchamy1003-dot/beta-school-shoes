import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart } from '../types';
import { cartApi } from '../api/client';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productSizeId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setIsLoading(true);
      const res = await cartApi.getCart();
      setCart(res.data);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  const addToCart = async (productSizeId: string, quantity: number) => {
    const res = await cartApi.addToCart(productSizeId, quantity);
    setCart(res.data);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const res = await cartApi.updateQuantity(itemId, quantity);
    setCart(res.data);
  };

  const removeItem = async (itemId: string) => {
    const res = await cartApi.removeItem(itemId);
    setCart(res.data);
  };

  const clearCart = async () => {
    await cartApi.clearCart();
    setCart(null);
  };

  const itemCount = cart?.totalItemsCount || 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, isLoading, refreshCart, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
