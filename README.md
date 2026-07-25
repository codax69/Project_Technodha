# TECHNODHA — Product Inventory & Order Management System (Task 1)

A production-grade, full-stack Product Inventory and Order Management System built as part of the TECHNODHA 48-hour take-home assessment.

---

## 🌟 Key System Architecture & Features

### 1. Backend (Django 5 + DRF + PostgreSQL)
- **Role-Based Authentication**: JWT Auth with `djangorestframework-simplejwt`. Supports `admin` and `customer` roles enforced strictly on server side.
- **Atomic Stock Management & Concurrency Safety**: Order placement executes inside a database transaction (`transaction.atomic()`). Products are locked using `select_for_update()` sorted by Primary Key to eliminate deadlocks and prevent race conditions / overselling.
- **Server-Side Price Calculation**: `total_price` and line item `subtotal` are strictly calculated from the database product prices at write time — client-supplied totals are rejected/ignored.
- **Atomic Order Cancellation & Restocking**: Cancelling a pending order restocks item quantities back into the product inventory inside the same transaction block.
- **Customer Isolation**: Customers can strictly view and manage only their own order history.
- **OpenAPI & Swagger Documentation**: Auto-generated Swagger UI served via `drf-spectacular`.

### 2. Frontend (React 18 + TypeScript + Vite + Tailwind CSS)
- **Design & Aesthetics**: Dark mode, glassmorphism card panels, smooth glow accents, and responsive layout.
- **Storefront Catalogue**: Search by keywords, category filter pills, stock status badges (*In Stock*, *Low Stock*, *Out of Stock*), and zero-stock ordering block.
- **State Management & Forms**: `TanStack Query (React Query)` for caching/invalidation, `React Hook Form` + `Zod` schema validation.
- **Admin Management Panel**: Real-time CRUD for Products & Categories, direct stock updates, and order status transitions.
- **Role Dashboards**: Admin metrics (products count, low-stock count, total revenue, status breakdown) and Customer metrics (total spent, recent orders).

---

## 🗄️ Database Model Schema

The system uses a PostgreSQL relational database managed by Django ORM, enforcing strict Foreign Keys, database check constraints, and index optimizations.

```
                      +-------------------+
                      |      Category     |
                      +-------------------+
                      | id (PK)           |
                      | name (Unique)     |
                      | slug (Unique)     |
                      +---------+---------+
                                | 1
                                |
                                | N
                      +---------v---------+
                      |      Product      |
                      +-------------------+
                      | id (PK)           |
                      | category_id (FK)  |
                      | name (Indexed)    |
                      | price             |
                      | stock_quantity    |
                      | image_url         |
                      | is_active         |
                      +---------+---------+
                                | 1
                                |
                                | N
+-------------------+ +---------v---------+
|        User       | |     OrderItem     |
+-------------------+ +-------------------+
| id (PK)           | | id (PK)           |
| username (Unique) | | order_id (FK)     |
| email (Unique)    | | product_id (FK)   |
| role              | | quantity          |
+---------+---------+ | unit_price        |
          | 1         | subtotal          |
          |           +---------^---------+
          | N                   | N
+---------v---------+           |
|       Order       |           | 1
+-------------------+           |
| id (PK)           |           |
| order_number (UQ) |-----------+
| customer_id (FK)  |
| status            |
| total_price       |
+-------------------+
```

### Model Specifications

#### 1. User (`apps.authentication.User`)
Custom user model extending `AbstractUser` with role-based permissions.
- `id` (BigAutoField, Primary Key)
- `username` (CharField, Unique)
- `email` (EmailField, Unique)
- `role` (CharField, Choices: `admin`, `customer`, Default: `customer`)
- Standard Django fields (`password`, `first_name`, `last_name`, `is_staff`, `is_superuser`, `is_active`, `date_joined`)

#### 2. Category (`apps.products.Category`)
Organizes products into logical categories.
- `id` (BigAutoField, Primary Key)
- `name` (CharField, max_length=100, Unique)
- `slug` (SlugField, max_length=120, Unique, Auto-slugified)

#### 3. Product (`apps.products.Product`)
Inventory hardware items with real-time stock tracking and constraints.
- `id` (BigAutoField, Primary Key)
- `category` (ForeignKey → `Category`, `on_delete=PROTECT`, `related_name='products'`)
- `name` (CharField, max_length=200, db_index=True)
- `description` (TextField, blank=True)
- `price` (DecimalField, max_digits=10, decimal_places=2)
- `stock_quantity` (PositiveIntegerField, default=0)
- `image_url` (URLField, max_length=500, null=True, blank=True)
- `is_active` (BooleanField, default=True, db_index=True)
- `low_stock_threshold` (PositiveIntegerField, default=5)
- `created_at` (DateTimeField, auto_now_add=True)
- `updated_at` (DateTimeField, auto_now=True)
- **Constraints**: `CheckConstraint(price >= 0)`, `CheckConstraint(stock_quantity >= 0)`

