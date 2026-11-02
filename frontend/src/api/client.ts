import axios from 'axios';
import {
  AuthResponse,
  User,
  PublicProduct,
  AdminProduct,
  Cart,
  Order,
  CheckoutResponse,
  BulkEnquiry,
  DashboardSummary,
  StockMovement,
  AdminSizeStock,
  School,
  SchoolSummary,
  Student,
  StudentOrder
} from '../types';

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  // Production fallback: default to Render backend if no env var is provided
  if (import.meta.env.PROD) {
    return 'https://beta-backend-z3su.onrender.com/api';
  }
  // Local development fallback: proxied by Vite dev server
  return '/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('beta_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-clear on failed login request itself
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('beta_token');
        localStorage.removeItem('beta_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: any) => api.post<AuthResponse>('/auth/login', data),
  register: (data: any) => api.post<AuthResponse>('/auth/register', data),
  getMe: () => api.get<User>('/auth/me'),
};

export const productApi = {
  getPublicCatalogue: (params?: { category?: string; search?: string; ukSize?: string; page?: number; size?: number; sort?: string }) =>
    api.get<{ content: PublicProduct[]; totalPages: number; totalElements: number }>('/products', { params }),
  getPublicProduct: (id: string) => api.get<PublicProduct>(`/products/${id}`),
};

