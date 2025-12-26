# Research: Navigation Fixe et Contenus Repliables

**Feature**: 002-ui-nav-collapsible
**Date**: 2025-12-25

## 1. Fixed Navigation Implementation

### Decision
Use CSS `position: fixed` with `bottom-0` for the navigation bar, combined with appropriate `padding-bottom` on the main content to prevent overlap.

### Rationale
- CSS position:fixed is the simplest solution with excellent browser support
- Already using TailwindCSS which provides `fixed`, `bottom-0`, `w-full` utilities
- No JavaScript required for the sticky behavior
- Matches mobile app navigation patterns familiar to users

### Alternatives Considered
| Alternative | Rejected Because |
|------------|------------------|
| `position: sticky` | Less intuitive for bottom navigation, requires scroll container setup |
| JavaScript scroll listener | Over-engineering, CSS solution sufficient |
| Separate navigation component | Current MainLayout already has navigation, just needs CSS fix |

### Implementation Notes
- Add `fixed bottom-0 left-0 right-0` to nav element in `MainLayout.tsx:62`
- Add `pb-[72px]` or similar to main content area to account for nav height
- Test on mobile viewport to ensure no overlap with system bars

---

## 2. Collapsible Events Pattern

### Decision
Implement expand/collapse state in `TimelineEvent.tsx` with:
- Default state: collapsed (title + date only)
- Expanded state: full details (title, date, description, photo)
- Toggle button with chevron icon and proper ARIA attributes

### Rationale
- Follows the same pattern already used in `DomainAccordion.tsx`
- Uses existing icon library (lucide-react: ChevronDown, ChevronRight)
- Matches specification requirement FR-005, FR-006, FR-007
- Consistent UX across the application

### Implementation Details
```typescript
// TimelineEvent.tsx - add state
const [isExpanded, setIsExpanded] = useState(false);

// Render collapsed: title + date only
// Render expanded: full content including description and photo
```

### Accessibility Requirements
- Button with `aria-expanded={isExpanded}`
- Button with `aria-controls="event-{event.id}-details"`
- Keyboard accessible (Enter, Space to toggle)
- Screen reader announcement for state change

---

## 3. Skills Accordion Default State

### Decision
Modify `DomainAccordion.tsx` to default to collapsed state (`isOpen = false`) instead of expanded.

### Rationale
- Current default is `const [isOpen, setIsOpen] = useState(true)` (line 21)
- Specification requires "affichage synthétique par défaut" (FR requirement)
- Simple one-line change: `useState(true)` → `useState(false)`
- Also apply to categories: `setExpandedCategories` should start empty

### Implementation
```typescript
// Line 21: Change from
const [isOpen, setIsOpen] = useState(true);
// To
const [isOpen, setIsOpen] = useState(false);

// Line 22-24: Change from
const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
  new Set(domain.categories.map((c) => c.id))
);
// To
const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
```

---

## 4. CV Section Collapsible Pattern

### Decision
Create a reusable `CollapsibleSection` component for CV sections (Experiences, Compétences, Formations) in `DocumentPage.tsx`.

### Rationale
- DocumentPage currently shows all sections expanded
- Need collapsible behavior for FR-012, FR-013
- Reusable component promotes consistency
- Can use existing Radix Accordion or custom implementation

### Component Design
```typescript
interface CollapsibleSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
}
```

### Sections to Create
1. **Ma Frise Chronologique** (events) - icon: Calendar
2. **Mes Compétences Acquises** (skills) - icon: CheckCircle
3. **Formations** (if applicable, future-ready)

---

## 5. Accessibility Best Practices

### Decision
Follow WCAG 2.1 AA guidelines with these specific implementations:

### Key Requirements
| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | All buttons focusable, Enter/Space to activate |
| Focus visible | Already using `focus-visible:ring-*` classes |
| ARIA expanded | `aria-expanded` on all toggle buttons |
| ARIA controls | `aria-controls` pointing to content regions |
| Color contrast | Verify 4.5:1 ratio on all text (existing colors likely compliant) |
| Screen reader | Meaningful labels via `aria-label` or visible text |

### Testing Strategy
- Use `jest-axe` for automated accessibility testing (already in dependencies)
- Manual keyboard navigation testing
- Screen reader testing (NVDA/VoiceOver)

---

## 6. Edge Cases

### Empty States (per specification)
| Scenario | Behavior |
|----------|----------|
| Domain with no skills | Don't display the domain |
| No events in timeline | Show invite message (already implemented) |
| No validated skills for CV | Show message in skills section |

### State Persistence
- **Decision**: Reset to default (collapsed) state on page navigation
- **Rationale**: Matches spec edge case "L'état par défaut (synthétique) est restauré à chaque visite de page"
- **Implementation**: Use local useState without persistence (current pattern)

---

## 7. PDF Export Compatibility

### Decision
Maintain existing PDF export functionality with collapsible sections fully expanded in export.

### Rationale
- Export should include all content regardless of UI state
- Current `documentService.downloadHtml()` already fetches all data
- No changes needed to backend export logic

### Verification
- Test that collapsed sections still export fully
- Ensure export button remains functional after UI changes
