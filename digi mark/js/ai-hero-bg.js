/**
 * AI ASSISTANT HERO BACKGROUND COMPONENT
 * Canvas Waveforms Engine with Audio/Voice Harmonics, Mouse Parallax,
 * Cursor Disturbance, DPR Scaling & Lifecycle Optimization.
 */

class AiHeroBackground {
  /**
   * @param {HTMLElement} container The host container (usually .hero-section)
   * @param {Object} options Configuration overrides
   */
  constructor(container, options = {}) {
    if (!container) {
      console.warn('[AiHeroBackground] Container element is required.');
      return;
    }

    this.container = container;
    this.options = Object.assign({
      waveCount: 4,
      speed: 1.0,
      baseAmplitude: 32,
      strokeColors: ['#7c3aed', '#3b82f6', '#22d3ee'],
      glowBlur: 16,
      mouseInfluence: 38,
      mouseRadius: 220,
      showGrid: true,
      showBubbles: true,
      showOrbs: true,
      showGrain: true,
      showVignette: true
    }, options);

    // Internal state
    this.isRunning = false;
    this.rafId = null;
    this.startTime = null;
    this.lastTime = 0;
    this.time = 0;

    // Dimensions
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    // Mouse tracking & parallax
    this.targetMouse = { x: 0.5, y: 0.5, inside: false };
    this.smoothMouse = { x: 0.5, y: 0.5 };
    this.parallax = { x: 0, y: 0 };

    // Intro draw-in animation state
    this.introDuration = 1400; // ms
    this.introStart = null;
    this.introProgress = 0;

    // Media query preferences
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = window.innerWidth < 768;

    // Bind event handlers
    this.handleResize = this.handleResize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.animate = this.animate.bind(this);

    // Wave descriptors (harmonic configs for rich AI voice signal feel)
    this.initWaveConfigs();

    // DOM building
    this.buildDOM();
    this.initEvents();

    // Start
    this.handleResize();
    this.start();
  }

  /**
   * Wave profile descriptors with multi-harmonic frequencies and phases
   */
  initWaveConfigs() {
    this.waveConfigs = [
      {
        freq1: 0.0035, freq2: 0.008, freq3: 0.015,
        speed: 1.1,
        ampFactor: 1.0,
        phase: 0,
        lineWidth: 2.2,
        opacity: 0.95
      },
      {
        freq1: 0.0042, freq2: 0.0065, freq3: 0.012,
        speed: -0.85,
        ampFactor: 0.85,
        phase: Math.PI * 0.45,
        lineWidth: 1.8,
        opacity: 0.85
      },
      {
        freq1: 0.0028, freq2: 0.011, freq3: 0.018,
        speed: 1.35,
        ampFactor: 0.7,
        phase: Math.PI * 0.9,
        lineWidth: 1.5,
        opacity: 0.8
      },
      {
        freq1: 0.005, freq2: 0.0075, freq3: 0.022,
        speed: -1.05,
        ampFactor: 0.6,
        phase: Math.PI * 1.35,
        lineWidth: 1.2,
        opacity: 0.65
      }
    ];
  }

