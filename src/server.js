import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { assessSupportRequest, createSupportCase } from './know-me-agent.js';
const port = process.env.PORT || 3000;
async function readJson(request) { let body = ''; for await (const chunk of request) body += chunk; return JSON.parse(body); }
function json(response, status, payload) { response.writeHead(status, { 'content-type': 'application/json' }); response.end(JSON.stringify(payload, null, 2)); }
async function page(response, filename) { const content = await readFile(new URL(`../public/${filename}`, import.meta.url)); response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); response.end(content); }
createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/') return page(response, 'index.html');
  if (request.method === 'GET' && request.url === '/agent') return page(response, 'agent.html');
  if (request.method === 'GET' && request.url === '/favicon.svg') { const icon = await readFile(new URL('../public/favicon.svg', import.meta.url)); response.writeHead(200, { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' }); return response.end(icon); }
  if (request.method === 'GET' && request.url === '/assets/kyc-hero.png') { const asset = await readFile(new URL('../kyc-hero.png', import.meta.url)); response.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'public, max-age=31536000, immutable' }); return response.end(asset); }
  if (request.method === 'POST' && request.url === '/api/assess') { try { return json(response, 200, await assessSupportRequest(await readJson(request))); } catch { return json(response, 400, { status: 'invalid_request', message: 'Body must be valid JSON.' }); } }
  if (request.method === 'POST' && request.url === '/api/cases') { try { const result = await createSupportCase(await readJson(request)); return json(response, result.status === 'created' ? 201 : 409, result); } catch { return json(response, 400, { status: 'invalid_request', message: 'Body must be valid JSON.' }); } }
  response.writeHead(404).end();
}).listen(port, '0.0.0.0', () => console.log(`Know Your Customer: http://localhost:${port}`));
