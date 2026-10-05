'use strict';
(function () {
  const checks = [
    ['account','Backup account','Check that the storage account matches the account you are viewing.'],
    ['upload','Upload state','Check whether backup or sync is pending or paused.'],
    ['recent','Recent photo originals','Open recent originals on another device or through the service’s web interface.'],
    ['video','Video','Inspect important video playback and sound on another device or independent copy.'],
    ['folders','Additional folders','Inspect messenger, download and editing folders as well as the camera folder.'],
    ['copy','Independent copy','Copy important photos outside the synchronized library and reopen them.']
  ];
  function review(selected) {
    const known = new Set(Array.isArray(selected) ? selected : []);
    const remaining = checks.filter(([id]) => !known.has(id));
    return {
      checked: checks.length - remaining.length,
      remaining: remaining.map(([id,label,instruction])=>({id,label,instruction})),
      message: remaining.length
        ? 'Self-check '+(checks.length-remaining.length)+'/6. Review unmarked items first. This does not recommend deleting photos or resetting a device.'
        : 'You marked all six items as personally checked. This is not file inspection or a recovery guarantee. Keep originals and review service-specific deletion behavior below.'
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
