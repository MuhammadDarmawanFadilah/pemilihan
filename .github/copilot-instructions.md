# Copilot Instructions for Alumni Election System

## Development Guidelines

**Code Implementation Only:**
- NEVER provide explanations, descriptions, or comments
- ONLY provide direct code implementation
- NO text descriptions before or after code
- NO running applications - user handles execution
- NO file backups - edit files directly
- For files >500 lines, split into 2 files maintaining same functionality
- NO hardcoding values - always use configuration files or environment variables
- When creating frontend features, corresponding backend API endpoints must also be implemented
- ONLY inform when task is completed with simple "Selesai" message

**Configuration Management:**
- Never hardcode URLs, ports, or environment-specific values
- Frontend: Always use environment variables from `.env` files
- Backend: Use `application.properties` for all configuration
- Use `getApiUrl()` helper for API endpoints, never direct URLs
- No hardcoded strings, numbers, or paths in business logic
- All constants must be externalized to configuration files

**File Handling:**
- For corrupted files: delete and recreate instead of attempting repair
- Maintain file functionality when splitting large files

## Architecture Overview

This is a full-stack Indonesian alumni election system with Next.js 15 frontend and Spring Boot 3.2 backend.

**Key Services:**
- Frontend: `http://localhost:3000` (Next.js with App Router)
- Backend: `http://localhost:8080` (Spring Boot with MySQL)

## Core Patterns

**Authentication:**
- Uses custom JWT with localStorage (`auth_token`, `auth_user`)
- Context: `@/contexts/AuthContext` - always check `isAuthenticated` before protected actions
- Protected routes use `<ProtectedRoute requireAuth={true} allowedRoles={["ADMIN", "MODERATOR"]}>`

**API Communication:**
- All API calls use `getApiUrl(endpoint)` helper, never hardcode URLs
- Backend URL construction: `${config.backendUrl}/${cleanEndpoint}`
- Environment config centralized in `@/lib/config.ts`

**Form Patterns:**
- React Hook Form + Zod validation standard
- Multi-step forms use stepper pattern with session storage persistence
- Photo uploads: store filename, construct display URL with `${BACKEND_URL}/api/upload/photos/${filename}`

**Data Flow:**
- Server-side pagination with `ServerPagination` component
- Filter states separated: `appliedFilters` vs `inputFilters` (applied on search button click)
- Table actions: View/Edit/Toggle Status/Delete pattern across all admin pages

**Component Structure:**
- `@/components/ui/` - Base UI components (shadcn/ui)
- `@/components/` - Business components
- Admin pages follow: Header → Filters → Table → Pagination structure

**Indonesian Localization:**
- All user-facing text in Bahasa Indonesia
- Date formatting: `toLocaleDateString('id-ID')`
- Status badges with emoji indicators

**Backend Conventions:**
- DTOs separate from entities (Request/Response DTOs)
- Services handle business logic, controllers are thin
- `@PreAuthorize` for role-based security
- Lombok for boilerplate reduction

## Critical Integration Points

**Photo Upload:**
```typescript
// Store filename only, never full URLs
onChange(result.filename);

// Display with dynamic URL construction
const photoUrl = pegawai.photoUrl?.startsWith('http') 
  ? pegawai.photoUrl 
  : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload/photos/${pegawai.photoUrl}`;
```

**Error Handling:**
- Use `sonner` for toast notifications
- Consistent error patterns: `toast.error(errorMsg)`
- Always handle image load failures with fallback to initials

## Key Files

- `frontend/src/lib/config.ts` - All configuration and URL helpers
- `frontend/src/contexts/AuthContext.tsx` - Authentication state
- `frontend/src/components/ProtectedRoute.tsx` - Route protection
- `backend/src/main/java/com/shadcn/backend/controller/FileUploadController.java` - File handling
