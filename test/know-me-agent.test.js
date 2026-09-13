import test from 'node:test';
import assert from 'node:assert/strict';
import { assessSupportRequest, createSupportCase } from '../src/know-me-agent.js';

test('identifies a related open issue and offers relevant self-help', () => {
  const result = assessSupportRequest({ customerId: 'cust-1001', channel: 'email', category: 'authentication', summary: 'I cannot sign in to the Analytics dashboard' });
  assert.equal(result.issue.classification, 'possible_existing_issue');
  assert.equal(result.selfHelp.articles[0].id, 'kb-101');
});

test('creates a new eligible case after self-help is offered', () => {
  const result = createSupportCase({ customerId: 'cust-2002', channel: 'email', category: 'billing', summary: 'My September invoice includes an unfamiliar charge' });
  assert.equal(result.status, 'created');
  assert.equal(result.supportCase.organizationId, 'org-tailspin');
  assert.equal(result.supportCase.serviceLevel, 'standard');
});

test('does not create a duplicate when an open case matches', () => {
  const result = createSupportCase({ customerId: 'cust-1001', channel: 'email', category: 'authentication', summary: 'I cannot sign in to the Analytics dashboard' });
  assert.equal(result.status, 'not_created');
  assert.equal(result.caseId, 'case-481');
});
