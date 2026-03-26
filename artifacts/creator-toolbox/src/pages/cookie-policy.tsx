import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Cookie } from "lucide-react";

const LAST_UPDATED = "March 26, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold font-display mb-4 text-foreground">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">{children}</div>
    </section>
  );
}

const COOKIE_TABLE = [
  { name: "_ga, _ga_*", provider: "Google Analytics", purpose: "Distinguishes users and tracks sessions for analytics reporting", type: "Analytics", duration: "2 years" },
  { name: "__gads, __gpi", provider: "Google AdSense", purpose: "Used to show Google ads on our site; tracks ad clicks and impressions", type: "Advertising", duration: "Up to 13 months" },
  { name: "IDE", provider: "Google (DoubleClick)", purpose: "Used by Google DoubleClick to register and report user actions after viewing/clicking ads", type: "Advertising", duration: "1 year" },
  { name: "CONSENT", provider: "Google", purpose: "Stores consent status for Google services", type: "Functional", duration: "2 years" },
  { name: "_session", provider: "creatorsToolHub", purpose: "Maintains session state for navigation and tool functionality", type: "Essential", duration: "Session" },
];

export default function CookiePolicy() {
  return (
    <Layout>
      <div className="bg-background">
        {/* Hero */}
        <section className="py-16 bg-primary/5 border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-5 border border-primary/20">
                <Cookie className="w-4 h-4" />
                <span>Transparency</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">Cookie Policy</h1>
              <p className="text-muted-foreground text-sm">Last updated: {LAST_UPDATED}</p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 max-w-3xl py-16">
          <div className="bg-card rounded-2xl border border-border/50 p-8 md:p-12">

            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              This Cookie Policy explains how creatorsToolHub ("we," "us," or "our"), accessible at <strong>creatorstoolhub.com</strong>, uses cookies and similar tracking technologies when you visit our platform. We believe in being transparent about how we collect data, so this document explains exactly which cookies we use, why we use them, and how you can manage your preferences.
            </p>

            <Section title="1. What Are Cookies?">
              <p>Cookies are small text files that are stored on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work efficiently, remember your preferences, and provide information to website owners about how their sites are used. Cookies do not contain executable code and cannot carry viruses.</p>
              <p>Similar technologies include web beacons (tiny images embedded in pages), pixels, and local storage — these serve similar purposes and are also covered by this Cookie Policy.</p>
            </Section>

            <Section title="2. Why We Use Cookies">
              <p>creatorsToolHub uses cookies for the following purposes:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li><strong>Essential operation:</strong> To ensure the website loads correctly and tools function as expected</li>
                <li><strong>Analytics:</strong> To understand how visitors use our free creator tools so we can improve the platform</li>
                <li><strong>Advertising:</strong> To display relevant ads via Google AdSense — the advertising revenue is how we fund the platform and keep all creator tools free</li>
                <li><strong>Preferences:</strong> To remember any settings or preferences you may have during a session</li>
              </ul>
            </Section>

            <Section title="3. Types of Cookies We Use">
              <div className="space-y-5 mt-2">
                <div className="p-5 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Essential Cookies</h3>
                  <p>These cookies are strictly necessary for creatorsToolHub to function. They enable core functionality such as page navigation, session management, and accessing secure areas. The website cannot function properly without these cookies, and they cannot be disabled.</p>
                </div>
                <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Analytics Cookies</h3>
                  <p>We use Google Analytics to collect anonymised information about how visitors interact with creatorsToolHub — which tools they use, how long they stay, which pages they visit, and where they came from. This helps us understand what's working and what needs improvement. The data collected is aggregated and does not identify individual users. Google Analytics sets cookies such as <code className="text-xs bg-muted px-1 py-0.5 rounded">_ga</code> and <code className="text-xs bg-muted px-1 py-0.5 rounded">_ga_*</code>.</p>
                </div>
                <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Advertising Cookies (Google AdSense)</h3>
                  <p>creatorsToolHub uses Google AdSense to display advertisements. This is how we fund the platform and keep every tool free for creators. Google AdSense uses cookies — including the DoubleClick cookie (<code className="text-xs bg-muted px-1 py-0.5 rounded">IDE</code>) and the <code className="text-xs bg-muted px-1 py-0.5 rounded">__gads</code> cookie — to serve personalised ads based on your browsing history across websites that use Google services.</p>
                  <p className="mt-2">Google may use the data collected through these cookies to show you ads that are relevant to your interests. This is called interest-based or personalised advertising. The information is processed in accordance with <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's Privacy Policy</a>.</p>
                </div>
              </div>
            </Section>

            <Section title="4. Cookie Reference Table">
              <p className="mb-4">Here is a summary of the main cookies used on creatorsToolHub:</p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Cookie Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Provider</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Purpose</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COOKIE_TABLE.map((row, i) => (
                      <tr key={i} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-foreground">{row.name}</td>
                        <td className="px-4 py-3">{row.provider}</td>
                        <td className="px-4 py-3 max-w-xs">{row.purpose}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                            row.type === "Essential" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" :
                            row.type === "Analytics" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                            row.type === "Advertising" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                            "bg-muted text-muted-foreground"
                          }`}>{row.type}</span>
                        </td>
                        <td className="px-4 py-3">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="5. Third-Party Cookies">
              <p>Some cookies on creatorsToolHub are placed by third-party services. We do not control how these third parties collect or use your data. Please review their own privacy and cookie policies for full details:</p>
              <ul className="list-disc list-inside mt-3 space-y-1 ml-2">
                <li><strong>Google Analytics:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy Policy</a></li>
                <li><strong>Google AdSense / DoubleClick:</strong> <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Advertising Policies</a></li>
              </ul>
            </Section>

            <Section title="6. Managing Your Cookie Preferences">
              <p>You have several options to manage or disable cookies:</p>
              <div className="space-y-4 mt-3">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                  <h3 className="font-semibold mb-2">Browser Settings</h3>
                  <p>Most web browsers allow you to control cookies through their settings. You can typically find these under Settings → Privacy → Cookies. You can choose to block all cookies, block only third-party cookies, or clear existing cookies. Note that blocking essential cookies may break parts of creatorsToolHub.</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                  <h3 className="font-semibold mb-2">Google Ad Personalisation</h3>
                  <p>You can opt out of personalised Google ads at any time by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's Ad Settings</a> or by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a>. You will still see ads, but they will not be personalised based on your browsing history.</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                  <h3 className="font-semibold mb-2">Industry Opt-Out Tools</h3>
                  <p>You can also manage interest-based advertising preferences through industry opt-out tools such as <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Digital Advertising Alliance (DAA)</a> or <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Your Online Choices (EU)</a>.</p>
                </div>
              </div>
            </Section>

            <Section title="7. Cookie Consent">
              <p>By continuing to use creatorsToolHub, you consent to our use of cookies as described in this Cookie Policy. If you do not agree to our use of cookies, you should adjust your browser settings accordingly or discontinue use of the platform. Please note that disabling certain cookies may affect the functionality of our free creator tools.</p>
            </Section>

            <Section title="8. Changes to This Cookie Policy">
              <p>We may update this Cookie Policy from time to time to reflect changes in the cookies we use or applicable regulations. When we make changes, we will update the "Last updated" date at the top of this page. We encourage you to review this policy periodically.</p>
            </Section>

            <Section title="9. Contact Us">
              <p>If you have any questions about our use of cookies, please contact us:</p>
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
