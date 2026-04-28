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

  function clearRun(el, resetText = true) {
    const state = activeRuns.get(el);
    if (!state) {
      return;
    }

    if (state.timer) {
      clearInterval(state.timer);
    }

    activeRuns.delete(el);

    if (resetText) {
      el.textContent = state.original;
    }
  }

  function buildGlyphSpans(el, chars) {
    const glyphNodes = [];
    const fragment = document.createDocumentFragment();

    chars.forEach((char) => {
      if (char === " ") {
        fragment.appendChild(document.createTextNode(" "));
        glyphNodes.push(null);
        return;
      }

      const span = document.createElement("span");
      span.className = "hover-hook__glyph";
      span.textContent = char;
      fragment.appendChild(span);
      glyphNodes.push(span);
    });

    el.textContent = "";
    el.appendChild(fragment);

    return glyphNodes;
  }

  function startHoverEffect(el, stepMs = 18) {
    clearRun(el, true);

    const original = el.dataset.originalText || el.textContent || "";
    el.dataset.originalText = original;
    const target = el.dataset.hoverText || original;

    const chars = target.split("");
    const animatableIndices = shuffleIndices(
      chars
        .map((char, index) => (char === " " ? -1 : index))
        .filter((index) => index >= 0)
    );

    if (animatableIndices.length === 0) {
      return;
    }

    const glyphNodes = buildGlyphSpans(el, chars);
    const pendingIndices = new Set(animatableIndices);
    let cursor = 0;

    const timer = setInterval(() => {
      pendingIndices.forEach((pendingIndex) => {
        const pendingGlyph = glyphNodes[pendingIndex];
        if (pendingGlyph) {
          pendingGlyph.textContent = randomAsciiChar();
        }
      });

      const index = animatableIndices[cursor];
      if (index === undefined) {
        clearInterval(timer);

        const state = activeRuns.get(el);
        if (state) {
          state.timer = null;
        }
        return;
      }

      const glyph = glyphNodes[index];
      if (glyph) {
        glyph.textContent = chars[index];
        glyph.classList.add("hover-hook__invert");
      }
      pendingIndices.delete(index);
      cursor += 1;
    }, stepMs);

    activeRuns.set(el, { timer, original });

    pendingIndices.forEach((pendingIndex) => {
      const pendingGlyph = glyphNodes[pendingIndex];
      if (pendingGlyph) {
        pendingGlyph.textContent = randomAsciiChar();
      }
    });
  }

  function bindScrambleHooks() {
    const targets = document.querySelectorAll(".hover-hook--scramble");

    targets.forEach((el) => {
      const run = () => startHoverEffect(el);
      const stop = () => clearRun(el, true);
      const goHome = (event) => {
        event.preventDefault();
        event.stopPropagation();
        clearRun(el, true);
        window.location.assign(el.href);
      };

      el.addEventListener("pointerenter", run);
      el.addEventListener("focus", run);
      el.addEventListener("pointerleave", stop);
      el.addEventListener("blur", stop);
      el.addEventListener("pointerdown", goHome);
      el.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          goHome(event);
        }
      });
      el.addEventListener("click", goHome);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindScrambleHooks);
  } else {
    bindScrambleHooks();
  }
})();
