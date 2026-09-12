import fs from 'node:fs';
import path from 'node:path';
import { readJson, readText } from './paths.js';

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.turbo',
  'vendor',
]);

export function scanProject(projectRoot) {
  const rootPkg = readJson(path.join(projectRoot, 'package.json'));
  const readme = readText(path.join(projectRoot, 'README.md')) ?? '';
  const packages = collectPackages(projectRoot, rootPkg);
  const topDirs = listTopDirs(projectRoot);
  const routes = findRouteHints(projectRoot, packages);
  const journey = suggestJourney(routes, packages);
  const quickStart = extractQuickStart(readme);
  const description = extractDescription(readme, rootPkg);
  const stack = detectStack(packages, projectRoot);

  return {
    projectName: rootPkg?.name ?? path.basename(projectRoot),
    journey,
    description,
    readme,
    quickStart,
    rootPkg,
    packages,
    topDirs,
    routes,
    stack,
    terms: collectTerms(packages, routes),
  };
}

function collectPackages(projectRoot, rootPkg) {
  const packages = [];
  if (rootPkg) {
    packages.push({ name: rootPkg.name ?? 'root', dir: projectRoot, pkg: rootPkg });
  }
  const workspaces = rootPkg?.workspaces;
  if (Array.isArray(workspaces)) {
    for (const pattern of workspaces) {
      if (pattern.includes('*')) {
        const base = pattern.replace(/\*+$/, '').replace(/\/$/, '');
        const parent = path.join(projectRoot, base);
        if (!fs.existsSync(parent)) continue;
        for (const name of fs.readdirSync(parent)) {
          const dir = path.join(parent, name);
          const pkg = readJson(path.join(dir, 'package.json'));
          if (pkg) packages.push({ name: pkg.name ?? name, dir, pkg });
        }
      } else {
        const dir = path.join(projectRoot, pattern);
        const pkg = readJson(path.join(dir, 'package.json'));
        if (pkg && !packages.some((p) => p.dir === dir)) {
          packages.push({ name: pkg.name ?? path.basename(dir), dir, pkg });
        }
      }
    }
  }
  for (const name of ['shop-api', 'shop-web', 'api', 'web', 'app', 'server', 'client']) {
    const dir = path.join(projectRoot, name);
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      if (!packages.some((p) => p.dir === dir)) {
        const pkg = readJson(path.join(dir, 'package.json'));
        packages.push({ name: pkg?.name ?? name, dir, pkg });
      }
    }
  }
  return packages;
}

function listTopDirs(projectRoot) {
  return fs
    .readdirSync(projectRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !SKIP_DIRS.has(e.name) && !e.name.startsWith('.'))
    .map((e) => e.name);
}

function findRouteHints(projectRoot, packages) {
  const hints = [];
  const dirs = packages.length ? packages.map((p) => p.dir) : [projectRoot];

  for (const dir of dirs) {
    walk(dir, 0, 6, (filePath) => {
      const rel = path.relative(projectRoot, filePath).replace(/\\/g, '/');
      const base = path.basename(filePath);
      if (/page\.(tsx|jsx|js|ts)$/.test(base)) {
        const route = path.dirname(rel).replace(/^shop-web\/src\/app/, '').replace(/^src\/app/, '') || '/';
        hints.push({ type: 'page', path: rel, route: route === 'shop-web/src/app' ? '/' : route });
      }
      if (filePath.endsWith('index.ts') || filePath.endsWith('index.js')) {
        const content = readText(filePath) ?? '';
        if (/\.(get|post|put|delete|patch)\s*\(\s*['"`]/i.test(content) || /app\.(get|post)/i.test(content)) {
          hints.push({ type: 'api', path: rel, route: 'see file' });
        }
      }
    });
  }
  return hints.slice(0, 30);
}

function walk(dir, depth, maxDepth, onFile) {
  if (depth > maxDepth || !fs.existsSync(dir)) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, depth + 1, maxDepth, onFile);
    else onFile(full);
  }
}

function suggestJourney(routes, packages) {
  const text = routes.map((r) => `${r.route} ${r.path}`).join(' ').toLowerCase();
  if (text.includes('checkout') && text.includes('cart')) return 'MockCheckout';
  if (text.includes('cart') && text.includes('product')) return 'ShoppingFlow';
  if (packages.length > 1) return 'ApplicationOverview';
  if (text.includes('dashboard')) return 'ApplicationOverview';
  if (text.includes('login') || text.includes('auth')) return 'ApplicationOverview';
  return 'MainFlow';
}

function extractQuickStart(readme) {
  const match = readme.match(/##\s*quick start[\s\S]*?(?=##|$)/i);
  if (!match) return extractCodeBlocks(readme).slice(0, 2);
  return extractCodeBlocks(match[0]);
}

function extractCodeBlocks(section) {
  const blocks = [];
  const re = /```(?:bash|sh|shell)?\n([\s\S]*?)```/gi;
  let m;
  while ((m = re.exec(section))) blocks.push(m[1].trim());
  return blocks;
}

function extractDescription(readme, rootPkg) {
  if (rootPkg?.description) return rootPkg.description;
  const lines = readme.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
  return lines[0]?.trim() ?? 'Software project.';
}

function detectStack(packages, projectRoot) {
  const deps = {};
  for (const p of packages) {
    Object.assign(deps, p.pkg?.dependencies, p.pkg?.devDependencies);
  }
  const rootPkg = readJson(path.join(projectRoot, 'package.json'));
  Object.assign(deps, rootPkg?.dependencies, rootPkg?.devDependencies);
  const stack = [];
  if (deps.next) stack.push(`Next.js ${deps.next}`);
  if (deps.hono) stack.push(`Hono ${deps.hono}`);
  if (deps.react) stack.push(`React ${deps.react}`);
  if (deps.express) stack.push('Express');
  if (deps['@nestjs/core']) stack.push('NestJS');
  return stack.length ? stack : ['See package.json'];
}

function collectTerms(packages, routes) {
  const terms = new Set(['DocAtlas']);
  for (const p of packages) {
    const short = p.name.split('/').pop();
    if (short) terms.add(titleCase(short.replace(/-/g, ' ')));
  }
  const keywords = ['cart', 'order', 'product', 'checkout', 'session', 'catalog', 'user', 'payment'];
  const blob = routes.map((r) => r.path).join(' ').toLowerCase();
  for (const k of keywords) {
    if (blob.includes(k)) terms.add(titleCase(k));
  }
  return [...terms];
}

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
