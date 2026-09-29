# KYD search publishing checklist

## Canonical site and discovery

- Primary host: `https://www.kyd.kr/`. Keep article links, canonicals, sitemap entries and RSS item links on this host.
- Sitemap: `https://www.kyd.kr/sitemap.xml` (all indexable pages).
- RSS: `https://www.kyd.kr/rss.xml` (all published articles, with complete body and photo credits).
- Preserve the Naver ownership meta tag in the homepage when redesigning it. It is a public verification value, not a password.
- Existing HTTP and non-www requests redirect to the HTTPS www host. Do not add conflicting redirect rules.

## Before publishing or materially editing an article

1. Answer one concrete reader question. Use the same subject in the visible H1, title and description, without repeating keyword lists.
2. Add useful original explanation: a worked calculation, decision conditions, record interpretation or a reproducible procedure. Do not claim first-hand tests that did not occur.
3. Include primary sources, the date and scope of checking, and licensed image attribution. Sports results need an explicit time and coverage boundary.
4. Preserve established URLs. Set `datePublished` once; change `dateModified` only for substantive changes. A design-only edit is not a new factual review.
5. Link the article from the static article library and relevant existing articles. A search-only result is not a substitute for a normal HTML link.
6. Run from the repository root:

   ```powershell
   ./scripts/generate-sitemap.ps1
   node scripts/generate-rss.cjs
   # Mirror changed HTML/assets and sitemap.xml into public/ before validation.
   ./scripts/test-seo.ps1
   ./scripts/validate-site.ps1
   ```

   The RSS generator updates both root and public copies. It retains complete article text, source/author sections, archival-photo caveats and absolute media/link URLs. Dates in source HTML that contain only a day are serialized at midnight KST for RSS; this does not establish an exact publication time.

7. Deploy, then verify public responses and representative mobile/desktop pages. Verification files and feeds must return 200 without login or a challenge.

## Search Advisor and Search Console

On 2026-09-29, the canonical site was ownership-verified in Naver Search Advisor. The sitemap and RSS feed were accepted in their respective submission lists. Registration is not confirmation of search indexing or rankings. The verification and feed changes were deployed in commit `0abfe74`.

- Register the canonical HTTPS www host in Naver Search Advisor and complete ownership verification. Submit the sitemap and RSS URLs above.
- Use URL inspection and selective collection requests for the homepage and materially changed priority articles; do not resubmit the same URLs repeatedly.
- Inspect Google's Pages report and Google-selected canonical before attributing low exposure to layout or changing URLs.
- Follow actual impressions, clicks, search terms, indexed pages and time since publication. Separate a low-impression sample from a true click-through-rate problem.
- Registration, accepted collection requests and successful SEO tests are not proof of indexing, ranking, visits or AdSense approval.

## Current reader intents (not search-volume claims)

| Article | Main question | Distinct value to maintain |
| --- | --- | --- |
| Asian Games dated results | What were the confirmed scores on this date? | Official score table, time boundary and explanation |
| iPhone model comparison | Which model fits my size and budget constraints? | Source-dated comparison and choice criteria |
| Storage choice | Do I need 256GB or 512GB? | Own-usage calculation and sensitivity to assumptions |
| Phone total cost | Which quote costs less over the same period? | Transparent calculation and working comparison tool |

## Primary references

- https://searchadvisor.naver.com/guide/seo-basic-intro
- https://searchadvisor.naver.com/guide/request-feed
- https://searchadvisor.naver.com/guide/markup-content
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
