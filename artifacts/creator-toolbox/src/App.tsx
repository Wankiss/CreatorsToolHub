import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Lazy-load the cookie consent banner — it never shows until 800ms after mount,
// so deferring its parse/compile cost is safe and reduces initial TBT.
const CookieConsentBanner = lazy(() =>
  import("@/components/cookie-consent").then((m) => ({ default: m.CookieConsentBanner }))
);

const Home = lazy(() => import("@/pages/home"));
const CategoryPage = lazy(() => import("@/pages/category"));
const ToolPage = lazy(() => import("@/pages/tool"));
const Search = lazy(() => import("@/pages/search"));
const BlogList = lazy(() => import("@/pages/blog-list"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const AdminDashboard = lazy(() => import("@/pages/admin"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Disclaimer = lazy(() => import("@/pages/disclaimer"));
const CookiePolicy = lazy(() => import("@/pages/cookie-policy"));

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading" /></div>}>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={Search} />
        <Route path="/category/:slug" component={CategoryPage} />
        <Route path="/tools/:slug" component={ToolPage} />
        <Route path="/blog" component={BlogList} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/disclaimer" component={Disclaimer} />
        <Route path="/cookie-policy" component={CookiePolicy} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <Suspense fallback={null}>
          <CookieConsentBanner />
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
