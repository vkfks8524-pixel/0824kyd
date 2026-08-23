(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);

  function setText(selector, value, root = document) {
    const element = $(selector, root);
    if (element) element.textContent = value;
  }

  function showResult(element) {
    element.hidden = false;
    element.focus({ preventScroll: true });
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function makeFinding(tone, title, detail) {
    const item = document.createElement('li');
    item.className = `finding finding-${tone}`;
    const heading = document.createElement('strong');
    heading.textContent = title;
    const description = document.createElement('span');
    description.textContent = detail;
    item.append(heading, description);
    return item;
  }

  function initializeUrlTool() {
    const form = $('#url-tool-form');
    if (!form) return;

    const input = $('#url-input');
    const result = $('#url-result');
    const facts = $('#url-facts');
    const findings = $('#url-findings');
    const shorteners = new Set([
      'bit.ly', 't.co', 'tinyurl.com', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly',
      'cutt.ly', 'vo.la', 'han.gl', 'me2.do', 'lrl.kr', 'url.kr'
    ]);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let raw = input.value.trim();
      result.hidden = true;
      facts.replaceChildren();
      findings.replaceChildren();

      if (!raw) {
        input.setCustomValidity('확인할 주소를 입력해 주세요.');
        input.reportValidity();
        return;
      }
      input.setCustomValidity('');

      const suppliedScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw);
      const normalized = suppliedScheme ? raw : `https://${raw}`;
      let parsed;
      try {
        parsed = new URL(normalized);
      } catch {
        setText('#url-result-title', '주소 형식을 해석하지 못했습니다.');
        findings.append(makeFinding('danger', '형식 확인 필요', '공백이나 잘못된 기호가 섞였는지 확인하고 주소 전체를 다시 입력하세요.'));
        showResult(result);
        return;
      }

      const factValues = [
        ['프로토콜', parsed.protocol.replace(':', '') || '없음'],
        ['호스트 이름', parsed.hostname || '없음'],
        ['포트', parsed.port || '기본 포트'],
        ['경로', parsed.pathname || '/'],
        ['검색 조건', parsed.search ? `${new URLSearchParams(parsed.search).size}개` : '없음']
      ];
      factValues.forEach(([label, value]) => {
        const row = document.createElement('div');
        const term = document.createElement('dt');
        const data = document.createElement('dd');
        term.textContent = label;
        data.textContent = value;
        row.append(term, data);
        facts.append(row);
      });

      let cautionCount = 0;
      const add = (tone, title, detail) => {
        findings.append(makeFinding(tone, title, detail));
        if (tone !== 'ok') cautionCount += 1;
      };

      if (!suppliedScheme) add('note', '프로토콜이 생략됨', '분석을 위해 https://를 임시로 붙였습니다. 실제 링크의 프로토콜을 다시 확인하세요.');
      if (parsed.protocol === 'https:') add('ok', 'HTTPS 형식', '전송 구간 암호화 형식입니다. HTTPS만으로 사이트 운영자를 신뢰할 수 있다는 뜻은 아닙니다.');
      else add('danger', 'HTTPS가 아님', '로그인·결제·개인정보 입력을 중단하고 공식 주소를 직접 찾아가세요.');

      if (parsed.username || parsed.password || raw.includes('@')) add('danger', '@ 앞의 사용자 정보', '주소 안의 @는 실제 접속 호스트를 혼동하게 만들 수 있습니다. @ 뒤의 호스트 이름을 기준으로 확인하세요.');
      if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname) || /^\[[0-9a-f:]+\]$/i.test(parsed.hostname)) add('danger', '숫자 IP 주소 사용', '일반 서비스 이름 대신 IP 주소가 보입니다. 공식 안내에서 확인된 주소가 아니라면 정보를 입력하지 마세요.');
      if (parsed.hostname.includes('xn--')) add('danger', '퓨니코드 호스트', '다른 문자 체계를 도메인으로 표현한 주소입니다. 유명 사이트와 비슷하게 보이도록 악용될 수 있어 실제 운영자를 따로 확인해야 합니다.');
      if (shorteners.has(parsed.hostname.replace(/^www\./, ''))) add('note', '단축 URL', '최종 목적지가 가려져 있습니다. 발신자에게 확인하거나 브라우저 경고와 최종 주소를 다시 점검하세요.');
      if (parsed.port && !['80', '443'].includes(parsed.port)) add('note', '비표준 포트', `:${parsed.port} 포트를 사용합니다. 업무·개발용 주소가 아니라면 서비스 운영자에게 확인하세요.`);
      if (parsed.hostname.split('.').length >= 5) add('note', '하위 도메인이 많음', '주소가 길어 실제 등록 도메인을 놓치기 쉽습니다. 호스트 이름을 오른쪽부터 천천히 읽어보세요.');
      if (/%[0-9a-f]{2}/i.test(raw)) add('note', '인코딩된 문자 포함', '주소 일부가 % 기호로 표현되어 있습니다. 인코딩 자체가 위험 신호는 아니지만 눈으로 확인하기 어렵습니다.');
      if (!parsed.pathname || parsed.pathname === '/') add('ok', '단순한 경로', '추가 경로가 없거나 루트 경로입니다. 호스트 이름과 발신 경로를 중심으로 확인하세요.');

      setText('#url-result-title', cautionCount ? `추가 확인 항목 ${cautionCount}개가 있습니다.` : '구조상 뚜렷한 주의 신호는 적습니다.');
      setText('#url-result-summary', '이 결과는 주소의 모양만 분석하며 악성 여부, 소유자, 현재 콘텐츠를 조회하지 않습니다. 브라우저 경고와 공식 사이트의 안내를 함께 확인하세요.');
      showResult(result);
    });
  }

  function initializeFileTool() {
    const form = $('#file-tool-form');
    if (!form) return;

    const input = $('#file-name-input');
    const result = $('#file-result');
    const findings = $('#file-findings');
    const executable = new Set(['exe', 'msi', 'bat', 'cmd', 'com', 'scr', 'ps1', 'vbs', 'vbe', 'js', 'jse', 'wsf', 'jar', 'apk', 'appx', 'reg']);
    const shortcuts = new Set(['lnk', 'url', 'scf', 'website']);
    const macro = new Set(['docm', 'dotm', 'xlsm', 'xltm', 'xlam', 'pptm', 'potm', 'ppsm', 'sldm']);
    const archives = new Set(['zip', 'rar', '7z', 'tar', 'gz', 'iso', 'img']);
    const documents = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'hwp', 'hwpx', 'txt', 'rtf']);
    const media = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'mp3', 'wav', 'mp4', 'mov', 'avi']);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const raw = input.value.trim();
      result.hidden = true;
      findings.replaceChildren();
      if (!raw) {
        input.setCustomValidity('확인할 파일 이름을 입력해 주세요.');
        input.reportValidity();
        return;
      }
      input.setCustomValidity('');

      const baseName = raw.split(/[\\/]/).pop();
      const hasRlo = /[\u202a-\u202e\u2066-\u2069]/.test(baseName);
      const cleanName = baseName.replace(/[\u202a-\u202e\u2066-\u2069]/g, '');
      const parts = cleanName.split('.').filter(Boolean);
      const extension = parts.length > 1 || (!cleanName.startsWith('.') && parts.length === 1 && cleanName.includes('.')) ? parts.at(-1).toLowerCase() : '';
      const priorExtension = parts.length >= 3 ? parts.at(-2).toLowerCase() : '';
      let cautionCount = 0;
      const add = (tone, title, detail) => {
        findings.append(makeFinding(tone, title, detail));
        if (tone !== 'ok') cautionCount += 1;
      };

      setText('#file-base-name', baseName);
      setText('#file-extension', extension ? `.${extension}` : '확장자 없음');

      if (hasRlo) add('danger', '문자 표시 방향 제어 기호', '파일 끝부분을 다른 확장자처럼 보이게 만드는 제어 문자가 포함되어 있습니다. 열지 말고 출처를 확인하세요.');
      if (!extension) add('note', '확장자를 확인할 수 없음', 'Windows에서 파일 확장자 표시를 켠 뒤 전체 파일 이름을 다시 확인하세요.');
      else if (executable.has(extension)) add('danger', '실행·설치 가능 형식', `.${extension} 파일은 프로그램이나 명령을 실행할 수 있습니다. 공식 배포처와 디지털 서명을 확인하기 전에는 열지 마세요.`);
      else if (shortcuts.has(extension)) add('danger', '바로가기 형식', `.${extension} 파일은 다른 프로그램, 명령 또는 웹주소를 열 수 있습니다. 문서처럼 보여도 실제 대상을 확인해야 합니다.`);
      else if (macro.has(extension)) add('danger', '매크로 사용 문서', `.${extension} 파일은 자동화 코드를 포함할 수 있습니다. 예상한 발신자와 업무 파일이 아니라면 매크로를 허용하지 마세요.`);
      else if (archives.has(extension)) add('note', '압축·디스크 이미지 형식', '내부 파일이 가려져 있으므로 압축을 푼 뒤 각 파일의 최종 확장자를 다시 확인하세요. 비밀번호가 적힌 수상한 첨부파일은 특히 주의하세요.');
      else if (documents.has(extension)) add('note', '문서 형식', '문서 확장자만으로 안전을 보장할 수 없습니다. 브라우저·Office의 보안 경고를 우회하지 마세요.');
      else if (media.has(extension)) add('ok', '일반적인 미디어 형식', '사진·음성·영상에 흔한 확장자입니다. 이름을 바꾸는 것만으로 실제 파일 형식이 바뀌지는 않으므로 출처도 확인하세요.');
      else add('note', '분류표에 없는 확장자', `.${extension} 형식의 용도와 연결 프로그램을 공식 문서에서 확인한 뒤 여세요.`);

      if (priorExtension && (documents.has(priorExtension) || media.has(priorExtension)) && (executable.has(extension) || shortcuts.has(extension))) {
        add('danger', '이중 확장자 위장 가능성', `중간의 .${priorExtension} 때문에 문서나 미디어처럼 보이지만 실제 최종 확장자는 .${extension}입니다.`);
      } else if (parts.length >= 3) {
        add('note', '점이 여러 개인 파일명', '점이 여러 개 있어도 실제 동작은 마지막 확장자를 기준으로 결정되는 경우가 많습니다. 마지막 부분을 우선 확인하세요.');
      }

      setText('#file-result-title', cautionCount ? `주의·확인 항목 ${cautionCount}개가 있습니다.` : '이름에서 즉시 드러나는 강한 경고는 적습니다.');
      setText('#file-result-summary', '파일 이름만 분석한 결과입니다. 파일 내용, 디지털 서명, 악성코드 여부는 검사하지 않으므로 실제 파일을 열기 전 운영체제 보안 경고와 출처를 확인하세요.');
      showResult(result);
    });
  }

  function initializeStorageTool() {
    const form = $('#storage-tool-form');
    if (!form) return;
    const result = $('#storage-result');
    const findings = $('#storage-findings');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const total = Number($('#storage-total').value);
      const free = Number($('#storage-free').value);
      const targetPercent = Number($('#storage-target').value);
      result.hidden = true;
      findings.replaceChildren();

      if (!Number.isFinite(total) || !Number.isFinite(free) || total <= 0 || free < 0 || free > total) {
        setText('#storage-error', '전체 용량은 0보다 커야 하며, 남은 용량은 전체 용량보다 클 수 없습니다.');
        $('#storage-error').hidden = false;
        return;
      }
      $('#storage-error').hidden = true;

      const used = total - free;
      const currentPercent = (free / total) * 100;
      const targetFree = total * (targetPercent / 100);
      const cleanup = Math.max(0, targetFree - free);

      setText('#storage-used-value', `${used.toFixed(1)} GB`);
      setText('#storage-free-value', `${free.toFixed(1)} GB (${currentPercent.toFixed(1)}%)`);
      setText('#storage-target-value', `${targetFree.toFixed(1)} GB (${targetPercent}%)`);
      setText('#storage-cleanup-value', cleanup > 0 ? `${cleanup.toFixed(1)} GB` : '추가 정리 불필요');
      $('#storage-meter-fill').style.width = `${Math.min(100, Math.max(0, currentPercent))}%`;
      $('#storage-meter-fill').setAttribute('aria-valuenow', currentPercent.toFixed(1));

      if (cleanup <= 0) {
        findings.append(makeFinding('ok', '목표 여유 공간 확보', '현재 남은 용량이 선택한 목표보다 많습니다. 큰 파일을 무리하게 지우기보다 백업 상태와 불필요한 다운로드만 정기적으로 확인하세요.'));
      } else {
        findings.append(makeFinding('note', '정리 목표', `${cleanup.toFixed(1)} GB를 확보하면 남은 공간이 약 ${targetPercent}%가 됩니다. 한 번에 삭제하지 말고 아래 순서로 확인하세요.`));
        if (cleanup < 2) findings.append(makeFinding('ok', '작은 정리로 가능', '다운로드 폴더, 휴지통, 오프라인 저장 파일과 앱 캐시만 확인해도 목표에 도달할 가능성이 큽니다.'));
        else if (cleanup < 10) findings.append(makeFinding('note', '중간 규모 정리', '큰 동영상, 메신저 미디어, 사용하지 않는 앱을 용량순으로 확인하세요. 사진은 백업 완료 표시를 확인한 뒤 정리합니다.'));
        else findings.append(makeFinding('danger', '대용량 정리 필요', '사진·동영상을 바로 대량 삭제하지 말고 외부 저장장치나 클라우드 백업을 먼저 검증하세요. 여러 단계로 나눠 정리하는 편이 안전합니다.'));
      }
      findings.append(makeFinding('note', '저장용량과 메모리는 다름', '이 계산은 파일을 보관하는 저장용량 기준입니다. 앱 실행에 쓰는 메모리(RAM) 부족 문제와는 다릅니다.'));
      setText('#storage-result-title', cleanup > 0 ? `${cleanup.toFixed(1)} GB 정리를 목표로 하세요.` : '현재 선택한 여유 공간 목표를 충족합니다.');
      showResult(result);
    });
  }

  function initializeAccountTool() {
    const form = $('#account-tool-form');
    if (!form) return;
    const result = $('#account-result');
    const missing = $('#account-missing');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const items = [...form.querySelectorAll('input[type="checkbox"][data-weight]')];
      const score = items.reduce((sum, item) => sum + (item.checked ? Number(item.dataset.weight) : 0), 0);
      const unchecked = items.filter((item) => !item.checked);
      missing.replaceChildren();

      unchecked.forEach((item) => {
        const label = form.querySelector(`label[for="${item.id}"]`);
        const li = document.createElement('li');
        li.textContent = label ? label.dataset.action : '선택하지 않은 보안 항목을 확인하세요.';
        missing.append(li);
      });

      let band;
      let summary;
      if (score >= 85) {
        band = '기본 대비가 잘 되어 있습니다.';
        summary = '점수가 높아도 계정이 안전하다고 보장되지는 않습니다. 최근 로그인 기록과 복구 수단을 정기적으로 다시 확인하세요.';
      } else if (score >= 60) {
        band = '중요한 보강 항목이 남아 있습니다.';
        summary = '아래 미완료 항목 중 비밀번호·2단계 인증·복구 수단을 먼저 보완하세요.';
      } else {
        band = '우선순위가 높은 보안 항목부터 설정하세요.';
        summary = '한 번에 모두 바꾸기보다 중요한 이메일 계정부터 고유 비밀번호, 2단계 인증, 복구 수단 순서로 진행하세요.';
      }

      setText('#account-score', `${score} / 100`);
      setText('#account-result-title', band);
      setText('#account-result-summary', summary);
      $('#account-score-fill').style.width = `${score}%`;
      $('#account-score-fill').setAttribute('aria-valuenow', String(score));
      $('#account-complete').hidden = unchecked.length !== 0;
      $('#account-missing-wrap').hidden = unchecked.length === 0;
      showResult(result);
    });

    form.addEventListener('reset', () => {
      result.hidden = true;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initializeUrlTool();
    initializeFileTool();
    initializeStorageTool();
    initializeAccountTool();
  });
})();
