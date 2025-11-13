// src/components/Admin/AdminFilters.jsx

import React from "react";

// 📌 AdminFiltersコンポーネント
// 管理者画面で「注文一覧」を絞り込むためのフィルターUIを提供する。
// props:
// - filters: 現在のフィルター状態（sort, status, userNameなど）
// - setFilters: フィルター状態を更新する関数（useStateで管理）
// - onFilterApply: 「フィルター適用」ボタン押下時に呼ばれる処理
const AdminFilters = ({ filters, setFilters, onFilterApply }) => {
  // 入力値や選択肢が変更されたときに呼ばれるイベントハンドラ
  const handleChange = (e) => {
    const { name, value } = e.target; // 入力要素のname属性と値を取得
    setFilters((prev) => ({
      ...prev, // 既存のフィルター状態を維持しつつ
      [name]: value, // 対応するキーを更新
    }));
  };

  return (
    <div className="mb-6 bg-gray-100 dark:bg-gray-800 p-4 rounded text-gray-800 dark:text-white">
      {/* タイトル */}
      <h3 className="text-lg font-semibold mb-2">🔍 注文フィルター</h3>

      {/* フィルター入力欄を横並びで配置 */}
      <div className="flex flex-wrap gap-6 items-end">
        {/* ▼ 日付順フィルター（新しい順 / 古い順） */}
        <div className="flex flex-col">
          <label className="text-sm mb-1 dark:text-white">日付順</label>
          <select
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            className="border p-1 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="desc">新しい順</option>
            <option value="asc">古い順</option>
          </select>
        </div>

        {/* ▼ ステータスフィルター（注文の進行状況で絞り込み） */}
        <div className="flex flex-col">
          <label className="text-sm mb-1 dark:text-white">ステータス</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="border p-1 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="">すべて</option>
            <option value="未処理">未処理</option>
            <option value="処理中">処理中</option>
            <option value="発送済み">発送済み</option>
            <option value="キャンセル">キャンセル</option>
          </select>
        </div>

        {/* ▼ ユーザー名検索（例：「田中」で検索） */}
        <div className="flex flex-col">
          <label className="text-sm mb-1 dark:text-white">ユーザー名</label>
          <input
            type="text"
            name="userName"
            value={filters.userName}
            onChange={handleChange}
            placeholder="田中 など"
            className="border p-1 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* ▼ フィルタ適用ボタン */}
        <div>
          <button
            onClick={onFilterApply}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            フィルター適用
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFilters;
