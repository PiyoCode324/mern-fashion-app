// src/contexts/FavoriteContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

// Create a context for managing favorites
// (Set to null to provide a clearer error when the provider is not used)
const FavoriteContext = createContext(null);

// Custom hook for accessing the favorite context
export const useFavorite = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error("useFavorite must be used within a FavoriteProvider");
  }
  return context;
};

// FavoriteProvider component
export const FavoriteProvider = ({ children }) => {
  // Restore the favorites list from localStorage safely
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("favorites");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse favorites from localStorage:", error);
      return [];
    }
  });

  // Save the updated favorites list to localStorage whenever it changes
  useEffect(() => {
    if (favorites) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites]);

  // Toggle a product ID in the favorites list (add or remove)
  const toggleFavorite = (productId) => {
    setFavorites(
      (prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId) // Remove if already present
          : [...prev, productId] // Add if not present
    );
  };

  // Check if a product is in the favorites list
  const isFavorite = (productId) => favorites.includes(productId);

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};
