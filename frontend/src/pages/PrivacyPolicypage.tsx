import React from "react";

export default function PrivacyPolicyPage() {

  return (
    <div className="flex flex-col h-screen w-screen bg-white text-[#384071] font-sans">
      {/* Header */}
      <header className="flex flex-col items-center p-8 text-center text-[#677fb4] bg-[#f0f3ff] shrink-0">
        <h1 className="text-5xl font-bold">
          Privacy Policy
        </h1>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-base md:text-lg leading-relaxed">
            This document explains how user data is collected, stored, and utilized within the application.
          </p>

          <section className="space-y-4">
            <h2 className="text-3xl font-semibold mt-8">1. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Account details: name, email, and password.</li>
              <li>Profile information: avatar and user preferences.</li>
              <li>Usage data: game statistics, interactions, and session activity.</li>
              <li>Cookies and analytics used to monitor and improve application performance.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-semibold mt-8">2. Use of Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Authenticate and manage user accounts.</li>
              <li>Monitor and maintain application functionality.</li>
              <li>Analyze usage trends to improve the service.</li>
              <li>Support user interactions and in-app features.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-semibold mt-8">3. Data Storage and Security</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>User data is stored securely in the database.</li>
              <li>Passwords are hashed and salted for security.</li>
              <li>Access to personal data is restricted to authorized personnel only.</li>
              <li>Encryption and standard security practices are applied to protect data.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-semibold mt-8">4. Sharing and Disclosure</h2>
            <p>Personal data is not sold or rented. Data may be shared with:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Third-party services necessary for application functionality (e.g., analytics).</li>
              <li>Legal authorities if required by law.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-semibold mt-8">5. User Rights</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Access and update personal information as needed.</li>
              <li>Manage account settings and preferences.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-semibold mt-8">6. Policy Updates</h2>
            <p>This policy may be updated periodically. The latest version is available on this page.</p>
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