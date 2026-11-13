# BETA School Shoes E-commerce Platform

A production-grade, single-vendor e-commerce web platform for an authorized school footwear distributor who is an official institutional partner of **BETA**.

Built with **React + Vite + TypeScript**, **Java 21 Spring Boot 3.3 REST API**, **PostgreSQL** with **Flyway migrations**, **Spring Security JWT**, **concurrency-safe row-locking stock reservations**, and direct online payment link integration.

---

## 🌟 Key Architecture & Capabilities

1. **Storefront & UI/UX (React + Vite + TypeScript + Tailwind CSS):**
   - Clean, modern, mobile-responsive storefront with white backgrounds, navy accents, and simple typography.
   - **Public Pages:**
     - Home page with official BETA institutional partnership introduction.
     - Product catalogue with real-time search, category filters, and size selection.
     - Product details with high-resolution imagery, short description, available sizes, and price.
     - **Product Cards:** Display only image, name, price, and size-selection action (exact stock counts are strictly kept private).
     - Shopping cart and checkout.
     - Customer registration/login, order history, and order tracking.
     - School bulk enquiry submission form.
     - Company & showroom contact coordinates.

2. **Secure Admin Dashboard:**
   - Dedicated portal (`/admin`) guarded by `ROLE_ADMIN`.
   - Live dashboard summary: total products, active products, total orders, paid revenue, pending bulk enquiries, and low-stock alerts.
   - **Single-Form Product Management:** Add/edit products with product name, image upload, short description, category, and price.
   - **Size-Wise Inventory Control:** Physical stock, reserved stock, available stock, low-stock threshold, and active/inactive status.
   - **Stock Movements Audit Log:** Logs every RESTOCK, SALE, RESERVATION, and RELEASE.
   - **Order Fulfillment Management:** Update fulfillment stages (`PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
   - **Bulk Enquiry Management:** Review school requests and update quotation status.

3. **Concurrency-Safe Stock Reservation & Inventory Rules:**
   - Server-side stock validation; frontend prices and quantities are never trusted.
   - Row-level pessimistic locking (`SELECT ... FOR UPDATE` via `PESSIMISTIC_WRITE`) during checkout to eliminate overselling.
   - **15-Minute Reservation Window:** Stock is reserved upon order placement with an expiration timestamp (`reservation_expires_at`).
   - Scheduled background task automatically releases expired reservations back into available inventory.
   - Permanent stock deduction (`SALE`) occurs exactly once after payment confirmation.

4. **Payment Gateway Integration:**
   - Direct online payment link integration: [`https://razorpay.me/@vijayaruchamy`](https://razorpay.me/@vijayaruchamy).
   - Cashfree Payment Gateway official API (`2023-08-01`) order creation and server-side HMAC-SHA256 webhook signature verification with anti-replay timestamp protection.
   - Never stores card PAN or CVV.

5. **Security & Seed Bootstrap:**
   - Spring Security with stateless JWT authentication and BCrypt password hashing.
   - Initial admin is provisioned automatically from environment variables (`ADMIN_BOOTSTRAP_EMAIL` & `ADMIN_BOOTSTRAP_PASSWORD`) without hardcoded credentials.

---

## 📂 Project Structure

```
beta-school-shoes/
├── backend/                             # Java 21 Spring Boot 3.3 REST API
│   ├── pom.xml
│   ├── Dockerfile
│   ├── src/main/java/com/beta/shoes/
│   │   ├── BetaShoesApplication.java
│   │   ├── config/                      # SecurityConfig, CorsConfig, WebMvcConfig
│   │   ├── controller/                  # ProductController, CartController, OrderController, etc.
│   │   ├── dto/                         # Typed DTOs with Jakarta validation
│   │   ├── entity/                      # User, Role, Product, Inventory, Order, Payment, etc.
│   │   ├── exception/                   # GlobalExceptionHandler, InsufficientStockException, etc.
│   │   ├── repository/                  # JPA Repositories with PESSIMISTIC_WRITE row locks
│   │   ├── security/                    # JwtTokenProvider, JwtAuthenticationFilter, UserDetailsImpl
│   │   └── service/                     # OrderService, ProductService, InventoryService, etc.
│   └── src/main/resources/
│       ├── application.yml              # Database, JWT, Cashfree & Payment settings
│       └── db/migration/                # Flyway migrations (V1 Schema, V2 Roles, V3 Seed Products)
├── frontend/                            # React + Vite + TypeScript storefront & admin UI
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── api/                         # Axios client with JWT interceptor & typed endpoints
│       ├── components/                  # Navbar, Footer, ProductCard, ShoeVector, AdminLayout
│       ├── context/                     # AuthContext, CartContext
│       ├── pages/                       # Home, Catalogue, Detail, Cart, Checkout, Success, etc.
│       ├── pages/admin/                 # Dashboard, ProductManager, Inventory, Orders, Enquiries
│       └── types/                       # TypeScript entity models & response interfaces
├── docker-compose.yml                   # Production-ready PostgreSQL, Backend & Frontend containers
├── .env.example                         # Documented configuration variables
└── README.md
```

---

## 🚀 Quick Start & Deployment Guide

### Option A: Deploying Server & PostgreSQL DB on Railway

1. **Create a Railway Project & Add PostgreSQL:**
   - In your Railway project, click **New** → **Database** → **Add PostgreSQL**.
2. **Deploy the Spring Boot Backend Service:**
   - Click **New** → **GitHub Repo** and select this repository (works both from the repository root `/` via [railway.json](railway.json) or with Root Directory set to `/backend` via [backend/railway.json](backend/railway.json)).
   - Under the backend service **Variables**, link the Railway PostgreSQL database using either:
     - `DATABASE_URL=${{Postgres.DATABASE_URL}}` *(automatically parsed into JDBC format by `RailwayDatabaseEnvironmentPostProcessor`)*, **or**
     - `PGHOST=${{Postgres.PGHOST}}`, `PGPORT=${{Postgres.PGPORT}}`, `PGDATABASE=${{Postgres.PGDATABASE}}`, `PGUSER=${{Postgres.PGUSER}}`, `PGPASSWORD=${{Postgres.PGPASSWORD}}`
   - Set your application environment variables (`JWT_SECRET`, `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, etc.).
   - *(Optional)* Attach a Railway **Volume** mounted at `/app/uploads` so local product image uploads persist across redeployments.
   - Generate a public domain under **Settings** → **Networking** → **Generate Domain**.
3. **Configure Frontend (`VITE_API_BASE_URL`):**
   - Set `VITE_API_BASE_URL=https://<your-railway-backend-domain>.up.railway.app` in your frontend environment variables.

---

### Option B: Running with Docker Compose (Local)

1. Clone or navigate to the repository directory:
   ```bash
   cd C:\Users\VijayPC\.gemini\antigravity\scratch\beta-school-shoes
   ```

2. Copy environment template:
   ```bash
   cp .env.example .env
   ```

3. Start all services (PostgreSQL, Spring Boot Backend, and React Frontend):
   ```bash
   docker compose up --build -d
   ```

4. Access the applications:
   - **Storefront & Admin:** `http://localhost/`
   - **Backend REST API:** `http://localhost:8080/api/`
   - **Health Check:** `http://localhost:8080/actuator/health`

---

### Option B: Running Locally on Bare Metal

#### 1. Database (PostgreSQL)
Ensure PostgreSQL is running and create the database:
```sql
CREATE DATABASE beta_school_shoes;
```

#### 2. Backend (Java 21 + Spring Boot)
```bash
cd backend
mvn clean package -DskipTests
java -jar target/beta-shoes-backend-1.0.0-SNAPSHOT.jar
```
*Note: Flyway will automatically execute migrations `V1`, `V2`, and `V3` on startup.*

#### 3. Frontend (React + Vite + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## 🏫 School Management & Student Orders Module

A dedicated institutional module designed for field reps and admins visiting partner schools to record uniform and footwear requirements directly on behalf of students.

### 1. Key Features
- **Schools Directory & Dashboard:** Create, search, update, and deactivate partner schools.
- **Dynamic Live Category Cards:** Dedicated school dashboard aggregates booked quantities in real time for 7 categories:
  - 👞 **Shoes**
  - 👔 **Shirts**
  - 👖 **Pants**
  - 🩳 **Shorts**
  - 👕 **T-Shirts**
  - 🧦 **Socks**
  - 🎒 **Bags**
  *(Totals are computed dynamically from student order items; never hardcoded).*
- **Student Management & Order Grid:** Searchable student grid with Class and Section filters, expandable nested product grids, and size/quantity breakdown matrix.
- **School-Visit Orders (NO PAYMENT REQUIRED):**
  - Field reps record student requirements during campus visits without requiring payment details, cards, UPI, or Razorpay checkout.
  - Supports rapid consecutive student entry with draft saving and instant confirmation.
- **Configurable Stock Policies:**
  - `BOOKING_ONLY`: Institutional demand tracking without physical warehouse deduction.
  - `RESERVE_STOCK`: Reserves physical warehouse stock using PostgreSQL row locks (`PESSIMISTIC_WRITE`) upon confirmation, with audit tracking in `stock_movements`.
- **Reporting & Exports:**
  - One-click CSV export of complete school orders and student product requirements (`/api/admin/schools/{schoolId}/reports/csv`).
  - Print-friendly layout for distribution sheets and physical sizing records.

### 2. REST Endpoints for School Management
- `GET /api/admin/schools` — List and search schools with pagination
- `POST /api/admin/schools` — Register a new school
- `GET /api/admin/schools/{id}` — Get school details
- `GET /api/admin/schools/{id}/summary` — Dynamic 7-category totals and size matrix
- `GET /api/admin/schools/{id}/reports/csv` — Download school orders CSV
- `GET /api/admin/students/school/{schoolId}` — Search students with class/section filters
- `POST /api/admin/students` — Register a student
- `GET /api/admin/school-orders` — Search and filter visit orders across all schools
- `POST /api/admin/school-orders` — Record school visit order (NO payment required)
- `PATCH /api/admin/school-orders/{id}/status` — Update order status (DRAFT, CONFIRMED, PROCESSING, FULFILLED, CANCELLED)

---

## 🔑 Initial Admin Account & Credentials

Upon initial launch, the system automatically provisions the initial administrator using the environment settings:

- **Email:** `admin@betashoes.example.com` (configurable via `ADMIN_BOOTSTRAP_EMAIL`)
- **Password:** `Admin@Beta2026` (configurable via `ADMIN_BOOTSTRAP_PASSWORD`)

Sign in through the `/login` page to access the **Admin Dashboard** (`/admin`).

---

## 💳 Payment Flow & Gateway Integration

- **Direct Payment Link:** When customers checkout, the system reserves their shoe sizes for 15 minutes and generates an order with a direct payment link to:
  **`https://razorpay.me/@vijayaruchamy`**
- Customers click **"Pay Now via Razorpay"** to pay via UPI (GPay, PhonePe), Cards, or Net Banking.
- **Webhook Verification:** Cashfree webhooks sent to `/api/payments/cashfree/webhook` are cryptographically verified using HMAC-SHA256 signature and timestamp validation before updating orders to `PAID` and permanently finalizing stock.

---

## 🧪 Running Automated Tests

Run backend unit and integration tests (Auth, Cashfree signature verification, and Inventory Concurrency):
```bash
cd backend
mvn test "-Dspring.profiles.active=test"
```

Verify frontend TypeScript compilation:
```bash
cd frontend
npm run build
```
