// src/api/sales.js
import axios from "axios";

export const fetchDailySales = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/sales/daily`); // 🔁 フルURL不要
  return res.data;
};
