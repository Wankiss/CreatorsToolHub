# CreatorsToolHub — Workflow Rules

Auto-loaded by Claude Code on every session in this project. These rules encode
hard-won patterns from building and maintaining the site. Follow them exactly.

---

## 1. Blog Post Publishing Checklist

Every new or updated blog post MUST satisfy all items before the API call:

- [ ] `metaTitle` ≤ 47 characters (meta-injector appends ` | CreatorsToolHub` = +18 chars → final ≤ 65)
- [ ] `metaTitle` does NOT already contain `| CreatorsToolHub` (causes double-branding)
- [ ] `faqSchema` stored as a plain JSON array `[{"question":"...","answer":"..."}]` — NOT the full FAQPage schema object
- [ ] `coverImage` uses `/api/uploads/{uuid}.png` URL (NOT `/blog/filename.png`)
- [ ] `ogImage` uses the same `/api/uploads/` URL as `coverImage`
- [ ] At least 2 YouTube video embeds using the srcdoc pattern (see §4)
- [ ] At least 3 images total (cover + 2 body images)
- [ ] `isPublished: true` in the API payload when publishing

---

## 2. Image Upload Pattern

**Always upload images via the upload API endpoint. Never reference `/blog/filename.png` directly.**

```bash
# Upload image → get back a /api/uploads/{uuid}.png URL
curl -s -X POST https://creatorstoolhub.com/api/uploads/image \
  -F "image=@/path/to/image.png" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('url',''))"
```

The returned URL looks like `/api/uploads/383b6250-d873-457e-ae76-b869a79fe872.png`.
Use that URL in `coverImage`, `ogImage`, and any `<img src>` tags in the post body.

**Why**: `dist/public/blog/` is gitignored and only rebuilt on full Replit deployment.
Images committed to `public/blog/` don't appear until the next manual deploy.
Upload API stores to Replit Object Storage and serves immediately.

**Exception**: Images that are already in `public/blog/` AND have been deployed
(e.g., the original 12 seeded posts) can safely use `/blog/filename.png`.

---

## 3. Admin API Patterns

Base URL: `https://creatorstoolhub.com`

### Create post
```bash
curl -s -X POST https://creatorstoolhub.com/api/admin/blog \
  -H "Content-Type: application/json" \
  -d '{
    "title": "...",
    "slug": "...",
    "excerpt": "...",
    "content": "<p>HTML content here</p>",
    "metaTitle": "...",
    "metaDescription": "...",
    "coverImage": "/api/uploads/...",
    "ogImage": "/api/uploads/...",
    "tags": ["Tag1", "Tag2"],
    "isPublished": true,
    "readingTime": 10,
    "faqSchema": "[{\"question\":\"Q?\",\"answer\":\"A.\"}]",
    "schemaType": "BlogPosting",
    "canonical": "https://creatorstoolhub.com/blog/slug"
  }'
```

### Update post
```bash
curl -s -X PUT https://creatorstoolhub.com/api/admin/blog/{id} \
  -H "Content-Type: application/json" \
  -d '{ ...same fields... }'
```

### Notes
- No authentication required (internal admin routes)
- `content` must be HTML, not markdown. Convert using Python `markdown` library.
- No GET-by-ID route exists. Fetch the post list and filter by slug if needed.
- `faqSchema` must be a **string** (JSON.stringify of the array), not an object.

### Markdown → HTML conversion
```python
import markdown, re

with open("post.md") as f:
    raw = f.read()

# Strip YAML frontmatter
body = re.sub(r'^---.*?---\s*', '', raw, flags=re.DOTALL)
# Remove double separators
body = re.sub(r'(---\s*){2,}', '---\n', body)

html = markdown.markdown(
    body,
    extensions=["tables", "fenced_code", "nl2br"],
)
```

---

## 4. YouTube Video Embed Pattern (srcdoc)

**Always add 2–3 YouTube embeds per blog post.** The GEO audit found a 0.737
correlation between YouTube embeds and AI citation visibility.

Placement:
- Embed 1: After the introduction / first major H2 section
- Embed 2: Mid-article (tool stack or workflow section)
- Embed 3 (optional): Near the conclusion

