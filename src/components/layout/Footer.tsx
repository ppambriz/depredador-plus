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
        <p className="font-display font-semibold text-verde">
          {config.business_name || "Depredador Plus"}
        </p>
        <p className="mt-1">
          Venenos e insecticidas para cucarachas, moscos, moscas, hormigas y
          alacranes.
        </p>

        {(whatsappLink || config.email) && (
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
          </div>
        )}

        <p className="mt-4 text-xs">
          Usa los insecticidas de forma responsable. Mantener fuera del alcance
          de niños y mascotas.
        </p>
        <p className="mt-4 text-xs text-gris/60">
          © {new Date().getFullYear()}{" "}
          {config.business_name || "Depredador Plus"}. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
