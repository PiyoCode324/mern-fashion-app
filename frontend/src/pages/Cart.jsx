// src/pages/Cart.jsx
import React from "react";
import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";

const Cart = () => {
  // Get cart items and cart manipulation functions
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();

  // Calculate total price (price × quantity)
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6">
      {/* Back to Home link */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      {/* Cart title */}
      <h2 className="text-2xl font-bold mb-4">🛍 カート一覧</h2>

      {/* If cart is empty */}
      {cartItems.length === 0 ? (
        <p className="text-gray-600">カートに商品はありません。</p>
      ) : (
        <>
          {/* Cart items list */}
          <ul className="divide-y divide-gray-200 mb-6">
            {cartItems.map((item, index) => (
              <li
                key={index}
                className="py-4 flex items-center justify-between gap-4"
              >
                {/* Product details: image, name, price, quantity, subtotal */}
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      価格: ¥{item.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      数量: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      小計: ¥{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Quantity control buttons */}
                <div className="flex flex-col gap-1">
                  {/* "+" button: Increase quantity by 1 */}
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    ＋
                  </button>
                  {/* "-" button: Decrease quantity by 1 */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    －
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Total price */}
          <div className="text-right mb-4">
            <p className="text-lg font-semibold">
              合計金額：¥{total.toLocaleString()}
            </p>
          </div>

          {/* Cart action buttons */}
          <div className="flex justify-between">
            {/* Clear cart button */}
            <button
              onClick={clearCart}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              カートを空にする
            </button>

            {/* Proceed to purchase (placeholder) */}
            <Link
              to="/confirm"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block text-center"
            >
              購入手続きへ進む（仮）
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
