// src/components/Admin/AdminFilters.jsx
import React from "react";

const AdminFilters = ({ filters, setFilters, onFilterApply }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="mb-6 bg-gray-100 p-4 rounded">
      <h3 className="text-lg font-semibold mb-2">🔍 注文フィルター</h3>
      <div className="flex flex-wrap gap-6 items-end">
        {/* 日付順フィルター */}
        <div className="flex flex-col">
          <label className="text-sm mb-1">日付順</label>
          <select
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            className="border p-1 rounded"
          >
            <option value="desc">新しい順</option>
            <option value="asc">古い順</option>
          </select>
        </div>

        {/* ステータスフィルター */}
        <div className="flex flex-col">
          <label className="text-sm mb-1">ステータス</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="border p-1 rounded"
          >
            <option value="">すべて</option>
            <option value="未処理">未処理</option>
            <option value="処理中">処理中</option>
            <option value="発送済み">発送済み</option>
            <option value="キャンセル">キャンセル</option>
          </select>
        </div>

        {/* ユーザー名検索 */}
        <div className="flex flex-col">
          <label className="text-sm mb-1">ユーザー名</label>
          <input
            type="text"
            name="userName"
            value={filters.userName}
            onChange={handleChange}
            placeholder="田中 など"
            className="border p-1 rounded"
          />
        </div>

        {/* フィルタ適用ボタン */}
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
