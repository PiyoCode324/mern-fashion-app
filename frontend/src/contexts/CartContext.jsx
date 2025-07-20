// src/contexts/CartContext.jsx (修正版)
import { createContext, useContext, useEffect, useState } from "react";

// Create a context for the cart
const CartContext = createContext(null);

// Custom hook for easy access to the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Component that wraps the entire app to provide cart state
export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage; return empty array if parsing fails
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
      return [];
    }
  });

  // Calculate total price of all items in the cart
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Save cart to localStorage whenever it updates
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add a product to the cart (or increase quantity if it already exists)
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item._id === product._id);
      if (existingItem) {
        // If item exists, increase quantity by 1
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If item is new, add with quantity 1
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  // Remove a product from the cart (decrease quantity or remove completely)
  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item._id === productId);
      if (!existingItem) return prev;

      if (existingItem.quantity > 1) {
        // Decrease quantity by 1
        return prev.map((item) =>
          item._id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        // If quantity is 1, remove the item completely
        return prev.filter((item) => item._id !== productId);
      }
    });
  };

  // Clear all items from the cart
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, totalPrice }} // Share totalPrice via context
    >
      {children}
    </CartContext.Provider>
  );
};
