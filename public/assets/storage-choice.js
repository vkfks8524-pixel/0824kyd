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
  const number = value => value.toLocaleString('en', {maximumFractionDigits: 2});
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
        `At ${number(growth + 2)}GB monthly growth instead of ${number(growth)}GB, the same-period plan becomes ${number(answer.higherGrowth)}GB.`;
      document.getElementById('storage-choice-interpretation').textContent = answer.planned >= 512
        ? 'The plan meets or exceeds the 512GB label. Compare greater usable capacity or a different storage approach; this is not a model recommendation.'
        : answer.planned >= 256
          ? 'The plan meets or exceeds the 256GB label. Compare the usable space of larger options and another storage approach.'
          : 'The plan is below the 256GB label, but usable space is smaller. This does not guarantee sufficiency; review system changes and capture patterns.';
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