export const cartApi = {
  getCart: () => api.get<Cart>('/cart'),
  addToCart: (productSizeId: string, quantity: number) => api.post<Cart>('/cart/items', { productSizeId, quantity }),
  updateQuantity: (itemId: string, quantity: number) => api.put<Cart>(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete<Cart>(`/cart/items/${itemId}`),
  clearCart: () => api.delete<void>('/cart'),
};

export const orderApi = {
  checkout: (data: { recipientName: string; phone: string; addressLine1: string; addressLine2?: string; city: string; state: string; postalCode: string; customerNotes?: string }) =>
    api.post<CheckoutResponse>('/orders/checkout', data),
  getMyOrders: (page = 0, size = 10) => api.get<{ content: Order[]; totalPages: number; totalElements: number }>('/orders/mine', { params: { page, size } }),
  getMyOrderById: (orderId: string) => api.get<Order>(`/orders/mine/${orderId}`),
  trackOrder: (orderNumber: string) => api.get<Order>(`/orders/track/${orderNumber}`),
  verifyRazorpayPayment: (data: {
    orderNumber: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => api.post<Order>('/payments/razorpay/verify', data),
};

export const bulkEnquiryApi = {
  submitEnquiry: (data: { schoolName: string; contactPerson: string; phone: string; email: string; cityState: string; estimatedStudents?: number; shoeModelsRequested?: string; notes?: string }) =>
    api.post<BulkEnquiry>('/bulk-enquiries', data),
};

export const adminApi = {
  getDashboardSummary: () => api.get<DashboardSummary>('/admin/dashboard/summary'),
  getProducts: (params?: { category?: string; search?: string; page?: number; size?: number }) =>
    api.get<{ content: AdminProduct[]; totalPages: number; totalElements: number }>('/admin/products', { params }),
  getProductById: (id: string) => api.get<AdminProduct>(`/admin/products/${id}`),
  createProduct: (data: any) => api.post<AdminProduct>('/admin/products', data),
  updateProduct: (id: string, data: any) => api.put<AdminProduct>(`/admin/products/${id}`, data),
  toggleActive: (id: string, isActive: boolean) => api.patch<AdminProduct>(`/admin/products/${id}/status`, null, { params: { isActive } }),
  uploadProductImage: (productId: string, formData: FormData, isPrimary = false) =>
    api.post<AdminProduct>(`/admin/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { isPrimary }
    }),
  deleteProductImage: (imageId: string) => api.delete<void>(`/admin/products/images/${imageId}`),
  addSize: (productId: string, ukSize: string, initialStock = 20) =>
    api.post<AdminProduct>(`/admin/products/${productId}/sizes`, null, { params: { ukSize, initialStock } }),
  adjustStock: (data: { productSizeId: string; quantityChange: number; movementType: string; notes?: string }) =>
    api.post<AdminSizeStock>('/admin/inventory/adjust', data),
  getLowStockAlerts: () => api.get<AdminSizeStock[]>('/admin/inventory/alerts/low-stock'),
  getStockMovements: (params?: { productSizeId?: string; page?: number; size?: number }) =>
    api.get<{ content: StockMovement[]; totalPages: number; totalElements: number }>('/admin/inventory/movements', { params }),
  getOrders: (params?: { status?: string; search?: string; page?: number; size?: number }) =>
    api.get<{ content: Order[]; totalPages: number; totalElements: number }>('/admin/orders', { params }),
  updateOrderStatus: (orderId: string, status: string) =>
    api.patch<Order>(`/admin/orders/${orderId}/status`, { status }),
  getBulkEnquiries: (params?: { status?: string; search?: string; page?: number; size?: number }) =>
    api.get<{ content: BulkEnquiry[]; totalPages: number; totalElements: number }>('/bulk-enquiries', { params }),
  updateEnquiryStatus: (id: string, data: { status: string; adminNotes?: string }) =>
    api.patch<BulkEnquiry>(`/bulk-enquiries/${id}/status`, data),
};

export const schoolApi = {
  getSchools: (params?: { search?: string; isActive?: boolean; page?: number; size?: number }) =>
    api.get<{ content: School[]; totalPages: number; totalElements: number }>('/admin/schools', { params }),
  getSchool: (id: string) => api.get<School>(`/admin/schools/${id}`),
  getSchoolSummary: (id: string) => api.get<SchoolSummary>(`/admin/schools/${id}/summary`),
  createSchool: (data: { name: string; code: string; address: string; contactPerson: string; phone: string; email: string; isActive?: boolean }) =>
    api.post<School>('/admin/schools', data),
  updateSchool: (id: string, data: { name: string; code: string; address: string; contactPerson: string; phone: string; email: string; isActive?: boolean }) =>
    api.put<School>(`/admin/schools/${id}`, data),
  deactivateSchool: (id: string) => api.patch<void>(`/admin/schools/${id}/deactivate`),
  activateSchool: (id: string) => api.patch<void>(`/admin/schools/${id}/activate`),
  exportOrdersCsv: (id: string) =>
    api.get<string>(`/admin/schools/${id}/reports/csv`, { responseType: 'text' as any }),
};

export const studentApi = {
  getStudents: (schoolId: string, params?: { search?: string; gradeClass?: string; section?: string; isActive?: boolean; page?: number; size?: number }) =>
    api.get<{ content: Student[]; totalPages: number; totalElements: number }>(`/admin/students/school/${schoolId}`, { params }),
  getStudent: (id: string) => api.get<Student>(`/admin/students/${id}`),
  createStudent: (data: any) => api.post<Student>('/admin/students', data),
  updateStudent: (id: string, data: any) => api.put<Student>(`/admin/students/${id}`, data),
  getSchoolClasses: (schoolId: string) => api.get<string[]>(`/admin/students/school/${schoolId}/classes`),
  getSchoolSections: (schoolId: string) => api.get<string[]>(`/admin/students/school/${schoolId}/sections`),
  getStudentOrders: (id: string) => api.get<StudentOrder[]>(`/admin/students/${id}/orders`),
};

export const schoolOrderApi = {
  createOrder: (data: any) => api.post<StudentOrder>('/admin/school-orders', data),
  updateOrder: (id: string, data: any) => api.put<StudentOrder>(`/admin/school-orders/${id}`, data),
  updateOrderStatus: (id: string, data: { status: string; stockPolicy?: string; notes?: string }) =>
    api.patch<StudentOrder>(`/admin/school-orders/${id}/status`, data),
  getOrder: (id: string) => api.get<StudentOrder>(`/admin/school-orders/${id}`),
  getAllOrders: (params?: { schoolId?: string; search?: string; status?: string; page?: number; size?: number }) =>
    api.get<{ content: StudentOrder[]; totalPages: number; totalElements: number }>('/admin/school-orders', { params }),
  getSchoolOrders: (schoolId: string, params?: { search?: string; status?: string; page?: number; size?: number }) =>
    api.get<{ content: StudentOrder[]; totalPages: number; totalElements: number }>(`/admin/school-orders/school/${schoolId}`, { params }),
};

export default api;
