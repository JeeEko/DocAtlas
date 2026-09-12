import fs from 'node:fs';
import path from 'node:path';
import { joinRoutePaths, relPath, walkFiles } from '../walk.js';
import { readText } from '../paths.js';
import { parseOpenApiFile } from './openapi.js';

const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

export function collectWebPages(projectRoot, packages) {
  const pages = [];
  const dirs = packages.length ? packages.map((p) => p.dir) : [projectRoot];
  const seen = new Set();

  const add = (page) => {
    const key = `${page.file}:${page.route}`;
    if (seen.has(key)) return;
    seen.add(key);
    pages.push(page);
  };

  for (const dir of dirs) {
    walkFiles(dir, (file) => {
      if (!CODE_EXT.test(file)) return;
      const relFile = relPath(projectRoot, file);
      const base = path.basename(file);

      if (base === 'page.tsx' || base === 'page.jsx' || base === 'page.js') {
        add({
          file: relFile,
          route: inferAppRouterPageRoute(relFile),
          source: 'next-app-router',
          confidence: 'verified',
        });
        return;
      }

      if (/^pages\/.+\.(tsx|jsx|js)$/.test(relFile) && !/^pages\/(_app|_document|_error)\./.test(relFile)) {
        add({
          file: relFile,
          route: inferPagesRouterRoute(relFile),
          source: 'next-pages-router',
          confidence: 'verified',
        });
        return;
      }

      const content = readText(file) ?? '';
      for (const route of parseReactRouterPaths(content)) {
        add({
          file: relFile,
          route,
          source: 'react-router',
          confidence: 'verified',
        });
      }
      for (const route of parseVueRouterPaths(content)) {
        add({
          file: relFile,
          route,
          source: 'vue-router',
          confidence: 'likely',
        });
      }
    });
  }

  return pages;
}

export function collectApiRoutes(projectRoot, packages, frameworks) {
  const routes = [];
  const dirs = packages.length ? packages.map((p) => p.dir) : [projectRoot];

  for (const dir of dirs) {
    walkFiles(dir, (file) => {
      if (!CODE_EXT.test(file)) return;
      const relFile = relPath(projectRoot, file);
      const content = readText(file) ?? '';

      if (path.basename(file) === 'route.ts' || path.basename(file) === 'route.js') {
        routes.push(...parseNextRouteHandler(relFile, content, projectRoot));
      }

      routes.push(...parseExpressFamily(content, relFile));
      routes.push(...parseNestJs(content, relFile));
      routes.push(...parseFastify(content, relFile));
      routes.push(...parseKoa(content, relFile));
    });

    walkFiles(dir, (file) => {
      if (/openapi\.(json|ya?ml)$/i.test(file) || file.endsWith('.swagger.json')) {
        routes.push(...parseOpenApiFile(file, projectRoot));
      }
    }, 0, 8);
  }

  return dedupeRoutes(routes);
}

