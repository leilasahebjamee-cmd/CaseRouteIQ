import test from 'node:test';
import assert from 'node:assert/strict';
import { assessSupportRequest } from '../src/know-you-agent.js';

test('identifies a related open issue for an eligible customer', () => {
  const result = assessSupportRequest({ customerId: 'cust-1001', channel: 'email', category: 'authentication', summary: 'I cannot sign in to the Analytics dashboard' });
  assert.equal(result.status, 'ready');
  assert.equal(result.entitlement.serviceLevel, 'priority');
  assert.equal(result.issue.classification, 'possible_existing_issue');
  assert.equal(result.issue.matchedCaseId, 'case-481');
});

test('flags a channel that is not included in the customer entitlement', () => {
  const result = assessSupportRequest({ customerId: 'cust-2002', channel: 'phone', category: 'technical', summary: 'The import stopped overnight' });
  assert.equal(result.status, 'channel_not_eligible');
  assert.equal(result.issue.classification, 'new_issue');
});

test('does not leak a case across organizations', () => {
  const result = assessSupportRequest({ customerId: 'cust-2002', channel: 'email', category: 'authentication', summary: 'Analytics dashboard sign-in fails with a redirect loop' });
  assert.equal(result.issue.classification, 'new_issue');
});