  /**
   * Constructs the background DOM layers inside the container
   */
  buildDOM() {
    // Ensure container has relative positioning
    const compStyle = window.getComputedStyle(this.container);
    if (compStyle.position === 'static') {
      this.container.style.position = 'relative';
    }

    // Root background wrapper
    this.dom = document.createElement('div');
    this.dom.className = 'ai-hero-bg-container';
    this.dom.setAttribute('aria-hidden', 'true');

    // 1. Subtle Radial-Masked Grid
    if (this.options.showGrid) {
      this.gridEl = document.createElement('div');
      this.gridEl.className = 'ai-hero-grid';
      this.dom.appendChild(this.gridEl);
    }

    // 2. Ambient Drifting Glow Layer
    if (this.options.showOrbs) {
      this.glowLayer = document.createElement('div');
      this.glowLayer.className = 'ai-hero-glow-layer';
      this.glowLayer.innerHTML = `
        <div class="ai-hero-glow-orb orb-purple"></div>
        <div class="ai-hero-glow-orb orb-blue"></div>
      `;
      this.dom.appendChild(this.glowLayer);
    }

    // 3. HTML5 Waveform Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'ai-hero-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.dom.appendChild(this.canvas);

    // 4. Dark Vignette Layer
    if (this.options.showVignette) {
      this.vignetteEl = document.createElement('div');
      this.vignetteEl.className = 'ai-hero-vignette';
      this.dom.appendChild(this.vignetteEl);
    }

    // 5. Film Grain Texture Overlay
    if (this.options.showGrain) {
      this.grainEl = document.createElement('div');
      this.grainEl.className = 'ai-hero-grain';
      this.dom.appendChild(this.grainEl);
    }

    // 6. Floating Glass Chat Bubbles
    if (this.options.showBubbles) {
      this.bubblesLayer = document.createElement('div');
      this.bubblesLayer.className = 'ai-floating-bubbles-layer';
      this.bubblesLayer.innerHTML = `
        <!-- Bubble 1: AI Prompt Intake -->
        <div class="ai-glass-bubble bubble-1">
          <div class="ai-bubble-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <span class="ai-bubble-text">Inbound DM: <b>"Looking for custom automation"</b></span>
        </div>

        <!-- Bubble 2: Assistant Processing & Typing Dots -->
        <div class="ai-glass-bubble bubble-2">
          <div class="ai-bubble-badge" style="background: linear-gradient(135deg, #00CFFF, #006BFF);">
            <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>
          </div>
          <span class="ai-bubble-text">AI Assistant:</span>
          <div class="ai-typing-dots">
            <span class="ai-typing-dot"></span>
            <span class="ai-typing-dot"></span>
            <span class="ai-typing-dot"></span>
          </div>
        </div>

        <!-- Bubble 3: Smart Intent Classification -->
        <div class="ai-glass-bubble bubble-3">
          <div class="ai-bubble-badge" style="background: linear-gradient(135deg, #3b82f6, #10b981);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span class="ai-bubble-text">Intent Classified: <b>Lead Qualification (99.4%)</b></span>
        </div>
      `;
      this.dom.appendChild(this.bubblesLayer);
    }

    // Insert as first child of container so all hero content sits above it
    this.container.insertBefore(this.dom, this.container.firstChild);

    // Animate grid and bubbles in smoothly after mount
    requestAnimationFrame(() => {
      if (this.gridEl) this.gridEl.classList.add('loaded');
      if (this.bubblesLayer) {
        const bubbles = this.bubblesLayer.querySelectorAll('.ai-glass-bubble');
        bubbles.forEach((b, i) => {
          setTimeout(() => b.classList.add('bubble-visible'), 400 + i * 250);
        });
      }
    });
  }

