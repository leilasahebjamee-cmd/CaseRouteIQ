# Know Me Agent — sample support triage service

This small, dependency-free Node.js sample shows how a support agent can make a consistent decision before a case is created:

1. identifies the customer and their service level;
2. checks which support channels and response targets they are eligible for;
3. compares the reported problem with open and recent issues; and
4. returns a structured recommendation: a new case or an update to an existing case.

The data source is deliberately in-memory so the behaviour is easy to inspect. Replace `src/customer-store.js` with CRM, billing, entitlement, and ticketing-system adapters in production.

## Run

Requires Node.js 18+.

```powershell
node src/server.js
```

Open `http://localhost:3000` or submit a decision directly:

```powershell
Invoke-RestMethod http://localhost:3000/api/assess -Method Post -ContentType 'application/json' -Body '{"customerId":"cust-1001","summary":"I cannot sign in to the Analytics dashboard","category":"authentication","channel":"email"}'
```

## Test

```powershell
node --test
```

## API

`POST /api/assess`

```json
{
  "customerId": "cust-1001",
  "summary": "I cannot sign in to the Analytics dashboard",
  "category": "authentication",
  "channel": "email"
}
```

The response includes the matched customer profile, service entitlement, duplicate/recurrence assessment, and a safe next action. The response avoids exposing other customers' case details.

## Production notes

- Authenticate the caller and derive `customerId` from the authenticated identity.
- Treat service entitlements as server-side data; do not accept them from browser input.
- Use a privacy-reviewed vector or keyword search only within the caller's organization.
- Send confidence below the selected threshold to an agent for review.
- Audit every entitlement and case-match decision.

The pattern maps well to an OpenAI tool-using agent: expose customer lookup, entitlement lookup, and organization-scoped case search as server-side tools, then require the model to return this response schema. The sample keeps the deterministic policy layer separate so service eligibility is never left to model judgment alone.

