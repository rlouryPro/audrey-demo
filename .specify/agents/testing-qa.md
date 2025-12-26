# Agent: Testing & QA

## Rôle
Expert tests logiciels et assurance qualité pour applications web.

## Expertise
- Tests unitaires (Jest)
- Tests d'intégration (Supertest)
- Tests end-to-end (Playwright)
- Tests d'accessibilité (axe-core)
- TDD (Test-Driven Development)
- Couverture de code

## Contexte projet
Application ESAT avec :
- Frontend React + TypeScript
- Backend Node.js + Express + Prisma
- PostgreSQL
- WCAG 2.1 AA requis

## Structure des tests

```
project/
├── backend/
│   └── tests/
│       ├── unit/
│       │   ├── services/
│       │   │   ├── auth.service.test.ts
│       │   │   ├── event.service.test.ts
│       │   │   └── skill.service.test.ts
│       │   └── utils/
│       │       ├── jwt.test.ts
│       │       └── avatar.test.ts
│       ├── integration/
│       │   ├── auth.routes.test.ts
│       │   ├── events.routes.test.ts
│       │   └── skills.routes.test.ts
│       └── setup.ts
│
└── frontend/
    └── tests/
        ├── unit/
        │   ├── components/
        │   │   ├── Button.test.tsx
        │   │   ├── Timeline.test.tsx
        │   │   └── SkillCard.test.tsx
        │   └── hooks/
        │       └── useAuth.test.ts
        ├── integration/
        │   └── pages/
        │       ├── TimelinePage.test.tsx
        │       └── SkillsPage.test.tsx
        ├── e2e/
        │   ├── auth.spec.ts
        │   ├── timeline.spec.ts
        │   ├── skills.spec.ts
        │   └── accessibility.spec.ts
        └── setup.ts
```

## Tests Backend

### Configuration Jest
```typescript
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### Setup tests
```typescript
// backend/tests/setup.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Utiliser une BDD de test
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

  // Reset et migrate
  execSync('npx prisma migrate reset --force', {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Nettoyer entre les tests
afterEach(async () => {
  // Supprimer les données de test (ordre important pour FK)
  await prisma.userSkill.deleteMany();
  await prisma.event.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.category.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.user.deleteMany();
});

export { prisma };
```

### Tests unitaires service
```typescript
// backend/tests/unit/services/event.service.test.ts
import { eventService } from '../../../src/services/event.service';
import { prisma } from '../../setup';
import { createTestUser } from '../../helpers';

describe('EventService', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user.id;
  });

  describe('create', () => {
    it('should create an event without photo', async () => {
      const event = await eventService.create(userId, {
        date: new Date('2025-01-15'),
        title: 'Formation cuisine'
      });

      expect(event).toMatchObject({
        userId,
        title: 'Formation cuisine',
        photoUrl: null
      });
      expect(event.id).toBeDefined();
    });

    it('should enforce title max length', async () => {
      await expect(
        eventService.create(userId, {
          date: new Date(),
          title: 'a'.repeat(101)
        })
      ).rejects.toThrow();
    });
  });

  describe('findByUser', () => {
    it('should return events ordered by date desc', async () => {
      await eventService.create(userId, { date: new Date('2025-01-01'), title: 'Event 1' });
      await eventService.create(userId, { date: new Date('2025-06-01'), title: 'Event 2' });
      await eventService.create(userId, { date: new Date('2025-03-01'), title: 'Event 3' });

      const events = await eventService.findByUser(userId);

      expect(events).toHaveLength(3);
      expect(events[0].title).toBe('Event 2'); // Plus récent en premier
      expect(events[2].title).toBe('Event 1');
    });

    it('should not return other user events', async () => {
      const otherUser = await createTestUser({ username: 'other' });
      await eventService.create(otherUser.id, { date: new Date(), title: 'Other event' });

      const events = await eventService.findByUser(userId);

      expect(events).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update event title', async () => {
      const event = await eventService.create(userId, {
        date: new Date(),
        title: 'Original'
      });

      const updated = await eventService.update(event.id, { title: 'Updated' });

      expect(updated.title).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete event', async () => {
      const event = await eventService.create(userId, {
        date: new Date(),
        title: 'To delete'
      });

      await eventService.delete(event.id);

      const found = await eventService.findById(event.id);
      expect(found).toBeNull();
    });
  });
});
```

### Tests unitaires utilitaires
```typescript
// backend/tests/unit/utils/avatar.test.ts
import { calculateAvatarLevel } from '../../../src/utils/avatar';

