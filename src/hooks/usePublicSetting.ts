import { useEffect, useState } from "react";
import type { SettingSection } from "@/types";
import { settingsService } from "@/services/settingsService";

const CACHE_PREFIX = "dp_setting_";

function readCache<T>(section: string): { enabled: boolean; config: T } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + section);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(section: string, data: unknown) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + section, JSON.stringify(data));
  } catch {
    // Storage no disponible
  }
}

export function usePublicSetting<T>(section: SettingSection, fallback: T) {
  const cached = readCache<T>(section);

  const [enabled, setEnabled] = useState(cached?.enabled ?? false);
  const [config, setConfig] = useState<T>(cached?.config ?? fallback);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let cancelled = false;

    settingsService
      .get(section)
      .then((setting) => {
        if (cancelled) return;
        const next = {
          enabled: setting?.enabled ?? false,
          config: { ...fallback, ...((setting?.config as Partial<T>) ?? {}) },
        };
        setEnabled(next.enabled);
        setConfig(next.config);
        writeCache(section, next);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  return { enabled, config, loading };
}
