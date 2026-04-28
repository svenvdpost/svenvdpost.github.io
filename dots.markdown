---
layout: default
title: Dots
permalink: /dots/
---

<div class="dots-layout">
  <div class="project-box dots-controls dots-controls--left" aria-label="Neighbor strategy selection">
    <button type="button" class="strategy-button" data-strategy="bruteforce">Brute force</button>
    <button type="button" class="strategy-button" data-strategy="grid">Grid search</button>
    <button type="button" class="strategy-button" data-strategy="kdtree">KD-tree</button>

    <label class="strategy-slider" for="neighbor-distance-slider">
      <span class="strategy-slider__label">Neighbor distance</span>
      <span class="strategy-slider__value" data-neighbor-distance-value>120</span>
      <input id="neighbor-distance-slider" type="range" min="20" max="250" value="120" step="5" data-neighbor-distance-slider>
    </label>
  </div>

  <div class="project-box dots-canvas-box">
    <canvas id="field" width="500" height="400" aria-label="Dot field visualization"></canvas>
  </div>

  <div class="project-box dots-controls dots-controls--right" aria-live="polite" data-dots-right-panel>
    Strategy details will appear here.
  </div>
</div>

<script src="{{ '/assets/js/dots.js' | relative_url }}" type="module"></script>