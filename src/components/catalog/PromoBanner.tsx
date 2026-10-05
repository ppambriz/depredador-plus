import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { BannerConfig, BannerSlide } from "@/types";
import { settingsService } from "@/services/settingsService";

export const PromoBanner = () => {
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [config, setconfig] = useState<BannerConfig | null>(null);
  const [enabled, setenabled] = useState(false);
  const [index, setindex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    settingsService
      .getBanner()
      .then((data) => {
        if (cancelled) return;
        setenabled(data.enabled);
        setconfig(data.config);
        setSlides(data.slides);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isCarousel = config?.mode === "carousel" && slides.length > 1;
  const total = slides.length;

  const goTo = useCallback(
    (next: number) => {
      setindex(((next % total) + total) % total);
    },
    [total],
  );

  // Autoplay
  useEffect(() => {
    if (!isCarousel || paused) return;

    const timer = setInterval(() => {
      setindex((prev) => (prev + 1) % total);
    }, config?.autoplay_ms ?? 5000);

    return () => {
      clearInterval(timer);
    };
  }, [isCarousel, paused, total, config?.autoplay_ms]);

  // Mientras se consulta la configuración, reservamos la altura del banner
  // para que el contenido de abajo no salte cuando llegue.
  if (loading) {
    return (
      <div
        className="aspect-[21/9] w-full bg-fondo sm:aspect-[3/1]"
        aria-hidden
      />
    );
  }

  if (loading) {
    return (
      <div
        className="aspect-[21/9] w-full bg-fondo sm:aspect-[3/1]"
        aria-hidden
      />
    );
  }

  if (!enabled || slides.length === 0) return null;

  const current = slides[index];
  if (!current) return null;

  const content = (
    <div className="relative aspect-[21/9] w-full overflow-hidden sm:aspect-[3/1]">
      {slides.map((slide, i) => (
        <img
          key={slide.id}
          src={slide.image_url}
          alt={slide.title ?? "Promoción"}
          fetchPriority={i === 0 ? "high" : "low"}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {(current.title || current.subtitle) && (
        <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-carbon/70 to-transparent px-6 sm:px-12">
          {current.title && (
            <h2 className="max-w-md font-display text-2xl font-extrabold leading-tight text-white sm:text-4xl">
              {current.title}
            </h2>
          )}
          {current.subtitle && (
            <p className="mt-2 max-w-sm text-sm text-white/90 sm:text-base">
              {current.subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription={isCarousel ? "carrusel" : undefined}
      aria-label="Promociones"
    >
      {current.link ? (
        <Link to={current.link} className="block">
          {content}
        </Link>
      ) : (
        content
      )}

      {isCarousel && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            aria-label="Anterior"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-carbon transition hover:bg-white"
          >
            ‹
          </button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="Siguiente"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-carbon transition hover:bg-white"
          >
            ›
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => goTo(i)}
                aria-label={`Ir a la promoción ${i + 1}`}
                aria-current={i === index}
                className="flex h-6 min-w-6 cursor-pointer items-center justify-center px-1"
              >
                <span
                  className={`block h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-white" : "w-2 bg-white/50"
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
