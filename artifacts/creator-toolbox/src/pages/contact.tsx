import { useState } from "react";
import { useCanonical } from "@/hooks/use-canonical";
import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Clock, HelpCircle, Sparkles, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TOPICS = [
  { icon: <HelpCircle className="w-5 h-5 text-primary" />, title: "Tool Support", desc: "Having trouble with a specific tool? Let us know and we'll help." },
  { icon: <Sparkles className="w-5 h-5 text-primary" />, title: "Feature Requests", desc: "Want to suggest a new free creator tool? We'd love to hear it." },
  { icon: <MessageSquare className="w-5 h-5 text-primary" />, title: "General Feedback", desc: "Enjoying the platform or spotted an issue? Tell us everything." },
  { icon: <Mail className="w-5 h-5 text-primary" />, title: "Business Inquiries", desc: "Partnership or advertising enquiries? Reach out via email." },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-background">
        {/* Hero */}
        <section className="py-20 bg-primary/5 border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
                <Mail className="w-4 h-4" />
                <span>We're here to help</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">Contact creatorsToolHub</h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Have a question, feedback, or a tool suggestion? We read every message and aim to respond within 48 hours. Don't hesitate to reach out — we're a real team and we genuinely care.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14">

              {/* Contact Topics */}
              <div>
                <h2 className="text-2xl font-display font-bold mb-8">How can we help?</h2>
                <div className="space-y-5">
                  {TOPICS.map(({ icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-4 p-5 rounded-2xl bg-muted/40 border border-border/40">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {icon}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{title}</h3>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Email Us Directly</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">For business inquiries, partnerships, or anything that doesn't fit the form:</p>
                  <a href="mailto:hello@creatorstoolhub.com" className="text-primary font-semibold hover:underline">
                    hello@creatorstoolhub.com
                  </a>
                </div>

                <div className="mt-5 p-5 rounded-2xl bg-muted/40 border border-border/40 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Response Time</p>
                    <p className="text-muted-foreground text-sm">We typically respond within 24–48 hours, Monday through Friday.</p>
                  </div>
                </div>

                <div className="mt-5 p-5 rounded-2xl bg-muted/40 border border-border/40 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Registered Address</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      creatorsToolHub<br />
                      Badore, Ajah<br />
                      Lagos State<br />
                      Nigeria
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-display font-bold mb-8">Send us a message</h2>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-16 px-8 bg-primary/5 rounded-2xl border border-primary/20"
                  >
                    <CheckCircle2 className="w-14 h-14 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-3">Message Received!</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Thanks for reaching out, {form.name.split(" ")[0]}. We'll get back to you at <strong>{form.email}</strong> within 48 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium mb-2">Your Name *</label>
                        <Input
                          placeholder="Jane Creator"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className="rounded-xl"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address *</label>
                        <Input
                          type="email"
                          placeholder="jane@example.com"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          className="rounded-xl"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <Input
                        placeholder="e.g. Feature request — YouTube Money Calculator"
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        className="rounded-xl"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Message *</label>
                      <textarea
                        placeholder="Tell us what's on your mind — the more detail the better..."
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        rows={6}
                        disabled={loading}
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none disabled:opacity-50"
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        {error}
                      </p>
                    )}

                    <Button type="submit" size="lg" className="w-full rounded-xl font-semibold" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                        </span>
                      ) : "Send Message"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      By submitting this form, you agree to our{" "}
                      <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
