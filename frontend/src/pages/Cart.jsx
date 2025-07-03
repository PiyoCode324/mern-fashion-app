// src/pages/Cart.jsx
import React from "react";
import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";

const Cart = () => {
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();

  // 合計金額を quantity を考慮して計算
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🛍 カート一覧</h2>

      {cartItems.length === 0 ? (
        <p className="text-gray-600">カートに商品はありません。</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 mb-6">
            {cartItems.map((item, index) => (
              <li
                key={index}
                className="py-4 flex items-center justify-between gap-4"
              >
                {/* 商品情報（画像＋詳細＋数量） */}
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

                {/* 数量調整ボタン */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    ＋
                  </button>
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

          {/* 合計金額とアクション */}
          <div className="text-right mb-4">
            <p className="text-lg font-semibold">
              合計金額：¥{total.toLocaleString()}
            </p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={clearCart}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              カートを空にする
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              購入手続きへ進む（仮）
            </button>
          </div>
        </>
      )}

      <div className="mt-6">
        <Link to="/" className="text-blue-600 hover:underline">
          ← 商品一覧に戻る
        </Link>
      </div>
    </div>
  );
};

export default Cart;
