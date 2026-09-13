import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { assessSupportRequest, createSupportCase } from './know-me-agent.js';

const port = process.env.PORT || 3000;
async function readJson(request) {
  let body = '';
  for await (const chunk of request) body += chunk;
  return JSON.parse(body);
}
function json(response, status, payload) {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(payload, null, 2));
}

createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/') {
    const page = await readFile(new URL('../public/index.html', import.meta.url));
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return response.end(page);
  }
  if (request.method === 'POST' && request.url === '/api/assess') {
    try { return json(response, 200, assessSupportRequest(await readJson(request))); }
    catch { return json(response, 400, { status: 'invalid_request', message: 'Body must be valid JSON.' }); }
  }
  if (request.method === 'POST' && request.url === '/api/cases') {
    try {
      const result = createSupportCase(await readJson(request));
      return json(response, result.status === 'created' ? 201 : 409, result);
    } catch { return json(response, 400, { status: 'invalid_request', message: 'Body must be valid JSON.' }); }
  }
  response.writeHead(404).end();
}).listen(port, '0.0.0.0', () => console.log(`Know Your Customer: http://localhost:${port}`));
