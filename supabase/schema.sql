-- Run this in Supabase SQL Editor. It creates only fictional demo records.
create table if not exists customers (
  customer_id text primary key,
  name text not null,
  email text unique,
  plan text not null,
  organization_id text not null
);
create table if not exists customer_entitlements (
  customer_id text primary key references customers(customer_id) on delete cascade,
  service_tier text not null,
  allowed_channels text[] not null,
  response_target_hours integer not null check (response_target_hours > 0)
);
create table if not exists knowledge_articles (
  id text primary key,
  category text not null,
  title text not null,
  url text not null,
  summary text not null,
  is_published boolean not null default true
);
create table if not exists support_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  customer_id text not null references customers(customer_id),
  status text not null check (status in ('open','pending','resolved','closed')),
  category text not null,
  summary text not null,
  channel text not null,
  service_level text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table customers enable row level security;
alter table customer_entitlements enable row level security;
alter table knowledge_articles enable row level security;
alter table support_cases enable row level security;

insert into customers (customer_id, name, email, plan, organization_id) values
('cust-1001','Northwind Analytics','northwind@example.test','enterprise','org-northwind'),
('cust-2002','Tailspin Toys','tailspin@example.test','professional','org-tailspin')
on conflict (customer_id) do nothing;
insert into customer_entitlements (customer_id, service_tier, allowed_channels, response_target_hours) values
('cust-1001','enterprise',array['portal','email','phone'],1),
('cust-2002','standard',array['portal','email'],8)
on conflict (customer_id) do nothing;
insert into knowledge_articles (id, category, title, url, summary) values
('kb-101','authentication','Fix sign-in and redirect-loop problems','https://example.com/help/sign-in','Clear session cookies, check your identity provider, and retry sign-in.'),
('kb-202','billing','Understand duplicate subscription charges','https://example.com/help/billing','Review invoices and pending authorizations before requesting a billing review.'),
('kb-303','technical','Troubleshoot failed imports','https://example.com/help/imports','Check file format, required fields, and error logs.')
on conflict (id) do nothing;
