## Entornos y base de datos

El proyecto usa **una sola base de datos** en Supabase (`depredador-plus`) para
desarrollo local, previews y producción.

**Motivo:** Netlify (plan gratuito) no separa variables de entorno por rama, así
que un segundo proyecto no aislaba realmente los entornos.

**Implicaciones:**
- Lo que se pruebe en local o en un Deploy Preview escribe sobre datos reales.
- Los datos de prueba deben limpiarse después de usarse.
- Para pruebas de funciones nuevas, mantenerlas apagadas con los módulos
  (feature flags) en Configuración hasta que estén listas.

**A futuro:** el proyecto `depredador-plus-prod` de Supabase se conserva sin uso.
Si se necesita volver a separar entornos, se reutiliza para eso.