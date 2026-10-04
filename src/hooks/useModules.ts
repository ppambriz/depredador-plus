import type { ModulesConfig } from "@/types";
import { usePublicSetting } from "@/hooks/usePublicSetting";
import { DEFAULTS } from "@/services/settingsService";

export function useModules() {
  const { config, loading } = usePublicSetting<ModulesConfig>(
    "modules",
    DEFAULTS.modules,
  );
  return { modules: config, loading };
}
