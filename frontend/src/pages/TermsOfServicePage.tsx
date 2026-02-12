import React from "react";

export default function TermsOfServicePage() {

  return (
    <div className="flex flex-col min-h-screen w-full bg-white text-[#384071] font-sans">
      {/* Header */}
      <header className="flex flex-col items-center p-8 text-center text-[#677fb4] shrink-0 bg-[#f0f3ff]">
        {/* <button
          onClick={() => navigate(-1)}
          className="self-start mb-6 px-5 py-2 bg-[#677fb4] text-white font-medium rounded-lg shadow hover:bg-[#5562a3] transition-colors"
        >
          &larr; Back
        </button> */}
        <h1 className="text-5xl font-bold">Terms of Service</h1>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-base md:text-lg leading-relaxed">
            These Terms of Service govern your use of this application. By using the service, you agree to comply with these terms.
          </p>

          <section className="space-y-4">
            <h2 className="text-3xl font-semibold mt-8">1. Eligibility and Account Creation</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Users must be at least 13 years old to create an account.</li>
              <li>Each user is responsible for providing accurate account information.</li>
              <li>Accounts are for individual use only and must not be shared.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-semibold mt-8">2. User Conduct</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Respect other users and refrain from offensive or abusive behavior.</li>
              <li>Do not engage in cheating, exploiting bugs, or using unauthorized software.</li>
              <li>Any content you post must comply with applicable laws and not infringe on others’ rights.</li>
              <li>Harassment, spamming, or malicious activity is prohibited.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-semibold mt-8">3. Account Suspension and Termination</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Accounts may be suspended or terminated for violations of these Terms.</li>
              <li>Repeated misconduct or illegal activity can result in permanent account termination.</li>
              <li>The service reserves the right to remove accounts at its discretion.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-semibold mt-8">4. Liability</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>The application is provided "as-is" without warranties.</li>
              <li>Developers are not liable for downtime, bugs, or data loss.</li>
              <li>Users are responsible for the content they generate and share.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-semibold mt-8">5. Legal Disclaimers</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>These Terms are governed by applicable local laws.</li>
              <li>Any disputes will be resolved in accordance with the governing jurisdiction.</li>
              <li>Use of the service constitutes acceptance of all terms and conditions stated herein.</li>
            </ul>
          </section>

          {/* Footer */}
          <footer className="text-center py-8 text-pink-400 text-sm md:text-base">
            Last updated: February 2026
          </footer>
        </div>
      </main>
    </div>
  );
}
