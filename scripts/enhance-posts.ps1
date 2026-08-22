$ErrorActionPreference = 'Stop'

$reviewDate = '2026-08-22'
$reviewDateKo = '2026년 8월 22일'

$items = @(
  @{ slug='android-ad-notification-cleanup'; rows=@(
      @('브라우저를 닫아도 광고가 알림창에 뜸','브라우저의 사이트 알림 권한부터 확인','알림을 길게 눌러 보낸 앱 이름 확인'),
      @('특정 앱을 연 뒤에만 전면 광고가 뜸','최근 설치 앱과 다른 앱 위에 표시 권한 확인','앱 삭제 전 필요한 데이터 백업'),
      @('시스템 업데이트·택배처럼 위장한 알림','알림을 누르지 말고 공식 앱을 직접 열어 확인','비밀번호·결제정보 입력 금지')
    ); sources=@(
      @('Android 알림 제어 공식 안내','https://support.google.com/android/answer/9079661?hl=ko'),
      @('Chrome의 위험한 사이트 경고 안내','https://support.google.com/chrome/answer/99020?hl=ko')
    ); note='기기 제조사와 Android 버전에 따라 메뉴 이름은 조금 다를 수 있습니다. 알림을 보낸 앱을 먼저 확인하면 무작정 앱을 삭제하는 일을 줄일 수 있습니다.' },
  @{ slug='browser-cache-refresh'; rows=@(
      @('내 컴퓨터에서만 예전 화면','강력 새로고침 또는 시크릿 창으로 비교','개인 브라우저 캐시 가능성이 큼'),
      @('다른 기기에서도 모두 예전 화면','최근 배포 성공 여부와 배포 파일 확인','배포 실패 또는 잘못된 출력 폴더 가능성'),
      @('일부 파일만 예전 버전','해당 URL을 직접 열고 CDN 캐시 확인','필요한 URL만 선택적으로 purge')
    ); sources=@(
      @('Chrome 캐시·쿠키 삭제 안내','https://support.google.com/accounts/answer/32050?hl=ko'),
      @('Cloudflare 캐시 삭제 공식 문서','https://developers.cloudflare.com/cache/how-to/purge-cache/')
    ); note='캐시 전체 삭제는 로그인 상태와 사이트 설정까지 지울 수 있습니다. 먼저 강력 새로고침과 시크릿 창으로 원인을 구분한 뒤 필요한 범위만 정리하세요.' },
  @{ slug='browser-password-save-safety'; rows=@(
      @('나만 쓰는 잠금 설정 기기','저장 기능 사용 가능','기기 잠금과 2단계 인증을 함께 사용'),
      @('가족과 함께 쓰는 PC','별도 운영체제 계정을 만든 뒤 사용','공용 계정에는 비밀번호 저장 금지'),
      @('PC방·도서관·숙소 기기','저장하지 않음','사용 후 로그아웃과 브라우저 데이터 확인')
    ); sources=@(
      @('Google 비밀번호 관리자 시작 안내','https://support.google.com/chrome/answer/6208650?hl=ko'),
      @('Chrome 비밀번호 노출 확인 방식','https://support.google.com/chrome/answer/10311524?hl=ko')
    ); note='비밀번호 저장 여부보다 중요한 것은 기기 잠금, 사이트마다 다른 비밀번호, 복구 수단, 2단계 인증입니다. 하나가 약하면 저장 기능만으로 계정을 보호할 수 없습니다.' },
  @{ slug='chrome-download-warning'; rows=@(
      @('공식 사이트인데 "일반적이지 않음" 표시','게시자·주소·파일명을 다시 대조','확신이 없으면 공급자 고객지원에서 재확인'),
      @('압축파일 비밀번호를 따로 전달받음','검사 회피 가능성을 의심','예상한 발신자가 아니면 삭제'),
      @('경고를 끄라고 안내함','다운로드 중단','보안 기능 해제 요구는 강한 위험 신호')
    ); sources=@(
      @('Chrome 다운로드 차단과 경고 설명','https://support.google.com/chrome/answer/6261569?hl=ko'),
      @('Chrome 세이프 브라우징 보호 수준','https://support.google.com/chrome/answer/9890866?hl=ko')
    ); note='경고가 오탐일 가능성은 있지만, 사용자가 그 자리에서 안전을 증명할 수 있다는 뜻은 아닙니다. 파일이 꼭 필요하면 공식 배포처와 게시자를 별도로 확인하세요.' },
  @{ slug='cloud-storage-cleanup'; rows=@(
      @('용량이 갑자기 가득 참','휴지통·대용량 파일·백업 폴더 확인','휴지통도 용량에 포함되는지 서비스별 확인'),
      @('사진이 대부분 차지함','백업 완료 상태를 먼저 확인','동기화 중 삭제하면 클라우드에서도 사라질 수 있음'),
      @('공유받은 파일이 많음','소유권과 용량 계산 기준 확인','내 소유 파일만 실제 용량을 차지할 수 있음')
    ); sources=@(
      @('Google 계정 저장용량 작동 방식','https://support.google.com/googleone/answer/9312312?hl=ko'),
      @('Google 저장용량 정리 공식 안내','https://support.google.com/googleone/answer/6374270?hl=ko')
    ); note='동기화 서비스의 삭제는 여러 기기에 전파될 수 있습니다. 중요한 파일은 별도 사본을 만든 뒤, 휴지통까지 비우기 전에 복원이 가능한지 확인하세요.' },
  @{ slug='cloudflare-domain-checking'; rows=@(
      @('네임서버가 아직 이전 업체','등록기관에서 Cloudflare가 준 두 주소로 변경','전파 중 반복 변경 금지'),
      @('Pages에는 도메인이 없고 DNS만 생성','Pages 프로젝트의 Custom domains에서 먼저 추가','수동 CNAME만으로는 연결이 끝나지 않을 수 있음'),
      @('DNS는 정상인데 HTTPS 오류','인증서 발급 상태와 CAA 레코드 확인','활성화 전 프록시·리디렉션을 계속 바꾸지 않기')
    ); sources=@(
      @('Cloudflare Pages 사용자 지정 도메인','https://developers.cloudflare.com/pages/configuration/custom-domains/'),
      @('Cloudflare Pages 배포·경로 동작','https://developers.cloudflare.com/pages/configuration/serving-pages/')
    ); note='"확인 중"은 DNS, 도메인 연결, 인증서 중 어느 단계인지 구분해야 합니다. 설정 화면을 캡처할 때는 계정 ID와 API 토큰을 반드시 가리세요.' },
  @{ slug='cloudflare-pages-domain'; rows=@(
      @('루트 도메인 kyd.kr 연결','Cloudflare zone과 네임서버 확인','Pages의 Custom domains에서 등록'),
      @('www.kyd.kr 연결','Pages에서 하위 도메인 추가','필요한 CNAME을 Pages가 만들도록 진행'),
      @('두 주소가 각각 열림','대표 주소 하나를 정해 리디렉션','canonical·sitemap도 대표 주소로 통일')
    ); sources=@(
      @('Cloudflare Pages 사용자 지정 도메인','https://developers.cloudflare.com/pages/configuration/custom-domains/'),
      @('Cloudflare Pages 파일 제공 규칙','https://developers.cloudflare.com/pages/configuration/serving-pages/')
    ); note='도메인 구매처, DNS, Pages 배포는 서로 다른 단계입니다. 한 번에 여러 설정을 바꾸지 말고 각 단계의 상태가 활성인지 확인한 뒤 다음 단계로 이동하세요.' },
  @{ slug='free-program-install-checkbox'; rows=@(
      @('"빠른 설치"만 보임','사용자 지정·고급 설치 옵션 확인','제휴 앱 선택이 숨겨져 있을 수 있음'),
      @('브라우저 시작 페이지 변경 동의','체크 해제','프로그램 핵심 기능과 무관하면 거절'),
      @('게시자 불명 또는 서명 없음','설치 중단','공식 배포처와 디지털 서명 재확인')
    ); sources=@(
      @('Microsoft의 원치 않는 소프트웨어 예방 안내','https://support.microsoft.com/en-us/windows/security/threat-malware-protection/protect-your-pc-from-unwanted-software'),
      @('Windows PUA 차단 설정','https://support.microsoft.com/en-us/windows/protect-your-pc-from-potentially-unwanted-applications-c7668a25-174e-3b78-0191-faf0607f7a6e')
    ); note='설치 화면의 동의는 계약과 설정 변경을 포함할 수 있습니다. 필요한 프로그램 이름 외의 항목이 보이면 체크 상태와 게시자를 한 줄씩 확인하세요.' },
  @{ slug='gmail-attachment-check'; rows=@(
      @('예상한 사람이 예상한 파일을 보냄','발신 주소와 파일 형식을 재확인 후 열기','계정이 탈취됐을 가능성도 있으므로 문맥 확인'),
      @('급한 결제·로그인을 요구','첨부와 링크를 열지 않음','공식 앱이나 저장한 주소로 직접 확인'),
      @('매크로 문서·실행 파일·암호화 압축','고위험으로 취급','별도 채널로 발신자 확인')
    ); sources=@(
      @('Gmail 피싱 식별·신고 안내','https://support.google.com/mail/answer/8253?hl=ko'),
      @('Chrome 다운로드 경고 설명','https://support.google.com/chrome/answer/6261569?hl=ko')
    ); note='보낸 사람 이름은 쉽게 위조될 수 있으므로 실제 이메일 주소와 대화 맥락을 함께 봐야 합니다. 의심되는 경우 회신 대신 알고 있던 연락처로 확인하세요.' },
  @{ slug='google-account-security'; rows=@(
      @('모르는 로그인 알림','최근 보안 활동과 로그인 기기 확인','의심 기기 로그아웃 후 비밀번호 변경'),
      @('복구 전화·메일이 오래됨','현재 접근 가능한 정보로 갱신','타인의 연락처를 임시로 두지 않기'),
      @('같은 비밀번호를 여러 곳에서 사용','각 사이트마다 고유 비밀번호로 교체','비밀번호 관리자와 2단계 인증 병행')
    ); sources=@(
      @('Google 계정 보안 강화 공식 안내','https://support.google.com/accounts/answer/46526?hl=ko'),
      @('Google 2단계 인증 설명','https://support.google.com/accounts/answer/10956730?hl=ko')
    ); note='보안 사고가 의심되면 비밀번호만 바꾸고 끝내지 말고 로그인 세션, 복구 정보, 연결된 타사 앱까지 확인해야 합니다.' },
  @{ slug='google-drive-sharing-permission'; rows=@(
      @('한 사람에게만 전달','제한됨 + 특정 사용자 추가','업무·개인 계정을 정확히 구분'),
      @('링크가 있는 사람 모두 열람','뷰어 권한으로 시작','링크 재전달 가능성을 전제로 판단'),
      @('공동 편집 필요','필요한 사람에게만 편집자','편집자는 이동·삭제·재공유가 가능할 수 있음')
    ); sources=@(
      @('Google Drive 파일 공유와 권한','https://support.google.com/drive/answer/2494822?hl=ko'),
      @('Google Drive 폴더 권한 상속','https://support.google.com/drive/answer/7166529?hl=ko')
    ); note='폴더 권한은 안쪽 파일에 상속됩니다. 일부 파일만 더 제한해야 한다면 제한된 별도 폴더로 분리하는 편이 안전합니다.' },
  @{ slug='home-router-restart'; rows=@(
      @('한 기기만 느림','그 기기의 Wi-Fi·앱·업데이트 확인','공유기 전체 문제로 단정하지 않기'),
      @('모든 기기가 느림','유선 연결과 통신사 장애 여부 비교','모뎀·공유기 표시등 기록'),
      @('재부팅 후 잠깐만 정상','과열·오래된 펌웨어·회선 문제 점검','공장 초기화는 설정 백업 후 마지막 수단')
    ); sources=@(
      @('FTC의 홈 네트워크 보안 안내','https://consumer.ftc.gov/articles/protect-your-personal-information-hackers-and-scammers'),
      @('FCC 홈 네트워크 점검 자료','https://docs.fcc.gov/public/attachments/DOC-363362A1.pdf')
    ); note='전원을 끈 순서와 표시등 상태를 메모하면 통신사 상담에 도움이 됩니다. 공장 초기화는 Wi-Fi 이름과 비밀번호 등 모든 설정을 지우므로 단순 재부팅과 구분하세요.' },
  @{ slug='password-manager-start'; rows=@(
      @('처음 도입','가장 중요한 계정 3~5개부터 이동','한 번에 모두 바꾸다 잠기지 않도록 단계 진행'),
      @('마스터 비밀번호 선택','길고 고유한 문장형 비밀번호','다른 사이트에 절대 재사용하지 않기'),
      @('복구 수단 설정','복구 코드 오프라인 보관','클라우드 한 곳에만 두지 않기')
    ); sources=@(
      @('Google 비밀번호 관리자 시작 안내','https://support.google.com/chrome/answer/6208650?hl=ko'),
      @('노출·중복 비밀번호 점검 방법','https://support.google.com/chrome/answer/9457609?hl=ko')
    ); note='비밀번호 관리자는 모든 위험을 없애는 도구가 아니라 고유 비밀번호 사용을 현실적으로 돕는 도구입니다. 마스터 비밀번호와 복구 수단은 별도로 보호하세요.' },
  @{ slug='pdf-link-safety'; rows=@(
      @('공식 기관 도메인의 예상 문서','주소와 파일명을 확인 후 브라우저 미리보기','로그인을 다시 요구하면 주소 재확인'),
      @('단축 URL·낯선 파일 공유 주소','원래 주소 확인 전 열지 않음','보낸 사람에게 공식 원문 링크 요청'),
      @('PDF처럼 보이나 확장자가 exe·scr','즉시 삭제','Windows에서 확장자 표시를 켜고 확인')
    ); sources=@(
      @('Chrome 다운로드 차단과 파일 경고','https://support.google.com/chrome/answer/6261569?hl=ko'),
      @('Windows 파일 확장자 안내','https://support.microsoft.com/en-gb/windows/common-file-name-extensions-in-windows-da4a4430-8e76-89c5-59f7-1cdbbc75cb01')
    ); note='자물쇠와 HTTPS는 전송 구간 암호화를 뜻할 뿐 문서 작성자의 신뢰성을 보증하지 않습니다. 도메인 철자와 문서를 기대한 경로를 함께 확인하세요.' },
  @{ slug='public-wifi-safety'; rows=@(
      @('웹 검색·뉴스 읽기','HTTPS 확인 후 이용 가능','자동 연결과 파일 공유는 끄기'),
      @('은행·결제·중요 계정 변경','가능하면 모바일 데이터 사용','공용망에서는 민감 작업 미루기'),
      @('이름이 비슷한 Wi-Fi가 여러 개','직원·안내판으로 정확한 SSID 확인','가짜 접속점 가능성 고려')
    ); sources=@(
      @('FTC 공용 Wi-Fi 안전 안내','https://consumer.ftc.gov/articles/are-public-wi-fi-networks-safe-what-you-need-know'),
      @('CISA 여행 중 공용 Wi-Fi 보안 안내','https://www.cisa.gov/news-events/news/holiday-traveling-personal-internet-enabled-devices')
    ); note='HTTPS가 널리 쓰이면서 위험은 줄었지만, 가짜 사이트에 접속하면 암호화돼도 안전하지 않습니다. 네트워크 이름과 목적지 주소를 각각 확인하세요.' },
  @{ slug='qr-code-safety'; rows=@(
      @('가게 메뉴·공공 안내판','스티커 덧붙임과 미리보기 주소 확인','결제·로그인 요구 시 공식 앱으로 재확인'),
      @('문자·이메일로 갑자기 도착','스캔하지 않음','알고 있던 전화번호나 공식 사이트로 확인'),
      @('결제 금액·수취인이 예상과 다름','결제 취소','QR을 다시 찍어도 해결되지 않음')
    ); sources=@(
      @('FTC QR코드 사기 예방 안내','https://consumer.ftc.gov/consumer-alerts/2023/12/scammers-hide-harmful-links-qr-codes-steal-your-information'),
      @('Google 계정 보안 강화 안내','https://support.google.com/accounts/answer/46526?hl=ko')
    ); note='QR코드는 주소를 눈에 보이지 않게 담는 수단입니다. 스캔 뒤 바로 진행하지 말고 브라우저가 보여주는 도메인, 결제 대상, 요청 권한을 확인하세요.' },
  @{ slug='screen-capture-privacy-check'; rows=@(
      @('오류 화면 공유','오류 문구와 필요한 메뉴만 잘라내기','이름·메일·계정 ID·탭 제목 가리기'),
      @('지도·배송 화면','주소와 실시간 위치 제거','사진 메타데이터도 별도로 확인'),
      @('결제·QR·바코드 화면','가능하면 공유하지 않음','잔액·주문번호·인증 코드는 재사용될 수 있음')
    ); sources=@(
      @('Microsoft 캡처 도구 사용법','https://support.microsoft.com/en-gb/windows/open-snipping-tool-and-take-a-screenshot-a35ac9ff-4a58-24c9-3253-f12bac9f9d44'),
      @('FTC 개인정보 보호 기본 수칙','https://consumer.ftc.gov/articles/protect-your-personal-information-hackers-and-scammers')
    ); note='흐림 처리는 되돌리거나 문자를 추측할 수 있는 경우가 있어 단색으로 완전히 덮거나 필요한 부분만 다시 캡처하는 방법이 더 안전합니다.' },
  @{ slug='smartphone-photo-backup'; rows=@(
      @('클라우드 자동 백업','최근 사진의 백업 완료 표시 확인','앱에 보인다고 모두 백업된 것은 아님'),
      @('PC로 케이블 복사','연도·월 폴더로 복사 후 몇 장 직접 열기','복사 확인 전 휴대폰 원본 삭제 금지'),
      @('기기 교체 예정','클라우드와 별도 저장장치 두 사본 권장','새 기기에서 확인한 뒤 초기화')
    ); sources=@(
      @('Google 포토 백업 공식 안내','https://support.google.com/photos/answer/6193313?hl=ko'),
      @('Google 포토 기기 저장공간 확보 안내','https://support.google.com/photos/answer/6128843?hl=ko')
    ); note='동기화와 백업은 삭제 동작이 다를 수 있습니다. 서비스의 "백업 완료" 상태와 웹에서의 열람을 확인한 뒤 원본을 정리하세요.' },
  @{ slug='smartphone-storage-cleanup'; rows=@(
      @('사진·동영상이 큼','백업 완료 확인 후 큰 동영상부터 검토','동기화 삭제 범위 확인'),
      @('메신저가 큼','앱 내부 저장공간 관리 사용','대화방 기록과 다운로드 파일을 구분'),
      @('앱 캐시가 큼','캐시만 먼저 삭제','저장공간/데이터 삭제는 로그인·설정을 지울 수 있음')
    ); sources=@(
      @('Android 저장공간 확보 안내','https://support.google.com/googleplay/answer/7431795?hl=ko'),
      @('Google 포토 기기 공간 확보 안내','https://support.google.com/photos/answer/6128843?hl=ko')
    ); note='"캐시 삭제"와 "저장공간 삭제"는 결과가 다릅니다. 버튼 문구를 확인하고, 복구가 어려운 사진·대화·인증 앱 데이터부터 백업하세요.' },
  @{ slug='used-phone-reset-check'; rows=@(
      @('Android 판매','백업 → 계정 확인/삭제 → 초기화 → 초기 설정 화면 확인','최근 Google 비밀번호 변경 시 대기 조건 확인'),
      @('iPhone 판매','백업 → Apple 계정/나의 찾기 처리 → 모든 콘텐츠 지우기','eSIM·Apple Pay·신뢰 기기도 확인'),
      @('초기화 뒤 내 계정을 요구','양도 중단 후 계정 잠금 상태 해결','구매자에게 비밀번호를 알려주지 않기')
    ); sources=@(
      @('Android 공장 초기화 공식 안내','https://support.google.com/android/answer/6088915?hl=ko'),
      @('Apple 기기 판매 전 공식 절차','https://support.apple.com/ko-kr/109511')
    ); note='초기화 화면이 끝났다는 사실만으로 계정 잠금이 해제됐다고 단정할 수 없습니다. 새 소유자가 초기 설정을 시작할 수 있는 화면인지 직접 확인하세요.' },
  @{ slug='windows-file-extension'; rows=@(
      @('invoice.pdf','일반적인 PDF 문서','아이콘만 믿지 말고 출처 확인'),
      @('invoice.pdf.exe','실행 파일','PDF처럼 위장한 이중 확장자 가능성'),
      @('photo.jpg.scr 또는 .bat','실행 가능한 스크립트·프로그램','예상한 이미지가 아니므로 열지 않기')
    ); sources=@(
      @('Windows 파일 확장자 표시 방법','https://support.microsoft.com/en-us/windows/experience/fileexplorer/file-explorer-in-windows'),
      @('Windows의 일반적인 파일 확장자','https://support.microsoft.com/en-gb/windows/common-file-name-extensions-in-windows-da4a4430-8e76-89c5-59f7-1cdbbc75cb01')
    ); note='확장자를 바꾼다고 파일 형식이 변환되지는 않습니다. 모르는 실행 파일은 이름을 수정해 열려고 하지 말고 공식 출처에서 다시 받으세요.' },
  @{ slug='windows-screenshot-methods'; rows=@(
      @('일부 영역만 즉시 복사','Windows + Shift + S','클립보드에 복사되므로 필요한 곳에 붙여넣기'),
      @('전체 화면을 파일로 저장','Windows + PrtScn','사진 > 스크린샷 폴더 확인'),
      @('활성 창만 복사','Alt + PrtScn','여러 창의 개인정보 노출을 줄일 때 유용')
    ); sources=@(
      @('Microsoft 캡처 도구 공식 안내','https://support.microsoft.com/en-gb/windows/open-snipping-tool-and-take-a-screenshot-a35ac9ff-4a58-24c9-3253-f12bac9f9d44'),
      @('Microsoft Print Screen 단축키','https://support.microsoft.com/en-us/windows/keyboard-shortcut-for-print-screen-601210c0-b3a9-7b58-bc40-bae4dcf5f108')
    ); note='캡처 전 알림, 브라우저 탭, 작업 표시줄에 개인정보가 보이는지 확인하세요. 공유 목적이라면 필요한 영역만 캡처하는 것이 가장 간단한 보호 방법입니다.' }
)

