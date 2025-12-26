# Tasks: Navigation Fixe et Contenus Repliables

**Input**: Design documents from `/specs/002-ui-nav-collapsible/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Tests not explicitly requested in specification. Accessibility testing included as part of implementation verification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Designed for parallel agent execution.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`
- **Backend**: `backend/src/` (minimal changes for this UI feature)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify development environment and understand existing code patterns

- [x] T001 Verify Docker PostgreSQL running on port 5433 via `docker compose -f docker/docker-compose.db.yml ps`
- [x] T002 [P] Verify frontend dependencies installed in `frontend/package.json` (React 18, Radix UI, TailwindCSS)
- [x] T003 [P] Review existing collapsible pattern in `frontend/src/components/skills/DomainAccordion.tsx` for reuse

**Checkpoint**: Environment ready, patterns understood

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create reusable component for collapsible sections before user story implementation

**⚠️ CRITICAL**: This component will be used by US2, US3, and US4

- [x] T004 Create CollapsibleSection component in `frontend/src/components/common/CollapsibleSection.tsx` with props: title, icon, children, defaultOpen
- [x] T005 Add keyboard accessibility (Enter, Space) and ARIA attributes to CollapsibleSection component in `frontend/src/components/common/CollapsibleSection.tsx`
- [x] T006 Export CollapsibleSection from `frontend/src/components/common/index.ts` (create if not exists)

**Checkpoint**: Foundation ready - CollapsibleSection component available for all user stories

---

## Phase 3: User Story 1 - Navigation entre sections (Priority: P1) 🎯 MVP

**Goal**: Barre de navigation fixe visible en permanence avec indicateur d'état actif

**Independent Test**: Depuis n'importe quelle page, la navigation reste visible lors du scroll et la section active est clairement identifiée

### Implementation for User Story 1

- [x] T007 [US1] Add `fixed bottom-0 left-0 right-0 z-50` classes to nav element in `frontend/src/components/common/MainLayout.tsx:62`
- [x] T008 [US1] Add `pb-20` padding-bottom to main content wrapper in `frontend/src/components/common/MainLayout.tsx:57`
- [x] T009 [US1] Add `aria-current="page"` attribute to active NavLink in `frontend/src/components/common/MainLayout.tsx:66-76`
- [x] T010 [US1] Verify navigation contrast meets 4.5:1 ratio in existing TailwindCSS config `frontend/tailwind.config.js`

**Checkpoint**: User Story 1 complete - Navigation fixe fonctionnelle et accessible

---

## Phase 4: User Story 2 - Consultation synthétique de la frise (Priority: P2)

**Goal**: Événements de la frise affichés sous forme synthétique par défaut, extensibles au clic

**Independent Test**: Les événements montrent uniquement titre/date au chargement, et peuvent être développés individuellement

### Implementation for User Story 2

- [x] T011 [P] [US2] Add `isExpanded` state with default `false` to `frontend/src/components/timeline/TimelineEvent.tsx`
- [x] T012 [US2] Add expand/collapse toggle button with ChevronDown/ChevronRight icons in `frontend/src/components/timeline/TimelineEvent.tsx`
- [x] T013 [US2] Conditionally render description and photo only when `isExpanded` in `frontend/src/components/timeline/TimelineEvent.tsx`
- [x] T014 [US2] Add `aria-expanded` and `aria-controls` attributes to toggle button in `frontend/src/components/timeline/TimelineEvent.tsx`
- [x] T015 [US2] Handle empty timeline state message in `frontend/src/components/timeline/Timeline.tsx` (verify existing implementation)

**Checkpoint**: User Story 2 complete - Frise chronologique avec événements repliables

---

## Phase 5: User Story 3 - Organisation des compétences par domaine (Priority: P2)

**Goal**: Domaines de compétences repliés par défaut, dépliables individuellement

**Independent Test**: Les domaines sont fermés au chargement, cliquables pour afficher les compétences

### Implementation for User Story 3

- [x] T016 [P] [US3] Change default `isOpen` state from `true` to `false` in `frontend/src/components/skills/DomainAccordion.tsx:21`
- [x] T017 [US3] Change default `expandedCategories` state from all categories to empty Set in `frontend/src/components/skills/DomainAccordion.tsx:22-24`
- [x] T018 [US3] Add filter to hide empty domains in `frontend/src/components/skills/SkillsHierarchy.tsx` (domains with no skills)
- [x] T019 [US3] Verify keyboard accessibility (Tab, Enter, Space) on domain headers in `frontend/src/components/skills/DomainAccordion.tsx`

**Checkpoint**: User Story 3 complete - Compétences organisées par domaines repliables

---

