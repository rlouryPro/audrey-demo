# Implementation Plan: Navigation Fixe et Contenus Repliables

**Branch**: `002-ui-nav-collapsible` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-ui-nav-collapsible/spec.md`

## Summary

Améliorer l'ergonomie et l'accessibilité de l'interface du livret numérique ESAT via:
1. Une barre de navigation fixe (bottom-nav) toujours visible avec indicateur d'état actif
2. Un système de contenus repliables/dépliables pour la frise chronologique, les compétences et le CV
3. Affichage synthétique par défaut avec détails accessibles à la demande
4. Accessibilité clavier complète et conformité WCAG 2.1 AA

## Technical Context

**Language/Version**: TypeScript 5.6, Node.js 22+
**Primary Dependencies**:
- Frontend: React 18.3, Vite 5.4, TailwindCSS 3.4, Radix UI (accordion, dialog), Lucide React
- Backend: Express 4.21, Prisma 5.22, Zod
**Storage**: PostgreSQL 16 (via Prisma ORM)
**Testing**:
- Frontend: Vitest, Testing Library React, Playwright (e2e), jest-axe (accessibility)
- Backend: Jest, Supertest
**Target Platform**: Web (responsive - desktop, tablet, mobile)
**Project Type**: Web application (frontend + backend)
**Performance Goals**:
- Temps de chargement < 3 secondes (SC-005)
- Export PDF < 5 secondes (SC-008)
**Constraints**:
- Score accessibilité WCAG 2.1 AA minimum 90/100 (SC-006)
- 100% des fonctions clavier-accessibles (SC-007)
- Contraste minimum 4.5:1 (FR-016)
**Scale/Scope**: Application mono-utilisateur, ~3 pages principales avec contenus repliables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution non configurée (fichier template). Aucune contrainte architecturale spécifique à respecter.

**Status**: ✅ PASS - No violations

## Project Structure

### Documentation (this feature)

```text
specs/002-ui-nav-collapsible/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no new API endpoints)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/routes/      # Express routes (documents.routes.ts for CV export)
│   ├── services/        # Business logic (document.service.ts)
│   └── schemas/         # Zod validation schemas
├── prisma/              # Database schema and migrations
└── tests/               # Jest tests

frontend/
├── src/
│   ├── components/
│   │   ├── common/      # MainLayout.tsx (navigation bar)
│   │   ├── timeline/    # TimelineEvent.tsx (collapsible events)
│   │   ├── skills/      # DomainAccordion.tsx (existing collapsible)
│   │   └── cv/          # NEW: CV section components
│   ├── pages/           # TimelinePage, SkillsPage, DocumentPage
│   └── services/        # API service layers
└── tests/               # Vitest + Playwright tests
```

**Structure Decision**: Web application with existing frontend/backend separation.
This feature is UI-focused and requires:
- Modifications to `MainLayout.tsx` for fixed navigation
- Modifications to timeline components for collapsible events
- Verification/adjustment of DomainAccordion for skills
- New/updated components for CV sections in DocumentPage

## Complexity Tracking

> No violations to justify - Constitution not configured.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |

## Implementation Analysis

### Existing Patterns Analysis

1. **Navigation** (`MainLayout.tsx:62-84`):
   - Bottom navigation already exists with 3 sections (Frise, Compétences, Livret)
   - Uses NavLink with `isActive` styling via `cn()` utility
   - Icons + labels already present (FR-003 ✅)
   - Active state styling already implemented (FR-004 ✅)
   - **Gap**: Not position:fixed - scrolls with page content

2. **Collapsible Skills** (`DomainAccordion.tsx`):
   - Already uses expand/collapse pattern with chevron icons
   - `aria-expanded` and `aria-controls` properly implemented
   - Keyboard accessible via button elements
   - **Status**: FR-008, FR-009 largely satisfied by existing code

3. **Timeline Events** (`TimelineEvent.tsx`, `Timeline.tsx`):
   - Currently displays all event details by default
   - **Gap**: Needs collapsible pattern - show title/date only, expand for full details

4. **CV/Document Page** (`DocumentPage.tsx`):
   - Needs analysis - likely needs collapsible sections for Experiences, Competences, Formations

### Key Modifications Required

| Component | Current State | Required Change |
|-----------|---------------|-----------------|
| `MainLayout.tsx` | Bottom nav scrolls | Add `fixed bottom-0` positioning |
| `TimelineEvent.tsx` | Full details shown | Add collapsed/expanded state |
| `DomainAccordion.tsx` | Works correctly | Default to collapsed state |
| `DocumentPage.tsx` | Needs analysis | Add collapsible CV sections |

### Accessibility Audit Checklist

- [ ] Focus visible on all interactive elements (existing: ✅ via `focus-visible:ring-*`)
- [ ] ARIA labels on navigation items (existing: ✅)
- [ ] Screen reader announcements for expand/collapse state
- [ ] Keyboard navigation (Tab, Enter, Space)
- [ ] Color contrast 4.5:1 minimum
- [ ] Skip link to main content (existing: ✅ in App.tsx)
