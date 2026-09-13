import test from 'node:test';
import assert from 'node:assert/strict';
import { assessSupportRequest } from '../src/know-me-agent.js';

test('identifies a related open issue and offers relevant self-help', () => {
  const result = assessSupportRequest({ customerId: 'cust-1001', channel: 'email', category: 'authentication', summary: 'I cannot sign in to the Analytics dashboard' });
  assert.equal(result.status, 'ready');
  assert.equal(result.entitlement.serviceLevel, 'priority');
  assert.equal(result.issue.classification, 'possible_existing_issue');
  assert.equal(result.issue.matchedCaseId, 'case-481');
  assert.equal(result.selfHelp.recommended, true);
  assert.equal(result.selfHelp.articles[0].id, 'kb-101');
});

test('offers self-help before creating an eligible new case', () => {
  const result = assessSupportRequest({ customerId: 'cust-2002', channel: 'email', category: 'billing', summary: 'I see what looks like a duplicate subscription charge' });
  assert.equal(result.issue.classification, 'new_issue');
  assert.equal(result.issue.recommendedAction, 'offer_self_help_then_create_case');
  assert.equal(result.selfHelp.articles[0].id, 'kb-202');
});

test('does not leak a case across organizations', () => {
  const result = assessSupportRequest({ customerId: 'cust-2002', channel: 'email', category: 'authentication', summary: 'Analytics dashboard sign-in fails with a redirect loop' });
  assert.equal(result.issue.classification, 'new_issue');
});
