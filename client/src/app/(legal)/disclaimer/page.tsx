export default function Disclaimer() {
  return (
    <>
      <h1>Disclaimer</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. Not Affiliated with Meta</h2>
      <p>PagePilot is an independent third-party application. We are not endorsed, sponsored, affiliated with, or otherwise authorized by Meta Platforms, Inc., Facebook, Instagram, or WhatsApp. "Facebook" is a registered trademark of Meta Platforms, Inc.</p>

      <h2>2. API Limitations & Liability</h2>
      <p>Our platform relies entirely on the official Facebook Graph API. We cannot guarantee 100% uptime, as we are subject to Meta's server reliability, rate limits, and API policy changes. If Facebook changes its rules or revokes API access, our services may be interrupted, and we are not legally liable for any loss of business or data resulting from such events.</p>

      <h2>3. Earnings & Results Disclaimer</h2>
      <p>Any references to "increasing sales," "boosting engagement," or "scaling your business" are for illustrative purposes. We do not guarantee any specific financial results, increased conversion rates, or customer engagement levels from using our software.</p>

      <h2>4. Data Accuracy</h2>
      <p>While we strive to sync your messages and analytics accurately and in real-time, network delays and API throttling may occasionally cause data discrepancies. Always refer to your official Facebook Page Inbox for critical, time-sensitive communications.</p>
    </>
  );
}
