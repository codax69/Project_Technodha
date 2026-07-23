PRD — Product Inventory & Order Management System 

TECHNODHA Assessment 

# **Product Requirements Document** 

**Product Inventory & Order Management System** 

|**Assessment**|TECHNODHA — Technical Assessment, Task 1|
|---|---|
|**Document Type**|PRD (Product Requirements Document)|
|**Version**|1.0|
|**Prepared By**|Pritesh | Full-Stack Developer (MERN / Django-DRF)|
|**Date**|23 July 2026|
|**Time-box**|48 hours|
|**Companion Document**|TRD — Technical Requirements Document|



Page 1 of 6 

PRD — Product Inventory & Order Management System 

TECHNODHA Assessment 

## **1. Purpose** 

This PRD translates the TECHNODHA assessment brief into a structured product specification. It exists so the system is built the way a production feature would be — with clear scope, explicit acceptance criteria, and defined non-functional bars — rather than as a loosely-interpreted take-home exercise. The companion Technical Requirements Document (TRD) covers architecture, schema, and implementation decisions; this document covers what the system must do and why. 

## **2. Background & Problem Statement** 

TECHNODHA's brief asks for a Product Inventory & Order Management System within a 48-hour window: an admin who manages a product catalogue and stock, and customers who browse that catalogue and place orders against it. The system must enforce stock integrity in real time (no overselling), expose a documented API (Postman/Swagger), and be submitted as a runnable, reviewable repository — a PostgreSQL schema, a working README, and a sample environment file are explicit deliverables, not afterthoughts. 

## **3. Goals & Objectives** 

- Ship a working full-stack inventory and ordering system inside the 48-hour window without cutting corners on data integrity. 

- Demonstrate the engineering habits of a production codebase: validated inputs, transactional stock updates, role-based access, and tests on the business-critical path. 

- Give the admin real operational visibility (stock, orders, revenue) and give the customer a smooth, selfservice ordering experience. 

- Leave the reviewer with everything needed to run and evaluate the project unattended — repo, README, schema, API docs, .env.example, and a short demo. 

## **4. Scope** 

### **4.1 In Scope** 

- JWT-based authentication with two roles: Admin and Customer. 

- Admin module: product CRUD, category management, stock management. 

- Customer module: browse, search, filter, place orders, view own order history. 

- Business logic: automatic stock decrement, zero-stock ordering block, over-order prevention, servercomputed order totals. 

- Role-aware dashboards (admin: catalogue & revenue metrics; customer: personal order metrics). 

- REST API with CRUD, search, filter and pagination on products; create/update-status/cancel/history on orders. 

- Frontend: protected routes, filters, pagination, responsive layout, form validation, toast feedback. 

- Backend: JWT, DB transactions, model relationships, serializer validation, custom permissions, pagination, filtering. 

Page 2 of 6 

PRD — Product Inventory & Order Management System 

TECHNODHA Assessment 

- Bonus (attempted where time allows): CSV export, product image upload, Swagger docs, Docker, unit tests. 

### **4.2 Out of Scope (this iteration)** 

- Payment gateway integration — orders are recorded, not paid for, in this assessment. 

- Multi-vendor / multi-tenant catalogue ownership. 

- Email/SMS notifications on order status change. 

- Multi-language UI (i18n) and multi-currency pricing. 

- Horizontal scaling infrastructure (load balancers, read replicas) — noted in the TRD as a future direction, not built now. 

## **5. User Personas** 

|**Persona**|**Descripton**|**Primary Needs**|
|---|---|---|
|Admin (Inventory<br>Manager)|Owns the catalogue; keeps stock and pricing<br>accurate; watches order volume and revenue.|Fast product/category edits, low-<br>stock visibility, order oversight.|
|Customer (Buyer)|Browses the storefront and places orders for<br>products currently in stock.|Accurate stock/price info, simple<br>ordering fow, visibility into past<br>orders.|



## **6. Functional Requirements** 

Expressed as user stories with acceptance criteria, grouped by module. "AC" = Acceptance Criteria. 

### **6.1 Authentication** 

|**User Story**|**Acceptance Criteria**|
|---|---|
|As a user, I want to register/log in and receive a<br>JWT so my session is secure and role-aware.|Login issues an access + refresh token pair; invalid credentals<br>return a clear 401; every protected endpoint rejects<br>missing/expired tokens; the token (or the /me endpoint)<br>exposes the user's role.|
|As a user, I want my session to refresh silently so<br>I'm not logged out mid-task.|An expired access token triggers a silent refresh via the refresh<br>token; only a genuinely expired refresh token forces re-login.|



### **6.2 Admin Module** 

|**User Story**|**Acceptance Criteria**|
|---|---|
|As an admin, I want to add a product with name,<br>price, category, stock and image so customers can<br>order it.|Required felds validated server-side; new product appears<br>immediately in the customer catalogue with correct stock.|
|As an admin, I want to edit a product so<br>pricing/stock/details stay accurate.|Partal updates supported (PATCH); changes refect immediately<br>in product listngs and existng order history is not altered<br>retroactvely.|



Page 3 of 6 

PRD — Product Inventory & Order Management System 

TECHNODHA Assessment 

