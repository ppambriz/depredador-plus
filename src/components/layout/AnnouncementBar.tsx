import { Link } from "react-router-dom";
import type { AnnouncementBarConfig } from "@/types";
import { usePublicSetting } from "@/hooks/usePublicSetting";
import { DEFAULTS } from "@/services/settingsService";

export function AnnouncementBar() {
  const { enabled, config, loading } = usePublicSetting<AnnouncementBarConfig>(
    "announcement_bar",
    DEFAULTS.announcement_bar,
  );

  if (loading) {
    return <div className="h-9 w-full bg-fondo" aria-hidden />;
  }

  if (!enabled || !config.text) return null;

  const content = (
    <p
      className="px-4 py-2 text-center text-sm font-medium"
      style={{ color: config.color === "#F9A825" ? "#212121" : "#FFFFFF" }}
    >
      {config.text}
    </p>
  );

  return (
    <div
      className="flex h-9 items-center justify-center"
      style={{ backgroundColor: config.color }}
    >
      {config.link ? (
        <Link to={config.link} className="hover:opacity-90">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