describe('calculateAvatarLevel', () => {
  it('should return level 1 for 0-2 skills', () => {
    expect(calculateAvatarLevel(0)).toBe(1);
    expect(calculateAvatarLevel(1)).toBe(1);
    expect(calculateAvatarLevel(2)).toBe(1);
  });

  it('should return level 2 for 3-5 skills', () => {
    expect(calculateAvatarLevel(3)).toBe(2);
    expect(calculateAvatarLevel(5)).toBe(2);
  });

  it('should return level 3 for 6-10 skills', () => {
    expect(calculateAvatarLevel(6)).toBe(3);
    expect(calculateAvatarLevel(10)).toBe(3);
  });

  it('should return level 4 for 11-15 skills', () => {
    expect(calculateAvatarLevel(11)).toBe(4);
    expect(calculateAvatarLevel(15)).toBe(4);
  });

  it('should return level 5 for 16+ skills', () => {
    expect(calculateAvatarLevel(16)).toBe(5);
    expect(calculateAvatarLevel(100)).toBe(5);
  });
});
```

### Tests d'intégration API
```typescript
// backend/tests/integration/events.routes.test.ts
import request from 'supertest';
import { app } from '../../src/index';
import { createTestUser, loginUser } from '../helpers';

describe('Events API', () => {
  let authCookie: string;
  let userId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user.id;
    authCookie = await loginUser(user.username, 'password123');
  });

  describe('GET /api/events', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(401);
    });

    it('should return user events', async () => {
      // Create test event
      await request(app)
        .post('/api/events')
        .set('Cookie', authCookie)
        .send({ date: '2025-01-15', title: 'Test event' });

      const res = await request(app)
        .get('/api/events')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Test event');
    });
  });

  describe('POST /api/events', () => {
    it('should create event', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Cookie', authCookie)
        .send({ date: '2025-01-15', title: 'New event' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('New event');
      expect(res.body.id).toBeDefined();
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Cookie', authCookie)
        .send({ date: '2025-01-15' }); // Missing title

      expect(res.status).toBe(400);
    });

    it('should handle photo upload', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Cookie', authCookie)
        .field('date', '2025-01-15')
        .field('title', 'Event with photo')
        .attach('photo', 'tests/fixtures/test-image.jpg');

      expect(res.status).toBe(201);
      expect(res.body.photoUrl).toBeDefined();
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete own event', async () => {
      // Create event
      const createRes = await request(app)
        .post('/api/events')
        .set('Cookie', authCookie)
        .send({ date: '2025-01-15', title: 'To delete' });

      const eventId = createRes.body.id;

      // Delete
      const deleteRes = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Cookie', authCookie);

      expect(deleteRes.status).toBe(204);

      // Verify deleted
      const getRes = await request(app)
        .get('/api/events')
        .set('Cookie', authCookie);

      expect(getRes.body).toHaveLength(0);
    });

    it('should not delete other user event', async () => {
      // Create event as first user
      const createRes = await request(app)
        .post('/api/events')
        .set('Cookie', authCookie)
        .send({ date: '2025-01-15', title: 'Private event' });

      // Login as different user
      const otherUser = await createTestUser({ username: 'other' });
      const otherCookie = await loginUser('other', 'password123');

      // Try to delete
      const deleteRes = await request(app)
        .delete(`/api/events/${createRes.body.id}`)
        .set('Cookie', otherCookie);

      expect(deleteRes.status).toBe(404);
    });
  });
});
```

## Tests Frontend

### Configuration Jest
```typescript
// frontend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70
    }
  }
};
```

### Setup tests
```typescript
// frontend/tests/setup.ts
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});
```

### Tests composants
```typescript
// frontend/tests/unit/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '@/components/common/Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button label="Click" onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button label="Disabled" onClick={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Button label="Accessible" onClick={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('is focusable with keyboard', () => {
    render(<Button label="Focusable" onClick={() => {}} />);
    const button = screen.getByRole('button');

    button.focus();
    expect(button).toHaveFocus();
  });
});
```

### Tests hooks
```typescript
// frontend/tests/unit/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/context/AuthContext';

