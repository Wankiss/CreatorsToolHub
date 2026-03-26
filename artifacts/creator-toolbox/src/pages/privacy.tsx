import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const LAST_UPDATED = "March 26, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold font-display mb-4 text-foreground">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">{children}</div>
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="font-semibold text-base text-foreground mb-2">{title}</h3>
      <div className="space-y-2 text-muted-foreground leading-relaxed text-sm">{children}</div>
    </div>
  );
}

export default function Privacy() {
  return (
    <Layout>
      <div className="bg-background">
        {/* Hero */}
        <section className="py-16 bg-primary/5 border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-5 border border-primary/20">
                <Shield className="w-4 h-4" />
                <span>Your privacy matters</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">Privacy Policy</h1>
              <p className="text-muted-foreground text-sm">Last updated: {LAST_UPDATED}</p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 max-w-3xl py-16">
          <div className="bg-card rounded-2xl border border-border/50 p-8 md:p-12">

            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Welcome to creatorsToolHub ("we," "our," or "us"), accessible at <strong>creatorstoolhub.com</strong>. This Privacy Policy explains how we collect, use, and protect information when you visit or use our platform — a hub of free AI-powered creator tools for YouTube, TikTok, and Instagram content creators. By using creatorsToolHub, you agree to the terms of this Privacy Policy.
            </p>

            <Section title="1. Information We Collect">
              <Sub title="1.1 Information You Provide Directly">
                <p>creatorsToolHub does not require you to create an account or provide personal information to use our free creator tools. However, if you contact us via our contact form or email, we may collect:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                  <li>Your name</li>
                  <li>Your email address</li>
                  <li>Any message content you send us</li>
                </ul>
                <p className="mt-2">This information is only used to respond to your enquiry and is never sold or shared with third parties for marketing purposes.</p>
              </Sub>
              <Sub title="1.2 Automatically Collected Information">
                <p>When you visit creatorstoolhub.com, certain information may be collected automatically by our systems and third-party services, including:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                  <li>IP address and approximate geographic location</li>
                  <li>Browser type and version</li>
                  <li>Device type (desktop, mobile, tablet)</li>
                  <li>Pages visited, time spent on page, and navigation patterns</li>
                  <li>Referring website (how you arrived at our site)</li>
                  <li>Search terms used on our platform</li>
                </ul>
              </Sub>
              <Sub title="1.3 Tool Input Data">
                <p>When you use our AI-powered creator tools (such as the YouTube script generator, TikTok content generator, or Midjourney prompt generator), the inputs you enter (e.g. topics, keywords, niche descriptions) are processed to generate outputs. We do not permanently store individual user inputs tied to personal identifiers. Inputs may be processed by our AI infrastructure to generate responses but are not retained for advertising profiling.</p>
              </Sub>
            </Section>

            <Section title="2. Cookies and Tracking Technologies">
              <p>creatorsToolHub uses cookies and similar tracking technologies to operate the website and display relevant advertising. A cookie is a small text file stored in your browser. We use the following types of cookies:</p>
              <Sub title="2.1 Essential Cookies">
                <p>These are necessary for the website to function correctly. They manage session state, navigation, and page rendering. You cannot opt out of these without disabling the site.</p>
              </Sub>
              <Sub title="2.2 Analytics Cookies">
                <p>We use Google Analytics to understand how visitors use creatorsToolHub. This helps us improve our free creator tools, understand which content performs well, and identify technical issues. Google Analytics collects data such as pages visited, session duration, and device type. This data is aggregated and anonymized. You can opt out of Google Analytics tracking by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a>.</p>
              </Sub>
              <Sub title="2.3 Advertising Cookies (Google AdSense)">
                <p>We use Google AdSense to display advertisements on creatorsToolHub. This is how we fund the platform and keep all tools free for creators. Google AdSense uses cookies — including the DoubleClick cookie — to serve ads based on your previous visits to our website and other sites on the internet.</p>
                <p className="mt-2">Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the internet. You may opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's Ads Settings</a> or <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">aboutads.info</a>.</p>
                <p className="mt-2">For more information about how Google uses data collected via AdSense, please visit: <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">How Google uses data when you use our partners' sites or apps</a>.</p>
              </Sub>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We use the information we collect for the following purposes:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>To provide, operate, and improve our free creator tools and platform</li>
                <li>To respond to messages, support requests, and feedback you send us</li>
                <li>To display advertising through Google AdSense (which funds our free tools)</li>
                <li>To analyse usage patterns and improve the user experience</li>
                <li>To detect and prevent technical errors, abuse, or malicious activity</li>
                <li>To comply with legal obligations</li>
              </ul>
              <p className="mt-3">We do <strong>not</strong> sell your personal data to third parties. We do not use your data for automated decision-making that significantly affects you.</p>
            </Section>

            <Section title="4. Third-Party Services">
              <p>creatorsToolHub uses the following third-party services that may collect data independently under their own privacy policies:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li><strong>Google Analytics</strong> — website traffic analytics (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy Policy</a>)</li>
                <li><strong>Google AdSense</strong> — advertising (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy Policy</a>)</li>
                <li><strong>Cloud infrastructure providers</strong> — hosting and processing</li>
              </ul>
              <p className="mt-3">We are not responsible for the privacy practices of third-party services. We encourage you to review their policies.</p>
            </Section>

            <Section title="5. Data Retention">
              <p>Contact form submissions and email communications are retained for up to 12 months, after which they are deleted. Analytics data is retained in accordance with Google Analytics' data retention settings (default: 14 months for aggregated data). We do not retain individual tool inputs beyond the session required to generate outputs.</p>
            </Section>

            <Section title="6. Your Rights">
              <p>Depending on your location, you may have the following rights regarding your data:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li><strong>Right to access</strong> — request a copy of data we hold about you</li>
                <li><strong>Right to deletion</strong> — request that we delete data we hold about you</li>
                <li><strong>Right to correction</strong> — request correction of inaccurate data</li>
                <li><strong>Right to object</strong> — object to certain processing of your data</li>
                <li><strong>Right to opt out of advertising</strong> — manage ad personalisation via Google's settings</li>
              </ul>
              <p className="mt-3">To exercise any of these rights, please contact us at <a href="mailto:hello@creatorstoolhub.com" className="text-primary hover:underline">hello@creatorstoolhub.com</a>.</p>
            </Section>

            <Section title="7. Children's Privacy">
              <p>creatorsToolHub is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.</p>
            </Section>

            <Section title="8. International Users">
              <p>creatorsToolHub is operated from and targeted primarily at users in the United States and globally. If you are accessing our platform from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States. By using our platform, you consent to this transfer.</p>
              <p className="mt-2">For users in the European Economic Area (EEA) and United Kingdom, we process data under the legal basis of legitimate interests (operating and improving our free creator tools platform) and, where applicable, consent (advertising cookies).</p>
            </Section>

            <Section title="9. Security">
              <p>We take reasonable technical and organisational measures to protect the information we hold. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security. We encourage you to exercise caution when submitting information online.</p>
            </Section>

            <Section title="10. Changes to This Privacy Policy">
              <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we do, we will update the "Last updated" date at the top of this page. We encourage you to review this policy periodically. Continued use of creatorsToolHub after any changes constitutes your acceptance of the updated policy.</p>
            </Section>

            <Section title="11. Contact Us">
              <p>If you have any questions about this Privacy Policy or how we handle your data, please contact us:</p>
              <div className="mt-3 p-4 rounded-xl bg-muted/40 border border-border/40">
                <p><strong>creatorsToolHub</strong></p>
                <p>Email: <a href="mailto:hello@creatorstoolhub.com" className="text-primary hover:underline">hello@creatorstoolhub.com</a></p>
                <p>Website: <a href="https://creatorstoolhub.com" className="text-primary hover:underline">creatorstoolhub.com</a></p>
              </div>
            </Section>

          </div>
        </div>
      </div>
    </Layout>
  );
}
