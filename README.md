## Completed Challenges (Candidate Notes)

- **Challenge 1: Task Assignment UI**
  - Implemented `AssigneeSelector` with user search, role display, and avatar initials.
  - Backend `users` endpoint used to populate selector; selected assignees are persisted via `assigneeIds`.
  - Task cards and detail view show owner/assignees with roles and avatars; tasks assigned to the current user are visually highlighted.

- **Challenge 2: Task Filtering, Search & Pagination**
  - Backend task listing supports search, status filters, pagination, and sorting.
  - Frontend `TasksPage` adds search box, multi-status filters, pagination controls, and "My Tasks" toggle.
  - Filter/search state is synchronized with URL query parameters; list header shows total count and page information.

- **Challenge 4: Task Detail View & Comments**
  - Added `/tasks/:id` route with a rich task detail page.
  - Detail view shows full task info, assignees, attachments, timestamps, and a comments section.
  - Comments support create/update/delete, relative timestamps, light markdown, and basic @mention UX.
  - An `ActivityTimeline` component surfaces recent task/comment activity.

- **Challenge 5: Input Validation & Error Handling**
  - **Backend**
    - Introduced DTOs with `class-validator` for auth (`RegisterDto`, `LoginDto`) and tasks (`CreateTaskDto`, `UpdateTaskDto`).
    - Added validation middleware that returns structured errors and user-friendly messages.
    - Centralized error handler for API and file upload errors (size/type) and added basic rate limiting using `express-rate-limit` (bonus).
  - **Frontend**
    - Added inline field validation for login, registration, and task forms with helpful error messages.
    - Improved loading and error states in list/detail/dashboard views and surfaced friendly API errors.
    - Implemented debounced task search input, retry logic for transient API failures, and a small client-side error helper (bonus).

### Additional Setup / Notes

- **Rate limiting**: Enabled by default in the backend via `express-rate-limit` (100 requests/minute window). If this interferes with automated testing, adjust or remove the limiter in `backend/src/app.ts`.
- **Environment variables**:
  - Backend expects `JWT_SECRET` and DB config as described above; validation/error features work with both PostgreSQL and SQLite setups.
  - Frontend reads `VITE_API_URL` (default `http://localhost:4000/api`) and uses it for task detail attachment links and API client.

