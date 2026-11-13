import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { CataloguePage } from './pages/CataloguePage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { BulkEnquiryPage } from './pages/BulkEnquiryPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminEnquiriesPage } from './pages/admin/AdminEnquiriesPage';
import { AdminSchoolsPage } from './pages/admin/AdminSchoolsPage';
import { AdminSchoolDashboardPage } from './pages/admin/AdminSchoolDashboardPage';
import { AdminSchoolVisitOrdersListPage } from './pages/admin/AdminSchoolVisitOrdersListPage';
import { AdminSchoolVisitOrderFormPage } from './pages/admin/AdminSchoolVisitOrderFormPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

export const App: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {!isAdminRoute && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public Storefront Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/bulk-enquiry" element={<BulkEnquiryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/track" element={<OrderTrackingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer Protected Routes */}
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderNumber/success"
            element={
              <ProtectedRoute>
                <OrderSuccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminProductsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminProductFormPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminProductFormPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminInventoryPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminOrdersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enquiries"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminEnquiriesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schools"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminSchoolsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schools/:schoolId"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminSchoolDashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/school-visit-orders"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminSchoolVisitOrdersListPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/school-visit-orders/new"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminSchoolVisitOrderFormPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminUsersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
};
