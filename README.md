# KYD: 사진·파일 관리 도구

https://www.kyd.kr 의 소스입니다. Cloudflare Pages가 `public/`을 제공하며 루트의 같은 파일은 사본입니다.

## 빌드와 검사

```powershell
node scripts/build-site.cjs
node scripts/test-site.cjs
node scripts/verify-live.cjs   # 배포 후 공개 사이트 점검
```

- 한국어 가이드: `scripts/ko-guides.cjs`, 질문: `scripts/ko-faq.cjs`, 도구와 안내 페이지: `scripts/ko-pages.cjs`
- 도구 로직: `assets/ko/core.js`, 화면: `assets/ko/tools.js`, 모양: `assets/ko/ko.css`
- 실험 자료: `assets/evidence/`. `node scripts/fixtures.cjs`로 폴더·중복 시험 자료를 다시 만듭니다.
- 영어판 원본: `content/en/`(보존본). 빌드할 때 `/en/` 주소로 바뀝니다.
- 문의 이메일을 정하면 `scripts/build-site.cjs`의 `CONTACT_EMAIL`에 넣습니다.

## 원칙

- 날짜는 실제로 다시 확인한 글만 바꿉니다.
- 하지 않은 실험, 후기, 전문가 이름을 만들지 않습니다.
- 도구 페이지에는 외부 스크립트와 광고를 넣지 않습니다(`_headers`의 보안 정책).
- 2026-10-07에 내린 글과 도구 주소는 `_worker.js`가 404로 응답합니다.
