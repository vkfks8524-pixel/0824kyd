# Search discovery and reader utility improvements

## Scope

- Keep existing public URLs, the AdSense connection, verification tokens and photo credits.
- Make the homepage heading describe the site rather than a single dated sports result. Keep the sports story as a dated H2 feature and provide static links to useful purchase guides and the article library.
- Add a progressively enhanced calculator within the existing storage-choice article. Its static formula, examples, limitations and sources remain readable without JavaScript.
- Do not invent experience, search volume, popularity or product test results. A planning calculation does not establish that a device has enough usable storage.

## Calculation and privacy

`used + growth * months + temporary + reserve`

The second scenario increases the assumed monthly growth by 2 GB; it is a sensitivity comparison, not a measured forecast. Inputs are bounded, and an edit hides the previous result. The calculator code does not persist or transmit inputs. Article-level advertising code is unchanged.

The RSS generator removes the interactive widget and substitutes a canonical article link. No non-working forms are published in the feed.

## Checks

- `node scripts/test-storage-choice.cjs`: nine numeric examples, sixteen invalid-input cases, markup integration, RSS portability and no storage/network API in calculator code.
- `scripts/test-seo.ps1` and `scripts/validate-site.ps1`: titles, descriptions, canonical URLs, JSON-LD syntax, article links, feed and root/public mirrors.
- Browser checks: example A = 164 GB, higher-growth scenario = 212 GB; blank input rejected; changing input clears stale output; larger-than-512 GB warning; mobile field layout and no document overflow.

## Search Console handling

Compare report dates with publication dates. A discovered-not-indexed report is not proof of a technical block or a content-quality penalty. Inspect representative URLs and run the live test before requesting indexing. Submit the current sitemap without removing the existing sitemap history. Do not repeatedly submit the same URLs.

Accepted submissions do not prove crawling, indexing, rankings or AdSense approval. Keep private account metrics and screenshots out of this public repository.

References:

- https://support.google.com/webmasters/answer/7440203
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
