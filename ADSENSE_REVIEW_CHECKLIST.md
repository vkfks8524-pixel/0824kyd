# KYD AdSense 재심사 체크리스트

최종 기술·콘텐츠 검토일: 2026-08-22

## 저장소에서 완료한 항목

- 22개 정보 글에 작성 주체, 게시일, 최종 검토일을 표시했다.
- 모든 글에 주제별 상황 판단표와 2개 이상의 공식 1차 자료를 추가했다.
- 모든 글에 `Article` JSON-LD, canonical, description, Open Graph 정보를 제공한다.
- 사이트 소개, 실제 오류 제보 창구, 편집 원칙·수정 정책, 개인정보처리방침을 갖췄다.
- 404, 소개, 문의, 편집 정책, 개인정보처리방침에서는 광고 스크립트를 불러오지 않는다.
- 홈페이지, 글 목록, 22개 글에서만 AdSense 사이트 코드를 불러온다.
- `ads.txt`, `robots.txt`, 28개 canonical URL이 포함된 `sitemap.xml`을 제공한다.
- 루트 배포 방식과 `public/` 배포 방식의 파일을 동일하게 유지한다.
- 내부 링크, JSON-LD, 콘텐츠 요구사항과 39개 외부 공식 링크를 자동 검사했다.

## 배포 후 확인할 주소

- <https://www.kyd.kr/>
- <https://www.kyd.kr/posts/>
- <https://www.kyd.kr/about/>
- <https://www.kyd.kr/editorial-policy/>
- <https://www.kyd.kr/contact/>
- <https://www.kyd.kr/privacy/>
- <https://www.kyd.kr/ads.txt>
- <https://www.kyd.kr/robots.txt>
- <https://www.kyd.kr/sitemap.xml>

`kyd.kr`과 `www.kyd.kr` 중 하나를 대표 주소로 정하고 나머지는 대표 주소로 리디렉션한다. 현재 canonical과 sitemap은 `https://www.kyd.kr/`을 대표 주소로 사용한다.

## AdSense·Google 화면에서 운영자가 확인할 항목

1. AdSense → 사이트에서 `kyd.kr`의 코드 감지와 `ads.txt` 상태가 정상인지 확인한다.
2. 개인정보 보호 및 메시지에서 EEA·영국·스위스 방문자용 Google 인증 CMP 메시지를 설정한다.
3. 자동 광고를 켤 경우 문의, 개인정보처리방침, 편집 원칙, 404 및 향후 단순 링크 허브 페이지는 페이지 제외로 설정한다.
4. Google Search Console에 `sitemap.xml`을 제출하고 홈, 글 목록, 대표 글 몇 개의 URL 검사를 요청한다.
5. 배포 직후가 아니라 실제 사이트에 모든 변경이 반영되고 Google이 다시 크롤링할 시간을 준 뒤 재심사를 요청한다.

## 승인 전후에 피할 변경

- 승인 직후 홈페이지의 정보 콘텐츠와 탐색 구조를 없애고 단순 링크 모음만 남기지 않는다.
- 같은 형식의 글을 짧은 기간에 대량 발행하지 않는다.
- 공식 출처를 읽지 않고 검토일만 갱신하지 않는다.
- 광고를 메뉴, 다운로드 버튼, 링크 카드 또는 다음 단계 버튼과 붙여 오인하게 만들지 않는다.
- 글을 `/blog/`로 이동할 때 기존 `/posts/.../` 주소를 삭제하지 말고 각 새 주소로 301 리디렉션한다.

## 유지보수 검사

PowerShell 7에서 다음을 실행한다.

```powershell
pwsh -File ./scripts/validate-site.ps1
pwsh -File ./scripts/check-external-links.ps1
```

글이나 공통 레이아웃을 수정한 뒤에는 실제 배포 폴더가 어느 쪽이더라도 같은 결과가 나오도록 루트와 `public/`을 함께 갱신한다.
