import fs from 'node:fs';
import { relPath } from '../walk.js';

export function parseOpenApiFile(file, projectRoot) {
  const content = fs.readFileSync(file, 'utf8');
  const relFile = relPath(projectRoot, file);
  const routes = [];

  try {
    if (file.endsWith('.json') || file.endsWith('.swagger.json')) {
      const spec = JSON.parse(content);
      routes.push(...pathsFromOpenApi(spec, relFile));
    } else {
      routes.push(...pathsFromYamlLike(content, relFile));
    }
  } catch {
    routes.push(...pathsFromYamlLike(content, relFile));
  }

  return routes;
}

function pathsFromOpenApi(spec, file) {
  const routes = [];
  const paths = spec?.paths ?? {};
  for (const [routePath, methods] of Object.entries(paths)) {
    for (const method of Object.keys(methods)) {
      if (!/^(get|post|put|patch|delete|head|options)$/i.test(method)) continue;
      routes.push({
        method: method.toUpperCase(),
        path: routePath,
        file,
        source: 'openapi',
        confidence: 'verified',
      });
    }
  }
  return routes;
}

function pathsFromYamlLike(content, file) {
  const routes = [];
  const pathRe = /^\s*(\/[\w\-/{}:.]+):\s*$/gm;
  let m;
  while ((m = pathRe.exec(content))) {
    const routePath = m[1];
    const slice = content.slice(m.index, m.index + 400);
    for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
      if (new RegExp(`\\b${method}:`, 'i').test(slice)) {
        routes.push({
          method: method.toUpperCase(),
          path: routePath,
          file,
          source: 'openapi',
          confidence: 'verified',
        });
      }
    }
  }
  return routes;
}
