// ── Privacy Policy Page ─────────────────────────────────────────────────
// Standard privacy policy for the Antigravity Learning platform.

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 40%, #C7D2FE 100%);">
      <div class="lesson-hero-content" style="color: var(--text-primary);">
        <span class="lesson-badge">Legal</span>
        <h1>Privacy Policy</h1>
        <p>How we collect, use, and protect your information.</p>
      </div>
    </section>

    <section class="section" style="background: var(--bg-primary);">
      <div class="legal-container">

        <p class="legal-updated">Last updated: March 18, 2026</p>

        <div class="legal-section reveal-on-scroll">
          <h2>1. Information We Collect</h2>
          <p>When you use Antigravity Learning, we may collect the following information:</p>
          <ul>
            <li><strong>Account Information</strong> — Your name, email address, and profile photo provided through Google Sign-In.</li>
            <li><strong>Learning Progress</strong> — Quiz scores, module completion status, and learning streaks.</li>
            <li><strong>Usage Data</strong> — Pages visited, features used, and general interaction patterns to improve the platform.</li>
            <li><strong>Device Information</strong> — Browser type, operating system, and screen resolution for compatibility purposes.</li>
          </ul>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain the learning platform and your personalized experience.</li>
            <li>Track and display your learning progress, achievements, and certificates.</li>
            <li>Power community features such as the leaderboard.</li>
            <li>Send optional re-engagement emails if you've been inactive (you can opt out at any time).</li>
            <li>Improve the platform based on aggregated usage patterns.</li>
          </ul>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>3. Data Storage & Security</h2>
          <p>Your data is stored securely using <strong>Google Firebase</strong> infrastructure, which provides enterprise-grade security including encryption at rest and in transit. We follow industry best practices to protect your personal information.</p>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Google Firebase</strong> — Authentication, database, and hosting.</li>
            <li><strong>Google Analytics</strong> — Anonymous usage statistics to improve the platform.</li>
          </ul>
          <p>These services have their own privacy policies. We encourage you to review them.</p>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong> your personal data at any time through your profile page.</li>
            <li><strong>Delete</strong> your account and all associated data by contacting us.</li>
            <li><strong>Opt out</strong> of non-essential communications.</li>
          </ul>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>6. Cookies</h2>
          <p>We use essential cookies for authentication and session management. No third-party advertising cookies are used on this platform.</p>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>7. Children's Privacy</h2>
          <p>Antigravity Learning is not directed at children under 13. We do not knowingly collect personal information from children under 13.</p>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>8. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify users of any material changes by posting the new policy on this page with an updated revision date.</p>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>9. Contact</h2>
          <p>If you have any questions about this privacy policy, please reach out through the platform.</p>
        </div>

      </div>
    </section>
  `;
}

export function init(): void {
  // No interactive elements needed
}
