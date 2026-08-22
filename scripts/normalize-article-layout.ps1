$ErrorActionPreference = 'Stop'

$nav = @'
<nav class="nav" aria-label="주요 메뉴"><a href="/">홈</a><a href="/posts/" aria-current="page">전체 글</a><a href="/about/">사이트 소개</a><a href="/editorial-policy/">편집 원칙</a><a href="/contact/">문의</a><a href="/privacy/">개인정보처리방침</a></nav>
'@

$footer = @'
<footer class="site-footer"><div class="footer-inner"><span>© 2026 KYD 디지털 가이드</span><div class="footer-links"><a href="/about/">사이트 소개</a><a href="/editorial-policy/">편집 원칙</a><a href="/contact/">문의</a><a href="/privacy/">개인정보처리방침</a></div></div></footer>
'@

Get-ChildItem -LiteralPath 'posts' -Directory | ForEach-Object {
  $path = Join-Path $_.FullName 'index.html'
  $html = [IO.File]::ReadAllText($path)
  $html = [regex]::new('<nav class="nav" aria-label="주요 메뉴">.*?</nav>', [Text.RegularExpressions.RegexOptions]::Singleline).Replace($html, $nav, 1)
  $html = [regex]::new('<footer class="site-footer">.*?</footer>', [Text.RegularExpressions.RegexOptions]::Singleline).Replace($html, $footer, 1)
  if (-not $html.Contains('class="skip-link"')) {
    $html = $html.Replace('<body>', "<body>`n  <a class=`"skip-link`" href=`"#main-content`">본문으로 바로가기</a>")
  }
  $html = $html.Replace('<main class="container article-layout">', '<main id="main-content" class="container article-layout">')
  $html = $html.Replace('</script>  <link rel="stylesheet"', "</script>`n  <link rel=`"stylesheet`"")
  if (-not $html.Contains('rel="icon"')) {
    $html = $html.Replace('  <link rel="stylesheet" href="/assets/style.css">', "  <link rel=`"icon`" href=`"/assets/favicon.svg`" type=`"image/svg+xml`">`n  <link rel=`"stylesheet`" href=`"/assets/style.css`">")
  }
  $html = $html.Replace('<!-- adsense-readiness:end -->    </article>', "<!-- adsense-readiness:end -->`n    </article>")
  $html = [regex]::Replace($html, '\s*<!-- (strengthened-content|extra-depth-content):(start|end) -->\s*', "`n      ")
  $html = [regex]::Replace($html, '[ \t]+(?=\r?$)', '', [Text.RegularExpressions.RegexOptions]::Multiline)
  [IO.File]::WriteAllText($path, $html, [Text.UTF8Encoding]::new($false))
}

Write-Output 'Normalized article navigation, footer, and accessibility landmarks.'
