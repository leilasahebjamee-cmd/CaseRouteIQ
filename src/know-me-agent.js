import { getCustomer, getCasesForOrganization, getSelfHelpArticles } from './customer-store.js';

const STOP_WORDS = new Set(['a', 'an', 'and', 'the', 'to', 'for', 'with', 'on', 'in', 'i', 'my', 'is', 'it', 'cannot', 'can', 'not']);

function tokens(text = '') {
  return new Set(text.toLowerCase().match(/[a-z0-9]+/g)?.filter((word) => !STOP_WORDS.has(word)) ?? []);
}

function similarity(left, right) {
  const a = tokens(left);
  const b = tokens(right);
  const shared = [...a].filter((word) => b.has(word)).length;
  return a.size + b.size === 0 ? 0 : (2 * shared) / (a.size + b.size);
}

function findRelatedCase(customer, request) {
  const candidates = getCasesForOrganization(customer.organizationId)
    .filter((supportCase) => supportCase.status === 'open' || supportCase.status === 'pending')
    .map((supportCase) => ({
      supportCase,
      score: similarity(request.summary, supportCase.summary) + (request.category === supportCase.category ? 0.25 : 0)
    }))
    .sort((a, b) => b.score - a.score);

  const match = candidates[0];
  return match && match.score >= 0.5 ? match : null;
}

function selfHelpFor(request) {
  return getSelfHelpArticles(request.category).map(({ id, title, url, summary }) => ({ id, title, url, summary }));
}

export function assessSupportRequest(request) {
  if (!request?.customerId || !request?.summary || !request?.category || !request?.channel) {
    return { status: 'needs_information', message: 'customerId, summary, category, and channel are required.' };
  }

  const customer = getCustomer(request.customerId);
  if (!customer) return { status: 'customer_not_found', message: 'No customer was found for this identity.' };

  const channelEligible = customer.eligibleChannels.includes(request.channel);
  const related = findRelatedCase(customer, request);
  const selfHelp = selfHelpFor(request);

  return {
    status: channelEligible ? 'ready' : 'channel_not_eligible',
    customer: { id: customer.id, name: customer.name, plan: customer.plan },
    entitlement: {
      serviceLevel: customer.supportTier,
      requestedChannel: request.channel,
      channelEligible,
      eligibleChannels: customer.eligibleChannels,
      responseTargetHours: customer.responseTargetHours
    },
    selfHelp: {
      recommended: selfHelp.length > 0,
      articles: selfHelp,
      message: selfHelp.length > 0
        ? 'Try these self-help articles before opening a new case. You can still contact support if they do not resolve the issue.'
        : 'No matching self-help article is available; continue with support triage.'
    },
    issue: related
      ? { classification: 'possible_existing_issue', confidence: Number(Math.min(related.score, 1).toFixed(2)), matchedCaseId: related.supportCase.id, recommendedAction: 'append_to_existing_case' }
      : { classification: 'new_issue', confidence: 0.8, recommendedAction: selfHelp.length > 0 ? 'offer_self_help_then_create_case' : 'create_new_case' },
    nextStep: channelEligible
      ? (related ? 'Confirm the details and add this report to the existing case.' : selfHelp.length > 0 ? 'Present the self-help articles. If unresolved, create a new support case using the eligible service level.' : 'Create a new support case using the eligible service level.')
      : `Ask the customer to use one of: ${customer.eligibleChannels.join(', ')}.`
  };
}
