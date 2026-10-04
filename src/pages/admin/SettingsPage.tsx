import { useState } from "react";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Seo } from "@/seo/Seo";
import { BannerSettings } from "@/pages/admin/settings/BannerSettings";
import { WelcomeModalSettings } from "@/pages/admin/settings/WelcomeModalSettings";
import { AnnouncementBarSettings } from "@/pages/admin/settings/AnnouncementBarSettings";
import { ContactSettings } from "@/pages/admin/settings/ContactSettings";
import { ModulesSettings } from "@/pages/admin/settings/ModulesSettings";
import { CodesSettings } from "@/pages/admin/settings/CodesSettings";

const SECTIONS = [
  { id: "banner", label: "Banner" },
  { id: "welcome_modal", label: "Modal de bienvenida" },
  { id: "announcement_bar", label: "Barra de avisos" },
  { id: "contact", label: "Contacto" },
  { id: "modules", label: "Módulos" },
  { id: "codes", label: "Códigos" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function SettingsPage() {
  const [active, setActive] = useState<SectionId>("banner");

  return (
    <>
      <Seo
        title="Configuración | Admin"
        description="Diseño y configuración del sitio"
        noindex
      />
      <AdminLayout title="Diseño y configuración">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Section menu */}
          <nav className="flex flex-wrap gap-1 lg:flex-col">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActive(section.id)}
                className={`cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  active === section.id
                    ? "bg-verde text-white"
                    : "text-gris hover:bg-verde/5 hover:text-verde"
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>

          {/* Section content */}
          <div>
            {active === "banner" && <BannerSettings />}
            {active === "welcome_modal" && <WelcomeModalSettings />}
            {active === "announcement_bar" && <AnnouncementBarSettings />}
            {active === "contact" && <ContactSettings />}
            {active === "modules" && <ModulesSettings />}
            {active === "codes" && <CodesSettings />}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
export default SettingsPage;
