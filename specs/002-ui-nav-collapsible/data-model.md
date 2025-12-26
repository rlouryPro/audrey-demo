# Data Model: Navigation Fixe et Contenus Repliables

**Feature**: 002-ui-nav-collapsible
**Date**: 2025-12-25

## Overview

This feature is primarily UI-focused and does **not require database schema changes**. The collapsible state is managed client-side via React component state. Existing entities remain unchanged.

## Existing Entities (No Changes)

### Event
Already defined in Prisma schema. Used for timeline display.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| userId | String | Owner reference |
| date | DateTime | Event date |
| title | String | Event title (max 200 chars) |
| description | String? | Optional details (max 1000 chars) |
| photoUrl | String? | Full-size photo URL |
| thumbnailUrl | String? | Thumbnail URL |

**Display States** (UI only, not persisted):
- **Collapsed**: Shows `title` and `date` only
- **Expanded**: Shows all fields including `description` and `photoUrl`

---

### Domain
Skills grouping container.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String | Domain name (unique) |
| description | String? | Optional description |
| displayOrder | Int | Sort order |

**Display States** (UI only):
- **Collapsed**: Shows domain header with skill count
- **Expanded**: Shows categories and skills

---

### Category
Sub-grouping within domains.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| domainId | String | Parent domain |
| name | String | Category name |
| displayOrder | Int | Sort order |

---

### Skill
Individual competency.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| categoryId | String | Parent category |
| name | String | Skill name |
| description | String | Skill description |
| iconName | String | Emoji/icon identifier |

---

### UserSkill
User's relationship with a skill.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| userId | String | User reference |
| skillId | String | Skill reference |
| status | SkillStatus | IN_PROGRESS, PENDING_VALIDATION, ACQUIRED, REJECTED |
| validatedAt | DateTime? | Validation timestamp |
| validatedById | String? | Admin who validated |

---

## UI State Models (Component-Level)

These are TypeScript interfaces for component state, not database entities.

### CollapsibleState
```typescript
interface CollapsibleState {
  isExpanded: boolean;
}
```

### TimelineEventState
```typescript
interface TimelineEventUIState {
  expandedEventIds: Set<string>;  // Track which events are expanded
}
```

### SkillsHierarchyState
```typescript
interface SkillsHierarchyUIState {
  expandedDomainIds: Set<string>;     // Track expanded domains
  expandedCategoryIds: Set<string>;   // Track expanded categories
}
```

### CVSectionState
```typescript
interface CVSectionUIState {
  expandedSections: Set<'events' | 'skills' | 'formations'>;
}
```

---

## Display Rules

### Default States (per spec edge case)
| Component | Default State | Reset on Navigation |
|-----------|---------------|---------------------|
| Timeline Events | All collapsed | Yes |
| Skill Domains | All collapsed | Yes |
| Skill Categories | All collapsed | Yes |
| CV Sections | All collapsed | Yes |

### Empty State Handling
| Entity | Condition | Display Rule |
|--------|-----------|--------------|
| Domain | No skills in any category | Don't render domain |
| Timeline | No events | Show "Add first event" message |
| CV Skills | No ACQUIRED skills | Show "No validated skills" message |

---

## Validation Rules (Existing)

No new validation rules needed. Existing Zod schemas remain unchanged:
- `event.schema.ts` - Event creation/update validation
- `auth.schema.ts` - Authentication validation