## Phase 6: User Story 4 - CV avec rubriques repliables (Priority: P3)

**Goal**: Sections du CV repliables avec export PDF fonctionnel

**Independent Test**: Les rubriques du CV sont fermées par défaut, l'export PDF inclut tout le contenu

### Implementation for User Story 4

- [x] T020 [P] [US4] Wrap Events section with CollapsibleSection in `frontend/src/pages/DocumentPage.tsx:110-130`
- [x] T021 [P] [US4] Wrap Skills section with CollapsibleSection in `frontend/src/pages/DocumentPage.tsx:132-158`
- [x] T022 [US4] Add empty state message for "no validated skills" in CV skills section in `frontend/src/pages/DocumentPage.tsx`
- [x] T023 [US4] Verify PDF/HTML export still works correctly (backend unchanged) via manual test
- [x] T024 [US4] Add keyboard accessibility test for CollapsibleSection in DocumentPage in `frontend/src/pages/DocumentPage.tsx`

**Checkpoint**: User Story 4 complete - CV avec rubriques repliables et export fonctionnel

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility audit and final verification

- [x] T025 [P] Run accessibility audit with jest-axe in `frontend/src/components/common/CollapsibleSection.test.tsx` (create test file)
- [x] T026 [P] Manual keyboard navigation test across all pages (Tab through entire app)
- [x] T027 Verify color contrast ratio 4.5:1 on all interactive elements using browser DevTools
- [x] T028 Run quickstart.md validation checklist from `specs/002-ui-nav-collapsible/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - creates CollapsibleSection component
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Navigation): No additional dependencies
  - US2 (Timeline): No dependencies on other stories
  - US3 (Skills): No dependencies on other stories
  - US4 (CV): Depends on CollapsibleSection from Phase 2
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - can start after Phase 2
- **User Story 2 (P2)**: Independent - can start after Phase 2
- **User Story 3 (P2)**: Independent - can start after Phase 2
- **User Story 4 (P3)**: Uses CollapsibleSection from Phase 2 - can start after Phase 2

### Parallel Opportunities (Agents)

All user stories can be executed in parallel by different agents once Phase 2 is complete:

```
Phase 2 complete → Launch 4 agents in parallel:
  Agent 1: US1 tasks (T007-T010) - MainLayout.tsx
  Agent 2: US2 tasks (T011-T015) - TimelineEvent.tsx, Timeline.tsx
  Agent 3: US3 tasks (T016-T019) - DomainAccordion.tsx, SkillsPage.tsx
  Agent 4: US4 tasks (T020-T024) - DocumentPage.tsx
```

---

## Parallel Example: All User Stories

```bash
# After Phase 2 (CollapsibleSection created), launch agents in parallel:

# Agent 1 - User Story 1 (Navigation):
Task: "[US1] Add fixed positioning to nav in frontend/src/components/common/MainLayout.tsx"

# Agent 2 - User Story 2 (Timeline):
Task: "[US2] Add collapsible state to TimelineEvent in frontend/src/components/timeline/TimelineEvent.tsx"

# Agent 3 - User Story 3 (Skills):
Task: "[US3] Change default collapsed state in frontend/src/components/skills/DomainAccordion.tsx"

# Agent 4 - User Story 4 (CV):
Task: "[US4] Wrap CV sections with CollapsibleSection in frontend/src/pages/DocumentPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006)
3. Complete Phase 3: User Story 1 (T007-T010)
4. **STOP and VALIDATE**: Test navigation fixe independently
5. Deploy/demo if ready - **Navigation MVP complete**

### Incremental Delivery

1. Setup + Foundational → CollapsibleSection ready
2. Add User Story 1 → Navigation fixe ✓
3. Add User Story 2 → Timeline collapsible ✓
4. Add User Story 3 → Skills collapsible ✓
5. Add User Story 4 → CV collapsible + export ✓
6. Each story adds value without breaking previous stories

### Parallel Agent Strategy (Recommended)

With Claude Code agents:

1. **Single agent**: Complete Setup + Foundational (T001-T006)
2. **4 parallel agents** once Foundational done:
   - Agent A: User Story 1 (MainLayout.tsx)
   - Agent B: User Story 2 (TimelineEvent.tsx)
   - Agent C: User Story 3 (DomainAccordion.tsx)
   - Agent D: User Story 4 (DocumentPage.tsx)
3. **Single agent**: Polish phase (T025-T028)

**Estimated time**: Sequential ~2h, Parallel ~45min

---

## Notes

- [P] tasks = different files, no dependencies - safe for parallel execution
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- This feature is 100% frontend - no backend changes required
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All collapsible components follow the same ARIA pattern from research.md
