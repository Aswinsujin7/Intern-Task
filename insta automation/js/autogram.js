/**
 * AUTOGRAM - INSTAGRAM DM AUTOMATION SAAS ENGINE
 * High Performance, Native 120 FPS Scrolling, Scroll Reveal, Hero Cosmic Vortex & Live Chat Simulator
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initHeroVideo();
  initHeroParticles();
  initHeroParallax();
  initHeroMockup();
  initChatSimulator();
  initFlowVisual();
  initPricingSelect();
  initFAQAccordion();
  initLeadCaptureForm();
});

/* =========================================================================
   1. NAVBAR & BUTTERY SMOOTH ANCHOR NAVIGATION
   ========================================================================= */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateScrollSpy();
  }, { passive: true });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', false);
      });
    });
  }

  // Global smooth scrolling to any target section with header offset
  window.scrollToSection = function(targetId) {
    if (!targetId) return;
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 74;
      const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - (navHeight + 10);
      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    }
  };

  // Offset-aware smooth scrolling for all internal anchor tags
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const targetId = href.substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        window.scrollToSection(targetId);
      }
    });
  });

  function updateScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 100;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute('id');
      const targetLink = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

      if (targetLink && scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => link.classList.remove('active'));
        targetLink.classList.add('active');
      }
    });
  }
}

/* =========================================================================
   1.3 SCROLL REVEAL OBSERVER (BUTTER-SMOOTH ENTRANCE)
   ========================================================================= */
function initScrollReveal() {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) {
    document.querySelectorAll('.reveal-on-scroll, .reveal-stagger').forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const targets = [
    '.demo-section .section-header',
    '.demo-simulator-card',
    '.how-it-works-section .section-header',
    '.workflow-container',
    '.flow-visual-section .section-header',
    '.flow-visual-box',
    '.features-section .section-header',
    '.features-grid',
    '.pricing-section .section-header',
    '.pricing-grid',
    '.faq-section .section-header',
    '.faq-list',
    '.lead-capture-section .section-header',
    '.lead-capture-card',
    '.final-cta-card'
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (el.classList.contains('features-grid') || el.classList.contains('pricing-grid') || el.classList.contains('workflow-steps-row')) {
        el.classList.add('reveal-stagger');
      } else {
        el.classList.add('reveal-on-scroll');
      }
      observer.observe(el);
    });
  });
}

/* =========================================================================
   1.5 HERO FUTURISTIC PARTICLES & 3D PARALLAX (DORMANT SLEEP & 120 FPS)
   ========================================================================= */

/** Subtle Glowing Cosmic Starfield Canvas in Hero Background */
function initHeroParticles() {
  const canvas = document.getElementById('heroParticlesCanvas');
  const heroSection = document.getElementById('hero');
  if (!canvas || !heroSection) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let animId = null;
  let isVisible = true;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) return;

  const starPalettes = [
    'rgba(255, 255, 255, ',   // Pure White Star
    'rgba(225, 210, 255, ',   // Ethereal Lavender
    'rgba(192, 132, 252, ',   // Purple Stardust
    'rgba(147, 51, 234, ',    // Deep Violet
    'rgba(255, 210, 31, ',    // Subtle Golden Spark
  ];

  function resize() {
    width = canvas.width = heroSection.offsetWidth;
    height = canvas.height = heroSection.offsetHeight;
  }

  function createParticles() {
    particles = [];
    const count = window.innerWidth < 768 ? 18 : 36;
    for (let i = 0; i < count; i++) {
      const colBase = starPalettes[Math.floor(Math.random() * starPalettes.length)];
      const baseAlpha = 0.25 + Math.random() * 0.6;
      const isSpark = Math.random() < 0.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: isSpark ? 1.4 + Math.random() * 1.0 : 0.6 + Math.random() * 0.8,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: -0.06 - Math.random() * 0.18,
        colorRaw: colBase,
        pulseSpeed: 0.015 + Math.random() * 0.03,
        pulseVal: Math.random() * Math.PI * 2,
        baseAlpha: baseAlpha,
        isSpark: isSpark
      });
    }
  }

  function draw() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulseVal += p.pulseSpeed;

      // Wrap around edges
      if (p.y < -5) p.y = height + 5;
      if (p.x < -5) p.x = width + 5;
      if (p.x > width + 5) p.x = -5;

      const dynamicAlpha = Math.max(0.12, p.baseAlpha + Math.sin(p.pulseVal) * 0.28);

      if (p.isSpark) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = p.colorRaw + (dynamicAlpha * 0.25) + ')';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.colorRaw + dynamicAlpha + ')';
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  animId = requestAnimationFrame(draw);

  // Performance: Pause when scrolled off screen to keep 100% CPU/GPU free for rest of page
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible && !animId) {
      animId = requestAnimationFrame(draw);
    } else if (!isVisible && animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }, { threshold: 0.05 });
  observer.observe(heroSection);

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  }, { passive: true });
}

