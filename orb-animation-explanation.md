## How the orb animation works

The orb is built in Lit (`visual-3d.ts`). It uses a circular container with layered CSS animations driven by **real audio frequency data** — not random values.

### Structure

```html
<div class="pluto-orb">
  <div class="pluto-surface"></div>   <!-- base Pluto-colored sphere -->
  <div class="wave-layer"></div>       <!-- layer 1: drifts + color-reactive -->
  <div class="wave-layer"></div>       <!-- layer 2: drifts + color-reactive -->
  <div class="wave-layer"></div>       <!-- layer 3: drifts + color-reactive -->
</div>
```

### 1. The orb container

```css
.pluto-orb {
  width: 260px; height: 260px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(232, 201, 184, 0.35);
  position: relative;
}
```

`overflow: hidden` clips everything inside the circle.

### 2. The base Pluto surface

A radial gradient from lit peach to dark brown, simulating the planet surface:

```css
radial-gradient(circle at 30% 30%, #f5e0d3 0%, #d4a88a 35%, #a07050 70%, #2a1b14 100%)
```

With inset shadows for 3D depth:

```css
inset -25px -25px 50px rgba(0, 0, 0, 0.8),
inset 15px 15px 30px rgba(255, 255, 255, 0.2)
```

### 3. Three wave layers with CSS drift animations

Each layer has its own CSS `@keyframes` that continuously translate and scale:

```css
@keyframes waveDrift1 {
  0%   { transform: translate(0%, 0%) scale(1); }
  33%  { transform: translate(4%, -3%) scale(1.04); }
  66%  { transform: translate(-3%, 4%) scale(0.97); }
  100% { transform: translate(0%, 0%) scale(1); }
}
```

Three different keyframe sets run at staggered speeds (8s / 11s / 14s), creating an organic multi-layered cloud movement.

### 4. Audio reactivity via requestAnimationFrame

The `animate()` method runs every frame:

1. Reads frequency data from two `Analyser` instances (mic input + speaker output), FFT size 256
2. Extracts low/mid/high bands from each
3. **Speaker output** drives:
   - **Hue** — cycles through warm tones based on frequency mix
   - **Saturation & lightness** — rise with mid/low energy
   - **Opacity per layer** — each frequency band controls one wave layer
4. **Mic input** adds a secondary influence to opacity and glow color
5. **Total energy** (speaker + mic combined) controls:
   - **Animation speed** — wave drift durations shorten with energy (8s → as fast as 3s)
   - **Orb scale** — subtle 1–1.025 pulsing
   - **Glow intensity** — box-shadow alpha increases with energy, extra color channel from audio

All values are set via CSS custom properties:

```js
this.style.setProperty('--orb-glow', `0 0 80px 20px rgba(232, 201, 184, ${glowAlpha}), ...`);
this.style.setProperty('--orb-scale', String(scale));
```

### Summary

```
Circular orb div
  → 260px, rounded-full, overflow-hidden
  → Pluto surface gradient + inset shadows (3D sphere)
  → 3 wave layers with CSS keyframe drift (different speeds)
  → requestAnimationFrame loop
  → Real audio FFT data drives:
      - HSL colors (speaker frequencies → hue/sat/light)
      - Layer opacity (per frequency band)
      - Animation speed (total energy)
      - Scale + glow intensity
  → No Math.random() — every visual change comes from actual audio
```