|**User Story**|**Acceptance Criteria**|
|---|---|
|As an admin, I want to delete a product so<br>discontnued items disappear from the storefront.|Sof-delete or guarded hard-delete so historical orders<br>referencing the product remain intact and readable.|
|As an admin, I want to manage categories so<br>products stay organised.|Categories support CRUD; a category cannot be deleted while<br>products stll reference it (or products are reassigned/nulled per<br>a documented rule).|
|As an admin, I want to manage stock levels directly<br>so I can correct counts afer a stock-take.|Stock can be set/adjusted directly, is never negatve, and every<br>mutaton is atomic.|



### **6.3 Customer Module** 

|**User Story**|**Acceptance Criteria**|
|---|---|
|As a customer, I want to view and search products<br>so I can fnd what I need.|Search matches on product name (and optonally descripton);<br>results paginated.|
|As a customer, I want to flter by category so I can<br>narrow the catalogue.|Category flter combines correctly with search and paginaton<br>query params.|
|As a customer, I want to place an order for one or<br>more products so I can buy them.|Order succeeds only if requested quantty ≤ available stock for<br>every line item; total price is computed server-side, never<br>trusted from the client.|
|As a customer, I want to view my order history so I<br>can track what I've bought.|A customer sees only their own orders (not other customers');<br>each order shows items, quanttes, unit price at purchase, and<br>total.|



### **6.4 Business Logic** 

- When an order is placed, stock for every line item decreases automatically and atomically. 

- When a product's stock reaches zero, ordering is disabled for that product until restocked. 

- The system must reject any order attempting to purchase more units than are currently in stock. 

- Order total price is always calculated automatically from server-side unit prices × quantities — never accepted as client input. 

### **6.5 Dashboards** 

|**Role**|**Metrics**|
|---|---|
|Admin|Total products, low-stock products, total orders, revenue.|
|Customer|Recent orders, total orders placed.|



## **7. Non-Functional Requirements** 

These raise the bar from "it works" to "it's production-grade" — informed by standard UX/engineering audit practice (navigation clarity, accessibility, responsiveness, and performance budgets), applied proportionately to a 48-hour build. 

Page 4 of 6 

PRD — Product Inventory & Order Management System 

TECHNODHA Assessment 

|**Category**|**Requirement**|
|---|---|
|Usability|Consistent layout and labelling; clear, human-readable error and validaton messages; the core<br>paths (browse → order → view history) require minimal clicks.|
|Accessibility|Keyboard-navigable forms and menus; visible focus states; alt text on product images;<br>sufcient colour contrast on interactve controls — aligned with WCAG 2.1 AA where feasible<br>in-scope.|
|Responsiveness|Mobile-frst layout using relatve units and breakpoints; catalogue and dashboards remain<br>usable on small screens.|
|Performance|Paginated list endpoints; indexed lookups on search/flter felds; lazy-loaded images; no N+1<br>queries on catalogue or order listng pages.|
|Security|Passwords hashed, never logged; secrets via environment variables only; CORS restricted to<br>known origins; role-based authorizaton enforced server-side, not just hidden in the UI.|
|Reliability|All stock/order mutatons wrapped in database transactons; no operaton can leave stock or<br>totals in an inconsistent state.|



## **8. Assumptions & Constraints** 

- Single admin role — no tiered admin permissions (e.g. "editor" vs "super-admin") unless the brief is extended. 

- Single currency (INR) and no tax/discount engine — price fields are flat unit prices. 

- PostgreSQL is the system of record, per the submission requirement. 

- The 48-hour time-box governs prioritisation: bonus items (CSV export, image upload, Swagger, Docker, unit tests) are attempted only once the core order flow is verified stable. 

- Demo/screenshots are captured against locally seeded data, not a production dataset. 

## **9. Success Metrics / Definition of Done** 

1. Every functional requirement in Section 6 is demonstrable through both the UI and the Postman/Swagger collection. 

2. The core order flow (place order → stock decrements → order appears in history → dashboard metrics update) has zero known critical bugs. 

3. A reviewer can clone the repo, follow the README, and have the system running locally in under ~10 minutes. 

4. Every item in the "Submission Requirements" list from the brief maps to a concrete artifact in the repository. 

## **10. 48-Hour Delivery Plan** 

|**Window**|**Focus**|
|---|---|
|Hours 0–4|Repo scafold, DB schema & migratons, auth (JWT), environment confg.|
|Hours 4–14|Admin module: product/category/stock CRUD + serializer validaton + permissions.|



Page 5 of 6 

PRD — Product Inventory & Order Management System 

TECHNODHA Assessment 

|**Window**|**Focus**|
|---|---|
|Hours 14–24|Customer module: catalogue browse/search/flter, order placement with atomic stock logic.|
|Hours 24–32|Dashboards, order status/cancel/history endpoints, frontend polish (protected routes,<br>toasts, paginaton).|
|Hours 32–40|Testng (business-critcal paths), Swagger/Postman docs, Dockerisaton.|
|Hours 40–48|Bonus items as tme allows (CSV export, image upload), README, screenshots/demo, fnal<br>QA pass.|



## **11. Submission Deliverables Checklist** 

- GitHub repository (mandatory) 

- README.md with setup instructions 

- PostgreSQL database schema 

- Postman Collection or Swagger documentation 

- Sample .env.example 

- Screenshots or a short demo video 

**Note:** Full technical detail — architecture, schema, API contracts, and implementation decisions — lives in the companion TRD. This PRD is the source of truth for scope and acceptance criteria. 

Page 6 of 6 

