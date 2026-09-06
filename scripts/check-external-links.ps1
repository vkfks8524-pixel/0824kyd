$ErrorActionPreference = 'Stop'

$urls = Get-ChildItem -LiteralPath . -Filter '*.html' -File -Recurse |
  Where-Object FullName -NotMatch '\\public\\' |
  ForEach-Object {
    $html = [IO.File]::ReadAllText($_.FullName)
    [regex]::Matches($html, 'href="(https://[^"]+)"') | ForEach-Object { [Net.WebUtility]::HtmlDecode($_.Groups[1].Value) }
  } |
  Where-Object { $_ -notlike 'https://www.kyd.kr/*' } |
  Sort-Object -Unique

$results = $urls | ForEach-Object -Parallel {
  $url = $_
  try {
    $response = Invoke-WebRequest -Uri $url -Method Head -MaximumRedirection 8 -TimeoutSec 25 -UserAgent 'Mozilla/5.0 (compatible; KYDLinkCheck/1.0)'
    [pscustomobject]@{ Url=$url; Status=[int]$response.StatusCode; Ok=([int]$response.StatusCode -lt 400); Error='' }
  } catch {
    try {
      $response = Invoke-WebRequest -Uri $url -Method Get -MaximumRedirection 8 -TimeoutSec 25 -UserAgent 'Mozilla/5.0 (compatible; KYDLinkCheck/1.0)'
      [pscustomobject]@{ Url=$url; Status=[int]$response.StatusCode; Ok=([int]$response.StatusCode -lt 400); Error='' }
    } catch {
      $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
      [pscustomobject]@{ Url=$url; Status=$status; Ok=$false; Error=$_.Exception.Message }
    }
  }
} -ThrottleLimit 6

$results | Sort-Object Url | Format-Table Status,Ok,Url -AutoSize
$failed = @($results | Where-Object { -not $_.Ok })
if ($failed.Count) {
  Write-Output "FAILED LINKS: $($failed.Count)"
  $failed | ForEach-Object { Write-Output "- [$($_.Status)] $($_.Url) :: $($_.Error)" }
  exit 1
}
Write-Output "PASS: $($results.Count) unique external links responded successfully."
