# AGENTS.md - Project Technodha Guidelines

This document outlines the architecture, coding guidelines, and rules for AI assistants working on **Project Technodha** (Inventory & Order Management System).

---

## 1. Project Overview

Project Technodha is a full-stack inventory, order processing, and customer storefront application built with Django REST Framework (Backend) and React + Vite + TailwindCSS v4 + Shadcn UI (Frontend).

### Tech Stack
- **Backend**: Python 3.14, Django 5.x, Django REST Framework, PostgreSQL, SimpleJWT Auth.
- **Frontend**: React 18, Vite 8, React Router v6, TanStack Query v5, TailwindCSS v4, Shadcn UI (`base-ui`), Cloudinary for image storage.
- **Database**: PostgreSQL (`technodha_db` on port 5433).

---

## 2. Directory & Domain Separation

### Frontend Domain Structure (`frontend/src/`)
- `src/user/`: User-facing components & routes.
  - `ProductCatalogue.jsx`: Interactive product catalogue with category filter chips, search/sort, Quick View modal, and ₹ currency display.
  - `CartPage.jsx`: Shopping cart & total calculation.
  - `OrderHistory.jsx`: Customer order history & cancellation.
  - `Dashboard.jsx`: Customer overview metrics.
  - `userRoutes.jsx`: Public & customer protected routes (`/products`, `/orders`, `/cart`, `/dashboard`).
- `src/admin/`: Admin domain components & routes.
  - `AdminPanel.jsx`: Main Admin Operations Panel.
  - `AdminLogin.jsx`: Admin sign-in screen.
  - `adminRoutes.jsx`: Admin protected routes (`/admin`, `/admin/products`, `/admin/categories`, `/admin/orders`).
  - `components/AppSidebar.jsx`: Dedicated Admin Sidebar with links to `ProductManagement`, `CategoryManagement`, and `ManageOrders`.
  - `components/ProductManagement.jsx`: Full Product CRUD, search/filter, direct stock update, and Cloudinary image upload (strict 1MB limit).
  - `components/CategoryManagement.jsx`: Full Category CRUD (add, edit, delete with protected reference checks).
  - `components/ManageOrders.jsx`: Order status fulfillment (`pending`, `processing`, `completed`, `cancelled`) & line item details modal.

---

## 3. Strict Rules & Conventions

### Access Control
- Non-admin users are strictly blocked from `/admin/*` routes via `ProtectedRoute.jsx` and redirected to `/products`.
- Top `Navbar.jsx` is hidden on all `/admin` routes for a dedicated full-height dashboard layout.

### Currency Format
- Always display currency in Indian Rupees (`₹`) across all frontend user & admin components.

### Cloudinary Image Upload (server-side, signed)
- The frontend has **zero Cloudinary references** (no SDK, no env vars, no naming) — it only knows about our own backend API. The Django backend performs a signed upload using the `cloudinary` Python SDK and returns the resulting `secure_url`.
  - Frontend: `frontend/src/utils/imageUpload.js` (`uploadProductImage`) → `POST /api/products/upload-image/` (admin-only, multipart, field name `image`).
  - Backend: `backend/apps/products/services.py` (`ProductImageService.upload`) called from `backend/apps/products/views.py` (`ProductViewSet.upload_image`).
- Backend environment variables (server-only, **never** prefix these with `VITE_`):
  ```env
  CLOUDINARY_CLOUD_NAME=dltmiswel
  CLOUDINARY_API_KEY=<your Cloudinary API key>
  CLOUDINARY_API_SECRET=<your Cloudinary API secret>
  ```
- Uploads enforce a **strict 1MB file size limit** both client-side and server-side, plus a content-type allow-list (JPEG/PNG/WEBP/GIF).
- Only the returned `secure_url` string is saved into the database product model (via the `image_url` field), never the raw file.
- No `upload_preset`/unsigned upload is used anymore — this avoids the "Upload preset must be specified when using unsigned upload" Cloudinary error entirely, since signed uploads authenticate via API key/secret instead of a preset.

### Codebase Integrity
- Never change or break existing API signatures without updating invocation sites.
- Always run `npm run build` after editing frontend files to verify zero compilation or ref errors.

---

## 4. Useful Commands

### Backend (Django)
```bash
cd backend
./venv/bin/python manage.py runserver
./venv/bin/python manage.py migrate
./venv/bin/python seed_data.py
```

### Frontend (React + Vite)
```bash
cd frontend
npm run dev
npm run build
```
