const customers = new Map([
  ['cust-1001', { id: 'cust-1001', name: 'Northwind Analytics', plan: 'enterprise', supportTier: 'priority', eligibleChannels: ['portal', 'email', 'phone'], responseTargetHours: 1, organizationId: 'org-northwind' }],
  ['cust-2002', { id: 'cust-2002', name: 'Tailspin Toys', plan: 'professional', supportTier: 'standard', eligibleChannels: ['portal', 'email'], responseTargetHours: 8, organizationId: 'org-tailspin' }]
]);
const cases = [
  { id: 'case-481', organizationId: 'org-northwind', status: 'open', category: 'authentication', summary: 'Analytics dashboard sign-in fails with a redirect loop', updatedAt: '2026-09-10T16:00:00Z' },
  { id: 'case-310', organizationId: 'org-tailspin', status: 'resolved', category: 'billing', summary: 'Duplicate charge on the August subscription invoice', updatedAt: '2026-08-28T11:00:00Z' }
];
const selfHelpArticles = [
  { id: 'kb-101', category: 'authentication', title: 'Fix sign-in and redirect-loop problems', url: 'https://support.example.com/articles/fix-sign-in-redirect-loop', summary: 'Clear session cookies, check your identity provider, and retry sign-in.' },
  { id: 'kb-202', category: 'billing', title: 'Understand and report duplicate subscription charges', url: 'https://support.example.com/articles/duplicate-subscription-charges', summary: 'Review invoices, pending authorizations, and the information needed for a billing review.' },
  { id: 'kb-303', category: 'technical', title: 'Troubleshoot failed imports', url: 'https://support.example.com/articles/troubleshoot-imports', summary: 'Check file format, required fields, error logs, and retry steps.' }
];

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasSupabase = Boolean(supabaseUrl && serviceKey);

async function rest(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', ...(options.headers ?? {}) }
  });
  if (!response.ok) throw new Error(`Supabase request failed: ${response.status}`);
  return response.status === 204 ? null : response.json();
}
function normalizeCustomer(row, entitlement) {
  return { id: row.customer_id, name: row.name, plan: row.plan, organizationId: row.organization_id, supportTier: entitlement.service_tier, eligibleChannels: entitlement.allowed_channels, responseTargetHours: entitlement.response_target_hours };
}
function normalizeCase(row) {
  return { id: row.id, organizationId: row.organization_id, status: row.status, category: row.category, summary: row.summary, channel: row.channel, serviceLevel: row.service_level, createdAt: row.created_at, updatedAt: row.updated_at };
}

export async function getCustomer(customerId) {
  if (!hasSupabase) return customers.get(customerId) ?? null;
  const [row] = await rest(`customers?customer_id=eq.${encodeURIComponent(customerId)}&select=*`);
  if (!row) return null;
  const [entitlement] = await rest(`customer_entitlements?customer_id=eq.${encodeURIComponent(customerId)}&select=*`);
  return entitlement ? normalizeCustomer(row, entitlement) : null;
}
export async function getCasesForOrganization(organizationId) {
  if (!hasSupabase) return cases.filter((supportCase) => supportCase.organizationId === organizationId);
  const rows = await rest(`support_cases?organization_id=eq.${encodeURIComponent(organizationId)}&status=in.(open,pending)&select=*`);
  return rows.map(normalizeCase);
}
export async function getSelfHelpArticles(category) {
  if (!hasSupabase) return selfHelpArticles.filter((article) => article.category === category);
  return rest(`knowledge_articles?category=eq.${encodeURIComponent(category)}&is_published=eq.true&select=id,title,url,summary`);
}
export async function createCase(customer, request) {
  if (!hasSupabase) {
    const supportCase = { id: `case-${String(cases.length + 480).padStart(3, '0')}`, organizationId: customer.organizationId, status: 'open', category: request.category, summary: request.summary.trim(), channel: request.channel, serviceLevel: customer.supportTier, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    cases.push(supportCase);
    return supportCase;
  }
  const [row] = await rest('support_cases', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ organization_id: customer.organizationId, customer_id: customer.id, status: 'open', category: request.category, summary: request.summary.trim(), channel: request.channel, service_level: customer.supportTier }) });
  return normalizeCase(row);
}
export function isUsingSupabase() { return hasSupabase; }
