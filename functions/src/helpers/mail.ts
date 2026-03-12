// ── Email Helpers ───────────────────────────────────────────────────────
// Nodemailer transporter factory and branded email templates.

import * as nodemailer from "nodemailer";

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
// Congratulations Email
// ═══════════════════════════════════════════════════════════════════════

export function generateCongratulationsHtml(displayName: string): string {
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
          You've successfully completed all nine modules in the
          <strong>Antigravity Learning</strong> program:
        </p>

        <!-- Modules -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
          ${["Workflows", "Skills", "Autonomous Agents", "Prompt Engineering",
            "Context Windows", "Model Context Protocol", "Tool Use & Function Calling",
            "Safety & Guardrails", "Real-World Projects"].map(mod =>
            `<tr><td style="padding:10px 14px; background:#f0fdf4; border-radius:6px;">
              <span style="font-size:14px; color:#16a34a; font-weight:600;">✅ ${mod}</span>
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
              <a href="https://antigravity-learning.web.app/"
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
  return `🎓 Congratulations, ${displayName}!

You've completed all nine modules in the Antigravity Learning program:

  ✅ Workflows
  ✅ Skills
  ✅ Autonomous Agents
  ✅ Prompt Engineering
  ✅ Context Windows
  ✅ Model Context Protocol
  ✅ Tool Use & Function Calling
  ✅ Safety & Guardrails
  ✅ Real-World Projects

You can now download your completion certificate from the website:
https://antigravity-learning.web.app/

Click the 🎓 Certificate button in the navigation bar.

© ${new Date().getFullYear()} Antigravity Learning`;
}

// ═══════════════════════════════════════════════════════════════════════
// Welcome Email
// ═══════════════════════════════════════════════════════════════════════

export function generateWelcomeHtml(displayName: string): string {
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
          ${[
            ["📋", "Workflows", "Automate repetitive tasks with step-by-step recipes"],
            ["🧠", "Skills", "Give your agent permanent knowledge with SKILL.md files"],
            ["🤖", "Autonomous Agents", "Build agents that think, act, and observe"],
            ["✍️", "Prompt Engineering", "Master the art of effective AI prompts"],
            ["🪟", "Context Windows", "Understand token limits and memory management"],
            ["🔌", "MCP", "Connect agents to external tools via the open standard"],
            ["🔧", "Tool Use", "Discover how agents invoke functions and APIs"],
            ["🛡️", "Safety & Guardrails", "Build responsible AI with proper defenses"],
            ["🚀", "Real-World Projects", "Apply everything with hands-on capstone projects"],
          ].map(([icon, name, desc]) =>
            `<tr><td style="padding:10px 14px; background:#eff6ff; border-radius:6px;">
              <span style="font-size:14px; color:#2563eb; font-weight:600;">${icon} ${name}</span>
              <p style="font-size:13px; color:#5a6b7c; margin:4px 0 0;">${desc}</p>
            </td></tr><tr><td style="height:4px;"></td></tr>`
          ).join("")}
        </table>

        <p style="font-size:15px; color:#5a6b7c; line-height:1.7; margin:0 0 24px;">
          Complete all 9 modules to earn your <strong>completion certificate</strong>
          and join the leaderboard!
        </p>

        <!-- CTA Button -->
        <table cellspacing="0" cellpadding="0" style="margin:0 auto;">
          <tr>
            <td style="background:#283A4A; border-radius:6px;">
              <a href="https://antigravity-learning.web.app/learn/workflows"
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
  return `🚀 Welcome to Antigravity Learning, ${displayName}!

You've just joined a platform designed to teach you how to build and work with AI agents.

Here's what's waiting for you:

  📋 Module 1 — Workflows: Automate repetitive tasks
  🧠 Module 2 — Skills: Give your agent permanent knowledge
  🤖 Module 3 — Autonomous Agents: Build agents that think and act
  ✍️ Module 4 — Prompt Engineering: Master effective AI prompts
  🪟 Module 5 — Context Windows: Understand token limits
  🔌 Module 6 — MCP: Connect agents to external tools
  🔧 Module 7 — Tool Use: Invoke functions and APIs dynamically
  🛡️ Module 8 — Safety & Guardrails: Build responsible AI
  🚀 Module 9 — Real-World Projects: Hands-on capstone projects

Complete all 9 modules to earn your completion certificate!

Start here: https://antigravity-learning.web.app/learn/workflows

© ${new Date().getFullYear()} Antigravity Learning`;
}
