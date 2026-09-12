import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getToolkitRoot } from './paths.js';

const MCP_PACKAGE = 'docatlas-mcp';
const MCP_SERVER = path.join(getToolkitRoot(), 'packages/mcp/src/index.js');

export const AGENT_TARGETS = {
  cursor: {
    label: 'Cursor',
    projectMcp: '.cursor/mcp.json',
    globalMcp: path.join(os.homedir(), '.cursor/mcp.json'),
    rulePath: '.cursor/rules/docatlas-query.mdc',
  },
  claude: {
    label: 'Claude Code',
    projectMcp: '.mcp.json',
    globalMcp: path.join(os.homedir(), '.claude.json'),
    rulePath: null,
  },
  vscode: {
    label: 'VS Code',
    projectMcp: '.vscode/mcp.json',
    globalMcp: path.join(
      process.env.APPDATA ?? path.join(os.homedir(), '.config'),
      'Code/User/mcp.json'
    ),
    rulePath: null,
  },
};

const RULE_CONTENT = `---
description: Use DocAtlas MCP or docatlas query for internal project documentation before reading the entire doc tree.
alwaysApply: true
---

For questions about **this repository** — architecture, business rules, journeys, runbooks — use DocAtlas:

1. Prefer MCP tools: \`query_project_docs\`, \`get_ai_context\`, \`get_business_context\`, \`get_journey\`
2. Or run: \`docatlas query "<question>"\`
3. Read \`doc-atlas/docs/AI_CONTEXT.md\` first for orientation

Use Context7 (or similar) for **external library** APIs — DocAtlas is for **this project's** docs.
`;

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function writeJsonFile(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function mcpEntry(projectRoot) {
  return {
    command: 'node',
    args: [MCP_SERVER],
    env: {
      DOCATLAS_PROJECT_ROOT: projectRoot,
    },
  };
}

function mergeMcpConfig(existing, projectRoot) {
  const next = { ...existing };
  next.mcpServers = { ...(existing.mcpServers ?? {}) };
  next.mcpServers.docatlas = mcpEntry(projectRoot);
  return next;
}

function removeMcpConfig(existing) {
  const next = { ...existing };
  if (next.mcpServers?.docatlas) {
    delete next.mcpServers.docatlas;
    if (!Object.keys(next.mcpServers).length) delete next.mcpServers;
  }
  return next;
}

export function runSetupCommand(projectRoot, options = {}) {
  const agents = options.agents?.length ? options.agents : ['cursor', 'claude', 'vscode'];
  const project = options.project ?? false;
  const logs = [];

  for (const key of agents) {
    const target = AGENT_TARGETS[key];
    if (!target) continue;

    const mcpPath = project
      ? path.join(projectRoot, target.projectMcp)
      : target.globalMcp;

    const existing = readJsonFile(mcpPath);
    writeJsonFile(mcpPath, mergeMcpConfig(existing, projectRoot));
    logs.push(`configured ${target.label} MCP → ${mcpPath}`);

    if (target.rulePath && project) {
      const ruleAbs = path.join(projectRoot, target.rulePath);
      fs.mkdirSync(path.dirname(ruleAbs), { recursive: true });
      fs.writeFileSync(ruleAbs, RULE_CONTENT, 'utf8');
      logs.push(`wrote rule → ${target.rulePath}`);
    }
  }

  console.log('');
  console.log('  DocAtlas setup complete');
  console.log('');
  for (const line of logs) console.log(`    • ${line}`);
  console.log('');
  console.log('  Reload your IDE window to pick up MCP changes.');
  console.log('');
  return 0;
}

export function runSetupRemoveCommand(projectRoot, options = {}) {
  const agents = options.agents?.length ? options.agents : ['cursor', 'claude', 'vscode'];
  const project = options.project ?? false;
  const logs = [];

  for (const key of agents) {
    const target = AGENT_TARGETS[key];
    if (!target) continue;

    const mcpPath = project
      ? path.join(projectRoot, target.projectMcp)
      : target.globalMcp;

    if (fs.existsSync(mcpPath)) {
      const existing = readJsonFile(mcpPath);
      writeJsonFile(mcpPath, removeMcpConfig(existing));
      logs.push(`removed ${target.label} MCP from ${mcpPath}`);
    }

    if (target.rulePath && project) {
      const ruleAbs = path.join(projectRoot, target.rulePath);
      if (fs.existsSync(ruleAbs)) {
        fs.unlinkSync(ruleAbs);
        logs.push(`removed rule ${target.rulePath}`);
      }
    }
  }

  console.log('');
  console.log('  DocAtlas setup removed');
  console.log('');
  for (const line of logs) console.log(`    • ${line}`);
  console.log('');
  return 0;
}
