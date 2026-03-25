import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Play, Copy, Check, ChevronDown, Sparkles, RefreshCw,
  TrendingUp, Zap, Shield, ListChecks, Search, Target,
  BookOpen, Heart, Megaphone, Star, Images, Radio,
  Lightbulb, Users, Clock, BarChart2, Flame, Film,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche =
  | "fitness" | "beauty" | "business" | "finance" | "tech"
  | "education" | "food" | "travel" | "lifestyle" | "fashion"
  | "relationships" | "health" | "coaching" | "photography" | "other";

type Pillar = "education" | "entertainment" | "personal" | "promotion" | "inspiration" | "tips" | "behindscenes" | "motivation";
type GoalOption = "growth" | "engagement" | "sales" | "authority";
type StyleOption = "educational" | "entertaining" | "personalbrand" | "storytelling" | "mixed";
type ExperienceOption = "beginner" | "intermediate" | "advanced";
type ToneOption = "bold" | "relatable" | "inspirational" | "funny" | "controversial";

type ReelFormat =
  | "Talking Head"
  | "B-Roll + Text Overlay"
  | "POV / Skit"
  | "Before & After"
  | "Tutorial / Demo"
  | "Storytime"
  | "Myth-Busting"
  | "Mistake Callout"
  | "List / Tips";

interface ReelIdea {
  id: number;
  title: string;
  angle: string;
  hook: string;
  format: ReelFormat;
  audience: string;
  goal: string;
  pillar: Pillar;
  filmingTip: string;
}

// ─── Meta maps ────────────────────────────────────────────────────────────────

