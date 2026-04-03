import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Search, Youtube, Instagram, Code, TrendingUp, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchTools, TOOLS_INDEX, type ToolIndexEntry } from "@/lib/tools-index";

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

function getCategoryColor(categorySlug: string) {
  if (categorySlug.includes("youtube")) return "text-red-500";
  if (categorySlug.includes("tiktok")) return "text-pink-500";
  if (categorySlug.includes("instagram")) return "text-purple-500";
  return "text-blue-500";
}

interface SearchDropdownProps {
  query: string;
  onSelect: (slug: string) => void;
  onSubmit: () => void;
}

function SearchDropdown({ query, onSelect, onSubmit }: SearchDropdownProps) {
  const results = query.length >= 2 ? searchTools(query).slice(0, 6) : [];

  if (!results.length && query.length >= 2) {
    return (
      <div className="absolute top-full mt-2 left-0 right-0 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden">
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
          No tools found for "{query}"
        </div>
        <button
          onClick={onSubmit}
          className="w-full px-4 py-3 text-sm text-primary font-medium border-t border-border hover:bg-muted/50 transition-colors text-left flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search all tools for "{query}"
        </button>
      </div>
    );
  }

  if (!results.length) return null;

  return (
    <div className="absolute top-full mt-2 left-0 right-0 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden min-w-[320px]">
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border bg-muted/30">
        Tools
      </div>
      {results.map(tool => (
        <button
          key={tool.slug}
          onClick={() => onSelect(tool.slug)}
          className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3 group"
        >
          <span className="text-xl flex-shrink-0 w-8 text-center">{tool.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{tool.name}</div>
            <div className="text-xs text-muted-foreground truncate">{tool.desc}</div>
          </div>
          <span className={`text-xs font-medium flex-shrink-0 ${getCategoryColor(tool.categorySlug)}`}>{tool.category}</span>
        </button>
      ))}
      <button
        onClick={onSubmit}
        className="w-full px-4 py-3 text-sm text-primary font-medium border-t border-border hover:bg-muted/50 transition-colors text-left flex items-center gap-2"
      >
        <Search className="w-4 h-4" />
        View all results for "{query}"
      </button>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setShowMobileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      setShowMobileDropdown(false);
      setIsMobileMenuOpen(false);
      setLocation(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
    }
  };

  const handleSelectTool = (slug: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    setLocation(`/tools/${slug}`);
  };

  const handleMobileSelectTool = (slug: string) => {
    setShowMobileDropdown(false);
    setMobileSearchQuery("");
    setIsMobileMenuOpen(false);
    setLocation(`/tools/${slug}`);
  };

  const handleSubmitSearch = () => {
    if (searchQuery.trim()) {
      setShowDropdown(false);
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMobileSubmitSearch = () => {
    if (mobileSearchQuery.trim()) {
      setShowMobileDropdown(false);
      setIsMobileMenuOpen(false);
      setLocation(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20">
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

            {/* Desktop Search */}
            <div className="hidden md:flex items-center gap-4">
              <div ref={searchRef} className="relative">
                <form onSubmit={handleSearch} className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search tools..."
                    className="pl-9 w-[200px] lg:w-[260px] bg-background/50 border-muted focus-visible:ring-primary/20 rounded-full"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(e.target.value.length >= 2);
                    }}
                    onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                    onKeyDown={(e) => e.key === "Escape" && setShowDropdown(false)}
                    autoComplete="off"
                  />
                </form>
                {showDropdown && (
                  <SearchDropdown
                    query={searchQuery}
                    onSelect={handleSelectTool}
                    onSubmit={handleSubmitSearch}
                  />
                )}
              </div>
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
              <div ref={mobileSearchRef} className="relative mt-2">
                <form onSubmit={handleMobileSearch}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search tools..."
                    className="pl-9 w-full rounded-xl"
                    value={mobileSearchQuery}
                    onChange={(e) => {
                      setMobileSearchQuery(e.target.value);
                      setShowMobileDropdown(e.target.value.length >= 2);
                    }}
                    onFocus={() => mobileSearchQuery.length >= 2 && setShowMobileDropdown(true)}
                    onKeyDown={(e) => e.key === "Escape" && setShowMobileDropdown(false)}
                    autoComplete="off"
                  />
                </form>
                {showMobileDropdown && (
                  <SearchDropdown
                    query={mobileSearchQuery}
                    onSelect={handleMobileSelectTool}
                    onSubmit={handleMobileSubmitSearch}
                  />
                )}
              </div>
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
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground/60 text-sm">
              © {new Date().getFullYear()} creatorsToolHub — creatorstoolhub.com. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
