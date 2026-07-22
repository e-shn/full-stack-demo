# fullstack-demo

A simple full-stack demo app for testing purposes.

## Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML/JS (served by Express on the same port)
- **Storage**: In-memory array (no database)

## Running with Docker

```bash
docker compose up --build
```

The app will be available at **http://localhost:3000**.

To run in the background:

```bash
docker compose up --build -d
```

To stop:

```bash
docker compose down
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check — returns `{ "status": "ok" }` |
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create a user (requires `name` and `email` in JSON body) |
| GET | `/api/users/:id` | Get a single user by ID |
| DELETE | `/api/users/:id` | Delete a user by ID |

### POST /api/users — request body

```json
{ "name": "Jane Doe", "email": "jane@example.com", "role": "user" }
```

Returns `201` on success, `400` if `name` or `email` is missing/invalid.

## Running locally (without Docker)

```bash
npm install
npm start
```

Then open http://localhost:3000.

## Test Concurrency Guard (Recommended)

Install the repository pre-push hook once:

```bash
npm run hooks:install
```

What it does on every push:

- Runs unit tests
- Runs Playwright in concurrent stress mode (`--workers=4 --repeat-each=2`)

Manual command (same gate as the hook):

```bash
npm run test:e2e:prepush
```

Temporary bypass (if absolutely needed):

```bash
SKIP_PREPUSH_TESTS=1 git push
```
