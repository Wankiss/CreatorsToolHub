import { useState, useEffect } from "react";
import { X, Shield, BarChart2, Megaphone, ChevronDown, ChevronUp, Check, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  consentDate: string;
  version: string;
}

const CONSENT_KEY = "cth_cookie_consent";
const CONSENT_VERSION = "1.0";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(prefs: Omit<CookieConsent, "necessary" | "consentDate" | "version">): CookieConsent {
  const consent: CookieConsent = {
    necessary: true,
    analytics: prefs.analytics,
    advertising: prefs.advertising,
    consentDate: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  return consent;
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled = false, id }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; id: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        checked ? "bg-primary" : "bg-muted-foreground/30"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

// ─── Category Row ─────────────────────────────────────────────────────────────

interface CategoryRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  examples: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  id: string;
}

function CategoryRow({ icon, title, description, examples, checked, onChange, disabled, id }: CategoryRowProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{title}</span>
            {disabled && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">Always On</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <Toggle id={id} checked={checked} onChange={onChange} disabled={disabled} />
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground leading-relaxed mt-3">
            <span className="font-semibold text-foreground">Examples: </span>{examples}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Preferences Modal ────────────────────────────────────────────────────────

interface PreferencesModalProps {
  onSave: (prefs: { analytics: boolean; advertising: boolean }) => void;
  onClose: () => void;
  initial: { analytics: boolean; advertising: boolean };
}

function PreferencesModal({ onSave, onClose, initial }: PreferencesModalProps) {
  const [analytics, setAnalytics] = useState(initial.analytics);
  const [advertising, setAdvertising] = useState(initial.advertising);

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Cookie Preferences">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-foreground">Cookie Preferences</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Choose which cookies you allow. Necessary cookies are always enabled as they make the site work.
            You can change these settings at any time via the Cookie Policy page.
          </p>

          <CategoryRow
            id="toggle-necessary"
            icon={<Shield className="w-4 h-4" />}
            title="Necessary Cookies"
            description="Essential for the site to function. Cannot be disabled."
            examples="Session state, security tokens, cookie consent record."
            checked={true}
            onChange={() => {}}
            disabled
          />
          <CategoryRow
            id="toggle-analytics"
            icon={<BarChart2 className="w-4 h-4" />}
            title="Analytics Cookies"
            description="Help us understand how visitors use the site so we can improve it."
            examples="Google Analytics (page views, session duration, traffic sources)."
            checked={analytics}
            onChange={setAnalytics}
          />
          <CategoryRow
            id="toggle-advertising"
            icon={<Megaphone className="w-4 h-4" />}
            title="Advertising Cookies"
            description="Used to show you relevant ads and measure ad campaign effectiveness."
            examples="Google AdSense, DoubleClick/Google Ad Manager, interest-based advertising."
            checked={advertising}
            onChange={setAdvertising}
          />

          <p className="text-xs text-muted-foreground leading-relaxed pt-2">
            For more information, see our{" "}
            <Link href="/cookie-policy" className="text-primary hover:underline" onClick={onClose}>Cookie Policy</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-primary hover:underline" onClick={onClose}>Privacy Policy</Link>.
          </p>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex gap-3 rounded-b-2xl">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onSave({ analytics: false, advertising: false })}
          >
            Reject All
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={() => onSave({ analytics, advertising })}
          >
            <Check className="w-4 h-4" /> Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Banner ──────────────────────────────────────────────────────────────

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    const stored = getConsent();
    if (stored) {
      setConsent(stored);
    } else {
      // Small delay so it doesn't flash immediately on load
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAcceptAll = () => {
    const c = saveConsent({ analytics: true, advertising: true });
    setConsent(c);
    setVisible(false);
  };

  const handleRejectAll = () => {
    const c = saveConsent({ analytics: false, advertising: false });
    setConsent(c);
    setVisible(false);
  };

  const handleSavePreferences = (prefs: { analytics: boolean; advertising: boolean }) => {
    const c = saveConsent(prefs);
    setConsent(c);
    setShowPreferences(false);
    setVisible(false);
  };

  // Re-open preferences from cookie policy page (exposed via window)
  useEffect(() => {
    (window as unknown as Record<string, unknown>).openCookiePreferences = () => {
      const current = getConsent();
      setShowPreferences(true);
      if (!visible && !current) setVisible(true);
    };
    return () => {
      delete (window as unknown as Record<string, unknown>).openCookiePreferences;
    };
  }, [visible]);

  if (!visible && !showPreferences) return null;

  return (
    <>
      {/* Preferences modal */}
      {showPreferences && (
        <PreferencesModal
          initial={{ analytics: consent?.analytics ?? false, advertising: consent?.advertising ?? false }}
          onSave={handleSavePreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}

      {/* Main banner */}
      {visible && !showPreferences && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          aria-live="polite"
          className="fixed bottom-0 left-0 right-0 z-[9998] p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-500"
        >
          <div className="max-w-5xl mx-auto bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Icon + Text */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary mt-0.5">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-foreground text-base mb-1">We use cookies</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We use cookies to personalise content and ads, analyse site traffic, and provide social media features.
                      We also share information about your use of our site with our advertising partners (Google AdSense).
                      You can choose which cookies to allow below.{" "}
                      <Link href="/cookie-policy" className="text-primary hover:underline font-medium whitespace-nowrap">Cookie Policy</Link>
                      {" · "}
                      <Link href="/privacy" className="text-primary hover:underline font-medium whitespace-nowrap">Privacy Policy</Link>
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col xs:flex-row sm:flex-col gap-2 sm:min-w-[180px] shrink-0">
                  <Button
                    onClick={handleAcceptAll}
                    className="w-full gap-2 font-semibold"
                    size="sm"
                  >
                    <Check className="w-4 h-4" /> Accept All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowPreferences(true)}
                  >
                    <Settings className="w-3.5 h-3.5 mr-1.5" /> Manage Preferences
                  </Button>
                  <button
                    onClick={handleRejectAll}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center underline underline-offset-2"
                  >
                    Reject non-essential
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Hook to read consent in other components ─────────────────────────────────

export function useCookieConsent(): CookieConsent | null {
  const [consent, setConsent] = useState<CookieConsent | null>(getConsent);
  useEffect(() => {
    const handler = () => setConsent(getConsent());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  return consent;
}
