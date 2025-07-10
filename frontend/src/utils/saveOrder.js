import { getAuth } from "firebase/auth";

export const saveOrder = async (items, totalAmount) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("ログインしていません");
  }

  const idToken = await user.getIdToken();

  const response = await fetch("/api/orders/save-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      items,
      totalAmount,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "注文保存に失敗しました");
  }

  return await response.json();
};
