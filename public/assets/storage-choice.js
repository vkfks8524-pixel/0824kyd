'use strict';
// All inputs stay in memory on this page. No storage, analytics or network calls.
(function () {
  function calculate(values) {
    const bounds = [[0, 10000], [0, 1000], [1, 120], [0, 10000], [0, 10000]];
    if (!Array.isArray(values) || values.length !== bounds.length || values.some((value, i) =>
      typeof value !== 'number' || !Number.isFinite(value) || value < bounds[i][0] || value > bounds[i][1]) || !Number.isInteger(values[2])) {
      throw new RangeError('Enter valid, finite values within the displayed limits.');
    }
    const [used, growth, months, temporary, reserve] = values;
    const planned = used + growth * months + temporary + reserve;
    return { planned, higherGrowth: planned + 2 * months };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculate };
  if (typeof document === 'undefined') return;
  const form = document.getElementById('storage-choice-form');
  if (!form) return;
  const ids = ['choice-used', 'choice-growth', 'choice-months', 'choice-temporary', 'choice-reserve'];
  const result = document.getElementById('storage-choice-result');
  const error = document.getElementById('storage-choice-error');
  const fields = ids.map(id => document.getElementById(id));
  const number = value => value.toLocaleString('ko-KR', {maximumFractionDigits: 2});
  function clearResult() { result.hidden = true; error.hidden = true; }
  form.addEventListener('input', clearResult);
  form.addEventListener('reset', clearResult);
  form.addEventListener('submit', event => {
    event.preventDefault();
    clearResult();
    try {
      if (!form.checkValidity() || fields.some(field => field.value.trim() === '')) throw new RangeError();
      const values = fields.map(field => Number(field.value));
      const answer = calculate(values);
      const [used, growth, months, temporary, reserve] = values;
      document.getElementById('storage-choice-total').textContent = number(answer.planned) + 'GB';
      document.getElementById('storage-choice-equation').textContent =
        `${number(used)} + (${number(growth)} × ${months}) + ${number(temporary)} + ${number(reserve)} = ${number(answer.planned)}GB`;
      document.getElementById('storage-choice-sensitivity').textContent =
        `월 순증가량을 ${number(growth)}GB가 아닌 ${number(growth + 2)}GB로 가정하면 같은 기간의 계획 용량은 ${number(answer.higherGrowth)}GB입니다.`;
      document.getElementById('storage-choice-interpretation').textContent = answer.planned >= 512
        ? '계획값이 512GB의 표기 용량 이상입니다. 더 큰 용량이나 보관 방식 변경을 비교하세요. 이 계산이 특정 모델의 구입을 권장하는 것은 아닙니다.'
        : answer.planned >= 256
          ? '계획값이 256GB의 표기 용량 이상입니다. 256GB에 모두 보관하기 어렵다는 신호입니다. 512GB 등 더 큰 용량의 실제 가용 공간과 보관 방식을 비교하세요.'
          : '계획값이 256GB의 표기 용량보다 작습니다. 그러나 실제 가용 공간은 더 작으므로 256GB로 충분하다는 보장은 아닙니다. 시스템 변화와 촬영 패턴을 함께 확인하세요.';
      result.hidden = false;
      result.focus();
    } catch (_) {
      error.hidden = false;
      error.focus();
    }
  });
  document.getElementById('storage-choice-example').addEventListener('click', () => {
    [90, 1, 24, 20, 30].forEach((value, i) => { fields[i].value = value; });
    form.requestSubmit();
  });
  // Keep the form's space reserved before JavaScript is ready.
  form.querySelectorAll('input, button').forEach(control => { control.disabled = false; });
  form.setAttribute('aria-busy', 'false');
})();
