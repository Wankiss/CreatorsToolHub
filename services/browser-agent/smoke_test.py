"""
Smoke test: navigates to a YouTube video page and confirms the browser works.
Run: uv run python smoke_test.py
"""
import asyncio
from playwright.async_api import async_playwright

VIDEO_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(VIDEO_URL, wait_until="domcontentloaded", timeout=30000)
        title = await page.title()
        print(f"✓ Browser launched and navigated to YouTube")
        print(f"  Page title: {title}")
        await browser.close()
        print("✓ Browser closed cleanly")
        print("\nbrowser-use stack is ready.")

asyncio.run(main())
