# HR Assistant — Frontend

A React frontend for the HR Assistant application. Provides a chat-based HR policy assistant, admin policy upload and management, a ticketing interface, and user authentication.

## Quick start

Prerequisites: Node.js (16+), npm

Install dependencies and run the dev server:

```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000 to use the app. The dev server reloads on source changes.

## Build for production

```bash
cd frontend
npm run build
```

The production-ready files are written to the `build/` folder.

## Project features (high level)

- **Chat assistant**: ask HR policy questions and get contextual responses.
- **Admin dashboard**: upload Excel policy files for the knowledge base (admin-only).
- **Policy list**: browse uploaded and sample policies.
- **Ticketing**: create and view HR tickets.
- **Authentication**: simple login/register flows used by the app.

## Backend

The frontend expects a backend API at `../backend`. Start the backend separately (FastAPI). See the `backend/` folder for server code and requirements.

## Tests

Run frontend tests:

```bash
cd frontend
npm test
```

## Important files

- `src/` — React sources
- `src/components/` — UI and feature components (chat, admin, tickets, auth)
- `public/` — static HTML and assets

If you'd like, I can expand this README with detailed API endpoints, environment variable notes, or deployment steps.
