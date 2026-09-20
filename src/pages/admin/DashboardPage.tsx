import { useNavigate } from 'react-router-dom'
import { Seo } from '@/seo/Seo'
import { authService } from '@/services/authService'

export function DashboardPage() {
  const navigate = useNavigate()

  async function handleLogout() {
    await authService.logout()
    navigate('/admin/login')
  }

  return (
    <>
      <Seo
        title="Dashboard | Depredador Plus"
        description="Panel de administración"
        noindex
      />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-verde">
            Panel de administración
          </h1>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-rojo/30 px-4 py-2 text-sm font-medium text-rojo transition hover:bg-rojo/5"
          >
            Cerrar sesión
          </button>
        </div>
        <p className="mt-4 text-gris">
          Aquí irán las opciones de gestión (productos, categorías, diseño del sitio).
        </p>
      </section>
    </>
  )
}