import { Seo } from "@/seo/Seo";
import { AdminLayout } from "@/components/layout/AdminLayout";

export function DashboardPage() {
  return (
    <>
      <Seo
        title="Dashboard | Admin"
        description="Panel de administración"
        noindex
      />
      <AdminLayout title="Panel de administración">
        <p className="text-gris">Selecciona una sección en el menú superior.</p>
      </AdminLayout>
    </>
  );
}
