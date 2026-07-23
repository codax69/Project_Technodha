TRD — Product Inventory & Order Management System 

TECHNODHA Assessment 

# **Technical Requirements Document** 

**Product Inventory & Order Management System** 

|**Assessment**|TECHNODHA — Technical Assessment, Task 1|
|---|---|
|**Document Type**|TRD (Technical Requirements Document)|
|**Version**|1.0|
|**Prepared By**|Pritesh | Full-Stack Developer (MERN / Django-DRF)|
|**Date**|23 July 2026|
|**Time-box**|48 hours|
|**Companion Document**|PRD — Product Requirements Document|



Page 1 of 9 



<!-- Start of picture text -->
System Architecture — Product Inventory & Order Management System<br>Client (SPA) Nginx API Server<br>React 18 + TypeScript HTTPS: Reverse proxy PRON VEPASSs (8D Django + DRF<br>Vite build Static file serving SimpleJWT auth<br>Tailwind CSS TLS termination drf-spectacular (Swagger)<br>TanStack Query + Axios gunicorn (WSGI)<br>build & test signed upload URL ORM (psycopg)<br>GitHub Actions Cloudinary PostgreSQL<br>Lint -> Test -> Build Product image Products, Categories<br>Docker image build storage (bonus) Orders, Users<br>ae<br>i!docker-compose.yml 1 !<br>backend + frontend + db services, one-command local & submission deployment |<br>;|<br>! !<br>1<br>{Sis1 nee oop eno nso ee npc eg oe ce en sn um vm cs as nse ep nom nn ops te no vn en!<br><!-- End of picture text -->

TRD — Product Inventory & Order Management System 

TECHNODHA Assessment 

|**Layer**|**Technology**|**Ratonale**|
|---|---|---|
|Styling|Tailwind CSS|Utlity-frst speed; consistent spacing/typography scale<br>without hand-rolled CSS fles.|
|Server state|TanStack Query (or RTK Query)|Caching, retries, and loading/error states for API calls<br>without hand-writen reducers.|
|Forms & validaton|React Hook Form + Zod|Schema-based validaton mirrors DRF serializer rules;<br>minimal re-renders.|
|Routng|React Router v6|Role-based protected routes for Admin vs Customer areas.|
|Backend framework|Django 5 + Django REST<br>Framework|Bateries-included ORM, admin, and serializer validaton;<br>matches the PostgreSQL + Postman/Swagger deliverables in<br>the brief.|
|Auth|djangorestramework-<br>simplejwt|Access + refresh token fow; blacklist on logout.|
|Database|PostgreSQL|Explicit submission requirement; strong transactonal<br>guarantees for stock integrity.|
|API docs|drf-spectacular|Auto-generated OpenAPI schema + Swagger UI, satsfes the<br>Swagger bonus with near-zero hand maintenance.|
|Image storage<br>(bonus)|Cloudinary|Ofoads binary storage from the app server; signed direct<br>upload keeps large fles of the Django process.|
|Containerisaton|Docker + docker-compose|One-command spin-up (db + backend + frontend) for the<br>reviewer.|
|CI|GitHub Actons|Lint → test → build on every push, per the CI template<br>already used on the author's producton project (VegBazar).|
|Testng|pytest-django / DRF<br>APITestCase (backend), Vitest<br>+ React Testng Library<br>(frontend)|Backend tests target business-critcal paths (stock, order<br>totals); frontend tests target protected routes and the order<br>form.|



## **3. Data Model** 

Core entities and relationships. All monetary fields use DECIMAL, never FLOAT, to avoid rounding drift. 

### **3.1 Entity Relationship Summary** 

- User 1—M Order (a customer places many orders; an order belongs to exactly one user). 

- Category 1—M Product (a category groups many products; a product belongs to one category). 

- Order 1—M OrderItem (an order is a snapshot of one or more line items). 

- Product 1—M OrderItem (a product can appear in many order line items across different orders). 

Page 3 of 9 

TRD — Product Inventory & Order Management System 

TECHNODHA Assessment 

### **3.2 Table: User (extends Django's AbstractUser)** 

|**Field**|**Type**|**Constraints**|
|---|---|---|
|id|BigAutoField|PK|
|username / email|CharField / EmailField|unique|
|password|CharField|hashed (PBKDF2, Django default)|
|role|CharField (choices)|"admin" | "customer", default "customer"|
|date_joined|DateTimeField|auto_now_add|



### **3.3 Table: Category** 

|**Field**|**Type**|**Constraints**|
|---|---|---|
|id|BigAutoField|PK|
|name|CharField(100)|unique, not null|
|slug|SlugField|unique, auto-generated from name|



### **3.4 Table: Product** 

|**Field**|**Type**|**Constraints**|
|---|---|---|
|id|BigAutoField|PK|
|name|CharField(200)|not null, indexed for search|
|descripton|TextField|blank allowed|
|price|DecimalField(10,2)|not null, >= 0|
|stock_quantty|PositveIntegerField|not null, default 0, >= 0 (DB check constraint)|
|category|ForeignKey → Category|on_delete=PROTECT|
|image_url|URLField|nullable (Cloudinary secure_url, bonus)|
|is_actve|BooleanField|default True (drives sof-delete)|
|created_at /<br>updated_at|DateTimeField|auto_now_add / auto_now|



### **3.5 Table: Order** 

|**Field**|**Type**|**Constraints**|
|---|---|---|
|id|BigAutoField|PK|
|customer|ForeignKey → User|on_delete=PROTECT|
|status|CharField (choices)|pending | processing | completed | cancelled; default<br>pending|
|total_price|DecimalField(10,2)|server-computed, never client-supplied|



Page 4 of 9 

TRD — Product Inventory & Order Management System 

TECHNODHA Assessment 

|**Field**|**Type**|**Constraints**|
|---|---|---|
|created_at /<br>updated_at|DateTimeField|auto_now_add / auto_now|



### **3.6 Table: OrderItem** 

|**Field**|**Type**|**Constraints**|
|---|---|---|
|id|BigAutoField|PK|
|order|ForeignKey → Order|on_delete=CASCADE|
|product|ForeignKey → Product|on_delete=PROTECT|
|quantty|PositveIntegerField|not null, > 0|
|unit_price_at_purch<br>ase|DecimalField(10,2)|snapshot of Product.price at order tme|
|subtotal|DecimalField(10,2)|= quantty × unit_price_at_purchase, server-computed|



**Why snapshot the price:** unit_price_at_purchase is stored on the line item so that later price changes on Product never rewrite the value of a historical order. 

## **4. API Specification** 

Base path: /api/v1/. All endpoints return JSON; list endpoints are paginated (default page size 20). 

### **4.1 Auth** 

|**Method**|**Endpoint**|**Auth**|**Descripton**|
|---|---|---|---|
|POST|/auth/register/|Public|Create a customer account.|
|POST|/auth/login/|Public|Obtain JWT access + refresh token pair.|
|POST|/auth/refresh/|Refresh token|Exchange a valid refresh token for a new access token.|
|POST|/auth/logout/|Access token|Blacklist the refresh token.|
|GET|/auth/me/|Access token|Return the authentcated user's profle and role.|



### **4.2 Products** 

|**Method**|**Endpoint**|**Auth**|**Descripton**|
|---|---|---|---|
|GET|/products/?search=&category=&page=|Public|List/search/flter/paginate products.|
|GET|/products/{id}/|Public|Retrieve a single product.|
|POST|/products/|Admin|Create a product.|
|PATCH|/products/{id}/|Admin|Update a product (partal).|
|DELETE|/products/{id}/|Admin|Sof-delete (is_actve=False).|



Page 5 of 9 

TRD — Product Inventory & Order Management System 

TECHNODHA Assessment 

|**Method**|**Endpoint**|**Auth**|**Descripton**|
|---|---|---|---|
|GET|/products/export/ (bonus)|Admin|Stream the catalogue as CSV.|
|POST|/products/{id}/image/ (bonus)|Admin|Upload/replace the product image via<br>Cloudinary.|



### **4.3 Categories** 

|**Method**|**Endpoint**|**Auth**|**Descripton**|
|---|---|---|---|
|GET|/categories/|Public|List categories.|
|POST / PATCH /<br>DELETE|/categories/(:id)/|Admin|Manage categories; delete is blocked while<br>products reference the category.|



### **4.4 Orders** 

|**Method**|**Endpoint**|**Auth**|**Descripton**|
|---|---|---|---|
|POST|/orders/|Customer|Place an order; validates and decrements stock<br>atomically.|
|GET|/orders/|Customer /<br>Admin|Customer sees own orders only; admin sees all<br>(flterable by status).|
|GET|/orders/{id}/|Owner / Admin|Retrieve one order with its line items.|
|PATCH|/orders/{id}/status/|Admin|Update order status (pending → processing →<br>completed).|
|POST|/orders/{id}/cancel/|Owner / Admin|Cancel a pending order and restock its items.|



### **4.5 Dashboards** 

|**Method**|**Endpoint**|**Auth**|**Descripton**|
|---|---|---|---|
|GET|/dashboard/admin/|Admin|Total products, low-stock count, total orders,<br>revenue.|
|GET|/dashboard/customer/|Customer|Recent orders, total orders placed by the<br>authentcated user.|



## **5. Authentication & Authorization** 

- Access tokens short-lived (~15 min); refresh tokens longer-lived (~7 days) and rotated + blacklisted on logout. 

- role field on User drives two custom DRF permission classes: IsAdminRole (write access to products/categories/dashboard) and IsOwnerOrAdmin (an order is visible/cancellable by its owner or any admin). 

- Authorization is enforced in DRF permission classes on every view — the frontend hiding a button is a UX nicety, never the security boundary. 

Page 6 of 9 

TRD — Product Inventory & Order Management System 

TECHNODHA Assessment 

- Frontend: an AuthContext holds the decoded token/role; a ProtectedRoute wrapper redirects unauthenticated users and hides admin-only routes from customers; an Axios response interceptor retries once after a silent token refresh on a 401. 

## **6. Business Logic & Data Integrity** 

- Order creation runs inside transaction.atomic(); each Product row involved is locked with select_for_update() before its stock is checked and decremented, preventing two concurrent orders from over-selling the same unit. 

- The order serializer re-validates requested quantity against current stock at write time (not against a stale value read earlier by the client) and rejects the whole order if any single line item fails. 

- total_price and each line item's subtotal are always computed from the server-side Product.price, never accepted from the request body. 

- Cancelling a pending order restocks its line items inside the same atomic block that changes status, so stock and order state can never drift apart. 

- A product with stock_quantity == 0 is returned to the frontend with an is_orderable: false flag so the UI can disable the buy action without a second round-trip. 

## **7. Frontend Architecture** 

### **7.1 Folder Structure** 

Feature-based organisation, mirroring the pattern below (adapted from prior architecture research on this stack): 

_src/ → components/ (atomic: Button, Input, Card, Modal) — features/products, features/orders, features/dashboard (each with its own components, hooks, types) — hooks/ (shared) — context/ (AuthContext) — api/ (Axios instance + TanStack Query hooks per resource) — utils/ — styles/ (Tailwind config, tokens) — App.tsx_ 

### **7.2 Component & State Conventions** 

- Every component's props are a named TypeScript interface (e.g. ProductCardProps); no implicit any. 

- Server state (products, orders, dashboard metrics) lives in TanStack Query caches, keyed by resource + filters — never duplicated into local component state. 

- Client-only UI state (modals open, form drafts) stays in local useState/useReducer; only auth identity is global (Context). 

- Toast notifications (success/error) are triggered from the API layer's error/success handlers, not scattered across components. 

## **8. Validation & Error Handling** 

|**Layer**|**Approach**|
|---|---|
|Backend|DRF serializer feld- and object-level validaton (e.g. stock ≥ requested quantty); consistent<br>error shape { "feld": ["message"] } across all endpoints.|
|Frontend|React Hook Form + Zod schemas mirror backend rules for immediate feedback; server-side|



Page 7 of 9 

TRD — Product Inventory & Order Management System 

TECHNODHA Assessment 

|**Layer**|**Approach**|
|---|---|
||validaton errors are mapped back onto the corresponding form feld, not just shown as a<br>generic toast.|
|Loading & empty<br>states|Skeleton loaders on catalogue/dashboard fetches; explicit empty-state messaging (e.g. "No<br>products match your flters") rather than a blank screen.|



## **9. Non-Functional Requirements — Implementation Notes** 

|**Category**|**Implementaton**|
|---|---|
|Performance|DB indexes on Product.name and Product.category_id; select_related/prefetch_related on<br>order + line-item queries to avoid N+1; default page size 20 on all list endpoints; images served<br>via Cloudinary's CDN, not the Django app.|
|Security|CORS allow-list limited to the deployed frontend origin; all secrets via environment variables<br>(never commited); DRF throtling on /auth/login/ to blunt credental stufng; HTTPS<br>terminated at Nginx.|
|Accessibility &<br>responsiveness|Semantc HTML + ARIA on custom widgets (dropdowns, modals); Tailwind breakpoints mobile-<br>frst; visible focus rings retained (never suppressed with outline: none).|
|Reliability|Every stock/order mutaton is atomic (Secton 6); Postgres UNIQUE/CHECK constraints back up<br>applicaton-level validaton so a bug in a serializer can't silently corrupt data.|



## **10. Testing Strategy** 

Given the 48-hour time-box, test effort is deliberately concentrated on business-critical paths rather than chased toward a blanket coverage number — this trade-off is intentional and stated here rather than left implicit. 

|**Layer**|**Tooling**|**Priority Coverage**|
|---|---|---|
|Backend<br>unit/integraton|pytest-django / DRF<br>APITestCase|Auth fow; product CRUD + permissions; order placement incl.<br>concurrent-order stock race; cancellaton restock.|
|Frontend|Vitest + React Testng<br>Library|ProtectedRoute redirects; order form validaton & submission;<br>product list flter/paginaton.|
|API contract|Postman collecton /<br>Swagger (drf-spectacular)|Manually exercised against every endpoint in Secton 4 before<br>submission.|



## **11. CI/CD & DevOps** 

### **11.1 Docker Compose Services** 

- db — postgres:16, named volume for persistence, healthcheck before backend starts. 

- backend — Django + gunicorn, depends_on db (healthy), loads config from .env. 

- frontend — Vite build served by Nginx (or served by the same Nginx that proxies /api to backend). 

Page 8 of 9 

TRD — Product Inventory & Order Management System 

TECHNODHA Assessment 

### **11.2 GitHub Actions Pipeline** 

- Checkout → setup Node & Python → install dependencies (npm ci / pip install). 

- Lint (ESLint + Ruff/Flake8) → backend tests (pytest) → frontend tests (vitest). 

- Build frontend bundle; build backend/frontend Docker images. 

- Pipeline fails the build on lint errors or any failing test — no green check on a red test suite. 

## **12. Bonus Feature Notes** 

|**Feature**|**Approach**|
|---|---|
|CSV Export|Streamed CSV response from the admin products endpoint using Python's built-in csv<br>module — no need to hold the full fle in memory.|
|Product Image Upload|Cloudinary direct/signed upload; only the returned secure_url is persisted on Product,<br>keeping the Django server stateless for media.|
|Swagger|drf-spectacular auto-generates the OpenAPI schema from existng serializers/views;<br>Swagger UI mounted at /api/docs/ with near-zero extra code.|
|Docker|Mult-stage Dockerfles (backend: build deps → slim runtme; frontend: Vite build →<br>Nginx statc serve) to keep images small.|
|Unit Tests|Prioritsed on stock/order business logic per Secton 10, over exhaustve UI snapshot<br>testng, given the tme-box.|



## **13. Submission Requirements → Technical Artifact Mapping** 

|**Requirement**|**Where it lives**|
|---|---|
|GitHub Repository|Root of the submited repo (mandatory).|
|README.md with setup<br>instructons|/README.md — clone, .env setup, docker-compose up, seed data, default<br>credentals.|
|PostgreSQL database schema|/backend/*/migratons/ (generated) plus an exported schema.sql for quick review.|
|Postman Collecton or Swagger|/docs/postman_collecton.json and live /api/docs/ (Swagger UI).|
|Sample .env.example|/.env.example — SECRET_KEY, DEBUG, DATABASE_URL, JWT lifetmes,<br>CORS_ALLOWED_ORIGINS, CLOUDINARY_* (if image bonus enabled).|
|Screenshots / demo video|/docs/screenshots/ and a short walkthrough clip linked from the README.|



**Scope discipline:** Every implementation choice above is sized for a 48-hour build. Where a "real production" system would go further (read replicas, message queues, multi-region deploys), that direction is noted rather than built, so the time-box is spent on correctness of the core flow first. 

Page 9 of 9 

