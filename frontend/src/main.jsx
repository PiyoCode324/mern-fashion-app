import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { FavoriteProvider } from "./contexts/FavoriteContext"; // ⭐ 追加
import { CartProvider } from "./contexts/CartContext"; // ←追加
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FavoriteProvider>
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </FavoriteProvider>
  </StrictMode>
);
