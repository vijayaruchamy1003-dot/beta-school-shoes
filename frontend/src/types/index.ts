export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface PublicSize {
  id: string;
  ukSize: string;
  available?: boolean;
  isAvailable?: boolean;
}

export interface PublicProduct {
  id: string;
  shortId?: string;
  sku: string;
  name: string;
  shortDescription: string;
  category: string;
  catalogType?: 'WEBSITE' | 'SCHOOL_ORDER' | string;
  basePrice: number;
  mrp?: number;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  badgeText?: string;
  primaryImageUrl?: string;
  imageUrls: string[];
  sizes: PublicSize[];
}

export interface AdminProduct {
  id: string;
  shortId?: string;
  sku: string;
  name: string;
  shortDescription: string;
  category: string;
  catalogType?: 'WEBSITE' | 'SCHOOL_ORDER' | string;
  basePrice: number;
  mrp?: number;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  badgeText?: string;
  isActive: boolean;
  primaryImageUrl?: string;
  images: { id: string; imageUrl: string; isPrimary: boolean; displayOrder: number }[];
  sizes: AdminSizeStock[];
  totalCombinedStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSizeStock {
  sizeId: string;
  ukSize: string;
  price?: number;
  isAvailable: boolean;
  inventoryId?: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
}

export interface CartItem {
  itemId: string;
  productId: string;
  productName: string;
  sku: string;
  productSizeId: string;
  ukSize: string;
  unitPrice: number;
  quantity: number;
  itemTotal: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface Cart {
  cartId: string;
  items: CartItem[];
  totalItemsCount: number;
  subtotal: number;
  estimatedTax: number;
  estimatedShipping: number;
  estimatedTotal: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productSizeId: string;
  productName: string;
  sizeLabel: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface PaymentRecord {
  id: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  paymentMethod?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING_PAYMENT' | 'PAID' | 'PAYMENT_FAILED' | 'CANCELLED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  totalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  shippingAddressJson: string;
  customerNotes?: string;
  reservationExpiresAt?: string;
  items: OrderItem[];
  payments: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  reservationExpiresAt?: string;
  razorpayKeyId?: string;
  razorpayOrderId?: string;
  razorpayAmountInPaise?: number;
  currency?: string;
  cashfreePaymentSessionId?: string;
  cashfreeOrderId?: string;
  paymentUrl?: string;
}

export interface BulkEnquiry {
  id: string;
  schoolName: string;
  contactPerson: string;
  phone: string;
  email: string;
  cityState: string;
  estimatedStudents?: number;
  shoeModelsRequested?: string;
  notes?: string;
  status: 'NEW' | 'IN_REVIEW' | 'QUOTATION_SENT' | 'CONVERTED' | 'CLOSED';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  totalRevenue: number;
  newBulkEnquiries: number;
  lowStockAlertsCount: number;
  lowStockItems: AdminSizeStock[];
}

export interface StockMovement {
  id: string;
  productSizeId: string;
  productName: string;
  sku: string;
  ukSize: string;
  movementType: string;
  quantity: number;
  referenceOrderId?: string;
  notes?: string;
  createdAt: string;
}

// School & Student Order Module
export type SchoolProductCategory = 'SHOES' | 'SHIRTS' | 'PANTS' | 'SHORTS' | 'TSHIRTS' | 'SOCKS' | 'BAGS';
export type SchoolOrderStatus = 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'FULFILLED' | 'CANCELLED';
export type SchoolOrderStockPolicy = 'BOOKING_ONLY' | 'RESERVE_STOCK';

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  isActive: boolean;
  totalStudents: number;
  totalOrders: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySizeSummary {
  category: SchoolProductCategory;
  sizeLabel: string;
  quantity: number;
}

export interface SchoolSummary {
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  totalStudents: number;
  totalOrders: number;
  totalItemsBooked: number;
  shoesCount: number;
  shirtsCount: number;
  pantsCount: number;
  shortsCount: number;
  tshirtsCount: number;
  socksCount: number;
  bagsCount: number;
  categorySizeBreakdown: CategorySizeSummary[];
}

export interface Student {
  id: string;
  schoolId: string;
  schoolName: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gradeClass: string;
  section?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  gender?: string;
  isActive: boolean;
  ordersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentOrderItem {
  id: string;
  productId?: string;
  productSizeId?: string;
  category: SchoolProductCategory;
  productName: string;
  sizeLabel: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  itemNotes?: string;
  stockReserved: boolean;
}

export interface StudentOrder {
  id: string;
  schoolId: string;
  schoolName: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  gradeClass: string;
  section?: string;
  parentContact?: string;
  orderNumber: string;
  orderType: string;
  status: SchoolOrderStatus;
  stockPolicy: SchoolOrderStockPolicy;
  totalQuantity: number;
  estimatedTotalAmount: number;
  notes?: string;
  visitDate: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  items: StudentOrderItem[];
}

export interface BulkImportRow {
  admissionNumber?: string;
  studentName: string;
  gradeClass?: string;
  section?: string;
  parentName?: string;
  parentPhone?: string;
  gender?: string;
  category?: string;
  productName: string;
  sizeLabel: string;
  quantity: number;
  unitPrice?: number;
  notes?: string;
}

export interface BulkImportResponse {
  studentsProcessed: number;
  newStudentsCreated: number;
  ordersCreated: number;
  totalItemsImported: number;
  orders: StudentOrder[];
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  enabled: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}


