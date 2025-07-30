// src/components/admin/AdminUserTable.jsx

import React from "react";

const AdminUserTable = ({ users, onRoleChange, onDelete }) => {
  if (!users || users.length === 0) {
    return (
      <p className="text-gray-800 dark:text-white">
        ユーザーが登録されていません。
      </p>
    );
  }

  return (
    <section className="mb-10 text-gray-800 dark:text-white">
      <h2 className="text-2xl font-bold mb-4">ユーザー一覧</h2>
      {/* ここに overflow-x-auto を追加 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="border p-2 dark:border-gray-600">UID</th>
              <th className="border p-2 dark:border-gray-600">名前</th>
              <th className="border p-2 dark:border-gray-600">
                メールアドレス
              </th>
              <th className="border p-2 dark:border-gray-600">管理者</th>
              <th className="border p-2 dark:border-gray-600">登録日</th>
              <th className="border p-2 dark:border-gray-600">削除</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="text-center">
                <td className="border p-2 text-sm dark:border-gray-600">
                  {user.uid}
                </td>
                <td className="border p-2 dark:border-gray-600">{user.name}</td>
                <td className="border p-2 dark:border-gray-600">
                  {user.email}
                </td>
                <td className="border p-2 dark:border-gray-600">
                  <input
                    type="checkbox"
                    checked={user.role === "admin"}
                    onChange={(e) =>
                      onRoleChange(
                        user._id,
                        e.target.checked ? "admin" : "user"
                      )
                    }
                  />
                </td>
                <td className="border p-2 dark:border-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="border p-2 dark:border-gray-600">
                  <button
                    onClick={() => {
                      if (window.confirm("このユーザーを削除しますか？")) {
                        onDelete(user._id);
                      }
                    }}
                    className="text-red-600 dark:text-red-400 hover:underline"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminUserTable;
