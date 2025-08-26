// src/utils/saveOrder.js
import { getAuth } from "firebase/auth";

// 🧾 Utility function to save order data to the server
export const saveOrder = async (items, totalAmount) => {
  const auth = getAuth();
  const user = auth.currentUser;

  // 🔐 Check if the user is logged in
  if (!user) {
    throw new Error("ログインしていません");
  }

  // 🪪 Retrieve Firebase ID token
  const idToken = await user.getIdToken();

  // 📡 Send order information to the backend
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/orders/save-order`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`, // 🔑 Include the authentication token in the header
      },
      body: JSON.stringify({
        items, // 🛒 Product list
        totalAmount, // 💰 Total amount
      }),
    }
  );

  // ❌ Handle errors if the response fails
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "注文保存に失敗しました");
  }

  // ✅ Return response data if saving is successful
  return await response.json();
};
