import { useEffect, useState } from "react";
import type { SettingSection } from "@/types";
import { settingsService } from "@/services/settingsService";

export function usePublicSetting<T>(section: SettingSection, fallback: T) {
  const [enabled, setEnabled] = useState(false);
  const [config, setConfig] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    settingsService
      .get(section)
      .then((setting) => {
        if (cancelled) return;
        setEnabled(setting?.enabled ?? false);
        setConfig({ ...fallback, ...((setting?.config as Partial<T>) ?? {}) });
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
