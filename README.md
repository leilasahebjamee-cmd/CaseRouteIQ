# Know You Agent — sample support triage service

Know You is a dependency-free Node.js sample that makes a consistent support decision before a case is created:

1. identifies the customer and their service level;
2. checks which support channels and response targets they are eligible for;
3. recommends relevant self-help articles;
4. compares the reported problem with open issues for that customer's organization; and
5. recommends a new case, an update to an existing case, or self-help first.

The data source is deliberately in-memory so the behaviour is easy to inspect. Replace `src/customer-store.js` with CRM, billing, entitlement, ticketing-system, and approved knowledge-base adapters in production.

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

## Self-help behaviour

For a recognized category, the agent returns a `selfHelp` object with approved article titles, links, and short summaries. For a new issue with relevant guidance, its recommendation is `offer_self_help_then_create_case`: the customer can try the article first and still create a case if the issue remains unresolved. An existing open case continues to take precedence.

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

The response includes the matched customer profile, service entitlement, self-help recommendation, duplicate/recurrence assessment, and a safe next action. It avoids exposing other customers' case details.

## Production notes

- Authenticate the caller and derive `customerId` from the authenticated identity.
- Treat service entitlements as server-side data; do not accept them from browser input.
- Use a privacy-reviewed vector or keyword search only within the caller's organization.
- Serve only approved and current knowledge-base articles.
- Send confidence below the selected threshold to an agent for review.
- Audit every entitlement, self-help, and case-match decision.

The pattern maps well to an OpenAI tool-using agent: expose customer lookup, entitlement lookup, organization-scoped case search, and approved knowledge-base search as server-side tools. Keep service eligibility and access controls in deterministic code rather than leaving them to model judgment.
