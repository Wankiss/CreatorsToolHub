import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Search, Youtube, Instagram, Code, TrendingUp, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function BrandLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="creatorsToolHub logo"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M16 5L19.5 12.2L27.5 13.4L21.75 19L23.2 27L16 23.2L8.8 27L10.25 19L4.5 13.4L12.5 12.2L16 5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="4" fill="white" fillOpacity="0.9" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20">
      {/* Header Ad Slot */}
      <div className="w-full bg-muted/30 py-4 border-b border-border hidden md:block">
        <div className="container mx-auto px-4 max-w-7xl flex justify-center">
          <div className="adsense-placeholder w-[728px] h-[90px]" />
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full glass-effect border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="text-primary group-hover:scale-110 transition-transform duration-300">
                  <BrandLogo size={32} />
                </div>
                <span className="font-display font-bold text-xl tracking-tight">creators<span className="text-primary">ToolHub</span></span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/category/youtube-tools" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">YouTube</Link>
              <Link href="/category/tiktok-tools" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">TikTok</Link>
              <Link href="/category/instagram-tools" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Instagram</Link>
              <Link href="/category/ai-creator-tools" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">AI Tools</Link>
              <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Blog</Link>
            </nav>

            {/* Desktop Search & Actions */}
            <div className="hidden md:flex items-center gap-4">
              <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  type="search" 
                  placeholder="Search tools..." 
                  className="pl-9 w-[200px] lg:w-[250px] bg-background/50 border-muted focus-visible:ring-primary/20 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-foreground hover:bg-muted focus:outline-none transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-effect border-b border-border absolute w-full left-0 animate-in slide-in-from-top-2">
            <div className="px-4 pt-2 pb-6 space-y-4">
              <form onSubmit={handleSearch} className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search tools..." 
                  className="pl-9 w-full rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <div className="flex flex-col space-y-3 pt-2">
                <Link href="/category/youtube-tools" className="px-3 py-2 rounded-lg hover:bg-muted text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>YouTube Tools</Link>
                <Link href="/category/tiktok-tools" className="px-3 py-2 rounded-lg hover:bg-muted text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>TikTok Tools</Link>
                <Link href="/category/instagram-tools" className="px-3 py-2 rounded-lg hover:bg-muted text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>Instagram Tools</Link>
                <Link href="/category/ai-creator-tools" className="px-3 py-2 rounded-lg hover:bg-muted text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>AI Creator Tools</Link>
                <Link href="/blog" className="px-3 py-2 rounded-lg hover:bg-muted text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>Creator Blog</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full relative">
        {children}
      </main>

      <footer className="bg-foreground text-background mt-auto py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="text-primary">
                  <BrandLogo size={28} />
                </div>
                <span className="font-display font-bold text-xl text-white tracking-tight">creators<span className="text-primary">ToolHub</span></span>
              </Link>
              <p className="text-muted-foreground/80 text-sm leading-relaxed max-w-xs">
                The ultimate hub of free AI-powered tools for content creators, YouTubers, TikTokers, and influencers. Grow your audience at creatorstoolhub.com.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-white tracking-wide">Top Categories</h4>
              <ul className="space-y-3 text-sm text-muted-foreground/80">
                <li><Link href="/category/youtube-tools" className="hover:text-white transition-colors flex items-center gap-2"><Youtube className="w-4 h-4"/> YouTube Tools</Link></li>
                <li><Link href="/category/tiktok-tools" className="hover:text-white transition-colors flex items-center gap-2"><TrendingUp className="w-4 h-4"/> TikTok Tools</Link></li>
                <li><Link href="/category/instagram-tools" className="hover:text-white transition-colors flex items-center gap-2"><Instagram className="w-4 h-4"/> Instagram Tools</Link></li>
                <li><Link href="/category/ai-creator-tools" className="hover:text-white transition-colors flex items-center gap-2"><Zap className="w-4 h-4"/> AI Creator Tools</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white tracking-wide">Popular Tools</h4>
              <ul className="space-y-3 text-sm text-muted-foreground/80">
                <li><Link href="/tools/youtube-title-generator" className="hover:text-white transition-colors">YouTube Title Generator</Link></li>
                <li><Link href="/tools/tiktok-viral-idea-generator" className="hover:text-white transition-colors">TikTok Viral Ideas</Link></li>
                <li><Link href="/tools/ai-prompt-generator" className="hover:text-white transition-colors">AI Prompt Generator</Link></li>
                <li><Link href="/tools/midjourney-prompt-generator" className="hover:text-white transition-colors">Midjourney Prompts</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors flex items-center gap-2"><BookOpen className="w-4 h-4"/> Creator Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white tracking-wide">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground/80">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
                <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">Admin</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground/60 text-sm">
              © {new Date().getFullYear()} creatorsToolHub — creatorstoolhub.com. All rights reserved.
            </p>
            {/* Footer Ad Slot */}
            <div className="w-full md:w-auto overflow-hidden rounded-lg">
               <div className="adsense-placeholder w-[320px] h-[50px] md:w-[728px] md:h-[90px] border-white/10 text-white/30" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