/** Subtle 3D Mouse Parallax Effect on Cosmic Vortex (Dormant when idle) */
function initHeroParallax() {
  const heroSection = document.getElementById('hero');
  const vortex = document.getElementById('cosmicVortexWrap');
  if (!heroSection || !vortex) return;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) return;

  let currentX = 0, currentY = 0;
  let targetX = 0, targetY = 0;
  let rafId = null;
  let isHeroVisible = true;
  let isAnimating = false;

  function renderParallax() {
    if (!isHeroVisible) {
      isAnimating = false;
      return;
    }
    const diffX = targetX - currentX;
    const diffY = targetY - currentY;
    currentX += diffX * 0.08;
    currentY += diffY * 0.08;

    vortex.style.transform = `translate3d(calc(-50% + ${(-currentX * 1.5).toFixed(1)}px), calc(-50% + ${(-currentY * 1.5).toFixed(1)}px), 0)`;

    if (Math.abs(diffX) > 0.04 || Math.abs(diffY) > 0.04) {
      rafId = requestAnimationFrame(renderParallax);
    } else {
      isAnimating = false;
    }
  }

  function startParallax() {
    if (!isAnimating && isHeroVisible) {
      isAnimating = true;
      rafId = requestAnimationFrame(renderParallax);
    }
  }

  heroSection.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 1024) return;
    const rect = heroSection.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = nx * 8;
    targetY = -ny * 8;
    startParallax();
  }, { passive: true });

  heroSection.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    startParallax();
  }, { passive: true });

  // Disconnect when hero is off-screen
  const observer = new IntersectionObserver(([entry]) => {
    isHeroVisible = entry.isIntersecting;
    if (!isHeroVisible && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
      isAnimating = false;
    }
  }, { threshold: 0.05 });
  observer.observe(heroSection);
}

/* =========================================================================
   1.6 HERO BACKGROUND VIDEO CONTROLLER (120 FPS & BATTERY OPTIMIZED)
   ========================================================================= */
function initHeroVideo() {
  const video = document.getElementById('heroBgVideo');
  const toggleBtn = document.getElementById('heroVideoToggleBtn');
  const icon = document.getElementById('heroVideoIcon');
  const statusText = document.getElementById('heroVideoStatusText');
  const liveDot = document.getElementById('heroVideoLiveDot');
  const heroSection = document.getElementById('hero');

  if (!video) return;

  // Set all attributes required by browser autoplay policies
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('muted', '');
  video.playsInline = true;
  video.setAttribute('playsinline', '');

  function attemptPlay() {
    if (video.dataset.manuallyPaused === 'true') return;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        if (icon) icon.textContent = '⏸';
        if (statusText) statusText.textContent = 'AI Live Preview';
        if (liveDot) {
          liveDot.style.background = '#10b981';
          liveDot.style.boxShadow = '0 0 8px #10b981';
        }
      }).catch(() => {
        // Autoplay policy waiting for user gesture
      });
    }
  }

  // 1. Immediate play attempt
  attemptPlay();

  // 2. Play on video load events
  video.addEventListener('loadedmetadata', attemptPlay, { once: true });
  video.addEventListener('loadeddata', attemptPlay, { once: true });
  video.addEventListener('canplay', attemptPlay, { once: true });

  // 3. Fallback on any user interaction (click, scroll, mousemove, touch, key)
  const userGestureEvents = ['click', 'touchstart', 'scroll', 'mousemove', 'keydown'];
  const onFirstInteraction = () => {
    attemptPlay();
    userGestureEvents.forEach(evt => window.removeEventListener(evt, onFirstInteraction));
  };
  userGestureEvents.forEach(evt => window.addEventListener(evt, onFirstInteraction, { passive: true }));

  // Luxury Glass Pill Toggle: Pause / Play
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (video.paused) {
        video.dataset.manuallyPaused = 'false';
        video.play().then(() => {
          if (icon) icon.textContent = '⏸';
          if (statusText) statusText.textContent = 'AI Live Preview';
          if (liveDot) {
            liveDot.style.background = '#10b981';
            liveDot.style.boxShadow = '0 0 8px #10b981';
          }
        }).catch(() => {});
      } else {
        video.dataset.manuallyPaused = 'true';
        video.pause();
        if (icon) icon.textContent = '▶';
        if (statusText) statusText.textContent = 'Video Paused';
        if (liveDot) {
          liveDot.style.background = '#f59e0b';
          liveDot.style.boxShadow = '0 0 8px #f59e0b';
        }
      }
    });
  }

  // Battery & GPU Optimization: Pause when hero scrolls out of view, resume when visible
  if ('IntersectionObserver' in window && heroSection) {
    const videoObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        if (!video.paused) {
          video.pause();
        }
      } else {
        if (video.dataset.manuallyPaused !== 'true') {
          video.play().catch(() => {});
        }
      }
    }, { threshold: 0.05 });

    videoObserver.observe(heroSection);
  }
}

