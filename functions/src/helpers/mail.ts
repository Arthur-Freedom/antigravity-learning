// ── Email Helpers ───────────────────────────────────────────────────────
// Nodemailer transporter factory and branded email templates.

import * as nodemailer from "nodemailer";

export function getBaseUrl(): string {
  // GCLOUD_PROJECT is set automatically by the GCP/Firebase runtime — no config needed.
  // It equals the Firebase Project ID of the project the function is deployed to.
  // See: skills/firebase-environments/SKILL.md → "Dynamic URL Resolution Patterns"
  return process.env.GCLOUD_PROJECT === "antigravity-learning-dev"
    ? "https://antigravity-learning-dev.web.app"
    : "https://antigravity-learning.web.app";
}

export function getEnvironmentPrefix(): string {
  return process.env.GCLOUD_PROJECT === "antigravity-learning-dev"
    ? "[DEV] "
    : "";
}

// ═══════════════════════════════════════════════════════════════════════
// Transporter
// ═══════════════════════════════════════════════════════════════════════

export function createTransporter() {
  const email = process.env.SMTP_EMAIL;
  const password = process.env.SMTP_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SMTP_EMAIL and SMTP_PASSWORD must be set. " +
      "Use firebase functions:secrets:set to configure."
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: email, pass: password },
  });
}

// ═══════════════════════════════════════════════════════════════════════
// Shared Module List (all 12 modules)
// ═══════════════════════════════════════════════════════════════════════

export const ALL_MODULES = [
  { slug: "workflows", name: "Workflows", icon: "📋", desc: "Automate repetitive tasks with step-by-step recipes" },
  { slug: "skills", name: "Skills", icon: "🧠", desc: "Give your agent permanent knowledge with SKILL.md files" },
  { slug: "agents", name: "Autonomous Agents", icon: "🤖", desc: "Build agents that think, act, and observe" },
  { slug: "prompts", name: "Prompt Engineering", icon: "✍️", desc: "Master the art of effective AI prompts" },
  { slug: "context", name: "Context Windows", icon: "🪟", desc: "Understand token limits and memory management" },
  { slug: "mcp", name: "Model Context Protocol", icon: "🔌", desc: "Connect agents to external tools via the open standard" },
  { slug: "tools", name: "Tool Use & Function Calling", icon: "🔧", desc: "Discover how agents invoke functions and APIs" },
  { slug: "safety", name: "Safety & Guardrails", icon: "🛡️", desc: "Build responsible AI with proper defenses" },
  { slug: "projects", name: "Real-World Projects", icon: "🚀", desc: "Apply everything with hands-on capstone projects" },
  { slug: "multiagent", name: "Multi-Agent Systems", icon: "🤝", desc: "Orchestrate multiple agents working together" },
  { slug: "evaluation", name: "Evaluation & Testing", icon: "📊", desc: "Measure and benchmark AI agent outputs" },
  { slug: "production", name: "Production & Scaling", icon: "☁️", desc: "Ship with confidence — deployment and monitoring" },
] as const;

// ═══════════════════════════════════════════════════════════════════════
// Congratulations Email
// ═══════════════════════════════════════════════════════════════════════

