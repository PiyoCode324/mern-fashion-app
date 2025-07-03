// src/contexts/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

// Create a Context for the cart
const CartContext = createContext(null);

// Custom Hook for accessing the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// CartProvider component that wraps the application
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
      return [];
    }
  });

  // Save the cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add a product to the cart (increment quantity if already exists)
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item._id === product._id);
      if (existingItem) {
        // If the item is already in the cart, increase its quantity
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If it's a new item, add it with quantity 1
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  // Remove a product from the cart
  // If quantity > 1, decrement it; otherwise, remove the item completely
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
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
