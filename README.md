# KYD: photo backup and file care

The live site is a focused English-language guide and tool library. Cloudflare Pages serves `public/`; repository-root copies remain mirrored for compatibility. Do not deploy the repository root or `.archive/`.

## Edit and verify

```powershell
node scripts/build-focused-site.cjs
node scripts/test-focused-site.cjs
```

- Guide source: `scripts/focused-content.cjs`.
- Page templates, trust pages and explicit publication manifest: `scripts/build-focused-site.cjs`.
- Tool implementation: `assets/focus-tools.js`.
- Design: `assets/focus.css`.
- Commit generated HTML, RSS, sitemap and `public/` mirrors together.
- Only substantively reviewed pages should receive a new `reviewed` date. Do not automatically bump dates daily.
- The four guides are not an AdSense minimum-page threshold. Approval and indexing are external decisions.

## Withdrawal and recovery

On 2026-10-07 the owner requested temporary withdrawal of all 41 legacy articles. Their old URLs now intentionally return HTTP 404, not a homepage redirect. `/posts/` and `/blog/` are collection aliases for `/guides/`; individual retired URLs are not redirected to unrelated guides. Four unrelated tools were also withdrawn to maintain the new focus.

The complete previous tracked site is recoverable at Git commit `12f61443a337d04f43666d0708f07ac615d1d8ad`. The operator additionally has an ignored local archive at `.archive/site-before-focus-12f6144.zip`, SHA-256 `11CAB53BB02C61FAD2B2851B922616346274A051E5E0DA46EA5C229BE9301121`, and moved original working directories in `.archive/withdrawn-20261007/`.

These archives are not served by the website. The old content remains in public Git history; withdrawal is not a claim of erasure from the Internet. Restore selected material into a separate temporary directory for review first. Do not blindly restore the old feed, sitemap or navigation. Legacy publishing scripts were archived to prevent accidental re-publication.

## Advertising boundary

The publisher meta tag, ads.txt and ownership verification are preserved. This edition deliberately loads no advertising JavaScript. Before enabling ads, verify the AdSense decision and configure applicable consent requirements in the account. Do not put ads on tools, error pages, navigation-only pages or worksheets. Do not claim approval simply because technical checks pass.

## Test interpretation

Automated tests verify deterministic code and generated site structure. Browser checks cover displayed layouts and interactive states. Neither is a real-world cloud recovery test, an independent expert review, a guarantee that every browser works, or a proof of media health. Do not broaden those claims in future copy.
