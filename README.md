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

Les variables d'environnement optionnelles sont documentées dans
`.env.example`. Ne publiez jamais de clé réelle dans le dépôt.
