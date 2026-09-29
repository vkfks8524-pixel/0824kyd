# KYD editorial refresh — 2026-09-29

## Benchmark scope

- [AhrefsTop: Korea / News](https://ahrefstop.com/websites/korea/news), August 2026: chosun.com and donga.com are the first two listed sites by estimated monthly organic-search visits (990K and 500.6K). These are third-party estimates, not verified pageviews, total visitors or KYD targets.
- [Chosun](https://www.chosun.com/) and [Donga](https://www.donga.com/): inspected category navigation, leading headlines with summaries, related-story links and topic sections. Donga's desktop layout was also visually inspected. No article text, photographs, logos or proprietary code were copied.
- [Google: helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): clarity about sources, authorship, useful original explanation and the limits of experience informed the content changes.
- [Google: ask for recrawling](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl): crawling and indexing are separate from deployment; requests do not guarantee indexing or rankings.

## Implemented

- Lightweight editorial home: a dated sports lead, three purchase questions, a cost-comparison entry point and everyday guides.
- Shared navigation, restrained teal palette, readable article measure, responsive images with existing license disclosures, mobile layout and keyboard focus states.
- Static article library with optional local-only search, category links, result count, empty state, reset, history/deep-link support. All 27 articles are present without JavaScript. No invented popularity rankings or views.
- Every article has breadcrumbs, a collapsible contents list and contextual onward links. Existing URLs and all factual source sections remain.
- Four recent articles have short summaries. Three purchase articles gained decision checklists or explicit illustrative calculations. Only those three have a new modification date; their official-source confirmation date remains separately visible. Legacy article review dates were not refreshed.
- Scope and photo policy updated. Real images, attribution, reference-photo caveats and CC BY-SA conditions preserved.
- Canonicals retained, BreadcrumbList added, large-image preview allowed, sitemap regenerated. This is eligibility/clarity work, not a promise of rich results or search exposure.

## Verification

- `scripts/validate-site.ps1`: 40 indexable pages, 27 articles, 5 tools, sitemap/canonical consistency, internal paths and root/public parity.
- `scripts/test-phone-cost.cjs`: 31 calculation checks.
- `scripts/test-tools.cjs`: tool behavior, library search/reset/history/deep links, no-JavaScript listing, every article's contents/IDs/structured data, representative mobile and desktop layouts. External requests are blocked in browser tests to avoid ad traffic.
- Visual review: desktop and mobile home; purchase-article layout; library screenshots.
- Public read-only HTTP check before deployment: home, robots.txt and sitemap returned 200; missing page returned 404. robots.txt allowed crawling and listed the sitemap. This does not establish actual Googlebot access or Google indexing.

## Still needs account-side evidence

Use Search Console's Pages report and URL Inspection to distinguish discovered, crawled-but-not-indexed, duplicate canonical and blocked URLs. Inspect the actual Google-selected canonical and live test before making targeted indexing changes. Submit the sitemap if not already known, and request recrawling only for representative materially changed URLs. Do not repeatedly request the same URL or claim approval/traffic guarantees.
