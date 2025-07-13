// src/pages/Cart.jsx
import React from "react";
import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";

const Cart = () => {
  // カート内のアイテムと操作用関数を取得
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();

  // カート内全商品の合計金額を計算（価格 × 数量の合計）
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6">
      {/* ホームに戻るリンク */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      {/* カートタイトル */}
      <h2 className="text-2xl font-bold mb-4">🛍 カート一覧</h2>

      {/* カートが空の場合 */}
      {cartItems.length === 0 ? (
        <p className="text-gray-600">カートに商品はありません。</p>
      ) : (
        <>
          {/* カート内商品一覧 */}
          <ul className="divide-y divide-gray-200 mb-6">
            {cartItems.map((item, index) => (
              <li
                key={index}
                className="py-4 flex items-center justify-between gap-4"
              >
                {/* 商品の画像・名前・価格・数量・小計表示 */}
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

                {/* 数量増減ボタン */}
                <div className="flex flex-col gap-1">
                  {/* 「＋」ボタン：数量を1増やす */}
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    ＋
                  </button>
                  {/* 「－」ボタン：数量を1減らす */}
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

          {/* 合計金額表示 */}
          <div className="text-right mb-4">
            <p className="text-lg font-semibold">
              合計金額：¥{total.toLocaleString()}
            </p>
          </div>

          {/* カート操作ボタン */}
          <div className="flex justify-between">
            {/* カートを空にするボタン */}
            <button
              onClick={clearCart}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              カートを空にする
            </button>

            {/* 購入手続きページへのリンク（仮） */}
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
