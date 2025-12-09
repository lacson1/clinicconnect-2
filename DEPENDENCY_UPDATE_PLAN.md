# Dependency Update Plan

## Security Status
- ✅ Fixed: 9 vulnerabilities (4 low, 3 moderate, 2 high)
- ⚠️ Remaining: 4 vulnerabilities
  - 3 moderate: esbuild (requires Vite 7 upgrade)
  - 1 high: xlsx (no fix available - consider alternative)

## Update Strategy

### Phase 1: Safe Patch/Minor Updates (No Breaking Changes)
These updates are backward compatible and safe to apply immediately:

#### UI Components (Radix UI)
- All @radix-ui packages: Multiple minor updates available
- Impact: Bug fixes, performance improvements
- Risk: Low

#### Type Definitions
- @types/react: 18.3.12 → 18.3.27
- @types/react-dom: 18.3.1 → 18.3.7
- @types/node: 20.16.11 → (keep at 20.x for compatibility)
- @types/jsonwebtoken: 9.0.9 → 9.0.10
- @types/papaparse: 5.3.16 → 5.5.1
- @types/qrcode: 1.5.5 → 1.5.6
- Impact: Better TypeScript support
- Risk: Very Low

#### Core Libraries (Patch/Minor)
- @tanstack/react-query: 5.60.5 → 5.90.12 (minor)
- react-hook-form: 7.55.0 → 7.68.0 (minor)
- react-icons: 5.4.0 → 5.5.0 (minor)
- express-session: 1.18.1 → 1.18.2 (patch)
- jsonwebtoken: 9.0.2 → 9.0.3 (patch)
- dompurify: 3.3.0 → 3.3.1 (patch)
- marked: 17.0.0 → 17.0.1 (patch)
- multer: 2.0.0 → 2.0.2 (patch)
- openai: 6.7.0 → 6.10.0 (minor)
- firebase-admin: 13.4.0 → 13.6.0 (minor)
- wouter: 3.3.5 → 3.8.1 (minor)
- ws: 8.18.0 → 8.18.3 (patch)
- drizzle-orm: 0.39.1 → 0.39.3 (patch)
- drizzle-zod: 0.7.0 → 0.7.1 (patch)
- esbuild: 0.25.0 → 0.25.12 (patch)
- postcss: 8.4.47 → 8.5.6 (minor)
- lucide-react: 0.453.0 → (check latest 0.x)
- Impact: Bug fixes, security patches
- Risk: Low

### Phase 2: Major Version Updates (Requires Testing)

#### React 18 → 19 (Breaking Changes)
- react: 18.3.1 → 19.2.1
- react-dom: 18.3.1 → 19.2.1
- @types/react: 18.3.12 → 19.2.7
- @types/react-dom: 18.3.1 → 19.2.3
- **Breaking Changes:**
  - New JSX transform required
  - Some deprecated APIs removed
  - Ref handling changes
- **Migration Steps:**
  1. Update React and React DOM
  2. Update all @types/react packages
  3. Test all components
  4. Check for deprecated API usage
  5. Update any custom hooks
- **Risk: High** - Requires thorough testing

#### Vite 5 → 7 (Breaking Changes)
- vite: 5.4.14 → 7.2.7
- @vitejs/plugin-react: 4.3.3 → 5.1.2
- **Breaking Changes:**
  - Node.js 18+ required
  - Config format changes
  - Plugin API changes
- **Migration Steps:**
  1. Update Node.js if needed
  2. Update vite.config.ts
  3. Update plugin configurations
  4. Test build process
  5. Check for deprecated options
- **Risk: High** - Build system changes

#### Tailwind CSS 3 → 4 (Breaking Changes)
- tailwindcss: 3.4.17 → 4.1.17
- @tailwindcss/vite: 4.1.3 → (check latest)
- **Breaking Changes:**
  - New configuration format
  - CSS variable changes
  - Plugin system changes
- **Migration Steps:**
  1. Update tailwind.config.ts
  2. Review all custom classes
  3. Test all UI components
  4. Update PostCSS config if needed
- **Risk: High** - UI styling changes

#### Zod 3 → 4 (Breaking Changes)
- zod: 3.25.76 → 4.1.13
- **Breaking Changes:**
  - API changes in validation
  - Error format changes
- **Migration Steps:**
  1. Review all zod schemas
  2. Update validation logic
  3. Test all forms
- **Risk: Medium** - Validation logic changes

#### Express 4 → 5 (Breaking Changes)
- express: 4.21.2 → 5.2.1
- @types/express: 4.17.21 → 5.0.6
- **Breaking Changes:**
  - Middleware API changes
  - Error handling changes
- **Migration Steps:**
  1. Review all middleware
  2. Update route handlers
  3. Test all API endpoints
- **Risk: High** - Backend API changes

#### Other Major Updates
- date-fns: 3.6.0 → 4.1.0 (API changes)
- framer-motion: 11.13.1 → 12.23.25 (API changes)
- Firebase: 11.8.1 → 12.6.0 (API changes)
- drizzle-orm: 0.39.3 → 0.45.0 (API changes)
- recharts: 2.15.3 → 3.5.1 (API changes)
- react-day-picker: 8.10.1 → 9.12.0 (API changes)
- react-pdf: 9.2.1 → 10.2.0 (API changes)
- tailwind-merge: 2.6.0 → 3.4.0 (API changes)

### Phase 3: Security Issues

#### xlsx Package (No Fix Available)
- Current: xlsx@0.18.5
- Issue: Prototype Pollution and ReDoS vulnerabilities
- **Options:**
  1. Replace with `exceljs` (already in dependencies)
  2. Use `xlsx-populate` as alternative
  3. Accept risk if xlsx is only used in safe contexts
- **Recommendation:** Audit xlsx usage and replace if possible

## Execution Order

1. ✅ **Phase 1: Safe Updates** (Apply immediately)
   - All patch/minor updates
   - Type definitions
   - Radix UI components

2. ⚠️ **Phase 2: Major Updates** (Test thoroughly)
   - Start with less critical packages
   - Test each major update separately
   - React 19 last (most impact)

3. 🔒 **Phase 3: Security** (Address xlsx)

## Testing Checklist

After each update phase:
- [ ] Application builds successfully
- [ ] All tests pass
- [ ] UI renders correctly
- [ ] API endpoints work
- [ ] Forms validate properly
- [ ] Authentication works
- [ ] Database operations work
- [ ] File uploads/downloads work
- [ ] No console errors
- [ ] Performance is acceptable

## Rollback Plan

- Keep package-lock.json in version control
- Test in development first
- Create git branch for updates
- Document any breaking changes encountered

