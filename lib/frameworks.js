import { readJson } from './paths.js';

export function detectFrameworks(packages, projectRoot) {
  const deps = {};
  for (const p of packages) {
    Object.assign(deps, p.pkg?.dependencies, p.pkg?.devDependencies);
  }
  const rootPkg = readJson(`${projectRoot}/package.json`);
  Object.assign(deps, rootPkg?.dependencies, rootPkg?.devDependencies);

  return {
    next: Boolean(deps.next),
    nest: Boolean(deps['@nestjs/core']),
    express: Boolean(deps.express),
    hono: Boolean(deps.hono),
    fastify: Boolean(deps.fastify),
    koa: Boolean(deps.koa),
    reactRouter: Boolean(deps['react-router'] || deps['react-router-dom']),
    vueRouter: Boolean(deps['vue-router']),
    trpc: Boolean(deps['@trpc/server']),
  };
}
