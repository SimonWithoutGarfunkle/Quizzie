# Quizzie

Quiz web à l'esthétique Windows rétro (fenêtres, barre des tâches, menu Démarrer), animé avec Lottie. React 19, TypeScript et Vite, sans backend.

## Commandes

- Dev : `npm run dev`
- Build : `npm run build` (vérification de types `tsc -b` puis build Vite)
- Vérification de types : `npx tsc -b`
- Lint : `npm run lint`
- Tests : `npm test`
- Test ciblé : `npx vitest run src/quiz.test.ts`

Vérification après chaque modification : `npx tsc -b && npm run lint && npm test`

## Structure

- `src/quiz.ts` : questions, barème et masquage du texte des questions, sans dépendance à React.
- `src/App.tsx` : déroulé du quiz (phases, score) et assemblage des pages.
- `src/StartMenu.tsx` : type `Page` et entrées du menu Démarrer. La navigation passe par l'état `page` de `App`, sans routeur.
- `src/WindowChrome.tsx` : `TitleBar` et `StatusBar` des fenêtres.
- `src/Lottie.tsx` : wrapper de `lottie-react` pour les animations `.json`.
- `src/animations/` : animations `.json`, importées directement, et `.lottie`, lues avec `DotLottieReact` de `@lottiefiles/dotlottie-react`.
- `src/App.css` : styles de toute l'application.

## Conventions

- Composants fonctionnels, un composant principal par fichier en `export default`, props typées par une `interface Props`.
- CSS classique dans `App.css`, classes de forme `bloc`, `bloc-element`, `bloc--modificateur` (`window--small`, `start-menu-item--active`). Pas de CSS-in-JS ni de librairie UI.
- Animations `.json` via le composant `Lottie` du projet, jamais `lottie-react` directement.
- Textes de l'interface en français.

## Tests

- Vitest et Testing Library (environnement jsdom). Les tests sont à côté du fichier testé : `quiz.test.ts`, `App.test.tsx`.
- La logique pure va dans `quiz.ts` et se teste directement. Le comportement de l'interface se teste en rendant `App` et en cliquant comme un joueur.
- jsdom ne sait pas rendre les animations : mocker `./Lottie` et `@lottiefiles/dotlottie-react` (voir `App.test.tsx`).
