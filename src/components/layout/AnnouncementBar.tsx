import { Link } from "react-router-dom";
import type { AnnouncementBarConfig } from "@/types";
import { usePublicSetting } from "@/hooks/usePublicSetting";
import { DEFAULTS } from "@/services/settingsService";

export function AnnouncementBar() {
  const { enabled, config } = usePublicSetting<AnnouncementBarConfig>(
    "announcement_bar",
    DEFAULTS.announcement_bar,
  );

  if (!enabled || !config.text) return null;

  const content = (
    <p className="px-4 py-2 text-center text-sm font-medium text-white">
      {config.text}
    </p>
  );

  return (
    <div style={{ backgroundColor: config.color }}>
      {config.link ? (
        <Link to={config.link} className="block hover:opacity-90">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
