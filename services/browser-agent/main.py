"""
CreatorsToolHub — Browser Agent Microservice
FastAPI service that extracts real data from YouTube pages using HTTP + regex.

Run locally:
    uv run uvicorn main:app --host 0.0.0.0 --port 8001 --reload

Run in production (Hostinger VPS):
    uv run uvicorn main:app --host 0.0.0.0 --port 8001 --workers 2
"""

import re
import json
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI(title="CreatorsToolHub Browser Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── Browser-like headers ──────────────────────────────────────────────────────
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def extract_video_id(url: str) -> str | None:
    """Return the 11-char video ID from any YouTube URL format."""
    url = url.strip()
    patterns = [
        r"youtube\.com/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})",
        r"youtu\.be/([a-zA-Z0-9_-]{11})",
        r"youtube\.com/embed/([a-zA-Z0-9_-]{11})",
        r"youtube\.com/shorts/([a-zA-Z0-9_-]{11})",
        r"youtube\.com/v/([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def parse_tags(html: str) -> list[str]:
    """
    Extract video tags from YouTube's embedded ytInitialData JSON.
    YouTube inlines the keywords array in the HTML source — no JS needed.
    """
    match = re.search(r'"keywords"\s*:\s*(\[[^\]]*\])', html)
    if match:
        try:
            raw = json.loads(match.group(1))
            tags = [t.strip() for t in raw if isinstance(t, str) and t.strip()]
            if tags:
                return tags
        except (json.JSONDecodeError, ValueError):
            pass
    return []


def parse_title(html: str) -> str:
    """Extract video title from page HTML."""
    # ytInitialData embeds the title as a JSON string property
    match = re.search(r'"title"\s*:\s*"([^"]{5,300})"', html)
    if match:
        return match.group(1)
    # Fallback: <title> tag
    match = re.search(r"<title>(.+?)</title>", html, re.DOTALL)
    if match:
        return match.group(1).replace(" - YouTube", "").strip()
    return ""


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "browser-agent", "version": "1.0.0"}


@app.get("/extract-tags")
async def extract_tags(url: str = Query(..., description="Full YouTube video URL")):
    """
    Extract tags/keywords from any public YouTube video.

    Returns:
        videoId  — 11-char YouTube video ID
        title    — video title
        tags     — list of tag strings (empty list if the video has no tags)
        count    — number of tags found
    """
    if not url:
        raise HTTPException(status_code=400, detail="url parameter is required")

    if not re.search(r"https?://(www\.)?(youtube\.com|youtu\.be)", url, re.IGNORECASE):
        raise HTTPException(status_code=400, detail="Only YouTube URLs are accepted.")

    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Could not parse a video ID from this URL. "
                "Please paste the full YouTube link "
                "(e.g. https://www.youtube.com/watch?v=...)."
            ),
        )

    watch_url = f"https://www.youtube.com/watch?v={video_id}"

    try:
        async with httpx.AsyncClient(
            headers=HEADERS,
            follow_redirects=True,
            timeout=20.0,
        ) as client:
            resp = await client.get(watch_url)

        if resp.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail="Video not found. It may be private, deleted, or age-restricted.",
            )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"YouTube returned status {resp.status_code}. Please try again.",
            )

        html = resp.text
        tags = parse_tags(html)
        title = parse_title(html)

        return {
            "videoId": video_id,
            "title": title,
            "tags": tags,
            "count": len(tags),
        }

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="YouTube took too long to respond. Please try again.",
        )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Network error: {str(exc)}")
