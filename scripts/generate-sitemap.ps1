$ErrorActionPreference = 'Stop'

$entries = @(
  'https://www.kyd.kr/',
  'https://www.kyd.kr/posts/',
  'https://www.kyd.kr/about/',
  'https://www.kyd.kr/editorial-policy/',
  'https://www.kyd.kr/updates/',
  'https://www.kyd.kr/contact/',
  'https://www.kyd.kr/privacy/'
)

$postUrls = Get-ChildItem -LiteralPath 'posts' -Directory | Sort-Object Name | ForEach-Object {
  "https://www.kyd.kr/posts/$($_.Name)/"
}
$entries += $postUrls

$lines = @('<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
$lines += $entries | ForEach-Object { "  <url><loc>$_</loc><lastmod>2026-08-23</lastmod></url>" }
$lines += '</urlset>'

[IO.File]::WriteAllText((Join-Path $PWD 'sitemap.xml'), ($lines -join "`n") + "`n", [Text.UTF8Encoding]::new($false))
Write-Output "Generated sitemap.xml with $($entries.Count) canonical URLs."
