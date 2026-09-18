'use client';

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { Cart, CartItem, ProductListItem } from '@/types';

const CART_STORAGE_KEY = 'amazon-clone-cart';

// Local cart state (will be replaced with API calls when backend is ready)
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

function createEmptyCart(): Cart {
  return {
    id: 'local',
    items: [],
    subtotalCents: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);
}

// Cart context type for shared state
interface CartContextType {
  cart: Cart;
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  isLoading: boolean;
  addItem: (product: ProductListItem, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

// Create context (can be used by CartProvider in context/cart-context.tsx)
export const CartContext = createContext<CartContextType | null>(null);

/**
 * Hook to manage cart state
 * Uses localStorage for persistence across page refreshes
 * Can be used standalone or with CartProvider for shared state
 */
export function useCart() {
  // Try to use context first (if wrapped in CartProvider)
  const context = useContext(CartContext);
  
  // Local state (used if no context is available)
  const [cart, setCart] = useState<Cart>(createEmptyCart);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from storage on mount (only if not using context)
  useEffect(() => {
    if (!context) {
      const storedCart = getStoredCart();
      setCart(storedCart);
      setIsLoading(false);
    }
  }, [context]);

  // Persist cart to storage whenever it changes (only if not using context)
  useEffect(() => {
    if (!context && !isLoading && typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isLoading, context]);

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

  // If context is available, use it; otherwise use local state
  if (context) {
    return context;
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    items: cart.items,
    itemCount,
    subtotalCents: cart.subtotalCents,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
