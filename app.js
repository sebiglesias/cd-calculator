// CD Calculator — Certificate of Deposit & APY Compound Interest
(function() {
  'use strict';

  let state = {
    deposit: 10000,
    apy: 5.10, // %
    termMonths: 12,
    compoundFreq: 365 // Daily compounding (US banking standard)
  };

  const BENCHMARKS = [
    { label: '3 Months', months: 3 },
    { label: '6 Months', months: 6 },
    { label: '12 Months (1 Yr)', months: 12 },
    { label: '18 Months', months: 18 },
    { label: '2 Years', months: 24 },
    { label: '3 Years', months: 36 },
    { label: '5 Years', months: 60 }
  ];

  function formatMoney(val) {
    return '$' + Math.round(val).toLocaleString('en-US');
  }

  function formatDecimal(val) {
    return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function calculateMaturity(P, apyPct, months, n) {
    const t = months / 12;
    const apy = apyPct / 100;
    // Derive nominal rate r from APY
    const r = n * (Math.pow(1 + apy, 1 / n) - 1);
    const A = P * Math.pow(1 + (r / n), n * t);
    const interest = A - P;
    return { balance: A, interest };
  }

  function recalculate() {
    const P = state.deposit;
    const apy = state.apy;
    const months = state.termMonths;
    const n = state.compoundFreq;

    const res = calculateMaturity(P, apy, months, n);

    // Hero Updates
    document.getElementById('hero-interest').textContent = formatDecimal(res.interest);
    document.getElementById('hero-balance').textContent = `Maturity Total: ${formatDecimal(res.balance)}`;
    document.getElementById('res-deposit').textContent = formatMoney(P);
    document.getElementById('res-apy').textContent = `${apy.toFixed(2)}% APY`;
    document.getElementById('res-term').textContent = `${months} Months`;

    // Benchmark terms table
    const tbody = document.getElementById('benchmark-tbody');
    tbody.innerHTML = '';

    BENCHMARKS.forEach(b => {
      const bRes = calculateMaturity(P, apy, b.months, n);
      const tr = document.createElement('tr');
      if (b.months === months) {
        tr.classList.add('highlighted');
      }
      tr.innerHTML = `
        <td><strong>${b.label}</strong></td>
        <td>${apy.toFixed(2)}%</td>
        <td>${formatDecimal(bRes.interest)}</td>
        <td>${formatDecimal(bRes.balance)}</td>
      `;
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', () => {
        setTerm(b.months);
      });
      tbody.appendChild(tr);
    });

    localStorage.setItem('cd_calc_state', JSON.stringify(state));
  }

  function setTerm(months) {
    state.termMonths = months;
    document.getElementById('input-term-custom').value = months;
    document.querySelectorAll('.term-chip').forEach(chip => {
      chip.classList.toggle('active', parseInt(chip.dataset.months, 10) === months);
    });
    recalculate();
  }

  function init() {
    const saved = localStorage.getItem('cd_calc_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
      } catch (e) {}
    }

    const inputDeposit = document.getElementById('input-deposit');
    const inputApy = document.getElementById('input-apy');
    const inputTerm = document.getElementById('input-term-custom');
    const selectCompound = document.getElementById('select-compound');

    inputDeposit.value = state.deposit;
    inputApy.value = state.apy;
    inputTerm.value = state.termMonths;
    selectCompound.value = state.compoundFreq;

    inputDeposit.addEventListener('input', (e) => {
      state.deposit = Math.max(100, parseFloat(e.target.value) || 0);
      recalculate();
    });

    inputApy.addEventListener('input', (e) => {
      state.apy = Math.max(0.1, Math.min(25, parseFloat(e.target.value) || 0));
      recalculate();
    });

    inputTerm.addEventListener('input', (e) => {
      const m = Math.max(1, Math.min(120, parseInt(e.target.value, 10) || 12));
      state.termMonths = m;
      document.querySelectorAll('.term-chip').forEach(chip => {
        chip.classList.toggle('active', parseInt(chip.dataset.months, 10) === m);
      });
      recalculate();
    });

    selectCompound.addEventListener('change', (e) => {
      state.compoundFreq = parseInt(e.target.value, 10);
      recalculate();
    });

    // Chips
    document.querySelectorAll('.term-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        setTerm(parseInt(chip.dataset.months, 10));
      });
      if (parseInt(chip.dataset.months, 10) === state.termMonths) {
        chip.classList.add('active');
      }
    });

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        item.classList.toggle('open');
      });
    });

    recalculate();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
