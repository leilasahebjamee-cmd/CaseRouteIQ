# Know Your Customer

A customer-aware support agent with entitlement checking, self-help recommendations, duplicate detection, and guarded case creation.

## Run locally

```powershell
node src/server.js
node --test
```

Without Supabase settings, the app runs on its built-in fictional demo data.

## Connect Supabase (free prototype)

1. Create a free Supabase project.
2. Open **SQL Editor**, paste and run [supabase/schema.sql](supabase/schema.sql).
3. In Supabase **Project Settings → API**, copy the project URL and **service_role** key.
4. In Render, open the web service → **Environment**, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Redeploy the service.

The key is server-only. Do not put it in browser JavaScript, commit it to GitHub, or share it in chat. Once both variables are set, the agent reads and creates data in Supabase; the response's `dataSource` becomes `supabase`.

## Entitlement policy

| Tier | Channels | First-response target |
|---|---|---:|
| Standard | portal, email | 8 hours |
| Premium | portal, email, phone | 4 hours |
| Enterprise | portal, email, phone | 1 hour |

Edit `customer_entitlements` in Supabase to change this policy.

## Customer and case flow

- `POST /api/assess` checks the customer, entitlement, articles, and related open cases.
- `POST /api/cases` creates a case only when the request is eligible and does not match an open case.
- The database starts with fictional records only.

## Before using real customers

Add customer sign-in and derive the customer identity from the authenticated session. Do not accept a user-selected `customerId` in a real public deployment. Also replace the example knowledge-base URLs with approved articles.

HubSpot can be added later as a CRM source or sync target. Keep the API token in Render environment variables; the app should never call HubSpot directly from the browser.
