'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { Cart, CartItem, ProductListItem } from '@/types';
import { CartContext } from '@/hooks/use-cart';

const CART_STORAGE_KEY = 'amazon-clone-cart';

function createEmptyCart(): Cart {
  return {
    id: 'local',
    items: [],
    subtotalCents: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function getStoredCart(): Cart {
  if (typeof window === 'undefined') {
    return createEmptyCart();
  }
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading cart from storage:', error);
  }
  
  return createEmptyCart();
}

function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);
}


export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(createEmptyCart);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from storage on mount
  useEffect(() => {
    const storedCart = getStoredCart();
    setCart(storedCart);
    setIsLoading(false);
  }, []);

  // Persist cart to storage whenever it changes
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  const addItem = useCallback((product: ProductListItem, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.productId === product.id
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [
          ...prevCart.items,
          {
            productId: product.id,
            quantity,
            product,
          },
        ];
      }

      return {
        ...prevCart,
        items: newItems,
        subtotalCents: calculateSubtotal(newItems),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prevCart) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const newItems = prevCart.items.filter(
          (item) => item.productId !== productId
        );
        return {
          ...prevCart,
          items: newItems,
          subtotalCents: calculateSubtotal(newItems),
          updatedAt: new Date().toISOString(),
        };
      }

      const newItems = prevCart.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );

      return {
        ...prevCart,
        items: newItems,
        subtotalCents: calculateSubtotal(newItems),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter(
        (item) => item.productId !== productId
      );
      return {
        ...prevCart,
        items: newItems,
        subtotalCents: calculateSubtotal(newItems),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart(createEmptyCart());
  }, []);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart.items,
        itemCount,
        subtotalCents: cart.subtotalCents,
        isLoading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Export useCart from hooks for convenience
export { useCart } from '@/hooks/use-cart';
