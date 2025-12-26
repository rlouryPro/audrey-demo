# Feature Specification: Navigation Fixe et Contenus Repliables

**Feature Branch**: `002-ui-nav-collapsible`
**Created**: 2025-12-25
**Status**: Draft
**Input**: Amélioration de l'ergonomie, l'accessibilité et la lisibilité de l'interface du livret numérique ESAT via une barre de navigation fixe et un système de réduction/dépliage des contenus.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigation entre sections (Priority: P1)

En tant que travailleur ESAT, je souhaite accéder rapidement à n'importe quelle section de l'application (frise chronologique, compétences, CV) depuis n'importe quelle page, afin de ne jamais me sentir perdu dans l'application.

**Why this priority**: La navigation est le fondement de l'expérience utilisateur. Sans navigation claire et accessible, les utilisateurs ne peuvent pas utiliser efficacement les autres fonctionnalités.

**Independent Test**: Peut être testé en vérifiant que depuis n'importe quelle page, l'utilisateur peut accéder aux 3 sections principales en un seul clic, avec un retour visuel clair sur la section active.

**Acceptance Scenarios**:

1. **Given** l'utilisateur est sur la page de la frise chronologique, **When** il clique sur l'icône "Compétences" dans la barre de navigation, **Then** il est redirigé vers la page des compétences et l'icône "Compétences" est visuellement mise en évidence comme section active.

2. **Given** l'utilisateur est sur n'importe quelle page de l'application, **When** il regarde l'écran, **Then** la barre de navigation est toujours visible (position fixe) sans besoin de faire défiler.

3. **Given** l'utilisateur utilise un lecteur d'écran, **When** il parcourt la barre de navigation, **Then** chaque élément de navigation est annoncé avec son libellé et son état (actif ou non).

---

### User Story 2 - Consultation synthétique de la frise chronologique (Priority: P2)

En tant que travailleur ESAT, je souhaite voir ma frise chronologique sous forme résumée par défaut et pouvoir développer chaque événement pour voir les détails, afin de ne pas être submergé par trop d'informations à la fois.

**Why this priority**: La frise chronologique est l'élément central du parcours. L'affichage synthétique permet de garder une vue d'ensemble tout en accédant aux détails au besoin.

**Independent Test**: Peut être testé en vérifiant que les événements s'affichent de manière compacte par défaut et que chaque événement peut être développé/réduit individuellement.

**Acceptance Scenarios**:

1. **Given** l'utilisateur accède à la frise chronologique, **When** la page se charge, **Then** tous les événements sont affichés sous forme synthétique (titre et date uniquement visibles).

2. **Given** un événement est affiché sous forme réduite, **When** l'utilisateur clique sur le bouton "Développer" de cet événement, **Then** les détails complets apparaissent (date, texte descriptif, photo si présente).

3. **Given** un événement est affiché sous forme développée, **When** l'utilisateur clique sur le bouton "Réduire", **Then** l'événement revient à sa forme synthétique.

---

### User Story 3 - Organisation des compétences par domaine (Priority: P2)

En tant que travailleur ESAT, je souhaite voir mes compétences organisées par domaines que je peux ouvrir ou fermer, afin de me concentrer sur un domaine à la fois sans être distrait par les autres.

**Why this priority**: Le regroupement par domaines améliore la lisibilité et réduit la charge cognitive, essentiel pour le public cible.

**Independent Test**: Peut être testé en vérifiant que les compétences sont regroupées par domaines et que chaque domaine peut être replié/déplié indépendamment.

**Acceptance Scenarios**:

1. **Given** l'utilisateur accède à l'espace compétences, **When** la page se charge, **Then** les compétences sont regroupées par domaines avec un en-tête visible pour chaque domaine.

2. **Given** un domaine de compétences est affiché, **When** l'utilisateur clique sur l'en-tête du domaine, **Then** le domaine se replie (les compétences sont masquées) ou se déplie (les compétences sont visibles) selon son état actuel.

3. **Given** l'utilisateur a indiqué qu'une compétence est acquise, **When** il consulte cette compétence, **Then** elle reste visible avec un indicateur "en attente de validation" jusqu'à validation par un administrateur.

---

### User Story 4 - Consultation du CV avec rubriques repliables (Priority: P3)

En tant que travailleur ESAT, je souhaite voir mon CV/profil professionnel avec des rubriques que je peux ouvrir ou fermer, et pouvoir l'exporter en PDF, afin d'avoir un document professionnel adapté à mes besoins.

**Why this priority**: Le CV est un livrable important mais dépend des données de la frise et des compétences validées. L'export PDF est une fonctionnalité existante à maintenir.

**Independent Test**: Peut être testé en vérifiant que les rubriques du CV sont repliables et que l'export PDF fonctionne correctement.

**Acceptance Scenarios**:

1. **Given** l'utilisateur accède à son CV/profil professionnel, **When** la page se charge, **Then** le CV s'affiche sous forme synthétique avec les rubriques principales visibles (Expériences, Compétences validées, Formations).

