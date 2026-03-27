import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarDays, Copy, Check, ChevronDown, Sparkles, RefreshCw,
  TrendingUp, Zap, Shield, ListChecks, Search, Target,
  BookOpen, Heart, Megaphone, Star, Play, Images,
  Image, Radio, Clock, BarChart2, Lightbulb, Users, ArrowUpRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche =
  | "fitness" | "beauty" | "business" | "finance" | "tech"
  | "education" | "food" | "travel" | "lifestyle" | "fashion"
  | "relationships" | "health" | "coaching" | "photography" | "other";

type Pillar = "education" | "entertainment" | "personal" | "promotion" | "inspiration" | "tips" | "behindscenes" | "motivation";
type FrequencyOption = 3 | 5 | 7;
type GoalOption = "growth" | "engagement" | "sales" | "authority";
type StyleOption = "educational" | "entertaining" | "personalbrand" | "mixed";
type AvailabilityOption = "low" | "medium" | "high";
type ExperienceOption = "beginner" | "intermediate" | "advanced";
type PostType = "Reel" | "Carousel" | "Static" | "Story";

interface DayPlan {
  day: number;
  dayLabel: string;
  postType: PostType;
  topic: string;
  hook: string;
  pillar: Pillar;
  goal: string;
  time: string;
}

interface StoryIdea {
  day: number;
  dayLabel: string;
  idea: string;
  format: string;
}

interface WeekPlan {
  week: number;
  theme: string;
  days: DayPlan[];
  stories: StoryIdea[];
  weekTip: string;
}

interface CalendarOutput {
  strategyOverview: string;
  weeks: WeekPlan[];
  growthTips: string[];
}

// ─── Content Data ─────────────────────────────────────────────────────────────

