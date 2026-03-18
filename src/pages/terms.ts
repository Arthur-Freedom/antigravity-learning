// ── Terms of Service Page ───────────────────────────────────────────────
// Standard terms of service for the Antigravity Learning platform.

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 40%, #C7D2FE 100%);">
      <div class="lesson-hero-content" style="color: var(--text-primary);">
        <span class="lesson-badge">Legal</span>
        <h1>Terms of Service</h1>
        <p>Please read these terms carefully before using the platform.</p>
      </div>
    </section>

    <section class="section" style="background: var(--bg-primary);">
      <div class="legal-container">

        <p class="legal-updated">Last updated: March 18, 2026</p>

        <div class="legal-section reveal-on-scroll">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using Antigravity Learning, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.</p>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>2. Description of Service</h2>
          <p>Antigravity Learning is a free, interactive educational platform that teaches AI agent development concepts through structured modules, quizzes, and hands-on projects. The platform includes features such as progress tracking, leaderboards, certificates, and community resources.</p>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>3. User Accounts</h2>
          <ul>
            <li>You must sign in with a valid Google account to access personalized features.</li>
            <li>You are responsible for maintaining the security of your account.</li>
            <li>You agree to provide accurate information and keep it up to date.</li>
            <li>One account per person. Do not create multiple accounts.</li>
          </ul>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the platform for any unlawful purpose.</li>
            <li>Attempt to manipulate the leaderboard, quiz scores, or progress data.</li>
            <li>Interfere with or disrupt the platform's infrastructure.</li>
            <li>Scrape, copy, or redistribute platform content without permission.</li>
            <li>Impersonate other users or misrepresent your identity.</li>
          </ul>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>5. Intellectual Property</h2>
          <p>All content on Antigravity Learning — including text, graphics, logos, code examples, and educational materials — is the property of Antigravity Learning or its content creators. You may use the educational content for personal learning purposes but may not republish or sell it.</p>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>6. Certificates</h2>
          <p>Certificates earned through the platform are issued for completing the learning curriculum. They represent completion of the coursework and are not accredited academic credentials.</p>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>7. Disclaimer of Warranties</h2>
          <p>The platform is provided <strong>"as is"</strong> without warranties of any kind, either express or implied. We do not guarantee that the platform will be available at all times, error-free, or that all content is accurate and up to date.</p>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>8. Limitation of Liability</h2>
          <p>Antigravity Learning shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.</p>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>9. Modifications</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitute acceptance of the new terms. Material changes will be communicated through the platform.</p>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>10. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time through your profile settings or by contacting us.</p>
        </div>

        <div class="legal-section reveal-on-scroll">
          <h2>11. Contact</h2>
          <p>If you have any questions about these terms, please reach out through the platform.</p>
        </div>

      </div>
    </section>
  `;
}

export function init(): void {
  // No interactive elements needed
}
