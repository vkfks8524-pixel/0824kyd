$ErrorActionPreference = 'Stop'

$errors = [Collections.Generic.List[string]]::new()
$warnings = [Collections.Generic.List[string]]::new()

function Add-Error([string]$message) { $errors.Add($message) }
function Add-Warning([string]$message) { $warnings.Add($message) }

$root = $PWD.Path
$htmlFiles = @('index.html', 'about/index.html', 'editorial-policy/index.html', 'contact/index.html', 'privacy/index.html', 'updates/index.html', 'posts/index.html')
$postFiles = Get-ChildItem -LiteralPath 'posts' -Directory | Sort-Object Name | ForEach-Object { "posts/$($_.Name)/index.html" }
$toolFiles = @('tools/index.html') + (Get-ChildItem -LiteralPath 'tools' -Directory | Sort-Object Name | ForEach-Object { "tools/$($_.Name)/index.html" })
$htmlFiles += $postFiles + $toolFiles

$canonicals = @{}
foreach ($relative in $htmlFiles) {
  $path = Join-Path $root $relative
  if (-not (Test-Path -LiteralPath $path)) { Add-Error "Missing HTML: $relative"; continue }
  $html = [IO.File]::ReadAllText($path)
  foreach ($pattern in @('<title>[^<]+</title>', '<meta name="description" content="[^"]+">', '<h1[^>]*>[^<]+</h1>', '<link rel="canonical" href="[^"]+">')) {
    if ([regex]::Matches($html, $pattern).Count -ne 1) { Add-Error "$relative must contain exactly one $pattern" }
  }
  $canonical = [regex]::Match($html, '<link rel="canonical" href="([^"]+)">').Groups[1].Value
  if ($canonical) {
    if ($canonicals.ContainsKey($canonical)) { Add-Error "Duplicate canonical: $canonical" } else { $canonicals[$canonical] = $relative }
  }
  if (-not $html.Contains('class="skip-link"')) { Add-Error "Missing skip link: $relative" }
  if (-not $html.Contains('id="main-content"')) { Add-Error "Missing main landmark id: $relative" }

  $internalLinks = [regex]::Matches($html, 'href="(/[^"]*)"') | ForEach-Object { $_.Groups[1].Value.Split('#')[0].Split('?')[0] } | Sort-Object -Unique
  foreach ($link in $internalLinks) {
    if ($link -eq '/') { $target = Join-Path $root 'index.html' }
    elseif ($link.EndsWith('/')) { $target = Join-Path $root ($link.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)); $target = Join-Path $target 'index.html' }
    else { $target = Join-Path $root $link.TrimStart('/') }
    if (-not (Test-Path -LiteralPath $target)) { Add-Error "Broken internal link in $relative -> $link" }
  }
}

foreach ($relative in $postFiles) {
  $html = [IO.File]::ReadAllText((Join-Path $root $relative))
  foreach ($required in @('meta name="author"', 'application/ld+json', 'dateModified', 'class="table-wrap"', 'class="sources"', 'class="author-box"', '최종 검토')) {
    if (-not $html.Contains($required)) { Add-Error "$relative missing article requirement: $required" }
  }
  if ([regex]::Matches($html, '<a href="https://[^\"]+" rel="noopener noreferrer">').Count -lt 2) { Add-Error "$relative needs at least two cited official links" }
  $json = [regex]::Match($html, '<script type="application/ld\+json">(.*?)</script>', [Text.RegularExpressions.RegexOptions]::Singleline).Groups[1].Value
  try { $null = $json | ConvertFrom-Json } catch { Add-Error "$relative has invalid JSON-LD: $($_.Exception.Message)" }
  $plain = [regex]::Replace($html, '<script.*?</script>|<style.*?</style>|<[^>]+>', ' ', [Text.RegularExpressions.RegexOptions]::Singleline)
  $plain = [Net.WebUtility]::HtmlDecode($plain)
  $charCount = ($plain -replace '\s+', '').Length
  if ($charCount -lt 2200) { Add-Warning "$relative visible Korean/content character count is only $charCount" }
}

$toolApplicationFiles = $toolFiles | Where-Object { $_ -ne 'tools/index.html' }
foreach ($relative in $toolApplicationFiles) {
  $html = [IO.File]::ReadAllText((Join-Path $root $relative))
  foreach ($required in @('meta name="author"', 'application/ld+json', '"@type":"WebApplication"', '/assets/tools.js', 'class="tool-shell"', 'class="sources"')) {
    if (-not $html.Contains($required)) { Add-Error "$relative missing tool requirement: $required" }
  }
  if ([regex]::Matches($html, '<a href="https://[^\"]+" rel="noopener noreferrer">').Count -lt 2) { Add-Error "$relative needs at least two cited official links" }
  $json = [regex]::Match($html, '<script type="application/ld\+json">(.*?)</script>', [Text.RegularExpressions.RegexOptions]::Singleline).Groups[1].Value
  try { $null = $json | ConvertFrom-Json } catch { Add-Error "$relative has invalid JSON-LD: $($_.Exception.Message)" }
}

