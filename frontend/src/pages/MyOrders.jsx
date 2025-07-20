// src/pages/MyOrders.jsx
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]); // 🧾 User order history
  const [loading, setLoading] = useState(true); // 🔄 Loading state

  // 🔽 Fetch order history on initial mount
  useEffect(() => {
    const fetchOrders = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.log("Not logged in");
        return;
      }

      const idToken = await user.getIdToken(); // 🔐 Get Firebase ID token

      const res = await fetch("/api/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch orders");
        return;
      }

      const data = await res.json(); // ✅ Successfully retrieved orders
      setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  // 🔄 Show loading indicator
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {/* 🔙 Back to profile */}
      <div className="mb-6">
        <Link
          to="/profile"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          Back to Profile
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-4">Order History</h2>

      {/* 📦 Order list */}
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="border p-4 mb-4 rounded-md shadow">
            <p className="text-sm text-gray-500">
              Ordered on: {new Date(order.createdAt).toLocaleString()}
            </p>
            <p>Total: ¥{order.totalPrice.toLocaleString()}</p>

            {/* 🧾 Items in the order */}
            <ul className="ml-4 mt-2">
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.productId?.name || "Unnamed product"} × {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
