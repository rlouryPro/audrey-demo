# Feature Specification: Livret Numérique de Parcours ESAT

**Feature Branch**: `001-esat-skills-portfolio`
**Created**: 2025-12-25
**Status**: Draft
**Input**: User description: "Le projet consiste à concevoir une application web destinée aux travailleurs en ESAT, ayant pour objectif de créer un livret numérique de parcours de compétences et de formation. L'application doit être simple d'utilisation, accessible et adaptée aux différents types de handicaps (interface épurée, pictogrammes, textes courts, navigation intuitive). Elle s'articule autour de trois onglets principaux. Le premier est une frise chronologique permettant à l'utilisateur de renseigner les moments marquants de son année (date, texte court, photo) afin de visualiser son parcours passé et valoriser ses expériences. Le deuxième onglet est dédié aux compétences : l'utilisateur peut sélectionner et ajouter des compétences à partir de référentiels définis en amont. Ces compétences sont administrées via un back-office et, à mesure qu'elles sont acquises, un avatar évolue visuellement pour renforcer la motivation et la valorisation des acquis. Le troisième onglet permet la génération d'un document de synthèse du parcours."

## Clarifications

### Session 2025-12-25

- Q: L'application doit-elle supporter plusieurs établissements ESAT ? → A: Mono-ESAT (une instance = un établissement avec son référentiel)
- Q: L'application doit-elle fonctionner en mode hors-ligne ? → A: Non, connexion internet requise en permanence
- Q: Qui peut valider l'acquisition d'une compétence ? → A: Validation encadrant (l'utilisateur propose, l'encadrant valide)
- Q: Où les données doivent-elles être hébergées ? → A: RGPD obligatoire, démo locale pour l'instant (hébergement France/UE en production)
- Q: Comment l'utilisateur peut-il partager son document de synthèse ? → A: Téléchargement PDF seul (partage manuel par l'utilisateur)
- Précision ajoutée : validation des compétences accessible dans le back-office administrateur
- Précision ajoutée : récapitulatif des compétences (acquises, en cours, en attente) visible dans l'onglet 2
- Précision ajoutée : hiérarchie des compétences (domaines > catégories > compétences)
- Q: Comment les comptes des travailleurs ESAT sont-ils créés ? → A: Création par admin uniquement, qui attribue le rôle (utilisateur ou admin). Section dédiée dans le back-office.
- Q: Un encadrant peut-il consulter le parcours complet d'un utilisateur ? → A: Oui, consultation en lecture seule (frise + compétences), sans possibilité de modification.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consulter et ajouter des événements à ma frise chronologique (Priority: P1)

En tant que travailleur ESAT, je souhaite pouvoir documenter les moments marquants de mon parcours (formations, réussites, événements importants) sur une frise chronologique visuelle, afin de garder une trace de mon évolution et valoriser mes expériences.

**Why this priority**: La frise chronologique est le premier onglet et représente le coeur de l'expérience utilisateur - elle permet de créer un historique personnel valorisant et constitue la base du livret de parcours.

**Independent Test**: Peut être testé en créant un compte utilisateur et en ajoutant/consultant des événements sur la frise, indépendamment des fonctionnalités de compétences ou de génération de document.

**Acceptance Scenarios**:

1. **Given** je suis connecté à mon compte, **When** j'accède à l'onglet frise chronologique, **Then** je vois ma frise avec tous mes événements existants affichés dans l'ordre chronologique
2. **Given** je suis sur la frise chronologique, **When** je clique sur le bouton d'ajout (pictogramme +), **Then** un formulaire simplifié s'affiche avec les champs date, texte court et photo
3. **Given** je remplis le formulaire d'ajout, **When** je valide, **Then** l'événement apparaît immédiatement sur ma frise à la bonne position chronologique
4. **Given** j'ai ajouté une photo à un événement, **When** je consulte la frise, **Then** je vois la miniature de la photo associée à l'événement

---

### User Story 2 - Ajouter et suivre mes compétences avec évolution de l'avatar (Priority: P1)

En tant que travailleur ESAT, je souhaite pouvoir sélectionner des compétences à partir d'un référentiel et les marquer comme acquises, avec un avatar qui évolue visuellement pour me motiver et valoriser mes progrès.

**Why this priority**: Les compétences sont le deuxième pilier fondamental de l'application, et l'avatar évolutif est un élément de gamification essentiel pour la motivation des utilisateurs.

