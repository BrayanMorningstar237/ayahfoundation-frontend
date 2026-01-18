import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface WallImage {
  url: string;
  publicId: string;
}

export interface PublicHero {
  tagline: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  donateButtonText: string;
  watchButtonText: string;
  enabled: boolean;
  wallImages: WallImage[];
}

export const HeroPublicAPI = {
  async getHero(): Promise<any> {
    const response = await axios.get(`${API_URL}/public/hero`);

    // 🔍 LOG EXACT BACKEND RESPONSE
    console.log("🧠 RAW BACKEND RESPONSE:", response);
    console.log("📦 response.data:", response.data);
    console.log("📦 response.data.data:", response.data?.data);

    return response.data;
  }
};
