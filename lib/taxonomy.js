export const STANDARD_REQUIRED = [
  'ARCHITECTURE.md',
  'BUSINESS.md',
  'AI_CONTEXT.md',
  'business/CONTEXT-MAP.md',
  'ONBOARDING.md',
  'RUNBOOK.md',
  'GLOSSARY.md',
];

export const ENTERPRISE_REQUIRED = [
  ...STANDARD_REQUIRED,
  'system/overview.md',
  'system/deployment.md',
  'system/component-map.md',
  'integrations/internal-apis.md',
  'integrations/external-systems.md',
  'integrations/events.md',
  'data/databases.md',
  'data/caching.md',
  'data/ownership.md',
  'decisions/observed-decisions.md',
  'decisions/undocumented-decisions.md',
  'risks/architecture-risks.md',
  'risks/technical-debt.md',
];

export function getDocTaxonomy(meta) {
  return meta?.docTaxonomy === 'enterprise' ? 'enterprise' : 'standard';
}

export function getRequiredDocPaths(meta) {
  if (Array.isArray(meta?.requiredDocs) && meta.requiredDocs.length) {
    return meta.requiredDocs.map((d) => d.replace(/^docs\//, ''));
  }
  const taxonomy = getDocTaxonomy(meta);
  return taxonomy === 'enterprise' ? ENTERPRISE_REQUIRED : STANDARD_REQUIRED;
}

export function getEnterpriseTemplateDirs() {
  return ['system', 'integrations', 'data', 'decisions', 'risks'];
}