$nonContentPages = @('404.html', 'about/index.html', 'editorial-policy/index.html', 'contact/index.html', 'privacy/index.html', 'updates/index.html', 'posts/index.html') + $toolFiles
foreach ($relative in $nonContentPages) {
  $html = [IO.File]::ReadAllText((Join-Path $root $relative))
  if ($html.Contains('pagead2.googlesyndication.com')) { Add-Error "Ad code should not load on utility page: $relative" }
}

$ads = [IO.File]::ReadAllText((Join-Path $root 'ads.txt')).Trim()
if ($ads -ne 'google.com, pub-7587676721583907, DIRECT, f08c47fec0942fa0') { Add-Error 'ads.txt does not exactly match the AdSense publisher record' }

$robots = [IO.File]::ReadAllText((Join-Path $root 'robots.txt'))
if (-not $robots.Contains('User-agent: *') -or -not $robots.Contains('Sitemap: https://www.kyd.kr/sitemap.xml')) { Add-Error 'robots.txt is missing the general crawler rule or sitemap URL' }

$sitemap = [IO.File]::ReadAllText((Join-Path $root 'sitemap.xml'))
foreach ($canonical in $canonicals.Keys) {
  if (-not $sitemap.Contains("<loc>$canonical</loc>")) { Add-Error "Canonical missing from sitemap: $canonical" }
}
if ([regex]::Matches($sitemap, '<url>').Count -ne $canonicals.Count) { Add-Error "Sitemap URL count does not match canonical page count ($([regex]::Matches($sitemap, '<url>').Count) vs $($canonicals.Count))" }

$postIndex = [IO.File]::ReadAllText((Join-Path $root 'posts/index.html'))
$listedPosts = [regex]::Matches($postIndex, '<article class="[^"]*\bpost-card\b[^"]*">.*?<a href="(/posts/[^\"]+/)"', [Text.RegularExpressions.RegexOptions]::Singleline) | ForEach-Object { $_.Groups[1].Value }
if ($listedPosts.Count -ne $postFiles.Count -or ($listedPosts | Sort-Object -Unique).Count -ne $postFiles.Count) { Add-Error "Posts index must list all $($postFiles.Count) unique article URLs" }

$homeHtml = [IO.File]::ReadAllText((Join-Path $root 'index.html'))
if (-not $homeHtml.Contains('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) { Add-Error 'Homepage must retain the AdSense connection code' }
foreach ($relative in $postFiles) {
  $html = [IO.File]::ReadAllText((Join-Path $root $relative))
  if (-not $html.Contains('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) { Add-Error "Article is missing AdSense connection code: $relative" }
}

$mirrorRoots = @('about','contact','privacy','editorial-policy','updates','posts','tools','assets')
$mirrorFiles = @('index.html','404.html','ads.txt','robots.txt','sitemap.xml')
foreach ($relative in $mirrorFiles) {
  $rootHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $root $relative)).Hash
  $publicHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path (Join-Path $root 'public') $relative)).Hash
  if ($rootHash -ne $publicHash) { Add-Error "Root/public mismatch: $relative" }
}
foreach ($directory in $mirrorRoots) {
  Get-ChildItem -LiteralPath $directory -File -Recurse | ForEach-Object {
    $relative = [IO.Path]::GetRelativePath($root, $_.FullName)
    $publicPath = Join-Path (Join-Path $root 'public') $relative
    if (-not (Test-Path -LiteralPath $publicPath)) { Add-Error "Missing public mirror: $relative"; return }
    if ((Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash -ne (Get-FileHash -Algorithm SHA256 -LiteralPath $publicPath).Hash) { Add-Error "Root/public mismatch: $relative" }
  }
}

Write-Output "Validated $($htmlFiles.Count) indexable HTML pages, $($postFiles.Count) articles, $($toolApplicationFiles.Count) tools, and $($canonicals.Count) unique canonicals."
if ($warnings.Count) { Write-Output 'WARNINGS:'; $warnings | ForEach-Object { Write-Output "- $_" } }
if ($errors.Count) { Write-Output 'ERRORS:'; $errors | ForEach-Object { Write-Output "- $_" }; exit 1 }
Write-Output 'PASS: Site structure, trust signals, article requirements, crawl files, internal links, and public mirror are consistent.'
