import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { toolsTable } from "./schema/index.js";
import { eq } from "drizzle-orm";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

interface ToolContent {
  slug: string;
  howToGuide: string;
  seoContent: string;
  faqContent: string;   // HTML rendered on-page
  faqSchema: string;    // JSON string [{ question, answer }] for JSON-LD
}

const tools: ToolContent[] = [
  // ─────────────────────────────────────────────────────────────
  // YOUTUBE TITLE GENERATOR
  // ─────────────────────────────────────────────────────────────
  {
    slug: "youtube-title-generator",
    howToGuide: `<h2>How to Use the YouTube Title Generator</h2>
<ol>
  <li><strong>Describe your video topic</strong> — Type a short description of what your video is about. The more specific you are, the better the titles you'll get. For example: "beginner guitar lesson on chords" beats just "guitar."</li>
  <li><strong>Select your niche or tone</strong> — Choose whether you want clickable, educational, listicle, or storytelling style titles so the AI matches your channel's voice.</li>
  <li><strong>Hit Generate</strong> — The tool instantly produces 10 unique title options optimised for click-through rate and YouTube SEO.</li>
  <li><strong>Pick and customise</strong> — Copy the title you like best and tweak any words to fit your brand. Add your channel name or a number if you want extra punch.</li>
  <li><strong>Check your title length</strong> — Aim for 50–60 characters so the full title shows in search results without being cut off.</li>
</ol>`,
    seoContent: `<h2>Why Your YouTube Title Is the Most Important Part of Your Video</h2>
<p>You can spend 40 hours editing a masterpiece and it will still get zero views if the title does not make someone stop scrolling. YouTube's algorithm uses your title to understand what your video is about, and viewers use it to decide in less than two seconds whether to click. Getting the title right is not optional — it is the first domino.</p>

<h3>What Makes a High-Performing YouTube Title?</h3>
<p>The best YouTube titles share a few things in common. They front-load the main keyword so YouTube can index it clearly. They use numbers or power words ("exactly," "fast," "free," "proven") to signal value. They create a curiosity gap or promise a specific outcome the viewer cares about. And they stay under 60 characters so nothing gets truncated in search results or on mobile.</p>

<h3>The Science Behind Click-Through Rate (CTR)</h3>
<p>YouTube's internal data shows that the average click-through rate across all videos is between 2% and 10%. Channels that consistently hit 7–10% CTR grow dramatically faster because the algorithm rewards videos that people actually click on. Improving your title alone — without changing the thumbnail or video content — can lift CTR by 30–50% on the same video.</p>

<h3>YouTube Title SEO: Keywords Still Matter in 2025</h3>
<p>YouTube is the world's second-largest search engine. Millions of people type queries into the search bar every day looking for tutorials, reviews, entertainment, and answers. When your title contains the exact phrase someone searches for, YouTube is far more likely to surface your video. Our YouTube Title Generator is trained on high-ranking titles across every major niche so you get keyword-rich options without sounding robotic or spammy.</p>

<h3>Common Title Mistakes That Kill Views</h3>
<p>Vague titles like "My Update" or "New Video" tell YouTube and viewers nothing. Clickbait titles that don't match the content destroy audience retention and get punished by the algorithm. Titles that are too long get cut off on mobile, which accounts for over 70% of YouTube watch time. All-caps titles feel aggressive and reduce CTR. Our generator steers you away from every one of these pitfalls automatically.</p>

<h3>How to A/B Test Your YouTube Titles</h3>
<p>YouTube Studio lets you run title experiments on your own channel. Generate three or four strong options with our tool, run them as A/B tests for 48 hours each, and let the data tell you which one your audience responds to. Over time this builds an intuition for what works in your niche that no generic advice can replace.</p>`,
    faqContent: `<dl class="space-y-6">
  <div>
    <dt class="font-bold text-lg">How many YouTube title ideas does the generator produce?</dt>
    <dd class="mt-1 text-muted-foreground">The tool generates 10 unique title options per request. You can regenerate as many times as you like to get fresh ideas — every generation is free with no limits.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Are the generated titles SEO-friendly?</dt>
    <dd class="mt-1 text-muted-foreground">Yes. The AI is trained on high-performing YouTube titles and incorporates natural keyword placement, emotional triggers, and click-through rate best practices so each suggestion is optimised for both search and human appeal.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">How long should a YouTube title be?</dt>
    <dd class="mt-1 text-muted-foreground">The ideal YouTube title is between 50 and 60 characters. Titles longer than 70 characters get truncated in search results and on mobile devices, which can reduce your click-through rate.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Can I use these titles for YouTube Shorts?</dt>
    <dd class="mt-1 text-muted-foreground">Absolutely. YouTube Shorts titles follow the same rules as regular videos. Shorter, punchier titles tend to work especially well for Shorts — aim for 40–50 characters and lead with the strongest word.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Do I need to create an account to use the YouTube Title Generator?</dt>
    <dd class="mt-1 text-muted-foreground">No account, no sign-up, no credit card. The YouTube Title Generator is completely free to use — just type your topic and generate.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">How is this different from typing titles myself?</dt>
    <dd class="mt-1 text-muted-foreground">The AI analyses thousands of successful YouTube titles in your niche and combines the patterns that drive high CTR. It produces options you might never think of on your own, much faster than brainstorming manually.</dd>
  </div>
</dl>`,
    faqSchema: JSON.stringify([
      { question: "How many YouTube title ideas does the generator produce?", answer: "The tool generates 10 unique title options per request. You can regenerate as many times as you like to get fresh ideas — every generation is free with no limits." },
      { question: "Are the generated titles SEO-friendly?", answer: "Yes. The AI incorporates natural keyword placement, emotional triggers, and click-through rate best practices so each suggestion is optimised for both search and human appeal." },
      { question: "How long should a YouTube title be?", answer: "The ideal YouTube title is between 50 and 60 characters. Titles longer than 70 characters get truncated in search results and on mobile devices." },
      { question: "Can I use these titles for YouTube Shorts?", answer: "Absolutely. Shorter, punchier titles work especially well for Shorts — aim for 40–50 characters and lead with the strongest word." },
      { question: "Do I need an account to use the YouTube Title Generator?", answer: "No account, no sign-up, no credit card required. The tool is completely free — just type your topic and generate." },
    ])
  },

  // ─────────────────────────────────────────────────────────────
  // YOUTUBE TAG GENERATOR
  // ─────────────────────────────────────────────────────────────
  {
    slug: "youtube-tag-generator",
    howToGuide: `<h2>How to Use the YouTube Tag Generator</h2>
<ol>
  <li><strong>Enter your video title or topic</strong> — Type the main subject of your video. The more detail you give, the more targeted your tags will be.</li>
  <li><strong>Generate tags</strong> — Click Generate and the tool will instantly produce a list of relevant, searchable tags covering broad, mid-tail, and long-tail keyword variations.</li>
  <li><strong>Copy all tags</strong> — Use the one-click copy button to grab all tags at once, formatted exactly how YouTube expects them.</li>
  <li><strong>Paste into YouTube Studio</strong> — In YouTube Studio, open your video's details, scroll to the Tags section, and paste. YouTube allows up to 500 characters of tags.</li>
  <li><strong>Prioritise the most specific tags</strong> — Put your most targeted, niche tags first. These help YouTube understand your video's exact context before it looks at broader terms.</li>
</ol>`,
    seoContent: `<h2>Do YouTube Tags Still Matter in 2025?</h2>
<p>The short answer is yes — but not in the way most creators think. YouTube has reduced how much weight it places on tags for search ranking since 2021. However, tags still serve a critical secondary function: they tell YouTube's recommendation engine which other videos your content is similar to. That matters enormously for suggested video traffic, which is often the biggest source of views on any channel.</p>

<h3>How YouTube Tags Actually Work</h3>
<p>Tags are metadata signals. When you add the tag "Sony A7IV review," YouTube links your video to every other video in its database that uses that tag. If those videos perform well and attract a similar audience to yours, YouTube will start recommending your video alongside them. This is why targeting the same tags as your competitors — especially larger channels in your niche — is a legitimate growth strategy.</p>

<h3>The Right Tag Strategy: Broad, Mid-tail, Long-tail</h3>
<p>A healthy tag set covers three levels of specificity. Broad tags (e.g., "photography") give context but are highly competitive. Mid-tail tags (e.g., "Sony camera tutorial") are more targeted and easier to rank for. Long-tail tags (e.g., "Sony A7IV beginner settings 2025") are very specific and attract viewers who are exactly the right audience for your content. Our YouTube Tag Generator automatically produces all three levels so you don't have to think about the balance yourself.</p>

<h3>How Many Tags Should You Use on YouTube?</h3>
<p>YouTube allows up to 500 characters of tags per video. In practice, 8 to 15 well-chosen tags outperform 50 vague or irrelevant ones. Quality beats quantity every time. Focus on tags that are actually related to your content — using misleading tags violates YouTube's policies and can harm your channel's standing.</p>

<h3>Tags vs. Title vs. Description: Which Matters Most for SEO?</h3>
<p>YouTube's own creator documentation confirms that the video title and description are more important ranking signals than tags. But tags serve as a useful tie-breaker and recommendation engine cue. The best strategy is to nail your title and description first, then use tags to reinforce the same keywords and extend into related territory.</p>`,
    faqContent: `<dl class="space-y-6">
  <div>
    <dt class="font-bold text-lg">How many tags should I put on a YouTube video?</dt>
    <dd class="mt-1 text-muted-foreground">Between 8 and 15 focused, relevant tags is the sweet spot. YouTube allows up to 500 characters but more tags does not mean better performance — relevance matters more than quantity.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Do YouTube tags help with search ranking?</dt>
    <dd class="mt-1 text-muted-foreground">Tags are a secondary ranking signal. Your title and description carry more weight for search. Where tags make a bigger difference is in YouTube's recommendation engine — they help the algorithm understand which videos to show yours alongside.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Should I use the same tags as popular videos in my niche?</dt>
    <dd class="mt-1 text-muted-foreground">Yes. Using some of the same tags as high-performing videos in your niche increases the chance YouTube recommends your video to the same audience. Our generator surfaces common niche tags automatically.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Can I use competitor tags?</dt>
    <dd class="mt-1 text-muted-foreground">You can use tags that appear in competitor videos as long as they are genuinely relevant to your content. Using completely unrelated tags from popular videos is against YouTube's policies and can backfire.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Where do I add tags in YouTube Studio?</dt>
    <dd class="mt-1 text-muted-foreground">In YouTube Studio, click on your video, go to Details, scroll down to the 'Tags' field (you may need to click 'Show More'), paste your tags and save. Tags are comma-separated.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Is the YouTube Tag Generator free?</dt>
    <dd class="mt-1 text-muted-foreground">Yes, 100% free. Generate as many tag sets as you like — no account or sign-up required.</dd>
  </div>
</dl>`,
    faqSchema: JSON.stringify([
      { question: "How many tags should I put on a YouTube video?", answer: "Between 8 and 15 focused, relevant tags is the sweet spot. YouTube allows up to 500 characters of tags, but relevance matters more than quantity." },
      { question: "Do YouTube tags help with search ranking?", answer: "Tags are a secondary ranking signal. Your title and description carry more weight for search. Tags make a bigger difference in YouTube's recommendation engine." },
      { question: "Should I use the same tags as popular videos in my niche?", answer: "Yes. Using some of the same tags as high-performing videos increases the chance YouTube recommends your video to the same audience." },
      { question: "Where do I add tags in YouTube Studio?", answer: "In YouTube Studio, click your video, go to Details, scroll to the Tags field, paste your tags and save. Tags are comma-separated." },
      { question: "Is the YouTube Tag Generator free?", answer: "Yes, 100% free. Generate as many tag sets as you like — no account or sign-up required." },
    ])
  },

  // ─────────────────────────────────────────────────────────────
  // YOUTUBE DESCRIPTION GENERATOR
  // ─────────────────────────────────────────────────────────────
  {
    slug: "youtube-description-generator",
    howToGuide: `<h2>How to Use the YouTube Description Generator</h2>
<ol>
  <li><strong>Enter your video title and topic</strong> — Give the tool a clear idea of what your video covers. Include any specific points, products, or people you mention.</li>
  <li><strong>Choose your style</strong> — Pick between a short punchy description, a full long-form SEO description, or a template with timestamps and links sections.</li>
  <li><strong>Generate</strong> — The tool writes a complete description including a keyword-rich opening paragraph, a content summary, and a call to action.</li>
  <li><strong>Customise the links section</strong> — Add your actual social media links, affiliate links, or timestamps before publishing. The generator provides the structure — you fill in your real URLs.</li>
  <li><strong>Paste into YouTube Studio</strong> — Copy and paste the finished description into the Description field in YouTube Studio. The first 150 characters are the most important for search.</li>
</ol>`,
    seoContent: `<h2>Why Your YouTube Video Description Matters More Than You Think</h2>
<p>Most creators treat the YouTube description box as an afterthought — somewhere to dump links and call it done. That is a significant missed opportunity. YouTube's algorithm reads every word of your description to understand what your video is about and who should see it. A well-written description can improve your search ranking, increase click-through rate, drive traffic to your other content, and even bring viewers back to your channel weeks after they first watch.</p>

<h3>The First 150 Characters Are Critical</h3>
<p>YouTube shows the first 150 characters of your description in search results before truncating it with a "…more" link. This means the very first two sentences of your description function like ad copy — they either convince a viewer to click or they don't. Start with your primary keyword and immediately communicate the value the viewer will get from watching.</p>

<h3>SEO Keywords in YouTube Descriptions</h3>
<p>YouTube's search engine reads your description for keywords to determine your video's topic and relevance. Including your main keyword two or three times naturally within a 200–300 word description signals relevance without triggering spam filters. Related keywords, synonyms, and topic-adjacent terms also help YouTube understand the full context of your content.</p>

<h3>What a Professional YouTube Description Includes</h3>
<p>A high-performing description has several distinct sections: an opening hook that contains your main keyword, a 2–3 sentence content summary explaining what viewers will learn, a timestamps section for videos longer than 5 minutes, a resources section (affiliate links, mentioned tools, your website), and a channel subscribe call to action. Our YouTube Description Generator creates all of these sections in one go.</p>

<h3>Descriptions and YouTube's Recommendation Engine</h3>
<p>Beyond search, descriptions influence the suggested video sidebar. YouTube's recommendation system looks at description text to find topical connections between videos. Creators who use thorough, keyword-rich descriptions see their videos surface more frequently alongside related content from larger channels — giving smaller channels an organic way to reach bigger audiences.</p>`,
    faqContent: `<dl class="space-y-6">
  <div>
    <dt class="font-bold text-lg">How long should a YouTube description be?</dt>
    <dd class="mt-1 text-muted-foreground">YouTube allows up to 5,000 characters. For SEO purposes, aim for at least 200–300 words of genuine content. Longer descriptions give the algorithm more signals to work with, but every sentence should add value.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Should I include keywords in my YouTube description?</dt>
    <dd class="mt-1 text-muted-foreground">Yes. Include your primary keyword in the first 1–2 sentences naturally. Use related terms and synonyms throughout. Avoid keyword stuffing — write for viewers first, and the SEO will follow.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">What should I put at the beginning of a YouTube description?</dt>
    <dd class="mt-1 text-muted-foreground">Start with a sentence that contains your main keyword and clearly tells viewers what they'll get from the video. The first 150 characters appear in search results, so they need to act as a compelling summary.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Can I use the same description template for every video?</dt>
    <dd class="mt-1 text-muted-foreground">A template for the bottom section (social links, subscribe CTA) is fine. But the opening 2–3 paragraphs must be unique for each video. Duplicate descriptions across multiple videos can hurt your search rankings.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Does YouTube read the video description for search?</dt>
    <dd class="mt-1 text-muted-foreground">Yes. YouTube's algorithm analyzes description text to understand your video's topic, determine search relevance, and connect your video with related content in its recommendation engine.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Is the YouTube Description Generator free?</dt>
    <dd class="mt-1 text-muted-foreground">Completely free — no account or sign-up needed. Generate as many descriptions as you like for any video topic.</dd>
  </div>
</dl>`,
    faqSchema: JSON.stringify([
      { question: "How long should a YouTube description be?", answer: "YouTube allows up to 5,000 characters. Aim for at least 200–300 words of genuine content — longer descriptions give the algorithm more signals to work with." },
      { question: "Should I include keywords in my YouTube description?", answer: "Yes. Include your primary keyword in the first 1–2 sentences naturally, then use related terms throughout. Write for viewers first, and the SEO will follow." },
      { question: "What should I put at the beginning of a YouTube description?", answer: "Start with a sentence containing your main keyword that clearly tells viewers what they'll get. The first 150 characters appear in search results." },
      { question: "Does YouTube read the video description for search?", answer: "Yes. YouTube's algorithm analyzes description text to understand your video's topic, determine search relevance, and connect your video with related content." },
      { question: "Is the YouTube Description Generator free?", answer: "Completely free — no account or sign-up needed. Generate as many descriptions as you like for any video topic." },
    ])
  },

  // ─────────────────────────────────────────────────────────────
  // YOUTUBE SCRIPT GENERATOR
  // ─────────────────────────────────────────────────────────────
  {
    slug: "youtube-script-generator",
    howToGuide: `<h2>How to Use the YouTube Script Generator</h2>
<ol>
  <li><strong>Enter your video topic and title</strong> — Be specific. "How to grow tomatoes indoors in winter" will produce a far better script than just "gardening."</li>
  <li><strong>Set your video length target</strong> — Choose short (under 5 min), medium (5–10 min), or long-form (10–20 min). The generator adjusts the depth and structure accordingly.</li>
  <li><strong>Select your tone</strong> — Educational, entertaining, conversational, or professional. Pick what matches your channel's personality.</li>
  <li><strong>Generate the script</strong> — The AI produces a complete script with an attention-grabbing hook, structured sections, natural transitions, and a strong call to action at the end.</li>
  <li><strong>Personalise it</strong> — Add your personal stories, examples, jokes, or opinions. The AI gives you the structure and the bones — your voice makes it yours.</li>
  <li><strong>Read it out loud before filming</strong> — What reads well on screen doesn't always sound natural when spoken. Do a quick run-through and adjust any lines that feel stiff or awkward.</li>
</ol>`,
    seoContent: `<h2>Why the Best YouTubers Script Their Videos (And You Should Too)</h2>
<p>There's a myth in creator culture that scripted videos feel fake. The reality is the opposite: the most engaging YouTube channels — MrBeast, Kurzgesagt, Mark Rober — script everything. The difference between a scripted video that feels natural and one that feels stiff is not whether you use a script, it's whether the script sounds like you actually speak. That's the problem our YouTube Script Generator solves.</p>

<h3>The Hook Is Everything</h3>
<p>YouTube analytics consistently show that if you don't hook a viewer in the first 30 seconds, you've lost them. The best hooks either make a bold promise ("By the end of this video, you'll know exactly how to..."), raise a question the viewer desperately wants answered, or open with a surprising statement that contradicts what the viewer expected. Our script generator leads every script with a tested hook structure so you never waste the most important seconds of your video.</p>

<h3>How Script Structure Affects Watch Time</h3>
<p>Watch time and audience retention are the two metrics YouTube cares about most for promotion. A well-structured script keeps viewers watching by planting curiosity loops — hinting at something coming up later so viewers stay for it. It paces information delivery so viewers aren't overwhelmed or bored. And it ends sections with smooth transitions rather than awkward pauses. All of this adds up to better retention, which tells YouTube your content is worth recommending.</p>

<h3>Scripting for YouTube SEO</h3>
<p>YouTube's automatic captions turn your spoken words into searchable text. That means what you say in your video can influence search ranking. Creators who naturally use their target keywords in their spoken content get an additional layer of keyword reinforcement that unscripted videos often miss. A thoughtful script puts your main keyword in the first 30 seconds of dialogue, reinforcing what the title and description already signal to the algorithm.</p>

<h3>How Long Should a YouTube Script Be?</h3>
<p>The average speaking pace on YouTube is around 130–150 words per minute. A 5-minute video needs roughly 650–750 words of script. A 10-minute video needs 1,300–1,500 words. Our generator targets these benchmarks based on the video length you select, so you never end up with a script that runs too short or forces you to pad with filler content.</p>`,
    faqContent: `<dl class="space-y-6">
  <div>
    <dt class="font-bold text-lg">How long is the script the generator produces?</dt>
    <dd class="mt-1 text-muted-foreground">The length depends on the video duration you select. Short (under 5 minutes) scripts are around 600–750 words. Medium (5–10 minutes) are 1,200–1,500 words. Long-form scripts (10–20 minutes) reach 2,000–3,000 words.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Will the script sound like me?</dt>
    <dd class="mt-1 text-muted-foreground">The generator provides a strong structure and natural-sounding dialogue, but you should personalise it with your own stories, examples, and catchphrases. Think of it as a first draft — your voice and personality are what make it resonate with your audience.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Does the script include a hook and call to action?</dt>
    <dd class="mt-1 text-muted-foreground">Yes. Every script starts with an attention-grabbing hook designed to retain viewers in the critical first 30 seconds, and ends with a clear call to action encouraging viewers to like, subscribe, or visit a link.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Can I use this for YouTube Shorts scripts?</dt>
    <dd class="mt-1 text-muted-foreground">Absolutely. Select the short length option and the tool will produce a tight, fast-paced script optimised for under 60 seconds — leading with the hook immediately since Shorts viewers decide in 2–3 seconds whether to keep watching.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Should I read the script word for word on camera?</dt>
    <dd class="mt-1 text-muted-foreground">Not necessarily. Use it as your guide rather than a teleprompter. Reading it out loud before filming helps you spot any lines that feel unnatural, and you can ad-lib around the structure for a more conversational feel.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Is the YouTube Script Generator free?</dt>
    <dd class="mt-1 text-muted-foreground">Yes, 100% free. No account needed, no usage limits. Generate as many scripts as you need.</dd>
  </div>
</dl>`,
    faqSchema: JSON.stringify([
      { question: "How long is the script the generator produces?", answer: "Short (under 5 min) scripts are ~650 words. Medium (5–10 min) are ~1,300 words. Long-form (10–20 min) reach 2,000–3,000 words." },
      { question: "Does the script include a hook and call to action?", answer: "Yes. Every script starts with an attention-grabbing hook for the first 30 seconds and ends with a clear CTA encouraging viewers to like, subscribe, or visit a link." },
      { question: "Can I use this for YouTube Shorts scripts?", answer: "Absolutely. Select the short option and the tool produces a tight script optimised for under 60 seconds, leading immediately with the hook." },
      { question: "Will the script sound like me?", answer: "The generator provides structure and natural dialogue, but personalise it with your own stories and examples. Think of it as a first draft — your voice makes it resonate." },
      { question: "Is the YouTube Script Generator free?", answer: "Yes, 100% free. No account needed, no usage limits. Generate as many scripts as you need." },
    ])
  },

  // ─────────────────────────────────────────────────────────────
  // TIKTOK HOOK GENERATOR
  // ─────────────────────────────────────────────────────────────
  {
    slug: "tiktok-hook-generator",
    howToGuide: `<h2>How to Use the TikTok Hook Generator</h2>
<ol>
  <li><strong>Describe your TikTok's topic</strong> — Type what your video is about in one or two sentences. Example: "I'm sharing 3 kitchen hacks that save time when meal prepping."</li>
  <li><strong>Choose a hook style</strong> — Select from question hooks, bold statement hooks, curiosity hooks, story hooks, or controversial hooks depending on your content type.</li>
  <li><strong>Generate</strong> — The tool produces multiple hook options, each designed to stop the scroll within the first 1–3 seconds.</li>
  <li><strong>Pick the hook that fits your video's energy</strong> — Match the hook's tone to how you actually deliver it on camera. An aggressive hook delivered quietly on screen creates a disconnect that kills retention.</li>
  <li><strong>Use it as your opening line</strong> — Deliver the hook as literally your first spoken words or on-screen text. Don't warm up — start with it immediately.</li>
</ol>`,
    seoContent: `<h2>Why Your TikTok Hook Determines Everything</h2>
<p>TikTok gives you roughly 1.5 seconds before a viewer decides to swipe. The platform's own data shows that videos which fail to hook viewers in the first three seconds see a catastrophic drop in completion rate. And completion rate — how much of your video people watch — is the single most important factor in whether TikTok's algorithm pushes your video to the For You Page or buries it.</p>

<h3>The Psychology Behind a Great TikTok Hook</h3>
<p>The best TikTok hooks exploit a quirk of human psychology: we hate unresolved loops. When you open a video with "I almost got fired for doing this at work..." the viewer's brain cannot scroll away without knowing the answer. Curiosity gaps, bold claims, surprising statements, and direct questions all work for the same reason — they create an information loop the viewer needs to close.</p>

<h3>Types of TikTok Hooks That Stop the Scroll</h3>
<p><strong>Question hooks</strong> ("Did you know that...?") work because the viewer automatically tries to answer the question before the video does. <strong>Bold claim hooks</strong> ("This changed my life in 30 days") work because they make a specific, testable promise. <strong>Controversy hooks</strong> ("Everyone is wrong about...") work because disagreement triggers engagement. <strong>Story hooks</strong> ("Last week, I accidentally...") work because humans are wired to follow narrative. <strong>Number hooks</strong> ("3 things I wish I knew before...") work because lists signal structured, digestible value.</p>

<h3>Text on Screen vs. Spoken Hooks</h3>
<p>TikTok videos can hook viewers two ways at once: with on-screen text that appears in the first second, and with the opening spoken line. The most effective videos align both. If someone is watching without sound (which about 40% of TikTok viewers do), the on-screen text hook is the only thing keeping them watching. Never skip it.</p>

<h3>How Often You Should Change Your Hook Style</h3>
<p>If the same hook format stops converting for you, your audience has pattern-matched it. Successful TikTok creators rotate between hook styles — curiosity gaps one week, bold claims the next, story-led hooks after that. Our generator produces a variety of hook types so you always have fresh options.</p>`,
    faqContent: `<dl class="space-y-6">
  <div>
    <dt class="font-bold text-lg">What is a TikTok hook?</dt>
    <dd class="mt-1 text-muted-foreground">A TikTok hook is the opening 1–3 seconds of your video — the spoken line, on-screen text, or visual that stops a viewer from scrolling. It's the most important part of any TikTok because the algorithm measures what percentage of viewers keep watching past the first few seconds.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">How long should a TikTok hook be?</dt>
    <dd class="mt-1 text-muted-foreground">A spoken hook should be one sentence — 10 to 15 words maximum. It needs to land before the viewer's thumb moves. On-screen text hooks can be even shorter: 5–8 words that tease the payoff of the video.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">What types of hooks work best on TikTok?</dt>
    <dd class="mt-1 text-muted-foreground">Curiosity gap hooks, bold claim hooks, question hooks, and controversy hooks consistently outperform generic openings. The key is creating an unresolved information loop that the viewer needs to stay and close.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Should the hook be the same as my TikTok caption?</dt>
    <dd class="mt-1 text-muted-foreground">Not necessarily, but they should complement each other. The hook grabs attention in the video itself; the caption reinforces the message and adds searchability.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Can I use these hooks for Instagram Reels too?</dt>
    <dd class="mt-1 text-muted-foreground">Absolutely. TikTok and Instagram Reels share the same short-form format and viewer psychology. Hooks that work on TikTok work equally well on Reels, YouTube Shorts, and any other short-form video platform.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Is the TikTok Hook Generator free?</dt>
    <dd class="mt-1 text-muted-foreground">Yes. No sign-up, no account, no cost. Generate as many hooks as you need for any TikTok topic.</dd>
  </div>
</dl>`,
    faqSchema: JSON.stringify([
      { question: "What is a TikTok hook?", answer: "A TikTok hook is the opening 1–3 seconds of your video that stops a viewer from scrolling. It's the most important part of any TikTok because completion rate determines For You Page distribution." },
      { question: "How long should a TikTok hook be?", answer: "A spoken hook should be one sentence — 10 to 15 words maximum. On-screen text hooks should be even shorter: 5–8 words that tease the payoff." },
      { question: "What types of hooks work best on TikTok?", answer: "Curiosity gap hooks, bold claim hooks, question hooks, and controversy hooks consistently outperform generic openings by creating unresolved information loops." },
      { question: "Can I use these hooks for Instagram Reels?", answer: "Absolutely. TikTok and Reels share the same short-form format and viewer psychology — hooks that work on TikTok work equally well on Reels and YouTube Shorts." },
      { question: "Is the TikTok Hook Generator free?", answer: "Yes. No sign-up, no account, no cost. Generate as many hooks as you need for any topic." },
    ])
  },

  // ─────────────────────────────────────────────────────────────
  // TIKTOK HASHTAG GENERATOR
  // ─────────────────────────────────────────────────────────────
  {
    slug: "tiktok-hashtag-generator",
    howToGuide: `<h2>How to Use the TikTok Hashtag Generator</h2>
<ol>
  <li><strong>Type your video topic</strong> — Enter a brief description of your TikTok content. The more specific you are, the more targeted and effective your hashtags will be.</li>
  <li><strong>Generate</strong> — Click Generate to get a curated mix of high-volume, medium, and niche hashtags relevant to your content.</li>
  <li><strong>Review and select</strong> — Look through the suggestions and choose the ones that genuinely match your video. Using irrelevant hashtags confuses TikTok's algorithm and hurts performance.</li>
  <li><strong>Copy and paste into TikTok</strong> — Add your selected hashtags to the caption when posting.</li>
  <li><strong>Aim for 3–5 hashtags</strong> — A focused selection of 3–5 highly relevant hashtags outperforms a wall of 30 generic ones.</li>
</ol>`,
    seoContent: `<h2>Do Hashtags Actually Help on TikTok in 2025?</h2>
<p>Hashtags on TikTok work differently from Instagram or Twitter. TikTok's For You Page algorithm is primarily interest-based and behavioral — it learns what each user wants to see based on what they watch, like, and share. Hashtags are one signal among many, not the dominant driver of reach. But used correctly, they help TikTok categorise your content, surface it in hashtag search results, and reach new audiences who follow or search specific topics.</p>

<h3>How TikTok Uses Hashtags to Categorise Content</h3>
<p>When you add a hashtag to a TikTok video, you're giving the algorithm a label. TikTok uses these labels — combined with your caption text, sounds, visual content, and engagement patterns — to decide which users to show your video to first. If those early viewers engage well, the algorithm expands your reach. This means hashtags that accurately represent your content help TikTok find the right initial audience, which is the foundation of viral distribution.</p>

<h3>The Right Hashtag Mix for TikTok</h3>
<p>The most effective TikTok hashtag strategy combines three types: one or two broad discovery hashtags (#fitness, #cooking) to capture large audiences; two or three mid-tier niche hashtags (#mealprep, #fitnessmotivation) to reach users with specific interests; and one long-tail or community hashtag (#highproteinmeals, #gymtok) to connect with a highly engaged subculture. Our generator automatically produces this mix.</p>

<h3>Trending Hashtags: When to Use Them and When to Skip</h3>
<p>Jumping on a trending hashtag only makes sense when your content genuinely relates to the trend. TikTok's algorithm is sophisticated enough to compare your video's topic against the hashtag's established content pattern. If there's a mismatch, the video underperforms because it gets served to an audience that expected something different.</p>

<h3>Should You Use #FYP and #ForYouPage?</h3>
<p>The #FYP and #ForYouPage hashtags have billions of views and almost no targeting value. Using them does not tell TikTok anything useful about your content. Niche relevance is what actually drives For You Page distribution.</p>`,
    faqContent: `<dl class="space-y-6">
  <div>
    <dt class="font-bold text-lg">How many hashtags should I use on TikTok?</dt>
    <dd class="mt-1 text-muted-foreground">Research and TikTok's own creator guidance suggests 3–5 focused, relevant hashtags outperform large hashtag lists. More than 8–10 hashtags rarely improves performance and can look spammy to viewers.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Do hashtags get your video on the For You Page?</dt>
    <dd class="mt-1 text-muted-foreground">Hashtags are one signal among many. The primary FYP drivers are watch time, completion rate, shares, and comments. Hashtags help TikTok categorise your content but won't override poor engagement metrics.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Should I use the same hashtags every time?</dt>
    <dd class="mt-1 text-muted-foreground">No. Rotate your hashtags based on each video's specific topic. Using the same set repeatedly can cause TikTok to over-categorise your account and limit your reach to the same narrow audience.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Where should I put hashtags — in the caption or comments?</dt>
    <dd class="mt-1 text-muted-foreground">Put hashtags in the caption. TikTok indexes caption hashtags directly. Hashtags in comments have no proven benefit for distribution on TikTok.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Does #FYP actually work?</dt>
    <dd class="mt-1 text-muted-foreground">#FYP has billions of posts but almost no targeting value. It doesn't tell TikTok anything specific about your content. Focus on niche-relevant hashtags instead — they do the real work.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Is the TikTok Hashtag Generator free?</dt>
    <dd class="mt-1 text-muted-foreground">Yes, completely free with no account or sign-up required. Generate hashtag sets for any topic as many times as you like.</dd>
  </div>
</dl>`,
    faqSchema: JSON.stringify([
      { question: "How many hashtags should I use on TikTok?", answer: "3–5 focused, relevant hashtags outperform large lists. TikTok's own creator guidance confirms more is not better — relevance and specificity matter most." },
      { question: "Do hashtags get your video on the For You Page?", answer: "Hashtags are one signal among many. The primary FYP drivers are watch time, completion rate, shares, and comments. Hashtags help TikTok categorise your content for the right initial audience." },
      { question: "Does #FYP actually work?", answer: "#FYP has billions of posts but no real targeting value — it doesn't tell TikTok anything specific about your content. Focus on niche-relevant hashtags instead." },
      { question: "Where should I put hashtags on TikTok?", answer: "Put hashtags in the caption. TikTok indexes caption hashtags directly. Comments hashtags have no proven distribution benefit on TikTok." },
      { question: "Is the TikTok Hashtag Generator free?", answer: "Yes, completely free with no account or sign-up required. Generate hashtag sets for any topic as many times as you like." },
    ])
  },

  // ─────────────────────────────────────────────────────────────
  // INSTAGRAM CAPTION GENERATOR
  // ─────────────────────────────────────────────────────────────
  {
    slug: "instagram-caption-generator",
    howToGuide: `<h2>How to Use the Instagram Caption Generator</h2>
<ol>
  <li><strong>Describe your post</strong> — Tell the tool what your photo or Reel is about. Include the mood, setting, or message you want to convey. Example: "A sunset beach photo from my solo travel trip to Portugal."</li>
  <li><strong>Choose a tone</strong> — Funny, inspirational, professional, casual, or storytelling. Match it to your brand and the vibe of the post.</li>
  <li><strong>Set your caption length</strong> — Short (1–2 lines for a clean aesthetic feed), medium (3–5 lines for engagement), or long-form (a full story for deeper connection).</li>
  <li><strong>Generate</strong> — The tool writes a caption complete with an opening hook, the main message, and a call to action or question to drive comments.</li>
  <li><strong>Add your hashtags</strong> — Use our Instagram Hashtag Generator to add a relevant tag set below the caption after a line break to keep your caption visually clean.</li>
</ol>`,
    seoContent: `<h2>Why Instagram Captions Are Your Secret Growth Engine</h2>
<p>Most creators focus obsessively on the visual — the perfect photo, the seamless Reel transition, the colour-graded aesthetic. But Instagram's algorithm has been quietly rewarding something else: captions that drive comments, saves, and shares. The caption is where your personality lives, where your audience decides whether they trust you, and where you turn a passive scroll into an active relationship.</p>

<h3>What Makes an Instagram Caption Perform Well</h3>
<p>High-performing Instagram captions do four things: they open with a hook (Instagram cuts your caption after 1–2 lines, so the first line has to be compelling enough to make someone tap "more"), they deliver on the promise of the hook, they end with a clear CTA (usually a question to prompt comments, or an instruction like "save this for later"), and they sound like a real human being wrote them.</p>

<h3>Long Captions vs. Short Captions: Which Works Better?</h3>
<p>Both work — for different goals. Short captions (1–3 lines) work well for aesthetic posts where the image is the story. Long captions (5–20 lines or more) build deeper audience connection and perform extremely well in search — Instagram's keyword search indexes caption text. The best accounts use both strategically depending on the post type.</p>

<h3>Instagram Caption SEO: Searchable Captions in 2025</h3>
<p>Instagram introduced keyword search in 2021 and has steadily improved it. Unlike hashtag discovery, keyword search finds posts based on the actual text in your caption. Writing captions that naturally include terms people might search for — "quick pasta dinner," "home workout for beginners," "travel hacks Europe" — gives your posts an SEO advantage completely separate from your hashtag strategy.</p>

<h3>The Call to Action That Actually Gets Comments</h3>
<p>The weakest CTA you can use is "Follow me for more." The strongest CTAs ask a question the specific viewer has a real opinion on. "What's your go-to when you're running low on energy — coffee or a nap?" gets more replies than "What do you think?" every time. Specificity beats generic. Our Instagram Caption Generator ends every caption with a contextually relevant CTA designed to spark actual responses.</p>`,
    faqContent: `<dl class="space-y-6">
  <div>
    <dt class="font-bold text-lg">How long should an Instagram caption be?</dt>
    <dd class="mt-1 text-muted-foreground">Instagram allows up to 2,200 characters. For engagement, 138–150 word captions tend to perform best. However, very short captions (1–3 lines) work brilliantly for strong visuals where the image speaks for itself.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">What should the first line of an Instagram caption say?</dt>
    <dd class="mt-1 text-muted-foreground">The first line is your hook — Instagram cuts the caption here and shows 'more.' It needs to be compelling enough to make someone tap. Use a question, a bold statement, a surprising fact, or the beginning of a story. Never waste it on hashtags or filler text.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Should I put hashtags in the caption or first comment?</dt>
    <dd class="mt-1 text-muted-foreground">Both work. Many creators put hashtags after a line break at the bottom of their caption. Others post hashtags as the first comment immediately after publishing to keep the caption visually clean. Instagram treats both equally for discoverability.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Does Instagram index caption text for search?</dt>
    <dd class="mt-1 text-muted-foreground">Yes. Instagram's keyword search finds posts based on caption content. Including relevant keywords naturally in your caption helps new users discover your post outside of hashtag browsing.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Can I use the same caption format for Reels and feed posts?</dt>
    <dd class="mt-1 text-muted-foreground">Yes, the same structure works for both. However, Reels captions benefit from a slightly more energetic tone, and should include a CTA that encourages shares and saves since those metrics carry extra weight for Reels distribution.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Is the Instagram Caption Generator free?</dt>
    <dd class="mt-1 text-muted-foreground">100% free. No account required. Generate captions for any type of post — photos, Reels, carousels, Stories — as many times as you like.</dd>
  </div>
</dl>`,
    faqSchema: JSON.stringify([
      { question: "How long should an Instagram caption be?", answer: "Instagram allows up to 2,200 characters. 138–150 word captions tend to drive the most engagement, but very short captions work great for strong visuals." },
      { question: "What should the first line of an Instagram caption say?", answer: "The first line is your hook — Instagram truncates here. Use a question, bold statement, or the start of a story. Never waste it on hashtags or filler text." },
      { question: "Does Instagram index caption text for search?", answer: "Yes. Instagram's keyword search (launched 2021) finds posts based on caption content — include natural keywords to get discovered outside of hashtags." },
      { question: "Should I put hashtags in the caption or first comment?", answer: "Both work equally for discoverability. Many creators use the first comment to keep captions visually clean." },
      { question: "Is the Instagram Caption Generator free?", answer: "100% free. No account required. Generate captions for photos, Reels, carousels, and Stories as many times as you like." },
    ])
  },

  // ─────────────────────────────────────────────────────────────
  // INSTAGRAM HASHTAG GENERATOR
  // ─────────────────────────────────────────────────────────────
  {
    slug: "instagram-hashtag-generator",
    howToGuide: `<h2>How to Use the Instagram Hashtag Generator</h2>
<ol>
  <li><strong>Describe your post</strong> — Enter your niche, the subject of your photo or Reel, or a few keywords that describe your content. Be specific for the best results.</li>
  <li><strong>Generate</strong> — The tool produces a curated list of hashtags covering large discovery tags, mid-sized niche tags, and small community tags.</li>
  <li><strong>Review for relevance</strong> — Remove any hashtag that doesn't genuinely match your content. Instagram can penalise posts that use irrelevant hashtags by showing them to mismatched audiences, which tanks engagement.</li>
  <li><strong>Copy and paste</strong> — Add the hashtags to your caption after a line break, or as the first comment immediately after posting.</li>
  <li><strong>Save your best sets</strong> — Keep a notes file of your highest-performing hashtag sets for your main content categories so you can reuse and refine them over time.</li>
</ol>`,
    seoContent: `<h2>Instagram Hashtags in 2025: What Still Works</h2>
<p>Instagram's relationship with hashtags has changed significantly since the platform's early days. The raw reach you could get from popular hashtags has decreased as the feed became more algorithmically curated. But dismissing hashtags entirely is a mistake — they still serve three distinct functions: discovery through hashtag following, categorisation that helps Instagram's algorithm understand your content, and searchability through Instagram's keyword and hashtag search pages.</p>

<h3>Why Smaller Hashtags Often Outperform Big Ones</h3>
<p>A hashtag with 500 million posts means your content competes with 500 million pieces of content for the top spots. Unless your post goes instantly viral, it will disappear from that hashtag's feed within seconds of posting. A hashtag with 50,000 posts gives your content a real chance of staying visible for hours or days. The goal isn't to use the biggest hashtags — it's to use the most relevant ones where your content has a realistic chance of being discovered.</p>

<h3>How Many Hashtags to Use on Instagram</h3>
<p>Instagram officially recommends 3–5 hashtags. Their internal data shows that a small, targeted set of highly relevant hashtags outperforms the spray-and-pray approach of 30 generic tags. For Reels specifically, using up to 10–15 carefully selected hashtags remains a common practice among growth-focused creators. The key word is "carefully selected" — every tag must be relevant to the specific post.</p>

<h3>Hashtag Banning: What to Watch Out For</h3>
<p>Instagram bans hashtags that have been associated with spam or policy-violating content. Using a banned hashtag — even unknowingly — can suppress your post's reach. Our Instagram Hashtag Generator only surfaces hashtags that are currently active and associated with genuine content, helping you avoid this common pitfall.</p>

<h3>Creating a Hashtag Strategy by Content Pillar</h3>
<p>Rather than researching hashtags from scratch for every post, the most efficient approach is to build hashtag sets for each content pillar your account covers. If you post about fitness nutrition, travel, and mindset, build a dedicated hashtag set for each pillar. Run our generator for each topic once, save your sets, and rotate them with slight variations for each new post.</p>`,
    faqContent: `<dl class="space-y-6">
  <div>
    <dt class="font-bold text-lg">How many hashtags should I use on Instagram?</dt>
    <dd class="mt-1 text-muted-foreground">Instagram recommends 3–5 hashtags per post. Their own data suggests small, focused sets outperform large lists. Many creators use up to 10–15 for Reels, but quality and relevance matter far more than quantity.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Do Instagram hashtags still work for reach?</dt>
    <dd class="mt-1 text-muted-foreground">Yes, but their role has shifted. Hashtags now primarily help with discovery through search and hashtag following, and they help Instagram categorise your content for the right audience. They are one signal in a multi-factor algorithm, not a reach shortcut.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Should I use the same hashtags on every post?</dt>
    <dd class="mt-1 text-muted-foreground">No. Using identical hashtag sets repeatedly can cause Instagram to treat your account as spam. Rotate your tags and tailor them to each specific post.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">What is a banned hashtag and how do I avoid them?</dt>
    <dd class="mt-1 text-muted-foreground">Banned hashtags have been restricted by Instagram for spam or policy violations. Using one can suppress your post's reach. Our generator surfaces only currently active, non-banned hashtags.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Do hashtags work better in the caption or first comment?</dt>
    <dd class="mt-1 text-muted-foreground">Instagram treats hashtags in the caption and the first comment equally for discoverability. Many creators prefer first-comment hashtags to keep captions visually clean for aesthetic or storytelling content.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Is the Instagram Hashtag Generator free?</dt>
    <dd class="mt-1 text-muted-foreground">Yes, completely free with no account or sign-up required. Generate hashtag sets for any niche or post type as many times as you need.</dd>
  </div>
</dl>`,
    faqSchema: JSON.stringify([
      { question: "How many hashtags should I use on Instagram?", answer: "Instagram recommends 3–5 hashtags. Small, focused sets outperform large lists according to Instagram's own data. For Reels, up to 10–15 carefully chosen tags is common practice." },
      { question: "Do Instagram hashtags still work for reach?", answer: "Yes, but their role has shifted to discovery through search and hashtag following, and as a categorisation signal for the algorithm. They're one factor among many, not a standalone reach strategy." },
      { question: "What is a banned hashtag?", answer: "Banned hashtags have been restricted by Instagram for spam associations. Using one can suppress your post's reach. Our generator only surfaces currently active, non-banned hashtags." },
      { question: "Should I use the same hashtags on every post?", answer: "No — using identical sets repeatedly signals spam to Instagram. Rotate and tailor your hashtags to each specific post for best results." },
      { question: "Is the Instagram Hashtag Generator free?", answer: "Yes, completely free with no account or sign-up required. Generate hashtag sets for any niche as many times as you need." },
    ])
  },

  // ─────────────────────────────────────────────────────────────
  // TIKTOK CAPTION GENERATOR
  // ─────────────────────────────────────────────────────────────
  {
    slug: "tiktok-caption-generator",
    howToGuide: `<h2>How to Use the TikTok Caption Generator</h2>
<ol>
  <li><strong>Describe your TikTok video</strong> — Enter your video topic, niche, and any key points you cover. The more context, the more relevant your caption will be.</li>
  <li><strong>Select your tone</strong> — Funny, informative, hype, relatable, or storytelling. Match the energy of your caption to the energy of your video.</li>
  <li><strong>Generate</strong> — Get a TikTok caption that includes an engaging opener, the core message, a CTA to drive comments or shares, and space for hashtags.</li>
  <li><strong>Keep it short</strong> — TikTok shows only the first line or two before truncating. Make sure your most important message comes first.</li>
  <li><strong>Add relevant hashtags</strong> — Use our TikTok Hashtag Generator to add 3–5 targeted hashtags after your caption.</li>
</ol>`,
    seoContent: `<h2>TikTok Captions: Small Box, Big Impact</h2>
<p>TikTok gives you 2,200 characters for captions but shows only the first line before cutting off with "…more." In practice, most viewers read only that first line — which means your TikTok caption functions more like a headline than a paragraph. Treat it that way. Lead with your most compelling statement, your most provocative question, or the hook that makes someone pause and think before they scroll.</p>

<h3>How Captions Affect TikTok's Algorithm</h3>
<p>TikTok's algorithm reads your caption text to help categorise your content. Keywords in your caption contribute to whether your video surfaces in TikTok search — a feature that has grown significantly as users increasingly use TikTok as a search engine, especially Gen Z. A well-written caption that naturally includes what someone might search for gives your video an additional discovery channel beyond the For You Page.</p>

<h3>Captions That Drive Comments (and Why That Matters)</h3>
<p>Comment volume is one of TikTok's strongest engagement signals. A video that generates 100 comments will be pushed to far more people than a video with equal views but zero comments. The easiest way to reliably generate comments is to ask a direct question in your caption — one that your specific audience actually has an opinion on. "Which do you prefer — X or Y?" outperforms "Comment below!" every single time.</p>

<h3>The Role of Humour in TikTok Captions</h3>
<p>TikTok's culture leans heavily into humour, irony, and self-awareness. A caption that makes someone laugh or nod in recognition is one they share — and shares are the most powerful signal in TikTok's algorithm. Even educational or informational content benefits from a caption that has personality. Our TikTok Caption Generator calibrates tone based on your selection so the caption fits your brand whether you're going for witty, warm, or direct.</p>`,
    faqContent: `<dl class="space-y-6">
  <div>
    <dt class="font-bold text-lg">How long should a TikTok caption be?</dt>
    <dd class="mt-1 text-muted-foreground">TikTok allows up to 2,200 characters but shows only the first 1–2 lines before truncating. Keep your most important message in the first 100 characters. A full caption of 100–150 words works well when you want to provide context or boost keyword searchability.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Do TikTok captions help with search?</dt>
    <dd class="mt-1 text-muted-foreground">Yes. TikTok has become a major search platform, especially for Gen Z. Keywords in your caption text are indexed and can help your video surface in TikTok search results — giving you discovery beyond just the For You Page algorithm.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Should I put hashtags in my TikTok caption?</dt>
    <dd class="mt-1 text-muted-foreground">Yes — TikTok hashtags belong in the caption field. Add 3–5 relevant hashtags after your caption text. Unlike Instagram, TikTok does not support hashtags in comments for discoverability purposes.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">What makes a TikTok caption go viral?</dt>
    <dd class="mt-1 text-muted-foreground">Captions that go viral typically ask a question that creates high comment volume, tease something that makes viewers curious ("watch until the end"), or make a bold or relatable statement that viewers screenshot and share.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Can I use the same caption for TikTok and Instagram Reels?</dt>
    <dd class="mt-1 text-muted-foreground">You can reuse the core message, but tweak the hashtags and tone for each platform. TikTok culture is typically more casual and humour-forward; Instagram Reels can skew more aspirational. One-size-fits-all captions often underperform on both.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Is the TikTok Caption Generator free?</dt>
    <dd class="mt-1 text-muted-foreground">Yes, completely free. No sign-up needed. Generate as many captions as you like for any type of TikTok content.</dd>
  </div>
</dl>`,
    faqSchema: JSON.stringify([
      { question: "How long should a TikTok caption be?", answer: "TikTok allows 2,200 characters but only shows the first 1–2 lines. Lead with your most important message in the first 100 characters. 100–150 words total is ideal for search visibility." },
      { question: "Do TikTok captions help with search?", answer: "Yes. TikTok is a major search engine for Gen Z. Caption keywords are indexed and can surface your video in TikTok search — a discovery channel beyond the FYP." },
      { question: "Should I put hashtags in my TikTok caption?", answer: "Yes — TikTok hashtags belong in the caption field. Add 3–5 relevant hashtags after your caption. TikTok does not support discoverability through comment hashtags." },
      { question: "Can I use the same caption for TikTok and Instagram Reels?", answer: "You can reuse the core message, but adjust hashtags and tone — TikTok skews more casual and humorous, Reels more aspirational. One-size-fits-all captions underperform on both." },
      { question: "Is the TikTok Caption Generator free?", answer: "Yes, completely free. No sign-up needed. Generate captions for any TikTok topic as many times as you like." },
    ])
  },

  // ─────────────────────────────────────────────────────────────
  // YOUTUBE HASHTAG GENERATOR
  // ─────────────────────────────────────────────────────────────
  {
    slug: "youtube-hashtag-generator",
    howToGuide: `<h2>How to Use the YouTube Hashtag Generator</h2>
<ol>
  <li><strong>Enter your video topic or title</strong> — Type what your YouTube video is about. The more specific the topic, the more targeted your hashtags will be.</li>
  <li><strong>Generate</strong> — The tool produces a set of relevant YouTube hashtags covering broad category tags, niche topic tags, and community-specific tags.</li>
  <li><strong>Choose 3–5 hashtags</strong> — YouTube recommends using 3–5 hashtags per video. Using more than 15 triggers a YouTube policy that removes ALL hashtags from your video.</li>
  <li><strong>Add to your video description</strong> — Place hashtags at the very top of your description (where they appear above your title in search results) or at the bottom. Both placements are valid.</li>
  <li><strong>Do not use in the title</strong> — Hashtags in YouTube titles look spammy and hurt click-through rate. Keep them in the description only.</li>
</ol>`,
    seoContent: `<h2>YouTube Hashtags: How They Work and Why They Help</h2>
<p>YouTube hashtags are a feature that serve two purposes: they create clickable links that take viewers to a hashtag search results page, and they give YouTube's algorithm an additional content categorisation signal. When you add #productivity to a video about morning routines, YouTube links your video to every other video using that hashtag — giving it potential placement in a curated topic feed that viewers might browse.</p>

<h3>Where YouTube Displays Hashtags</h3>
<p>If you place hashtags at the top of your description, YouTube shows the first three above your video title on the watch page. This prominent placement can drive hashtag clicks and expose your content to viewers browsing that topic. Hashtags placed at the bottom of the description are still indexed but don't appear above the title. For maximum visibility, put your three most important hashtags at the very beginning of the description field.</p>

<h3>The 15-Hashtag Rule You Must Know</h3>
<p>YouTube has a strict policy: if you use more than 15 hashtags on a single video, YouTube ignores ALL of them. This is a hard limit with no partial credit. Staying within the limit — ideally 3–5 hashtags — ensures your tags are actually indexed and functional. Our YouTube Hashtag Generator produces the right quantity so you never accidentally trigger the removal rule.</p>

<h3>Best Hashtags for YouTube Growth</h3>
<p>The most effective YouTube hashtags combine one broad category tag (#technology, #fitness, #cooking), one or two mid-tier topic tags (#homelab, #weightloss, #mealprep), and optionally one community or trend tag (#learntocode, #gymtok). This mix gives your video a chance to appear in broad topic feeds while also surfacing for the niche community most likely to subscribe. Highly generic hashtags (#video, #youtube, #content) have so much competition they provide almost zero discoverability benefit.</p>`,
    faqContent: `<dl class="space-y-6">
  <div>
    <dt class="font-bold text-lg">How many hashtags should I use on YouTube?</dt>
    <dd class="mt-1 text-muted-foreground">YouTube recommends 3–5 hashtags. Using more than 15 triggers a penalty that removes all hashtags from your video. Stick to a focused, relevant set of 3–5 for the best results.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Where should YouTube hashtags go — title or description?</dt>
    <dd class="mt-1 text-muted-foreground">Description only. Adding hashtags to your YouTube title looks spammy and reduces click-through rate. Place hashtags at the top of your description for prominent display above the video title on the watch page.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Do YouTube hashtags help with views?</dt>
    <dd class="mt-1 text-muted-foreground">They help with discovery through hashtag search pages and topic feeds, but their impact on overall views is modest compared to title, thumbnail, and audience retention. Use hashtags as a supplementary signal, not your primary growth strategy.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">What happens if I use more than 15 hashtags?</dt>
    <dd class="mt-1 text-muted-foreground">YouTube removes all hashtags from your video — including the ones that would have worked. This is a documented YouTube policy. Always stay at 15 or fewer, ideally 3–5.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Can I use the same hashtags on every video?</dt>
    <dd class="mt-1 text-muted-foreground">You can reuse broad category tags across videos in the same series or topic area. But vary the specific hashtags based on each video's content for better categorisation accuracy.</dd>
  </div>
  <div>
    <dt class="font-bold text-lg">Is the YouTube Hashtag Generator free?</dt>
    <dd class="mt-1 text-muted-foreground">Yes, free with no account required. Generate hashtag sets for any YouTube video topic as many times as you need.</dd>
  </div>
</dl>`,
    faqSchema: JSON.stringify([
      { question: "How many hashtags should I use on YouTube?", answer: "YouTube recommends 3–5 hashtags. Using more than 15 triggers a penalty that removes ALL hashtags from your video — always stay within the limit." },
      { question: "Where should YouTube hashtags go?", answer: "Description only — never the title. Put hashtags at the very top of the description and they appear prominently above your video title on the watch page." },
      { question: "What happens if I use more than 15 YouTube hashtags?", answer: "YouTube removes all hashtags from your video. This is a documented policy with no partial credit. Always use 15 or fewer, ideally 3–5." },
      { question: "Do YouTube hashtags help with views?", answer: "They aid discovery through hashtag search pages and topic feeds, but title, thumbnail, and audience retention have far more impact on overall views." },
      { question: "Is the YouTube Hashtag Generator free?", answer: "Yes, free with no account required. Generate hashtag sets for any YouTube topic as many times as you need." },
    ])
  }
];

async function run() {
  let updated = 0;
  for (const tool of tools) {
    await db
      .update(toolsTable)
      .set({
        howToGuide: tool.howToGuide,
        seoContent: tool.seoContent,
        faqContent: tool.faqContent,
      })
      .where(eq(toolsTable.slug, tool.slug));
    console.log(`✓ ${tool.slug}`);
    updated++;
  }
  console.log(`\nDone — ${updated}/${tools.length} tools updated.`);
  await pool.end();
}

run().catch(e => { console.error(e); process.exit(1); });
