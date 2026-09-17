(() => {
  const expressionEl = document.getElementById("expression");
  const resultEl = document.getElementById("result");
  const operatorButtons = document.querySelectorAll("[data-operator]");

  const state = {
    current: "0",
    previous: null,
    operator: null,
    overwrite: false,
    error: false,
  };

  const MAX_DIGITS = 14;

  function formatDisplay(value) {
    const text = String(value);

    if (text === "Error" || text === "Infinity" || text === "-Infinity") {
      return "Error";
    }

    // Keep scientific notation compact; commas would break it
    if (/e/i.test(text)) {
      return text;
    }

    const [rawInt, rawDec] = text.split(".");
    const sign = rawInt.startsWith("-") ? "-" : "";
    const digits = rawInt.replace("-", "");
    const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return rawDec !== undefined ? `${sign}${withCommas}.${rawDec}` : `${sign}${withCommas}`;
  }

  function truncateForDisplay(num) {
    if (!Number.isFinite(num)) return "Error";

    const abs = Math.abs(num);
    if (abs !== 0 && (abs >= 1e14 || abs < 1e-8)) {
      return num.toExponential(6);
    }

    let str = String(Number(num.toPrecision(12)));
    if (/e/i.test(str)) {
      return num.toExponential(6);
    }

    const maxLen = MAX_DIGITS + (str.startsWith("-") ? 1 : 0);
    if (str.length > maxLen) {
      const intLen = String(Math.trunc(Math.abs(num))).length;
      const decimals = Math.max(0, MAX_DIGITS - intLen - 1);
      str = String(parseFloat(num.toFixed(decimals)));
    }

    return str;
  }

  function updateDisplay() {
    if (state.error) {
      expressionEl.textContent = "";
      resultEl.textContent = "Error";
      resultEl.classList.add("is-error");
      return;
    }

    resultEl.classList.remove("is-error");

    if (state.previous !== null && state.operator) {
      const right = state.overwrite ? "" : formatDisplay(state.current);
      expressionEl.textContent = `${formatDisplay(state.previous)} ${state.operator}${
        right ? ` ${right}` : ""
      }`;
    } else {
      expressionEl.textContent = "";
    }

    resultEl.textContent = formatDisplay(state.current);
  }

  function setActiveOperator(op) {
    operatorButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.operator === op);
    });
  }

  function clearCalculator() {
    state.current = "0";
    state.previous = null;
    state.operator = null;
    state.overwrite = false;
    state.error = false;
    setActiveOperator(null);
    updateDisplay();
  }

  function deleteLast() {
    if (state.error) {
      clearCalculator();
      return;
    }

    if (state.overwrite) {
      state.current = "0";
      state.overwrite = false;
      updateDisplay();
      return;
    }

    if (state.current.length <= 1 || (state.current.length === 2 && state.current.startsWith("-"))) {
      state.current = "0";
    } else {
      state.current = state.current.slice(0, -1);
      if (state.current === "-" || state.current === "-0") {
        state.current = "0";
      }
    }

    updateDisplay();
  }

  function inputNumber(digit) {
    if (state.error) clearCalculator();

    if (state.overwrite) {
      state.current = digit;
      state.overwrite = false;
      updateDisplay();
      return;
    }

    if (digit === "." && state.current.includes(".")) return;

    if (state.current === "0" && digit !== ".") {
      state.current = digit;
    } else if (state.current === "-0" && digit !== ".") {
      state.current = `-${digit}`;
    } else {
      const digitCount = state.current.replace(/[-.]/g, "").length;
      if (digitCount >= MAX_DIGITS) return;
      state.current += digit;
    }

    updateDisplay();
  }

  function operate(a, b, operator) {
    switch (operator) {
      case "+":
        return a + b;
      case "−":
        return a - b;
      case "×":
        return a * b;
      case "÷":
        if (b === 0) return null;
        return a / b;
      default:
        return b;
    }
  }

  function calculate() {
    if (state.error) return;
    if (state.operator === null || state.previous === null) return;

    const left = parseFloat(state.previous);
    const right = parseFloat(state.current);
    const raw = operate(left, right, state.operator);

    if (raw === null || !Number.isFinite(raw)) {
      state.error = true;
      state.current = "Error";
      state.previous = null;
      state.operator = null;
      state.overwrite = true;
      setActiveOperator(null);
      updateDisplay();
      return;
    }

    state.current = truncateForDisplay(raw);
    state.previous = null;
    state.operator = null;
    state.overwrite = true;
    setActiveOperator(null);
    updateDisplay();
  }

  function chooseOperator(nextOp) {
    if (state.error) clearCalculator();

    // Allow starting a negative number after an operator or from a fresh zero
    if (nextOp === "−" && (state.overwrite || state.current === "0") && state.previous === null) {
      state.current = "-0";
      state.overwrite = false;
      updateDisplay();
      return;
    }

    if (state.operator && !state.overwrite) {
      calculate();
      if (state.error) return;
    }

    state.previous = state.current;
    state.operator = nextOp;
    state.overwrite = true;
    setActiveOperator(nextOp);
    updateDisplay();
  }

  function applyPercent() {
    if (state.error) return;

    const value = parseFloat(state.current);
    if (!Number.isFinite(value)) return;

    let result;

    if (state.previous !== null && state.operator) {
      const base = parseFloat(state.previous);
      // 200 + 10% → 200 + 20; 200 × 10% → 200 × 0.1
      if (state.operator === "+" || state.operator === "−") {
        result = (base * value) / 100;
      } else {
        result = value / 100;
      }
    } else {
      result = value / 100;
    }

    state.current = truncateForDisplay(result);
    state.overwrite = true;
    updateDisplay();
  }

  function flashKey(selector) {
    const btn = document.querySelector(selector);
    if (!btn) return;
    btn.classList.add("is-pressed");
    setTimeout(() => btn.classList.remove("is-pressed"), 100);
  }

  function handleKeyboard(event) {
    const { key } = event;

    if (/^[0-9.]$/.test(key)) {
      event.preventDefault();
      inputNumber(key);
      flashKey(key === "." ? '[data-number="."]' : `[data-number="${key}"]`);
      return;
    }

    const opMap = {
      "+": "+",
      "-": "−",
      "*": "×",
      "/": "÷",
      x: "×",
      X: "×",
    };

    if (key in opMap) {
      event.preventDefault();
      chooseOperator(opMap[key]);
      flashKey(`[data-operator="${opMap[key]}"]`);
      return;
    }

    if (key === "Enter" || key === "=") {
      event.preventDefault();
      calculate();
      flashKey('[data-action="equals"]');
      return;
    }

    if (key === "Backspace") {
      event.preventDefault();
      deleteLast();
      flashKey('[data-action="delete"]');
      return;
    }

    if (key === "Escape" || key === "Delete") {
      event.preventDefault();
      clearCalculator();
      flashKey('[data-action="clear"]');
      return;
    }

    if (key === "%") {
      event.preventDefault();
      applyPercent();
      flashKey('[data-action="percent"]');
    }
  }

  document.querySelector(".keypad").addEventListener("click", (event) => {
    const btn = event.target.closest("button.key");
    if (!btn) return;

    if (btn.dataset.number !== undefined) {
      inputNumber(btn.dataset.number);
      return;
    }

    if (btn.dataset.operator) {
      chooseOperator(btn.dataset.operator);
      return;
    }

    switch (btn.dataset.action) {
      case "clear":
        clearCalculator();
        break;
      case "delete":
        deleteLast();
        break;
      case "percent":
        applyPercent();
        break;
      case "equals":
        calculate();
        break;
      default:
        break;
    }
  });

  document.addEventListener("keydown", handleKeyboard);
  updateDisplay();
})();
