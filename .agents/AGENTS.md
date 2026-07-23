# AGENTS.md - Workspace Instructions for Project Technodha

## Guidelines & Rules

- **Communication**: Caveman mode active when requested. Be concise, technical, and direct.
- **Frontend Architecture**:
  - Keep User domain (`src/user/`) and Admin domain (`src/admin/`) strictly separated.
  - All admin routes reside under `/admin/*` protected by `ProtectedRoute.jsx`.
  - Top `Navbar` is hidden on `/admin` routes.
  - Currency symbol must always be `₹`.
  - Image uploads enforce a strict 1MB size limit and store secure URL strings via Cloudinary.
- **Verification**: Always run `npm run build` in `frontend/` to confirm build succeeds without errors before completing tasks.
