// ── Module Registry (Single Source of Truth) ────────────────────────────
// Every page that needs the module list or count imports from here.
// When you add a new module, update this array and everything stays in sync.

export const MODULE_KEYS = [
  'workflows',
  'skills',
  'agents',
  'prompts',
  'mcp',
  'context',
  'tools',
  'safety',
  'projects',
  'multiagent',
  'evaluation',
  'production',
] as const

export type ModuleKey = (typeof MODULE_KEYS)[number]

/** Total number of learning modules — derived dynamically */
export const TOTAL_MODULES = MODULE_KEYS.length // 12

/** Display metadata for each module (used by profile progress cards) */
export const MODULE_META: Record<ModuleKey, { label: string; icon: string; href: string }> = {
  workflows:  { label: 'Workflows', icon: '🔄', href: '/learn/workflows' },
  skills:     { label: 'Skills', icon: '🛠️', href: '/learn/skills' },
  agents:     { label: 'Autonomous Agents', icon: '🤖', href: '/learn/agents' },
  prompts:    { label: 'Prompt Engineering', icon: '✍️', href: '/learn/prompts' },
  mcp:        { label: 'Model Context Protocol', icon: '🔌', href: '/learn/mcp' },
  context:    { label: 'Context Windows', icon: '🧠', href: '/learn/context' },
  tools:      { label: 'Tool Use & Function Calling', icon: '🛠️', href: '/learn/tools' },
  safety:     { label: 'Safety & Guardrails', icon: '🛡️', href: '/learn/safety' },
  projects:   { label: 'Real-World Projects', icon: '🚀', href: '/learn/projects' },
  multiagent: { label: 'Multi-Agent Systems', icon: '🤝', href: '/learn/multiagent' },
  evaluation: { label: 'Evaluation & Testing', icon: '🧪', href: '/learn/evaluation' },
  production: { label: 'Production & Scaling', icon: '☁️', href: '/learn/production' },
}
