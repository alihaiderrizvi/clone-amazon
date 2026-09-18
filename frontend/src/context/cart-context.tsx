'use client';

import { useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Cart, CartItem, ProductListItem } from '@/types';
import { CartContext } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import * as cartApi from '@/lib/api';

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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart>(createEmptyCart);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const previousAuthState = useRef<boolean | null>(null);

  // Load cart on mount and when auth state changes
  useEffect(() => {
    const loadCart = async () => {
      if (authLoading) return;

      // Detect login event (was not authenticated, now is)
      const justLoggedIn = previousAuthState.current === false && isAuthenticated;
      previousAuthState.current = isAuthenticated;

      if (isAuthenticated) {
        setIsLoading(true);
        try {
          // If just logged in, merge local cart with server cart
          if (justLoggedIn) {
            const localCart = getStoredCart();
            if (localCart.items.length > 0) {
              // Merge local cart items to server
              const itemsToMerge = localCart.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity
              }));
              try {
                const mergedCart = await cartApi.mergeCart(itemsToMerge);
                setCart(mergedCart);
                // Clear local storage after successful merge
                localStorage.removeItem(CART_STORAGE_KEY);
              } catch (mergeError) {
                console.error('Error merging cart:', mergeError);
                // Fallback: just fetch server cart
                const serverCart = await cartApi.getCart();
                setCart(serverCart);
              }
            } else {
              // No local items, just fetch server cart
              const serverCart = await cartApi.getCart();
              setCart(serverCart);
            }
          } else {
            // Normal fetch for authenticated user
            const serverCart = await cartApi.getCart();
            setCart(serverCart);
          }
        } catch (error) {
          console.error('Error loading cart from server:', error);
          // Fallback to local cart if server fails
          setCart(getStoredCart());
        } finally {
          setIsLoading(false);
        }
      } else {
        // Not authenticated, use local storage
        setCart(getStoredCart());
        setIsLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, authLoading]);

  // Persist cart to local storage for unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated && typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isLoading, isAuthenticated]);

  const addItem = useCallback(async (product: ProductListItem, quantity: number = 1) => {
    if (isAuthenticated) {
      // Optimistic update
      setCart((prevCart) => {
        const existingItemIndex = prevCart.items.findIndex(
          (item) => item.productId === product.id
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          newItems = prevCart.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
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

      // Sync with server
      setIsSyncing(true);
      try {
        const updatedCart = await cartApi.addToCart(product.id, quantity);
        setCart(updatedCart);
      } catch (error) {
        console.error('Error adding to cart:', error);
        // Revert optimistic update by refetching
        try {
          const serverCart = await cartApi.getCart();
          setCart(serverCart);
        } catch {
          // If refetch fails too, keep optimistic state
        }
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Local only for unauthenticated users
      setCart((prevCart) => {
        const existingItemIndex = prevCart.items.findIndex(
          (item) => item.productId === product.id
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          newItems = prevCart.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
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
    }
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      return removeItem(productId);
    }

    if (isAuthenticated) {
      // Optimistic update
      setCart((prevCart) => {
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

      // Sync with server
      setIsSyncing(true);
      try {
        const updatedCart = await cartApi.updateCartItem(productId, quantity);
        setCart(updatedCart);
      } catch (error) {
        console.error('Error updating cart:', error);
        try {
          const serverCart = await cartApi.getCart();
          setCart(serverCart);
        } catch {
          // Keep optimistic state
        }
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Local only
      setCart((prevCart) => {
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
    }
  }, [isAuthenticated]);

  const removeItem = useCallback(async (productId: string) => {
    if (isAuthenticated) {
      // Optimistic update
      setCart((prevCart) => {
        const newItems = prevCart.items.filter((item) => item.productId !== productId);
        return {
          ...prevCart,
          items: newItems,
          subtotalCents: calculateSubtotal(newItems),
          updatedAt: new Date().toISOString(),
        };
      });

      // Sync with server
      setIsSyncing(true);
      try {
        const updatedCart = await cartApi.removeCartItem(productId);
        setCart(updatedCart);
      } catch (error) {
        console.error('Error removing from cart:', error);
        try {
          const serverCart = await cartApi.getCart();
          setCart(serverCart);
        } catch {
          // Keep optimistic state
        }
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Local only
      setCart((prevCart) => {
        const newItems = prevCart.items.filter((item) => item.productId !== productId);
        return {
          ...prevCart,
          items: newItems,
          subtotalCents: calculateSubtotal(newItems),
          updatedAt: new Date().toISOString(),
        };
      });
    }
  }, [isAuthenticated]);

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      // Optimistic update
      setCart(createEmptyCart());

      // Sync with server
      setIsSyncing(true);
      try {
        await cartApi.clearCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
        try {
          const serverCart = await cartApi.getCart();
          setCart(serverCart);
        } catch {
          // Keep empty state
        }
      } finally {
        setIsSyncing(false);
      }
    } else {
      setCart(createEmptyCart());
    }
  }, [isAuthenticated]);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart.items,
        itemCount,
        subtotalCents: cart.subtotalCents,
        isLoading: isLoading || authLoading,
        isSyncing,
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