#### 4. Order (`apps.orders.Order`)
Customer order header with atomic status management.
- `id` (BigAutoField, Primary Key)
- `order_number` (CharField, max_length=32, Unique, db_index=True, Auto-generated code e.g. `TH-ORD-20260725-A8F2`)
- `customer` (ForeignKey → `User`, `on_delete=PROTECT`, `related_name='orders'`)
- `status` (CharField, Choices: `pending`, `processing`, `completed`, `cancelled`, Default: `pending`, db_index=True)
- `total_price` (DecimalField, max_digits=10, decimal_places=2, default=0.00)
- `created_at` (DateTimeField, auto_now_add=True)
- `updated_at` (DateTimeField, auto_now=True)

#### 5. OrderItem (`apps.orders.OrderItem`)
Individual line items attached to an order.
- `id` (BigAutoField, Primary Key)
- `order` (ForeignKey → `Order`, `on_delete=CASCADE`, `related_name='items'`)
- `product` (ForeignKey → `Product`, `on_delete=PROTECT`, `related_name='order_items'`)
- `quantity` (PositiveIntegerField)
- `unit_price_at_purchase` (DecimalField, max_digits=10, decimal_places=2)
- `subtotal` (DecimalField, max_digits=10, decimal_places=2)
- **Constraints**: `CheckConstraint(quantity > 0)`

## 🔑 Default Test Credentials

The database is pre-seeded (`python seed_data.py`) with default login credentials:

| Role | Username | Password | Email | Access / Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | `admin@technodha.com` | Full Admin Operations Panel (`/admin`), Product & Category CRUD, Order Status |
| **Customer** | `customer1` | `customer123` | `customer1@example.com` | Customer Storefront (`/`), Cart (`/cart`), Checkout & Order History (`/orders`) |

---

## 🌐 Live Production Links

- **Storefront Web App**: [https://techstore.pritesh.site](https://techstore.pritesh.site)
- **Backend REST API**: [https://api.techstore.pritesh.site/api/v1/](https://api.techstore.pritesh.site/api/v1/)
- **Swagger Interactive API Docs**: [https://api.techstore.pritesh.site/api/docs/](https://api.techstore.pritesh.site/api/docs/)
- **Health Check Probe**: [https://api.techstore.pritesh.site/api/v1/health/](https://api.techstore.pritesh.site/api/v1/health/)

---

## 📸 Application Screenshots

### 🛒 Storefront & Product Catalogue
![Storefront Catalogue](frontend/public/Project_screenshort/Screenshot%20From%202026-07-25%2017-47-19.png)

### 🛍️ Customer Shopping Cart & Atomic Checkout
![Shopping Cart](frontend/public/Project_screenshort/Screenshot%20From%202026-07-25%2017-47-24.png)

### 📦 Customer Order History & Restocking
![Order History](frontend/public/Project_screenshort/Screenshot%20From%202026-07-25%2017-47-58.png)

### ⚡ Admin Operations Panel & Product CRUD
![Admin Operations Panel](frontend/public/Project_screenshort/Screenshot%20From%202026-07-25%2017-48-24.png)

### 📊 Admin Order Fulfillment & Status Management
![Admin Order Fulfillment](frontend/public/Project_screenshort/Screenshot%20From%202026-07-25%2017-48-30.png)

---

## 🚀 Quick Start with Docker (Recommended)

Run the entire system (Postgres DB, Django Backend, React Frontend) in **one command**:

```bash
docker-compose up --build
```

- **Frontend Application**: `http://localhost:80` (or `http://localhost:3000` in dev mode)
- **Backend REST API**: `http://localhost:8000/api/`
- **Swagger Interactive API Docs**: `http://localhost:8000/api/docs/`
- **ReDoc Documentation**: `http://localhost:8000/api/redoc/`

---

## 🛠️ Local Development Setup (Manual)

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run migrations & start server
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing Suite

### Backend Pytest Tests (Business Logic & Transactions)

```bash
cd backend
pytest
```
*Executes tests for concurrent stock locking, over-order rejection, server price computation, atomic restocking on order cancel, and customer permission isolation.*

### Frontend Vitest Tests

```bash
cd frontend
npm test
```

---

## 📄 Deliverables & References

- **PostgreSQL Schema Dump**: [docs/schema.sql](file:///home/pritesh/Development/Project_Technodha/docs/schema.sql)
- **Postman API Collection**: [docs/postman_collection.json](file:///home/pritesh/Development/Project_Technodha/docs/postman_collection.json)
- **Environment Template**: [.env.example](file:////home/pritesh/Development/Project_Technodha/.env.example)
- **CI Pipeline**: [.github/workflows/ci.yml](file:///home/pritesh/Development/Project_Technodha/.github/workflows/ci.yml)
