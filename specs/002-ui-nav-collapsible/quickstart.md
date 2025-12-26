# Quickstart: Navigation Fixe et Contenus Repliables

**Feature**: 002-ui-nav-collapsible
**Date**: 2025-12-25

## Prerequisites

- Node.js 22+
- Docker (for PostgreSQL)
- Git

## Setup

### 1. Clone and checkout feature branch

```bash
git checkout 002-ui-nav-collapsible
```

### 2. Start database

```bash
docker compose -f docker/docker-compose.db.yml up -d
```

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Setup database

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 5. Start development servers

```bash
# Terminal 1 - Backend (port 3001)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

### 6. Access the application

- Frontend: http://localhost:5173
- Login: `marie` / `user123` (user) or `admin` / `admin123` (admin)

## Files to Modify

### Navigation (Fixed Bottom Bar)
- `frontend/src/components/common/MainLayout.tsx`

### Timeline Collapsible Events
- `frontend/src/components/timeline/TimelineEvent.tsx`
- `frontend/src/components/timeline/Timeline.tsx`

### Skills Accordion (Default Collapsed)
- `frontend/src/components/skills/DomainAccordion.tsx`

### CV Collapsible Sections
- `frontend/src/pages/DocumentPage.tsx`
- `frontend/src/components/cv/CollapsibleSection.tsx` (new)

## Testing

### Unit Tests
```bash
cd frontend
npm test
```

### E2E Tests
```bash
cd frontend
npm run test:e2e
```

### Accessibility Testing
```bash
# Automated (via jest-axe)
npm test -- --grep "accessibility"

# Manual
# 1. Keyboard navigation (Tab, Enter, Space)
# 2. Screen reader (NVDA/VoiceOver)
# 3. Color contrast checker
```

## Key Implementation Notes

1. **Fixed Navigation**: Add `fixed bottom-0` classes to nav, add padding-bottom to main content
2. **Collapsible Pattern**: Use `useState(false)` for default collapsed, toggle with button
3. **Accessibility**: Always include `aria-expanded`, `aria-controls`, keyboard handlers
4. **Default State**: All sections start collapsed, reset on page navigation

## Verification Checklist

- [ ] Navigation bar stays visible while scrolling
- [ ] Active section is visually highlighted
- [ ] Timeline events collapse by default, expand on click
- [ ] Skills domains collapse by default
- [ ] CV sections collapse by default
- [ ] All interactions work with keyboard (Tab, Enter, Space)
- [ ] Screen reader announces expand/collapse state
- [ ] PDF export still works (includes all content)
