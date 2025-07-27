// src/components/admin/AdminUserTable.jsx

import React from "react";

const AdminUserTable = ({ users, onRoleChange, onDelete }) => {
  if (!users || users.length === 0) {
    return <p>ユーザーが登録されていません。</p>;
  }

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-4">ユーザー一覧</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">UID</th>
            <th className="border p-2">名前</th>
            <th className="border p-2">メールアドレス</th>
            <th className="border p-2">管理者</th>
            <th className="border p-2">登録日</th>
            <th className="border p-2">削除</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="text-center">
              <td className="border p-2 text-sm">{user.uid}</td>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">
                <input
                  type="checkbox"
                  checked={user.role === "admin"}
                  onChange={(e) =>
                    onRoleChange(user._id, e.target.checked ? "admin" : "user")
                  }
                />
              </td>
              <td className="border p-2">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => {
                    if (window.confirm("このユーザーを削除しますか？")) {
                      onDelete(user._id);
                    }
                  }}
                  className="text-red-600 hover:underline"
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default AdminUserTable;
