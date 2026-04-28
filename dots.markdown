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
  </div>

  <div class="project-box dots-canvas-box">
    <canvas id="field" width="500" height="400" aria-label="Dot field visualization"></canvas>
  </div>

  <div class="project-box dots-controls dots-controls--right" aria-live="polite" data-dots-right-panel>
    Strategy details will appear here.
  </div>
</div>

<script src="{{ '/assets/js/dots.js' | relative_url }}" type="module"></script>