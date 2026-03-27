# Creator Toolbox

## Overview

A production-ready, SEO-driven creator tools platform that generates organic traffic and monetizes with Google AdSense.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Routing**: Wouter
- **State**: TanStack React Query

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/           # Express API server (port 8080, path /api)
│   └── creator-toolbox/      # React + Vite frontend (port 24051, path /)
├── lib/
│   ├── api-spec/             # OpenAPI spec + Orval codegen config
│   ├── api-client-react/     # Generated React Query hooks
│   ├── api-zod/              # Generated Zod schemas from OpenAPI
│   └── db/                   # Drizzle ORM schema + DB connection
├── scripts/
└── package.json
```

## Blog System

### 12 SEO-Optimized Articles (seeded via `pnpm --filter @workspace/db run seed-blog`)
1. What Are the Best Free Creator Tools for Beginners in 2026?
2. How to Write a YouTube Script Fast Using a Free Script Generator
3. How to Go Viral on YouTube as a Beginner in 2026
4. How to Start a Faceless YouTube Channel: Complete Guide for 2026
5. Best Free AI Tools for Content Creators in 2026 (Zero Cost, Maximum Output)
6. How to Go Viral on TikTok in 2026: Strategies That Actually Work
7. How to Get TikTok Video Ideas Every Single Day for Free
8. How to Grow TikTok Followers Fast in 2026 (No Dancing Required)
9. How to Create Content Using AI: The Complete Beginner's Guide for 2026
10. 50 Viral Content Ideas for Beginners That Actually Get Views in 2026
11. Instagram Hashtag Strategy 2026: Get More Reach on Every Post
12. YouTube SEO Tips for Beginners That Actually Work in 2026

### Blog Page Features
- Hero section with tag filter tabs (YouTube Growth, TikTok Growth, Instagram Growth, AI Tools, Content Ideas, Free Tools, Beginner Guide, Strategy, SEO, Viral Content)
- Featured post (first post) displayed prominently with a wide card
- 3-column post grid below for remaining posts
- Reading time, category emojis, and publish dates on every card
- Bottom CTA section linking to the tools page

### Blog Post Features
- Clean article header with tags, author avatar, date, reading time
- Lead excerpt with primary-colored left border
- AdSense placeholders (top of article + sidebar 300x600)
- Rich prose styling via @tailwindcss/typography
- Social sharing buttons (Twitter, Facebook, copy link)
- "Put This Into Practice" CTA box linking to tools
- Related posts section (3 cards)
- Sticky sidebar with newsletter + tools CTA + ad placeholder

### Admin Blog Manager (at /admin → Blog Content tab)
- Full CRUD: list all posts (including drafts), create, edit, delete
- Blog form with title, slug, excerpt, HTML content, tags, meta SEO fields
- Publish/draft toggle with live status badge
- GET /api/admin/blog endpoint (not in OpenAPI spec — added manually to admin routes)

## Platform Features

### Tool Categories (6)
1. **YouTube Tools** - Title Generator, Tag Generator, Description Generator, Channel Name Generator, Money Calculator, Thumbnail Downloader
2. **TikTok Tools** - Hashtag Generator, Username Generator, Bio Generator, Money Calculator
3. **Instagram Tools** - Hashtag Generator, Bio Generator, Caption Generator
4. **AI Creator Tools** - AI Title Generator, Hook Generator, Video Idea Generator, Prompt Generator
5. **Image Tools** - (category seeded, tools to add via admin)
6. **Text Tools** - Word Counter, Case Converter, Slug Generator, Remove Line Breaks, Text Sorter

### Pages
- `/` - Homepage with hero, search, popular tools, categories, blog preview
- `/category/:slug` - Category page with tool grid
- `/tools/:slug` - Tool page with interactive interface, SEO content, FAQ, related tools
- `/blog` - Blog list
- `/blog/:slug` - Blog post
- `/search` - Search results
- `/admin` - Admin dashboard (tool/blog/category management + stats)

### API Endpoints
- `GET /api/categories` - List categories
- `GET /api/categories/:slug` - Category with tools
- `GET /api/tools` - List tools (search, filter)
- `GET /api/tools/popular` - Popular tools
- `GET /api/tools/:slug` - Tool detail with related tools
- `POST /api/tools/:slug/execute` - Execute tool logic
- `GET /api/blog` - List published blog posts
- `GET /api/blog/:slug` - Single blog post
- `GET /api/sitemap` - Sitemap data
- `POST /api/analytics/track` - Track tool usage
- `GET /api/admin/stats` - Dashboard stats
- `POST/PUT/DELETE /api/admin/tools/:id` - Tool CRUD
- `POST/PUT/DELETE /api/admin/blog/:id` - Blog CRUD

### Tool Engine
Lives in `artifacts/api-server/src/lib/toolEngine.ts` - Pure TypeScript tool execution with 22+ implemented tools across all categories.

### SEO Features
- Meta titles, descriptions, Open Graph tags per page
- Structured data (SoftwareApplication schema) on tool pages
- Breadcrumbs on tool and category pages
- Sitemap API at `/api/sitemap`
- Canonical URLs
- 700-1000 word SEO articles on each tool page

### Monetization
- Google AdSense placeholder slots (header, sidebar, inline, footer)
- Replace `<div class="adsense-slot">` with actual AdSense `<ins>` tags

## Database Schema

- `categories` - Tool categories with SEO content
- `tools` - Tool metadata, SEO content, FAQ, how-to guides
- `blog_posts` - Blog articles with tags and metadata
- `tool_usage_logs` - Usage tracking per tool

## Development

```bash
# Run dev servers
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/creator-toolbox run dev

# Push DB schema
pnpm --filter @workspace/db run push

# Run codegen
pnpm --filter @workspace/api-spec run codegen
```

## Adding New Tools

1. Add tool data via `/admin` dashboard or directly in DB
2. Add execution logic in `artifacts/api-server/src/lib/toolEngine.ts`
3. Tool pages are automatically generated from DB data
