import React from 'react';
import HelpDetailLayout from '../../HelpDetailLayout';
import Link from 'next/link';

export default function CommonIssuesPage() {
  return (
    <HelpDetailLayout 
      title="Troubleshooting Common Issues" 
      category="Troubleshooting"
    >
      <div className="prose max-w-none">
        <section id="overview">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Overview</h2>
          <p className="mb-4">
            This guide covers the most common issues Studio Six users encounter and provides straightforward solutions. If you're experiencing problems with the platform, you'll likely find a resolution here.
          </p>
        </section>

        <section id="getting-started" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Common Login Issues</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Forgotten Password</h3>
              <p className="mb-4">
                If you've forgotten your password:
              </p>
              <ol className="list-decimal pl-5 mb-4 space-y-2">
                <li>Click on "Forgot Password" on the login screen</li>
                <li>Enter the email address associated with your account</li>
                <li>Check your email for password reset instructions</li>
                <li>Follow the link and create a new password</li>
                <li>Log in with your new credentials</li>
              </ol>
              <p className="mb-4">
                If you don't receive the reset email within a few minutes, check your spam or junk folder.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Account Locked</h3>
              <p className="mb-4">
                Your account may be temporarily locked after multiple failed login attempts. Wait 30 minutes before trying again, or use the password reset option described above.
              </p>
            </div>
          </div>
        </section>

        <section id="step-by-step" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Rendering and Generation Issues</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Designs Not Generating</h3>
              <p className="mb-4">
                If your designs aren't generating:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Check that you have sufficient credits in your account</li>
                <li>Ensure your prompt is detailed enough (at least 20 words is recommended)</li>
                <li>Verify your internet connection is stable</li>
                <li>Try using a different browser or clearing your cache</li>
                <li>Reduce the complexity of your design request</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Poor Quality Results</h3>
              <p className="mb-4">
                If your generated designs aren't meeting your expectations:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Make your prompts more specific with details about materials, colors, and style</li>
                <li>Try increasing the resolution setting</li>
                <li>Include reference images when possible</li>
                <li>Experiment with different architectural styles in your prompt</li>
                <li>Break complex designs into simpler components</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Generation Takes Too Long</h3>
              <p className="mb-4">
                If generation is taking longer than expected:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Check that you have a stable internet connection</li>
                <li>Verify the platform status on our <Link href="/status" className="text-[#814ADA] hover:underline">status page</Link></li>
                <li>Consider lowering the resolution for faster results</li>
                <li>Try during off-peak hours when the system may be less busy</li>
                <li>Ensure your browser is up to date</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="tips-tricks" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Billing and Subscription Issues</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Payment Method Declined</h3>
              <p className="mb-4">
                If your payment method is declined:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Verify your card hasn't expired</li>
                <li>Ensure your billing address matches what's on file with your bank</li>
                <li>Contact your bank to authorize the transaction</li>
                <li>Try an alternative payment method</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Credits Not Adding to Account</h3>
              <p className="mb-4">
                If purchased credits aren't showing in your account:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Check that your payment was successfully processed</li>
                <li>Allow up to 15 minutes for credits to appear after purchase</li>
                <li>Log out and log back in to refresh your session</li>
                <li>Check your purchase history to verify the transaction</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Unexpected Charges</h3>
              <p className="mb-4">
                If you see unexpected charges:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Check your subscription status to verify your billing cycle</li>
                <li>Review your credit usage history for any unusual activity</li>
                <li>Verify no unauthorized users have access to your account</li>
                <li>Contact support with your transaction ID for assistance</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="related-articles" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Technical Problems</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Browser Compatibility</h3>
              <p className="mb-4">
                Studio Six works best with:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Chrome (latest 2 versions)</li>
                <li>Firefox (latest 2 versions)</li>
                <li>Safari (latest 2 versions)</li>
                <li>Edge (latest 2 versions)</li>
              </ul>
              <p className="mb-4">
                If you're experiencing issues, update your browser to the latest version.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Interface Not Loading Properly</h3>
              <p className="mb-4">
                Try these solutions:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Clear your browser cache and cookies</li>
                <li>Disable browser extensions that might interfere</li>
                <li>Check your internet connection</li>
                <li>Try loading the site in an incognito/private window</li>
              </ul>
            </div>

            <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3] mb-6">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-2">Still Having Issues?</h3>
              <p className="mb-4">
                If you've tried these solutions and are still experiencing problems, please contact our support team:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Email: <a href="mailto:support@studiosix.com" className="text-[#814ADA] hover:underline">support@studiosix.com</a></li>
                <li>Live Chat: Available 9am-5pm EST on weekdays</li>
                <li>Phone: +1 (555) 123-4567 (Premium support for Enterprise accounts)</li>
              </ul>
              <p>
                When contacting support, please include your account email, a description of the issue, and any error messages you're seeing.
              </p>
            </div>
          </div>
        </section>
      </div>
    </HelpDetailLayout>
  );
} 