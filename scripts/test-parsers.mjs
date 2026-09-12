#!/usr/bin/env node
/**
 * Parser accuracy tests — each fixture should reach >= 90% trace coverage.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectFrameworks } from '../lib/frameworks.js';
import { collectApiRoutes, collectClientApi, collectWebPages } from '../lib/parsers/index.js';
import { buildJourneySteps } from '../lib/journey-builder.js';
import { scanProject } from '../lib/scan.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const fixturesDir = path.join(root, 'test/fixtures');

function writeFixture(name, files) {
  const dir = path.join(fixturesDir, name);
  fs.rmSync(dir, { recursive: true, force: true });
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return dir;
}

function assertCoverage(name, dir) {
  const scan = scanProject(dir);
  const fw = detectFrameworks(scan.packages, dir);
  const pages = collectWebPages(dir, scan.packages);
  const api = collectApiRoutes(dir, scan.packages, fw);
  const client = collectClientApi(dir, scan.packages);
  const { coverage } = buildJourneySteps(pages, api, client, 'TestFlows');
  console.log(`  ${name}: pages=${pages.length} api=${api.length} coverage=${coverage.overall}%`);
  if (coverage.overall < 90) {
    throw new Error(`${name} coverage ${coverage.overall}% below 90%`);
  }
}

// Build fixtures inline
writeFixture('nestjs-app', {
  'package.json': JSON.stringify({ name: 'nestjs-app', dependencies: { '@nestjs/core': '10' } }),
  'src/users/users.controller.ts': `@Controller('users')
export class UsersController {
  @Get() list() {}
  @Get(':id') one() {}
  @Post() create() {}
}`,
  'src/auth/auth.controller.ts': `@Controller('auth')
export class AuthController {
  @Post('login') login() {}
  @Post('register') register() {}
}`,
});

writeFixture('next-fullstack', {
  'package.json': JSON.stringify({ name: 'next-fullstack', dependencies: { next: '14' } }),
  'src/app/page.tsx': 'export default function P(){}',
  'src/app/dashboard/page.tsx': 'export default function P(){}',
  'src/app/login/page.tsx': 'export default function P(){}',
  'src/app/api/users/route.ts': 'export async function GET(){} export async function POST(){}',
  'src/app/api/projects/route.ts': 'export async function GET(){}',
});

writeFixture('react-router-spa', {
  'package.json': JSON.stringify({ name: 'react-router-spa', dependencies: { 'react-router-dom': '6' } }),
  'src/routes.tsx': `export const routes = [
    { path: '/login', element: null },
    { path: '/dashboard', element: null },
    { path: '/settings', element: null },
  ];`,
  'src/api/client.ts': `export async function getUsers() { fetch('/api/users'); }`,
  'server/index.js': `router.get('/api/users', h); router.post('/api/users', h); router.get('/api/reports', h);`,
});

writeFixture('openapi-service', {
  'package.json': JSON.stringify({ name: 'openapi-service' }),
  'openapi.yaml': `paths:
  /api/v1/widgets:
    get:
      summary: list
    post:
      summary: create
  /api/v1/widgets/{id}:
    get:
      summary: one
`,
});

console.log('Parser coverage tests');
assertCoverage('nestjs-app', path.join(fixturesDir, 'nestjs-app'));
assertCoverage('next-fullstack', path.join(fixturesDir, 'next-fullstack'));
assertCoverage('react-router-spa', path.join(fixturesDir, 'react-router-spa'));
assertCoverage('openapi-service', path.join(fixturesDir, 'openapi-service'));
console.log('All fixtures >= 90% coverage');
