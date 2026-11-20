# Lead Manager

A small full-stack lead tracking application built for the Meru Technosoft Full Stack Developer Screening Assignment.

## Included features

- Add a lead with name, email, phone, company, source and status.
- List leads in a responsive table.
- Edit lead details and status.
- Delete leads with a browser confirmation step.
- Search by lead name and filter by status.
- Frontend and backend validation, including required fields and email format.

## Tech stack

- **Frontend:** React 18, Vite, Lucide React, CSS
- **Backend:** Node.js, Express
- **Database:** SQLite with better-sqlite3

SQLite was chosen to keep local setup simple while still providing persistent relational storage. The database file is created automatically at `server/leads.db`.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

1. Extract the project folder and open it in VS Code.
2. Install the root helper dependency:

   ```bash
   npm install
   ```

3. Install frontend and backend dependencies:

   ```bash
   npm run install:all
   ```

4. Start both apps in development mode:

   ```bash
   npm run dev
   ```

5. Open **http://localhost:5173** in your browser.

The React development server proxies `/api` requests to the Express API at `http://localhost:4000`.

To run only the backend:

```bash
npm run dev --prefix server
```

To build the frontend:

```bash
npm run build --prefix client
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/leads` | List leads; optional `search` and `status` query parameters |
| POST | `/api/leads` | Create a lead |
| PUT | `/api/leads/:id` | Update a lead |
| DELETE | `/api/leads/:id` | Delete a lead |
| GET | `/api/health` | API health check |

### Lead fields

- `name` — required
- `email` — required and must be a valid email
- `phone` — required
- `company` — required
- `source` — Website, Referral, LinkedIn, Cold Call, or Other
- `status` — New, Contacted, Qualified, or Lost

## Assumptions

- Each lead has one source and one status.
- Lead names are searched using a case-insensitive SQLite `LIKE` match (depending on SQLite's default behavior).
- Authentication and per-user access are not included because they are optional in the assignment.
- Pagination, sorting, dashboard analytics, deployment and automated tests are intentionally left out for now.

## What I would improve with more time

- Add automated API and UI tests.
- Add authentication and user-specific lead ownership.
- Add pagination and sorting for larger datasets.
- Add deployment configuration and production environment setup.

## Short note

I focused on delivering the required end-to-end lead workflow with a simple responsive interface, persistent SQLite storage, REST API endpoints and validation on both sides. The main design decision was to keep the stack lightweight and the local setup straightforward.
