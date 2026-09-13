const customers = new Map([
  ['cust-1001', {
    id: 'cust-1001',
    name: 'Northwind Analytics',
    plan: 'enterprise',
    supportTier: 'priority',
    eligibleChannels: ['portal', 'email', 'phone'],
    responseTargetHours: 1,
    organizationId: 'org-northwind'
  }],
  ['cust-2002', {
    id: 'cust-2002',
    name: 'Tailspin Toys',
    plan: 'professional',
    supportTier: 'standard',
    eligibleChannels: ['portal', 'email'],
    responseTargetHours: 8,
    organizationId: 'org-tailspin'
  }]
]);

const cases = [
  {
    id: 'case-481', organizationId: 'org-northwind', status: 'open',
    category: 'authentication',
    summary: 'Analytics dashboard sign-in fails with a redirect loop',
    updatedAt: '2026-09-10T16:00:00Z'
  },
  {
    id: 'case-310', organizationId: 'org-tailspin', status: 'resolved',
    category: 'billing',
    summary: 'Duplicate charge on the August subscription invoice',
    updatedAt: '2026-08-28T11:00:00Z'
  }
];

const selfHelpArticles = [
  {
    id: 'kb-101', category: 'authentication',
    title: 'Fix sign-in and redirect-loop problems',
    url: 'https://support.example.com/articles/fix-sign-in-redirect-loop',
    summary: 'Clear session cookies, check your identity provider, and retry sign-in.'
  },
  {
    id: 'kb-202', category: 'billing',
    title: 'Understand and report duplicate subscription charges',
    url: 'https://support.example.com/articles/duplicate-subscription-charges',
    summary: 'Review invoices, pending authorizations, and the information needed for a billing review.'
  },
  {
    id: 'kb-303', category: 'technical',
    title: 'Troubleshoot failed imports',
    url: 'https://support.example.com/articles/troubleshoot-imports',
    summary: 'Check file format, required fields, error logs, and retry steps.'
  }
];

export function getCustomer(customerId) {
  return customers.get(customerId) ?? null;
}

export function getCasesForOrganization(organizationId) {
  return cases.filter((supportCase) => supportCase.organizationId === organizationId);
}

export function getSelfHelpArticles(category) {
  return selfHelpArticles.filter((article) => article.category === category);
}
