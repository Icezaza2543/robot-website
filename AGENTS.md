<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-specific-rules -->
# NU Robot Club Project Rules & Standards

Whenever the USER asks to create or add a **New Feature** or a **New Module**, you MUST automatically implement the following components and follow these standards WITHOUT needing explicit instructions:

## 1. Full CRUD & Admin Control
- **Admin Manageability**: Every new user-facing feature MUST have a corresponding Admin dashboard interface to add, edit, or delete the content. Nothing should be hardcoded.
- Always implement the complete Create, Read, Update, and Delete lifecycle for any new entity.
- Prefer **Soft Deletes** (e.g., setting `status = "inactive"` or `"deleted"`) over hard deletions, unless specifically requested.

## 2. UI / UX Best Practices & Impeccable Design
- **Impeccable Consistency**: Always adhere strictly to the project's premium design system (vibrant orange/white themes, smooth micro-animations, rounded corners, soft shadows). Use the "impeccable" skill standards to review and polish the UI.
- **Mobile-Responsive (Mobile-First)**: Every layout, form, and table MUST be fully usable and beautifully scaled on mobile devices. Use Tailwind's responsive utilities (`sm:`, `md:`, `lg:`) and avoid overflowing tables on small screens (e.g., use `overflow-x-auto` or stack cards on mobile).
- **Loading States**: Always show a loading spinner (e.g., `<Loader2 className="animate-spin" />`) or skeleton screen when fetching data.
- **Empty States**: Always include a visually distinct empty state (e.g., icon with "ไม่มีข้อมูล") when the dataset is empty.
- **Confirmation Modals**: Always require explicit user confirmation before executing destructive actions (e.g., Deletions, Cancellations, Rejections).

## 3. Notifications
- Always use `react-hot-toast` (`toast.success()`, `toast.error()`) for client-side feedback on form submissions and API responses. 

## 4. API Routes & Permissions
- Next.js 15 App Router: Prefer using URL Query Parameters (e.g., `GET /api/module?id=123`) instead of Dynamic Segments (`[id]/route.ts`) for Admin API Routes to avoid `params` promise wrapping issues.
- Admin APIs MUST always check session roles and `hasPermission()` from `@/lib/permissions`.

## 5. Google Sheets Data Layer
- Define all interactions in `src/lib/googleSheets.ts`.
- Calculate row indices carefully (`actualRow = rowIndex + 2`) assuming row 1 is the header.

## 6. Production-Ready & Verification Standard
- **No MVPs or "Hack" Code**: Code must be written at a production level—clean, scalable, and fully error-handled. Do not just write code that "barely runs."
- **Mandatory Verification**: Every time a feature is completed or a bug is fixed, you MUST rigorously test the logic and verify the build (`npm run build`) before concluding the task.
<!-- END:project-specific-rules -->
