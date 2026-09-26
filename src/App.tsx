import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

import { ScrollToTop } from "@/components/ScrollToTop";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PageLoader } from "./components/ui/PageLoader";

// Public pages: loades on demand
const CatalogPage = lazy(() => import("@/pages/CatalogPage"));
const ProductPage = lazy(() => import("@/pages/ProductPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// Admin pages: never downloaded by public visitors
const LoginPage = lazy(() => import("@/pages/admin/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const CategoriesPage = lazy(() => import("@/pages/admin/CategoriesPage"));
const CategoryFormPage = lazy(() => import("@/pages/admin/CategoryFormPage"));
const ProductsPage = lazy(() => import("@/pages/admin/ProductsPage"));
const ProductFormPage = lazy(() => import("@/pages/admin/ProductFormPage"));

export const App = () => {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<PageLoader />}>
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
            <Route
              path="/admin/productos"
              element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/productos/nuevo"
              element={
                <ProtectedRoute>
                  <ProductFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/productos/:id"
              element={
                <ProtectedRoute>
                  <ProductFormPage />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  );
};
