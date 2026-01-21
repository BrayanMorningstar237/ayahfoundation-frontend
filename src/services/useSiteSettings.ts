import { useEffect, useState } from "react";
import axios from "axios";

export interface SiteSettings {
  siteName: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

const API_URL = import.meta.env.VITE_API_URL;

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    axios
      .get<SiteSettings>(`${API_URL}/settings/public`)
      .then((res) => {
        console.log("🟢 Site settings response:", res.data);
        setSettings(res.data);
      })
      .catch((err) => {
        console.error("🔴 Failed to load site settings:", err);
      });
  }, []);

  return settings;
}
