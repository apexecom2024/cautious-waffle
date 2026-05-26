## Fix camera streaming screen bottom icons + move orb into header as audio visualizer

On the **camera/video streaming active screen**, please make two UI changes:

### 1. Fix the bottom control icons

The bottom controls are currently not clear enough. Please make all three bottom buttons visible and consistent:

* **Left button:** Mic icon
* **Center button:** End call / close icon
* **Right button:** Camera icon

The left button currently looks like a dark empty circle, so the mic icon is missing or too low-contrast. Please make it visible in white.

Use stronger contrast, larger icons, and proper z-index:

```html
<div id="video-controls" class="fixed bottom-8 left-0 right-0 z-50 flex items-center justify-center gap-10 px-6">
    
    <!-- Mic Button -->
    <button id="video-mic-btn" class="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all duration-200">
        <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" stroke-width="2.6" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-14 0"></path>
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v4"></path>
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 22h8"></path>
        </svg>
    </button>

    <!-- End Button -->
    <button id="end-video-btn" class="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl active:scale-95 transition-all duration-200">
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18"></path>
        </svg>
    </button>

    <!-- Camera Button -->
    <button id="camera-toggle-btn" class="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all duration-200">
        <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" stroke-width="2.6" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"></path>
            <circle cx="12" cy="13" r="4"></circle>
        </svg>
    </button>

</div>
```

Also check that no parent container is hiding icons with:

```css
opacity: 0;
visibility: hidden;
display: none;
overflow: hidden;
z-index lower than video layer;
```

The bottom controls must stay visible **above the active video/camera stream**.

---

## 2. Move the orb into the header and turn it into a bar-style audio visualizer

When camera/video streaming is active, do **not** show the big circular orb in the body. Instead, move the Beatrice visualizer into the header area and make it a compact horizontal audio bar.

Current screenshot target:

```text
Back arrow     Beatrice / visualizer     00:03
```

Replace the large orb/avatar area with a compact header visualizer like this:

```html
<header id="video-header" class="fixed top-0 left-0 right-0 z-50 px-6 pt-12 pb-4 flex items-center justify-between bg-black/70 backdrop-blur-md">
    
    <!-- Back Button -->
    <button onclick="window.history.back()" class="w-10 h-10 flex items-center justify-center text-white">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path>
        </svg>
    </button>

    <!-- Beatrice Header Audio Visualizer -->
    <div class="flex flex-col items-center justify-center">
        <div class="text-white text-xl font-bold mb-2">Beatrice</div>

        <div id="header-audio-visualizer" class="flex items-center justify-center gap-1 h-8">
            <span class="audio-bar h-3"></span>
            <span class="audio-bar h-5"></span>
            <span class="audio-bar h-7"></span>
            <span class="audio-bar h-4"></span>
            <span class="audio-bar h-6"></span>
            <span class="audio-bar h-8"></span>
            <span class="audio-bar h-5"></span>
            <span class="audio-bar h-3"></span>
        </div>
    </div>

    <!-- Timer -->
    <div id="video-timer" class="text-zinc-300 text-xl font-semibold tabular-nums">
        00:03
    </div>

</header>
```

Add this CSS:

```css
.audio-bar {
    width: 4px;
    min-height: 8px;
    border-radius: 999px;
    background: linear-gradient(to top, #ab7b60, #ebd0bc);
    box-shadow: 0 0 10px rgba(208, 167, 139, 0.45);
    animation: header-audio-pulse 900ms ease-in-out infinite;
}

.audio-bar:nth-child(1) { animation-delay: 0ms; }
.audio-bar:nth-child(2) { animation-delay: 100ms; }
.audio-bar:nth-child(3) { animation-delay: 200ms; }
.audio-bar:nth-child(4) { animation-delay: 300ms; }
.audio-bar:nth-child(5) { animation-delay: 150ms; }
.audio-bar:nth-child(6) { animation-delay: 250ms; }
.audio-bar:nth-child(7) { animation-delay: 350ms; }
.audio-bar:nth-child(8) { animation-delay: 450ms; }

@keyframes header-audio-pulse {
    0%, 100% {
        transform: scaleY(0.45);
        opacity: 0.55;
    }

    50% {
        transform: scaleY(1);
        opacity: 1;
    }
}
```

### Important layout rule

On the video streaming screen, hide or remove the old big orb block:

```js
const largeOrb = document.getElementById('orb-btn');

if (largeOrb) {
    largeOrb.classList.add('hidden');
}
```

Or conditionally render it only on the normal voice screen, not on the active video screen.

### Final behavior

When video streaming is active:

```text
Top header:
Back arrow + Beatrice name + animated bar visualizer + timer

Main area:
Camera/video stream only

Bottom controls:
Visible mic icon + red end button + visible camera icon
```

This keeps the camera screen clean and makes Beatrice feel active through the small animated header visualizer instead of the large floating orb.