2. **Given** une rubrique du CV est affichée, **When** l'utilisateur clique sur l'en-tête de la rubrique, **Then** la rubrique se replie ou se déplie selon son état actuel.

3. **Given** l'utilisateur consulte son CV, **When** il clique sur le bouton "Exporter en PDF", **Then** un fichier PDF professionnel est téléchargé contenant l'ensemble des informations du CV.

---

### Edge Cases

- Que se passe-t-il si un domaine de compétences ne contient aucune compétence ? → Le domaine n'est pas affiché.
- Que se passe-t-il si l'utilisateur n'a aucun événement dans sa frise ? → Un message explicatif s'affiche invitant l'utilisateur à ajouter son premier événement.
- Que se passe-t-il si l'utilisateur n'a aucune compétence validée pour le CV ? → La rubrique "Compétences validées" affiche un message indiquant qu'aucune compétence n'est encore validée.
- Comment l'état replié/déplié est-il géré lors du changement de page ? → L'état par défaut (synthétique) est restauré à chaque visite de page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT afficher une barre de navigation fixe visible sur toutes les pages de l'application.
- **FR-002**: La barre de navigation DOIT contenir des liens vers les sections : Frise chronologique, Compétences, CV/Profil professionnel.
- **FR-003**: Chaque élément de navigation DOIT afficher une icône explicite ET un libellé textuel simple.
- **FR-004**: La section actuellement active DOIT être visuellement distinguée dans la barre de navigation (couleur, style différent).
- **FR-005**: Les événements de la frise chronologique DOIVENT s'afficher sous forme synthétique par défaut (titre et date).
- **FR-006**: Chaque événement de la frise DOIT pouvoir être développé pour afficher les détails complets (date, texte, photo).
- **FR-007**: Chaque événement développé DOIT pouvoir être réduit à sa forme synthétique.
- **FR-008**: Les compétences DOIVENT être regroupées par domaines/familles avec un en-tête de domaine cliquable.
- **FR-009**: Chaque domaine de compétences DOIT pouvoir être replié ou déplié par l'utilisateur.
- **FR-010**: L'utilisateur DOIT conserver la possibilité d'indiquer si une compétence est acquise ou non.
- **FR-011**: Les compétences marquées comme acquises DOIVENT rester soumises à validation par un administrateur.
- **FR-012**: Le CV/profil professionnel DOIT afficher les rubriques (Expériences, Compétences validées, Formations) de manière repliable.
- **FR-013**: Le CV DOIT s'afficher sous forme synthétique par défaut.
- **FR-014**: L'export du CV au format PDF DOIT être maintenu et fonctionnel.
- **FR-015**: Toutes les interactions de repliage/dépliage DOIVENT être accessibles au clavier (touches Tab, Entrée, Espace).
- **FR-016**: Les éléments interactifs DOIVENT avoir des contrastes visuels conformes aux normes d'accessibilité (ratio minimum 4.5:1).

### Key Entities

- **Événement de frise**: Représente un moment marquant du parcours. Attributs : date, titre, description, photo optionnelle. État d'affichage : synthétique (réduit) ou détaillé (développé).
- **Domaine de compétences**: Regroupe un ensemble de compétences liées. Attributs : nom, description. État d'affichage : replié ou déplié.
- **Compétence**: Représente une aptitude du référentiel. Attributs : nom, domaine parent, statut (non acquise, acquise en attente de validation, validée).
- **Rubrique CV**: Section du profil professionnel. Types : Expériences, Compétences validées, Formations. État d'affichage : repliée ou dépliée.

### Assumptions

- L'application existante dispose déjà des pages Frise, Compétences et CV/Profil fonctionnelles.
- Le système de validation des compétences par les administrateurs existe déjà dans le back-office.
- L'export PDF du CV est une fonctionnalité existante qui doit être préservée.
- Les utilisateurs accèdent principalement à l'application via des appareils tactiles (tablettes) ou ordinateurs.
- Les navigateurs cibles supportent les fonctionnalités d'accessibilité standard (ARIA, focus visible).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% des utilisateurs peuvent identifier la section active dans la barre de navigation en moins de 2 secondes.
- **SC-002**: Les utilisateurs peuvent naviguer entre les 3 sections principales en 1 seul clic depuis n'importe quelle page.
- **SC-003**: 90% des utilisateurs testés réussissent à développer et réduire un événement de la frise dès leur première tentative.
- **SC-004**: 90% des utilisateurs testés réussissent à replier et déplier un domaine de compétences dès leur première tentative.
- **SC-005**: Le temps de chargement des pages avec contenus repliables reste inférieur à 3 secondes.
- **SC-006**: L'interface obtient un score d'accessibilité minimum de 90/100 selon les critères WCAG 2.1 AA.
- **SC-007**: 100% des fonctionnalités de repliage/dépliage sont utilisables uniquement au clavier.
- **SC-008**: L'export PDF du CV génère un document valide en moins de 5 secondes.