```html
<figure style="margin:2rem 0;position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;">
<iframe style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"
  srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href='https://www.youtube.com/embed/VIDEO_ID?autoplay=1'><img src='https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg' alt='VIDEO TITLE'><span>&#9654;</span></a>"
  loading="lazy"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
  title="VIDEO TITLE"
  aria-label="DESCRIPTION OF VIDEO CONTENT"></iframe>
<noscript><a href="https://www.youtube.com/watch?v=VIDEO_ID" target="_blank" rel="noopener">Watch: VIDEO TITLE on YouTube</a></noscript>
</figure>
```

Replace `VIDEO_ID`, `VIDEO TITLE`, and `DESCRIPTION OF VIDEO CONTENT`.

**Note**: Use real YouTube video IDs found via WebSearch `site:youtube.com [topic]`.
Never make up video IDs.

---

## 5. metaTitle Length Rule

```
metaTitle field max = 47 characters
meta-injector adds " | CreatorsToolHub" (+18 chars)
Total rendered title = metaTitle + 18 ≤ 65 chars (Bing limit)
```

The meta-injector deduplicates: if `metaTitle` already contains `| CreatorsToolHub`
it does NOT append again. Still keep the field ≤ 47 chars.

**Bing Webmaster Tools reports**: "Title too long" = metaTitle stored with brand suffix OR
field is too long itself. Fix: shorten the field value, never fix the injector.

---

## 6. faqSchema Format

The meta-injector (`artifacts/api-server/src/meta-injector.ts`, line ~649) parses
`faqSchema` as:

```typescript
const faqs = JSON.parse(post.faqSchema) as Array<{ question: string; answer: string }>;
```

So the DB value must be a **JSON array string**:

```json
[
  {"question": "What is YouTube automation?", "answer": "YouTube automation means..."},
  {"question": "Is YouTube automation free?", "answer": "Yes, you can..."}
]
```

**NOT** the full FAQPage schema object. If you store the full `@context`/`@type`
object, the injector will throw and FAQ schema will be missing from the page.

---

## 7. Trailing Slash & H1 Fix

`meta-injector.ts` normalizes trailing slashes in `resolvePageMeta`:
```typescript
const pathname = rawPathname.length > 1 ? rawPathname.replace(/\/$/, "") : rawPathname;
```

This was patched in commit [applied May 2026]. If you see "H1 tag missing" errors
in Bing Webmaster Tools, it usually means a `/blog/` → `/blog` resolution issue.
Check `resolvePageMeta` first.

---

## 8. Image Static Serving (Permanent Fix)

`artifacts/api-server/src/app.ts` serves `/blog/*` directly from the source
directory before falling through to `dist/public/`:

```javascript
const sourceBlogDir = path.resolve(
  process.cwd(),
  "artifacts/creator-toolbox/public/blog",
);
app.use("/blog", express.static(sourceBlogDir, { maxAge: "30d", immutable: false }));
```

This was added May 2026 as a permanent fix for broken images. Do NOT remove it.
New images committed to `public/blog/` now serve immediately without a rebuild.

---

## 9. Cover Image DB Update Script

When adding new cover images for seeded posts, add the slug → path mapping to:
`lib/db/src/update-cover-images.ts`

Run with:
```bash
cd /Users/wankiss/Documents/CreatorsToolHub
DATABASE_URL=<value> pnpm tsx lib/db/src/update-cover-images.ts
```

---

## 10. Site Architecture Quick Reference

| Layer | Location | Notes |
|---|---|---|
| API server | `artifacts/api-server/src/` | Express, TypeScript |
| Frontend | `artifacts/creator-toolbox/` | Vite + React |
| Public assets | `artifacts/creator-toolbox/public/` | Images, blog drafts |
| Built output | `artifacts/creator-toolbox/dist/` | **Gitignored** |
| Database | Neon Postgres via Drizzle | `lib/db/src/schema/` |
| Blog admin API | `POST/PUT /api/admin/blog` | No auth |
| Image upload | `POST /api/uploads/image` | Multipart form |
| Image serve | `/api/uploads/{uuid}.png` | Object Storage |
| Deployed on | Hostinger (VPS) | |

---

## 11. GEO / AI Citation Priority Signals

From the site GEO audit (May 2026):
- YouTube embeds: **0.737 correlation** with AI citation visibility (highest signal)
- Answer-first H2 formatting: every section opener must state a statistic
- FAQ schema: structured Q&A increases AI extractability
- Citation capsules: 40-60 word self-contained passages per H2
- `llms.txt` exists at `https://creatorstoolhub.com/llms.txt`

Always add YouTube embeds. Always use answer-first formatting. Never skip FAQ schema.
