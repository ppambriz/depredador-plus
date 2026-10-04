import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { WelcomeModalConfig } from "@/types";
import { usePublicSetting } from "@/hooks/usePublicSetting";
import { DEFAULTS } from "@/services/settingsService";

const STORAGE_KEY = "dp_welcome_modal_seen";

function shouldShow(config: WelcomeModalConfig): boolean {
  const today = new Date().toISOString().slice(0, 10);

  // Date range
  if (config.start_date && today < config.start_date) return false;
  if (config.end_date && today > config.end_date) return false;

  if (config.frequency === "always") return true;

  try {
    if (config.frequency === "session") {
      return sessionStorage.getItem(STORAGE_KEY) === null;
    }

    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (!lastSeen) return true;

    const daysPassed = (Date.now() - Number(lastSeen)) / 86400000;
    return daysPassed >= config.frequency_days;
  } catch {
    return true;
  }
}

function markAsSeen(config: WelcomeModalConfig) {
  try {
    if (config.frequency === "session") {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } else if (config.frequency === "days") {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    }
  } catch {
    // Storage unavailable: nothing to do
  }
}

export function WelcomeModal() {
  const { enabled, config, loading } = usePublicSetting<WelcomeModalConfig>(
    "welcome_modal",
    DEFAULTS.welcome_modal,
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || !enabled) return;
    if (!config.title && !config.text) return;
    if (!shouldShow(config)) return;

    const timer = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(timer);
  }, [loading, enabled, config]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    markAsSeen(config);
    setOpen(false);
  }

  if (!open) return null;

  const hasImage = Boolean(config.image_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-backdrop-in absolute inset-0 bg-carbon/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        className="animate-modal-in relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <button
          onClick={handleClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-carbon/30 text-white backdrop-blur-sm transition hover:bg-carbon/50"
        >
          ✕
        </button>

        {hasImage && (
          <div className="aspect-[5/3] w-full overflow-hidden bg-fondo">
            <img
              src={config.image_url!}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className={hasImage ? "p-6" : "px-6 pb-6 pt-10"}>
          {!hasImage && (
            <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-ambar/15 text-xl">
              🔔
            </span>
          )}

          {config.title && (
            <h2 className="font-display text-2xl font-extrabold leading-tight text-verde">
              {config.title}
            </h2>
          )}

          {config.text && (
            <p className="mt-2 whitespace-pre-line leading-relaxed text-gris">
              {config.text}
            </p>
          )}

          {config.button_label && config.button_link && (
            <Link
              to={config.button_link}
              onClick={handleClose}
              className="mt-6 block w-full rounded-xl bg-verde py-3.5 text-center font-display font-semibold text-white transition hover:bg-verde-oscuro"
            >
              {config.button_label}
            </Link>
          )}

          <button
            onClick={handleClose}
            className="mt-3 w-full cursor-pointer py-1 text-center text-sm text-gris transition hover:text-carbon"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
