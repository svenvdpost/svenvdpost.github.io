(() => {
  const RANDOM_ASCII = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
  const activeRuns = new WeakMap();

  function randomAsciiChar() {
    return RANDOM_ASCII.charAt(Math.floor(Math.random() * RANDOM_ASCII.length));
  }

  function shuffleIndices(indices) {
    const copy = [...indices];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function scrambleText(el, durationMs = 200, frameMs = 16) {
    const original = el.dataset.originalText || el.textContent || "";
    el.dataset.originalText = original;
    const chars = original.split("");
    const nonSpaceIndices = chars
      .map((char, index) => (char === " " ? -1 : index))
      .filter((index) => index >= 0);
    const revealOrder = shuffleIndices(nonSpaceIndices);

    const previous = activeRuns.get(el);
    if (previous) {
      clearInterval(previous);
    }

    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += frameMs;
      const progress = Math.min(elapsed / durationMs, 1);
      const revealCount = Math.floor(progress * revealOrder.length);
      const revealed = new Set(revealOrder.slice(0, revealCount));

      const next = chars
        .map((char, index) => {
          if (char === " ") {
            return " ";
          }
          if (revealed.has(index) || progress >= 1) {
            return char;
          }
          return randomAsciiChar();
        })
        .join("");

      el.textContent = next;

      if (progress >= 1) {
        clearInterval(timer);
        activeRuns.delete(el);
        el.textContent = original;
      }
    }, frameMs);

    activeRuns.set(el, timer);
  }

  function bindScrambleHooks() {
    const targets = document.querySelectorAll(".hover-hook--scramble");

    targets.forEach((el) => {
      const run = () => scrambleText(el);
      el.addEventListener("mouseenter", run);
      el.addEventListener("focus", run);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindScrambleHooks);
  } else {
    bindScrambleHooks();
  }
})();
