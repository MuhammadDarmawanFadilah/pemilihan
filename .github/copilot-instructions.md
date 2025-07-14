# Copilot Instructions for Alumni Election System

## Development Guidelines

**Code Implementation Only:**
- ABSOLUTELY NO explanations, descriptions, comments, or documentation text
- ONLY provide raw code implementation without any surrounding text
- NEVER use markdown code blocks unless explicitly requested
- NO introductory text like "Here's the implementation" or "I'll update the file"
- NO explanatory text after code changes
- NO running applications - user handles execution
- NO file backups - edit files directly
- For files >500 lines, split into 2 files maintaining same functionality
- NO hardcoding values - always use configuration files or environment variables
- When creating frontend features, corresponding backend API endpoints must also be implemented
- ONLY respond with "Selesai" when task is completed - nothing else

**🚨 CRITICAL - Windows PowerShell Command Requirements:**
- ALL terminal commands MUST use PowerShell syntax - NEVER bash/Unix commands
- Use semicolon (;) for command separation, NEVER && operator
- File paths MUST use Windows backslash format (c:\path\to\file)
- Use PowerShell-compatible syntax for all operations:
  - File operations: `Get-Content`, `Set-Content`, `Copy-Item`, `Remove-Item`
  - Directory navigation: `cd c:\path`
  - Multiple commands: `command1; command2` not `command1 && command2`
- String handling: Use PowerShell escaping for quotes and special characters
- Environment variables: Use `$env:VARIABLE_NAME` format
- Always test PowerShell compatibility before executing commands
- Create .ps1 scripts for complex multi-line operations
- Use `powershell -ExecutionPolicy Bypass -File "script.ps1"` for script execution

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
