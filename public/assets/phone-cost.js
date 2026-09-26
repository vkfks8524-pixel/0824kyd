/* Calculation model: full device principal plus period service costs, not cash-flow timing. */
(function (root) {
  'use strict';
  const amountFields = ['device', 'initialRate', 'laterRate', 'extras', 'fees', 'resale'];
  const fieldLabels = {device:'기기 원금',initialRate:'초기 월 통신료',laterRate:'이후 월 통신료',extras:'월 부가요금',fees:'일회 비용',resale:'판매 예상액'};
  function integer(value, label, max) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > max) {
      throw new RangeError(label + '은 0~' + max.toLocaleString('ko-KR') + ' 사이의 정수로 입력하세요.');
    }
    return value;
  }
  function calculate(plan, months) {
    integer(months, '비교 기간', 60);
    if (months < 1) throw new RangeError('비교 기간은 1~60개월이어야 합니다.');
    for (const key of amountFields) integer(plan[key], fieldLabels[key], 100000000);
    integer(plan.initialMonths, '초기 기간', months);
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
    const won = n => Math.round(n).toLocaleString('ko-KR') + '원';
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
        throw new RangeError(document.querySelector('label[for="' + id + '"]').textContent + ': 숫자를 빈칸 없이, 쉼표 없는 정수로 입력하세요.');
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
          ['기기 원금 전체','device'],['기간 내 통신료 합계','telecom'],['기간 내 부가요금 합계','addons'],
          ['일회 비용·이자 합계','fees'],['판매액 차감 전 총액','gross'],['기존 폰 판매 예상액 (차감)','resale'],
          ['판매액 차감 후 순비용','net'],['월평균 순비용 (실제 청구액 아님)','average']
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
        document.getElementById('phone-cost-period').textContent = months + '개월 서비스 비용 + 기기 원금 전체';
        const delta = comparison.difference;
        document.getElementById('phone-cost-summary').textContent = delta === 0
          ? '입력한 조건의 순비용이 같습니다.'
          : (delta > 0 ? 'A' : 'B') + '의 순비용이 ' + won(Math.abs(delta)) + ' 낮습니다.';
        document.getElementById('phone-cost-warning').textContent =
          comparison.a.net < 0 || comparison.b.net < 0
          ? '판매 예상액이 구매·이용 비용보다 큽니다. 수익이 보장되는 것이 아니므로 금액과 중복 차감을 다시 확인하세요.'
          : '판매 예상액은 확정 수입이 아닙니다. 데이터·속도·결합 혜택과 중도 변경 조건은 별도로 확인하세요.';
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
