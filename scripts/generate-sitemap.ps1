$ErrorActionPreference = 'Stop'

$entries = @(
  'https://www.kyd.kr/',
  'https://www.kyd.kr/posts/',
  'https://www.kyd.kr/tools/',
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

$toolUrls = Get-ChildItem -LiteralPath 'tools' -Directory | Sort-Object Name | ForEach-Object {
  "https://www.kyd.kr/tools/$($_.Name)/"
}
$entries += $toolUrls

$lines = @('<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
$lines += $entries | ForEach-Object {
  $url = $_
  $relative = ([uri]$url).AbsolutePath.TrimStart('/')
  $htmlPath = Join-Path $PWD ($relative + 'index.html')
  $html = [IO.File]::ReadAllText($htmlPath)
  $modified = [regex]::Match($html, '<meta property="article:modified_time" content="(\d{4}-\d{2}-\d{2})"').Groups[1].Value
  if ($modified) { "  <url><loc>$url</loc><lastmod>$modified</lastmod></url>" }
  else { "  <url><loc>$url</loc></url>" }
}
$lines += '</urlset>'

[IO.File]::WriteAllText((Join-Path $PWD 'sitemap.xml'), ($lines -join "`n") + "`n", [Text.UTF8Encoding]::new($false))
Write-Output "Generated sitemap.xml with $($entries.Count) canonical URLs."
