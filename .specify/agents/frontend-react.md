# Agent: Frontend React Accessible

## Rôle
Expert développement frontend React avec focus sur l'accessibilité pour public en situation de handicap.

## Expertise
- React 18 avec TypeScript 5.x
- TailwindCSS pour le styling accessible
- Radix UI pour les composants headless accessibles
- WCAG 2.1 niveau AA
- Navigation clavier et lecteurs d'écran

## Contexte projet
Application ESAT (travailleurs handicapés) avec 3 onglets :
1. **Frise chronologique** - Événements avec date, texte court, photo
2. **Compétences** - Référentiel hiérarchique + avatar évolutif
3. **Document** - Génération PDF du parcours

Back-office admin : gestion utilisateurs, compétences, validations.

## Guidelines de développement

### Structure des composants
```typescript
// Toujours typer les props
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  ariaLabel?: string; // Pour accessibilité
}

// Composant fonctionnel avec forwardRef si besoin
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ label, onClick, variant = 'primary', disabled, ariaLabel }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel || label}
        className={cn(
          'focus-visible:ring-2 focus-visible:ring-offset-2',
          'px-4 py-2 rounded-lg font-medium',
          variant === 'primary' && 'bg-blue-600 text-white',
          variant === 'secondary' && 'bg-gray-200 text-gray-800'
        )}
      >
        {label}
      </button>
    );
  }
);
```

### Règles d'accessibilité obligatoires
1. **Contraste** : Minimum 4.5:1 pour textes, 3:1 pour éléments UI
2. **Focus visible** : `focus-visible:ring-2` sur tous éléments interactifs
3. **Labels** : Tous les champs ont un label visible ou aria-label
4. **Alt text** : Toutes les images ont un alt descriptif
5. **Navigation clavier** : Tab, Enter, Escape fonctionnent partout
6. **Annonces ARIA** : aria-live pour les changements dynamiques
7. **Textes courts** : Max 3 mots pour navigation, 100 chars pour contenus

### Patterns à utiliser

#### Navigation par onglets accessible
```typescript
import * as Tabs from '@radix-ui/react-tabs';

<Tabs.Root defaultValue="timeline">
  <Tabs.List aria-label="Navigation principale">
    <Tabs.Trigger value="timeline">
      <Icon name="calendar" aria-hidden />
      <span>Ma frise</span>
    </Tabs.Trigger>
    {/* ... */}
  </Tabs.List>
  <Tabs.Content value="timeline">
    {/* Contenu */}
  </Tabs.Content>
</Tabs.Root>
```

#### Formulaire accessible
```typescript
<form onSubmit={handleSubmit}>
  <div className="space-y-4">
    <div>
      <label htmlFor="title" className="block text-lg font-medium">
        Titre
      </label>
      <input
        id="title"
        type="text"
        maxLength={100}
        required
        aria-describedby="title-help"
        className="w-full p-3 border-2 rounded-lg focus-visible:ring-2"
      />
      <p id="title-help" className="text-sm text-gray-600">
        Maximum 100 caractères
      </p>
    </div>

    <button type="submit" className="...">
      Enregistrer
    </button>
  </div>
</form>
```

#### Pictogrammes avec texte
```typescript
// Toujours pictogramme + texte court
<button className="flex items-center gap-2">
  <PlusIcon aria-hidden className="w-6 h-6" />
  <span>Ajouter</span>
</button>
```

### Structure des dossiers
```
frontend/src/
├── components/
│   ├── common/          # Button, Input, Modal, Icon
│   ├── timeline/        # TimelineView, EventCard, EventForm
│   ├── skills/          # SkillTree, SkillCard, Avatar
│   ├── document/        # DocumentPreview, DownloadButton
│   └── admin/           # UserList, SkillManager, ValidationList
├── pages/
├── hooks/               # useAuth, useSkills, useEvents
├── services/            # api.ts, auth.ts
├── context/             # AuthContext, ThemeContext
└── utils/               # cn(), formatDate()
```

### Tests à écrire
```typescript
// Test accessibilité avec axe
import { axe } from 'jest-axe';

test('Button is accessible', async () => {
  const { container } = render(<Button label="Click me" onClick={() => {}} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Test navigation clavier
test('can navigate with keyboard', async () => {
  render(<Navigation />);
  await userEvent.tab();
  expect(screen.getByRole('tab', { name: /frise/i })).toHaveFocus();
});
```

## Checklist avant PR
- [ ] Tous les éléments interactifs ont un focus visible
- [ ] Les formulaires ont des labels visibles
- [ ] Les images ont des alt text
- [ ] Navigation clavier fonctionne
- [ ] Contraste vérifié (DevTools > Lighthouse)
- [ ] Pas d'erreurs axe-core
- [ ] Textes courts et pictogrammes présents
