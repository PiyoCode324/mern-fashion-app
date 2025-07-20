// middleware/adminCheck.js

// 🔒 This middleware restricts access to administrator users only.
// It should be used after authentication (i.e., when req.user contains the logged-in user's information).

const adminCheck = (req, res, next) => {
  const user = req.user; // 🔍 Retrieve the user information stored after authentication

  // ✅ If the user is not logged in (no user info found), return 401 (Unauthorized)
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // ❌ If the user is not an administrator, return 403 (Forbidden)
  if (user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  // 👍 If the user is an administrator, proceed to the next middleware or route handler
  next();
};

// 📦 Export the middleware for use in other files
module.exports = adminCheck;
