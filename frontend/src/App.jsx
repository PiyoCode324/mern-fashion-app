// App.jsx (最終修正案)
import React, { useEffect, useRef } from "react"; // useRef をインポート
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import ProductList from "./components/ProductList";
import AddProduct from "./pages/AddProduct";
import ProductDetail from "./components/ProductDetail";
import EditProduct from "./pages/EditProduct";
import Favorites from "./pages/Favorites";
import Cart from "./pages/Cart";
import { useCart } from "./contexts/CartContext";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useAuth } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import axios from "axios";

// Header コンポーネントは変更なし
function Header({ handleLogout }) {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="p-4 flex justify-between items-center bg-gray-100">
      <h1 className="text-2xl font-bold">商品一覧</h1>
      <div className="flex gap-4">
        <Link
          to="/favorites"
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
        >
          ❤️ お気に入り一覧
        </Link>

        <Link
          to="/cart"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 relative"
        >
          🛒 カート
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              {itemCount}
            </span>
          )}
        </Link>

        <Link
          to="/login"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          ログイン
        </Link>

        <button onClick={handleLogout} className="text-sm text-red-500">
          ログアウト
        </button>

        <Link
          to="/add"
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          ➕ 商品を追加
        </Link>
      </div>
    </header>
  );
}

function App() {
  const navigate = useNavigate();
  const {
    user: mongoUser,
    loading: authLoading,
    isNewFirebaseUser,
  } = useAuth();

  // 登録処理が進行中かどうかを追跡するref
  const isRegistering = useRef(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("ログアウト成功");
      // ログアウト時にフラグをリセットする必要はない（新しいセッションで再度チェックされるため）
      navigate("/login");
    } catch (error) {
      console.error("ログアウト失敗:", error);
    }
  };

  useEffect(() => {
    // AuthContextのロードが完了し、かつMongoDBにユーザーが存在しない（isNewFirebaseUserがtrue）場合
    // かつ、登録処理がまだ進行中でない場合のみ実行
    if (!authLoading && isNewFirebaseUser && !isRegistering.current) {
      const registerUserToBackend = async () => {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          // 登録処理を開始する前にフラグをtrueに設定
          isRegistering.current = true;
          console.log("App.jsx: MongoDBへの新規ユーザー登録をトリガーします。");
          try {
            const token = await firebaseUser.getIdToken();
            await axios.post(
              "/api/users",
              {
                uid: firebaseUser.uid,
                name:
                  firebaseUser.displayName || firebaseUser.email.split("@")[0],
                email: firebaseUser.email,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            console.log("バックエンドユーザー登録成功:");
            // 登録成功後、AuthContextが自動的にユーザー情報を再フェッチするはず
            // isNewFirebaseUserがfalseに更新されるので、このuseEffectは再実行されない
          } catch (err) {
            console.error("App.jsx: バックエンドユーザー登録エラー:", err);
            if (err.response && err.response.status === 409) {
              console.warn(
                "App.jsx: ユーザーは既にバックエンドに登録されています (409 Conflict)。"
              );
              // 409エラーの場合も、登録処理は完了したとみなす
            }
          } finally {
            // 処理が完了したらフラグをfalseに戻す（StrictModeの2回目実行に備える）
            // ただし、isNewFirebaseUserがfalseに変わればこのuseEffect自体が再実行されないため、
            // ここでfalseに戻す必要は厳密にはないが、安全策として。
            // 実際には、AuthContextがユーザーをフェッチし、isNewFirebaseUserがfalseになることで
            // このuseEffectは条件を満たさなくなり、再実行されなくなる。
          }
        }
      };

      registerUserToBackend();
    }

    // クリーンアップ関数: コンポーネントがアンマウントされるか、エフェクトが再実行される前に呼ばれる
    // StrictModeでは、マウント時にも一度呼ばれてから再度エフェクトが実行される
    return () => {
      // isRegistering.current = false; // ここでリセットすると、StrictModeの2回目実行時に問題が再発する可能性がある
    };
  }, [authLoading, isNewFirebaseUser]); // 依存配列

  return (
    <div className="App">
      <Header handleLogout={handleLogout} />

      <main className="p-4">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route
            path="/add"
            element={
              <PrivateRoute>
                <AddProduct />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <PrivateRoute>
                <EditProduct />
              </PrivateRoute>
            }
          />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
