// ── Module Registry (Single Source of Truth) ────────────────────────────
// Every page that needs the module list or count imports from here.
// When you add a new module, update this array and everything stays in sync.

import { quizQuestions as workflowsQuiz } from '../pages/workflows'
import { quizQuestions as skillsQuiz } from '../pages/skills'
import { quizQuestions as agentsQuiz } from '../pages/agents'
import { quizQuestions as promptsQuiz } from '../pages/prompts'
import { quizQuestions as mcpQuiz } from '../pages/mcp'
import { quizQuestions as contextQuiz } from '../pages/context'
import { quizQuestions as toolsQuiz } from '../pages/tools'
import { quizQuestions as safetyQuiz } from '../pages/safety'
import { quizQuestions as projectsQuiz } from '../pages/projects'
import { quizQuestions as multiagentQuiz } from '../pages/multiagent'
import { quizQuestions as evaluationQuiz } from '../pages/evaluation'
import { quizQuestions as productionQuiz } from '../pages/production'

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

/** All quiz arrays keyed by module — used for dynamic counting */
const ALL_QUIZZES: Record<ModuleKey, readonly { question: string }[]> = {
  workflows: workflowsQuiz,
  skills: skillsQuiz,
  agents: agentsQuiz,
  prompts: promptsQuiz,
  mcp: mcpQuiz,
  context: contextQuiz,
  tools: toolsQuiz,
  safety: safetyQuiz,
  projects: projectsQuiz,
  multiagent: multiagentQuiz,
  evaluation: evaluationQuiz,
  production: productionQuiz,
}

/** Total quiz questions across all modules — derived dynamically */
export const TOTAL_QUIZ_QUESTIONS = MODULE_KEYS.reduce(
  (sum, key) => sum + ALL_QUIZZES[key].length,
  0,
)

/** Display metadata for each module (used by profile progress cards) */
export const MODULE_META: Record<ModuleKey, { label: string; icon: string; href: string; sectionCount: number }> = {
  workflows:  { label: 'Workflows', icon: '🔄', href: '/learn/workflows', sectionCount: 7 },
  skills:     { label: 'Skills', icon: '🛠️', href: '/learn/skills', sectionCount: 7 },
  agents:     { label: 'Autonomous Agents', icon: '🤖', href: '/learn/agents', sectionCount: 7 },
  prompts:    { label: 'Prompt Engineering', icon: '✍️', href: '/learn/prompts', sectionCount: 7 },
  mcp:        { label: 'Model Context Protocol', icon: '🔌', href: '/learn/mcp', sectionCount: 7 },
  context:    { label: 'Context Windows', icon: '🧠', href: '/learn/context', sectionCount: 7 },
  tools:      { label: 'Tool Use & Function Calling', icon: '🛠️', href: '/learn/tools', sectionCount: 7 },
  safety:     { label: 'Safety & Guardrails', icon: '🛡️', href: '/learn/safety', sectionCount: 7 },
  projects:   { label: 'Real-World Projects', icon: '🚀', href: '/learn/projects', sectionCount: 7 },
  multiagent: { label: 'Multi-Agent Systems', icon: '🤝', href: '/learn/multiagent', sectionCount: 7 },
  evaluation: { label: 'Evaluation & Testing', icon: '🧪', href: '/learn/evaluation', sectionCount: 7 },
  production: { label: 'Production & Scaling', icon: '☁️', href: '/learn/production', sectionCount: 7 },
}

/** Total teaching sections across all modules — derived dynamically */
export const TOTAL_SECTIONS = MODULE_KEYS.reduce(
  (sum, key) => sum + MODULE_META[key].sectionCount,
  0,
)

