/* Calculation model: full device principal plus period service costs, not cash-flow timing. */
(function (root) {
  'use strict';
  const amountFields = ['device', 'initialRate', 'laterRate', 'extras', 'fees', 'resale'];
  const fieldLabels = {device:'Device principal',initialRate:'Initial monthly service',laterRate:'Later monthly service',extras:'Monthly extras',fees:'One-off costs',resale:'Estimated resale'};
  function integer(value, label, max) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > max) {
      throw new RangeError(label + ' must be a whole number from 0 to ' + max.toLocaleString('en') + '.');
    }
    return value;
  }
  function calculate(plan, months) {
    integer(months, 'Comparison period', 60);
    if (months < 1) throw new RangeError('Comparison period must be 1–60 months.');
    for (const key of amountFields) integer(plan[key], fieldLabels[key], 100000000);
    integer(plan.initialMonths, 'Initial period', months);
    const telecom = plan.initialRate * plan.initialMonths + plan.laterRate * (months - plan.initialMonths);
    const addons = plan.extras * months;
    const gross = plan.device + telecom + addons + plan.fees;
    return {device:plan.device, telecom, addons, fees:plan.fees, gross, resale:plan.resale,
      net:gross-plan.resale, average:(gross-plan.resale)/months};
  }
  function compare(a, b, months) {
    const first = calculate(a, months), second = calculate(b, months);
    return {a:first, b:second, difference:second.net-first.net};
  }
  const api = {calculate, compare};
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (!root || !root.document) return;
  root.KYDPhoneCost = api;
  root.document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('phone-cost-form');
    if (!form) return;
    const result = document.getElementById('phone-cost-result');
    const error = document.getElementById('phone-cost-error');
    const won = n => Math.round(n).toLocaleString('en') + ' units';
    const keys = ['device','initialRate','initialMonths','laterRate','extras','fees','resale'];
    const example = {
      months:24,
      a:{device:1990000,initialRate:25000,initialMonths:6,laterRate:25000,extras:0,fees:0,resale:400000},
      b:{device:1590000,initialRate:90000,initialMonths:6,laterRate:55000,extras:5000,fees:100000,resale:400000}
    };
    function inputNumber(id) {
      const input = document.getElementById(id);
      const raw = input.value.trim();
      if (!/^\d+$/.test(raw)) {
        input.focus();
        throw new RangeError(document.querySelector('label[for="' + id + '"]').textContent + ': enter a nonempty whole number without commas.');
      }
      return Number(raw);
    }
    function readPlan(prefix) {
      return Object.fromEntries(keys.map(key => [key,inputNumber(prefix+'-'+key)]));
    }
    function clearResult() { result.hidden = true; error.hidden = true; }
    form.addEventListener('input', clearResult);
    form.addEventListener('change', clearResult);
    form.addEventListener('reset', clearResult);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearResult();
      try {
        const months = inputNumber('cost-months');
        const comparison = compare(readPlan('a'),readPlan('b'),months);
        const rows = [
          ['Full device principal','device'],['Service total for the period','telecom'],['Extras total for the period','addons'],
          ['One-off costs and interest','fees'],['Total before resale','gross'],['Estimated old-phone resale (deducted)','resale'],
          ['Net cost after estimated resale','net'],['Average monthly net (not the actual bill)','average']
        ];
        const tbody = document.getElementById('phone-cost-breakdown');
        tbody.replaceChildren();
        for (const [label,key] of rows) {
          const tr = document.createElement('tr');
          const th = document.createElement('th'); th.scope='row'; th.textContent=label; tr.append(th);
          for (const plan of [comparison.a,comparison.b]) {
            const td = document.createElement('td'); td.textContent=won(plan[key]); tr.append(td);
          }
          tbody.append(tr);
        }
        document.getElementById('phone-cost-period').textContent = months + ' months of service + full device principal';
        const delta = comparison.difference;
        document.getElementById('phone-cost-summary').textContent = delta === 0
          ? 'The entered assumptions have equal net costs.'
          : (delta > 0 ? 'A' : 'B') + ' has a lower net cost by ' + won(Math.abs(delta)) + '.';
        document.getElementById('phone-cost-warning').textContent =
          comparison.a.net < 0 || comparison.b.net < 0
          ? 'Estimated resale exceeds purchase and service costs. This is not guaranteed profit; check the amounts and duplicated deductions.'
          : 'Estimated resale is not confirmed income. Review data, speeds, bundles and early-change conditions separately.';
        result.hidden = false;
        result.focus({preventScroll:true});
      } catch (e) {
        error.textContent=e.message;
        error.hidden=false;
      }
    });
    document.getElementById('phone-cost-example').addEventListener('click', function () {
      document.getElementById('cost-months').value=example.months;
      for (const prefix of ['a','b']) for (const key of keys) document.getElementById(prefix+'-'+key).value=example[prefix][key];
      form.requestSubmit();
    });
  });
})(typeof window === 'undefined' ? null : window);
