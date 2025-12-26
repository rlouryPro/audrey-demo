# API Contracts: Navigation Fixe et Contenus Repliables

**Feature**: 002-ui-nav-collapsible
**Date**: 2025-12-25

## No New API Endpoints Required

This feature is **purely frontend UI changes**. All required data is already available via existing API endpoints:

### Existing Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/events` | GET | Fetch timeline events |
| `/api/domains` | GET | Fetch skills hierarchy |
| `/api/my-skills` | GET | Fetch user's skill progress |
| `/api/documents/preview` | GET | Fetch CV preview data |
| `/api/documents/export/html` | GET | Download HTML export |

### Why No Changes Needed

1. **Collapsible state is client-side only** - No need to persist expand/collapse state
2. **All data already fetched** - Events, skills, and CV data endpoints return complete data
3. **Export unchanged** - PDF/HTML export already fetches all data server-side

### Backend Unchanged Files

- `backend/src/api/routes/events.routes.ts`
- `backend/src/api/routes/domains.routes.ts`
- `backend/src/api/routes/mySkills.routes.ts`
- `backend/src/api/routes/documents.routes.ts`
- `backend/src/services/document.service.ts`

All implementation work is in `frontend/src/` components.
