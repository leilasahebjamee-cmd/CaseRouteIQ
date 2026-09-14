import { createCase, getCustomer, getCasesForOrganization, getSelfHelpArticles, isUsingSupabase } from './customer-store.js';
const STOP_WORDS = new Set(['a', 'an', 'and', 'the', 'to', 'for', 'with', 'on', 'in', 'i', 'my', 'is', 'it', 'cannot', 'can', 'not']);
function tokens(text = '') { return new Set(text.toLowerCase().match(/[a-z0-9]+/g)?.filter((word) => !STOP_WORDS.has(word)) ?? []); }
function similarity(left, right) { const a = tokens(left); const b = tokens(right); const shared = [...a].filter((word) => b.has(word)).length; return a.size + b.size === 0 ? 0 : (2 * shared) / (a.size + b.size); }
async function findRelatedCase(customer, request) {
  const candidates = (await getCasesForOrganization(customer.organizationId)).map((supportCase) => ({ supportCase, score: similarity(request.summary, supportCase.summary) + (request.category === supportCase.category ? 0.25 : 0) })).sort((a, b) => b.score - a.score);
  const match = candidates[0]; return match && match.score >= 0.5 ? match : null;
}
export async function assessSupportRequest(request) {
  if (!request?.customerId || !request?.summary || !request?.category || !request?.channel) return { status: 'needs_information', message: 'customerId, summary, category, and channel are required.' };
  const customer = await getCustomer(request.customerId);
  if (!customer) return { status: 'customer_not_found', message: 'No customer was found for this identity.' };
  const channelEligible = customer.eligibleChannels.includes(request.channel);
  const [related, articles] = await Promise.all([findRelatedCase(customer, request), getSelfHelpArticles(request.category)]);
  const selfHelp = articles.map(({ id, title, url, summary }) => ({ id, title, url, summary }));
  return { status: channelEligible ? 'ready' : 'channel_not_eligible', dataSource: isUsingSupabase() ? 'supabase' : 'demo', customer: { id: customer.id, name: customer.name, plan: customer.plan }, entitlement: { serviceLevel: customer.supportTier, requestedChannel: request.channel, channelEligible, eligibleChannels: customer.eligibleChannels, responseTargetHours: customer.responseTargetHours }, selfHelp: { recommended: selfHelp.length > 0, articles: selfHelp, message: selfHelp.length ? 'Try these approved self-help articles before opening a new case.' : 'No matching self-help article is available; continue with support triage.' }, issue: related ? { classification: 'possible_existing_issue', confidence: Number(Math.min(related.score, 1).toFixed(2)), matchedCaseId: related.supportCase.id, recommendedAction: 'append_to_existing_case' } : { classification: 'new_issue', confidence: 0.8, recommendedAction: selfHelp.length ? 'offer_self_help_then_create_case' : 'create_new_case' }, nextStep: !channelEligible ? `Ask the customer to use one of: ${customer.eligibleChannels.join(', ')}.` : related ? 'Confirm the details and add this report to the existing case.' : selfHelp.length ? 'Present the self-help articles. If unresolved, create a new support case.' : 'Create a new support case using the eligible service level.' };
}
export async function createSupportCase(request) {
  const assessment = await assessSupportRequest(request);
  if (assessment.status !== 'ready') return { status: 'not_created', reason: assessment.status, assessment };
  if (assessment.issue.classification === 'possible_existing_issue') return { status: 'not_created', reason: 'existing_case_found', caseId: assessment.issue.matchedCaseId, assessment };
  const customer = await getCustomer(request.customerId);
  return { status: 'created', supportCase: await createCase(customer, request), assessment };
}
