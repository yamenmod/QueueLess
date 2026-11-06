# QueueLess

QueueLess is a mobile-first virtual queue experience for walk-in businesses. Phase 1 is a frontend-first prototype with realistic local mock state and an ASP.NET Core API shell ready for the persistence phase.

## Run locally

### Customer experience

```powershell
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173/business/freshcuts](http://localhost:5173/business/freshcuts).

### Business dashboard

Open [http://localhost:5173/dashboard](http://localhost:5173/dashboard) after starting the frontend.

### API shell

```powershell
cd QueueLess.Api
dotnet run
```

The Phase 1 health endpoint is available at `/api/health`. It intentionally does not contain queue persistence yet.

## Phase 1 scope

- Customer queue join flow with a unique ticket, position, estimated wait, and leave action.
- Business dashboard with queue open/closed state, current service, one-click “Finish & call next”, walk-in creation, and no-show actions.
- Shared in-memory mock state so dashboard actions are immediately reflected in the customer view within the same browser session.
- Responsive layout for mobile customers and desktop operators.
- Tailwind CSS is configured through the Vite plugin; the product UI uses a small set of custom design tokens for its visual system.
- API project with CORS configured for the Vite development server and a health endpoint.

Queue state resets when the frontend page is reloaded. PostgreSQL, authentication, SignalR, and notifications are intentionally reserved for later phases.
