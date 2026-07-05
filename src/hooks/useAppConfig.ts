import { useEffect, useState } from "react";
import { AppConfig, getConfig } from "@/lib/api";

// Sensible fallbacks while the config loads (or if the backend is down)
const DEFAULT_CONFIG: AppConfig = {
  max_questions: 20,
  max_pdf_size_mb: 10,
  session_ttl_hours: 24,
};

// Module-level cache — every component shares one fetch per page load
let cached: AppConfig | null = null;
let pending: Promise<AppConfig> | null = null;

export function useAppConfig(): AppConfig {
  const [config, setConfig] = useState<AppConfig>(cached ?? DEFAULT_CONFIG);

  useEffect(() => {
    if (cached) return;
    pending ??= getConfig();
    pending
      .then((cfg) => {
        cached = cfg;
        setConfig(cfg);
      })
      .catch(() => {
        // Keep defaults — the backend validates the real limits anyway
      });
  }, []);

  return config;
}