const PILLAR_META: Record<Pillar, { label: string; icon: React.ReactNode; color: string }> = {
  education:    { label: "Education",       icon: <BookOpen className="w-3.5 h-3.5" />,   color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400" },
  entertainment:{ label: "Entertainment",   icon: <Play className="w-3.5 h-3.5" />,        color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400" },
  personal:     { label: "Personal",        icon: <Heart className="w-3.5 h-3.5" />,       color: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400" },
  promotion:    { label: "Promotion",       icon: <Megaphone className="w-3.5 h-3.5" />,   color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400" },
  inspiration:  { label: "Inspiration",     icon: <Star className="w-3.5 h-3.5" />,        color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400" },
  tips:         { label: "Tips & Hacks",    icon: <Lightbulb className="w-3.5 h-3.5" />,   color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400" },
  behindscenes: { label: "Behind Scenes",   icon: <Radio className="w-3.5 h-3.5" />,       color: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400" },
  motivation:   { label: "Motivation",      icon: <Zap className="w-3.5 h-3.5" />,         color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400" },
};

const POST_TYPE_META: Record<PostType, { icon: React.ReactNode; color: string; goal: string }> = {
  Reel:     { icon: <Play className="w-3.5 h-3.5" />,   color: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400",   goal: "Reach & Discovery" },
  Carousel: { icon: <Images className="w-3.5 h-3.5" />, color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",             goal: "Saves & Education" },
  Static:   { icon: <Image className="w-3.5 h-3.5" />,  color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400",         goal: "Branding & Authority" },
  Story:    { icon: <Radio className="w-3.5 h-3.5" />,  color: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400",              goal: "Engagement & Trust" },
};

// Niche topic banks per pillar
const NICHE_TOPICS: Record<Niche, Record<Pillar, { topics: string[]; hooks: string[] }>> = {
  fitness: {
    education:    { topics: ["Why most diets fail after 30 days", "The science of progressive overload", "How sleep affects fat loss", "Why protein matters more than calories", "The real role of cortisol in weight gain"], hooks: ["Here's the science behind why...", "Nobody talks about this, but...", "The #1 reason you're not seeing results is...", "What your trainer won't tell you:", "Stop doing this if you want results:"] },
    entertainment:{ topics: ["I tried the viral 12-3-30 treadmill workout", "Rating 5 celebrity fitness routines", "What the gym looks like at 5 AM vs 5 PM", "Gym red flags vs green flags", "Things only gym people understand"], hooks: ["I did this for 30 days and here's what happened...", "This is either brilliant or ridiculous...", "POV: You're at the gym and...", "Rating this so you don't have to...", "The ones who do this always..."] },
    personal:     { topics: ["My honest fitness journey so far", "What I eat in a day (real life, not perfect)", "The workout I almost quit", "How I stay consistent when life gets hard", "My biggest fitness regret"], hooks: ["I'm going to be really honest with you...", "Nobody shows the messy parts, so here's mine:", "This is embarrassing to admit but...", "Here's what no one saw:", "If I could go back and tell myself..."] },
    promotion:    { topics: ["My 8-week program just opened", "Client results that blew my mind this month", "What you get inside my coaching program", "The reason I built this program", "Limited spots available — here's why it works"], hooks: ["I've never shared this proof before:", "My client was skeptical at first, then...", "This is what 8 weeks can do:", "The program I wish existed when I started:", "If you're serious about results, read this:"] },
    inspiration:  { topics: ["From 40 lbs overweight to completed a half marathon", "The mindset that changed everything for me", "Progress > perfection — here's proof", "What 1 year of consistency looks like", "You don't have to be perfect to start"], hooks: ["A year ago, I couldn't...", "This person started exactly where you are:", "The before photo nobody sees:", "This is what showing up every day looks like:", "Proof that slow progress is still progress:"] },
    tips:         { topics: ["3 morning habits that torch fat before breakfast", "How to build muscle at home with no equipment", "The 10-minute workout that actually works", "5 ways to make meal prep easier", "How to stay on track on weekends"], hooks: ["Do this first thing in the morning:", "You only need 10 minutes. Here's what to do:", "The weekend always kills progress unless...", "5 things I do differently (and they work):", "Steal this meal prep system:"] },
    behindscenes: { topics: ["What my actual week of training looks like", "How I plan my workouts for the week", "My real grocery haul (no BS)", "What a coaching call actually looks like", "The part of training no one films"], hooks: ["Here's what my real week looks like:", "I've never shown this before:", "The unfiltered side of consistency:", "This is what the work actually looks like:", "Pulling back the curtain on:"] },
    motivation:   { topics: ["You don't need motivation — you need a system", "What to do when you don't want to train", "The 2-minute rule that changed my consistency", "Why 'I'll start Monday' is keeping you stuck", "The one mindset shift that fixes everything"], hooks: ["Stop waiting for motivation. Instead:", "The 2-minute rule sounds too simple, but...", "Every successful person does this instead:", "If you keep saying 'I'll start Monday'...", "This one shift changes everything:"] },
  },
  business: {
    education:    { topics: ["How to validate a business idea in 7 days", "The pricing formula most founders get wrong", "Why most businesses fail in year 1", "How to write a value proposition that converts", "The difference between revenue and profit"], hooks: ["Most people skip this step and it costs them everything:", "Before you start your business, you need to know this:", "The pricing mistake that's leaving money on the table:", "Here's the formula that actually works:", "After working with 100+ businesses, here's what I see:"] },
    entertainment:{ topics: ["Business ideas I wish I'd started 5 years ago", "Rating startup advice from billionaires", "The worst business advice I ever got", "Entrepreneur types — which one are you?", "Things they don't teach you about business"], hooks: ["If I could start over, I'd do this instead:", "I ranked every piece of advice and the results are...", "This advice sounds smart but it's actually terrible:", "Which founder type are you? Here's how to tell:", "School teaches none of this:"] },
    personal:     { topics: ["The business decision that almost broke me", "My first year revenue — honest breakdown", "What I sacrificed to build this business", "The month I almost quit", "How I got my first 10 clients"], hooks: ["I've never shared these numbers publicly before:", "Year 1 of my business looked nothing like I expected:", "This decision cost me $20K and here's what I learned:", "I was 2 weeks from quitting. Here's what changed:", "My first client came from something I almost didn't do:"] },
    promotion:    { topics: ["My coaching program has 3 spots left", "Here's exactly what my 1:1 service includes", "The ROI my clients see in 90 days", "What to expect when you work with me", "Client case study — from zero to $10K/month"], hooks: ["I'm opening 3 spots this month — here's what you get:", "By month 3, my clients typically see...", "This is exactly what we work on together:", "The case study my clients keep asking me to share:", "If you want results like this, here's what to do:"] },
    inspiration:  { topics: ["From corporate job to 6-figure business in 18 months", "The business failure that set me up for success", "What building in public has taught me", "Starting over at 40 — and winning", "The rejection that became my biggest breakthrough"], hooks: ["18 months ago I had no clients and no idea...", "I failed publicly and here's what happened next:", "Building in public forced me to...", "Starting over was the best thing that ever happened to me:", "The rejection I'm most grateful for:"] },
    tips:         { topics: ["5 tools I use to run my business solo", "How to get your first client with no audience", "The email template that closes leads", "How to raise your prices without losing clients", "The content system that saves me 5 hours a week"], hooks: ["I run a solo business with these 5 tools:", "You don't need an audience to get your first client. You need:", "Copy this email word for word:", "How to raise prices without a single angry email:", "This content system took me from 3 hours to 30 minutes:"] },
    behindscenes: { topics: ["How I structure my work week", "My content batching day — start to finish", "The real cost of running a one-person business", "Behind the scenes of onboarding a new client", "What my actual CEO day looks like"], hooks: ["Here's exactly how I run my business week:", "Content batching day looks like this in real life:", "The hidden costs nobody talks about:", "Client onboarding behind closed doors:", "My CEO day (it's not what you think):"] },
    motivation:   { topics: ["Entrepreneurship is hard. Here's how to keep going", "What to do when your business feels stuck", "The mindset difference between struggling and thriving founders", "Why slow growth is still growth", "The business truth no one posts about"], hooks: ["Nobody posts the hard days, so here's mine:", "When business feels stuck, do this instead:", "The gap between struggling founders and thriving ones:", "Slow growth is not a failure. Here's why:", "This is the business truth they hide from you:"] },
  },
  beauty: {
    education:    { topics: ["The skincare ingredients that actually work", "How to layer your skincare correctly", "Why your moisturizer might be making your skin worse", "SPF explained for beginners", "The truth about hyaluronic acid and dry skin"], hooks: ["You're applying your skincare in the wrong order:", "This ingredient is in everything and here's why:", "Your moisturizer might actually be drying you out:", "SPF is not optional. Here's what you need to know:", "Hyaluronic acid myths vs reality:"] },
    entertainment:{ topics: ["I tried 5 viral skincare routines — honest review", "Rating my followers' skincare routines", "Drugstore vs luxury — I tested both for a month", "Things only skincare obsessed people understand", "Testing every sunscreen so you don't have to"], hooks: ["I did this so you don't have to:", "Your routine has how many steps??", "This drugstore product beat the $80 one and I have proof:", "Skincare people will understand this instantly:", "Month-long sunscreen test results:"] },
    personal:     { topics: ["My honest skin journey from hormonal acne to clear skin", "The skincare mistake I made for years", "What finally worked for my skin after trying everything", "My real morning routine (no filters)", "How I learned to love my skin at every stage"], hooks: ["I had the worst hormonal acne for 3 years. Here's what changed:", "I was doing this wrong for years and nobody told me:", "After trying everything, the thing that finally worked was:", "This is my real morning routine, including the messy parts:", "It took me 5 years to love my skin. Here's how:"] },
    promotion:    { topics: ["My favorite skincare products this month", "Why I recommend this serum to every client", "The only cleanser I've repurchased 4 times", "The routine I recommend for beginners", "This is the product that changed my clients' skin"], hooks: ["I've recommended this to over 200 people and the results:", "I've repurchased this 4 times. Here's why:", "My beginner skincare routine that actually delivers:", "I couldn't keep this product recommendation to myself:", "The before/after from my clients says everything:"] },
    inspiration:  { topics: ["Clear skin is about consistency, not products", "What I'd tell my acne-ridden younger self", "Progress is not linear — my skin proof", "Beauty is not a standard. It's a feeling.", "How I stopped letting my skin define my confidence"], hooks: ["Consistency beats perfection every time and here's proof:", "To my past self struggling with acne:", "This is 6 months of skin progress — real, unfiltered:", "I used to skip events because of my skin. Now:", "Your skin doesn't define your beauty. And here's why I know:"] },
    tips:         { topics: ["5 skincare habits that changed my skin", "How to build a routine if you're starting from scratch", "The exact order to apply skincare products", "How to layer active ingredients safely", "Morning vs night routine — what's different and why"], hooks: ["5 habits that changed my skin (free to do):", "If you're starting from zero, do this:", "Print this out — the correct order to apply everything:", "Mixing these ingredients can ruin your skin barrier:", "Morning and night routines should not be identical. Here's why:"] },
    behindscenes: { topics: ["What a skincare photoshoot day looks like", "How I research new products before recommending them", "Behind the scenes of editing a makeup tutorial", "My real makeup bag — everything in it", "How I batch create beauty content in a day"], hooks: ["The photoshoot days nobody sees:", "My research process before recommending anything:", "The editing side of beauty content (it's a lot):", "Everything in my everyday makeup bag:", "I batch all my content in one day. Here's how:"] },
    motivation:   { topics: ["Your skin doesn't have to be perfect to be beautiful", "The day I stopped comparing my skin to filters", "Why slow skincare progress is still progress", "Taking care of your skin is an act of self-care", "The mindset shift that made my skincare consistent"], hooks: ["Perfect skin isn't real. Here's the truth:", "The day I stopped comparing my skin changed everything:", "3 months of consistent skincare looks like:", "This is not vanity. This is self-care:", "I was never consistent until I changed how I thought about it:"] },
  },
  finance: {
    education:    { topics: ["How compound interest actually works (with real numbers)", "The difference between an asset and a liability", "How to read your first brokerage statement", "What an emergency fund actually should look like", "Roth IRA vs Traditional IRA — simple explanation"], hooks: ["If you put $500/month into this at 25, here's what you have at 60:", "Most people don't know the difference. Let me fix that:", "Your brokerage statement is trying to tell you something:", "Your emergency fund is probably wrong. Here's the right size:", "Nobody taught us this in school so here it is simply:"] },
    entertainment:{ topics: ["I tracked every dollar I spent for 30 days — results", "Rating money advice from TikTok influencers", "Things rich people do that broke people don't", "Money habits I grew up with vs what actually works", "The worst financial decisions people make in their 20s"], hooks: ["I tracked everything I spent. Here's what shocked me:", "I rated every viral money tip and the results are wild:", "Rich people quietly do this and nobody talks about it:", "I grew up doing this with money. I was completely wrong:", "Stop doing these 5 things in your 20s:"] },
    personal:     { topics: ["The debt I was embarrassed to talk about", "How I paid off $30K in 18 months", "My honest money mistakes from my 20s", "What my finances looked like before I learned this", "How I went from paycheck to paycheck to saving 30%"], hooks: ["I was too embarrassed to talk about my debt. Until now:", "Here's the exact plan I used to pay off $30K:", "The money mistakes I made in my 20s that cost me:", "Here's what nobody told me about money when I was starting out:", "Paycheck to paycheck is a cycle. Here's how I broke it:"] },
    promotion:    { topics: ["My budgeting template is now available", "Inside my financial coaching program", "What my clients achieve in 90 days of coaching", "My free resource for people starting from zero", "The money course I wish existed 10 years ago"], hooks: ["The template I use for my own money is now yours:", "Inside my 90-day financial coaching program:", "My clients go from broke to savings in 3 months. Here's how:", "I built the free resource I wish I had when I started:", "This course changed how my clients think about money:"] },
    inspiration:  { topics: ["First-generation wealth builder — my story", "How I went from $0 savings to $50K in 3 years", "The moment money clicked for me", "Building wealth isn't about income — it's about behavior", "Financial freedom doesn't happen overnight, but here's proof it's real"], hooks: ["Nobody in my family taught me about money. So I learned on my own:", "$0 savings to $50K in 3 years. Here's every step:", "I used to think I needed to earn more. I was wrong:", "Wealth is a behavior before it's a number:", "3 years ago I had nothing saved. Here's where I am now:"] },
    tips:         { topics: ["5 money habits to start before 30", "How to automate your savings without thinking about it", "The 50/30/20 rule explained with real numbers", "How to negotiate a raise step by step", "3 ways to make extra money with skills you already have"], hooks: ["Start these 5 habits immediately:", "Set this up once and save automatically forever:", "Let me show you the 50/30/20 rule with real numbers:", "The exact script to ask for a raise:", "You already have skills people will pay for:"] },
    behindscenes: { topics: ["How I structure my monthly money review", "Inside my budgeting spreadsheet", "What my investing portfolio actually looks like", "How I made my first investment (the real story)", "A week of money decisions — the honest version"], hooks: ["My monthly money review looks like this:", "The actual spreadsheet I use (you can copy it):", "My real portfolio, not the pretty version:", "My first investment was terrifying. Here's the story:", "Every money decision I made this week:"] },
    motivation:   { topics: ["Start before you feel ready — the money version", "The financial progress nobody posts about", "Broke is a mindset before it's a situation", "Small steps toward financial freedom still count", "Your money situation is not your final answer"], hooks: ["You don't need to be perfect with money. You need to start:", "The financial progress that doesn't look impressive but is:", "Before broke was my situation, it was my mindset:", "Moving $25 into savings still counts. Here's why:", "Where you are financially right now is not permanent:"] },
  },
  tech: {
    education:    { topics: ["How AI actually works in simple terms", "What prompt engineering really means", "The difference between GPT-3, GPT-4, and Claude", "What an API is and why non-tech people need to know", "How to use AI to do research 10x faster"], hooks: ["AI explained the way nobody actually explains it:", "Prompt engineering is not magic. It's this:", "GPT-4 vs Claude — here's what the comparison actually means:", "You use APIs every day and don't realize it:", "I research in 20 minutes what used to take 3 hours:"] },
    entertainment:{ topics: ["I replaced my entire workflow with AI tools for a week", "Rating AI tools that went viral this month", "Tech predictions I got completely wrong", "The AI tool that blew my mind this week", "Things I thought AI could never do (until now)"], hooks: ["I went full AI for a week. Here's what broke:", "I tested every viral AI tool. The honest results:", "My tech prediction from 2 years ago — right or wrong?", "This AI tool genuinely surprised me:", "I thought AI couldn't do this. I was wrong:"] },
    personal:     { topics: ["How I used AI to change my entire work system", "The tech tool that saved my productivity", "What my digital workflow actually looks like", "The AI mistake I made that cost me time", "From tech skeptic to AI user — my honest story"], hooks: ["I resisted AI for a year. Here's why I finally gave in:", "This one tool changed how I work:", "My real digital workflow (messy but effective):", "I made this AI mistake and lost 3 hours:", "I was deeply skeptical. Here's what changed my mind:"] },
    promotion:    { topics: ["My AI productivity course is open", "The tools I recommend for non-tech creators", "My AI workflow template is available now", "Inside my tech stack for running a solo business", "The AI toolkit that saves my clients 10 hours a week"], hooks: ["I built a course around the system that saved me 15 hours:", "The 5 tools I recommend to every non-tech creator:", "My workflow template is now available — here's what's inside:", "Here's every tool in my business stack:", "My clients save 10 hours a week with this toolkit:"] },
    inspiration:  { topics: ["How one tool transformed my business output", "AI didn't replace me — it multiplied me", "From overwhelmed creator to streamlined operation", "The productivity system that gave me my evenings back", "You don't need to be technical to use AI"], hooks: ["Before this tool, I worked 60 hours. Now I work 40:", "AI didn't take my job. It gave me more time to do it:", "6 months ago my workflow was chaos. Now:", "I reclaimed my evenings by changing one system:", "Non-technical and thriving with AI — here's how:"] },
    tips:         { topics: ["5 AI tools every creator needs right now", "How to write better ChatGPT prompts", "The 3 automations that save me 5 hours a week", "How to use Notion AI for content planning", "3 ways to use AI without losing your voice"], hooks: ["My 5 essential AI tools — free or cheap:", "Better prompts = better output. Here's how:", "I automated these 3 things and got my time back:", "Notion AI for content creation — the full breakdown:", "Stay human in your content while using AI:"] },
    behindscenes: { topics: ["My AI-assisted content creation process", "How I batch content with automation tools", "The Notion setup I use to run my business", "Behind the scenes of my digital workflow", "What a high-output creator day looks like with AI"], hooks: ["Here's exactly how I create content with AI:", "My batch content day from start to finish:", "The Notion workspace I use every single day:", "My full digital workflow — everything shown:", "This is what a highly productive creator day looks like:"] },
    motivation:   { topics: ["You don't need to be a developer to thrive in the AI era", "Adapting to technology is a superpower, not a threat", "The creators who learn AI now will win later", "Overwhelmed by tech? Start here.", "Small tech improvements compound into big results"], hooks: ["The AI era doesn't require you to code:", "Adapting to tech isn't surrender — it's strategy:", "The creators learning AI tools right now are building a moat:", "If tech feels overwhelming, this is where to start:", "One new tool a month changes everything over a year:"] },
  },
  education: {
    education:    { topics: ["How to learn anything in 20 hours", "The Feynman Technique explained simply", "Why most people forget what they read", "How to take notes that you actually use", "The difference between active and passive learning"], hooks: ["You can learn anything in 20 hours. Here's the method:", "The Feynman Technique is the fastest way to understand anything:", "You forget 70% of what you read. Here's the fix:", "The notes you take are useless unless you do this:", "Passive learning feels productive but it's not:"] },
    entertainment:{ topics: ["Things school never taught us about learning", "Comparing study methods — which actually works", "I studied every day for 30 days — here's what changed", "The funniest learning fails and what they teach us", "Student life expectations vs reality"], hooks: ["School optimized you for tests, not learning. Here's the difference:", "I tested every study method. The ranking surprised me:", "30 days of deliberate study changed these 5 things:", "Even the worst learning failures teach something:", "Nobody warned me that student life would look like this:"] },
    personal:     { topics: ["How I went from failing student to self-directed learner", "The subject I thought I couldn't learn (I was wrong)", "My honest study routine — what works and what doesn't", "What college taught me vs what life taught me", "The year I committed to learning one new skill per month"], hooks: ["I was a failing student who became obsessed with learning:", "I genuinely believed I couldn't learn this. Then:", "My real study routine — including the parts I skip:", "College gave me a degree. Life gave me an education. Here's the difference:", "12 months, 12 skills — here's what I actually learned:"] },
    promotion:    { topics: ["My learning resources and where to start", "The online course I built for fast learners", "What's inside my study system template", "My recommended reading list this month", "The learning community I'm building"], hooks: ["Here's the resource I recommend every new learner:", "The course I built from 5 years of learning research:", "My study system is now a template you can use:", "These books changed how I think about learning:", "I'm building a community of obsessed learners — here's how to join:"] },
    inspiration:  { topics: ["You're never too old to learn something new", "How one skill changed the trajectory of my life", "Learning is the only investment that can't be taken away", "From high school dropout to self-taught expert", "The most valuable thing you can learn isn't a subject"], hooks: ["I started learning this at 45 and it changed everything:", "One skill shifted my entire career. Here's the story:", "You can lose money, jobs, and things — but never what you know:", "I dropped out at 16 and never stopped learning. Here's where I am now:", "The most valuable skill isn't technical. It's this:"] },
    tips:         { topics: ["5 study habits that work (backed by science)", "How to retain information for longer", "The spaced repetition system that makes forgetting impossible", "How to focus when your brain refuses to cooperate", "3 things to do before you start studying"], hooks: ["5 science-backed study habits (not the obvious ones):", "Stop forgetting things. Do this instead:", "Spaced repetition sounds complicated but it's actually:", "When focus won't come, this is how you force it:", "Do these 3 things before you open a book:"] },
    behindscenes: { topics: ["How I structure my daily learning block", "Behind the scenes of creating an online course", "My reading system — how I read 50 books a year", "What my actual note-taking system looks like", "How I turn learning into content"], hooks: ["Here's exactly how I protect my daily learning time:", "Creating an online course is not what I expected:", "I read 50 books a year. Here's the exact system:", "My note-taking system — every step:", "The process of turning what I learn into content I can share:"] },
    motivation:   { topics: ["Learning is uncomfortable — that's how you know it's working", "The day I stopped waiting to be taught and started teaching myself", "Consistent learning beats talent every time", "Growth is uncomfortable and that's okay", "What compounding learning looks like after 5 years"], hooks: ["If learning feels easy, you're not actually learning:", "The day I took responsibility for my own education:", "Talent is a starting point. Consistency is the strategy:", "Discomfort is a signal that you're getting better:", "5 years of consistent learning adds up to this:"] },
  },
  food: {
    education:    { topics: ["Why meal prep saves money and time", "How to build a balanced meal without counting calories", "The truth about ultra-processed food", "How to read a nutrition label properly", "The 5 nutrients most people are deficient in"], hooks: ["Meal prep is not for fitness people — it's for everyone. Here's why:", "Build a balanced plate without obsessing over numbers:", "Ultra-processed food is everywhere. Here's what to avoid:", "Reading a nutrition label is a skill. Here's how:", "You're probably deficient in at least one of these:"] },
    entertainment:{ topics: ["I tried cooking every meal from one country for a week", "Rating every viral recipe trend of the year", "The recipe I failed 4 times before getting right", "Cooking with only pantry staples — the challenge", "Expectations vs reality: cooking recipes from Instagram"], hooks: ["One country's cuisine for a whole week. Here's what I learned:", "Viral recipe ranked by someone who actually tested them:", "I failed this recipe 4 times. Here's attempt 5:", "Empty fridge, full pantry — what I actually made:", "That Instagram recipe looks amazing. Reality:"] },
    personal:     { topics: ["How cooking changed my relationship with food", "The meal that reminds me of my childhood", "My honest relationship with meal prep (it's complicated)", "The week I almost gave up on eating healthy", "How I started cooking after years of takeout"], hooks: ["Cooking taught me more about discipline than fitness ever did:", "This dish takes me straight back to being 8 years old:", "Meal prep and I have a complicated relationship:", "The week healthy eating fell apart — and what I did next:", "I ordered takeout every day for years. Here's what changed:"] },
    promotion:    { topics: ["My meal prep guide is available now", "The recipe book I spent 3 months creating", "My 5-day healthy eating plan (downloadable)", "What's inside my cooking course", "The tool that makes meal prep 3x faster"], hooks: ["My complete meal prep system in one guide:", "3 months of testing every recipe. Now it's a book:", "5 days of meals planned for you — download here:", "Inside my cooking course — what you'll actually learn:", "This single kitchen tool changed my meal prep game:"] },
    inspiration:  { topics: ["How home cooking became my form of self-care", "The impact of cooking for people you love", "Learning to cook at 35 — why it's never too late", "How eating better changed my energy and mood", "Food is culture — here's what my kitchen taught me about mine"], hooks: ["I discovered that cooking is my meditation:", "The most loving thing I do is cook for people I care about:", "I learned to cook at 35. Here's what I was missing:", "I changed what I ate and my energy transformed:", "Every dish in my kitchen carries a story from where I come from:"] },
    tips:         { topics: ["5 meal prep containers that make the system work", "How to cook 5 meals in 1 hour", "The ingredients to always have in your kitchen", "3 high-protein meals under 30 minutes", "How to make healthy eating actually taste good"], hooks: ["The containers that make meal prep sustainable:", "Here's how to cook 5 full meals in exactly 60 minutes:", "Keep these 10 ingredients in stock and you can always cook:", "High protein, fast, and actually delicious:", "Healthy food doesn't have to taste like nothing:"] },
    behindscenes: { topics: ["My weekly meal prep process from start to finish", "What my grocery shopping routine looks like", "Behind the scenes of filming a recipe video", "How I develop and test a new recipe", "My kitchen organization system"], hooks: ["Start to finish — my full meal prep Sunday:", "My weekly grocery run — what I actually buy:", "Recipe video filming days are not glamorous:", "Testing a new recipe takes more tries than you think:", "An organized kitchen is the foundation of consistent cooking:"] },
    motivation:   { topics: ["You don't need to be a chef to eat well", "Start with one healthy meal — just one", "Consistency in the kitchen beats perfection", "The compound effect of cooking at home", "Cooking for yourself is an act of self-respect"], hooks: ["You can eat well without culinary school. Here's proof:", "One healthy meal is all you need to start:", "The kitchen doesn't require perfection — just showing up:", "Cooking at home 5 days a week for a year adds up to:", "Every meal you cook for yourself is a decision to invest in yourself:"] },
  },
  travel: {
    education:    { topics: ["How to find cheap flights using Google Flights", "The credit card points strategy for free travel", "How travel insurance actually works", "What to know about solo travel safety", "The truth about budget travel hidden costs"], hooks: ["Google Flights has a feature most people never use:", "I flew business class for free using only credit card points:", "Travel insurance doesn't cover what you think it does:", "Solo travel safety is about systems not luck:", "Budget travel has hidden costs. Here's what to budget for:"] },
    entertainment:{ topics: ["Things that shocked me traveling in [region]", "Rating every travel tip that went viral", "Travel planning disasters that taught me lessons", "The most overrated travel destination vs what's actually worth it", "Airport situations every traveler has experienced"], hooks: ["I was not prepared for this about [place]:", "I tested every viral travel hack. Here's the truth:", "My worst travel planning decision and what happened next:", "Everyone says go to [place]. I went. Here's my honest take:", "Every single traveler has had this exact airport experience:"] },
    personal:     { topics: ["How travel changed the way I see people", "The trip that I almost didn't take", "What I've learned traveling solo as a woman", "The country that made me rethink everything", "Why I sold everything to travel full-time"], hooks: ["A conversation on a train in [country] changed something in me:", "I almost didn't book this trip. I'm so glad I did:", "Traveling solo as a woman taught me more about myself than anything else:", "I arrived with one set of beliefs about the world. I left with another:", "Here's what happened when I sold everything:"] },
    promotion:    { topics: ["My travel planning resource is available", "The packing list that fits everything in a carry-on", "My budget travel guide for [region]", "Inside my travel content course", "The app that plans your trip for you"], hooks: ["The travel planning system I've been building for a year:", "My carry-on only packing system — fits 2 weeks:", "I documented everything about affordable [region] travel:", "Inside my content creation course for travel creators:", "This app plans better itineraries than most travel agents:"] },
    inspiration:  { topics: ["The world is bigger than your comfort zone", "How travel cured my burnout", "One trip that changed my relationship with myself", "Travel doesn't have to be expensive to be meaningful", "The people you meet traveling change you forever"], hooks: ["Your comfort zone has a wall. Travel removes it:", "I was burned out and I booked a one-way flight. Here's what happened:", "This trip didn't change where I was going — it changed who I was:", "The most meaningful trip I've taken cost under $800:", "I still think about the people I met in [place]:"] },
    tips:         { topics: ["5 things to do before every trip", "How to pack in a carry-on for 2 weeks", "The app that saves me money on every booking", "How to avoid tourist traps in any city", "Budget travel hacks that actually work"], hooks: ["Do these 5 things before any trip:", "Two weeks, one bag. Here's exactly how:", "I save an average of $200 per trip with this app:", "Tourist traps are everywhere. Here's how to avoid them:", "Real budget travel hacks that don't make you miserable:"] },
    behindscenes: { topics: ["What a travel content creation day looks like", "How I plan a trip from scratch", "The unglamorous side of being a travel creator", "My travel gear and camera setup", "How I manage money while traveling full-time"], hooks: ["Travel content looks effortless. It's not:", "My trip planning process from zero to booked:", "Nobody shows you this part of travel content creation:", "Every piece of gear I travel with and why:", "Full-time travel finances — the real numbers:"] },
    motivation:   { topics: ["You don't need to be rich to travel", "Stop waiting for the perfect time to travel — there isn't one", "Travel is not a reward. It's a choice.", "One trip changes your perspective permanently", "The regret of not traveling is worse than the fear of going"], hooks: ["Middle class income, world traveler. Here's how:", "The perfect time to travel doesn't exist. Here's what to do instead:", "Travel isn't for the wealthy — it's for the committed:", "Every single person who's traveled says this changed their perspective:", "The regret of not going is heavier than the fear of going:"] },
  },
  lifestyle: {
    education:    { topics: ["How habits actually form (and break)", "The science behind morning routines", "Why your environment shapes your behavior", "How to build a life you don't need to escape from", "The 5 pillars of a sustainable healthy lifestyle"], hooks: ["Habits form in 3 stages. Here's what they are:", "Morning routines work because of this one principle:", "Your environment is setting you up to fail or succeed:", "Building a life you love is a design problem:", "5 pillars. Most people only focus on 1:"] },
    entertainment:{ topics: ["I followed a 5 AM club routine for 30 days", "Rating wellness trends that went viral this year", "A day in my life — honest, not curated", "Slow living vs hustle culture — what I actually believe", "Things I do differently than most people"], hooks: ["30 days of 5 AM. Here's every honest result:", "Wellness trends ranked by someone who tried them:", "A real day in my life — not the pretty version:", "I've lived on both sides. Here's what I actually think:", "I do things differently. Here's what and why:"] },
    personal:     { topics: ["The lifestyle change that was harder than I expected", "How I built a morning routine that actually sticks", "The year I simplifies my entire life", "What burnout taught me about how I was living", "Choosing slow living in a world obsessed with hustle"], hooks: ["I thought lifestyle change was easy. I was completely wrong:", "It took me 6 attempts to build a morning routine that stuck:", "I spent a year removing things instead of adding them:", "Burnout didn't happen to me. I created it:", "Everyone says hustle. I say something different:"] },
    promotion:    { topics: ["My habit tracker template is available", "Inside my lifestyle design workshop", "The morning routine guide I wish I had earlier", "My daily planner system — now a template", "My self-care resource for people who think they don't have time"], hooks: ["The habit tracker I built for myself is now yours:", "Inside my lifestyle design workshop — what we work on:", "The morning routine guide that took me 2 years to figure out:", "My planning system is now a template:", "This self-care resource is for people who always say they're too busy:"] },
    inspiration:  { topics: ["The version of me I chose to become", "How slowing down made me more productive", "Small daily choices that compound into a great life", "The mindset shift that redesigned my lifestyle", "Proof that simple living is a form of abundance"], hooks: ["I made a decision about who I was going to be. Here's what happened:", "I slowed down and somehow got more done:", "Small choices are not small when you multiply them by 365:", "One mindset shift redesigned my entire way of living:", "Simple living feels like deprivation until it feels like freedom:"] },
    tips:         { topics: ["5 habits for a calmer, more intentional life", "How to design a morning routine from scratch", "The evening routine that sets up a better tomorrow", "How to simplify your schedule without sacrificing anything", "3 micro habits that change your entire day"], hooks: ["5 habits that quieted the noise in my life:", "Your morning routine can be designed in an afternoon:", "What you do at night determines how tomorrow starts:", "Simplify your schedule with this one question:", "3 habits that take under 10 minutes and change everything:"] },
    behindscenes: { topics: ["What my real daily routine looks like", "How I plan my week on Sunday", "My home organization system", "What my workspace looks like and how it affects my work", "How I manage social media without being consumed by it"], hooks: ["My real routine — not the aesthetic version:", "Sunday is a system. Here's mine:", "An organized home changes how you feel. Here's my system:", "Your workspace affects your work output. Here's mine:", "I use social media every day without feeling controlled by it:"] },
    motivation:   { topics: ["You are allowed to want a different life", "Progress is quiet. Keep going anyway.", "Lifestyle change is not a destination — it's a practice", "The person you want to be already exists — in your daily choices", "Comparison is the lifestyle killer. Here's the antidote"], hooks: ["If you want a different life, you are allowed to build one:", "Progress doesn't always look like progress. Keep going:", "There is no arrival point in lifestyle design:", "The person you're becoming shows up in what you do daily:", "The moment I stopped comparing, I started living:"] },
  },
  fashion: {
    education:    { topics: ["How to build a capsule wardrobe that never goes out of style", "Fabric quality — what to look for", "The color theory basics every fashionable person knows", "How to dress for your body type (without rigid rules)", "Understanding sustainable fashion vs fast fashion"], hooks: ["A capsule wardrobe is 30 pieces for every occasion:", "You can tell a quality garment before you touch it:", "Color theory changed the way I get dressed:", "Body-type dressing without the old rulebook:", "Sustainable vs fast fashion — the real impact:"] },
    entertainment:{ topics: ["I only wore neutral tones for a month", "Styling 1 outfit 5 different ways", "Rating celebrity looks from this week's events", "Thrift store vs designer — styled identically", "Fashion weeks ranked by a real person"], hooks: ["No color for 30 days. Here's what happened:", "One outfit. Five completely different looks:", "The celebrity outfits this week, rated:", "I styled the same look for $30 and $300:", "Fashion week from an actual person's perspective:"] },
    personal:     { topics: ["How my style evolved and what drove it", "The outfit that made me feel completely myself", "Dressing well on a tight budget — my story", "How fashion became my form of self-expression", "The fashion rules I broke and why I'm glad I did"], hooks: ["My style in my 20s vs now — and why it changed:", "I've worn thousands of outfits. This one made me feel most like me:", "Looking good on a small budget was a skill I had to learn:", "Fashion is the first story I tell about myself:", "I broke every rule. My style got better:"] },
    promotion:    { topics: ["My styling guide is available now", "Inside my personal styling session", "My capsule wardrobe template — every piece you need", "The clothing brands I actually recommend", "What a wardrobe edit with me looks like"], hooks: ["My complete styling guide is finally here:", "A personal styling session with me looks like this:", "Every piece in my capsule wardrobe template:", "I only recommend brands I actually wear:", "Wardrobe edit — what we keep, what we remove:"] },
    inspiration:  { topics: ["Style is confidence — and confidence changes everything", "Dressing for who you're becoming, not who you were", "The day I stopped dressing for others", "Fashion is accessible — you just need to know the system", "Every outfit is a decision about how you show up"], hooks: ["Confidence is a skill. Dressing well helps build it:", "Dress for the version of yourself you're becoming:", "I stopped dressing to please other people and found my style:", "Expensive is not the same as stylish. Here's proof:", "Getting dressed is not a chore. It's a daily intention:"] },
    tips:         { topics: ["5 wardrobe basics every adult should own", "How to style an oversized blazer 4 ways", "The color combinations that always work", "How to look put-together in under 10 minutes", "How to shop second hand without wasting time"], hooks: ["Own these 5 basics and you can always get dressed:", "One blazer, four outfits:", "These color combinations never fail:", "Polished in 10 minutes. Here's how:", "Thrifting tips that save you time and money:"] },
    behindscenes: { topics: ["What a styling shoot day looks like", "How I plan my outfits a week in advance", "Inside my wardrobe organization system", "The content creation process for fashion posts", "My shopping process — how I actually buy clothes"], hooks: ["Styling shoot days — nothing like you imagine:", "I plan every outfit on Sunday. Here's the system:", "My wardrobe doesn't have a single unnecessary piece:", "Fashion content creation behind the scenes:", "I shop intentionally. Here's my full process:"] },
    motivation:   { topics: ["You can dress well at any budget", "Your appearance is not your worth but your presentation matters", "Small style upgrades create big confidence shifts", "It's never too late to discover your style", "Dressing well is a form of self-respect, not vanity"], hooks: ["Budget is not a barrier to style:", "How you present yourself affects how you feel:", "One upgraded item shifted my confidence entirely:", "I found my style at 38. It's never too late:", "Getting dressed intentionally is self-care:"] },
  },
  relationships: {
    education:    { topics: ["What the 4 attachment styles actually mean", "The psychology of attraction — what drives it", "How communication styles affect relationship quality", "What emotional intelligence really looks like in relationships", "The science behind why people stay in unhealthy relationships"], hooks: ["Your attachment style is running your love life. Here's how:", "Attraction is psychology before it's feeling:", "Your communication style is either connecting or disconnecting you:", "Emotional intelligence in relationships looks like this:", "Trauma bonding is not love. Here's the difference:"] },
    entertainment:{ topics: ["Green flags vs red flags — the real list", "Dating show dynamics explained by psychology", "Ranking relationship advice from the internet", "The most common relationship patterns people don't see", "Dating in your 30s vs your 20s — what actually changes"], hooks: ["The green/red flag list nobody made but everyone needed:", "Reality dating shows from a psychology standpoint:", "I ranked every piece of relationship advice online:", "The pattern playing out in most relationships:", "Dating at 32 vs 22 — everything that's different:"] },
    personal:     { topics: ["The relationship that taught me my standards", "What I learned from my most difficult breakup", "How I unlearned unhealthy relationship patterns", "The moment I realized what healthy love looks like", "How I built a better relationship with myself before anyone else"], hooks: ["One relationship completely changed what I was willing to accept:", "My worst breakup taught me the most important lesson:", "I grew up with these patterns and had to consciously unlearn them:", "Healthy love felt weird to me at first. Here's why:", "I spent a year single on purpose. Here's what I learned:"] },
    promotion:    { topics: ["My relationship workbook is available", "Inside my dating confidence coaching program", "The communication tool my clients use in every relationship", "My free guide to setting healthy boundaries", "What working with me on relationships looks like"], hooks: ["The workbook I built for people relearning relationship patterns:", "Inside my dating confidence coaching — what we work on:", "This communication framework changed everything for my clients:", "My free boundary-setting guide is available now:", "Here's what relationship coaching with me looks like:"] },
    inspiration:  { topics: ["You deserve a love that doesn't require self-abandonment", "Healing is not linear — relationship version", "The relationship you have with yourself sets the standard", "From people-pleaser to healthy boundaries — the journey", "What thriving in a relationship actually looks like"], hooks: ["You should not have to shrink yourself to be loved:", "Healing in relationship patterns doesn't happen cleanly:", "How you treat yourself sets the bar for everyone else:", "I was a people-pleaser for 10 years. Breaking that changed my life:", "Thriving in a relationship looks different than you were taught:"] },
    tips:         { topics: ["5 communication habits that strengthen any relationship", "How to set boundaries without guilt", "What to do when you feel emotionally disconnected", "How to stop attracting the same patterns", "3 signs a relationship is adding to your life vs draining it"], hooks: ["5 communication habits couples therapists actually recommend:", "Boundaries with guilt is still a boundary. Here's how:", "Emotional disconnection doesn't mean the relationship is over:", "The pattern you keep attracting is pointing to something inside:", "Is your relationship adding to your life or depleting it?"] },
    behindscenes: { topics: ["What a coaching session on relationships actually looks like", "How I prep content on relationship topics", "The research behind my relationship advice", "A week of questions my followers ask about love", "How I balance vulnerability and expertise in my content"], hooks: ["Here's what actually happens in a relationship coaching session:", "Creating relationship content takes more research than people think:", "The studies and frameworks behind my advice:", "The relationship questions I get asked most this week:", "Sharing personal stories while keeping things professional is an art:"] },
    motivation:   { topics: ["The right relationship will not require you to disappear", "You are not too much — you were with the wrong person", "Better relationships start with better self-knowledge", "You don't have to rush love to deserve it", "Growing through relationship pain is its own kind of strength"], hooks: ["A relationship that requires you to be less is the wrong relationship:", "If you've been told you're too much, you weren't — they were too little:", "The most important relationship education is self-knowledge:", "You don't need to rush. You need to be ready:", "Growing from relationship pain is not failure. It's progress:"] },
  },
  health: {
    education:    { topics: ["The gut-brain connection explained simply", "Why chronic inflammation is the root of most health issues", "What cortisol does to your body over time", "The 5 signs your hormones are out of balance", "How sleep quality affects every health marker"], hooks: ["Your gut is your second brain. Here's what that means:", "Most chronic illness starts with this one thing:", "Cortisol is running your health. Here's what it's doing:", "5 signs your hormones are telling you something:", "You can exercise and eat well but sleep is overriding everything:"] },
    entertainment:{ topics: ["I did a 30-day gut health protocol — what changed", "Rating wellness trends I tried this year", "Health tests I wish I'd done earlier", "The health habit that surprised me most", "Things a functional medicine doctor actually recommends"], hooks: ["30 days of gut health focus. Here's what shifted:", "Wellness trends I tried — honest ranking:", "I finally got these health tests. The results shocked me:", "The health habit I expected least to make a difference:", "Functional medicine advice vs what we're normally told:"] },
    personal:     { topics: ["My health wake-up call and what I changed", "How I healed my gut after years of ignoring it", "The diagnosis that changed how I see health", "What rebuilding my health from scratch taught me", "My honest experience with burnout and recovery"], hooks: ["My health wake-up call came at 31 and I wasn't ready:", "My gut health was destroying everything. Here's what I did:", "The diagnosis I didn't expect but needed:", "Starting health from scratch after years of ignoring it:", "Burnout recovery is not fast. Here's my real timeline:"] },
    promotion:    { topics: ["My gut health guide is available now", "Inside my 90-day health coaching program", "The supplement stack I recommend for most clients", "My holistic wellness workshop — what's inside", "The free health checklist I built for beginners"], hooks: ["The gut health guide I built from my own recovery:", "Inside my 90-day health coaching program — every detail:", "The supplements I recommend and exactly why:", "My holistic wellness workshop — what we cover:", "My free health checklist — start here:"] },
    inspiration:  { topics: ["The body you have is worth taking care of", "Healing is not linear — health version", "Small health habits compound into transformation", "You don't have to wait for a health crisis to start", "The connection between mental and physical health"], hooks: ["Your body is doing everything it can. Start doing your part:", "Health healing doesn't happen in a straight line:", "10 small habits × 365 days = a different body:", "Don't wait for your health to break to fix it:", "Mental and physical health are not separate. Here's the connection:"] },
    tips:         { topics: ["5 habits for better gut health starting today", "How to improve sleep quality without medication", "The anti-inflammatory foods to add first", "How to reduce cortisol naturally", "3 things to do before every meal for better digestion"], hooks: ["5 gut habits that don't require a doctor:", "Sleep quality over quantity. Here's how to improve it:", "Start with these foods before anything else:", "Cortisol reduction without medication:", "Do these 3 things before eating and watch what changes:"] },
    behindscenes: { topics: ["My morning health ritual — what it actually looks like", "How I prep health content and fact-check everything", "A week in my supplement routine", "Behind the scenes of a health coaching call", "The health tests I get annually and what they show"], hooks: ["My morning health routine — no filter:", "Health content requires more research than most people realize:", "Every supplement I take and exactly when:", "What a health coaching call actually sounds like:", "I get these tests every year and here's what I look at:"] },
    motivation:   { topics: ["Your health is your most important asset", "Starting is always the hardest part — health version", "Every healthy choice is an investment in future you", "You can rebuild your health at any age", "The best version of your health is ahead of you"], hooks: ["No asset is more valuable than your health. Full stop:", "Starting feels impossible. Then it feels normal. Start:", "Every good choice you make compounds forward:", "Health doesn't have a deadline. Start now:", "The best version of your health is possible from wherever you are:"] },
  },
  coaching: {
    education:    { topics: ["What a life coach actually does", "The difference between coaching and therapy", "How goal-setting frameworks that actually work", "What limiting beliefs are and where they come from", "The psychology behind behavior change"], hooks: ["Coaching is not what most people think it is:", "Coaching and therapy serve completely different purposes:", "Goal setting doesn't work unless you do this first:", "A limiting belief is not a fact. Here's how to tell:", "Behavior doesn't change without this first:"] },
    entertainment:{ topics: ["The most common things people want to change (and why they don't)", "Coaching session scenarios — what people actually work on", "The coaching advice that surprises my clients most", "My funniest (and most honest) coaching fails", "Types of clients I work with and what they all have in common"], hooks: ["The #1 thing people say they want to change — and what's actually stopping them:", "What really comes up in coaching sessions (the unfiltered version):", "The piece of coaching advice that always surprises people:", "My most memorable coaching moments (the honest version):", "Every client I've ever had has this one thing in common:"] },
    personal:     { topics: ["Why I became a coach (the real reason)", "My own experience working with a coach", "The transformation I had before I could help others", "The hardest client conversation I've ever had", "What coaching has taught me about people"], hooks: ["I didn't choose coaching. It chose me. Here's the real story:", "I hired a coach before I became one. Here's what it changed:", "I couldn't coach others until I worked on this myself:", "The client conversation that challenged me the most:", "8 years of coaching has taught me this about human nature:"] },
    promotion:    { topics: ["My 1:1 coaching program is open", "What coaching with me looks like in 90 days", "My group coaching program is enrolling now", "Client result that made me remember why I do this", "The coaching package that gets the fastest results"], hooks: ["I'm opening 5 coaching spots this month:", "90 days of coaching with me looks like this:", "My group program is enrolling — here's what you get:", "This client's result reminded me why I do this work:", "The package my clients get the fastest results with:"] },
    inspiration:  { topics: ["You are capable of more than your current story", "The moment a client's life completely shifted", "Change is always possible — I've seen it happen", "Your future is not determined by your past", "Coaching works when you do — here's proof"], hooks: ["Your story is not your destiny:", "I watched a client's life shift in one session. Here's what changed:", "I've seen enough change to know it's always possible:", "Where you've been does not predict where you're going:", "Coaching is a catalyst. The client does the work. Here's what that looks like:"] },
    tips:         { topics: ["5 coaching tools you can use on yourself", "How to find a coach who's right for you", "The journaling practice that accelerates growth", "How to get the most from a coaching session", "3 questions to ask yourself before investing in coaching"], hooks: ["5 coaching tools — no coach required:", "Finding the right coach is a skill. Here's how:", "This journaling practice replaced a month of coaching for some clients:", "Maximize every coaching session with these habits:", "Ask yourself these 3 questions before hiring any coach:"] },
    behindscenes: { topics: ["How I prepare for a coaching session", "My client intake process — what I look for", "What a week in my coaching business looks like", "Behind the scenes of building a coaching business", "How I structure my coaching programs"], hooks: ["Here's how I prepare before every client session:", "My client intake process tells me everything I need:", "A week in my coaching business — all of it:", "Building a coaching business is nothing like coaching clients:", "My coaching program structure — every element:"] },
    motivation:   { topics: ["The person you want to be is already inside you", "Growth requires discomfort every single time", "You don't need to have it all figured out to start", "The transformation is in the commitment, not the outcome", "Your next level is just outside your current comfort zone"], hooks: ["The version of you that you want to be is already waiting:", "Growth that doesn't feel uncomfortable isn't growth:", "You can start right now without having everything figured out:", "Commitment creates transformation, not perfect plans:", "Your next level requires leaving your current level:"] },
  },
  photography: {
    education:    { topics: ["The exposure triangle explained for beginners", "How to use natural light in photography", "Composition rules every photographer should know", "How to edit photos without over-processing", "The difference between a good photo and a great one"], hooks: ["Aperture, shutter speed, ISO — let me break this down simply:", "Natural light is free. Here's how to use it correctly:", "These composition rules are not optional if you want better photos:", "Over-editing is killing your photos. Here's where to stop:", "Good photos are everywhere. Great ones require this:"] },
    entertainment:{ topics: ["I shot only with my phone for a week", "Rating photographers' editing styles", "The photo trends I hate (and why)", "Camera gear vs skill — the honest comparison", "Things photographers never admit publicly"], hooks: ["7 days, phone only. Here's what I learned:", "Editing styles ranked from best to please-stop:", "Photography trends that make me cringe (and why):", "$5,000 camera vs a skilled photographer with an iPhone:", "Things in photography nobody says out loud:"] },
    personal:     { topics: ["How I found my photography style", "The shot that made me realize this was my calling", "My photography journey — the first 3 years", "The project that changed what I photograph", "What photography has taught me about seeing the world"], hooks: ["I tried every style before I found mine. Here's the journey:", "One shot changed everything about why I pick up a camera:", "Year 1 vs year 3 of photography — the real evolution:", "This project redirected my entire photography focus:", "Photography made me see the world completely differently:"] },
    promotion:    { topics: ["My photography course is now open", "Lightroom presets I created are available", "Inside my 1:1 photography mentoring program", "My photo editing guide — free download", "The photography workshop I'm running this month"], hooks: ["The photography course I built from 5 years of teaching:", "My Lightroom presets — the exact ones I use:", "Inside my 1:1 photography mentoring program:", "My photo editing guide is free — here's what's inside:", "My photography workshop — what we cover and who it's for:"] },
    inspiration:  { topics: ["Photography is about observation, not equipment", "The photograph that made me emotional", "Every great photographer started taking bad photos", "Photography is how I remember the world", "The beauty you see depends on how you look, not what you have"], hooks: ["The best camera is the one you use to see, not to impress:", "This photograph made me cry when I looked at it again:", "Every photographer whose work you love took thousands of bad shots:", "Photography is how I archive the things I can't afford to forget:", "The world is full of great photos. You just have to learn to see them:"] },
    tips:         { topics: ["5 photography composition tips for better images", "How to find good light at any time of day", "3 ways to instantly improve your portrait photography", "How to tell a story in a single frame", "Editing tips that save your photos without destroying them"], hooks: ["5 composition rules that immediately change your photos:", "Good light exists at every time of day if you know where to look:", "3 portrait changes that make an immediate difference:", "A great photo tells a story. Here's how to build it:", "Editing is restoration, not transformation — unless you do this:"] },
    behindscenes: { topics: ["What a full photography shoot day looks like", "My editing process from import to export", "How I scout a location before a shoot", "My camera bag — every piece of gear and why", "The content creation process for photography posts"], hooks: ["Shoot day behind the scenes — the real version:", "My complete Lightroom editing process — every step:", "Location scouting is half the job. Here's how I do it:", "Everything in my camera bag and why each item is there:", "Creating photography content takes more than taking photos:"] },
    motivation:   { topics: ["Every great photo starts with showing up", "Your style takes years — and that's okay", "The photos you don't take are the ones you'll regret", "Better photography doesn't require more gear — it requires more intention", "Creativity is a practice, not a gift"], hooks: ["You cannot get the shot if you don't show up:", "Style development is not fast and it's not supposed to be:", "The photos you almost didn't take are always the best ones:", "Intent beats gear every single time:", "Creativity is not something you have. It's something you do:"] },
  },
  other: {
    education:    { topics: ["How to learn any new skill quickly", "Why consistency beats intensity in most areas of life", "How to set goals that you'll actually achieve", "The difference between being busy and being productive", "How to make better decisions consistently"], hooks: ["Here's the framework for learning anything faster:", "Consistency beats intensity — here's the proof:", "Most goals fail because of this one flaw:", "Busy is not the same as productive. Here's the difference:", "Better decisions start with a better decision-making system:"] },
    entertainment:{ topics: ["The common wisdom that's actually wrong", "Things I wish someone had told me earlier", "Expectations vs reality of trying something new", "The trend I'm skeptical of and why", "Things every creator experiences but nobody talks about"], hooks: ["Common wisdom is not always correct wisdom:", "If someone had told me this earlier, things would have been different:", "I expected this. Reality was completely different:", "I'm skeptical of this trend and here's exactly why:", "Every creator experiences this and almost none talk about it:"] },
    personal:     { topics: ["The decision that changed my direction completely", "What I know now that I wish I'd known at the start", "The year that reshaped how I think about everything", "My honest reflection on where I am vs where I thought I'd be", "The failure that turned into the foundation"], hooks: ["One decision changed everything. Here's what it was:", "What I'd tell myself if I could go back:", "This year broke something in me. Then built something better:", "Where I thought I'd be vs where I actually am:", "The failure I'm most grateful for:"] },
    promotion:    { topics: ["My resource/product/service is now available", "The result I see most with people I work with", "What I've built and why I built it", "Inside what I offer and who it's for", "Client transformation — the before and the after"], hooks: ["What I've built is finally available:", "The result I see most consistently:", "Here's what I created and the exact reason why:", "This is who I built this for and what it includes:", "Client before and after — the full story:"] },
    inspiration:  { topics: ["You are further along than you think", "Progress is often invisible until it isn't", "The gap between where you are and where you want to be is workable", "Every expert started exactly where you are", "What commitment over time actually produces"], hooks: ["You are closer than you feel. Here's why I know:", "Progress is quiet. Then it's sudden. Keep going:", "The gap feels huge. It's not as big as it looks:", "Every person you admire started knowing nothing:", "Commitment × time = this. Here's the math:"] },
    tips:         { topics: ["5 habits that changed everything", "The system that makes goals automatic", "How to do more with less effort", "3 small things that make a big difference", "How to start when you don't know where to begin"], hooks: ["5 habits I'd start immediately if I were beginning again:", "This system makes goals automatic:", "More output, less effort — here's the approach:", "3 small things, big difference:", "When you don't know where to begin, start here:"] },
    behindscenes: { topics: ["What my actual creative process looks like", "How I plan and create content each week", "Behind the scenes of what I do", "My real work setup and workflow", "The unfiltered version of what I'm building"], hooks: ["Here's what the creative process actually looks like:", "My weekly content plan — everything:", "Behind the closed doors of what I actually do:", "My real setup — not the aesthetic version:", "The unfiltered reality of what I'm building:"] },
    motivation:   { topics: ["Start before you feel ready", "The only comparison that matters is with your past self", "Done is better than perfect", "Show up consistently and the results will come", "Small actions every day are more powerful than big bursts occasionally"], hooks: ["Waiting to feel ready is how nothing gets started:", "Compare yourself to who you were last year, not anyone else:", "Perfect doesn't exist. Done does. Ship it:", "Consistency is the strategy. Here's what it looks like:", "Daily small action vs occasional big push — the math:"] },
  },
};

// ─── Story Ideas ──────────────────────────────────────────────────────────────

const STORY_IDEAS: Record<Pillar, { idea: string; format: string }[]> = {
  education:    [ { idea: "Quick tip of the day", format: "Text + poll 'Did you know this?'" }, { idea: "Myth vs fact about your niche", format: "Split slide story" }, { idea: "Ask me anything — your questions answered", format: "Question box" } ],
  entertainment:{ idea: "", format: "" } as any, // unused — merged below
  personal:     [ { idea: "Day-in-my-life snippet", format: "Short video behind-the-scenes" }, { idea: "Honest check-in: how things are going", format: "Text or talking-head video" }, { idea: "What I'm currently working on", format: "Casual selfie + caption" } ],
  promotion:    [ { idea: "Soft CTA for your offer", format: "Swipe-up link or 'DM me X'" }, { idea: "Client result teaser", format: "Screenshot or quote graphic" }, { idea: "Last chance / urgency", format: "Countdown sticker + text" } ],
  inspiration:  [ { idea: "Morning quote that resonates with you", format: "Text story with niche color palette" }, { idea: "A repost of something inspiring from your community", format: "Shared post + your reaction" }, { idea: "Share what's currently motivating you", format: "Talking-head video, 15–30 sec" } ],
  tips:         [ { idea: "One quick tip with a poll", format: "'Did this help?' poll" }, { idea: "This or That related to your niche", format: "This or That slider" }, { idea: "Share a useful resource (link)", format: "Screenshot + link" } ],
  behindscenes: [ { idea: "Work setup or workspace", format: "Photo story" }, { idea: "What your week looks like this week", format: "Calendar screenshot + voice-over" }, { idea: "Real-time update on what you're doing today", format: "Casual video update" } ],
  motivation:   [ { idea: "Accountability check — what's your goal this week?", format: "Question box" }, { idea: "'What's stopping you?' poll", format: "2-option poll" }, { idea: "Reminder that slow progress counts", format: "Text + emoji story" } ],
};

const STORY_IDEAS_FLAT: { idea: string; format: string }[] = [
  { idea: "Poll: [Niche question about a common struggle]", format: "Yes/No poll — drives instant engagement" },
  { idea: "Behind the scenes of today's post creation", format: "Short video or photo story" },
  { idea: "Ask me anything about [your topic]", format: "Question box sticker" },
  { idea: "Share a quick tip in 3 slides", format: "Graphic slides with swipe" },
  { idea: "This or That: [niche-relevant options]", format: "Slider or voting poll" },
  { idea: "Soft CTA: 'DM me [word] for [resource]'", format: "Text story with emoji emphasis" },
  { idea: "Day-in-the-life 10-second clip", format: "Casual talking video or boomerang" },
  { idea: "Share your current work-in-progress", format: "Screenshot or photo + caption" },
  { idea: "Countdown to something you're launching", format: "Countdown sticker story" },
  { idea: "'Unpopular opinion' about your niche", format: "Bold text story — reply CTA" },
  { idea: "Share an inspiring quote from your content", format: "Graphic pull-quote from your post" },
  { idea: "Re-share a recent post with a personal note", format: "Post share + voice memo" },
  { idea: "Check-in: How's your week going?", format: "Emoji slider vote" },
  { idea: "Client win or personal milestone", format: "Screenshot + celebration story" },
];

// ─── Day labels ────────────────────────────────────────────────────────────────

const POSTING_TIMES: Record<GoalOption, string[]> = {
  growth:     ["7:00 AM", "6:00 PM", "8:00 PM", "12:00 PM", "9:00 AM", "7:00 PM", "11:00 AM"],
  engagement: ["12:00 PM", "7:00 PM", "6:00 PM", "8:00 PM", "1:00 PM", "5:00 PM", "12:00 PM"],
  sales:      ["9:00 AM", "7:00 PM", "12:00 PM", "8:00 PM", "6:00 PM", "10:00 AM", "7:00 PM"],
  authority:  ["8:00 AM", "12:00 PM", "6:00 PM", "9:00 AM", "7:00 PM", "11:00 AM", "5:00 PM"],
};

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── Calendar Generation Engine ───────────────────────────────────────────────

function getPostTypeSchedule(freq: FrequencyOption): PostType[] {
  if (freq === 3) return ["Reel", "Carousel", "Reel"];
  if (freq === 5) return ["Reel", "Carousel", "Reel", "Static", "Reel"];
  return ["Reel", "Carousel", "Reel", "Reel", "Carousel", "Static", "Reel"];
}

function getPostGoal(postType: PostType): string {
  const goals: Record<PostType, string> = {
    Reel: "Reach & Discovery",
    Carousel: "Saves & Education",
    Static: "Branding & Authority",
    Story: "Engagement & Trust",
  };
  return goals[postType];
}

function rotatePillar(pillars: Pillar[], index: number): Pillar {
  return pillars[index % pillars.length];
}

function pickItem<T>(arr: T[], weekIndex: number, dayIndex: number, seed: number = 0): T {
  const idx = (weekIndex * 11 + dayIndex * 7 + seed) % arr.length;
  return arr[idx];
}

function generateWeek(
  week: number,
  niche: Niche,
  pillars: Pillar[],
  freq: FrequencyOption,
  goal: GoalOption,
  experience: ExperienceOption,
  postingDays: string[],
): WeekPlan {
  const schedule = getPostTypeSchedule(freq);
  const times = POSTING_TIMES[goal];
  const nicheData = NICHE_TOPICS[niche];

  const days: DayPlan[] = postingDays.map((dayLabel, dayIdx) => {
    const postType = schedule[dayIdx];
    const pillar = rotatePillar(pillars, dayIdx + week * 3);
    const pillarData = nicheData[pillar];
    const topics = pillarData?.topics || NICHE_TOPICS.other[pillar]?.topics || ["Create valuable content for your audience"];
    const hooks  = pillarData?.hooks  || NICHE_TOPICS.other[pillar]?.hooks  || ["Here's something important:"];
    const topic = pickItem(topics, week - 1, dayIdx, pillar.length);
    const hook  = pickItem(hooks,  week - 1, dayIdx, pillar.length + 3);
    const time  = times[(dayIdx + week) % times.length];

    return {
      day: dayIdx + 1,
      dayLabel,
      postType,
      topic,
      hook,
      pillar,
      goal: getPostGoal(postType),
      time,
    };
  });

  const storyCount = Math.min(5, Math.max(3, Math.floor(freq * 0.8)));
  const stories: StoryIdea[] = Array.from({ length: storyCount }, (_, i) => {
    const idea = STORY_IDEAS_FLAT[(week * 5 + i) % STORY_IDEAS_FLAT.length];
    return { day: i + 1, dayLabel: ALL_DAYS[i], idea: idea.idea, format: idea.format };
  });

  const weekThemes = [
    "Foundation & Introduction — establish who you are and what you help with",
    "Education & Value — teach your audience something they'll save and share",
    "Social Proof & Connection — build trust with results and personal content",
    "Engagement & Growth Push — maximize reach and community interaction",
  ];

  const weekTips: Record<ExperienceOption, string[]> = {
    beginner: [
      "Focus on consistency over perfection — one post published beats three planned",
      "Use your Stories to test ideas before committing to feed posts",
      "Repurpose your best-performing carousel slides into Reels this week",
      "Engage with 5 accounts in your niche daily — relationship building drives organic growth",
    ],
    intermediate: [
      "Hook quality is your Week 1 variable — test two different opening lines on similar topics",
      "Your Stories engagement is telling you what your audience wants — listen to it",
      "This week's carousel can fuel 2 Reels next week — plan repurposing from the start",
      "Reply to every comment within 60 minutes — the algorithm rewards immediate engagement velocity",
    ],
    advanced: [
      "Build a content funnel: Reel drives follows → Carousel delivers value → Story closes the loop with CTA",
      "A/B test your hook formats this week — curiosity gap vs direct statement on similar topics",
      "Turn this week's comment questions into next week's carousel topics — user-generated content strategy",
      "Analyze your top 3 posts this week — identify the pattern and double down next week",
    ],
  };

  return {
    week,
    theme: weekThemes[week - 1] || weekThemes[0],
    days,
    stories,
    weekTip: weekTips[experience][week - 1] || weekTips[experience][0],
  };
}

function generateCalendar(
  niche: Niche, audience: string, pillars: Pillar[], freq: FrequencyOption,
  goal: GoalOption, style: StyleOption, availability: AvailabilityOption,
  experience: ExperienceOption,
): CalendarOutput {
  const postingDayOptions: Record<FrequencyOption, string[]> = {
    3: ["Monday", "Wednesday", "Friday"],
    5: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
    7: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  };
  const postingDays = postingDayOptions[freq];

  const stratMap: Record<GoalOption, string> = {
    growth:     "Every piece of content leads the viewer toward following. Reels drive discovery; carousels build follow-worthiness. The strategy prioritizes top-of-funnel reach with strong niche identity so every new viewer immediately understands why they should follow.",
    engagement: "The focus is building an active community. Posts are designed to prompt replies, saves, and shares rather than passive impressions. Topics are specific enough to make the right person feel seen and motivated to respond.",
    sales:      "Content moves through a value-first funnel: educate → demonstrate → offer. Carousels establish authority, Reels drive awareness, and Stories close with soft and direct CTAs. The calendar is built to warm cold followers into paying customers.",
    authority:  "Positioning you as the go-to expert in your niche. Each post contributes to a body of work that, over 4 weeks, tells a complete, credible story about your expertise, perspective, and results. Trust is built through consistency and depth.",
  };

  const growthTipMap: Record<GoalOption, string[]> = {
    growth: [
      "Post Reels at your peak audience time — check Instagram Insights for the hours your specific audience is most active",
      "Use only 8–12 relevant hashtags per Reel (not 30) — quality over quantity is the 2024/25 algorithm signal",
      "The first 2 seconds of every Reel determine 80% of its performance — invest most of your creative energy here",
      "Collaborate with one creator in your niche per month — collab posts reach both audiences simultaneously",
      "Respond to every comment in the first hour after posting — early engagement velocity significantly boosts algorithmic distribution",
    ],
    engagement: [
      "Ask a question in every caption — not 'what do you think?' but a specific, answerable question your audience has a strong opinion on",
      "Carousel posts with 7–10 slides generate the highest save rates — the algorithm heavily rewards saves as a quality signal",
      "Create a weekly signature Story feature your audience expects — a weekly poll, Q&A, or check-in builds ritual engagement",
      "Reply to comments with more than one sentence — depth of response signals to the algorithm that your post is generating quality conversation",
      "Create 'save-worthy' posts — detailed tips, step-by-step guides, and resource lists are saved and reshared far more than opinion content",
    ],
    sales: [
      "Warm your audience with 3 value posts before each promotional post — a 3:1 value-to-promo ratio builds trust without alienating followers",
      "Use Stories for direct sales and soft CTAs — they feel less salesy than feed posts and convert better for lower-ticket offers",
      "Social proof converts better than features — lead every promotional post with a specific client result, not what you offer",
      "Create urgency authentically — limited spots, real deadlines, and genuine bonuses drive action without feeling manipulative",
      "Address objections proactively in your content — what's stopping your audience from buying is the content strategy for your next 5 posts",
    ],
    authority: [
      "Consistency over a 4-week period builds more authority than a single viral post — keep showing up",
      "Take public positions — sharing a clear opinion or contrarian view builds perceived authority faster than neutral advice content",
      "Feature your process, not just your results — showing how you think is what makes you irreplaceable in your niche",
      "Guest appearances, collaborations, and being quoted by others accelerate authority faster than solo posting",
      "Create your own frameworks, systems, and named concepts — original intellectual property positions you as an original thinker, not a repeater",
    ],
  };

  const weeks = [1, 2, 3, 4].map(w => generateWeek(w, niche, pillars, freq, goal, experience, postingDays));

  return {
    strategyOverview: `This 4-week Instagram content calendar is built for ${audience || "your target audience"} in the ${niche} niche. ${stratMap[goal]} All content is distributed across ${pillars.length} content pillars (${pillars.map(p => PILLAR_META[p].label).join(", ")}) and optimized for a ${freq}×/week posting schedule that matches your ${availability} time availability and ${experience}-level experience.`,
    weeks,
    growthTips: growthTipMap[goal],
  };
}

// ─── UI Components ────────────────────────────────────────────────────────────

function PostTypeTag({ postType }: { postType: PostType }) {
  const meta = POST_TYPE_META[postType];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${meta.color}`}>
      {meta.icon}{postType}
    </span>
  );
}

function PillarTag({ pillar }: { pillar: Pillar }) {
  const meta = PILLAR_META[pillar];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.color}`}>
      {meta.icon}{meta.label}
    </span>
  );
}

function DayCard({ plan }: { plan: DayPlan }) {
  return (
    <div className="rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm font-black text-foreground tracking-tight">{plan.dayLabel}</span>
        <div className="flex items-center gap-2 flex-wrap">
          <PostTypeTag postType={plan.postType} />
          <PillarTag pillar={plan.pillar} />
        </div>
      </div>
      <div>
        <p className="font-bold text-foreground text-sm leading-snug mb-1">{plan.topic}</p>
        <div className="rounded-xl bg-primary/5 border border-primary/10 px-3 py-2">
          <p className="text-xs text-primary font-semibold">Hook: <span className="text-foreground font-normal">{plan.hook}</span></p>
        </div>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">{plan.goal}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">{plan.time}</span>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is an Instagram content planner and why do I need one?",
    a: "An Instagram content planner is a structured system that maps out what you post, when you post it, what format to use, and what goal each post serves — before you need to create anything. Most creators fail to grow consistently not because they lack talent or ideas but because they create reactively: posting when inspired, posting the same format repeatedly, never intentionally balancing content types, and having no strategic through-line connecting their posts. A content planner eliminates that. When you know what you're posting on Monday, Wednesday, and Friday for the next 4 weeks — and why each post exists — you create better content faster, maintain consistency without burnout, and build an audience that can predict what value they'll receive from following you. Content planning transforms posting from reactive to intentional.",
  },
  {
    q: `How many times should I post on Instagram per week in ${YEAR}?`,
    a: `For most creators, 3–5 feed posts per week is the optimal range in ${YEAR}. Instagram's algorithm in ${YEAR} rewards consistency and content quality over raw frequency — posting every day with mediocre content will consistently underperform posting 3 times per week with well-produced, highly relevant content. The specific number depends on your resources: if you have low time availability, 3 posts per week (2 Reels + 1 Carousel) is perfectly viable for sustained growth. If you have medium availability, 4–5 posts per week allows you to maintain a balanced content type mix. Daily posting (7×/week) is effective only if you can maintain quality across all 7 posts — quality degradation from overcommitting does more damage than simply posting less. Separate from feed posts, Stories should be used daily if possible — they have no quality bar and function primarily as an engagement and trust-building layer.`,
  },
  {
    q: "What should be in an Instagram content calendar?",
    a: "A strategic Instagram content calendar should include five elements for every planned post: Post format (Reel, Carousel, Static, or Story) so you can plan your creative production batching; Topic or content idea so you never create from a blank page; Content pillar it belongs to (Education, Entertainment, Personal, Promotion, Inspiration) so you can ensure variety; Goal the post serves (Reach, Saves, Comments, Sales) so every post has a purpose beyond 'posting something'; and Posting time based on when your specific audience is most active. A well-built calendar also includes a weekly Story strategy since Stories are a separate content layer that operates differently from feed posts. The 4-week view is particularly valuable — it shows you whether you're repeating the same format too often, neglecting a content pillar, or over-promoting relative to value content.",
  },
  {
    q: "What are content pillars on Instagram and how many should I have?",
    a: "Content pillars are the 3–5 recurring themes or topic categories that define what your Instagram account consistently covers. They ensure that while your individual posts vary in topic and format, your account has a cohesive identity and every piece of content belongs to a recognizable category. For example, a fitness coach might have pillars of Education (workout science and nutrition), Personal (their own journey), Tips (quick actionable advice), Promotion (their programs), and Motivation (mindset content). Three pillars is the minimum for variety; five is the maximum for focus. With fewer than 3, your content feels repetitive and one-dimensional. With more than 5, your account loses cohesion and new profile visitors can't quickly understand what you're about. The ideal distribution in a weekly calendar rotates evenly across all pillars, ensuring no consecutive posts share the same pillar.",
  },
  {
    q: `What is the best Instagram posting time in ${YEAR}?`,
    a: "The best Instagram posting time is specific to your audience, not a universal window — but general patterns exist as starting points. For audiences of professionals and business-focused followers, 7–9 AM and 6–9 PM on weekdays consistently perform well because they check Instagram before and after work. For lifestyle, fashion, and entertainment audiences, 12–2 PM and 6–9 PM show the highest engagement rates. For fitness and health audiences, 7–9 AM (before workout) and 6–8 PM (after workout) drive the most interactions. Saturday tends to be the highest-engagement day for most niches because users browse more intentionally. The most reliable method is to check your Instagram Insights → Audience → Most Active Times, which shows your specific followers' active hours by day. Post at peak minus 30 minutes — Instagram takes time to distribute, so posting slightly before peak puts you in feeds exactly when most users are active.",
  },
  {
    q: `What type of content performs best on Instagram in ${YEAR}?`,
    a: `In ${YEAR}, Instagram Reels remain the highest-reach format by a significant margin — they are the primary distribution mechanism for growing accounts because they reach non-followers through Explore, Reels feed, and hashtag feeds. Carousels are the highest-save and highest-engagement format — they generate up to 3× more saves than single images and often outperform Reels in comments because the slide-by-slide format encourages thoughtful engagement. Static posts have the lowest organic reach but remain effective for branding, high-quality photography, and authority-positioning content. Stories generate the highest per-follower engagement because they reach only existing followers and feel personal. The optimal Instagram content mix in ${YEAR} is: 50–60% Reels (reach and growth), 25–30% Carousels (saves and depth), 10–15% Static (branding), with daily Stories supplementing feed content.`,
  },
  {
    q: "How do I use content pillars to plan an Instagram calendar?",
    a: "To build a content calendar from pillars, follow this system: First, define your 3–5 pillars based on what your audience needs and what you can consistently create. Second, assign each day of your posting schedule a pillar — ensure no two consecutive posts share the same pillar. Third, within each pillar, assign a post format based on the pillar's goal: Education pillars align with Carousels (people save educational content), Promotion pillars align with Reels or Stories (reach or direct engagement), Personal pillars work well as Reels (personality-driven), and Tips work across all formats. Fourth, write specific topic ideas per pillar per week — the more specific the topic, the better the content will perform. Fifth, use the week theme to give each week a narrative direction. After 4 weeks, every major pillar should appear multiple times and your audience should have a comprehensive understanding of what your account is about.",
  },
  {
    q: "How do I batch create Instagram content efficiently?",
    a: "Content batching is the practice of creating multiple posts in a single session rather than creating each post on its posting day. It is the single most effective time-management strategy for consistent Instagram posting. The system works in four phases: Plan (use your content calendar to identify what you're creating), Produce (film all Reels in one session, shoot all photos in one session), Edit (edit in batches using saved templates and presets), and Schedule (use Instagram's native scheduler or a tool like Later or Buffer). For Reels specifically, batch 4–7 at once to maximize the mental and physical setup cost of filming. Carousels can be designed in batches using Canva or Figma with a consistent template. The ideal batching day is Sunday or Monday — plan the week's content on Sunday, create it on Monday or Tuesday, and you have content ready for the entire week before it needs to go live.",
  },
  {
    q: "What is the difference between Reels, Carousels, and Stories for strategy?",
    a: "Each format serves a distinct strategic purpose in an Instagram growth funnel. Reels are a top-of-funnel discovery format — they reach people who don't follow you through Instagram's recommendation algorithm, appearing in the Reels feed, Explore page, and hashtag results. A Reel's job is to attract new followers by showcasing your personality, niche relevance, and value quickly (usually in under 30 seconds). Carousels are a mid-funnel depth format — they deliver substantial value (tutorials, guides, lists) to people who already follow you or find your post, generating saves and shares that signal to the algorithm that your content is worth distributing further. Static posts are an authority format — they tell a visual story about your brand identity and are effective for quotes, announcements, and professional positioning. Stories are a loyalty format — they deepen the relationship with existing followers through casual, personal, and interactive content that creates a sense of direct connection.",
  },
  {
    q: "Is this Instagram content planner free to use?",
    a: "Yes — the Instagram Content Planner on creatorsToolHub is completely free with no account, subscription, or credit card required. Select your niche, target audience, content pillars, posting frequency (3, 5, or 7 posts per week), primary goal, content style, time availability, and experience level. The tool generates a complete 4-week content calendar with day-by-day posting plans, including post type (Reel/Carousel/Static), specific topic idea, hook or content angle, post goal, and optimal posting time. A full Story strategy is included for each week along with a strategic overview and weekly growth tip. Copy the full calendar or any individual week for use in your own planning tool, Google Docs, or Notion.",
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
        style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 600}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const ALL_PILLARS: Pillar[] = ["education", "entertainment", "personal", "promotion", "inspiration", "tips", "behindscenes", "motivation"];

export function InstagramContentPlannerTool() {
  const { toast } = useToast();
  const [niche,        setNiche]        = useState<Niche>("lifestyle");
  const [audience,     setAudience]     = useState("");
  const [pillars,      setPillars]      = useState<Pillar[]>(["education", "entertainment", "personal", "tips"]);
  const [freq,         setFreq]         = useState<FrequencyOption>(5);
  const [goal,         setGoal]         = useState<GoalOption>("growth");
  const [style,        setStyle]        = useState<StyleOption>("mixed");
  const [availability, setAvailability] = useState<AvailabilityOption>("medium");
  const [experience,   setExperience]   = useState<ExperienceOption>("beginner");
  const [error,        setError]        = useState("");
  const [calendar,     setCalendar]     = useState<CalendarOutput | null>(null);
  const [activeWeek,   setActiveWeek]   = useState(1);
  const [copiedId,     setCopiedId]     = useState<string | null>(null);

  useEffect(() => {
    const id = "faq-schema-ig-content-planner";
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
      toast({ title: "Copied!", description: "Content plan copied to clipboard." });
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [toast]);

  const togglePillar = (p: Pillar) => {
    setPillars(prev =>
      prev.includes(p) ? (prev.length > 2 ? prev.filter(x => x !== p) : prev)
                       : (prev.length < 5 ? [...prev, p] : prev)
    );
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pillars.length < 2) { setError("Select at least 2 content pillars."); return; }
    const result = generateCalendar(niche, audience, pillars, freq, goal, style, availability, experience);
    setCalendar(result);
    setActiveWeek(1);
    setTimeout(() => document.getElementById("ig-planner-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };

  const weekData = calendar?.weeks.find(w => w.week === activeWeek);

  const formatWeekText = (w: WeekPlan): string => {
    const header = `WEEK ${w.week}: ${w.theme}\n${"─".repeat(50)}\n`;
    const days = w.days.map(d =>
      `${d.dayLabel} — ${d.postType}\nTopic: ${d.topic}\nHook: ${d.hook}\nGoal: ${d.goal}\nTime: ${d.time}`
    ).join("\n\n");
    const stories = `\nSTORY PLAN:\n${w.stories.map(s => `• ${s.idea} (${s.format})`).join("\n")}`;
    const tip = `\nWEEK TIP: ${w.weekTip}`;
    return header + days + stories + tip;
  };

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
          <form onSubmit={handleGenerate} className="space-y-6">

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
                placeholder="e.g. busy moms in their 30s, early-stage entrepreneurs, women over 40…"
                className="h-11 text-sm bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
            </div>

            {/* Content Pillars */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Content Pillars <span className="font-normal normal-case text-xs text-muted-foreground ml-1">(select 2–5)</span>
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
                      {meta.icon}{meta.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">{pillars.length}/5 selected — {3 - pillars.length > 0 ? `select ${3 - pillars.length} more minimum` : "good to go ✓"}</p>
            </div>

            {/* Posting Frequency */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-primary" /> Posts Per Week
              </label>
              <div className="grid grid-cols-3 gap-3">
                {([3, 5, 7] as const).map(f => (
                  <button key={f} type="button" onClick={() => setFreq(f)}
                    className={`py-3 rounded-xl text-sm font-bold border transition-all flex flex-col items-center gap-1 ${
                      freq === f ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                    }`}>
                    <span className="text-xl font-black">{f}×</span>
                    <span className="text-xs font-medium">
                      {f === 3 ? "2 Reels + 1 Carousel" : f === 5 ? "3 Reels + 1 Carousel + 1 Static" : "4 Reels + 2 Carousels + 1 Static"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal + Style */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Primary Goal</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "growth" as GoalOption,     label: "🚀 Growth" },
                    { value: "engagement" as GoalOption, label: "💬 Engagement" },
                    { value: "sales" as GoalOption,      label: "💰 Sales" },
                    { value: "authority" as GoalOption,  label: "🎓 Authority" },
                  ] as const).map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setGoal(value)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        goal === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Content Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "educational" as StyleOption,   label: "📚 Educational" },
                    { value: "entertaining" as StyleOption,  label: "🎬 Entertaining" },
                    { value: "personalbrand" as StyleOption, label: "🧑 Personal Brand" },
                    { value: "mixed" as StyleOption,         label: "🌀 Mixed" },
                  ] as const).map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setStyle(value)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        style === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Availability + Experience */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Time Availability</label>
                <div className="flex gap-2">
                  {([
                    { value: "low" as AvailabilityOption,    label: "⏱️ Low" },
                    { value: "medium" as AvailabilityOption, label: "⏰ Medium" },
                    { value: "high" as AvailabilityOption,   label: "🕐 High" },
                  ] as const).map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setAvailability(value)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        availability === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Experience Level</label>
                <div className="flex gap-2">
                  {([
                    { value: "beginner" as ExperienceOption,     label: "🌱 Beginner" },
                    { value: "intermediate" as ExperienceOption, label: "🌿 Intermediate" },
                    { value: "advanced" as ExperienceOption,     label: "🌳 Advanced" },
                  ] as const).map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setExperience(value)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        experience === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
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
              <Sparkles className="w-5 h-5" /> Generate My 4-Week Instagram Content Calendar
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────────── */}
      {calendar && weekData && (
        <section id="ig-planner-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">

          {/* Strategy Overview */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 space-y-2">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> Your Content Strategy
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{calendar.strategyOverview}</p>
          </div>

          {/* Content type mix legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["Reel", "Carousel", "Static", "Story"] as PostType[]).map(type => {
              const meta = POST_TYPE_META[type];
              return (
                <div key={type} className={`rounded-2xl border px-4 py-3 space-y-1 ${meta.color}`}>
                  <div className="flex items-center gap-1.5">{meta.icon}<span className="font-bold text-sm">{type}</span></div>
                  <p className="text-xs font-medium">{meta.goal}</p>
                </div>
              );
            })}
          </div>

          {/* Week tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4].map(w => (
                <button key={w} onClick={() => setActiveWeek(w)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    activeWeek === w ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                  }`}>
                  Week {w}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(`week-${activeWeek}`, formatWeekText(weekData))}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                  copiedId === `week-${activeWeek}` ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                }`}>
                {copiedId === `week-${activeWeek}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedId === `week-${activeWeek}` ? "Copied!" : `Copy Week ${activeWeek}`}
              </button>
              <button onClick={() => { setCalendar(null); }}
                className="text-xs font-bold px-3 py-2 rounded-xl border border-border bg-muted text-muted-foreground hover:border-primary/50 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          {/* Week header */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black text-primary uppercase tracking-widest">Week {activeWeek}</span>
              <div className="flex flex-wrap gap-2">
                {pillars.map(p => <PillarTag key={p} pillar={p} />)}
              </div>
            </div>
            <p className="font-bold text-foreground">{weekData.theme}</p>
          </div>

          {/* Day cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {weekData.days.map(day => <DayCard key={day.dayLabel} plan={day} />)}
          </div>

          {/* Story plan */}
          <div className="rounded-2xl border border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-900/20 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <h3 className="font-bold text-foreground text-sm">Story Plan — Week {activeWeek}</h3>
            </div>
            <div className="space-y-2">
              {weekData.stories.map((s, i) => (
                <div key={i} className="flex gap-3 rounded-xl bg-white/60 dark:bg-black/20 border border-pink-100 dark:border-pink-900 px-4 py-3">
                  <span className="text-xs font-black text-pink-600 dark:text-pink-400 mt-0.5 shrink-0">{s.dayLabel}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.idea}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.format}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Week tip */}
          <div className="rounded-2xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 px-5 py-4 flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide mb-1">Week {activeWeek} Growth Tip</p>
              <p className="text-sm text-foreground font-medium">{weekData.weekTip}</p>
            </div>
          </div>

          {/* Growth tips */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Growth Tips for Your {goal.charAt(0).toUpperCase() + goal.slice(1)} Goal
            </h3>
            <div className="space-y-2">
              {calendar.growthTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-muted-foreground">{tip}</p>
                </div>
              ))}
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Instagram Content Planner</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, icon: <CalendarDays className="w-5 h-5 text-primary" />,
              title: "Select your niche, audience, and content pillars",
              desc: "Choose your content niche, describe your target audience (the more specific the better), and select 2–5 content pillars. Content pillars are the recurring topic categories your account covers — Education, Entertainment, Personal, Tips, Promotion, Inspiration, Behind-the-Scenes, and Motivation. Select the ones that fit your brand. Each pillar will appear in rotation across your 4-week calendar." },
            { step: 2, icon: <BarChart2 className="w-5 h-5 text-primary" />,
              title: "Set your posting frequency and primary goal",
              desc: "Choose how many posts per week you can realistically sustain: 3× (2 Reels + 1 Carousel), 5× (3 Reels + 1 Carousel + 1 Static), or 7× (4 Reels + 2 Carousels + 1 Static). Then select your primary goal — Growth (followers), Engagement (comments and saves), Sales (conversions), or Authority (positioning). The goal adjusts posting times and content angle toward the most effective strategy for that objective." },
            { step: 3, icon: <Sparkles className="w-5 h-5 text-primary" />,
              title: "Get your complete 4-week calendar",
              desc: "A full 4-week calendar is generated with specific topics, hooks, post types, goals, and optimal posting times for every post. Each week has a strategic theme to give your content a narrative direction. A Story plan with 3–5 Story ideas per week is included separately, plus experience-level-specific growth tips. Browse weeks using the Week 1–4 tabs." },
            { step: 4, icon: <Copy className="w-5 h-5 text-primary" />,
              title: "Copy weekly plans and use them directly",
              desc: "Use the 'Copy Week' button to export any week as formatted text — paste directly into Notion, Google Docs, or your scheduling tool. The copy format includes the day, post type, topic, hook, goal, and time in plain text ready to use. Regenerate the full calendar anytime to get fresh topic variations for the same structure." },
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
          <h2 className="text-2xl font-bold font-display text-foreground">Instagram Content Planner — The Strategy That Powers Consistent Account Growth</h2>
        </div>
        <div className="space-y-7 text-muted-foreground leading-relaxed text-sm">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary flex-shrink-0" />
              Why Content Planning Beats Posting Inspiration
            </h3>
            <p className="mb-3">
              Instagram growth is not random. The accounts that grow consistently — accumulating thousands of followers over months while others plateau — are almost never the ones with the most creative ideas or the most natural talent on camera. They are the ones with a system. Content planning is that system. When you know exactly what you're posting for the next 4 weeks — the format, the topic, the hook, the goal, and the time — you eliminate the two biggest productivity killers in content creation: decision fatigue and creative paralysis. Creators who plan spend 80% of their creative energy actually creating, not figuring out what to create.
            </p>
            <p className="mb-3">
              The second major benefit of content planning is audience trust. Your audience is constantly, subconsciously asking themselves whether following you is worth their attention. When your content is consistent, varied across formats, and covers predictable value-delivering topic categories, your audience's answer to that question stays yes. When your posting is sporadic, repetitive in format, or strategically directionless, follower trust erodes — even if individual posts are high quality. The algorithm's distribution decisions compound this effect: accounts with consistent posting schedules receive more consistent distribution; inconsistent accounts receive inconsistent visibility.
            </p>
            <p>
              This planner generates a structured 4-week Instagram calendar that incorporates content type distribution (the right mix of Reels, Carousels, Static posts, and Story ideas), content pillar rotation (ensuring variety across education, entertainment, personal, promotional, and inspirational content categories), posting time optimization based on goal and audience type, and experience-level-specific tips that give beginning creators foundational strategy while giving advanced creators funnel-building and testing frameworks.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary flex-shrink-0" />
              The Content Type Distribution Strategy — Why 4 Formats Are Better Than 1
            </h3>
            <p className="mb-3">
              Every Instagram format exists to serve a different stage of the audience relationship funnel, and optimizing only one format means optimizing only one part of the funnel. Reels are the top-of-funnel format — they reach people who don't follow you through Instagram's recommendation algorithm, which surfaces Reels on the Explore page, in the dedicated Reels tab, and in non-followers' home feeds based on interest signals. The job of a Reel is to attract and convert new profile visitors into followers. Its success metric is reach and profile visits, not comments or saves. A strong Reel has a compelling hook in the first 1–2 seconds, communicates immediate value or entertainment, and gives the viewer a clear reason to follow for more.
            </p>
            <p className="mb-3">
              Carousels are the mid-funnel format — they deliver depth, build authority, and generate the two signals Instagram weights most heavily: saves and shares. Carousel posts are the most effective format for educational content, step-by-step guides, list posts, myth-busting content, and transformational before-and-afters. A well-constructed carousel with 7–10 slides consistently achieves 3–5× more saves than a single static image on the same topic, and saves are the strongest signal an Instagram post can generate because they indicate the user found the content valuable enough to return to. Static posts serve a branding and authority function — they tell the visual story of your account and work well for quotes, announcements, testimonials, and aesthetically-important brand moments.
            </p>
            <p>
              Stories are an entirely separate layer of the Instagram content system. They don't appear in feeds, aren't distributed to non-followers, and don't generate saves or shares — but they generate something more valuable for relationship-building: daily micro-engagement with your existing audience. Polls, question boxes, behind-the-scenes updates, and soft CTAs in Stories create the sense of a direct relationship between creator and follower that feed posts, by their nature, cannot replicate. Stories are where trust deepens, where products convert best, and where your audience's daily relationship with your account lives.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              Content Pillars and the 4-Week Narrative Arc
            </h3>
            <p className="mb-3">
              Content pillars solve the most common Instagram posting problem: creators who run out of ideas after two weeks, then go silent for another two, destroying the consistency they built. Pillars work by creating a recurring structure of topic categories that you draw from — so you are never starting from zero. On any given week, you know you need one Education post, one Personal or Behind-the-Scenes post, one Tips post, and one Promotion post. The categories eliminate blank-page paralysis because the category defines the territory; your job is simply to choose the specific topic within it.
            </p>
            <p>
              The 4-week narrative arc takes pillar planning further by giving each week a thematic focus. Week 1 establishes who you are and what you're about — the foundation content that a new follower needs to understand your account. Week 2 goes deep on education and value — the content that earns saves and shares and gives your audience tangible reasons to stay followed. Week 3 builds social proof and personal connection — the content that converts skeptics into engaged followers and engaged followers into potential buyers. Week 4 drives engagement and, if applicable, a promotional push — converting the relationship capital built in weeks 1–3 into comments, DMs, and sales. This structure means your content works as a system rather than a series of disconnected posts.
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
          <h2 className="text-2xl font-bold font-display text-foreground">What This Instagram Content Planner Includes</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "4-week content calendar with day-by-day posting plans — every post mapped with type, topic, hook, goal, and optimal posting time",
            "Smart content type distribution engine — 3×/week (2 Reels + 1 Carousel), 5×/week (3R + 1C + 1S), or 7×/week (4R + 2C + 1S)",
            "8 content pillars — Education, Entertainment, Personal, Promotion, Inspiration, Tips, Behind-the-Scenes, and Motivation — select 2–5",
            "4 primary goal modes — Growth, Engagement, Sales, Authority — each adjusts posting times, content angles, and week tips",
            "15 niches — Fitness, Beauty, Business, Finance, Tech/AI, Education, Food, Travel, Lifestyle, Fashion, Relationships, Health, Coaching, Photography, Other",
            "Weekly Story plan — 3–5 specific Story ideas per week with format guidance for polls, Q&As, behind-the-scenes, and CTAs",
            "Experience-level-specific week tips — Beginner (consistency and foundations), Intermediate (hook testing and repurposing), Advanced (funnel strategy and A/B testing)",
            "4-week narrative arc — Foundation (Week 1) → Value (Week 2) → Social Proof (Week 3) → Engagement & Growth Push (Week 4)",
            "Goal-specific growth tips — 5 strategic tips tailored to your selected goal (Growth, Engagement, Sales, or Authority)",
            "Copy-ready week export — each week copies to clipboard as formatted plain text ready to paste into Notion, Google Docs, or scheduling tools",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related Instagram Tools ─────────────────────── */}
      <section className="mt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related Instagram Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "Instagram Reel Idea Generator", path: "/tools/instagram-reel-idea-generator", desc: "Fill your content calendar with high-performing Reel concepts tailored to your niche and audience." },
            { name: "Instagram Caption Generator", path: "/tools/instagram-caption-generator", desc: "Write the captions for every planned post — faster content execution means a more consistent schedule." },
            { name: "Instagram Hashtag Generator", path: "/tools/instagram-hashtag-generator", desc: "Generate the perfect hashtag sets to pair with each content type in your planned posting schedule." },
            { name: "Instagram Hook Generator", path: "/tools/instagram-hook-generator", desc: "Craft scroll-stopping first lines for each planned post to maximize saves, comments, and Explore reach." },
          ].map(({ name, path, desc }) => (
            <a key={path} href={path} className="group flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">{name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </a>
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
