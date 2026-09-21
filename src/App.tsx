import { Route, Routes } from "react-router-dom";

import { ScrollToTop } from "@/components/ScrollToTop";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { ProductPage } from "./pages/ProductPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { CatalogPage } from "./pages/CatalogPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { LoginPage } from "./pages/admin/LoginPage";
import { CategoriesPage } from "./pages/admin/CategoriesPage";
import { CategoryFormPage } from "@/pages/admin/CategoryFormPage";

export const App = () => {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/producto/:id" element={<ProductPage />} />

          {/* Admin */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categorias"
            element={
              <ProtectedRoute>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categorias/nueva"
            element={
              <ProtectedRoute>
                <CategoryFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categorias/:id"
            element={
              <ProtectedRoute>
                <CategoryFormPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </>
  );
};
