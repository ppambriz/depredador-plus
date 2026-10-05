import type { ContactConfig } from "@/types";
import { usePublicSetting } from "@/hooks/usePublicSetting";
import { DEFAULTS } from "@/services/settingsService";
import { Seo } from "@/seo/Seo";

export function PrivacyPage() {
  const { config } = usePublicSetting<ContactConfig>(
    "contact",
    DEFAULTS.contact,
  );
  const businessName = config.business_name || "Depredador Plus";

  return (
    <>
      <Seo
        title="Aviso de privacidad | Depredador Plus"
        description="Cómo tratamos y protegemos los datos personales que nos compartes."
        path="/aviso-de-privacidad"
      />

      <section className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-display text-3xl font-extrabold text-verde">
          Aviso de privacidad
        </h1>
        <p className="mt-2 text-sm text-gris">
          Última actualización:{" "}
          {new Date().toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
          })}
        </p>

        <div className="mt-10 space-y-8 leading-relaxed text-carbon">
          <div>
            <h2 className="font-display text-lg font-bold text-verde">
              Quién es responsable de tus datos
            </h2>
            <p className="mt-2">
              {businessName}, con domicilio en la ciudad de León Guanajuato, es
              responsable del tratamiento de los datos personales que nos
              compartes.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-verde">
              Qué datos recabamos
            </h2>
            <p className="mt-2">
              Cuando envías un pedido te pedimos tu nombre y número de teléfono.
              Si lo consideras necesario, puedes agregar observaciones como tu
              dirección o el horario en que prefieres recibir el producto.
            </p>
            <p className="mt-2">
              No recabamos datos sensibles ni información bancaria a través de
              este sitio.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-verde">
              Para qué los usamos
            </h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Confirmar, preparar y entregar tu pedido.</li>
              <li>
                Comunicarnos contigo sobre disponibilidad o dudas del pedido.
              </li>
              <li>Llevar el registro de ventas del negocio.</li>
            </ul>
            <p className="mt-3">
              No usamos tus datos para fines distintos a los anteriores ni los
              vendemos a terceros.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-verde">
              Con quién los compartimos
            </h2>
            <p className="mt-2">
              Solo con quien sea estrictamente necesario para entregarte tu
              pedido, como el servicio de paquetería cuando aplique. En esos
              casos compartimos únicamente los datos indispensables para la
              entrega.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-verde">
              Cuánto tiempo los conservamos
            </h2>
            <p className="mt-2">
              Conservamos tus datos mientras sean necesarios para atender tu
              pedido y cumplir con las obligaciones fiscales y contables que
              correspondan.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-verde">
              Tus derechos ARCO
            </h2>
            <p className="mt-2">
              Tienes derecho a conocer qué datos tuyos tenemos y para qué los
              usamos, pedir que corrijamos los que estén equivocados, solicitar
              que los eliminemos de nuestros registros y oponerte a que los
              usemos para fines específicos.
            </p>
            <p className="mt-2">
              Para ejercer cualquiera de estos derechos, escríbenos
              {config.email ? (
                <>
                  {" "}
                  a{" "}
                  <a
                    href={`mailto:${config.email}`}
                    className="font-medium text-verde hover:underline"
                  >
                    {config.email}
                  </a>
                </>
              ) : (
                " a nuestro correo de contacto"
              )}
              {config.whatsapp && (
                <>
                  {" "}
                  o por{" "}
                  <a
                    href={`https://wa.me/${config.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-verde hover:underline"
                  >
                    WhatsApp
                  </a>
                </>
              )}
              . Responderemos tu solicitud en un plazo máximo de 20 días
              hábiles.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-verde">
              Cambios a este aviso
            </h2>
            <p className="mt-2">
              Si modificamos este aviso, publicaremos la versión actualizada en
              esta misma página con su fecha de actualización.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
export default PrivacyPage;