  /**
   * Lifecycle & Interaction Listeners
   */
  initEvents() {
    window.addEventListener('resize', this.handleResize, { passive: true });
    this.container.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    this.container.addEventListener('mouseleave', this.handleMouseLeave, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Pause when off-screen using IntersectionObserver
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.start();
          } else {
            this.pause();
          }
        });
      }, { threshold: 0.05 });
      this.observer.observe(this.container);
    }

    // Listen for reduced motion change
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      if (this.reducedMotion) {
        this.renderStaticFrame();
      } else {
        this.start();
      }
    });
  }

  handleResize() {
    if (!this.container || !this.canvas) return;

    const rect = this.container.getBoundingClientRect();
    this.width = Math.max(rect.width, 320);
    this.height = Math.max(rect.height, 240);
    this.isMobile = this.width < 768;

    // Handle high DPI displays (Retina/4K), capped at 2 for optimal battery/framerate
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    // Scale canvas context
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    // Recreate gradient for crisp colors across width
    this.createWaveGradient();

    if (this.reducedMotion) {
      this.renderStaticFrame();
    }
  }

  createWaveGradient() {
    this.gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
    this.gradient.addColorStop(0, this.options.strokeColors[0] || '#7c3aed');
    this.gradient.addColorStop(0.5, this.options.strokeColors[1] || '#3b82f6');
    this.gradient.addColorStop(1, this.options.strokeColors[2] || '#22d3ee');
  }

  handleMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    this.targetMouse.x = Math.max(0, Math.min(1, x));
    this.targetMouse.y = Math.max(0, Math.min(1, y));
    this.targetMouse.inside = true;
  }

  handleMouseLeave() {
    this.targetMouse.inside = false;
    this.targetMouse.x = 0.5;
    this.targetMouse.y = 0.5;
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.pause();
    } else {
      this.start();
    }
  }

  /**
   * Harmonic Voice Signal Synthesis
   * Calculates Y displacement at position x for a specific wave
   */
  getWaveY(x, wave, t, baselineY, mouseDisturb) {
    const { freq1, freq2, freq3, speed, ampFactor, phase } = wave;
    const currentSpeed = speed * this.options.speed;

    // Harmonic multi-sine superposition mimicking speech/AI modulation
    const h1 = Math.sin(x * freq1 + t * currentSpeed + phase);
    const h2 = Math.sin(x * freq2 - t * currentSpeed * 0.75 + phase * 0.5) * 0.38;
    const h3 = Math.cos(x * freq3 + t * currentSpeed * 1.25) * 0.18;

    let totalAmp = (this.options.baseAmplitude * ampFactor) * (h1 + h2 + h3);

    // Apply interactive cursor swell
    if (mouseDisturb > 0) {
      totalAmp += mouseDisturb * Math.sin(x * 0.03 + t * 4);
    }

    return baselineY + totalAmp;
  }

  /**
   * Main 60fps Animation Loop
   */
  animate(timestamp) {
    if (!this.isRunning) return;

    if (!this.startTime) this.startTime = timestamp;
    if (!this.introStart) this.introStart = timestamp;

    const delta = (timestamp - (this.lastTime || timestamp)) / 1000;
    this.lastTime = timestamp;
    this.time += Math.min(delta, 0.1);

    // Calculate intro draw-in progress (0 -> 1 with cubic ease-out)
    const introElapsed = timestamp - this.introStart;
    if (introElapsed < this.introDuration) {
      const p = introElapsed / this.introDuration;
      // Cubic-bezier ease out (1 - (1-p)^3)
      this.introProgress = 1 - Math.pow(1 - p, 3);
    } else {
      this.introProgress = 1;
    }

    // Damped lerp for smooth parallax cursor movement
    this.smoothMouse.x += (this.targetMouse.x - this.smoothMouse.x) * 0.06;
    this.smoothMouse.y += (this.targetMouse.y - this.smoothMouse.y) * 0.06;

    // Parallax shifts up to 20px opposite cursor
    const shiftX = (this.smoothMouse.x - 0.5) * -24;
    const shiftY = (this.smoothMouse.y - 0.5) * -20;

    // Apply parallax to ambient glow layer if present
    if (this.glowLayer) {
      this.glowLayer.style.transform = `translate3d(${shiftX * 0.8}px, ${shiftY * 0.8}px, 0)`;
    }

    // Clear Canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Baseline sits in the lower-middle hero section
    const baselineY = (this.height * 0.52) + shiftY;

    // On mobile, reduce wave count from 4 to 2, and turn off heavy glow blur
    const activeWaveCount = this.isMobile ? Math.min(2, this.options.waveCount) : this.options.waveCount;
    const useGlow = !this.isMobile && this.options.glowBlur > 0;

    // Set additive blend mode for intense neon superposition
    this.ctx.globalCompositeOperation = 'lighter';

    const mouseCanvasX = this.smoothMouse.x * this.width;
    const hasMouseInfluence = this.targetMouse.inside && this.options.mouseInfluence > 0;

    // Intro draw-in boundary
    const drawLimitX = this.width * Math.min(1, this.introProgress * 1.05);

    // Render Wave Layers
    for (let i = 0; i < activeWaveCount; i++) {
      const wave = this.waveConfigs[i % this.waveConfigs.length];

      this.ctx.save();
      this.ctx.beginPath();

      this.ctx.lineWidth = wave.lineWidth * (this.isMobile ? 1 : 1.1);
      this.ctx.strokeStyle = this.gradient;
      this.ctx.globalAlpha = wave.opacity * Math.min(1, this.introProgress * 1.5);

      if (useGlow) {
        this.ctx.shadowColor = this.options.strokeColors[1] || '#3b82f6';
        this.ctx.shadowBlur = this.options.glowBlur * (1 - i * 0.15);
      }

      // Step along horizontal width (step of 3px for high-fidelity curve)
      const step = this.isMobile ? 6 : 3;
      let firstPoint = true;

      for (let x = 0; x <= drawLimitX; x += step) {
        // Calculate mouse proximity envelope (Gaussian bell curve)
        let mouseDisturb = 0;
        if (hasMouseInfluence) {
          const dist = Math.abs(x - mouseCanvasX);
          if (dist < this.options.mouseRadius) {
            const factor = Math.exp(-(dist * dist) / (2 * (this.options.mouseRadius * 0.45) ** 2));
            mouseDisturb = factor * this.options.mouseInfluence;
          }
        }

        const y = this.getWaveY(x, wave, this.time, baselineY + (i * 4 - 6), mouseDisturb);

        if (firstPoint) {
          this.ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          this.ctx.lineTo(x, y);
        }
      }

      this.ctx.stroke();
      this.ctx.restore();
    }

    // Reset composite operation
    this.ctx.globalCompositeOperation = 'source-over';

    this.rafId = requestAnimationFrame(this.animate);
  }

  /**
   * Renders a single static frame for prefers-reduced-motion
   */
  renderStaticFrame() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const baselineY = this.height * 0.52;
    this.ctx.globalCompositeOperation = 'lighter';

    const activeWaveCount = this.isMobile ? 2 : this.options.waveCount;

    for (let i = 0; i < activeWaveCount; i++) {
      const wave = this.waveConfigs[i];
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.lineWidth = wave.lineWidth;
      this.ctx.strokeStyle = this.gradient;
      this.ctx.globalAlpha = wave.opacity * 0.9;

      for (let x = 0; x <= this.width; x += 4) {
        const y = this.getWaveY(x, wave, 1.2, baselineY + (i * 4 - 6), 0);
        if (x === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
      this.ctx.restore();
    }
    this.ctx.globalCompositeOperation = 'source-over';
  }

  start() {
    if (this.reducedMotion) {
      this.renderStaticFrame();
      return;
    }

    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.rafId = requestAnimationFrame(this.animate);
    }
  }

  pause() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Dynamic property update
   */
  setOptions(newOptions) {
    Object.assign(this.options, newOptions);
    this.createWaveGradient();
    if (this.reducedMotion) {
      this.renderStaticFrame();
    }
  }

  /**
   * Complete clean-up method
   */
  destroy() {
    this.pause();
    window.removeEventListener('resize', this.handleResize);
    this.container.removeEventListener('mousemove', this.handleMouseMove);
    this.container.removeEventListener('mouseleave', this.handleMouseLeave);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.dom && this.dom.parentNode) {
      this.dom.parentNode.removeChild(this.dom);
    }
  }

  /**
   * Static helper initializer
   */
  static init(container, options) {
    return new AiHeroBackground(container, options);
  }
}

// Export for module systems or attach to global window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AiHeroBackground;
} else {
  window.AiHeroBackground = AiHeroBackground;
}
