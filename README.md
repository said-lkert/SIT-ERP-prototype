# SIT-ERP Prototype

Prototype fonctionnel de SIT-ERP, une application modulaire de gestion des
référentiels, des stocks, des projets clients, du parc installé et du service
après-vente.

## Technologies

- React 19 et TypeScript
- Vite et Tailwind CSS
- Express
- SQLite avec `better-sqlite3`

## Installation

Prérequis : Node.js.

```bash
npm install
npm run dev
```

L'application initialise automatiquement la base SQLite locale et ses données
de démonstration lorsque les tables sont absentes.

Pour réinitialiser manuellement les données :

```bash
npm run demo:reset
```

## Compilation

```bash
npm run build
npm start
```

## Déploiement sur Vercel

Le dépôt est configuré pour Vercel :

- le frontend React est compilé avec Vite dans `dist` ;
- les routes `/api/*` sont servies par une fonction Express ;
- les routes du frontend utilisent un fallback SPA vers `index.html`.

Importez le dépôt GitHub dans Vercel et conservez les paramètres détectés depuis
`vercel.json`.

La démonstration utilise SQLite dans le répertoire temporaire de la fonction
Vercel. Les données sont initialisées automatiquement, mais elles peuvent être
réinitialisées lors d'un redémarrage ou d'un changement d'instance serverless.
Une base externe persistante sera nécessaire pour une utilisation en production.

Aucune variable d'environnement n'est requise pour cette démonstration. Ne
publiez jamais de clé réelle dans le dépôt.
