export default function PrivacyPolicy() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Introduction</h2>
      <p>Welcome to PagePilot CRM ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and share information about you when you use our web application and services.</p>
      
      <h2>2. Information We Collect</h2>
      <p>We collect information you provide directly to us, including:</p>
      <ul>
        <li><strong>Account Information:</strong> Name, email address, password, and billing details.</li>
        <li><strong>Facebook Integration Data:</strong> When you connect your Facebook Pages, we collect the page metadata, access tokens, and messaging data strictly required to provide our CRM services. We never post on your behalf without your explicit action.</li>
        <li><strong>Usage Data:</strong> Information about your interactions with our dashboard.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use the collected information to:</p>
      <ul>
        <li>Provide, maintain, and improve our services.</li>
        <li>Process transactions and send related information (e.g., confirmations, invoices).</li>
        <li>Send technical notices, security alerts, and support messages.</li>
        <li>Comply with Facebook's Platform Terms and Developer Policies.</li>
      </ul>

      <h2>4. Data Sharing and Disclosure</h2>
      <p>We do not sell your personal data. We may share your information only in the following circumstances:</p>
      <ul>
        <li>With third-party vendors (like payment processors and cloud hosting providers) that need access to perform services for us.</li>
        <li>To comply with legal obligations or respond to lawful requests.</li>
        <li>To protect the rights, property, and safety of PagePilot, our users, and the public.</li>
      </ul>

      <h2>5. Data Retention & Deletion</h2>
      <p>We retain your data for as long as your account is active. You can request the complete deletion of your account and all associated Facebook connection data at any time by contacting support or using the disconnection tools in your settings.</p>

      <h2>6. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us at support@pagepilot.app.</p>
    </>
  );
}
