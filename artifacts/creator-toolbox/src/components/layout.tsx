import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Search, Sparkles, Youtube, Instagram, Type, Image as ImageIcon, Code, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
              <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-primary/10 p-2 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight">Creator<span className="text-primary">Toolbox</span></span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/category/youtube" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">YouTube</Link>
              <Link href="/category/tiktok" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">TikTok</Link>
              <Link href="/category/ai" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">AI Tools</Link>
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
                <Link href="/category/youtube" className="px-3 py-2 rounded-lg hover:bg-muted text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>YouTube Tools</Link>
                <Link href="/category/tiktok" className="px-3 py-2 rounded-lg hover:bg-muted text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>TikTok Tools</Link>
                <Link href="/category/ai" className="px-3 py-2 rounded-lg hover:bg-muted text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>AI Tools</Link>
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
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-primary p-2 rounded-lg text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-xl text-white tracking-tight">CreatorToolbox</span>
              </Link>
              <p className="text-muted-foreground/80 text-sm leading-relaxed max-w-xs">
                The ultimate collection of free tools for content creators, YouTubers, and influencers to grow their audience.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-white tracking-wide">Top Categories</h4>
              <ul className="space-y-3 text-sm text-muted-foreground/80">
                <li><Link href="/category/youtube" className="hover:text-white transition-colors flex items-center gap-2"><Youtube className="w-4 h-4"/> YouTube Tools</Link></li>
                <li><Link href="/category/tiktok" className="hover:text-white transition-colors flex items-center gap-2"><TrendingUp className="w-4 h-4"/> TikTok Tools</Link></li>
                <li><Link href="/category/instagram" className="hover:text-white transition-colors flex items-center gap-2"><Instagram className="w-4 h-4"/> Instagram Tools</Link></li>
                <li><Link href="/category/ai" className="hover:text-white transition-colors flex items-center gap-2"><Code className="w-4 h-4"/> AI Creator</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white tracking-wide">Other Tools</h4>
              <ul className="space-y-3 text-sm text-muted-foreground/80">
                <li><Link href="/category/image" className="hover:text-white transition-colors flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Image Resizer</Link></li>
                <li><Link href="/category/text" className="hover:text-white transition-colors flex items-center gap-2"><Type className="w-4 h-4"/> Text Formatters</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Creator Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white tracking-wide">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground/80">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground/60 text-sm">
              © {new Date().getFullYear()} Creator Toolbox. All rights reserved.
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
