// AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

// AuthContextを作成
const AuthContext = createContext(null);

// useAuthカスタムフック: AuthProvider内で使用されているか確認
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// AuthProviderコンポーネント: Firebase認証状態とMongoDBユーザー情報を管理
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // MongoDBに保存されているユーザー情報
  const [loading, setLoading] = useState(true); // 認証情報のロード中かどうかの状態
  // Firebaseユーザーはいるが、MongoDBにはまだ登録されていないかを示す状態
  const [isNewFirebaseUser, setIsNewFirebaseUser] = useState(false);

  useEffect(() => {
    // Firebase認証状態の変更を監視するリスナーを設定
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firebaseユーザーが存在する場合
        try {
          // Firebase IDトークンを取得
          const token = await firebaseUser.getIdToken();

          // バックエンドの /api/users/me エンドポイントからユーザー情報を取得しようと試みる
          const res = await axios.get("/api/users/me", {
            headers: {
              Authorization: `Bearer ${token}`, // 認証ヘッダーにトークンを含める
            },
          });

          // MongoDBにユーザーが存在し、正常に取得できた場合
          setUser(res.data); // MongoDBから取得したユーザー情報をセット
          setIsNewFirebaseUser(false); // 新規Firebaseユーザーではないとマーク
        } catch (error) {
          // ユーザー情報のフェッチ中にエラーが発生した場合
          // 特に、バックエンドが404 (Not Found) を返した場合
          if (error.response && error.response.status === 404) {
            console.log(
              "AuthContext: Firebaseユーザーは存在するが、MongoDBに未登録です。"
            );
            setUser(null); // MongoDBのユーザー情報はまだない
            setIsNewFirebaseUser(true); // このFirebaseユーザーはMongoDBにとって新規であるとマーク
          } else {
            // その他の予期せぬエラーの場合
            console.error(
              "AuthContext: ユーザー情報のフェッチ中に予期せぬエラーが発生しました:",
              error
            );
            setUser(null);
            setIsNewFirebaseUser(false);
          }
        }
      } else {
        // Firebaseからログアウトした場合、またはFirebaseユーザーがいない場合
        setUser(null); // MongoDBユーザー情報をクリア
        setIsNewFirebaseUser(false); // 新規Firebaseユーザーではない
      }
      setLoading(false); // ロード状態を終了
    });

    // コンポーネントのアンマウント時にリスナーをクリーンアップ
    return () => unsubscribe();
  }, []); // 依存配列が空なので、コンポーネントマウント時に一度だけ実行

  // コンテキストプロバイダーに渡す値
  const value = { user, loading, isNewFirebaseUser };

  return (
    <AuthContext.Provider value={value}>
      {/* ロード中は"Loading..."を表示し、完了後に子コンポーネントをレンダリング */}
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};