const wrapper = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  it('starts with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('login sets user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('logout clears user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });
});
```

## Tests E2E (Playwright)

### Configuration
```typescript
// frontend/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Tests E2E
```typescript
// frontend/tests/e2e/timeline.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Timeline', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/timeline');
  });

  test('can view timeline', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ma frise/i })).toBeVisible();
  });

  test('can add event', async ({ page }) => {
    // Click add button
    await page.click('button[aria-label="Ajouter un événement"]');

    // Fill form
    await page.fill('input[name="title"]', 'Mon premier événement');
    await page.fill('input[name="date"]', '2025-01-15');

    // Submit
    await page.click('button[type="submit"]');

    // Verify event appears
    await expect(page.getByText('Mon premier événement')).toBeVisible();
  });

  test('can edit event', async ({ page }) => {
    // Create event first
    await page.click('button[aria-label="Ajouter"]');
    await page.fill('input[name="title"]', 'Event to edit');
    await page.fill('input[name="date"]', '2025-01-15');
    await page.click('button[type="submit"]');

    // Click edit
    await page.click('text=Event to edit');
    await page.click('button[aria-label="Modifier"]');

    // Edit
    await page.fill('input[name="title"]', 'Edited event');
    await page.click('button[type="submit"]');

    // Verify
    await expect(page.getByText('Edited event')).toBeVisible();
  });

  test('can delete event', async ({ page }) => {
    // Create event
    await page.click('button[aria-label="Ajouter"]');
    await page.fill('input[name="title"]', 'Event to delete');
    await page.fill('input[name="date"]', '2025-01-15');
    await page.click('button[type="submit"]');

    // Delete
    await page.click('text=Event to delete');
    await page.click('button[aria-label="Supprimer"]');
    await page.click('button:has-text("Confirmer")');

    // Verify deleted
    await expect(page.getByText('Event to delete')).not.toBeVisible();
  });
});
```

### Tests d'accessibilité E2E
```typescript
// frontend/tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('timeline page is accessible', async ({ page }) => {
    await page.goto('/timeline');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('skills page is accessible', async ({ page }) => {
    await page.goto('/skills');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('can navigate with keyboard only', async ({ page }) => {
    await page.goto('/timeline');

    // Tab through navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('href', '/timeline');

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('href', '/skills');

    // Navigate with Enter
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/skills');
  });

  test('focus is trapped in modal', async ({ page }) => {
    await page.goto('/timeline');

    // Open modal
    await page.click('button[aria-label="Ajouter"]');

    // Tab should cycle within modal
    const firstFocusable = page.locator('input[name="title"]');
    const lastFocusable = page.locator('button[type="submit"]');

    await firstFocusable.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(lastFocusable).toBeFocused();
  });
});
```

## Scripts npm

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:a11y": "jest --testPathPattern=accessibility"
  }
}
```

## Checklist QA
- [ ] Tous les tests passent (unit, integration, e2e)
- [ ] Couverture > 70%
- [ ] Tests d'accessibilité passent (axe)
- [ ] Tests de performance (Lighthouse > 90)
- [ ] Tests sur navigateurs cibles (Chrome, Firefox, Safari)
- [ ] Tests responsive (mobile, tablet, desktop)
- [ ] Tests avec données limites (vide, max chars, etc.)
- [ ] Tests scénarios d'erreur (réseau, 500, etc.)
