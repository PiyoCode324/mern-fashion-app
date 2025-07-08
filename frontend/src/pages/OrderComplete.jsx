import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext"; // ✅ 追加！

const OrderComplete = () => {
  const { clearCart } = useCart(); // ✅ カート操作関数を取得

  useEffect(() => {
    clearCart(); // ✅ 注文完了時にカートをクリア
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4 text-green-600">
        ✅ ご注文が完了しました！
      </h2>
      <p className="mb-6">
        ご注文ありがとうございます。商品の発送まで今しばらくお待ちください。
      </p>
      <Link to="/" className="text-blue-600 hover:underline">
        ホームに戻る
      </Link>
    </div>
  );
};

export default OrderComplete;