/* =========================================================================
   2. HERO RIGHT-SIDE VISUAL INTERACTION
   ========================================================================= */
function initHeroMockup() {
  const chatBody = document.getElementById('heroChatBody');
  const optionsRow = document.getElementById('heroMockupOptions');
  if (!chatBody || !optionsRow) return;

  optionsRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.hero-option-btn');
    if (!btn) return;
    const choice = btn.getAttribute('data-choice');

    // Add user bubble
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg customer';
    userMsg.innerHTML = `
      <div class="msg-bubble">${escapeHtml(btn.textContent)}</div>
      <span class="msg-time">Just now</span>
    `;
    chatBody.appendChild(userMsg);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Remove buttons temporarily during response
    optionsRow.style.display = 'none';

    // Typing dots
    const typing = document.createElement('div');
    typing.className = 'chat-msg autogram';
    typing.id = 'heroTyping';
    typing.innerHTML = `
      <div class="msg-bubble" style="padding: 10px 14px;">
        <span style="font-size: 0.75rem; letter-spacing: 2px;">● ● ●</span>
      </div>
    `;
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
      const t = document.getElementById('heroTyping');
      if (t) t.remove();

      let replyText = '';
      if (choice === 'services') {
        replyText = "AUTOGRAM handles automated welcome replies, comment-to-DM on Reels, keyword funnels, and 24/7 lead qualification.";
      } else if (choice === 'pricing') {
        replyText = "Plans start at $79/mo for Starter and $199/mo for Growth. Transparent monthly tiers with zero hidden setup fees.";
      } else if (choice === 'book') {
        replyText = "Ready to see AUTOGRAM live? Scroll down to test our full simulator or schedule an onboarding session below!";
      }

      const botMsg = document.createElement('div');
      botMsg.className = 'chat-msg autogram';
      botMsg.innerHTML = `
        <div class="msg-bubble">${replyText}</div>
        <span class="msg-time">Just now · AUTOGRAM</span>
      `;
      chatBody.appendChild(botMsg);
      chatBody.scrollTop = chatBody.scrollHeight;

      // Bring options back after 1s
      setTimeout(() => {
        optionsRow.style.display = 'flex';
      }, 1200);

    }, 650);
  });
}

/* =========================================================================
   3. LIVE INTERACTIVE DEMO (See AUTOGRAM In Action)
   ========================================================================= */
