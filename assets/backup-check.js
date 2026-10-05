'use strict';
(function () {
  const checks = [
    ['account','백업 계정','사진을 보관한 계정과 확인 중인 계정이 같은지 확인하세요.'],
    ['upload','업로드 상태','백업 또는 동기화가 진행 중·일시중지가 아닌지 확인하세요.'],
    ['recent','최근 사진 원본','다른 기기나 웹에서 최근 사진 원본이 열리는지 확인하세요.'],
    ['video','동영상','다른 기기나 별도 사본에서 중요한 동영상의 재생과 소리를 확인하세요.'],
    ['folders','빠진 폴더','메신저·다운로드·편집 앱 등 카메라 외 폴더도 확인하세요.'],
    ['copy','독립 사본','동기화 폴더 밖에 중요한 사진을 복사하고 다시 열어보세요.']
  ];
  function review(selected) {
    const known = new Set(Array.isArray(selected) ? selected : []);
    const remaining = checks.filter(([id]) => !known.has(id));
    return {
      checked: checks.length - remaining.length,
      remaining: remaining.map(([id,label,instruction])=>({id,label,instruction})),
      message: remaining.length
        ? '자가 확인 '+(checks.length-remaining.length)+'/6. 아직 표시하지 않은 항목부터 확인하세요. 사진 삭제나 기기 초기화를 권하지 않습니다.'
        : '6개 항목에 직접 확인했다고 표시했습니다. 실제 파일을 검사한 결과나 복구 보증이 아닙니다. 원본을 유지하고 아래 서비스별 삭제 동작을 다시 확인하세요.'
    };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {review,checks};
  if (typeof document === 'undefined') return;
  const form = document.querySelector('#backup-check-form');
  if (!form) return;
  const boxes = Array.from(form.querySelectorAll('input[type="checkbox"]'));
  const button = form.querySelector('#backup-review');
  const reset = form.querySelector('#backup-reset');
  const status = document.querySelector('#backup-status');
  const list = document.querySelector('#backup-next');
  const result = document.querySelector('#backup-result');
  function render() {
    const data = review(boxes.filter(box=>box.checked).map(box=>box.value));
    status.textContent = data.message;
    list.replaceChildren();
    for (const item of data.remaining) {
      const li = document.createElement('li');
      li.textContent = item.label+': '+item.instruction;
      list.appendChild(li);
    }
    result.hidden = false;
  }
  // A changed answer immediately replaces the previous conclusion.
  for (const box of boxes) { box.disabled = false; box.addEventListener('change',render); }
  button.disabled = false; reset.disabled = false;
  button.addEventListener('click',render);
  form.addEventListener('submit',event=>{event.preventDefault();render();});
  reset.addEventListener('click',()=>{
    for (const box of boxes) box.checked = false;
    render(); boxes[0].focus();
  });
  form.setAttribute('aria-busy','false');
})();
