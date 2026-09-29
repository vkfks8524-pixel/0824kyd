$ErrorActionPreference = 'Stop'
$root = $PWD.Path
[xml]$sitemap = Get-Content -LiteralPath 'sitemap.xml' -Raw
[xml]$rss = Get-Content -LiteralPath 'rss.xml' -Raw
$siteUrls = @($sitemap.urlset.url | ForEach-Object { [string]$_.loc })
$postUrls = @($siteUrls | Where-Object { $_ -match '^https://www\.kyd\.kr/posts/[^/]+/$' })
$items = @($rss.rss.channel.item)
if ($items.Count -ne $postUrls.Count) { throw 'RSS must include every published article' }
$seenTitles = @{}
$seenDescriptions = @{}
foreach ($url in $siteUrls) {
  $relative = ([uri]$url).AbsolutePath.TrimStart('/') + 'index.html'
  $html = [IO.File]::ReadAllText((Join-Path $root $relative))
  $title = [regex]::Match($html, '<title>(.*?)</title>').Groups[1].Value
  $description = [regex]::Match($html, '<meta name="description" content="([^"]+)"').Groups[1].Value
  if (-not $title -or $seenTitles.ContainsKey($title)) { throw "Missing/duplicate title: $url" }
  if (-not $description -or $seenDescriptions.ContainsKey($description)) { throw "Missing/duplicate description: $url" }
  $seenTitles[$title] = $true
  $seenDescriptions[$description] = $true
  if ($html -match '(?i)<meta[^>]+(?:name="robots"|name="googlebot")[^>]+noindex') { throw "Indexable page disallows indexing: $url" }
  if (-not $html.Contains('type="application/rss+xml"')) { throw "Missing RSS discovery link: $url" }
  foreach ($match in [regex]::Matches($html, '<script type="application/ld\+json">(.*?)</script>', 'Singleline')) {
    $null = $match.Groups[1].Value | ConvertFrom-Json
  }
}
$seenFeedUrls = @{}
foreach ($item in $items) {
  $url = [string]$item.link
  if ($url -notin $postUrls -or $seenFeedUrls.ContainsKey($url)) { throw "Invalid/duplicate RSS URL: $url" }
  $seenFeedUrls[$url] = $true
  $body = $item.description.InnerText
  if (-not $body.Contains('class="sources"') -or -not $body.Contains('class="author-box"') -or $body.Length -lt 1000) { throw "Incomplete article in RSS: $url" }
  if ($body -match '(?:src|href|srcset)="/' -or $body -match '<script|adsbygoogle|class="reading-toc"') { throw "Invalid portable RSS content: $url" }
  $null = [DateTimeOffset]::Parse([string]$item.pubDate, [Globalization.CultureInfo]::InvariantCulture)
  if ($url -like '*asian-games*' -and (-not $body.Contains('CC BY-SA 4.0') -or -not $body.Contains('2019'))) { throw 'RSS lost photo attribution or archival caveat' }
}
if ((Get-Item 'rss.xml').Length -ge 10MB) { throw 'RSS too large for Naver' }
$homeHtml = [IO.File]::ReadAllText((Join-Path $root 'index.html'))
if ([regex]::Matches($homeHtml, '<meta name="naver-site-verification" content="[a-f0-9]+"').Count -ne 1) { throw 'Missing or duplicate Naver verification token' }
Write-Output "PASS: $($siteUrls.Count) unique titles/descriptions, canonical sitemap paths, RSS discovery, valid structured data; $($items.Count) full-content RSS articles with portable URLs and Naver verification."
