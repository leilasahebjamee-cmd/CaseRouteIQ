# Know Your Customer — sample support triage service

Know Your Customer is a dependency-free Node.js sample that identifies the customer, checks their support entitlement, recommends self-help, finds related open cases, and creates a support case when appropriate.

## Run

Requires Node.js 18+.

```powershell
node src/server.js
```

Open `http://localhost:3000`.

## How case creation works

The browser has two actions:

1. **Find self-help and assess** returns the customer’s eligibility, relevant articles, and whether an open case appears related.
2. **Create support case** calls `POST /api/cases`.

The creation endpoint creates a new open case only when the customer exists, is eligible for their selected channel, and no related open case is found. It returns HTTP `201` for a created case. If an existing case is matched or a channel is not eligible, it returns HTTP `409` and does not create a duplicate.

## Test

```powershell
node --test
```

## Important demo limitation

Cases are stored in memory and are lost when the application restarts or is redeployed. Before using this with real customers, replace the sample store with a database or ticketing-system integration, authenticate users, derive the customer identity on the server, and use approved knowledge-base links. Do not treat this demo’s sample customer data or example URLs as production data.