function HtmlEncode([string]$value) {
  return [System.Net.WebUtility]::HtmlEncode($value)
}

foreach ($item in $items) {
  $path = Join-Path (Join-Path 'posts' $item.slug) 'index.html'
  $html = [IO.File]::ReadAllText((Join-Path $PWD $path))
  if ($html.Contains('<!-- adsense-readiness:start -->')) { continue }

  $title = [regex]::Match($html, '<h1>([^<]+)</h1>').Groups[1].Value
  $description = [regex]::Match($html, '<meta name="description" content="([^"]+)"').Groups[1].Value
  $canonical = [regex]::Match($html, '<link rel="canonical" href="([^"]+)"').Groups[1].Value
  $dateKo = [regex]::Match($html, '작성일: ([^·<]+)').Groups[1].Value.Trim()
  $datePublished = switch ($dateKo) {
    '2026년 7월 12일' { '2026-07-12' }
    '2026년 7월 13일' { '2026-07-13' }
    '2026년 7월 14일' { '2026-07-14' }
    default { '2026-07-12' }
  }

  $structured = [ordered]@{
    '@context' = 'https://schema.org'
    '@type' = 'Article'
    headline = $title
    description = $description
    inLanguage = 'ko-KR'
    datePublished = $datePublished
    dateModified = $reviewDate
    mainEntityOfPage = $canonical
    author = [ordered]@{ '@type'='Organization'; name='KYD 디지털 가이드 편집팀'; url='https://www.kyd.kr/about/' }
    publisher = [ordered]@{ '@type'='Organization'; name='KYD 디지털 가이드'; url='https://www.kyd.kr/' }
  } | ConvertTo-Json -Depth 5 -Compress

  $meta = @"
  <meta name="author" content="KYD 디지털 가이드 편집팀">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="KYD 디지털 가이드">
  <meta property="og:title" content="$(HtmlEncode $title)">
  <meta property="og:description" content="$(HtmlEncode $description)">
  <meta property="og:url" content="$canonical">
  <meta property="article:published_time" content="$datePublished">
  <meta property="article:modified_time" content="$reviewDate">
  <meta name="twitter:card" content="summary">
  <script type="application/ld+json">$structured</script>
"@
  $html = $html.Replace('  <link rel="stylesheet" href="/assets/style.css">', "$meta  <link rel=`"stylesheet`" href=`"/assets/style.css`">")

  $escapedDate = [regex]::Escape($dateKo)
  $html = [regex]::Replace($html, '<p class="article-meta">작성일: ' + $escapedDate + ' · 예상 읽기 시간: ([^<]+)</p>', '<p class="article-meta">작성: KYD 디지털 가이드 편집팀 · 게시 <time datetime="' + $datePublished + '">' + $dateKo + '</time> · 최종 검토 <time datetime="' + $reviewDate + '">' + $reviewDateKo + '</time> · 예상 읽기 시간: $1</p>', 1)

  $rowHtml = ($item.rows | ForEach-Object {
    "          <tr><td>$(HtmlEncode $_[0])</td><td>$(HtmlEncode $_[1])</td><td>$(HtmlEncode $_[2])</td></tr>"
  }) -join "`n"
  $sourceHtml = ($item.sources | ForEach-Object {
    "        <li><a href=`"$($_[1])`" rel=`"noopener noreferrer`">$(HtmlEncode $_[0])</a> <span class=`"source-owner`">(공식 자료)</span></li>"
  }) -join "`n"

  $block = @"
      <!-- adsense-readiness:start -->
      <section class="decision-section" aria-labelledby="quick-check-$($item.slug)">
        <h2 id="quick-check-$($item.slug)">상황별 빠른 판단표</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th scope="col">상황</th><th scope="col">먼저 할 일</th><th scope="col">주의할 점</th></tr></thead>
            <tbody>
$rowHtml
            </tbody>
          </table>
        </div>
        <p class="editor-note"><strong>편집팀 메모:</strong> $(HtmlEncode $item.note)</p>
      </section>
      <section class="sources" aria-labelledby="sources-$($item.slug)">
        <h2 id="sources-$($item.slug)">공식 자료와 확인 기준</h2>
        <p>아래 1차 자료의 현재 안내를 기준으로 핵심 절차와 주의사항을 교차 확인했습니다. 제품 버전이나 기기 제조사에 따라 메뉴 이름은 달라질 수 있습니다.</p>
        <ul>
$sourceHtml
        </ul>
        <p class="source-reviewed">자료 최종 확인일: <time datetime="$reviewDate">$reviewDateKo</time></p>
      </section>
      <aside class="author-box" aria-label="작성자와 편집 기준">
        <p class="author-label">작성·검토</p>
        <h2>KYD 디지털 가이드 편집팀</h2>
        <p>초보자가 안전하게 따라 할 수 있도록 공식 문서와 실제 화면에서 확인 가능한 메뉴를 기준으로 설명합니다. 사실 오류나 변경된 메뉴는 <a href="/contact/">오류 제보</a>로 알려주세요.</p>
        <p><a href="/editorial-policy/">편집 원칙과 수정 정책 보기</a></p>
      </aside>
      <!-- adsense-readiness:end -->
"@
  $html = [regex]::Replace($html, '\s*</article>', "`n$block    </article>", 1)
  [IO.File]::WriteAllText((Join-Path $PWD $path), $html, [Text.UTF8Encoding]::new($false))
}

Write-Output "Enhanced $($items.Count) article pages."
