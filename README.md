# CaseRouteIQ


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