export function collectClientApi(projectRoot, packages) {
  const calls = [];
  const dirs = packages.length ? packages.map((p) => p.dir) : [projectRoot];

  for (const dir of dirs) {
    walkFiles(dir, (file) => {
      if (!CODE_EXT.test(file)) return;
      const content = readText(file) ?? '';
      const relFile = relPath(projectRoot, file);

      const fnRe = /export (?:async )?function (\w+)|export const (\w+)\s*=\s*async/g;
      let m;
      while ((m = fnRe.exec(content))) {
        const fn = m[1] || m[2];
        const slice = content.slice(m.index, m.index + 1200);
        const pm = slice.match(/[`'"](\/(?:api|v\d+)[^'"`]+)[`'"]/);
        if (pm) calls.push({ fn, path: pm[1], file: relFile, source: 'export-fn' });
      }

      for (const pm of content.matchAll(/fetch\s*\(\s*[`'"]([^'"`]+)[`'"]/g)) {
        if (pm[1].startsWith('/') || pm[1].startsWith('http')) {
          calls.push({ fn: 'fetch', path: normalizeFetchPath(pm[1]), file: relFile, source: 'fetch' });
        }
      }

      for (const pm of content.matchAll(/axios\.(get|post|put|delete|patch)\s*\(\s*[`'"]([^'"`]+)[`'"]/gi)) {
        calls.push({ fn: `axios.${pm[1]}`, path: pm[2], file: relFile, source: 'axios' });
      }
    });
  }

  return dedupeCalls(calls);
}

function parseNextRouteHandler(relFile, content, projectRoot) {
  const m = relFile.match(/(?:^|\/)app\/(.+)\/route\.(ts|js)$/);
  if (!m) return [];
  let routePath = '/' + m[1].replace(/\/route$/, '').replace(/\/index$/, '');
  routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1');
  if (!routePath.startsWith('/api') && routePath.includes('/api/')) {
    routePath = routePath.slice(routePath.indexOf('/api'));
  }

  const methods = [];
  for (const mm of content.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g)) {
    methods.push(mm[1].toUpperCase());
  }
  if (!methods.length) methods.push('GET');

  return methods.map((method) => ({
    method,
    path: routePath,
    file: relPath(projectRoot, relFile),
    source: 'next-route-handler',
    confidence: 'verified',
  }));
}

function parseExpressFamily(content, file) {
  const routes = [];
  const patterns = [
    /app\.(get|post|put|delete|patch|all)\(\s*['"`]([^'"`]+)['"`]/gi,
    /router\.(get|post|put|delete|patch|all)\(\s*['"`]([^'"`]+)['"`]/gi,
  ];

  for (const re of patterns) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content))) {
      const method = m[1].toUpperCase();
      const routePath = m[2];
      if (!routePath?.startsWith('/')) continue;
      routes.push({
        method: method === 'ALL' ? 'ALL' : method,
        path: routePath,
        file,
        source: 'express-family',
        confidence: 'verified',
      });
    }
  }

  if (frameworkUsesHono(content)) {
    const honoRe = /app\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/gi;
    let m;
    while ((m = honoRe.exec(content))) {
      routes.push({
        method: m[1].toUpperCase(),
        path: m[2],
        file,
        source: 'hono',
        confidence: 'verified',
      });
    }
  }

  return routes;
}

function frameworkUsesHono(content) {
  return content.includes("from 'hono'") || content.includes('from "hono"');
}

function parseNestJs(content, file) {
  if (!content.includes('@Controller')) return [];
  const routes = [];
  const controllerRe = /@Controller\s*\(\s*['"`]?([^'"\)\s]*)['"`]?\s*\)/g;
  let cm;
  while ((cm = controllerRe.exec(content))) {
    const base = cm[1] || '';
    const slice = content.slice(cm.index, cm.index + 2500);
    const methodRe = /@(Get|Post|Put|Delete|Patch|Options|Head|All)\s*\(\s*(?:['"`]([^'"`]*)['"`])?\s*\)/g;
    let mm;
    while ((mm = methodRe.exec(slice))) {
      routes.push({
        method: mm[1].toUpperCase() === 'ALL' ? 'ALL' : mm[1].toUpperCase(),
        path: joinRoutePaths(base, mm[2] ?? ''),
        file,
        source: 'nestjs',
        confidence: 'verified',
      });
    }
  }
  return routes;
}

function parseFastify(content, file) {
  const routes = [];
  const re = /fastify\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/gi;
  let m;
  while ((m = re.exec(content))) {
    routes.push({
      method: m[1].toUpperCase(),
      path: m[2],
      file,
      source: 'fastify',
      confidence: 'verified',
    });
  }
  return routes;
}

function parseKoa(content, file) {
  const routes = [];
  const re = /router\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/gi;
  let m;
  while ((m = re.exec(content))) {
    routes.push({
      method: m[1].toUpperCase(),
      path: m[2],
      file,
      source: 'koa',
      confidence: 'verified',
    });
  }
  return routes;
}

function parseReactRouterPaths(content) {
  const routes = [];
  const patterns = [
    /path:\s*['"`]([^'"`]+)['"`]/g,
    /<Route[^>]+path=\{?\s*['"`]([^'"`]+)['"`]/g,
    /createBrowserRouter\s*\(\s*\[[\s\S]*?\]/g,
  ];
  for (const re of patterns.slice(0, 2)) {
    let m;
    while ((m = re.exec(content))) {
      if (m[1] && m[1].startsWith('/')) routes.push(m[1]);
    }
  }
  const block = content.match(/createBrowserRouter\s*\(\s*\[([\s\S]*?)\]\s*\)/);
  if (block) {
    let m;
    const pathRe = /path:\s*['"`]([^'"`]+)['"`]/g;
    while ((m = pathRe.exec(block[1]))) {
      if (m[1].startsWith('/')) routes.push(m[1]);
    }
  }
  return [...new Set(routes)];
}

function parseVueRouterPaths(content) {
  if (!content.includes('path:') && !content.includes('routes')) return [];
  const routes = [];
  let m;
  const re = /path:\s*['"`]([^'"`]+)['"`]/g;
  while ((m = re.exec(content))) {
    if (m[1].startsWith('/')) routes.push(m[1]);
  }
  return [...new Set(routes)];
}

function inferAppRouterPageRoute(relFile) {
  if (/\/app\/page\.(tsx|jsx|js)$/.test(relFile)) return '/';
  const m = relFile.match(/app\/(.+)\/page\.(tsx|jsx|js)$/);
  if (!m) return '/';
  return '/' + m[1].replace(/\[([^\]]+)\]/g, ':$1');
}

function inferPagesRouterRoute(relFile) {
  const m = relFile.match(/pages\/(.+)\.(tsx|jsx|js)$/);
  if (!m) return '/';
  if (m[1] === 'index') return '/';
  return '/' + m[1].replace(/\/index$/, '').replace(/\[([^\]]+)\]/g, ':$1');
}

function normalizeFetchPath(p) {
  try {
    if (p.startsWith('http')) return new URL(p).pathname;
  } catch {
    /* keep as-is */
  }
  return p.split('?')[0];
}

function dedupeRoutes(routes) {
  const seen = new Set();
  return routes.filter((r) => {
    const key = `${r.method}:${r.path}:${r.file}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeCalls(calls) {
  const seen = new Set();
  return calls.filter((c) => {
    const key = `${c.fn}:${c.path}:${c.file}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
