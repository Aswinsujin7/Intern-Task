/**
 * AUTOGRAM - INSTAGRAM DM AUTOMATION ENGINE
 * Interactive Chat Simulator, Workflow Controller, Form Validation & Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initChatSimulator();
  initWorkflowSteps();
  initFeatureCards();
  initPricingTierSelect();
  initFAQAccordion();
  initLeadCaptureForm();
});

/* =========================================================================
   1. NAVBAR & NAVIGATION
   ========================================================================= */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky Navbar on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateScrollSpy();
  }, { passive: true });

  // Mobile Menu Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', false);
      });
    });
  }

  // Scrollspy
  function updateScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 120;

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
   2. INTERACTIVE CHAT SIMULATOR (Meta Instagram-style DM Engine)
   ========================================================================= */
function initChatSimulator() {
  const chatCanvas = document.getElementById('simChatCanvas');
  const textInput = document.getElementById('simTextInput');
  const sendBtn = document.getElementById('simSendBtn');
  const resetBtn = document.getElementById('simResetBtn');
  const soundToggleBtn = document.getElementById('simSoundToggle');
  const quickOptionsContainer = document.getElementById('simQuickOptions');

  if (!chatCanvas) return;

  let soundEnabled = true;
  let isTyping = false;

  // Web Audio Synthesized Chime (Self-contained, no external asset needed)
  function playChime(type = 'receive') {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'send') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else {
        osc.frequency.setValueAtTime(580, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch (e) {
      // AudioContext may be restricted by browser policy before first interaction
    }
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundToggleBtn.innerHTML = soundEnabled 
        ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> Sound: ON`
        : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg> Sound: MUTED`;
    });
  }

  function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  }

  function appendUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'sim-bubble-wrapper user';
    bubble.innerHTML = `
      <div class="sim-bubble-content">
        <div class="sim-bubble">${escapeHtml(text)}</div>
        <div class="sim-bubble-time">${getCurrentTime()} · Sent</div>
      </div>
    `;
    chatCanvas.appendChild(bubble);
    chatCanvas.scrollTop = chatCanvas.scrollHeight;
    playChime('send');
  }

  function showTypingIndicator() {
    isTyping = true;
    const indicator = document.createElement('div');
    indicator.className = 'sim-bubble-wrapper bot';
    indicator.id = 'simTypingIndicator';
    indicator.innerHTML = `
      <div class="sim-bubble-avatar">D</div>
      <div class="sim-bubble-content">
        <div class="sim-typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    chatCanvas.appendChild(indicator);
    chatCanvas.scrollTop = chatCanvas.scrollHeight;
  }

  function removeTypingIndicator() {
    isTyping = false;
    const indicator = document.getElementById('simTypingIndicator');
    if (indicator) indicator.remove();
  }

  function appendBotMessage(htmlContent) {
    removeTypingIndicator();
    const bubble = document.createElement('div');
    bubble.className = 'sim-bubble-wrapper bot';
    bubble.innerHTML = `
      <div class="sim-bubble-avatar">D</div>
      <div class="sim-bubble-content">
        <div class="sim-bubble">${htmlContent}</div>
        <div class="sim-bubble-time">${getCurrentTime()} · Automated Instant Reply</div>
      </div>
    `;
    chatCanvas.appendChild(bubble);
    chatCanvas.scrollTop = chatCanvas.scrollHeight;
    playChime('receive');
  }

  // Handle preset option clicks
  function handleOptionSelect(optionKey) {
    if (isTyping) return;

    if (optionKey === 'services') {
      appendUserMessage('Explore Services');
      showTypingIndicator();
      setTimeout(() => {
        appendBotMessage(`
          <strong>⚡ AUTOGRAM Instagram Automation Modules:</strong><br>
          We engineer enterprise-grade conversational workflows using the official Meta Graph API:
          <div class="sim-card-interactive">
            <div class="sim-service-item">🎯 <span><strong>Keyword Triggers:</strong> Instant link & lead delivery when users DM specific words.</span></div>
            <div class="sim-service-item">💬 <span><strong>Comment-to-DM:</strong> Auto-reply to Reel comments with a private direct message.</span></div>
            <div class="sim-service-item">📋 <span><strong>Lead Capture:</strong> Conversational email & phone validation synced directly to your CRM.</span></div>
            <div class="sim-service-item">🔄 <span><strong>Automated Routing:</strong> Instant categorization and smart tag routing.</span></div>
            <div class="sim-service-item">🤖 <span><strong>Intelligent FAQ:</strong> 24/7 instant answers to pricing, hours & shipping queries.</span></div>
          </div>
          <div style="margin-top: 10px;">
            <button class="sim-quick-btn" onclick="scrollToSection('leadCapture')">Request Workflow Consultation →</button>
          </div>
        `);
      }, 700);

    } else if (optionKey === 'pricing') {
      appendUserMessage('Pricing');
      showTypingIndicator();
      setTimeout(() => {
        appendBotMessage(`
          <strong>💼 Investment & Automation Tiers:</strong><br>
          Transparent, modular pricing designed to scale with your inbound conversation volume:
          <div class="sim-card-interactive">
            <div class="sim-service-item">🚀 <span><strong>Starter:</strong> Up to 10 automated keyword triggers & welcome flows.</span></div>
            <div class="sim-service-item">⭐ <span><strong>Growth:</strong> Unlimited keywords, Comment-to-DM, CRM sync & human handoff.</span></div>
            <div class="sim-service-item">🏢 <span><strong>Business:</strong> Custom intent models, multi-account routing & SLA.</span></div>
          </div>
          <p style="margin-top: 8px; font-size: 0.84rem; color: var(--text-muted);">
            All plans operate 100% within Meta platform policies with zero shadowban risk.
          </p>
          <div style="margin-top: 10px;">
            <button class="sim-quick-btn" onclick="prefillPricing('Growth')">Get a Tailored Quote →</button>
          </div>
        `);
      }, 750);

    } else if (optionKey === 'booking') {
      appendUserMessage('Book a Call');
      showTypingIndicator();
      setTimeout(() => {
        appendBotMessage(`
          <strong>📅 Schedule a 15-Minute Strategy Call:</strong><br>
          Pick a preferred simulated time slot below to audit your Instagram workflow with our automation architects:
          <div class="sim-slots-grid">
            <button class="sim-slot-btn" onclick="window.simConfirmSlot('Tomorrow, 2:00 PM EST')">Tomorrow · 2:00 PM</button>
            <button class="sim-slot-btn" onclick="window.simConfirmSlot('Thursday, 10:30 AM EST')">Thursday · 10:30 AM</button>
            <button class="sim-slot-btn" onclick="window.simConfirmSlot('Friday, 3:30 PM EST')">Friday · 3:30 PM</button>
            <button class="sim-slot-btn" onclick="window.simConfirmSlot('Next Monday, 11:00 AM EST')">Monday · 11:00 AM</button>
          </div>
        `);
      }, 800);

    } else if (optionKey === 'support') {
      appendUserMessage('Talk to Support');
      showTypingIndicator();
      setTimeout(() => {
        appendBotMessage(`
          <strong>🔄 Initiating Live Human Handoff Protocol...</strong><br>
          Automation is temporarily paused for this thread. Connecting you to a live support engineer at AUTOGRAM.
          <div class="sim-card-interactive" style="border-color: #4ade80;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #4ade80;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 8px #4ade80;"></span>
              <strong>Active Agent Assigned:</strong> Marcus Vance (Solutions Lead)
            </div>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 6px;">
              Average wait time: &lt; 2 minutes. What questions can Marcus answer about your infrastructure?
            </p>
          </div>
          <div style="margin-top: 10px;">
            <button class="sim-quick-btn" onclick="scrollToSection('leadCapture')">Leave Contact Details for Callback →</button>
          </div>
        `);
      }, 800);
    }
  }

  // Handle slot reservation click
  window.simConfirmSlot = function(slotTime) {
    if (isTyping) return;
    appendUserMessage(`Selected: ${slotTime}`);
    showTypingIndicator();
    setTimeout(() => {
      appendBotMessage(`
        <strong>✅ Strategy Call Slot Held! (${slotTime})</strong><br>
        To confirm your reservation and allow our team to prepare a custom Instagram funnel teardown for your brand, please submit your handle and requirements in the consultation form below.
        <div style="margin-top: 10px;">
          <button class="sim-quick-btn" onclick="scrollToSection('leadCapture')">Jump to Consultation Form →</button>
        </div>
      `);
    }, 700);
  };

  // Quick button listener delegation
  quickOptionsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.sim-quick-btn');
    if (!btn) return;
    const option = btn.getAttribute('data-option');
    if (option) {
      handleOptionSelect(option);
    }
  });

  // Custom User Input handling
  function sendUserCustomInput() {
    const rawVal = textInput.value.trim();
    if (!rawVal || isTyping) return;

    textInput.value = '';
    appendUserMessage(rawVal);
    showTypingIndicator();

    const lower = rawVal.toLowerCase();

    setTimeout(() => {
      if (lower.includes('price') || lower.includes('cost') || lower.includes('quote') || lower.includes('plan')) {
        handleOptionSelect('pricing');
      } else if (lower.includes('service') || lower.includes('feature') || lower.includes('work') || lower.includes('what')) {
        handleOptionSelect('services');
      } else if (lower.includes('book') || lower.includes('call') || lower.includes('meet') || lower.includes('schedule') || lower.includes('demo')) {
        handleOptionSelect('booking');
      } else if (lower.includes('support') || lower.includes('help') || lower.includes('human') || lower.includes('agent') || lower.includes('talk')) {
        handleOptionSelect('support');
      } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
        appendBotMessage(`
          Hello! 👋 Great to connect. Are you looking to automate your Instagram DMs for lead capture, customer support, or Reel comment engagement? Choose an option below to test our capabilities!
        `);
      } else {
        appendBotMessage(`
          Thanks for reaching out! In a live deployment, this query is processed via Meta-approved NLP intent matching. You can also explore our core workflows or request a customized setup below:
          <div style="margin-top: 8px;">
            <button class="sim-quick-btn" onclick="scrollToSection('leadCapture')">Speak With an Automation Architect →</button>
          </div>
        `);
      }
    }, 800);
  }

  sendBtn.addEventListener('click', sendUserCustomInput);
  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendUserCustomInput();
    }
  });

  // Reset Chat Simulator
  resetBtn.addEventListener('click', () => {
    chatCanvas.innerHTML = `
      <div class="sim-bubble-wrapper bot">
        <div class="sim-bubble-avatar">A</div>
        <div class="sim-bubble-content">
          <div class="sim-bubble">
            Hi there! 👋 Welcome to AUTOGRAM. How can we help you today?
          </div>
          <div class="sim-bubble-time">${getCurrentTime()} · Automated Initial Greeting</div>
        </div>
      </div>
    `;
    textInput.value = '';
  });
}

/* =========================================================================
   3. HOW IT WORKS WORKFLOW INTERACTIVITY
   ========================================================================= */
function initWorkflowSteps() {
  const stepCards = document.querySelectorAll('.workflow-step-card');
  stepCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      stepCards.forEach(c => c.style.opacity = '0.7');
      card.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => {
      stepCards.forEach(c => c.style.opacity = '1');
    });
  });
}

/* =========================================================================
   4. FEATURE CARDS MICRO-PREVIEWS
   ========================================================================= */
function initFeatureCards() {
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('h3')?.textContent || 'Feature';
      const toast = document.createElement('div');
      toast.className = 'glass-card';
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 9999;
        padding: 14px 22px;
        border-color: var(--accent-cyan);
        box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(0,207,255,0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.88rem;
        color: var(--text-white);
        animation: fadeInMsg 0.3s ease;
      `;
      toast.innerHTML = `
        <span style="color: var(--accent-cyan); font-size: 1.1rem;">⚡</span>
        <div><strong>${title}</strong>: Built strictly compliant with Meta Graph API policies.</div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
      }, 3000);
    });
  });
}

/* =========================================================================
   5. PRICING TIER SELECTOR & PREFILL
   ========================================================================= */
function initPricingTierSelect() {
  const quoteBtns = document.querySelectorAll('.btn-quote-tier');
  quoteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tier = btn.getAttribute('data-tier') || 'Growth';
      prefillPricing(tier);
    });
  });
}

window.prefillPricing = function(tierName) {
  const pricingSelect = document.getElementById('preferredTier');
  if (pricingSelect) {
    pricingSelect.value = tierName;
  }
  scrollToSection('leadCapture');
};

/* =========================================================================
   6. FAQ ACCORDION
   ========================================================================= */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    const answerPanel = item.querySelector('.faq-answer-panel');

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherBtn = otherItem.querySelector('.faq-question-btn');
          const otherPanel = otherItem.querySelector('.faq-answer-panel');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherPanel) otherPanel.style.maxHeight = null;
        }
      });

      // Toggle current
      if (isActive) {
        item.classList.remove('active');
        questionBtn.setAttribute('aria-expanded', 'false');
        answerPanel.style.maxHeight = null;
      } else {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
        answerPanel.style.maxHeight = answerPanel.scrollHeight + 'px';
      }
    });
  });
}

/* =========================================================================
   7. LEAD CAPTURE FORM (Backend API with Full Validation)
   ========================================================================= */
function initLeadCaptureForm() {
  const form = document.getElementById('consultationForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const notificationBox = document.getElementById('formNotification');
  const notificationTitle = document.getElementById('notificationTitle');
  const notificationMessage = document.getElementById('notificationMessage');

  // Input elements
  const fullNameInput = document.getElementById('fullName');
  const businessNameInput = document.getElementById('businessName');
  const emailInput = document.getElementById('email');
  const instagramInput = document.getElementById('instagramUsername');
  const businessTypeInput = document.getElementById('businessType');
  const preferredTierInput = document.getElementById('preferredTier');
  const requirementsNotesInput = document.getElementById('requirementsNotes');

  // Helper validation
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function setFieldError(field, message) {
    field.classList.add('error');
    const errorEl = document.getElementById(`${field.id}Error`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearFieldError(field) {
    field.classList.remove('error');
    const errorEl = document.getElementById(`${field.id}Error`);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  // Clear errors on input
  [fullNameInput, businessNameInput, emailInput, instagramInput, businessTypeInput].forEach(field => {
    if (field) {
      field.addEventListener('input', () => clearFieldError(field));
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let hasErrors = false;

    // Validate Full Name
    if (!fullNameInput.value.trim() || fullNameInput.value.trim().length < 2) {
      setFieldError(fullNameInput, 'Please enter your full name (at least 2 characters).');
      hasErrors = true;
    } else {
      clearFieldError(fullNameInput);
    }

    // Validate Business Name
    if (!businessNameInput.value.trim() || businessNameInput.value.trim().length < 2) {
      setFieldError(businessNameInput, 'Please enter your registered business or brand name.');
      hasErrors = true;
    } else {
      clearFieldError(businessNameInput);
    }

    // Validate Email
    if (!validateEmail(emailInput.value)) {
      setFieldError(emailInput, 'Please enter a valid work email address.');
      hasErrors = true;
    } else {
      clearFieldError(emailInput);
    }

    // Validate Instagram Handle
    let igVal = instagramInput.value.trim();
    if (!igVal || igVal.length < 2) {
      setFieldError(instagramInput, 'Please enter your Instagram username (e.g. @yourbrand).');
      hasErrors = true;
    } else {
      clearFieldError(instagramInput);
    }

    // Validate Business Type
    if (!businessTypeInput.value) {
      setFieldError(businessTypeInput, 'Please select your business category.');
      hasErrors = true;
    } else {
      clearFieldError(businessTypeInput);
    }

    // Gather selected requirement checkboxes
    const checkedBoxes = Array.from(document.querySelectorAll('input[name="reqModules"]:checked')).map(cb => cb.value);
    const customNotes = requirementsNotesInput.value.trim();
    const requirementsCombined = [
      ...checkedBoxes,
      ...(customNotes ? [`Notes: ${customNotes}`] : [])
    ];

    if (requirementsCombined.length === 0) {
      const reqBoxGroup = document.getElementById('reqBoxError');
      if (reqBoxGroup) {
        reqBoxGroup.textContent = 'Please select at least one automation module or describe your goals.';
        reqBoxGroup.classList.add('visible');
      }
      hasErrors = true;
    } else {
      const reqBoxGroup = document.getElementById('reqBoxError');
      if (reqBoxGroup) reqBoxGroup.classList.remove('visible');
    }

    if (hasErrors) {
      return;
    }

    // Prepare payload
    const payload = {
      fullName: fullNameInput.value.trim(),
      businessName: businessNameInput.value.trim(),
      email: emailInput.value.trim(),
      instagramUsername: igVal.startsWith('@') ? igVal : `@${igVal}`,
      businessType: businessTypeInput.value,
      requirements: requirementsCombined,
      pricingTier: preferredTierInput ? preferredTierInput.value : 'Not specified'
    };

    // UI Loading State
    submitBtn.disabled = true;
    btnText.textContent = 'Submitting Request...';
    btnSpinner.style.display = 'inline-block';
    notificationBox.style.display = 'none';

    try {
      // POST request to real Node.js backend endpoint
      const response = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Genuine success from backend
        notificationBox.className = 'form-notification success';
        notificationTitle.textContent = 'Consultation Request Confirmed';
        notificationMessage.innerHTML = `
          <strong>Reference ID:</strong> <code>${data.referenceId}</code><br>
          ${escapeHtml(data.message)}<br><br>
          <span style="font-size: 0.85rem; color: #86efac;">
            ✓ We sent a calendar invitation and preparatory audit checklist to <strong>${escapeHtml(payload.email)}</strong>.
          </span>
        `;
        notificationBox.style.display = 'block';
        form.reset();

        // Scroll notification into view smoothly
        notificationBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      } else {
        // Server validation error
        notificationBox.className = 'form-notification error';
        notificationTitle.textContent = 'Submission Failed';
        notificationMessage.textContent = data.message || 'The server could not process your consultation request. Please check the form fields.';
        notificationBox.style.display = 'block';
      }

    } catch (networkError) {
      // Network failure or static file viewer (Comply with: "Do not show a fake success message if the form is not connected to a working backend")
      notificationBox.className = 'form-notification error';
      notificationTitle.textContent = 'Backend Connection Offline';
      notificationMessage.innerHTML = `
        Unable to communicate with the consultation API at <code>/api/lead-capture</code>.<br>
        <strong>Technical Note:</strong> Please ensure the AUTOGRAM Node.js server is running (<code>node server.js</code> or <code>npm start</code> on port 3001) to process consultation leads.<br>
        Alternatively, email our engineering team directly at <a href="mailto:hello@autogram.io" style="color: var(--accent-cyan); text-decoration: underline;">hello@autogram.io</a>.
      `;
      notificationBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Request a Consultation';
      btnSpinner.style.display = 'none';
    }
  });
}

/* =========================================================================
   8. UTILITIES
   ========================================================================= */
window.scrollToSection = function(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
