export default function CookiePolicy() {
  return (
    <>
      <h1>Cookie Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. What Are Cookies?</h2>
      <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide a better user experience.</p>

      <h2>2. How We Use Cookies</h2>
      <p>PagePilot uses cookies strictly for essential operational purposes:</p>
      <ul>
        <li><strong>Authentication:</strong> We use secure cookies to keep you logged in to your dashboard and manage your session via Supabase Authentication.</li>
        <li><strong>Security:</strong> To protect your account from unauthorized access and CSRF attacks.</li>
        <li><strong>Preferences:</strong> To remember local settings like your theme preferences or auto-sync toggles.</li>
      </ul>

      <h2>3. Third-Party Cookies</h2>
      <p>When you use our Facebook integration, Meta may place their own cookies in your browser to facilitate the secure OAuth login process. We do not control these cookies, and they are governed by Facebook's own Cookie Policy.</p>

      <h2>4. Managing Cookies</h2>
      <p>Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may not be able to use PagePilot, as essential authentication cookies are required to access the dashboard securely.</p>
    </>
  );
}
