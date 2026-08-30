#!/usr/bin/env python3
"""
=============================================================================
 DAHVIO - INDEXNOW SUBMITTER
=============================================================================
 IndexNow pushes URLs to Bing, Yandex, Seznam, and Naver within minutes
 instead of waiting for their next crawl. It has no effect on Google/GSC -
 Google doesn't participate in IndexNow.

 USAGE
 -----
   # Submit everything in the sitemap (do this once now, and any time
   # you ship new or changed pages):
   python indexnow.py --sitemap

   # Submit specific URLs (e.g. right after publishing one page):
   python indexnow.py https://dahvio.com/mco-6100-13a

   # Dry run - show what would be sent, send nothing:
   python indexnow.py --sitemap --dry-run

 NOTES
 -----
   * Uses the POST/JSON endpoint: up to 10,000 URLs in ONE request.
   * The key file lives at the repo root (eebd4ff8...txt) and is served
     from https://dahvio.com/<key>.txt - no keyLocation param needed.
   * Getting the key URL wrong (http://, www.) causes a 403.
   * A 200 or 202 response = accepted. There's no per-URL feedback; that's
     normal.
=============================================================================
"""

import sys
import json
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET

# ---------------------------------------------------------------- CONFIG ---
HOST     = "dahvio.com"                                 # no www, no scheme
KEY      = "eebd4ff8c7fd4ac3a59ca6a2eb520ad6"
SITEMAP  = "https://dahvio.com/sitemap.xml"
ENDPOINT = "https://api.indexnow.org/indexnow"          # shared endpoint:
                                                        # Bing + Yandex + Seznam
                                                        # + Naver all read it
UA = "Mozilla/5.0 (compatible; DahVio-IndexNow/1.0)"


def get_sitemap_urls(sitemap_url=SITEMAP):
    """Pull every <loc> out of the sitemap."""
    req = urllib.request.Request(sitemap_url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        xml = r.read()
    root = ET.fromstring(xml)
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [loc.text.strip() for loc in root.findall(".//s:loc", ns)]
    if not urls:  # fall back if the sitemap has no namespace
        urls = [loc.text.strip() for loc in root.iter("loc")]
    return urls


def clean(urls):
    """Drop anything that isn't a valid URL on OUR host."""
    good, bad = [], []
    for u in urls:
        u = u.strip()
        if not u.startswith("https://" + HOST + "/"):
            bad.append(u)
            continue
        good.append(u)
    return good, bad


def submit(urls, dry_run=False):
    """POST a batch of URLs to IndexNow."""
    payload = {
        "host": HOST,
        "key": KEY,
        "urlList": urls,
    }
    body = json.dumps(payload).encode("utf-8")

    print(f"\n  Endpoint : {ENDPOINT}")
    print(f"  Host     : {HOST}")
    print(f"  Key      : {KEY}")
    print(f"  URLs     : {len(urls)}")

    if dry_run:
        print("\n  DRY RUN - nothing sent. URLs that would be submitted:")
        for u in urls:
            print("    " + u)
        return

    req = urllib.request.Request(
        ENDPOINT,
        data=body,
        headers={"Content-Type": "application/json; charset=utf-8",
                 "User-Agent": UA},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            code = r.status
            print(f"\n  HTTP {code}")
            if code in (200, 202):
                print("  ACCEPTED. URLs are queued for the Bing index.")
                print("     (200 = accepted, 202 = accepted/validation pending.")
                print("      There's no per-URL feedback - that's normal.)")
            else:
                print(f"  Unexpected status {code}")
    except urllib.error.HTTPError as e:
        print(f"\n  HTTP {e.code}")
        explain(e.code)
        print(f"  Body: {e.read().decode('utf-8', 'replace')[:400]}")
    except Exception as e:
        print(f"\n  {type(e).__name__}: {e}")


def explain(code):
    tips = {
        400: "Bad request - malformed JSON or invalid URL in the list.",
        403: ("KEY NOT VALID. The key file isn't being found. Check that\n"
              f"     https://{HOST}/{KEY}.txt loads in a browser and shows\n"
              "     ONLY the key text. In this repo the file lives at the\n"
              "     repo root and Vercel serves it at the domain root. This\n"
              "     is the #1 IndexNow failure."),
        422: ("URLs don't belong to the host, or the key doesn't match. Check\n"
              "     every URL starts with https://" + HOST),
        429: "Too many requests - you're rate limited. Slow down.",
    }
    if code in tips:
        print("     " + tips[code])


def preflight():
    """Check the key file is live and correct BEFORE submitting."""
    key_url = f"https://{HOST}/{KEY}.txt"
    print("=" * 74)
    print("PREFLIGHT: checking your key file")
    print("=" * 74)
    print(f"  Fetching {key_url}")
    try:
        req = urllib.request.Request(key_url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=20) as r:
            body = r.read().decode("utf-8", "replace").strip()
            print(f"  HTTP {r.status}")
            ctype = r.headers.get("Content-Type", "")
            print(f"  Content-Type: {ctype}")
            print(f"  Body: {body!r}")
            if body == KEY:
                print("  Key file is correct.")
                return True
            else:
                print("  Body does NOT match the key.")
                print(f"     Expected exactly: {KEY}")
                print("     The file must contain ONLY the key - no HTML, no")
                print("     extra text, no quotes.")
                return False
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code} - key file not reachable.")
        print(f"     Check {KEY}.txt is deployed and live at")
        print(f"     https://{HOST}/{KEY}.txt")
        return False
    except Exception as e:
        print(f"  {type(e).__name__}: {e}")
        return False


def main():
    args = sys.argv[1:]
    dry = "--dry-run" in args
    args = [a for a in args if a != "--dry-run"]

    if not preflight():
        print("\n  Fix the key file first - submissions will 403 without it.\n")
        if not dry:
            sys.exit(1)

    if "--sitemap" in args:
        print("\n" + "=" * 74)
        print("Reading sitemap")
        print("=" * 74)
        urls = get_sitemap_urls()
        print(f"  Found {len(urls)} URLs in sitemap")
    elif args:
        urls = args
    else:
        print(__doc__)
        sys.exit(0)

    good, bad = clean(urls)
    if bad:
        print(f"\n  Skipped {len(bad)} URL(s) not on https://{HOST}/:")
        for u in bad[:10]:
            print("     " + u)

    if not good:
        print("\n  Nothing valid to submit.")
        sys.exit(1)

    print("\n" + "=" * 74)
    print("SUBMITTING")
    print("=" * 74)
    submit(good, dry_run=dry)
    print()


if __name__ == "__main__":
    main()