const PILLAR_META: Record<Pillar, { label: string; color: string }> = {
  education:    { label: "Education",     color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" },
  entertainment:{ label: "Entertainment", color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800" },
  personal:     { label: "Personal",      color: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800" },
  promotion:    { label: "Promotion",     color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800" },
  inspiration:  { label: "Inspiration",   color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800" },
  tips:         { label: "Tips & Hacks",  color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" },
  behindscenes: { label: "Behind Scenes", color: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800" },
  motivation:   { label: "Motivation",    color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" },
};

const FORMAT_META: Record<ReelFormat, { icon: React.ReactNode; color: string }> = {
  "Talking Head":         { icon: <Users className="w-3 h-3" />,    color: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400" },
  "B-Roll + Text Overlay":{ icon: <Film className="w-3 h-3" />,     color: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400" },
  "POV / Skit":           { icon: <Radio className="w-3 h-3" />,    color: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400" },
  "Before & After":       { icon: <Images className="w-3 h-3" />,   color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" },
  "Tutorial / Demo":      { icon: <Play className="w-3 h-3" />,     color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400" },
  "Storytime":            { icon: <Heart className="w-3 h-3" />,    color: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400" },
  "Myth-Busting":         { icon: <Zap className="w-3 h-3" />,      color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400" },
  "Mistake Callout":      { icon: <Flame className="w-3 h-3" />,    color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400" },
  "List / Tips":          { icon: <ListChecks className="w-3 h-3" />, color: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400" },
};

const GOAL_META: Record<string, string> = {
  "Reach":       "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400",
  "Engagement":  "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  "Saves":       "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
  "Sales":       "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
  "Authority":   "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
};

// ─── Idea Banks ───────────────────────────────────────────────────────────────

interface IdeaTemplate {
  title: string; angle: string; hook: string; format: ReelFormat;
  audience: string; goal: string; pillar: Pillar; filmingTip: string;
}

const IDEA_BANK: Record<Niche, IdeaTemplate[]> = {
  fitness: [
    { title: "Why your workouts aren't working", angle: "Mistake callout — people train hard but wrong", hook: "You're wasting your workouts doing this", format: "Talking Head", audience: "Beginners struggling to see results", goal: "Reach", pillar: "education", filmingTip: "Film straight to camera, use 3 text overlays for the 3 mistakes" },
    { title: "10-minute fat loss routine anyone can do", angle: "Quick win for time-constrained people", hook: "No time? Do this instead", format: "Tutorial / Demo", audience: "Busy professionals and parents", goal: "Saves", pillar: "tips", filmingTip: "Film each exercise as a separate clip, add movement titles in editing" },
    { title: "Dieting expectations vs reality", angle: "Relatable humor about what people think vs truth", hook: "What people think a diet looks like vs reality", format: "POV / Skit", audience: "People who've tried and quit dieting", goal: "Engagement", pillar: "entertainment", filmingTip: "Two clips side-by-side or cut between 'expectation' and 'reality' scenes" },
    { title: "I tracked my progress for 365 days", angle: "Transformation story with real data", hook: "365 days of tracking every workout — here's what happened", format: "Before & After", audience: "People considering starting a fitness journey", goal: "Reach", pillar: "personal", filmingTip: "Side-by-side photos with monthly milestones annotated on screen" },
    { title: "3 reasons you're not losing weight", angle: "Myth-busting calorie/exercise myths", hook: "It's not your metabolism — it's this", format: "Myth-Busting", audience: "People plateaued on their weight loss journey", goal: "Saves", pillar: "education", filmingTip: "Talking head with numbered text overlays for each myth" },
    { title: "The workout split nobody recommends (but works)", angle: "Contrarian take on standard push/pull/legs advice", hook: "Personal trainers won't tell you this split exists", format: "Talking Head", audience: "Intermediate gym-goers tired of no progress", goal: "Engagement", pillar: "tips", filmingTip: "Film at gym, show program structure on whiteboard or phone screen" },
    { title: "My meal prep in under 60 minutes", angle: "Practical Sunday meal prep full walk-through", hook: "I prep 5 days of food in exactly one hour — here's how", format: "Tutorial / Demo", audience: "Busy adults wanting to eat healthy", goal: "Saves", pillar: "tips", filmingTip: "Time-lapse with cuts, show final containers lined up at end" },
    { title: "The day I almost quit my fitness journey", angle: "Vulnerable story of a real low point", hook: "I was 3 weeks from giving up. Then this happened", format: "Storytime", audience: "Anyone in the messy middle of a fitness journey", goal: "Engagement", pillar: "personal", filmingTip: "Calm talking-head, single location, no cuts — raw and honest" },
    { title: "5 fitness myths people still believe in 2025", angle: "Education-entertainment hybrid", hook: "Stop believing this fitness advice — it's making you worse", format: "List / Tips", audience: "General fitness audience", goal: "Reach", pillar: "education", filmingTip: "Quick cuts between each myth, counter each with text overlay" },
    { title: "Behind the scenes of a client transformation", angle: "Social proof through documented process", hook: "Here's what 12 weeks of consistent training actually looks like", format: "B-Roll + Text Overlay", audience: "People considering coaching or a program", goal: "Sales", pillar: "promotion", filmingTip: "Compile client check-in clips, overlay weekly stats as text" },
    { title: "POV: You started working out 6 months ago", angle: "Relatable progression arc from beginner to consistent", hook: "POV: 6 months ago you couldn't do 10 push-ups", format: "POV / Skit", audience: "People in the early stages of fitness", goal: "Engagement", pillar: "motivation", filmingTip: "Caption-style text on black background, then cut to workout footage" },
    { title: "The 2-minute morning habit that changed my body", angle: "Micro-habit with outsized impact", hook: "I do this for 2 minutes every morning. My body changed", format: "Talking Head", audience: "People wanting results without major lifestyle overhaul", goal: "Saves", pillar: "motivation", filmingTip: "Morning window light, film the habit live, explain benefits directly" },
    { title: "What nobody shows you about getting in shape", angle: "Hidden truth about the unglamorous side of fitness", hook: "Nobody posts this part of getting fit", format: "B-Roll + Text Overlay", audience: "People who compare themselves to highlight reels", goal: "Reach", pillar: "personal", filmingTip: "Genuine struggle moments — tired face, sweat, failed reps" },
    { title: "Rating the most popular workout plans on Instagram", angle: "Entertainment and authority combined", hook: "I ranked every viral workout plan. The results are surprising", format: "List / Tips", audience: "People confused by conflicting fitness content", goal: "Engagement", pillar: "entertainment", filmingTip: "Screen record each plan, add animated rating overlays" },
    { title: "How I lost fat without cardio", angle: "Contrarian training approach with personal results", hook: "I haven't done cardio in 6 months. Here's what happened", format: "Before & After", audience: "People who hate cardio but want fat loss", goal: "Reach", pillar: "inspiration", filmingTip: "Start with the before, narrate the process, reveal the result" },
  ],
  business: [
    { title: "The business mistake that cost me $10K", angle: "Honest mistake callout with lesson", hook: "I made this mistake and it cost me $10K. Don't repeat it", format: "Storytime", audience: "Early-stage entrepreneurs", goal: "Engagement", pillar: "personal", filmingTip: "Talking head, calm background, be specific about the number and what happened" },
    { title: "How I got my first 10 clients with no audience", angle: "Actionable strategy most people skip", hook: "No audience, no ads, no connections — 10 clients in 30 days", format: "Talking Head", audience: "People launching a service business", goal: "Saves", pillar: "tips", filmingTip: "Film direct-to-camera, number each strategy with text overlay" },
    { title: "5 tools I use to run my business solo", angle: "Practical tech stack for solopreneurs", hook: "I run a 6-figure business alone with these 5 tools", format: "List / Tips", audience: "Solopreneurs and freelancers", goal: "Saves", pillar: "tips", filmingTip: "Screen record each tool in action, quick cuts of key features" },
    { title: "The truth about passive income nobody says", angle: "Myth-busting the passive income fantasy", hook: "Passive income is not passive — here's the real version", format: "Myth-Busting", audience: "People attracted to passive income concepts", goal: "Engagement", pillar: "education", filmingTip: "Talking head with intensity — this is a strong opinion piece" },
    { title: "My first year revenue — the honest breakdown", angle: "Transparent behind-the-scenes of real numbers", hook: "Year 1 revenue: $47K. Here's every honest detail", format: "B-Roll + Text Overlay", audience: "Aspiring entrepreneurs researching realistic expectations", goal: "Reach", pillar: "personal", filmingTip: "Overlay monthly revenue bars on screen, narrate what drove each month" },
    { title: "3 pricing mistakes killing your business", angle: "Mistake callout on undercharging patterns", hook: "Your prices are probably wrong and here's how I know", format: "Mistake Callout", audience: "Service providers and freelancers undercharging", goal: "Saves", pillar: "education", filmingTip: "Numbered overlays on each mistake, concrete examples of what to do instead" },
    { title: "The email that closed $5K in 24 hours", angle: "Behind-the-scenes of a specific sales sequence", hook: "This one email made $5K in 24 hours — I'm showing you it", format: "Tutorial / Demo", audience: "Business owners with an email list", goal: "Sales", pillar: "promotion", filmingTip: "Screen share the actual email (anonymized), walk through each element" },
    { title: "Day in the life of a 6-figure solopreneur", angle: "Reality behind the aesthetic entrepreneur life", hook: "My actual workday — not the LinkedIn version", format: "B-Roll + Text Overlay", audience: "Aspiring online business owners", goal: "Reach", pillar: "behindscenes", filmingTip: "Time-stamped morning-to-evening clips, honest captions on each moment" },
    { title: "POV: You just sent your first invoice", angle: "Relatable milestone for new business owners", hook: "POV: You sent your first invoice and now you're panicking", format: "POV / Skit", audience: "New freelancers and service businesses", goal: "Engagement", pillar: "entertainment", filmingTip: "Text-on-screen POV format, relatable anxiety moments" },
    { title: "How to get clients from Instagram without ads", angle: "Organic lead generation strategy", hook: "I've never run a paid ad. Here's how I get clients", format: "Talking Head", audience: "Business owners and coaches trying to grow organically", goal: "Saves", pillar: "tips", filmingTip: "High-energy delivery, 3-step framework on screen" },
    { title: "Business advice I ignored (and regretted)", angle: "Vulnerable reflection on bad decisions", hook: "I was told this would save my business. I ignored it.", format: "Storytime", audience: "Entrepreneurs in growth phase", goal: "Engagement", pillar: "personal", filmingTip: "Slower pacing, genuine reflection, specific example" },
    { title: "What real entrepreneurship looks like at month 3", angle: "Expectation vs reality of early business", hook: "Month 3 of entrepreneurship looks nothing like month 1", format: "Before & After", audience: "People in the early messy stages", goal: "Reach", pillar: "motivation", filmingTip: "Compare expectation clips to reality footage — honest and unglamorous" },
  ],
  beauty: [
    { title: "Skincare mistakes you're probably making right now", angle: "Mistake callout for over-the-counter users", hook: "Stop doing this to your skin — you're making it worse", format: "Mistake Callout", audience: "Skincare beginners making common errors", goal: "Reach", pillar: "education", filmingTip: "Point at your skin in mirror, show before/after of correcting the mistake" },
    { title: "My 5-step routine for glass skin", angle: "Tutorial with specific product sequence", hook: "I get asked about my skin every single day. Here's why", format: "Tutorial / Demo", audience: "People wanting a clear, glowing skin routine", goal: "Saves", pillar: "tips", filmingTip: "Well-lit flat lay of products, then apply each with voiceover" },
    { title: "Drugstore vs luxury — I tested both for 30 days", angle: "Honest product comparison with real results", hook: "I swapped my $200 routine for a $40 drugstore version", format: "Before & After", audience: "Budget-conscious skincare enthusiasts", goal: "Engagement", pillar: "entertainment", filmingTip: "Split-screen before/after, unboxing clips of each product group" },
    { title: "The skincare ingredient that transformed my skin", angle: "Personal experience with a single active ingredient", hook: "One ingredient changed my skin in 6 weeks — seriously", format: "Storytime", audience: "People overwhelmed by ingredient research", goal: "Saves", pillar: "personal", filmingTip: "Close-up skin shots, before/after progression photos as B-roll" },
    { title: "Myths about SPF that are ruining your skin", angle: "Myth-busting common sun protection misconceptions", hook: "You're using SPF wrong and it's aging your skin faster", format: "Myth-Busting", audience: "Anyone using (or avoiding) SPF", goal: "Reach", pillar: "education", filmingTip: "Hold up SPF products as props, text overlays for each myth" },
    { title: "Get ready with me — 5-minute natural makeup", angle: "Quick-win makeup tutorial for minimal products", hook: "You don't need 20 products. I prove it in 5 minutes", format: "Tutorial / Demo", audience: "People who want simple, quick makeup looks", goal: "Saves", pillar: "tips", filmingTip: "Real-time GRWM in bathroom mirror, quick cuts for each product" },
    { title: "My skin journey from cystic acne to clear", angle: "Vulnerable transformation story", hook: "I had cystic acne for 4 years. Here's what finally worked", format: "Before & After", audience: "People struggling with persistent acne", goal: "Reach", pillar: "personal", filmingTip: "Progress photos at 3 months, 6 months, current — with honest narration" },
    { title: "POV: You finally found your skincare routine", angle: "Relatable milestone moment", hook: "POV: Your skin finally clears and you're obsessed with it", format: "POV / Skit", audience: "Skincare enthusiasts and beginners", goal: "Engagement", pillar: "entertainment", filmingTip: "Text-overlay POV format, mirror selfie progression" },
    { title: "5 skincare hacks that dermatologists recommend", angle: "Authority-backed tips with practical execution", hook: "Dermatologists recommend this and most people ignore it", format: "List / Tips", audience: "People who take evidence-based skincare seriously", goal: "Saves", pillar: "education", filmingTip: "Quick cuts between each tip, source callout in text overlay" },
    { title: "The hidden cost of cheap skincare", angle: "Myth-busting budget beauty culture", hook: "Cheap skincare isn't always saving your money — here's why", format: "Talking Head", audience: "People who think price means quality (or it doesn't)", goal: "Engagement", pillar: "education", filmingTip: "Confident talking head, use a cost-per-use breakdown as visual" },
    { title: "Behind the scenes of creating a makeup tutorial", angle: "Reality of content creation in the beauty space", hook: "My makeup tutorials look effortless. Reality:", format: "B-Roll + Text Overlay", audience: "Fellow beauty creators and aspiring content creators", goal: "Reach", pillar: "behindscenes", filmingTip: "Show failed attempts, lighting rigs, retakes — raw and funny" },
    { title: "I wore only minimal makeup for 30 days", angle: "Personal experiment challenging beauty standards", hook: "30 days of no foundation. Here's what I learned", format: "Storytime", audience: "People curious about skinimalism", goal: "Reach", pillar: "personal", filmingTip: "Day 1 vs Day 30 clips, honest day-by-day observations" },
  ],
  finance: [
    { title: "The money mistake I made at 25 (and the cost)", angle: "Personal story making financial education relatable", hook: "I made this money mistake at 25 and it cost me $50K", format: "Storytime", audience: "People in their 20s and 30s learning personal finance", goal: "Reach", pillar: "personal", filmingTip: "Specific numbers, genuine regret — authenticity converts here" },
    { title: "How compound interest actually works (with real numbers)", angle: "Education with specific math made visual", hook: "If you put $300/month in this at 25, here's what you'll have at 60", format: "B-Roll + Text Overlay", audience: "Young people skeptical of investing", goal: "Saves", pillar: "education", filmingTip: "Show compound interest calculator on screen, dramatic numbers" },
    { title: "5 money habits to start before you turn 30", angle: "Actionable list with urgency", hook: "Under 30? Do these 5 things before it's too late", format: "List / Tips", audience: "People in their 20s who want to build wealth", goal: "Saves", pillar: "tips", filmingTip: "Fast-cut list format, each tip with 3-second visual example" },
    { title: "I saved $10K in 6 months on a $50K salary", angle: "Specific personal achievement with proof", hook: "I saved $10K in 6 months — here's the exact system", format: "Talking Head", audience: "People who think they can't save on their salary", goal: "Saves", pillar: "personal", filmingTip: "Show the savings account (blurred amount), talk through each tactic" },
    { title: "Myths about investing that are keeping you broke", angle: "Myth-busting the 'I can't invest' narrative", hook: "You don't need $1,000 to start investing — this is a lie", format: "Myth-Busting", audience: "People who believe investing is only for the wealthy", goal: "Reach", pillar: "education", filmingTip: "Bold text overlays for each myth, counter each with alternative truth" },
    { title: "The 50/30/20 rule explained with real money", angle: "Framework education with concrete numbers", hook: "This budgeting rule changed how I see my paycheck", format: "Tutorial / Demo", audience: "People who struggle to budget consistently", goal: "Saves", pillar: "education", filmingTip: "Show a paycheck breakdown visual, allocate percentages on screen" },
    { title: "What I wish someone told me about money at 22", angle: "Retrospective advice from older, wiser version", hook: "Nobody told me this about money in my 20s", format: "Talking Head", audience: "Young adults just starting to build financial awareness", goal: "Reach", pillar: "motivation", filmingTip: "Warm, mentor-style delivery — direct to camera, no cuts" },
    { title: "POV: You check your savings account after 1 year", angle: "Aspirational relatable moment", hook: "POV: You built the savings habit. Now check the balance.", format: "POV / Skit", audience: "People who want to save but haven't started", goal: "Engagement", pillar: "inspiration", filmingTip: "Overlay text on phone screen animation, triumphant end frame" },
    { title: "Day in the life of someone who's debt-free", angle: "Aspirational behind-the-scenes of financial freedom", hook: "This is what your life looks like when you're debt-free", format: "B-Roll + Text Overlay", audience: "People drowning in debt wanting a different future", goal: "Reach", pillar: "inspiration", filmingTip: "Peaceful morning routine, no stress spending decisions, overlay text" },
    { title: "3 apps that helped me save $500 this month", angle: "Tool recommendation with personal results", hook: "These 3 free apps saved me $500 last month", format: "List / Tips", audience: "People looking for practical money-saving tools", goal: "Saves", pillar: "tips", filmingTip: "Screen record each app briefly, show the actual savings it generated" },
    { title: "The 'latte factor' argument is wrong and here's why", angle: "Contrarian personal finance take", hook: "Stop blaming your coffee for why you're not building wealth", format: "Myth-Busting", audience: "People who've heard the 'cut small expenses' advice", goal: "Engagement", pillar: "education", filmingTip: "Strong opinion talking head — passionate and direct" },
    { title: "What $1,000/month in investing for 10 years looks like", angle: "Visual proof of long-term investing power", hook: "$1,000/month for 10 years. The number will surprise you.", format: "B-Roll + Text Overlay", audience: "People procrastinating on starting their investing journey", goal: "Saves", pillar: "education", filmingTip: "Animated compound interest chart growing over time as primary visual" },
  ],
  tech: [
    { title: "5 AI tools that replaced my $500/month subscriptions", angle: "Cost-saving AI substitutions for common tools", hook: "I cancelled $500 in subscriptions. Here's what replaced them", format: "List / Tips", audience: "Creators and entrepreneurs overpaying for software", goal: "Saves", pillar: "tips", filmingTip: "Screen record each AI tool's key feature, quick transitions" },
    { title: "ChatGPT prompt that writes your content in 60 seconds", angle: "Specific prompt engineering tutorial", hook: "This prompt writes better content than I do — in 60 seconds", format: "Tutorial / Demo", audience: "Content creators and marketers", goal: "Saves", pillar: "tips", filmingTip: "Screen share ChatGPT, type the prompt live, show the output" },
    { title: "The AI tool that scared me when I first used it", angle: "Emotional story about a powerful AI discovery", hook: "This AI tool genuinely made me question my career", format: "Storytime", audience: "Professionals curious and anxious about AI", goal: "Reach", pillar: "personal", filmingTip: "Talking head with screen share reveal — build anticipation before showing" },
    { title: "3 automations saving me 10 hours a week", angle: "Practical automation tutorial with time proof", hook: "I automated these 3 things and got 10 hours back every week", format: "Tutorial / Demo", audience: "Busy professionals and solopreneurs", goal: "Saves", pillar: "tips", filmingTip: "Quick screen records of each automation trigger-to-action flow" },
    { title: "Myths about AI replacing jobs — the honest take", angle: "Nuanced myth-busting on AI job fears", hook: "AI isn't taking your job — but this person is", format: "Myth-Busting", audience: "Professionals worried about AI in the workforce", goal: "Engagement", pillar: "education", filmingTip: "Passionate talking head — specific industries and data points" },
    { title: "My full AI content creation workflow", angle: "Behind-the-scenes of an AI-powered content system", hook: "Here's how I create a week of content in 2 hours using AI", format: "B-Roll + Text Overlay", audience: "Content creators wanting to scale output", goal: "Saves", pillar: "behindscenes", filmingTip: "Screen share workflow from idea → AI draft → edit → schedule" },
    { title: "The Notion setup that runs my entire business", angle: "Practical productivity system tour", hook: "I run my business from one Notion dashboard — let me show you", format: "Tutorial / Demo", audience: "Entrepreneurs and freelancers using Notion", goal: "Saves", pillar: "tips", filmingTip: "Notion screen share, click through each section with voiceover" },
    { title: "Things nobody tells you about using AI for work", angle: "Hidden truth about AI limitations and misuse", hook: "AI is making some people lazier and worse at their jobs", format: "Talking Head", audience: "Professionals and creators actively using AI", goal: "Engagement", pillar: "education", filmingTip: "Controversial opinion delivered confidently, no hedge" },
    { title: "I let AI run my social media for 30 days", angle: "Personal experiment with honest results", hook: "I gave AI full control of my content for 30 days", format: "Before & After", audience: "Creators curious about AI content creation", goal: "Reach", pillar: "personal", filmingTip: "Compare engagement metrics before vs after, show AI vs human posts" },
    { title: "Free AI tools vs paid — what actually matters", angle: "Practical comparison with concrete use cases", hook: "Most people are paying for AI tools they don't need", format: "List / Tips", audience: "People new to AI tools trying to choose", goal: "Saves", pillar: "education", filmingTip: "Side-by-side feature comparisons, specific use case demonstrations" },
    { title: "The prompt engineers making $300K — here's what they do", angle: "Education about high-demand AI skills", hook: "Prompt engineering is a real job and it pays this much", format: "Talking Head", audience: "People exploring AI-adjacent career opportunities", goal: "Reach", pillar: "education", filmingTip: "Cite real salary data on screen, explain what they actually do daily" },
    { title: "How I use AI without losing my authentic voice", angle: "Addressing the 'AI sounds fake' objection", hook: "The reason AI content sounds robotic — and how to fix it", format: "Tutorial / Demo", audience: "Creators worried AI will make their content generic", goal: "Saves", pillar: "tips", filmingTip: "Screen share a before (AI output) and after (edited with voice)" },
  ],
  education: [
    { title: "How to learn anything in 20 hours", angle: "Josh Kaufman's model applied to real learning", hook: "You can learn any skill in 20 hours — here's the method", format: "Talking Head", audience: "Curious learners and self-improvers", goal: "Saves", pillar: "education", filmingTip: "Draw a simple 4-step diagram on a whiteboard or use text overlay" },
    { title: "Why you forget everything you study", angle: "The forgetting curve explained with a fix", hook: "You forget 70% of what you study within 24 hours — here's why", format: "Myth-Busting", audience: "Students and self-learners frustrated with retention", goal: "Saves", pillar: "education", filmingTip: "Animated forgetting curve graph, then reveal the spaced repetition fix" },
    { title: "The note-taking system that changed how I learn", angle: "Practical system with specific steps", hook: "My notes were useless until I changed this one thing", format: "Tutorial / Demo", audience: "Students and knowledge workers wanting better retention", goal: "Saves", pillar: "tips", filmingTip: "Show before (messy notes) vs after (organized system) side by side" },
    { title: "5 study habits that actually work (science-backed)", angle: "Evidence-based learning techniques most people ignore", hook: "Everything you know about studying is probably wrong", format: "List / Tips", audience: "Students and lifelong learners", goal: "Saves", pillar: "tips", filmingTip: "Quick cuts for each habit, cite one study name per technique" },
    { title: "The day I taught myself a language in 90 days", angle: "Personal challenge story with method", hook: "I spoke zero Spanish. 90 days later, I was fluent", format: "Storytime", audience: "People wanting to learn a language or new skill", goal: "Reach", pillar: "personal", filmingTip: "Day 1 vs Day 90 speaking clip, honest mid-point struggles" },
    { title: "Things school never taught you about learning", angle: "Contrarian take on institutional education", hook: "School teaches you what to learn, not how to learn", format: "Talking Head", audience: "Adults who feel their education failed them", goal: "Engagement", pillar: "education", filmingTip: "Strong opinion piece — be specific about what was missing" },
    { title: "The 2-minute technique that makes anything stick", angle: "Teaching others as the most effective learning method", hook: "Explain it to a 5-year-old — this is how you truly learn it", format: "Tutorial / Demo", audience: "People who read and then immediately forget what they read", goal: "Saves", pillar: "tips", filmingTip: "Demonstrate the Feynman technique on a concept live" },
    { title: "POV: You actually read the book instead of buying it", angle: "Relatable humor about knowledge consumption habits", hook: "POV: You have 47 books purchased and have read exactly 2", format: "POV / Skit", audience: "Knowledge collectors who don't implement", goal: "Engagement", pillar: "entertainment", filmingTip: "Text-overlay POV, shot of a bookshelf piled with unread books" },
    { title: "My 1-hour daily learning system", angle: "Sustainable routine for continuous self-education", hook: "I learn for 1 hour every day. Here's exactly how I structure it", format: "B-Roll + Text Overlay", audience: "Busy adults who want to be continuous learners", goal: "Saves", pillar: "behindscenes", filmingTip: "Morning desk setup, show each resource type with overlay timing" },
    { title: "The skill that will be worth the most in 5 years", angle: "Future-focused career and learning recommendation", hook: "The skill I'd learn today if I were starting from zero", format: "Talking Head", audience: "People thinking about career and skill development", goal: "Reach", pillar: "inspiration", filmingTip: "Bold opinion piece — choose one skill and defend it confidently" },
    { title: "Why smart people stay stuck (it's not intelligence)", angle: "Myth-busting intelligence as the key to learning", hook: "Intelligence is not what separates fast learners from slow ones", format: "Myth-Busting", audience: "People who believe they're 'just not smart enough'", goal: "Engagement", pillar: "motivation", filmingTip: "Emotional talking head, specific growth mindset reframe" },
    { title: "A book that completely changed how I think", angle: "Personal recommendation with specific impact", hook: "This book made me unlearn everything I thought I knew", format: "Storytime", audience: "Book lovers and self-improvement seekers", goal: "Reach", pillar: "personal", filmingTip: "Hold the book, explain one specific shift it created in your thinking" },
  ],
  food: [
    { title: "Meal prep in under 60 minutes for the whole week", angle: "Time-efficient weekly meal prep system", hook: "I prep 5 days of food in under 60 minutes every Sunday", format: "Tutorial / Demo", audience: "Busy people who want to eat better", goal: "Saves", pillar: "tips", filmingTip: "Time-stamped process, show all containers lined up at the end" },
    { title: "5 cheap high-protein meals under $5 each", angle: "Budget meal ideas with nutrition", hook: "You don't need to spend $200 on groceries to eat healthy", format: "List / Tips", audience: "Budget-conscious healthy eaters", goal: "Saves", pillar: "education", filmingTip: "Show each meal plated alongside a grocery receipt with the cost" },
    { title: "The kitchen tool that changed how I cook", angle: "Product-driven before/after on cooking efficiency", hook: "I didn't cook at home for years. This tool changed that", format: "Before & After", audience: "Non-cooks who want to start cooking at home", goal: "Reach", pillar: "personal", filmingTip: "Show the kitchen disaster before, then the easy result after" },
    { title: "Myths about healthy eating I believed for too long", angle: "Myth-busting nutrition misinformation", hook: "I was eating 'healthy' and gaining weight — here's what I missed", format: "Myth-Busting", audience: "People confused by contradictory nutrition advice", goal: "Engagement", pillar: "education", filmingTip: "Talking head with specific myth statements + corrections as text" },
    { title: "What I eat in a day — no BS version", angle: "Authentic daily eating habits", hook: "What I actually eat in a day — not the Instagram version", format: "B-Roll + Text Overlay", audience: "People curious about realistic healthy eating", goal: "Reach", pillar: "personal", filmingTip: "Film meals as they happen throughout the day, honest captions" },
    { title: "3 recipes I make when I have 10 minutes", angle: "Quick win meals for time-crunched people", hook: "Busy? These 3 meals take under 10 minutes and actually taste good", format: "Tutorial / Demo", audience: "People who default to takeout due to time", goal: "Saves", pillar: "tips", filmingTip: "Real-time cooking of each, time-lapse where possible" },
    { title: "Why my meal prep always fails (and the fix)", angle: "Honest mistake callout followed by solution", hook: "I meal prepped every week and still ordered takeout — here's why", format: "Mistake Callout", audience: "People who've tried and failed at meal prepping", goal: "Engagement", pillar: "personal", filmingTip: "Genuine before (the failures), then structured after (the fix)" },
    { title: "POV: You actually cooked dinner instead of ordering out", angle: "Relatable milestone in cooking journey", hook: "POV: You chose the pan over Uber Eats for the first time in months", format: "POV / Skit", audience: "People trying to break the takeout habit", goal: "Engagement", pillar: "entertainment", filmingTip: "Triumphant home cook scene, contrast with delivery app notification" },
    { title: "The $20 grocery haul that lasted me a week", angle: "Budget challenge with real results", hook: "$20 budget, 7 days. Here's what I made", format: "B-Roll + Text Overlay", audience: "People on tight food budgets", goal: "Saves", pillar: "tips", filmingTip: "Show the grocery haul, then each meal that came from it" },
    { title: "How I stopped wasting $200/month on food", angle: "Personal finance meets food planning", hook: "I was wasting $200/month on food. Here's the exact fix", format: "Storytime", audience: "Households with food waste and overspending problems", goal: "Saves", pillar: "personal", filmingTip: "Before receipts vs after receipts, honest breakdown of changes made" },
    { title: "Rating viral food trends — honest reviews", angle: "Entertainment with honest opinion", hook: "I tested every viral food trend from this year. Honest ranking:", format: "List / Tips", audience: "Food lovers and trend-followers", goal: "Engagement", pillar: "entertainment", filmingTip: "Taste tests on camera with genuine reactions, score overlay" },
    { title: "The mindset shift that fixed my relationship with food", angle: "Mental health meets nutrition", hook: "I stopped dieting the day I changed this one belief about food", format: "Talking Head", audience: "People with complicated histories with food and dieting", goal: "Reach", pillar: "motivation", filmingTip: "Calm, warm delivery — this is an emotional topic, be gentle" },
  ],
  travel: [
    { title: "I flew business class for free — here's exactly how", angle: "Points hacking tutorial with specific steps", hook: "Business class without paying for it — the exact strategy", format: "Tutorial / Demo", audience: "Frequent travelers wanting to maximize credit card points", goal: "Saves", pillar: "tips", filmingTip: "Show credit card, points total, and actual boarding pass from the flight" },
    { title: "Things that shocked me traveling in Southeast Asia", angle: "Honest first-reaction travel content", hook: "I was not prepared for how different this is from what I imagined", format: "B-Roll + Text Overlay", audience: "People considering or curious about Southeast Asia travel", goal: "Reach", pillar: "entertainment", filmingTip: "Real moments — traffic, food stalls, temples — with honest text overlays" },
    { title: "How I travel 3 months a year on a regular salary", angle: "Budget travel strategy from a non-influencer", hook: "I'm not a digital nomad. I still travel 3 months a year", format: "Talking Head", audience: "Working professionals who think travel is for the rich", goal: "Saves", pillar: "tips", filmingTip: "Direct camera, break down time-off strategy and savings method" },
    { title: "My worst travel decision — and what it taught me", angle: "Storytelling with a lesson", hook: "I spent $2,000 on a trip I almost ruined with this decision", format: "Storytime", audience: "Travelers learning from experience", goal: "Engagement", pillar: "personal", filmingTip: "Story narration with relevant B-roll from the trip" },
    { title: "Packing for 2 weeks in a carry-on — I'll show you how", angle: "Practical packing tutorial with specific items", hook: "Two weeks, one carry-on bag. Here's exactly what I bring", format: "Tutorial / Demo", audience: "People who always over-pack and pay baggage fees", goal: "Saves", pillar: "tips", filmingTip: "Flat lay every item, pack the bag on camera with final weight reveal" },
    { title: "The most underrated travel destination right now", angle: "Hidden gem recommendation before it gets discovered", hook: "Nobody is talking about this destination — go now before it's ruined", format: "B-Roll + Text Overlay", audience: "Experienced travelers seeking off-the-beaten-path experiences", goal: "Reach", pillar: "inspiration", filmingTip: "Beautiful B-roll of the destination, text labels for key spots" },
    { title: "Solo travel safety — what actually works", angle: "Practical advice based on real experience", hook: "I've traveled solo to 20 countries. Here's what actually keeps you safe", format: "List / Tips", audience: "People considering solo travel but feeling nervous", goal: "Saves", pillar: "education", filmingTip: "Mix of relevant B-roll and direct camera for safety tips" },
    { title: "Day 1 vs Day 30 of long-term travel", angle: "Honest evolution of the travel experience", hook: "Long-term travel looked nothing like I imagined after month 1", format: "Before & After", audience: "People romanticizing digital nomad or long-term travel life", goal: "Engagement", pillar: "personal", filmingTip: "Day 1 excitement footage vs Day 30 reality — honest comparison" },
    { title: "Hidden gems in [city] that locals actually love", angle: "Local perspective over tourist guide", hook: "I lived in [city] for 3 months. Forget the tourist spots", format: "B-Roll + Text Overlay", audience: "People planning a trip and wanting authentic experiences", goal: "Saves", pillar: "tips", filmingTip: "Clip of each hidden spot with location overlay and honest commentary" },
    { title: "POV: You're on a 12-hour flight with no entertainment", angle: "Relatable travel struggle", hook: "POV: The in-flight entertainment broke 30 minutes in", format: "POV / Skit", audience: "Anyone who travels by plane", goal: "Engagement", pillar: "entertainment", filmingTip: "Text-on-screen POV format, escalating comedy of flight mishaps" },
    { title: "The travel hack that saves me $300 every trip", angle: "One specific strategy with quantified savings", hook: "One booking change saves me $300 on every single trip", format: "Talking Head", audience: "Frequent travelers optimizing their travel budget", goal: "Saves", pillar: "tips", filmingTip: "Show the actual booking comparison on screen, explain the logic" },
    { title: "What nobody tells you about travel content creation", angle: "Behind-the-scenes of creating travel content", hook: "Travel content looks amazing. Creating it is chaos", format: "Storytime", audience: "Aspiring travel creators and content creators generally", goal: "Reach", pillar: "behindscenes", filmingTip: "Behind-the-scenes filming struggles, retakes, equipment issues" },
  ],
  lifestyle: [
    { title: "My morning routine that actually sticks (not the aspirational one)", angle: "Realistic morning routine vs what's promoted online", hook: "Not a 5 AM, cold plunge, journal for 90 minutes routine", format: "B-Roll + Text Overlay", audience: "People who've tried and failed at complex morning routines", goal: "Reach", pillar: "personal", filmingTip: "Real morning footage — the actual routine, unglamorous and honest" },
    { title: "5 micro-habits that changed my entire day", angle: "Small actions with outsized impact", hook: "5 habits, all under 5 minutes. My days completely changed", format: "List / Tips", audience: "Busy people wanting self-improvement without overwhelm", goal: "Saves", pillar: "tips", filmingTip: "Quick clip of each habit in action, duration timer in corner" },
    { title: "What I did wrong for years as a 'productive person'", angle: "Mistake callout on productivity theater", hook: "I was extremely busy. I was also completely unproductive", format: "Mistake Callout", audience: "High-achievers burning out from performative busyness", goal: "Engagement", pillar: "education", filmingTip: "Talking head with intensity — this is a strong personal confession" },
    { title: "The book that changed everything for me this year", angle: "Personal recommendation with specific impact", hook: "I read 40 books this year. This one changed the most", format: "Storytime", audience: "Self-improvement seekers and readers", goal: "Reach", pillar: "inspiration", filmingTip: "Hold the book, explain one specific lesson, how you applied it" },
    { title: "Day in my life — slow living version", angle: "Counter-cultural day-in-the-life celebrating rest", hook: "This is what a slow, intentional day actually looks like", format: "B-Roll + Text Overlay", audience: "People burned out from hustle culture", goal: "Reach", pillar: "behindscenes", filmingTip: "Golden hour morning shots, unhurried pace, ambient sound" },
    { title: "I deleted social media for 30 days — here's what happened", angle: "Digital detox story with honest results", hook: "I deleted every app for 30 days. Here's the honest update", format: "Storytime", audience: "People feeling addicted to or controlled by social media", goal: "Reach", pillar: "personal", filmingTip: "Day 1 vs Day 7 vs Day 30 honest reflection clips" },
    { title: "The habit tracker method that finally works for me", angle: "Specific system over generic advice", hook: "I've tried every habit tracker. This is the only one that lasted", format: "Tutorial / Demo", audience: "People who start habits and drop them after 2 weeks", goal: "Saves", pillar: "tips", filmingTip: "Show the tracker, demonstrate filling it in, before/after consistency stats" },
    { title: "Things I stopped doing that made my life better", angle: "Subtraction approach to life improvement", hook: "I stopped doing 5 things and my life dramatically improved", format: "List / Tips", audience: "People looking for a fresh perspective on self-improvement", goal: "Saves", pillar: "motivation", filmingTip: "Each item as a text reveal with brief explanation" },
    { title: "Realistic self-care for people with no time", angle: "Practical self-care without the luxury", hook: "Self-care is not a spa day. Here's what it looks like for me", format: "Talking Head", audience: "Busy people who dismiss self-care as too indulgent", goal: "Reach", pillar: "tips", filmingTip: "Direct camera, list practical 5-minute options with specifics" },
    { title: "POV: You finally built a routine that works", angle: "Aspirational lifestyle milestone", hook: "POV: You wake up and actually want to do your morning routine", format: "POV / Skit", audience: "People working on building better daily habits", goal: "Engagement", pillar: "motivation", filmingTip: "Text-on-screen format, transition from struggle to success" },
    { title: "Why I stopped trying to be 'productive' every day", angle: "Permission to rest as a high-performance strategy", hook: "Productivity every day was making me less productive overall", format: "Talking Head", audience: "High achievers and productivity-obsessed creators", goal: "Engagement", pillar: "education", filmingTip: "Calm, reflective delivery — controversial for its audience" },
    { title: "The clutter-free home tour — and what it did to my mind", angle: "Minimalism impact on mental clarity", hook: "I removed 70% of my belongings. Here's what happened to my brain", format: "B-Roll + Text Overlay", audience: "People feeling overwhelmed by their environment", goal: "Reach", pillar: "personal", filmingTip: "Calm home B-roll, before/after declutter areas, text overlays" },
  ],
  fashion: [
    { title: "1 outfit, 5 completely different looks", angle: "Creative styling challenge showing versatility", hook: "You don't need more clothes — you need to style better", format: "Before & After", audience: "People who feel they have 'nothing to wear'", goal: "Saves", pillar: "tips", filmingTip: "Quick outfit transition cuts, same base piece styled differently each time" },
    { title: "The 10 wardrobe basics you actually need", angle: "Capsule wardrobe guide for beginners", hook: "These 10 pieces make up 80% of what I wear", format: "List / Tips", audience: "People trying to simplify their wardrobe", goal: "Saves", pillar: "education", filmingTip: "Flat lay each item, try on each and show 2 ways to style it" },
    { title: "I thrifted my entire wardrobe for $50 — here's what I found", angle: "Budget fashion challenge with results", hook: "Thrift store, $50 budget, one full outfit challenge", format: "Before & After", audience: "Budget fashion lovers and sustainability-minded shoppers", goal: "Reach", pillar: "entertainment", filmingTip: "In-store footage of the hunt, reveal haul at end" },
    { title: "Why you keep buying clothes and still feeling like you have nothing to wear", angle: "Mistake callout on impulse shopping patterns", hook: "You have a full closet and 'nothing to wear' — here's why", format: "Mistake Callout", audience: "Fashion lovers who over-buy and under-wear", goal: "Engagement", pillar: "education", filmingTip: "Talking head — personal confession works well here" },
    { title: "Color combinations that always look expensive", angle: "Color theory made practical", hook: "These 4 color pairings always look elevated — no matter the price", format: "List / Tips", audience: "People wanting to look more put-together effortlessly", goal: "Saves", pillar: "tips", filmingTip: "Flat lay each combination, try on each with specific items" },
    { title: "How I style the same jeans 7 different ways", angle: "Styling system for the most common wardrobe item", hook: "One pair of jeans, 7 outfits. Which is your favorite?", format: "Tutorial / Demo", audience: "Anyone with jeans (everyone) wanting more outfit variety", goal: "Saves", pillar: "tips", filmingTip: "Fast transition cuts between each outfit, ask for votes in caption" },
    { title: "The mistake making your outfits look cheap (it's not the price)", angle: "Education on fit and proportion over price", hook: "Your clothes aren't cheap — your fit is off. Here's the difference", format: "Before & After", audience: "People who feel their outfits don't look as good as they should", goal: "Reach", pillar: "education", filmingTip: "Same clothes, bad fit vs tailored fit — visual is everything here" },
    { title: "Sustainable fashion on a $100 budget", angle: "Accessible sustainability guide", hook: "Sustainable fashion is not just for people who can afford it", format: "Talking Head", audience: "People who want to shop ethically but think they can't afford to", goal: "Reach", pillar: "tips", filmingTip: "Show specific affordable sustainable brands and prices" },
    { title: "Behind the scenes of building a capsule wardrobe", angle: "Real process of editing and building a minimal wardrobe", hook: "I spent 2 hours going through my wardrobe — here's what survived", format: "B-Roll + Text Overlay", audience: "People considering a wardrobe declutter", goal: "Saves", pillar: "behindscenes", filmingTip: "Pile by pile sort footage, before/after wardrobe shots" },
    { title: "POV: You stopped buying fast fashion for 6 months", angle: "Relatable sustainability journey milestone", hook: "POV: It's been 6 months and your wardrobe actually improved", format: "POV / Skit", audience: "People considering or in the process of changing fashion habits", goal: "Engagement", pillar: "personal", filmingTip: "Text-overlay format, show the wardrobe reality at month 6" },
    { title: "Styling an outfit for every occasion from basics only", angle: "Practical styling challenge with versatility proof", hook: "One set of basics. Casual, office, date, formal — here's how", format: "Tutorial / Demo", audience: "People who want fewer clothes that do more", goal: "Saves", pillar: "tips", filmingTip: "Outfit reveal for each occasion from same base pieces" },
    { title: "Why I stopped following fashion trends", angle: "Personal perspective on trend culture", hook: "Trends are designed to make you buy more. I stopped falling for it", format: "Talking Head", audience: "Fashion-conscious people questioning their spending", goal: "Engagement", pillar: "personal", filmingTip: "Strong opinion delivery, specific brands and trend cycles mentioned" },
  ],
  relationships: [
    { title: "Red flags that took me years to recognize", angle: "Personal story with specific warning signs", hook: "I ignored these red flags for 2 years — learn from my mistake", format: "Storytime", audience: "People in or recovering from difficult relationships", goal: "Reach", pillar: "personal", filmingTip: "Calm talking head, no drama — reflective and specific" },
    { title: "5 green flags in a relationship nobody talks about", angle: "Positive relationship behaviors that indicate health", hook: "Everyone talks about red flags. These green flags matter more", format: "List / Tips", audience: "People actively dating or evaluating their relationships", goal: "Saves", pillar: "education", filmingTip: "Quick text reveals for each green flag, personal example for each" },
    { title: "Why smart people stay in bad relationships", angle: "Psychology-based education on relationship patterns", hook: "Intelligence has nothing to do with why people stay", format: "Myth-Busting", audience: "People confused about why they or others stay in toxic situations", goal: "Engagement", pillar: "education", filmingTip: "Calm but strong talking head — address the psychology directly" },
    { title: "How I finally set boundaries without guilt", angle: "Personal journey from people-pleaser to boundary setter", hook: "I couldn't say no without apologizing. Here's what I changed", format: "Storytime", audience: "People-pleasers and those new to setting boundaries", goal: "Saves", pillar: "personal", filmingTip: "Specific scenario examples of what boundaries look like in practice" },
    { title: "Communication habits that save relationships", angle: "Practical communication framework", hook: "Most relationships don't fail from love issues — they fail from this", format: "List / Tips", audience: "Couples and people in any significant relationship", goal: "Saves", pillar: "tips", filmingTip: "Each habit with a real example of what it looks and sounds like" },
    { title: "What your attachment style says about who you attract", angle: "Attachment theory made practical", hook: "Your attachment style is quietly selecting every person you date", format: "Talking Head", audience: "People curious about pattern-breaking in relationships", goal: "Saves", pillar: "education", filmingTip: "Explain each style briefly, then focus on the attraction pattern" },
    { title: "Things I wish I'd known before my first relationship", angle: "Retrospective advice with specific lessons", hook: "What 22-year-old me needed to hear before entering a relationship", format: "Talking Head", audience: "Young adults navigating their first serious relationships", goal: "Reach", pillar: "motivation", filmingTip: "Warm, older-and-wiser delivery — conversational and personal" },
    { title: "POV: You finally stop chasing people who don't choose you", angle: "Aspirational relationship mindset shift", hook: "POV: You realize your worth and stop going where you're not chosen", format: "POV / Skit", audience: "People working on their self-worth in dating", goal: "Reach", pillar: "inspiration", filmingTip: "Text-on-screen format, triumphant energy" },
    { title: "Healing after a breakup — what actually helps", angle: "Practical post-breakup recovery guide", hook: "Getting over a breakup is not about time — it's about these steps", format: "List / Tips", audience: "People going through a breakup", goal: "Saves", pillar: "tips", filmingTip: "Gentle, warm delivery — people in this situation need compassion first" },
    { title: "The conversation that saved my relationship", angle: "Vulnerable personal story about a relationship turning point", hook: "We almost ended it. Then we had this one conversation", format: "Storytime", audience: "Couples experiencing disconnect or conflict", goal: "Engagement", pillar: "personal", filmingTip: "Be vague enough to protect privacy, specific enough to be relatable" },
    { title: "Why your standards aren't too high (they're just clear)", angle: "Reframe of the 'too picky' narrative", hook: "You're not too picky. You just finally know what you want", format: "Myth-Busting", audience: "Single people who've been told their standards are unrealistic", goal: "Reach", pillar: "inspiration", filmingTip: "Strong, validating delivery — this is permission-giving content" },
    { title: "How I stopped attracting the same type of person", angle: "Pattern interruption through self-awareness", hook: "I kept dating the same person in different bodies — until I did this", format: "Storytime", audience: "People noticing repeating relationship patterns", goal: "Saves", pillar: "personal", filmingTip: "Honest story with specific internal work described, not just external changes" },
  ],
  health: [
    { title: "5 signs your gut health is affecting your mood", angle: "Gut-brain connection education with self-assessment", hook: "Your gut is affecting your mental health more than you realize", format: "List / Tips", audience: "People with unexplained mood fluctuations or digestive issues", goal: "Saves", pillar: "education", filmingTip: "Each sign as a text overlay, personal anecdote for 1–2 of them" },
    { title: "I fixed my sleep in 2 weeks — the exact changes I made", angle: "Personal experiment with specific protocol", hook: "I went from 4-hour broken sleep to 7 hours straight — here's what changed", format: "Storytime", audience: "People struggling with sleep quality", goal: "Saves", pillar: "personal", filmingTip: "Before sleep tracker screenshot, changes as text overlays, after screenshot" },
    { title: "The anti-inflammatory foods I eat every day", angle: "Practical nutrition education through daily routine", hook: "Inflammation is behind most chronic health issues — these foods fight it", format: "B-Roll + Text Overlay", audience: "Health-conscious people wanting dietary guidance", goal: "Saves", pillar: "tips", filmingTip: "Beautiful food preparation shots for each food, name overlay with benefit" },
    { title: "Why you're always tired (it's not just sleep)", angle: "Myth-busting the 'sleep more' solution for fatigue", hook: "You're sleeping 8 hours and still exhausted — here's the real reason", format: "Myth-Busting", audience: "People experiencing chronic fatigue", goal: "Reach", pillar: "education", filmingTip: "Strong hook delivery, specific non-sleep causes listed with explanations" },
    { title: "The morning habit that changed my energy levels completely", angle: "Single habit with transformational result", hook: "I added one thing to my morning and my energy changed in 5 days", format: "Talking Head", audience: "People with low energy and inconsistent mornings", goal: "Saves", pillar: "tips", filmingTip: "Describe the habit specifically, show it in action if possible" },
    { title: "How stress is quietly destroying your health", angle: "Cortisol and chronic stress education", hook: "This is what chronic stress is doing to your body right now", format: "B-Roll + Text Overlay", audience: "High-stress professionals and parents", goal: "Reach", pillar: "education", filmingTip: "Calm visual B-roll with alarming text overlay statistics" },
    { title: "My gut health protocol after 6 months of issues", angle: "Personal health journey with protocol details", hook: "6 months of gut issues. Here's what finally worked", format: "Storytime", audience: "People experiencing digestive health problems", goal: "Saves", pillar: "personal", filmingTip: "Honest narration, specific protocol steps visible on screen" },
    { title: "Things I stopped eating and how my body changed", angle: "Elimination approach to better health", hook: "I removed 3 things from my diet. My health changed in 30 days", format: "Before & After", audience: "People open to dietary adjustments", goal: "Reach", pillar: "personal", filmingTip: "Month 1 energy/health state vs month 2, specific symptoms listed" },
    { title: "5 free ways to reduce cortisol starting tonight", angle: "Accessible stress reduction without products", hook: "Your cortisol is probably too high. These 5 things cost nothing", format: "List / Tips", audience: "Stressed adults looking for practical relief", goal: "Saves", pillar: "tips", filmingTip: "Evening routine B-roll for each tip, calm music, text overlays" },
    { title: "Why I chose a functional medicine doctor over my GP", angle: "Personal decision story about healthcare approach", hook: "I changed doctors after 3 years of being told I was fine", format: "Storytime", audience: "People frustrated with conventional medicine not finding answers", goal: "Reach", pillar: "personal", filmingTip: "Be balanced and specific — explain functional vs conventional approach" },
    { title: "The supplement I'd take if I could only take one", angle: "Simplified nutrition recommendation with reasoning", hook: "One supplement, one year. Here's the impact on my health", format: "Talking Head", audience: "People overwhelmed by supplement options", goal: "Saves", pillar: "tips", filmingTip: "Hold the supplement, explain the specific mechanism and your personal results" },
    { title: "POV: You finally fixed your gut health", angle: "Aspirational health milestone", hook: "POV: No more bloating, no more fatigue, no more brain fog", format: "POV / Skit", audience: "People currently dealing with gut health issues", goal: "Engagement", pillar: "inspiration", filmingTip: "Text-on-screen format building up each symptom, then the relief" },
  ],
  coaching: [
    { title: "The mindset block killing most people's goals", angle: "Coaching insight about the real barrier to achievement", hook: "It's not your plan. It's this belief you're carrying", format: "Talking Head", audience: "Ambitious people who keep starting and stopping goals", goal: "Reach", pillar: "education", filmingTip: "Direct, coaching-style delivery — challenging and specific" },
    { title: "What a coaching session actually looks like (real example)", angle: "Transparency building trust", hook: "People think coaching is motivational speeches. Here's what it really is", format: "B-Roll + Text Overlay", audience: "People curious about coaching but unsure if it works", goal: "Sales", pillar: "behindscenes", filmingTip: "Recreated session scenario with anonymized client situation" },
    { title: "5 coaching tools you can use on yourself today", angle: "Self-coaching framework for DIY growth", hook: "You don't need a coach to use these 5 tools — starting today", format: "List / Tips", audience: "Self-improvement seekers who want to do the inner work", goal: "Saves", pillar: "tips", filmingTip: "Each tool demonstrated with a mini exercise the viewer can follow" },
    { title: "The question that unlocks everything for my clients", angle: "Signature coaching question shared publicly", hook: "I ask every client this one question. The answer changes everything", format: "Talking Head", audience: "People feeling stuck without knowing why", goal: "Engagement", pillar: "education", filmingTip: "Pause dramatically after asking the question — let it land" },
    { title: "What my client achieved in 90 days (with zero prior experience)", angle: "Social proof through documented transformation", hook: "She came to me with no following, no offer, no confidence", format: "Before & After", audience: "People considering coaching who need proof it works", goal: "Sales", pillar: "promotion", filmingTip: "Show screenshots (with permission), narrate each milestone" },
    { title: "The real reason people don't achieve their goals", angle: "Honest coaching insight that challenges the planning narrative", hook: "You don't have a goal problem. You have an identity problem", format: "Myth-Busting", audience: "Goal-setters who keep failing to follow through", goal: "Reach", pillar: "education", filmingTip: "Strong opinion delivery — challenge their current belief directly" },
    { title: "I was terrified before starting my coaching business", angle: "Personal vulnerability before expertise", hook: "Before my first client, I was this close to quitting", format: "Storytime", audience: "Aspiring coaches in the early stages of building their practice", goal: "Engagement", pillar: "personal", filmingTip: "Genuine story, specific fears, what pushed through" },
    { title: "What separates people who grow from those who stay stuck", angle: "Coaching observation after working with hundreds of clients", hook: "After 200+ clients, the pattern is always this one thing", format: "Talking Head", audience: "Ambitious people at a growth plateau", goal: "Reach", pillar: "motivation", filmingTip: "Authority-driven delivery — let your experience speak" },
    { title: "The journaling prompt that triggers real breakthroughs", angle: "Specific therapeutic writing exercise", hook: "This journaling prompt made my client cry — in the best way", format: "Tutorial / Demo", audience: "People who journal or want to start inner work", goal: "Saves", pillar: "tips", filmingTip: "Show the prompt written out, explain the process, share a result" },
    { title: "Why I turned down clients (and what I look for instead)", angle: "Counter-intuitive coaching business practice", hook: "I've turned down clients who could pay. Here's exactly why", format: "Talking Head", audience: "Coaches and people curious about the coaching relationship", goal: "Reach", pillar: "personal", filmingTip: "Honest explanation of criteria — builds trust through specificity" },
    { title: "The coaching approach that gets results in the first session", angle: "Method transparency that builds leads", hook: "Most coaching takes months. My first session changes something immediately", format: "Talking Head", audience: "People skeptical about whether coaching works quickly", goal: "Sales", pillar: "promotion", filmingTip: "Walk through what specifically happens in session 1" },
    { title: "You don't need more information — you need this", angle: "Reframe of learning vs implementing", hook: "You have the information. So why aren't the results there?", format: "Myth-Busting", audience: "Knowledge collectors who haven't implemented", goal: "Engagement", pillar: "motivation", filmingTip: "Challenge the audience's belief system directly — no softening" },
  ],
  photography: [
    { title: "Camera settings beginners get wrong (and why)", angle: "Mistake callout for new DSLR/mirrorless users", hook: "These 3 camera settings are ruining your photos right now", format: "Mistake Callout", audience: "Beginner photographers with new cameras", goal: "Saves", pillar: "education", filmingTip: "Screen record camera menu, show wrong setting vs correct setting result" },
    { title: "How to use natural light like a professional", angle: "Free lighting education with before/after", hook: "The best light is free — most people just don't know how to use it", format: "Tutorial / Demo", audience: "Photographers wanting better photos without gear upgrades", goal: "Saves", pillar: "tips", filmingTip: "Film same subject in different light positions — golden hour, window, etc." },
    { title: "5 composition rules that immediately improve your photos", angle: "Composition education with instant-apply examples", hook: "These 5 rules made my photos go from amateur to editorial", format: "List / Tips", audience: "Beginners and intermediate photographers wanting technical improvement", goal: "Saves", pillar: "education", filmingTip: "Split screen good/bad composition for each rule" },
    { title: "My Lightroom editing process from start to finish", angle: "Full editing workflow tutorial", hook: "Raw vs edited — I'll walk you through every step", format: "Tutorial / Demo", audience: "Photographers who shoot RAW but don't know how to edit", goal: "Saves", pillar: "tips", filmingTip: "Screen share full Lightroom workflow, before/after reveal at end" },
    { title: "How I went from phone to full-time photographer", angle: "Inspiring career transition story", hook: "I started with my iPhone and now this is my career", format: "Storytime", audience: "Aspiring photographers wondering if they can make it a career", goal: "Reach", pillar: "personal", filmingTip: "First phone photos vs professional work — honest narrative" },
    { title: "The photography mistake that cost me a $3,000 client", angle: "Professional mistake story with lesson", hook: "I lost a $3K client because of one rookie mistake — don't repeat it", format: "Mistake Callout", audience: "Photographers who want to go professional", goal: "Engagement", pillar: "personal", filmingTip: "Specific story, non-judgmental tone, actionable takeaway" },
    { title: "How to shoot portraits without a flash (and make them pop)", angle: "Natural light portrait tutorial", hook: "No flash, no studio — how to make portraits look professional", format: "Tutorial / Demo", audience: "Portrait photographers working with natural light", goal: "Saves", pillar: "tips", filmingTip: "Behind-the-scenes of a natural light portrait shoot" },
    { title: "Things nobody tells you about going pro as a photographer", angle: "Reality of professional photography business", hook: "The photography business is not about photography — here's what it is about", format: "Talking Head", audience: "Photographers considering going professional", goal: "Engagement", pillar: "education", filmingTip: "Business reality check — contracts, clients, marketing, not just cameras" },
    { title: "Before I edited this photo vs 10 minutes later", angle: "Dramatic editing transformation", hook: "A photo that looked like nothing became this in 10 minutes", format: "Before & After", audience: "Photographers wanting to improve their editing", goal: "Saves", pillar: "tips", filmingTip: "Raw file reveal, 10-minute speed edit on screen, final dramatic reveal" },
    { title: "My gear bag — everything I bring to every shoot", angle: "Practical gear guide from a working photographer", hook: "I've simplified my gear bag to exactly this — and nothing else", format: "B-Roll + Text Overlay", audience: "Photographers who over-pack gear", goal: "Saves", pillar: "behindscenes", filmingTip: "Unpack each item, explain purpose and why it made the cut" },
    { title: "Why your phone photos look better than some DSLRs right now", angle: "Myth-busting gear vs skill debate", hook: "Your $1,200 camera is losing to an iPhone in some photos — here's why", format: "Myth-Busting", audience: "Photographers rationalizing gear purchases", goal: "Engagement", pillar: "education", filmingTip: "Side-by-side comparison with context explanation" },
    { title: "POV: You finally nail the shot you've been trying for weeks", angle: "Emotional milestone every photographer knows", hook: "POV: The shot finally comes together after 30 failed attempts", format: "POV / Skit", audience: "All photographers", goal: "Engagement", pillar: "entertainment", filmingTip: "Text-on-screen escalating frustration then explosion of success" },
  ],
  other: [
    { title: "The mistake I made that cost me more than money", angle: "Honest personal story with universal lesson", hook: "I made this mistake and the cost went beyond money", format: "Storytime", audience: "General audience navigating life and growth", goal: "Reach", pillar: "personal", filmingTip: "Genuine delivery, specific details make it relatable" },
    { title: "5 things I do differently that most people find weird", angle: "Contrarian lifestyle choices with explanations", hook: "I do 5 things that most people think are strange — here's why", format: "List / Tips", audience: "Curious people interested in alternative perspectives", goal: "Engagement", pillar: "entertainment", filmingTip: "Each habit with quick demonstration clip" },
    { title: "The book that changed my perspective on everything", angle: "Personal impact of transformative reading", hook: "This book permanently changed how I see the world", format: "Talking Head", audience: "Readers and self-improvement seekers", goal: "Reach", pillar: "inspiration", filmingTip: "Hold book, explain one specific concept that shifted your worldview" },
    { title: "Small habits that made a big difference", angle: "Micro-habit stack with compound result", hook: "Individually these habits seem irrelevant. Stacked together:", format: "List / Tips", audience: "People wanting sustainable self-improvement", goal: "Saves", pillar: "tips", filmingTip: "Each habit in action with a brief impact statement" },
    { title: "Why I stopped chasing motivation and found consistency instead", angle: "Motivation vs system debate resolved personally", hook: "Motivation is a terrible strategy. Here's what works instead", format: "Talking Head", audience: "People who start strong and fade out on goals", goal: "Reach", pillar: "motivation", filmingTip: "Strong opinion piece, specific system example" },
    { title: "The year that changed everything — honest reflection", angle: "Personal growth story with universal insights", hook: "A year ago, I was completely different. Here's what shifted", format: "Storytime", audience: "People in the middle of a growth or change period", goal: "Reach", pillar: "personal", filmingTip: "Reflective, calm delivery — list specific changes honestly" },
    { title: "Things I know now that I wish I'd known at 22", angle: "Retrospective wisdom without the lecture", hook: "To 22-year-old me — I'd only say these things", format: "Talking Head", audience: "Young adults and anyone navigating major transitions", goal: "Reach", pillar: "inspiration", filmingTip: "Warm, personal delivery — like a letter, not a lecture" },
    { title: "POV: You finally start the thing you've been putting off", angle: "Relatable procrastination moment turned action", hook: "POV: You open the laptop and actually start instead of scrolling", format: "POV / Skit", audience: "People struggling with procrastination", goal: "Engagement", pillar: "motivation", filmingTip: "Text-on-screen format, escalating procrastination excuses then action" },
    { title: "What nobody tells you about actually changing your life", angle: "Honest take on the unglamorous process of growth", hook: "Personal development content lies about what change actually feels like", format: "Myth-Busting", audience: "People disillusioned with self-help content", goal: "Engagement", pillar: "education", filmingTip: "Strong opinion delivery challenging self-help clichés" },
    { title: "Behind the scenes of creating my content", angle: "Creator transparency building audience connection", hook: "The content looks effortless. Here's what creating it actually looks like", format: "B-Roll + Text Overlay", audience: "Aspiring creators and current followers", goal: "Reach", pillar: "behindscenes", filmingTip: "Real process footage — imperfect takes, editing mess, planning chaos" },
    { title: "The mindset shift that changed how I approach problems", angle: "Reframe of problems as information rather than obstacles", hook: "I used to avoid problems. Now I approach them completely differently", format: "Talking Head", audience: "Anyone dealing with recurring obstacles", goal: "Saves", pillar: "education", filmingTip: "Teaching moment delivery, specific before/after example" },
    { title: "I committed to showing up for 90 days — here's what happened", angle: "90-day consistency challenge with honest results", hook: "90 days of showing up without quitting. Here's the real result", format: "Before & After", audience: "People who start things and stop", goal: "Reach", pillar: "motivation", filmingTip: "Day 1 clips vs Day 90 clips with honest progress commentary" },
  ],
};

// ─── Tone modifiers ───────────────────────────────────────────────────────────

const TONE_HOOKS: Record<ToneOption, (hook: string) => string> = {
  bold:          h => h.replace(/^You/, "You, listen up —").replace(/^I/, "I'll be direct:"),
  relatable:     h => h,
  inspirational: h => h.replace(/here's/, "here's what actually changed things:").replace(/^You're/, "If you're anything like I was, you're"),
  funny:         h => `(Wait for it) ${h}`,
  controversial: h => `Hot take: ${h}`,
};

// ─── Generation Engine ────────────────────────────────────────────────────────

function pickN<T>(arr: T[], n: number, seed: number): T[] {
  const shuffled = [...arr].sort((a, b) => {
    const ha = JSON.stringify(a).split("").reduce((s, c, i) => s + c.charCodeAt(0) * (i + seed + 1), 0) % 97;
    const hb = JSON.stringify(b).split("").reduce((s, c, i) => s + c.charCodeAt(0) * (i + seed + 1), 0) % 97;
    return ha - hb;
  });
  return shuffled.slice(0, n);
}

function generateIdeas(
  niche: Niche,
  audience: string,
  pillars: Pillar[],
  goal: GoalOption,
  experience: ExperienceOption,
  tone: ToneOption,
  seed: number,
): ReelIdea[] {
  const pool = IDEA_BANK[niche] || IDEA_BANK.other;

  // Filter by selected pillars
  const filtered = pool.filter(idea => pillars.includes(idea.pillar));
  const base = filtered.length >= 12 ? filtered : pool;

  // Goal filter boost — increase weight toward goal-matching ideas
  const goalMap: Record<GoalOption, string[]> = {
    growth:     ["Reach"],
    engagement: ["Engagement"],
    sales:      ["Sales"],
    authority:  ["Authority", "Saves"],
  };
  const preferredGoals = goalMap[goal];
  const prioritized = base.filter(i => preferredGoals.includes(i.goal));
  const rest = base.filter(i => !preferredGoals.includes(i.goal));
  const orderedPool = [...pickN(prioritized, 6, seed), ...pickN(rest, 8, seed)];

  // Experience level format filtering
  const beginnerFormats: ReelFormat[] = ["Talking Head", "List / Tips", "Tutorial / Demo", "B-Roll + Text Overlay"];
  const advancedFormats: ReelFormat[] = ["Storytime", "POV / Skit", "Before & After", "Myth-Busting", "Mistake Callout"];
  const formatFilter = experience === "beginner" ? beginnerFormats : experience === "advanced" ? advancedFormats : null;
  const formatFiltered = formatFilter ? orderedPool.filter(i => formatFilter.includes(i.format)) : orderedPool;
  const finalPool = formatFiltered.length >= 12 ? formatFiltered : orderedPool;

  // Pick 12 ensuring format variety
  const selected = pickN(finalPool, 12, seed);

  // Ensure no 2 consecutive same formats
  const result: IdeaTemplate[] = [];
  const remaining = [...selected];
  while (result.length < Math.min(12, selected.length)) {
    const lastFormat = result.length > 0 ? result[result.length - 1].format : null;
    const nextIdx = remaining.findIndex(i => i.format !== lastFormat);
    if (nextIdx === -1) {
      result.push(...remaining);
      break;
    }
    result.push(...remaining.splice(nextIdx, 1));
  }

  return result.slice(0, 12).map((idea, idx) => {
    const toneHook = TONE_HOOKS[tone](idea.hook);
    const personalized = audience.trim()
      ? { ...idea, audience: audience.trim() }
      : idea;
    return {
      id: idx + 1,
      title: personalized.title,
      angle: personalized.angle,
      hook: toneHook,
      format: personalized.format,
      audience: personalized.audience,
      goal: personalized.goal,
      pillar: personalized.pillar,
      filmingTip: personalized.filmingTip,
    };
  });
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What makes a good Instagram Reel idea?",
    a: "A good Instagram Reel idea combines four elements: a strong hook (the first 1–3 seconds that stop the scroll), a clear content angle (what makes this specific take interesting — a mistake, a transformation, a myth being busted), a filmable format (something achievable with a phone and basic setup), and a defined goal (reach, saves, engagement, or sales). The most common mistake creators make when brainstorming Reel ideas is being too general — 'fitness tips' is not an idea, it's a category. A strong Reel idea is specific enough to film tomorrow: 'The 3 form mistakes making your squats dangerous (and how to fix each one)' is filmable, hookable, and delivers specific value. Specificity is the difference between content that gets ignored and content that gets saved and shared.",
  },
  {
    q: "What are the best Instagram Reel formats in 2025?",
    a: "The 9 proven Instagram Reel formats that consistently perform in 2025 are: Talking Head (direct-to-camera advice or storytelling — best for opinion, education, and authority content), B-Roll with Text Overlay (lifestyle or process footage with on-screen text carrying the narrative — best for aspirational or behind-the-scenes content), POV / Skit (relatable scenario-based content that creates identification — best for engagement and shares), Before and After (transformation reveal with visual contrast — best for reach and saves), Tutorial or Demo (step-by-step educational content — best for saves), Storytime (narrative arc with emotional journey — best for engagement and profile visits), Myth-Busting (challenging common beliefs — best for engagement and shares), Mistake Callout (addressing what the audience does wrong — best for reach and saves), and List / Tips (numbered quick-hit advice — best for saves). Rotating across formats prevents your content from feeling repetitive and serves different audience segments in different content modes.",
  },
  {
    q: "How do I write a scroll-stopping hook for a Reel?",
    a: "A scroll-stopping hook must create one of three responses in the viewer in under 2 seconds: curiosity (make them wonder what happens next), tension (make them feel a problem they recognize), or emotion (surprise, recognition, or validation). The 6 most effective hook structures are: the curiosity gap ('The thing nobody tells you about [topic]'), the bold statement ('Most [audience] are doing [thing] wrong'), the relatable frustration ('If you've ever felt like [common struggle], this is why'), the contrarian take ('Stop [commonly recommended advice] — it's doing the opposite of what you think'), the quick win promise ('Do this in 2 minutes and [specific result]'), and the story teaser ('Three months ago I had [problem]. Here's what happened after I changed [thing]'). Keep hooks under 12 words in the first line. The visual hook (what the viewer sees in the first frame) matters as much as the audio hook — something happening, not just a static talking head.",
  },
  {
    q: "How many Reels should I post per week on Instagram?",
    a: "For most creators, 3–5 Reels per week is the optimal frequency in 2025. Quality consistently outperforms quantity — a creator posting 3 high-quality, well-hooked Reels per week will grow faster than one posting 7 mediocre Reels. Instagram's algorithm for Reels rewards watch time, replays, shares, and profile visits — metrics that only high-quality content drives. The practical consideration is sustainability: posting 5 Reels per week with strong hooks, relevant topics, and decent production requires roughly 3–5 hours of filming and editing time per week. For beginners, starting with 2–3 per week and building consistency is more effective than committing to daily posting and burning out after two weeks. Advanced creators can post daily (7×/week) if they have a batching system — filming 7 Reels in one 2-hour session rather than creating one per day.",
  },
  {
    q: "What topics get the most views on Instagram Reels?",
    a: "The topics that consistently drive the most views on Instagram Reels share three characteristics: they address a specific, common pain point or desire; they deliver immediate value or emotional response; and they are niche-specific enough to serve a clear audience but broad enough within that niche to attract new viewers. Across all niches, the consistently best-performing Reel topic categories are: mistake callouts (content revealing what the audience is doing wrong drives high shares because viewers tag friends who make the same mistake), transformation content (before-and-after of any kind drives saves and replays), myth-busting (contrarian takes on common beliefs drive comments and shares), and quick-win tutorials (actionable steps that can be immediately applied drive the highest save rates). The worst-performing topic type is vague inspirational content without a specific audience pain point or actionable takeaway.",
  },
  {
    q: "How do I film Instagram Reels with just my phone?",
    a: "Filming professional-quality Instagram Reels with a phone requires four elements: stable footage (a $15 phone tripod eliminates 90% of handheld shakiness), good lighting (film near a window with natural light behind the camera, not behind you — a ring light is optional but effective for talking head content), good audio (the built-in phone microphone is adequate for talking head Reels filmed indoors in a quiet room — a lapel mic costing $20–$30 dramatically improves audio in noisier environments), and clean composition (center yourself with some headroom, keep the background uncluttered or use a wall/neutral background). The most important technical factor for Reels performance is actually the hook — the first 1–2 seconds of the video. A slightly shaky 30-second Reel with a great hook will massively outperform a perfectly filmed Reel with a weak opening.",
  },
  {
    q: "What is the ideal Instagram Reel length in 2025?",
    a: "For most content types, 15–30 seconds is the sweet spot for Instagram Reels in 2025 in terms of completion rate — the metric Instagram's algorithm weights most heavily. Completion rate is the percentage of viewers who watch the full Reel, and it's the single strongest signal of content quality. A 15-second Reel is easier to watch completely than a 60-second one. However, the ideal length depends on format: Tutorials and educational content that require multi-step explanation perform better at 45–60 seconds because viewers are actively learning and engaged. Storytelling and personal narrative content can extend to 60–90 seconds if the story has a clear arc and emotional pull. List content ('5 tips for...') performs best at 30–45 seconds — enough to cover each tip without losing attention. Avoid padding — cut every second that doesn't add value, even if that means the Reel is only 12 seconds long.",
  },
  {
    q: "What is the difference between a viral Reel and a good Reel?",
    a: "A good Reel delivers value to a targeted audience — it generates saves, comments, and follows from people genuinely interested in the creator's niche. A viral Reel delivers value to a much broader audience — it generates massive reach, shares, and profile visits from people outside the creator's existing follower base. The practical difference is shareability. Viral Reels are almost always shared — people send them to friends, repost them to Stories, or tag someone in the comments. Shareability comes from one of four things: strong relatability (the viewer thinks 'this is exactly me'), a surprising reveal (the viewer can't believe what they just saw), extremely useful information (the viewer wants to save and share so they can find it again), or strong emotional response (the viewer feels validated, amused, or challenged enough to engage). The most reliable path to a viral Reel is not chasing trends but creating deeply specific content that makes the right person feel completely seen.",
  },
  {
    q: "How do I create Reel ideas when I'm out of content ideas?",
    a: "The most reliable method for generating Instagram Reel ideas is to start with your audience's problems, not your own expertise. The three best sources for ideas when you're stuck are: (1) Your comment section and DMs — the questions and statements your audience makes are telling you exactly what content they want; (2) Competitor analysis — look at the top-performing Reels in your niche from the past 90 days and identify the topic, angle, and format pattern (not to copy but to understand what your shared audience responds to); (3) Your own experience — the mistakes you made, the things you wish you'd known, the turning points in your journey. Every real experience you've had is a Reel. The format 'mistake callout' can apply to almost any niche and consistently generates high reach because every viewer either recognizes their own mistake or wants to share it with someone who makes it.",
  },
  {
    q: "Is this Instagram Reel Idea Generator free to use?",
    a: "Yes — the Instagram Reel Idea Generator on Creator Toolbox is completely free with no account, subscription, or credit card required. Select your niche, describe your target audience, choose your content pillars, primary goal, content style, experience level, and tone. The tool generates 12 unique Reel ideas immediately, each with a Title, Content Angle, Scroll-Stopping Hook, Format type (Talking Head, B-Roll, POV, Tutorial, Before/After, Storytime, Myth-Busting, Mistake Callout, or List), Target Audience, Goal (Reach, Saves, Engagement, or Sales), and a practical Filming Tip so you know exactly how to execute each idea. Use the filter tabs to view ideas grouped by format type for batch filming efficiency. Regenerate to get a fresh set of 12 ideas on demand.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(item => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

// ─── Accordion ─────────────────────────────────────────────────────────────────

function AccordionItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <div className={`rounded-2xl border bg-card shadow-sm transition-all duration-200 overflow-hidden ${open ? "border-primary/40 shadow-primary/10 shadow-md" : "border-border hover:border-muted-foreground/30"}`}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl" aria-expanded={open}>
        <span className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index + 1}</span>
          <span className={`font-semibold text-base leading-snug transition-colors ${open ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{question}</span>
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 500}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Idea Card ─────────────────────────────────────────────────────────────────

function IdeaCard({ idea, onCopy, copiedId }: {
  idea: ReelIdea; onCopy: (id: string, text: string) => void; copiedId: string | null;
}) {
  const id = `reel-${idea.id}`;
  const copied = copiedId === id;
  const pillarMeta = PILLAR_META[idea.pillar];
  const formatMeta = FORMAT_META[idea.format];
  const goalColor = GOAL_META[idea.goal] || GOAL_META["Engagement"];

  const copyText = `REEL IDEA ${idea.id}: ${idea.title}
Format: ${idea.format}
Hook: "${idea.hook}"
Angle: ${idea.angle}
Audience: ${idea.audience}
Goal: ${idea.goal}
Filming Tip: ${idea.filmingTip}`;

  return (
    <div className="rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors overflow-hidden group">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-border/50 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex-shrink-0">
              {idea.id}
            </div>
            <h3 className="font-bold text-foreground text-sm leading-snug">{idea.title}</h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${formatMeta.color}`}>
            {formatMeta.icon}{idea.format}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${pillarMeta.color}`}>
            {pillarMeta.label}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${goalColor}`}>
            <Target className="w-3 h-3" />{idea.goal}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {/* Hook */}
        <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Scroll-Stopping Hook</p>
          <p className="text-sm font-bold text-foreground">"{idea.hook}"</p>
        </div>
        {/* Angle */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Content Angle</p>
          <p className="text-sm text-foreground">{idea.angle}</p>
        </div>
        {/* Audience */}
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground"><span className="font-semibold">Audience:</span> {idea.audience}</p>
        </div>
        {/* Filming tip */}
        <div className="rounded-xl bg-muted/40 border border-border px-3.5 py-2.5 flex gap-2">
          <Film className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground"><span className="font-semibold">How to film:</span> {idea.filmingTip}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5">
        <button onClick={() => onCopy(id, copyText)}
          className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
            copied ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                   : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
          }`}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy Idea"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const ALL_PILLARS: Pillar[] = ["education", "entertainment", "personal", "promotion", "inspiration", "tips", "behindscenes", "motivation"];
const ALL_FORMATS: ReelFormat[] = ["Talking Head", "B-Roll + Text Overlay", "POV / Skit", "Before & After", "Tutorial / Demo", "Storytime", "Myth-Busting", "Mistake Callout", "List / Tips"];

export function InstagramReelIdeaGeneratorTool() {
  const { toast } = useToast();
  const [niche,       setNiche]       = useState<Niche>("lifestyle");
  const [audience,    setAudience]    = useState("");
  const [pillars,     setPillars]     = useState<Pillar[]>(["education", "entertainment", "personal", "tips"]);
  const [goal,        setGoal]        = useState<GoalOption>("growth");
  const [experience,  setExperience]  = useState<ExperienceOption>("beginner");
  const [tone,        setTone]        = useState<ToneOption>("relatable");
  const [error,       setError]       = useState("");
  const [ideas,       setIdeas]       = useState<ReelIdea[]>([]);
  const [formatFilter,setFormatFilter]= useState<"all" | ReelFormat>("all");
  const [copiedId,    setCopiedId]    = useState<string | null>(null);
  const [seed,        setSeed]        = useState(0);

  useEffect(() => {
    const id = "faq-schema-ig-reel-idea-gen";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id; s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      toast({ title: "Copied!", description: "Idea copied to clipboard." });
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [toast]);

  const togglePillar = (p: Pillar) => {
    setPillars(prev =>
      prev.includes(p) ? (prev.length > 2 ? prev.filter(x => x !== p) : prev)
                       : (prev.length < 6 ? [...prev, p] : prev)
    );
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pillars.length < 2) { setError("Select at least 2 content pillars."); return; }
    const newSeed = seed + 13;
    setSeed(newSeed);
    const result = generateIdeas(niche, audience, pillars, goal, experience, tone, newSeed);
    setIdeas(result);
    setFormatFilter("all");
    setTimeout(() => document.getElementById("ig-reel-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };

  const handleRegenerate = () => {
    const newSeed = seed + 17;
    setSeed(newSeed);
    const result = generateIdeas(niche, audience, pillars, goal, experience, tone, newSeed);
    setIdeas(result);
    toast({ title: "Regenerated!", description: "12 fresh Reel ideas generated." });
  };

  const displayed = formatFilter === "all" ? ideas : ideas.filter(i => i.format === formatFilter);
  const formatCounts = ALL_FORMATS.reduce((acc, f) => {
    acc[f] = ideas.filter(i => i.format === f).length;
    return acc;
  }, {} as Record<ReelFormat, number>);

  const NICHES: { value: Niche; label: string; emoji: string }[] = [
    { value: "fitness",       label: "Fitness",       emoji: "💪" },
    { value: "beauty",        label: "Beauty",        emoji: "💄" },
    { value: "business",      label: "Business",      emoji: "💼" },
    { value: "finance",       label: "Finance",       emoji: "💰" },
    { value: "tech",          label: "Tech / AI",     emoji: "🤖" },
    { value: "education",     label: "Education",     emoji: "📚" },
    { value: "food",          label: "Food",          emoji: "🍕" },
    { value: "travel",        label: "Travel",        emoji: "✈️" },
    { value: "lifestyle",     label: "Lifestyle",     emoji: "✨" },
    { value: "fashion",       label: "Fashion",       emoji: "👗" },
    { value: "relationships", label: "Relationships", emoji: "❤️" },
    { value: "health",        label: "Health",        emoji: "🌿" },
    { value: "coaching",      label: "Coaching",      emoji: "🎯" },
    { value: "photography",   label: "Photography",   emoji: "📷" },
    { value: "other",         label: "Other",         emoji: "🚀" },
  ];

  return (
    <>
      {/* ── Input Card ─────────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleGenerate} className="space-y-5">

            {/* Niche */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Your Niche</label>
              <div className="flex flex-wrap gap-2">
                {NICHES.map(({ value, label, emoji }) => (
                  <button key={value} type="button" onClick={() => setNiche(value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                      niche === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}>
                    <span>{emoji}</span>{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" /> Target Audience <span className="font-normal normal-case text-xs text-muted-foreground ml-1">(optional)</span>
              </label>
              <Input value={audience} onChange={e => setAudience(e.target.value)}
                placeholder="e.g. busy moms who want to lose weight, first-generation entrepreneurs, college students…"
                className="h-11 text-sm bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
            </div>

            {/* Pillars */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Content Pillars <span className="font-normal normal-case text-xs text-muted-foreground ml-1">(select 2–6)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_PILLARS.map(p => {
                  const meta = PILLAR_META[p];
                  const selected = pillars.includes(p);
                  return (
                    <button key={p} type="button" onClick={() => togglePillar(p)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        selected ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Goal + Experience + Tone */}
            <div className="grid sm:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Goal</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {([
                    { value: "growth" as GoalOption,     label: "🚀 Growth" },
                    { value: "engagement" as GoalOption, label: "💬 Engagement" },
                    { value: "sales" as GoalOption,      label: "💰 Sales" },
                    { value: "authority" as GoalOption,  label: "🎓 Authority" },
                  ] as const).map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setGoal(value)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        goal === value ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Experience</label>
                <div className="flex flex-col gap-1.5">
                  {([
                    { value: "beginner" as ExperienceOption,     label: "🌱 Beginner" },
                    { value: "intermediate" as ExperienceOption, label: "🌿 Intermediate" },
                    { value: "advanced" as ExperienceOption,     label: "🌳 Advanced" },
                  ] as const).map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setExperience(value)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        experience === value ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Tone</label>
                <div className="flex flex-col gap-1.5">
                  {([
                    { value: "bold" as ToneOption,          label: "🔥 Bold" },
                    { value: "relatable" as ToneOption,     label: "🤝 Relatable" },
                    { value: "inspirational" as ToneOption, label: "✨ Inspirational" },
                    { value: "funny" as ToneOption,         label: "😄 Funny" },
                    { value: "controversial" as ToneOption, label: "⚡ Controversial" },
                  ] as const).map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setTone(value)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        tone === value ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                <span>⚠️</span>{error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20">
              <Play className="w-5 h-5" /> Generate 12 Reel Ideas
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────────── */}
      {ideas.length > 0 && (
        <section id="ig-reel-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">

          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-bold text-foreground">12 Reel ideas generated</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {Object.entries(formatCounts).filter(([, c]) => c > 0).map(([f, c]) => `${c}× ${f}`).join(" · ")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRegenerate}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-border bg-muted text-muted-foreground hover:border-primary/50 hover:text-primary">
                <RefreshCw className="w-3 h-3" /> Regenerate
              </button>
              <button onClick={() => { setIdeas([]); setFormatFilter("all"); }}
                className="text-xs font-bold px-3 py-2 rounded-xl border border-border bg-muted text-muted-foreground hover:border-primary/50">
                Reset
              </button>
            </div>
          </div>

          {/* Format filter */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFormatFilter("all")}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${formatFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/50"}`}>
              All 12
            </button>
            {ALL_FORMATS.filter(f => formatCounts[f] > 0).map(f => (
              <button key={f} onClick={() => setFormatFilter(f)}
                className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${formatFilter === f ? "bg-primary text-primary-foreground border-primary" : `bg-muted text-muted-foreground border-border hover:border-primary/50`}`}>
                {FORMAT_META[f].icon}{f}
                <span className="font-normal">({formatCounts[f]})</span>
              </button>
            ))}
          </div>

          {/* Idea cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {displayed.map(idea => (
              <IdeaCard key={idea.id} idea={idea} onCopy={handleCopy} copiedId={copiedId} />
            ))}
          </div>

          {/* Batch filming tip */}
          <div className="rounded-2xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 px-5 py-4 flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide mb-1">Batch Filming Tip</p>
              <p className="text-sm text-foreground font-medium">Filter ideas by format to group your filming sessions. Film all Talking Head ideas in one sitting, then all Tutorial/Demo ideas together. Batching by format saves you from repeatedly setting up and breaking down your filming setup.</p>
            </div>
          </div>
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Instagram Reel Idea Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, icon: <Play className="w-5 h-5 text-primary" />,
              title: "Select your niche, audience, and content pillars",
              desc: "Choose your content niche and optionally describe your specific target audience — the more specific the audience description, the more targeted the ideas. Select 2–6 content pillars from Education, Entertainment, Personal, Promotion, Inspiration, Tips, Behind-the-Scenes, and Motivation. Your pillar selection determines which categories of Reel ideas appear." },
            { step: 2, icon: <Target className="w-5 h-5 text-primary" />,
              title: "Set your goal, experience level, and tone",
              desc: "Goal adjusts which ideas are prioritized: Growth (broad reach hooks), Engagement (opinion and relatable content), Sales (buyer-intent ideas), Authority (deep educational content). Experience level adjusts format complexity — beginners get Talking Head and List formats; advanced creators get Storytime and multi-cut formats. Tone modifies how each hook is phrased." },
            { step: 3, icon: <Sparkles className="w-5 h-5 text-primary" />,
              title: "Get 12 specific, filmable Reel ideas",
              desc: "12 ideas are generated with zero vague concepts — every idea includes the title, content angle, a scroll-stopping hook (under 12 words), the format to film it in, the target audience segment, the post goal, and a specific filming tip. No two consecutive ideas share the same format. Regenerate as many times as needed for fresh sets." },
            { step: 4, icon: <Film className="w-5 h-5 text-primary" />,
              title: "Filter by format for batch filming efficiency",
              desc: "Use the format filter tabs to view all Talking Head ideas, all Tutorial/Demo ideas, or all B-Roll ideas together. Batch filming — filming all ideas of the same format in one session — is the most time-efficient way to create consistent Reel content. Copy any idea to clipboard for use in your content calendar or notes app." },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="flex gap-4 p-5 rounded-2xl bg-muted/40 border border-border hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">{icon}</div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Step {step}</p>
                <h3 className="font-bold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About / SEO ──────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Instagram Reel Idea Generator — Creating Content That Actually Gets Views</h2>
        </div>
        <div className="space-y-7 text-muted-foreground leading-relaxed text-sm">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary flex-shrink-0" />
              Why Most Reel Ideas Fail Before They're Filmed
            </h3>
            <p className="mb-3">
              The biggest Reel idea problem is not a lack of ideas — it's a lack of specific, filmable ideas. Most creators stare at a blank page and think 'I need to create a fitness Reel' or 'I should post something about my business today.' These are categories, not ideas. A category cannot be filmed. An idea can. The difference between a creator who consistently posts strong content and one who posts inconsistently is not inspiration — it's a library of specific, structured ideas they can pick up and film without decision-making overhead.
            </p>
            <p className="mb-3">
              What makes a Reel idea specific enough to film? It answers four questions simultaneously: What exactly is the topic? (Not 'fitness tips' — '3 reasons your push-up form is preventing chest muscle growth') What's the angle? (Not 'educational' — 'mistake callout that challenges what people have been told') What's the hook? (Not 'start strong' — 'The push-up mistake I made for 3 years that gave me zero chest growth') How do I film it? (Not 'on camera' — 'Talking head with 3 text overlays revealing each mistake, demonstrate correct form in final 10 seconds'). This generator provides all four for every idea so you can go from idea to filming in minutes.
            </p>
            <p>
              The format variety engine ensures that your 12 ideas span multiple format types — Talking Head, B-Roll, POV/Skit, Before and After, Tutorial, Storytime, Myth-Busting, Mistake Callout, and List formats. This matters because Instagram's algorithm responds to content variety: accounts that rotate formats attract different audience segments and avoid the algorithmic fatigue that comes from the same format type posted repeatedly.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary flex-shrink-0" />
              The 9 Proven Reel Formats and When to Use Each
            </h3>
            <p className="mb-3">
              Understanding which format to use for which content type is a fundamental Instagram Reels skill. Talking Head — direct-to-camera delivery — is the highest-authority format because it builds the strongest viewer-creator relationship. It's best for opinion content, personal experience, controversial takes, and educational breakdowns that don't require visual demonstration. B-Roll with Text Overlay works best for aspirational content (morning routines, travel, lifestyle) where the visuals do the emotional work and the text overlay carries the information. This format is highly shareable because it works on silent mode.
            </p>
            <p className="mb-3">
              POV and Skit formats are the highest-engagement format by comment count because they create instant identification — when someone sees 'POV: You're the person who...' and that's exactly them, they respond emotionally. Before and After is the most reliably viral format in transformation niches because visual contrast is processed instantly and compels sharing. Tutorial and Demo Reels generate the highest save rates because the viewer wants to reference the steps later. Storytime Reels generate the highest watch time and profile visit rate because narrative structure is inherently compelling.
            </p>
            <p>
              Myth-Busting and Mistake Callout formats generate the highest share rates because they create a social sharing impulse — 'I had no idea this was wrong, and I need to tell people I know who do this.' List format Reels ('5 things that...' '3 mistakes you're making...') consistently perform well because they set a clear expectation (the viewer knows they'll get N items) and create completion motivation. The key principle is that format selection should follow content type, not preference — use the format that best serves the content, not the format you're most comfortable with.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              Hooks, Batch Filming, and Building a Reel Library
            </h3>
            <p className="mb-3">
              The hook is the most important 2 seconds of any Reel. Instagram's algorithm measures scroll-stop rate — what percentage of people who see your Reel in their feed stop and watch instead of scrolling. A weak hook means low scroll-stop rate, which means the algorithm stops distributing the Reel to new viewers, no matter how good the content after the first 3 seconds is. A strong hook must create one of three responses: curiosity (what happens next?), tension (I recognize that problem), or emotion (I feel seen). The strongest hooks are specific to a real audience pain — not 'here are some tips' but 'you're making this mistake and it's costing you results.'
            </p>
            <p>
              Batch filming is the production strategy that separates creators who post consistently from those who create in burst-and-drought cycles. The principle is simple: group ideas by format, film all ideas of the same format in a single session, then edit in batches. A typical batch session of 4–5 Talking Head Reels takes 45–60 minutes total — setting up once, filming all, reviewing takes, moving on. This dramatically reduces the per-Reel time investment compared to setting up, filming, and breaking down for each individual Reel. Use the format filter in this generator to group your 12 ideas by format type before planning your filming schedule — then batch by format for maximum efficiency.
            </p>
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">What This Instagram Reel Idea Generator Includes</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "12 specific, filmable Reel ideas per generation — every idea includes title, content angle, hook, format, audience, goal, and how-to-film tip",
            "9 Reel format types — Talking Head, B-Roll + Text Overlay, POV/Skit, Before & After, Tutorial/Demo, Storytime, Myth-Busting, Mistake Callout, List/Tips — no two consecutive ideas share the same format",
            "Scroll-stopping hooks under 12 words for every idea — hooks are tone-adjusted for Bold, Relatable, Inspirational, Funny, or Controversial delivery",
            "15 niches — Fitness, Beauty, Business, Finance, Tech/AI, Education, Food, Travel, Lifestyle, Fashion, Relationships, Health, Coaching, Photography, Other",
            "4 goal modes — Growth (broad reach hooks), Engagement (relatable and opinion ideas), Sales (buyer-intent content), Authority (deep educational ideas)",
            "3 experience levels — Beginner (Talking Head and List formats), Intermediate (mixed), Advanced (Storytime, multi-format, funnel-based ideas)",
            "5 tone options — Bold, Relatable, Inspirational, Funny, Controversial — each modifies how hooks are phrased across all 12 ideas",
            "Format filter tabs — view all Talking Head, Tutorial, POV, or other format ideas together for batch filming session planning",
            "Regenerate button — produces a fresh set of 12 ideas instantly without repeating the same ideas from the previous generation",
            "Copy to clipboard per idea — each idea copies as formatted plain text with all fields ready to paste into a content calendar or notes app",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} question={item.q} answer={item.a} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
