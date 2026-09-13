import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { assessSupportRequest } from './know-me-agent.js';

const port = process.env.PORT || 3000;

createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/') {
    const page = await readFile(new URL('../public/index.html', import.meta.url));
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return response.end(page);
  }
  if (request.method === 'POST' && request.url === '/api/assess') {
    let body = '';
    for await (const chunk of request) body += chunk;
    try {
      const assessment = assessSupportRequest(JSON.parse(body));
      response.writeHead(200, { 'content-type': 'application/json' });
      return response.end(JSON.stringify(assessment, null, 2));
    } catch {
      response.writeHead(400, { 'content-type': 'application/json' });
      return response.end(JSON.stringify({ status: 'invalid_request', message: 'Body must be valid JSON.' }));
    }
  }
  response.writeHead(404).end();
}).listen(port, () => console.log(`Know Me Agent sample: http://localhost:${port}`));

