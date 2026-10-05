import { Link } from "react-router-dom";

import type { ContactConfig } from "@/types";
import { usePublicSetting } from "@/hooks/usePublicSetting";
import { DEFAULTS } from "@/services/settingsService";

export function Footer() {
  const { config } = usePublicSetting<ContactConfig>(
    "contact",
    DEFAULTS.contact,
  );

  const whatsappLink = config.whatsapp
    ? `https://wa.me/${config.whatsapp}`
    : null;

  return (
    <footer id="contacto" className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gris">
        <picture>
          <source srcSet="/logo-footer.webp" type="image/webp" />
          <img
            src="/logo-footer.png"
            alt={config.business_name || "Depredador Plus"}
            width={132}
            height={36}
            loading="lazy"
            className="h-9 w-[132px]"
          />
        </picture>
        <p className="mt-1">
          Venenos e insecticidas para cucarachas, moscos, moscas, hormigas y
          alacranes.
        </p>

        {(whatsappLink || config.email) && (
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="mt-4 flex flex-wrap gap-4">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-verde hover:underline"
                >
                  WhatsApp
                </a>
              )}
              {config.email && (
                <a
                  href={`mailto:${config.email}`}
                  className="font-medium text-verde hover:underline"
                >
                  {config.email}
                </a>
              )}
              <Link
                to="/aviso-de-privacidad"
                className="font-medium text-verde hover:underline"
              >
                Aviso de privacidad
              </Link>
            </div>
          </div>
        )}

        <p className="mt-4 text-xs">
          Usa los insecticidas de forma responsable. Mantener fuera del alcance
          de niños y mascotas.
        </p>
        <p className="mt-4 text-xs text-gris">
          © {new Date().getFullYear()}{" "}
          {config.business_name || "Depredador Plus"}. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
