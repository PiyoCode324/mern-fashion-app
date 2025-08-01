// src/api/sales.js
import axios from "axios";

export const fetchDailySales = async () => {
  const res = await axios.get("/api/sales/daily"); // 🔁 フルURL不要
  return res.data;
};
