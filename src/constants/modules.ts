// ── Module Registry (Single Source of Truth) ────────────────────────────
// Every page that needs the module list or count imports from here.
// When you add a new module, update this array and everything stays in sync.

import { quizQuestions as workflowsQuiz, SECTION_IDS as workflowsSections } from '../pages/workflows'
import { quizQuestions as skillsQuiz, SECTION_IDS as skillsSections } from '../pages/skills'
import { quizQuestions as agentsQuiz, SECTION_IDS as agentsSections } from '../pages/agents'
import { quizQuestions as promptsQuiz, SECTION_IDS as promptsSections } from '../pages/prompts'
import { quizQuestions as mcpQuiz, SECTION_IDS as mcpSections } from '../pages/mcp'
import { quizQuestions as contextQuiz, SECTION_IDS as contextSections } from '../pages/context'
import { quizQuestions as toolsQuiz, SECTION_IDS as toolsSections } from '../pages/tools'
import { quizQuestions as safetyQuiz, SECTION_IDS as safetySections } from '../pages/safety'
import { quizQuestions as projectsQuiz, SECTION_IDS as projectsSections } from '../pages/projects'
import { quizQuestions as multiagentQuiz, SECTION_IDS as multiagentSections } from '../pages/multiagent'
import { quizQuestions as evaluationQuiz, SECTION_IDS as evaluationSections } from '../pages/evaluation'
import { quizQuestions as productionQuiz, SECTION_IDS as productionSections } from '../pages/production'

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

/** All section ID arrays keyed by module — used for dynamic counting */
const ALL_SECTIONS: Record<ModuleKey, readonly string[]> = {
  workflows: workflowsSections,
  skills: skillsSections,
  agents: agentsSections,
  prompts: promptsSections,
  mcp: mcpSections,
  context: contextSections,
  tools: toolsSections,
  safety: safetySections,
  projects: projectsSections,
  multiagent: multiagentSections,
  evaluation: evaluationSections,
  production: productionSections,
}

/** Total teaching sections across all modules — derived dynamically */
export const TOTAL_SECTIONS = MODULE_KEYS.reduce(
  (sum, key) => sum + ALL_SECTIONS[key].length,
  0,
)

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
