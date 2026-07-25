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