function initChatSimulator() {
  const chatCanvas = document.getElementById('simChatCanvas');
  const textInput = document.getElementById('simTextInput');
  const sendBtn = document.getElementById('simSendBtn');
  const resetBtn = document.getElementById('simResetBtn');
  const optionsRow = document.getElementById('simOptionsRow');

  if (!chatCanvas) return;

  let isTyping = false;

  function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMin = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMin} ${ampm}`;
  }

  function appendUserBubble(text) {
    const bubble = document.createElement('div');
    bubble.className = 'sim-bubble-wrapper user';
    bubble.innerHTML = `
      <div class="sim-bubble-content">
        <div class="sim-bubble">${escapeHtml(text)}</div>
        <div class="sim-bubble-time">${getCurrentTime()} · Sent</div>
      </div>
    `;
    chatCanvas.appendChild(bubble);
    chatCanvas.scrollTo({ top: chatCanvas.scrollHeight, behavior: 'smooth' });
  }

  function showTyping() {
    isTyping = true;
    const typing = document.createElement('div');
    typing.className = 'sim-bubble-wrapper bot';
    typing.id = 'simTyping';
    typing.innerHTML = `
      <div class="sim-bubble-avatar">A</div>
      <div class="sim-bubble-content">
        <div class="sim-typing-box">
          <span class="sim-typing-dot"></span>
          <span class="sim-typing-dot"></span>
          <span class="sim-typing-dot"></span>
        </div>
      </div>
    `;
    chatCanvas.appendChild(typing);
    chatCanvas.scrollTo({ top: chatCanvas.scrollHeight, behavior: 'smooth' });
  }

  function hideTyping() {
    isTyping = false;
    const t = document.getElementById('simTyping');
    if (t) t.remove();
  }

  function appendBotBubble(html) {
    hideTyping();
    const bubble = document.createElement('div');
    bubble.className = 'sim-bubble-wrapper bot';
    bubble.innerHTML = `
      <div class="sim-bubble-avatar">A</div>
      <div class="sim-bubble-content">
        <div class="sim-bubble">${html}</div>
        <div class="sim-bubble-time">${getCurrentTime()} · AUTOGRAM Automated</div>
      </div>
    `;
    chatCanvas.appendChild(bubble);
    chatCanvas.scrollTo({ top: chatCanvas.scrollHeight, behavior: 'smooth' });
  }

  function handleOption(key) {
    if (isTyping) return;

    if (key === 'services') {
      appendUserBubble('Explore Services');
      showTyping();
      setTimeout(() => {
        appendBotBubble(`
          <strong>⚡ AUTOGRAM Core Workflows:</strong><br>
          Here are the automated systems we deploy for your Instagram inbox:
          <ul style="margin: 8px 0 8px 18px; font-size: 0.86rem; color: #e2e8f0; line-height: 1.6;">
            <li><strong>Automated Replies:</strong> Instant warm greeting & menu navigation.</li>
            <li><strong>Keyword Triggers:</strong> Deliver promo codes & lead magnets from DMs.</li>
            <li><strong>Comment-to-DM:</strong> Auto-DM link when users comment on your Reels.</li>
            <li><strong>Lead Capture:</strong> Conversational phone & email validation.</li>
          </ul>
          <button class="sim-quick-btn" style="margin-top: 6px;" onclick="window.scrollToSection('getStarted')">Get Started with AUTOGRAM →</button>
        `);
      }, 650);

    } else if (key === 'pricing') {
      appendUserBubble('Pricing');
      showTyping();
      setTimeout(() => {
        appendBotBubble(`
          Sure! I can help with that. What type of solution are you looking for?<br>
          <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
            <button class="sim-quick-btn" onclick="window.scrollToSection('pricing')">View Plans →</button>
            <button class="sim-quick-btn" onclick="window.scrollToSection('getStarted')">Request a Quote →</button>
          </div>
        `);
      }, 600);

    } else if (key === 'booking') {
      appendUserBubble('Book a Call');
      showTyping();
      setTimeout(() => {
        appendBotBubble(`
          Great! Let's get you connected. Choose a preferred time:
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
            <button class="sim-quick-btn" style="text-align: center; justify-content: center;" onclick="window.simSelectSlot('Tomorrow at 2:00 PM')">Tomorrow 2:00 PM</button>
            <button class="sim-quick-btn" style="text-align: center; justify-content: center;" onclick="window.simSelectSlot('Thursday at 10:30 AM')">Thursday 10:30 AM</button>
            <button class="sim-quick-btn" style="text-align: center; justify-content: center;" onclick="window.simSelectSlot('Friday at 3:00 PM')">Friday 3:00 PM</button>
            <button class="sim-quick-btn" style="text-align: center; justify-content: center;" onclick="window.simSelectSlot('Next Monday 11:00 AM')">Monday 11:00 AM</button>
          </div>
        `);
      }, 700);

    } else if (key === 'human') {
      appendUserBubble('Talk to a Human');
      showTyping();
      setTimeout(() => {
        appendBotBubble(`
          Absolutely. I'll hand this conversation over to our team.
          <div style="margin-top: 8px; padding: 10px 14px; background: rgba(255, 210, 31, 0.08); border: 1px solid var(--border-yellow-light); border-radius: 8px; font-size: 0.82rem;">
            <span style="color: var(--yellow-primary); font-weight: 600;">Status:</span> Agent Assigned (Typical response time &lt; 2 mins).<br>
            Please provide your email below so we can notify you directly.
          </div>
          <button class="sim-quick-btn" style="margin-top: 10px;" onclick="window.scrollToSection('getStarted')">Leave Details for Callback →</button>
        `);
      }, 750);
    }
  }

  window.simSelectSlot = function(timeStr) {
    if (isTyping) return;
    appendUserBubble(`Selected: ${timeStr}`);
    showTyping();
    setTimeout(() => {
      appendBotBubble(`
        <strong>✅ Time Slot Reserved! (${escapeHtml(timeStr)})</strong><br>
        To complete your consultation booking, please fill out your Instagram handle and goals below.
        <div style="margin-top: 8px;">
          <button class="sim-quick-btn" onclick="window.scrollToSection('getStarted')">Complete Booking Form →</button>
        </div>
      `);
    }, 600);
  };

  if (optionsRow) {
    optionsRow.addEventListener('click', (e) => {
      const btn = e.target.closest('.sim-quick-btn');
      if (!btn) return;
      const opt = btn.getAttribute('data-opt');
      if (opt) handleOption(opt);
    });
  }

  function handleTextInput() {
    const val = textInput.value.trim();
    if (!val || isTyping) return;
    textInput.value = '';

    appendUserBubble(val);
    showTyping();

    const lower = val.toLowerCase();
    setTimeout(() => {
      if (lower.includes('price') || lower.includes('cost') || lower.includes('plan')) {
        handleOption('pricing');
      } else if (lower.includes('service') || lower.includes('feature') || lower.includes('what')) {
        handleOption('services');
      } else if (lower.includes('book') || lower.includes('call') || lower.includes('schedule') || lower.includes('meet')) {
        handleOption('booking');
      } else if (lower.includes('human') || lower.includes('support') || lower.includes('agent') || lower.includes('talk')) {
        handleOption('human');
      } else {
        appendBotBubble(`
          Thanks for messaging AUTOGRAM! This simulation automatically interprets intent and triggers customized flows. Choose an option below or request full access to test our platform live:
          <div style="margin-top: 8px;">
            <button class="sim-quick-btn" onclick="window.scrollToSection('getStarted')">Get Started with AUTOGRAM →</button>
          </div>
        `);
      }
    }, 700);
  }

  sendBtn.addEventListener('click', handleTextInput);
  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextInput();
    }
  });

  resetBtn.addEventListener('click', () => {
    chatCanvas.innerHTML = `
      <div class="sim-bubble-wrapper bot">
        <div class="sim-bubble-avatar">A</div>
        <div class="sim-bubble-content">
          <div class="sim-bubble">
            Hey! 👋 Welcome. How can we help you today?
          </div>
          <div class="sim-bubble-time">${getCurrentTime()} · Automated Initial Greeting</div>
        </div>
      </div>
    `;
    textInput.value = '';
  });
}

/* =========================================================================
   4. AUTOMATION FLOW VISUAL ANIMATION
   ========================================================================= */
function initFlowVisual() {
  const nodes = document.querySelectorAll('.flow-node-item');
  if (nodes.length === 0) return;

  let activeIndex = 0;
  setInterval(() => {
    nodes.forEach((node, i) => {
      if (i === activeIndex) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });
    activeIndex = (activeIndex + 1) % nodes.length;
  }, 2200);
}

/* =========================================================================
   5. PRICING TIER SELECTOR
   ========================================================================= */
function initPricingSelect() {
  const btns = document.querySelectorAll('.btn-select-tier');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tier = btn.getAttribute('data-tier') || 'GROWTH';
      const tierSelect = document.getElementById('selectedTier');
      if (tierSelect) {
        tierSelect.value = tier;
      }
      window.scrollToSection('getStarted');
    });
  });
}

/* =========================================================================
   6. FAQ ACCORDION
   ========================================================================= */
function initFAQAccordion() {
  const rows = document.querySelectorAll('.faq-row');
  rows.forEach(row => {
    const trigger = row.querySelector('.faq-trigger');
    const content = row.querySelector('.faq-content');

    trigger.addEventListener('click', () => {
      const isOpen = row.classList.contains('open');

      rows.forEach(r => {
        if (r !== row) {
          r.classList.remove('open');
          const t = r.querySelector('.faq-trigger');
          const c = r.querySelector('.faq-content');
          if (t) t.setAttribute('aria-expanded', 'false');
          if (c) c.style.maxHeight = null;
        }
      });

      if (isOpen) {
        row.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = null;
      } else {
        row.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/* =========================================================================
   7. LEAD CAPTURE / GET STARTED FORM (AUTOGRAM API)
   ========================================================================= */
function initLeadCaptureForm() {
  const form = document.getElementById('autogramForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const btnLabel = document.getElementById('btnLabel');
  const banner = document.getElementById('apiFeedbackBanner');
  const bannerTitle = document.getElementById('bannerTitle');
  const bannerMsg = document.getElementById('bannerMsg');

  const nameInput = document.getElementById('fullName');
  const bizInput = document.getElementById('businessName');
  const emailInput = document.getElementById('workEmail');
  const igInput = document.getElementById('instagramHandle');
  const bizTypeInput = document.getElementById('businessType');
  const tierSelect = document.getElementById('selectedTier');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function setErr(el, msg) {
    el.classList.add('error');
    const err = document.getElementById(`${el.id}Err`);
    if (err) {
      err.textContent = msg;
      err.classList.add('show');
    }
  }

  function clearErr(el) {
    el.classList.remove('error');
    const err = document.getElementById(`${el.id}Err`);
    if (err) {
      err.textContent = '';
      err.classList.remove('show');
    }
  }

  [nameInput, bizInput, emailInput, igInput, bizTypeInput].forEach(inp => {
    if (inp) inp.addEventListener('input', () => clearErr(inp));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let hasErr = false;

    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      setErr(nameInput, 'Please enter your full name.');
      hasErr = true;
    }

    if (!bizInput.value.trim() || bizInput.value.trim().length < 2) {
      setErr(bizInput, 'Please enter your brand or business name.');
      hasErr = true;
    }

    if (!validateEmail(emailInput.value)) {
      setErr(emailInput, 'Please enter a valid work email.');
      hasErr = true;
    }

    let handle = igInput.value.trim();
    if (!handle || handle.length < 2) {
      setErr(igInput, 'Please enter your Instagram handle (e.g. @yourbrand).');
      hasErr = true;
    }

    if (!bizTypeInput.value) {
      setErr(bizTypeInput, 'Please select your industry category.');
      hasErr = true;
    }

    const checkedBoxes = Array.from(document.querySelectorAll('input[name="modules"]:checked')).map(c => c.value);
    if (checkedBoxes.length === 0) {
      const modErr = document.getElementById('modulesErr');
      if (modErr) {
        modErr.textContent = 'Please select at least one automation module.';
        modErr.classList.add('show');
      }
      hasErr = true;
    } else {
      const modErr = document.getElementById('modulesErr');
      if (modErr) modErr.classList.remove('show');
    }

    if (hasErr) return;

    const payload = {
      fullName: nameInput.value.trim(),
      businessName: bizInput.value.trim(),
      email: emailInput.value.trim(),
      instagramUsername: handle.startsWith('@') ? handle : `@${handle}`,
      businessType: bizTypeInput.value,
      requirements: checkedBoxes,
      pricingTier: tierSelect ? tierSelect.value : 'GROWTH'
    };

    submitBtn.disabled = true;
    btnLabel.textContent = 'Submitting Request...';
    banner.style.display = 'none';

    try {
      const res = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        banner.className = 'api-feedback-banner success';
        bannerTitle.textContent = 'AUTOGRAM Consultation Confirmed';
        bannerMsg.innerHTML = `
          <strong>Reference ID:</strong> <code>${data.referenceId}</code><br>
          ${escapeHtml(data.message)}<br><br>
          <span style="font-size: 0.85rem; color: var(--yellow-primary);">
            ✓ A customized Instagram workflow blueprint has been dispatched to <strong>${escapeHtml(payload.email)}</strong>.
          </span>
        `;
        banner.style.display = 'block';
        form.reset();
        banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        banner.className = 'api-feedback-banner error';
        bannerTitle.textContent = 'Submission Incomplete';
        bannerMsg.textContent = data.message || 'Please verify the highlighted fields.';
        banner.style.display = 'block';
      }
    } catch (err) {
      banner.className = 'api-feedback-banner error';
      bannerTitle.textContent = 'Backend Offline';
      bannerMsg.innerHTML = `
        Unable to communicate with <code>/api/lead-capture</code>.<br>
        Ensure the server is running on port 3001 (<code>npm start</code>) to save leads.
      `;
      banner.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      btnLabel.textContent = 'Request AUTOGRAM Consultation';
    }
  });
}

/* =========================================================================
   8. UTILITIES
   ========================================================================= */
window.scrollToSection = function(id) {
  const el = document.getElementById(id);
  if (el) {
    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 74;
    const targetPos = el.getBoundingClientRect().top + window.pageYOffset - (navHeight + 10);
    window.scrollTo({ top: targetPos, behavior: 'smooth' });
  }
};

function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
