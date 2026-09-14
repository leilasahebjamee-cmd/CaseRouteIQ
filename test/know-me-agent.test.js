import test from 'node:test';
import assert from 'node:assert/strict';
import { assessSupportRequest, createSupportCase } from '../src/know-me-agent.js';
test('identifies a related open issue and offers self-help', async () => {
  const result = await assessSupportRequest({ customerId: 'cust-1001', channel: 'email', category: 'authentication', summary: 'I cannot sign in to the Analytics dashboard' });
  assert.equal(result.issue.classification, 'possible_existing_issue'); assert.equal(result.selfHelp.articles[0].id, 'kb-101');
});
test('creates a new eligible case', async () => {
  const result = await createSupportCase({ customerId: 'cust-2002', channel: 'email', category: 'billing', summary: 'My September invoice includes an unfamiliar charge' });
  assert.equal(result.status, 'created'); assert.equal(result.supportCase.organizationId, 'org-tailspin');
});
test('does not create a duplicate', async () => {
  const result = await createSupportCase({ customerId: 'cust-1001', channel: 'email', category: 'authentication', summary: 'I cannot sign in to the Analytics dashboard' });
  assert.equal(result.status, 'not_created'); assert.equal(result.caseId, 'case-481');
});