**Independent Test**: Peut être testé en parcourant le référentiel de compétences, en ajoutant des compétences à son profil et en vérifiant l'évolution visuelle de l'avatar.

**Acceptance Scenarios**:

1. **Given** je suis sur l'onglet compétences, **When** je parcours le référentiel, **Then** je vois les compétences organisées par domaines et catégories avec des pictogrammes et textes courts
2. **Given** je consulte une compétence disponible, **When** je clique dessus, **Then** je peux l'ajouter à mon profil comme compétence à acquérir ou demander sa validation comme acquise
3. **Given** j'ai ajouté des compétences, **When** une compétence est validée par l'encadrant, **Then** mon avatar évolue visuellement (nouvel accessoire, couleur, niveau)
4. **Given** j'ai plusieurs compétences acquises, **When** je consulte mon avatar, **Then** il reflète visuellement mon niveau de progression global
5. **Given** je suis sur l'onglet compétences, **When** je consulte le récapitulatif, **Then** je vois un résumé de mes compétences acquises, en cours et en attente de validation

---

### User Story 3 - Générer un document de synthèse de mon parcours (Priority: P2)

En tant que travailleur ESAT, je souhaite pouvoir générer un document récapitulatif de mon parcours (frise et compétences) afin de le partager avec mon encadrant, lors d'un entretien, ou pour garder une trace imprimable de mes acquis.

**Why this priority**: La génération de document est importante pour la valorisation externe du parcours, mais nécessite que les deux premières fonctionnalités soient en place.

**Independent Test**: Peut être testé en générant un document après avoir rempli la frise et les compétences, et en vérifiant le contenu et le format du document produit.

**Acceptance Scenarios**:

1. **Given** j'ai des événements sur ma frise et des compétences enregistrées, **When** j'accède à l'onglet de génération, **Then** je vois un aperçu de mon document de synthèse
2. **Given** je suis sur l'aperçu du document, **When** je clique sur le bouton de génération (pictogramme téléchargement), **Then** un document formaté est généré et téléchargé
3. **Given** le document est généré, **When** je l'ouvre, **Then** il contient mes événements chronologiques et mes compétences acquises de manière lisible

---

### User Story 4 - Administrer les référentiels et les utilisateurs (Priority: P2)

En tant qu'administrateur (encadrant ou responsable ESAT), je souhaite pouvoir gérer les référentiels de compétences et les comptes utilisateurs via un back-office afin d'adapter le système aux besoins de l'établissement.

**Why this priority**: Le back-office est nécessaire pour alimenter le système en compétences pertinentes et gérer les accès, mais les utilisateurs finaux peuvent tester avec un jeu de données initial.

**Independent Test**: Peut être testé indépendamment en se connectant au back-office et en gérant compétences et utilisateurs.

**Acceptance Scenarios**:

*Gestion des compétences :*
1. **Given** je suis connecté en tant qu'administrateur, **When** j'accède au back-office, **Then** je vois les sections : Compétences, Validations, Utilisateurs
2. **Given** je suis dans la section Compétences, **When** je crée une nouvelle compétence (nom, description, pictogramme, domaine, catégorie), **Then** elle devient disponible pour les utilisateurs
3. **Given** une compétence existe, **When** je la modifie ou la supprime, **Then** les changements sont reflétés dans l'application utilisateur
4. **Given** je suis dans la section Validations, **When** je consulte la liste, **Then** je vois les compétences en attente de validation par utilisateur
5. **Given** une compétence est en attente de validation, **When** je la valide ou la refuse, **Then** le statut est mis à jour et l'utilisateur voit le changement dans son onglet compétences

*Gestion des utilisateurs :*
6. **Given** je suis dans la section Utilisateurs, **When** je consulte la liste, **Then** je vois tous les utilisateurs avec leur rôle et statut
7. **Given** je crée un nouvel utilisateur, **When** je remplis le formulaire (nom, identifiant, rôle), **Then** le compte est créé et l'utilisateur peut se connecter
8. **Given** un utilisateur existe, **When** je modifie son rôle ou désactive son compte, **Then** les changements sont appliqués immédiatement

*Consultation des parcours :*
9. **Given** je suis dans la section Utilisateurs, **When** je clique sur un utilisateur, **Then** je peux consulter son parcours complet (frise et compétences) en lecture seule
10. **Given** je consulte le parcours d'un utilisateur, **When** je visualise sa frise ou ses compétences, **Then** je ne peux pas modifier ses données