export function generateCongratulationsHtml(displayName: string): string {
  const baseUrl = getBaseUrl();
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#f0f0f0; font-family:'Inter','Helvetica',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#283A4A 0%,#3178C6 100%); padding:40px 32px; text-align:center;">
        <h1 style="color:#fff; font-size:28px; margin:0 0 8px;">🎓 Congratulations!</h1>
        <p style="color:rgba(255,255,255,0.85); font-size:14px; margin:0;">You've completed all modules</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:32px;">
        <p style="font-size:16px; color:#283A4A; margin:0 0 16px;">
          Hey <strong>${displayName}</strong>,
        </p>
        <p style="font-size:15px; color:#5a6b7c; line-height:1.7; margin:0 0 20px;">
          You've successfully completed all ${ALL_MODULES.length} modules in the
          <strong>Antigravity Learning</strong> program:
        </p>

        <!-- Modules -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
          ${ALL_MODULES.map(mod =>
            `<tr><td style="padding:10px 14px; background:#f0fdf4; border-radius:6px;">
              <span style="font-size:14px; color:#16a34a; font-weight:600;">✅ ${mod.name}</span>
            </td></tr><tr><td style="height:4px;"></td></tr>`
          ).join("")}
        </table>

        <p style="font-size:15px; color:#5a6b7c; line-height:1.7; margin:0 0 24px;">
          You can now download your <strong>completion certificate</strong> from
          the website. Click the 🎓 Certificate button in the navigation bar.
        </p>

        <!-- CTA Button -->
        <table cellspacing="0" cellpadding="0" style="margin:0 auto;">
          <tr>
            <td style="background:#283A4A; border-radius:6px;">
              <a href="${baseUrl}/"
                 style="display:inline-block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:600; font-size:14px; letter-spacing:0.5px;">
                Download Certificate →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px 32px; background:#f8fafc; border-top:1px solid #e2e8f0; text-align:center;">
        <p style="font-size:12px; color:#94a3b8; margin:0;">
          © ${new Date().getFullYear()} Antigravity Learning · Built with ❤️ by AI agents
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateCongratulationsText(displayName: string): string {
  const baseUrl = getBaseUrl();
  const moduleList = ALL_MODULES.map(m => `  ✅ ${m.name}`).join("\n");
  return `🎓 Congratulations, ${displayName}!

You've completed all ${ALL_MODULES.length} modules in the Antigravity Learning program:

${moduleList}

You can now download your completion certificate from the website:
${baseUrl}/

Click the 🎓 Certificate button in the navigation bar.

© ${new Date().getFullYear()} Antigravity Learning`;
}

// ═══════════════════════════════════════════════════════════════════════
// Welcome Email
// ═══════════════════════════════════════════════════════════════════════

export function generateWelcomeHtml(displayName: string): string {
  const baseUrl = getBaseUrl();
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#f0f0f0; font-family:'Inter','Helvetica',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#283A4A 0%,#3178C6 100%); padding:40px 32px; text-align:center;">
        <h1 style="color:#fff; font-size:28px; margin:0 0 8px;">🚀 Welcome aboard!</h1>
        <p style="color:rgba(255,255,255,0.85); font-size:14px; margin:0;">Your learning journey starts now</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:32px;">
        <p style="font-size:16px; color:#283A4A; margin:0 0 16px;">
          Hey <strong>${displayName}</strong>,
        </p>
        <p style="font-size:15px; color:#5a6b7c; line-height:1.7; margin:0 0 20px;">
          Welcome to <strong>Antigravity Learning</strong>! You've just joined a platform
          designed to teach you how to build and work with AI agents.
        </p>

        <p style="font-size:15px; color:#5a6b7c; line-height:1.7; margin:0 0 8px;">Here's what's waiting for you:</p>

        <!-- Modules -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
          ${ALL_MODULES.map(mod =>
            `<tr><td style="padding:10px 14px; background:#eff6ff; border-radius:6px;">
              <span style="font-size:14px; color:#2563eb; font-weight:600;">${mod.icon} ${mod.name}</span>
              <p style="font-size:13px; color:#5a6b7c; margin:4px 0 0;">${mod.desc}</p>
            </td></tr><tr><td style="height:4px;"></td></tr>`
          ).join("")}
        </table>

        <p style="font-size:15px; color:#5a6b7c; line-height:1.7; margin:0 0 24px;">
          Complete all ${ALL_MODULES.length} modules to earn your <strong>completion certificate</strong>
          and join the leaderboard!
        </p>

        <!-- CTA Button -->
        <table cellspacing="0" cellpadding="0" style="margin:0 auto;">
          <tr>
            <td style="background:#283A4A; border-radius:6px;">
              <a href="${baseUrl}/learn/workflows"
                 style="display:inline-block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:600; font-size:14px; letter-spacing:0.5px;">
                Start Module 1 →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px 32px; background:#f8fafc; border-top:1px solid #e2e8f0; text-align:center;">
        <p style="font-size:12px; color:#94a3b8; margin:0;">
          © ${new Date().getFullYear()} Antigravity Learning · Built with ❤️ by AI agents
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateWelcomeText(displayName: string): string {
  const baseUrl = getBaseUrl();
  const moduleList = ALL_MODULES.map((m, i) => `  ${m.icon} Module ${i + 1} — ${m.name}: ${m.desc}`).join("\n");
  return `🚀 Welcome to Antigravity Learning, ${displayName}!

You've just joined a platform designed to teach you how to build and work with AI agents.

Here's what's waiting for you:

${moduleList}

Complete all ${ALL_MODULES.length} modules to earn your completion certificate!

Start here: ${baseUrl}/learn/workflows

© ${new Date().getFullYear()} Antigravity Learning`;
}

// ═══════════════════════════════════════════════════════════════════════
// Nudge / Re-engagement Email
// ═══════════════════════════════════════════════════════════════════════

export function generateNudgeHtml(
  displayName: string,
  completedCount: number,
  nextModuleSlug: string,
  nextModuleName: string,
): string {
  const baseUrl = getBaseUrl();
  const total = ALL_MODULES.length;
  const pct = Math.round((completedCount / total) * 100);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#f0f0f0; font-family:'Inter','Helvetica',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#283A4A 0%,#3178C6 100%); padding:40px 32px; text-align:center;">
        <h1 style="color:#fff; font-size:28px; margin:0 0 8px;">🔥 Keep Your Streak Alive!</h1>
        <p style="color:rgba(255,255,255,0.85); font-size:14px; margin:0;">You're making great progress</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:32px;">
        <p style="font-size:16px; color:#283A4A; margin:0 0 16px;">
          Hey <strong>${displayName}</strong>,
        </p>
        <p style="font-size:15px; color:#5a6b7c; line-height:1.7; margin:0 0 20px;">
          You've completed <strong>${completedCount} of ${total}</strong> modules
          in Antigravity Learning — that's <strong>${pct}%</strong> of the way there!
        </p>

        <!-- Progress Bar -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
          <tr>
            <td style="background:#e2e8f0; border-radius:999px; height:12px; padding:0;">
              <div style="background:linear-gradient(90deg,#3178C6,#60a5fa); width:${pct}%; height:12px; border-radius:999px;"></div>
            </td>
          </tr>
          <tr>
            <td style="text-align:center; padding-top:8px;">
              <span style="font-size:13px; color:#94a3b8;">${completedCount} / ${total} modules completed</span>
            </td>
          </tr>
        </table>

        <p style="font-size:15px; color:#5a6b7c; line-height:1.7; margin:0 0 24px;">
          Your next module is <strong>${nextModuleName}</strong>.
          Pick up right where you left off — it only takes about 10 minutes! 🚀
        </p>

        <!-- CTA Button -->
        <table cellspacing="0" cellpadding="0" style="margin:0 auto;">
          <tr>
            <td style="background:#283A4A; border-radius:6px;">
              <a href="${baseUrl}/learn/${nextModuleSlug}"
                 style="display:inline-block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:600; font-size:14px; letter-spacing:0.5px;">
                Continue Learning →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px 32px; background:#f8fafc; border-top:1px solid #e2e8f0; text-align:center;">
        <p style="font-size:12px; color:#94a3b8; margin:0;">
          © ${new Date().getFullYear()} Antigravity Learning · Built with ❤️ by AI agents
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateNudgeText(
  displayName: string,
  completedCount: number,
  nextModuleSlug: string,
  nextModuleName: string,
): string {
  const baseUrl = getBaseUrl();
  const total = ALL_MODULES.length;
  return `🔥 Hey ${displayName}, keep your streak alive!

You've completed ${completedCount} of ${total} modules in Antigravity Learning.

Your next module is: ${nextModuleName}
Pick up where you left off — it only takes ~10 minutes!

Continue here: ${baseUrl}/learn/${nextModuleSlug}

© ${new Date().getFullYear()} Antigravity Learning`;
}
