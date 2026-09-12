#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  formatSearchResults,
  getAiContextContent,
  getBusinessContextContent,
  getJourneyContent,
  rankChunks,
} from '../../../lib/search.js';
import { isDocAtlasInitialized } from '../../../lib/layout.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOLKIT_ROOT = path.resolve(__dirname, '../../..');

function resolveProjectRoot() {
  if (process.env.DOCATLAS_PROJECT_ROOT) {
    return path.resolve(process.env.DOCATLAS_PROJECT_ROOT);
  }
  return process.cwd();
}

function ensureInitialized(projectRoot) {
  if (!isDocAtlasInitialized(projectRoot)) {
    throw new Error('DocAtlas not initialized in this project — run: docatlas init');
  }
}

const server = new McpServer(
  {
    name: 'DocAtlas',
    version: '5.0.0',
    websiteUrl: 'https://github.com/JeeEko/DocAtlas',
    description: 'Query repo-native project documentation from doc-atlas/',
  },
  {
    instructions: `Use this server for questions about THIS repository — architecture, business rules, user journeys, runbooks, and internal APIs.

Do not use for external library documentation (use Context7 or similar instead).

Prefer query_project_docs for targeted lookups. Read get_ai_context first when orienting to the project.`,
  }
);

server.registerTool(
  'query_project_docs',
  {
    title: 'Query Project Docs',
    description:
      'Search doc-atlas/ markdown for sections relevant to a question about this repository. Returns ranked snippets with file paths.',
    inputSchema: {
      query: z.string().describe('Question or topic to search for in project documentation'),
      limit: z.number().int().min(1).max(20).optional().describe('Max results (default 5)'),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ query, limit }) => {
    const projectRoot = resolveProjectRoot();
    ensureInitialized(projectRoot);
    const results = rankChunks(projectRoot, query, { limit: limit ?? 5 });
    return {
      content: [{ type: 'text', text: formatSearchResults(results) }],
    };
  }
);

server.registerTool(
  'get_ai_context',
  {
    title: 'Get AI Context',
    description: 'Return the full AI_CONTEXT.md orientation file for this project.',
    inputSchema: {},
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async () => {
    const projectRoot = resolveProjectRoot();
    ensureInitialized(projectRoot);
    const content = getAiContextContent(projectRoot);
    if (!content) {
      return { content: [{ type: 'text', text: 'AI_CONTEXT.md not found.' }] };
    }
    return { content: [{ type: 'text', text: content }] };
  }
);

server.registerTool(
  'get_business_context',
  {
    title: 'Get Business Context',
    description: 'Return a business context document by slug (e.g. auth, billing, orders).',
    inputSchema: {
      slug: z.string().describe('Context slug matching business/contexts/<slug>.md'),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ slug }) => {
    const projectRoot = resolveProjectRoot();
    ensureInitialized(projectRoot);
    const result = getBusinessContextContent(projectRoot, slug);
    if (!result) {
      return { content: [{ type: 'text', text: `Business context not found: ${slug}` }] };
    }
    return {
      content: [{ type: 'text', text: `# ${result.path}\n\n${result.content}` }],
    };
  }
);

server.registerTool(
  'get_journey',
  {
    title: 'Get Journey',
    description: 'Return JOURNEY-*.md docs matching a route prefix or journey name.',
    inputSchema: {
      query: z
        .string()
        .optional()
        .describe('Route prefix or journey keyword (omit to list all journeys)'),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ query }) => {
    const projectRoot = resolveProjectRoot();
    ensureInitialized(projectRoot);
    const journeys = getJourneyContent(projectRoot, query ?? '');
    if (!journeys.length) {
      return { content: [{ type: 'text', text: 'No matching journeys found.' }] };
    }
    const text = journeys.map((j) => `# ${j.path}\n\n${j.content}`).join('\n\n---\n\n');
    return { content: [{ type: 'text', text }] };
  }
);

async function main() {
  if (process.argv.includes('--version')) {
    console.log('5.0.0');
    process.exit(0);
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('[DocAtlas MCP]', err.message);
  process.exit(1);
});
