// middleware/adminCheck.js
const adminCheck = (req, res, next) => {
  const user = req.user; // 事前に認証済みユーザー情報がreq.userにある想定

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: 管理者権限が必要です" });
  }

  next();
};

module.exports = adminCheck;