---

### User Story 5 - Accéder à l'application de manière accessible et intuitive (Priority: P1)

En tant que travailleur ESAT avec un handicap, je souhaite utiliser une interface simple, épurée et accessible afin de naviguer facilement sans être désorienté ou bloqué.

**Why this priority**: L'accessibilité est une exigence transversale fondamentale qui conditionne l'usage réel de l'application par le public cible.

**Independent Test**: Peut être testé en naviguant dans l'application avec des outils d'accessibilité (lecteur d'écran, navigation clavier) et en vérifiant la clarté des pictogrammes et textes.

**Acceptance Scenarios**:

1. **Given** je lance l'application, **When** je navigue entre les onglets, **Then** la navigation est intuitive avec des pictogrammes clairs et des textes courts
2. **Given** j'utilise un lecteur d'écran, **When** je parcours l'interface, **Then** tous les éléments sont correctement décrits et navigables
3. **Given** j'ai des difficultés de lecture, **When** je consulte l'interface, **Then** les textes sont courts, les icônes explicites et les contrastes suffisants

---

### Edge Cases

- Que se passe-t-il si l'utilisateur tente d'ajouter un événement sans photo ? Le système doit accepter les événements avec ou sans photo.
- Comment le système gère-t-il les dates invalides ou futures ? Le système doit accepter les dates passées et présentes, et avertir pour les dates futures lointaines.
- Que se passe-t-il si l'avatar n'a plus d'évolution possible ? Le système affiche un avatar "complet" avec un message de félicitations.
- Comment le système réagit-il si le référentiel de compétences est vide ? L'onglet compétences affiche un message explicatif invitant à contacter l'administrateur.
- Que se passe-t-il si l'utilisateur n'a aucun contenu lors de la génération du document ? Le système affiche un message encourageant à ajouter du contenu avant génération.

## Requirements *(mandatory)*

### Functional Requirements

**Navigation et Interface**
- **FR-001**: Le système DOIT afficher trois onglets principaux accessibles via une navigation fixe en bas ou en haut de l'écran
- **FR-002**: Le système DOIT utiliser des pictogrammes accompagnés de textes courts (max 3 mots) pour tous les éléments de navigation
- **FR-003**: L'interface DOIT respecter les critères d'accessibilité WCAG 2.1 niveau AA minimum

**Frise Chronologique**
- **FR-004**: L'utilisateur DOIT pouvoir créer un événement avec une date, un texte court (max 100 caractères) et optionnellement une photo
- **FR-005**: Le système DOIT afficher les événements sur une frise visuelle ordonnée chronologiquement
- **FR-006**: L'utilisateur DOIT pouvoir modifier ou supprimer ses événements existants
- **FR-007**: Le système DOIT accepter les formats d'image courants (JPEG, PNG) et les redimensionner automatiquement

**Compétences et Avatar**
- **FR-008**: L'utilisateur DOIT pouvoir parcourir un référentiel de compétences organisé hiérarchiquement (domaines > catégories > compétences)
- **FR-008b**: L'onglet compétences DOIT afficher un récapitulatif des compétences de l'utilisateur par statut (acquises, en cours, en attente de validation)
- **FR-009**: L'utilisateur DOIT pouvoir ajouter une compétence à son profil et la proposer comme "en cours d'acquisition" ou "à valider comme acquise"
- **FR-009b**: L'encadrant/administrateur DOIT pouvoir valider ou refuser les compétences proposées comme acquises par l'utilisateur
- **FR-010**: Le système DOIT faire évoluer visuellement l'avatar de l'utilisateur à chaque compétence validée comme acquise par l'encadrant
- **FR-011**: L'avatar DOIT avoir au minimum 5 niveaux d'évolution visuellement distincts

**Génération de Document**
- **FR-012**: Le système DOIT permettre de générer un document de synthèse au format imprimable
- **FR-013**: Le document DOIT inclure la liste des événements de la frise et les compétences acquises
- **FR-014**: Le document DOIT être formaté de manière lisible et valorisante

**Back-Office Administration**
- **FR-015**: Les administrateurs DOIVENT pouvoir créer, modifier et supprimer des compétences dans le référentiel
- **FR-016**: Chaque compétence DOIT avoir un nom, une description courte, un pictogramme, un domaine et une catégorie
- **FR-017**: Le système DOIT permettre de gérer la hiérarchie des compétences (domaines et catégories)
- **FR-017b**: Le back-office DOIT afficher la liste des compétences en attente de validation par utilisateur
- **FR-017c**: Les administrateurs DOIVENT pouvoir valider ou refuser les demandes de validation de compétences depuis le back-office

**Gestion des Utilisateurs (Back-Office)**
- **FR-022**: Les administrateurs DOIVENT pouvoir créer des comptes utilisateurs depuis le back-office
- **FR-023**: Lors de la création d'un compte, l'administrateur DOIT pouvoir attribuer le rôle (utilisateur ou administrateur)
- **FR-024**: Les administrateurs DOIVENT pouvoir modifier ou désactiver les comptes utilisateurs existants
- **FR-025**: Le back-office DOIT afficher la liste des utilisateurs avec leur rôle et statut
- **FR-026**: Les administrateurs DOIVENT pouvoir consulter le parcours complet d'un utilisateur (frise et compétences) en lecture seule

**Authentification et Sécurité**
- **FR-018**: Les utilisateurs DOIVENT s'authentifier pour accéder à leur livret personnel
- **FR-019**: Le système DOIT distinguer deux rôles : utilisateur (travailleur ESAT) et administrateur
- **FR-020**: Les données personnelles des utilisateurs DOIVENT être protégées et accessibles uniquement par leur propriétaire et les administrateurs autorisés
- **FR-021**: Le système DOIT être conforme au RGPD (droit d'accès, de rectification, de suppression des données personnelles)

### Key Entities

- **Utilisateur**: Représente un travailleur ESAT avec son profil, son avatar et ses données de parcours. Possède un rôle (utilisateur ou administrateur).
- **Événement**: Moment marquant sur la frise chronologique, associé à un utilisateur. Contient une date, un texte court et optionnellement une photo.
- **Domaine**: Niveau supérieur de la hiérarchie des compétences (ex: "Savoir-être", "Compétences techniques"). Contient des catégories.
- **Catégorie**: Niveau intermédiaire de la hiérarchie, appartient à un domaine. Regroupe des compétences thématiquement liées.
- **Compétence**: Élément du référentiel défini par les administrateurs. Appartient à une catégorie (et donc à un domaine) et possède un nom, une description et un pictogramme.
- **Compétence Utilisateur**: Association entre un utilisateur et une compétence, avec un statut (en cours / en attente de validation / acquise / refusée) et une date d'acquisition.
- **Avatar**: Représentation visuelle de la progression d'un utilisateur, évoluant selon les compétences acquises.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% des utilisateurs peuvent ajouter un événement à leur frise en moins de 2 minutes lors du premier essai
- **SC-002**: 85% des utilisateurs comprennent comment naviguer entre les trois onglets sans aide extérieure
- **SC-003**: L'avatar évolue visuellement de manière perceptible après chaque acquisition de compétence
- **SC-004**: Le document de synthèse peut être généré en moins de 30 secondes
- **SC-005**: L'interface passe les tests d'accessibilité automatisés WCAG 2.1 AA
- **SC-006**: 80% des travailleurs ESAT testeurs déclarent l'application "facile" ou "très facile" à utiliser
- **SC-007**: Un administrateur peut ajouter une nouvelle compétence au référentiel en moins de 3 minutes

## Assumptions

- Le troisième onglet mentionné (description coupée) concerne la génération d'un document de synthèse du parcours, ce qui est cohérent avec l'objectif de valorisation des acquis.
- Les utilisateurs ESAT ont un accompagnement initial pour la création de leur compte et la prise en main de l'application.
- L'application est déployée en mode mono-ESAT : une instance par établissement avec son propre référentiel de compétences.
- L'établissement ESAT dispose d'un référentiel de compétences initial à charger dans le système.
- Les photos ajoutées aux événements sont prises ou fournies par l'utilisateur (pas de fonctionnalité de prise de photo intégrée requise).
- Le format du document de synthèse est PDF, standard pour l'impression et le partage.
- L'authentification est simple (identifiant/mot de passe) avec possibilité de récupération assistée par un encadrant.
- L'application nécessite une connexion internet permanente pour fonctionner (pas de mode hors-ligne).
- Phase actuelle : démo locale. En production, hébergement France/UE requis pour conformité RGPD.
