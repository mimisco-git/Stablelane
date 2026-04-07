import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

export default function PrivacyPage() {
  return (
    <div>
      <SiteNav />
      <main className="mx-auto w-[min(calc(100%-36px),780px)] py-24">
        <div className="mb-8">
          <Link href="/" className="text-[0.85rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors">
            ← Back to home
          </Link>
        </div>

        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
            <span className="block h-px w-4 bg-[var(--accent)]" />Legal
          </div>
          <h1 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,4vw,3.5rem)] leading-[0.98] tracking-[-0.05em] mb-4">
            Privacy Policy
          </h1>
          <p className="text-[0.9rem] text-[var(--muted)]">Last updated: April 2026</p>
        </div>

        <div className="grid gap-8 text-[0.95rem] leading-8 text-[var(--muted)]">
          {[
            {
              title: "What we collect",
              body: "Stablelane collects the email address you provide when signing up or joining the waitlist. If you connect a wallet, we store your wallet address to verify identity. We do not collect payment card details, government IDs, or sensitive personal information."
            },
            {
              title: "How we use your data",
              body: "Your email is used to create and manage your workspace account, send authentication links, and communicate product updates. Your wallet address is used solely for identity verification on Arc testnet. We do not sell, rent, or share your personal data with third parties for marketing purposes."
            },
            {
              title: "Cookies and storage",
              body: "Stablelane uses browser localStorage to store your access mode and wallet session state. We use cookies for authentication session management via Supabase. No third-party tracking cookies are used."
            },
            {
              title: "Third-party services",
              body: "We use Supabase for authentication and database storage, Vercel for hosting, and Arc Network for testnet blockchain operations. Each service operates under its own privacy policy. We use Google OAuth for sign-in, which is governed by Google's privacy policy."
            },
            {
              title: "Data retention",
              body: "We retain your account data for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us. Blockchain transactions on Arc are immutable and cannot be deleted."
            },
            {
              title: "Security",
              body: "We use industry-standard security practices including row-level security policies in Supabase, HTTPS encryption, and server-side wallet verification using signed messages. No private keys are ever stored or transmitted to our servers."
            },
            {
              title: "Your rights",
              body: "You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at the email below. For users in the EU, you have additional rights under GDPR including the right to data portability and the right to object to processing."
            },
            {
              title: "Contact",
              body: "For privacy-related questions or requests, contact us at the waitlist email address listed on the Stablelane homepage. We aim to respond within 5 business days."
            },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-[1.1rem] font-semibold text-[var(--text)]">{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
