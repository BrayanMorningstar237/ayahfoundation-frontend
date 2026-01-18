import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * PUBLIC: About section
 * GET /api/public/sections/about
 */
export const SectionsPublicAPI = {
  async getAbout(): Promise<any> {
    const response = await axios.get(`${API_URL}/public/sections/about`);

    // 🔍 LOG EXACT BACKEND RESPONSE
    console.log("🧠 RAW BACKEND RESPONSE:", response);
    console.log("📦 response.data:", response.data);
    console.log("📦 response.data.data:", response.data?.data);

    return response.data;
  }
};
