export default function RefundPolicy() {
  return (
    <>
      <h1>Refund Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. General Refund Policy</h2>
      <p>At PagePilot, we strive to ensure our customers are completely satisfied with our CRM platform. If you are not satisfied with your purchase, we offer a 14-day money-back guarantee on all new license purchases.</p>

      <h2>2. Conditions for Refund</h2>
      <p>To be eligible for a refund, the following conditions must be met:</p>
      <ul>
        <li>The refund request is submitted within 14 days of the original purchase date.</li>
        <li>You have not severely violated our Terms of Service or Facebook's API rules.</li>
      </ul>

      <h2>3. Non-Refundable Situations</h2>
      <p>We cannot issue refunds in the following scenarios:</p>
      <ul>
        <li>Requests made after the 14-day window has expired.</li>
        <li>Renewal charges for ongoing subscriptions (please cancel before your renewal date).</li>
        <li>Accounts that have been banned or terminated due to abuse or spam.</li>
      </ul>

      <h2>4. How to Request a Refund</h2>
      <p>To request a refund, please contact our support team at support@pagepilot.app with your License Key and purchase receipt. Refunds are generally processed within 5-7 business days to your original payment method.</p>
    </>
  );
}
