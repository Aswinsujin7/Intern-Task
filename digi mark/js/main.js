/**
 * NEXUS DIGITAL MARKETING AGENCY
 * Interactive Engine: Video Fallback, Canvas HUD, Portfolios, Calculators, Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all interactive modules
  initHeroVideo();
  initHeroSculptureParallax();
  initHeroCanvas();
  initNavbar();
  initMobileMenu();
  initServicesModal();
  initRoiCalculator();
  initPortfolioFilter();
  initPortfolioModal();
  initFaqAccordion();
  initEnquiryForm();
  initBackToTop();
});

/* --------------------------------------------------------------------------
   1. HERO VIDEO & RESILIENT FALLBACK HANDLER
   -------------------------------------------------------------------------- */
function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  // Guarantee required autoplay attributes
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  // Attempt autoplay
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.warn('Hero video autoplay deferred by browser policy:', error);
      // Resume on first user touch/click/scroll gesture
      const resumeVideo = () => {
        if (video.paused) {
          video.play().catch(() => {});
        }
        ['touchstart', 'click', 'scroll'].forEach(evt => {
          window.removeEventListener(evt, resumeVideo);
        });
      };
      ['touchstart', 'click', 'scroll'].forEach(evt => {
        window.addEventListener(evt, resumeVideo, { passive: true });
      });
    });
  }

  // Handle video error gracefully
  video.addEventListener('error', (e) => {
    console.warn('Hero background video notice:', e);
  });
}

/* --------------------------------------------------------------------------
   1b. HERO 3D SCULPTURE MOUSE PARALLAX & AMBIENT DEPTH
   -------------------------------------------------------------------------- */
function initHeroSculptureParallax() {
  const hero = document.getElementById('hero');
  const stage = document.getElementById('heroSculptureStage');
  const innerBox = document.querySelector('.sculpture-inner-box');
  const halo = document.querySelector('.sculpture-glow-halo');
  const badgeSeo = document.querySelector('.badge-seo');
  const badgeAds = document.querySelector('.badge-ads');

  if (!hero || !innerBox) return;

  // Check prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let currentTiltX = 0, currentTiltY = 0;
  let targetTiltX = 0, targetTiltY = 0;
  let isHovered = false;

  hero.addEventListener('mousemove', (e) => {
    isHovered = true;
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    // Smooth tilt angles
    targetTiltY = x * 14;  // rotateY -14 to +14 deg
    targetTiltX = -y * 11; // rotateX -11 to +11 deg
  });

  hero.addEventListener('mouseleave', () => {
    isHovered = false;
    targetTiltX = 0;
    targetTiltY = 0;
  });

  // RAF loop for smooth lerp damping
  function updateParallax() {
    currentTiltX += (targetTiltX - currentTiltX) * 0.08;
    currentTiltY += (targetTiltY - currentTiltY) * 0.08;

    if (Math.abs(targetTiltX - currentTiltX) > 0.01 || Math.abs(targetTiltY - currentTiltY) > 0.01 || isHovered) {
      innerBox.style.transform = `perspective(1000px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) translateZ(8px)`;

      if (halo) {
        halo.style.transform = `translate(${(currentTiltY * -1.5).toFixed(1)}px, ${(currentTiltX * 1.5).toFixed(1)}px) scale(${1 + Math.abs(currentTiltY) * 0.006})`;
      }

      if (badgeSeo) {
        badgeSeo.style.transform = `translate3d(${(currentTiltY * 1.2).toFixed(1)}px, ${(currentTiltX * -1.2).toFixed(1)}px, 35px)`;
      }

      if (badgeAds) {
        badgeAds.style.transform = `translate3d(${(currentTiltY * -1.2).toFixed(1)}px, ${(currentTiltX * 1.2).toFixed(1)}px, 35px)`;
      }
    }

    requestAnimationFrame(updateParallax);
  }

  requestAnimationFrame(updateParallax);
}

/* --------------------------------------------------------------------------
   2. HERO CANVAS: HOLOGRAPHIC MARKETING HUD & NEURAL PARTICLES
   -------------------------------------------------------------------------- */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  // Check prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle Class: represents data packets / marketing nodes
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.2 + 0.8;
      this.speedX = (Math.random() - 0.5) * 0.7;
      this.speedY = (Math.random() - 0.5) * 0.7;
      // Exact Palette: Neon Cyan (#00CFFF), Electric Blue (#006BFF), Heading White (#F5F7FF)
      const colors = ['#00CFFF', '#006BFF', '#F5F7FF', '#67e8f9', '#38bdf8'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Mouse interactivity
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = dx / distance;
          const directionY = dy / distance;
          this.x -= directionX * force * 2;
          this.y -= directionY * force * 2;
        }
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  // Generate particles based on screen width
  const count = Math.min(Math.floor(window.innerWidth / 18), 70);
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw network connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const opacity = (1 - dist / 130) * 0.22;
          ctx.strokeStyle = '#00CFFF';
          ctx.globalAlpha = opacity;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.restore();
        }
      }
      particles[i].update();
      particles[i].draw();
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------------------------------
   3. NAVBAR SCROLL & ACTIVE LINK TRACKER
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateNavbar() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlight
    let currentSection = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateNavbar);
  updateNavbar();
}

/* --------------------------------------------------------------------------
   4. MOBILE NAVIGATION MENU
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navCenterMenu') || document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-center-menu .nav-link, .nav-menu .nav-link, .nav-link');

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });
}

/* --------------------------------------------------------------------------
   5. SERVICES DETAIL MODAL
   -------------------------------------------------------------------------- */
const servicesData = {
  seo: {
    title: 'SEO (Search Engine Optimization)',
    subtitle: 'Dominate Organic Search Rankings & Drive Qualified High-Intent Traffic',
    icon: '🔍',
    overview: 'Our comprehensive search engine optimization methodology combines technical site architecture, semantic content modeling, high-authority link acquisition, and programmatic keyword mapping to turn organic search into your most profitable revenue channel.',
    deliverables: [
      'Deep Technical SEO & Core Web Vitals Audit',
      'Competitor Keyword Gap & Revenue Intent Analysis',
      'On-Page Optimization (Metadata, Schema Markup, Entities)',
      'High-Authority Digital PR & Backlink Architecture',
      'Local & International Multi-Region SEO Setup',
      'Weekly Keyword Position & Organic Revenue Reporting'
    ],
    timeline: '3 - 6 Months Continuous Growth',
    expectedOutcome: 'Average 240% increase in organic leads and top-3 ranking positions for target commercial queries.'
  },
  social: {
    title: 'Social Media Marketing',
    subtitle: 'Build an Obsessed Community & Amplify Organic Omnichannel Reach',
    icon: '📱',
    overview: 'We craft viral, brand-defining social campaigns across Instagram, TikTok, LinkedIn, YouTube, and X. From thumb-stopping short-form video reels to strategic influencer collaborations and community management, we transform casual scrollers into loyal brand evangelists.',
    deliverables: [
      'Tailored Social Media Growth & Tone Strategy',
      'High-Converting Creative Assets (Reels, TikToks, Carousels)',
      'Influencer Vetting, Outreach & Contract Management',
      'Community Engagement & Reactive Trend Jacking',
      'Multi-Platform Content Calendar & Scheduling',
      'Sentiment Analysis & Engagement Attribution Reporting'
    ],
    timeline: 'Ongoing Monthly Retainer',
    expectedOutcome: '3x to 5x increase in qualified social engagement and consistent follower pipeline growth.'
  },
  ppc: {
    title: 'Google Ads & Paid Search (PPC)',
    subtitle: 'Precision Paid Advertising Generating Maximum Return on Ad Spend (ROAS)',
    icon: '🎯',
    overview: 'Stop burning ad dollars on low-intent traffic. Our certified Google Ads and Performance Max specialists design granular, high-converting paid search and display funnels with intelligent bidding, audience segmentation, and daily negative keyword hygiene.',
    deliverables: [
      'Google Search, Display & Performance Max Setup',
      'High-Converting Landing Page Design & CRO Review',
      'Granular Negative Keyword Lists & Search Term Hygiene',
      'Smart Bidding Integration & Value-Based Conversion Tracking',
      'Retargeting & Dynamic Product Ads (Shopping / PMax)',
      'Real-Time Attribution Dashboard & Budget Optimization'
    ],
    timeline: 'Instant Traffic (1 - 2 Weeks Onboarding)',
    expectedOutcome: 'Target ROAS of 4.5x - 7x and a measurable reduction in customer acquisition cost (CAC).'
  },
  web: {
    title: 'Website Design & Development',
    subtitle: 'Stunning, Lightning-Fast, High-Conversion Digital Flagships',
    icon: '💻',
    overview: 'Your website is the heart of your digital presence. We build modern, blazing-fast, mobile-first websites designed with dark luxury aesthetics, subtle micro-interactions, flawless responsive layouts, and conversion-optimized architectures.',
    deliverables: [
      'Custom UX/UI Wireframes & High-Fidelity Prototypes',
      'Modern Jamstack / HTML5 / React / WordPress Engineering',
      'Full Mobile & Tablet Responsive Optimization',
      'Conversion Rate Optimization (CRO) Heatmap Integration',
      'Ultra-Fast Page Speed Optimization (95+ Google Lighthouse)',
      'CMS Training & 60-Day Post-Launch Technical Support'
    ],
    timeline: '4 - 8 Weeks Deployment',
    expectedOutcome: 'Up to 65% improvement in visitor-to-lead conversion rates and sub-second load times.'
  },
  content: {
    title: 'Content Marketing & Copywriting',
    subtitle: 'Thought Leadership & Content That Converts Prospects Into Buyers',
    icon: '✍️',
    overview: 'Content that informs, inspires, and converts. We produce data-backed whitepapers, viral blog series, authoritative industry guides, and high-conversion sales copy that positions your brand as the undisputed leader in your industry.',
    deliverables: [
      'Content Pillar & Thematic Editorial Roadmap',
      'SEO-Optimized Long-Form Articles & Case Studies',
      'Gated eBooks, Whitepapers & Lead Magnets',
      'Email Newsletter Copywriting & Drip Sequences',
      'Interactive Content (Calculators, Quizzes, Templates)',
      'Content Syndication & Repurposing for Social Feeds'
    ],
    timeline: 'Bi-Weekly Content Cadence',
    expectedOutcome: 'Substantial boost in domain authority, brand affinity, and organic referral leads.'
  },
  branding: {
    title: 'Branding & Creative Graphic Design',
    subtitle: 'Iconic Brand Identity Systems That Command Premium Market Value',
    icon: '🎨',
    overview: 'Stand out from competitors with cohesive, high-end visual design. We develop complete brand style guides, 3D visual assets, modern logos, typography hierarchies, and premium creative collateral that make an unforgettable impression.',
    deliverables: [
      'Comprehensive Brand Strategy & Positioning Matrix',
      'Logo Suite (Primary, Secondary, Badges, Favicons)',
      'Typography, Color Palettes & Design Tokens Guide',
      '3D Visual Elements, Motion Graphics & Custom Iconography',
      'Digital & Print Collateral (Pitch Decks, Business Cards, Ads)',
      'Interactive Brand Guidelines Portal'
    ],
    timeline: '3 - 5 Weeks',
    expectedOutcome: 'Cohesive, premium brand perception enabling higher pricing power and instant recognition.'
  },
  email: {
    title: 'Email Marketing & Retention Loops',
    subtitle: 'Turn Subscribers Into Repeat Buyers With Automated Lifecycle Campaigns',
    icon: '📧',
    overview: 'Email remains the highest-ROI digital channel when done right. We build bespoke automated flows (welcome series, abandoned cart, churn win-back, VIP loyalty) and beautifully segmented newsletters that keep your audience engaged and spending.',
    deliverables: [
      'ESP Architecture Setup (Klaviyo, Mailchimp, ActiveCampaign)',
      'Custom Responsive HTML Email Template Design',
      'Behavioral Automated Trigger Flows & Lifecycle Segmentation',
      'Deliverability & Domain Warmup Optimization (DKIM/SPF/DMARC)',
      'A/B Subject Line & Offer Conversion Testing',
      'Cohort Retention & Revenue-per-Recipient Tracking'
    ],
    timeline: '2 - 3 Weeks Setup + Ongoing Optimization',
    expectedOutcome: 'Email generating 25% - 40% of total online revenue with consistent 35%+ open rates.'
  },
  video: {
    title: 'Video Marketing & Motion Production',
    subtitle: 'Cinematic Storytelling & Short-Form Video That Captivates Modern Audiences',
    icon: '🎬',
    overview: 'Video is the undisputed king of digital engagement. We script, produce, and edit high-impact commercial spots, product explainer animations, TikTok/Reels short-form UGC, and YouTube ads that stop the scroll and drive immediate action.',
    deliverables: [
      'Concept Ideation, Scriptwriting & Storyboarding',
      'Cinematic Editing, Color Grading & Sound Design',
      'Motion Graphics, 2D/3D Animated Infographics & Text Hooks',
      'Multi-Format Video Resizing (9:16, 1:1, 16:9)',
      'Captions, Subtitles & Accessibility Audio Compliance',
      'YouTube & Social Video SEO Optimization'
    ],
    timeline: '1 - 3 Weeks Per Video Package',
    expectedOutcome: 'Massive surge in viewer retention, social shares, and paid ad click-through rates.'
  },
  leadgen: {
    title: 'High-Intent Lead Generation',
    subtitle: 'Predictable Inbound Pipelines of Sales-Qualified Leads (SQLs)',
    icon: '⚡',
    overview: 'Fuel your sales team with decision-makers who are ready to buy. We combine hyper-targeted B2B outbound sequences, LinkedIn account-based marketing (ABM), intent data monitoring, and interactive lead magnets to book qualified calls directly into your calendar.',
    deliverables: [
      'Ideal Customer Profile (ICP) & Buyer Persona Blueprint',
      'Targeted Lead Scraping & Verified Contact Enrichment',
      'Multi-Touch Cold Email & LinkedIn ABM Sequences',
      'Interactive Lead Magnet & Quiz Funnel Development',
      'CRM Integration (HubSpot, Salesforce, Pipedrive)',
      'Guaranteed Monthly Qualified Sales Meetings'
    ],
    timeline: 'Monthly Retainer with Guaranteed Milestones',
    expectedOutcome: 'A predictable stream of 50 - 250+ vetted, warm B2B sales meetings every month.'
  },
  automation: {
    title: 'Marketing Automation & AI Workflows',
    subtitle: 'Streamline Repetitive Tasks & Scale Your Funnel With Autonomous AI Systems',
    icon: '🤖',
    overview: 'Eliminate human bottlenecks and scale without adding headcount. We build intelligent marketing automations using Zapier, Make, and custom AI agents to route leads in real-time, trigger personalized messaging, and automate multi-channel attribution reporting.',
    deliverables: [
      'Marketing Tech Stack Integration & API Webhooks',
      'Automated Lead Scoring, Routing & Instant SMS Alerts',
      'AI Chatbot & Conversational Assistant Deployment',
      'Automated Social Publishing & Cross-Platform Content Syndication',
      'Dynamic CRM Contact Updates & Deal Stage Transitions',
      'Custom Executive KPI Dashboard with Automated Email Summaries'
    ],
    timeline: '2 - 4 Weeks Architecture & Launch',
    expectedOutcome: 'Save 30+ hours per week of manual labor while decreasing lead response time to under 60 seconds.'
  }
};

function initServicesModal() {
  const modalOverlay = document.getElementById('serviceModal');
  const modalClose = document.getElementById('closeServiceModal');
  const learnMoreBtns = document.querySelectorAll('.service-learn-more');

  if (!modalOverlay) return;

  const modalTitle = document.getElementById('modalServiceTitle');
  const modalSubtitle = document.getElementById('modalServiceSubtitle');
  const modalIcon = document.getElementById('modalServiceIcon');
  const modalOverview = document.getElementById('modalServiceOverview');
  const modalDeliverables = document.getElementById('modalServiceDeliverables');
  const modalTimeline = document.getElementById('modalServiceTimeline');
  const modalOutcome = document.getElementById('modalServiceOutcome');
  const modalEnquireBtn = document.getElementById('modalServiceEnquireBtn');

  learnMoreBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceKey = btn.getAttribute('data-service');
      const data = servicesData[serviceKey];
      if (!data) return;

      modalTitle.textContent = data.title;
      modalSubtitle.textContent = data.subtitle;
      modalIcon.textContent = data.icon;
      modalOverview.textContent = data.overview;

      modalDeliverables.innerHTML = '';
      data.deliverables.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span style="color: var(--neon-cyan); margin-right: 8px;">✓</span> ${item}`;
        modalDeliverables.appendChild(li);
      });

      modalTimeline.textContent = data.timeline;
      modalOutcome.textContent = data.expectedOutcome;

      // Update CTA button to auto-select this service in the contact form
      modalEnquireBtn.onclick = () => {
        closeModal();
        preSelectService(serviceKey);
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      };

      openModal();
    });
  });

  function openModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });
}

// Helper to pre-select a service checkbox in the enquiry form
function preSelectService(serviceKey) {
  const checkbox = document.querySelector(`.service-pill-checkbox input[value="${serviceKey}"]`);
  if (checkbox) {
    checkbox.checked = true;
  }
}

/* --------------------------------------------------------------------------
   6. INTERACTIVE ROI CALCULATOR
   -------------------------------------------------------------------------- */
function initRoiCalculator() {
  const slider = document.getElementById('adBudgetSlider');
  const budgetDisplay = document.getElementById('budgetDisplay');
  const industrySelect = document.getElementById('industrySelect');

  const projectedTraffic = document.getElementById('calcTraffic');
  const projectedLeads = document.getElementById('calcLeads');
  const projectedRevenue = document.getElementById('calcRevenue');
  const projectedRoas = document.getElementById('calcRoas');

  if (!slider || !budgetDisplay) return;

  // Multipliers by industry
  const industryFactors = {
    ecommerce: { cpc: 1.2, convRate: 0.038, aov: 110, roas: 5.6 },
    b2b_saas: { cpc: 3.5, convRate: 0.045, aov: 4200, roas: 6.8 },
    fintech: { cpc: 2.8, convRate: 0.042, aov: 1850, roas: 6.2 },
    healthcare: { cpc: 2.1, convRate: 0.052, aov: 750, roas: 5.1 },
    realestate: { cpc: 2.9, convRate: 0.035, aov: 6500, roas: 7.2 },
    services: { cpc: 1.8, convRate: 0.048, aov: 1200, roas: 5.8 }
  };

  function updateCalculations() {
    const budget = parseFloat(slider.value);
    budgetDisplay.textContent = `$${budget.toLocaleString()}/mo`;

    const indKey = industrySelect ? industrySelect.value : 'ecommerce';
    const factors = industryFactors[indKey] || industryFactors.ecommerce;

    const clicks = Math.round(budget / factors.cpc);
    const leads = Math.max(Math.round(clicks * factors.convRate), 10);
    const estRevenue = Math.round(budget * factors.roas);

    if (projectedTraffic) projectedTraffic.textContent = `${(clicks * 4.5 / 1000).toFixed(1)}k+ Views`;
    if (projectedLeads) projectedLeads.textContent = `${leads.toLocaleString()} Qualified`;
    if (projectedRevenue) projectedRevenue.textContent = `$${estRevenue.toLocaleString()}`;
    if (projectedRoas) projectedRoas.textContent = `${factors.roas}x Average`;
  }

  slider.addEventListener('input', updateCalculations);
  if (industrySelect) {
    industrySelect.addEventListener('change', updateCalculations);
  }

  updateCalculations();
}

/* --------------------------------------------------------------------------
   7. PORTFOLIO FILTER TABS
   -------------------------------------------------------------------------- */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');

  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInUp 0.5s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   8. PORTFOLIO CASE STUDY DETAIL MODAL
   -------------------------------------------------------------------------- */
const portfolioData = {
  fintech: {
    title: 'Apex Fintech Bank: Scaling App Adoption & Conversion by 480%',
    client: 'Apex Fintech Solutions',
    metrics: '+480% Conversion Rate • 2.1M Active Users',
    summary: 'Apex needed to expand across international digital banking markets while lowering elevated cost per acquisition across competitive search auctions.',
    challenge: 'High customer churn during mobile KYC onboarding, saturated Google search bids, and strict regulatory compliance guidelines across tier-1 markets.',
    solution: 'We engineered an omnichannel growth engine combining high-intent Google Ads with interactive short-form video ads on TikTok and Meta, backed by an optimized 3-step onboarding flow.',
    results: [
      '480% increase in month-over-month account activations',
      '315% boost in new user acquisition velocity',
      '62% reduction in overall Cost Per Verified Account (CAC)',
      '2.1M+ newly activated debit cards within 9 months'
    ]
  },
  ecommerce: {
    title: 'Aura Luxury Fashion: 620% Quarterly Revenue Surge & Omnichannel Domination',
    client: 'Aura Fashion Group',
    metrics: '620% Revenue Surge • 415% ROAS Improvement',
    summary: 'A luxury apparel label with phenomenal products struggled to stand out in a crowded direct-to-consumer landscape.',
    challenge: 'Previous agency relied solely on broad Meta ads with declining ROAS (1.8x) and negligible automated retention loops.',
    solution: 'We rebuilt their entire advertising funnel with dynamic catalog ads, VIP creator collaborations, Klaviyo segmentation loops, and conversion-focused mobile landing pages.',
    results: [
      '620% QoQ revenue expansion ($12.5M to $90M run-rate)',
      'Average Order Value (AOV) increased by 3.5x',
      '280% reduction in Customer Acquisition Cost (CAC)',
      '415% improvement in blended multi-channel ROAS'
    ]
  },
  saas: {
    title: 'Aetheria AI SaaS: 520% SQL Pipeline Growth & 6.8x ROI',
    client: 'Aetheria Systems Enterprise',
    metrics: '520% Sales Qualified Leads • 6.8x Enterprise ROI',
    summary: 'An enterprise artificial intelligence platform needed to generate high-intent enterprise demos with Fortune 1000 CTOs and VPs of Engineering.',
    challenge: 'Lengthy 9-month sales cycles, complex technical value propositions, and low response rates from generic cold outreach.',
    solution: 'Implemented an Account-Based Marketing (ABM) strategy combining intent data scraping (Bombora), hyper-personalized LinkedIn campaigns, and interactive ROI calculators.',
    results: [
      '520% growth in Sales Qualified Leads (from 14k to 87k)',
      'Average deal size expanded by 340%',
      'Pipeline velocity accelerated by 45%',
      '6.8x return on marketing investment within 12 months'
    ]
  },
  social: {
    title: 'Pulse Viral Media: 12M Organic Impressions & Explosive Brand Loyalty',
    client: 'Pulse Consumer Tech',
    metrics: '12M Viral Impressions • 340% Audience Growth',
    summary: 'Pulse launched a next-generation wearable device requiring instant cultural buzz and mass mainstream awareness.',
    challenge: 'Zero initial social presence competing with well-entrenched legacy consumer electronics giants with 8-figure ad budgets.',
    solution: 'Architected a viral multi-platform creator swarm campaign across TikTok, Instagram Reels, and YouTube Shorts with trending audio hooks and UGC challenges.',
    results: [
      'Over 12M organic impressions within the first 30 days',
      '340% surge in organic social follower acquisition',
      '38,000+ pre-orders placed during the viral launch spike',
      'Ranked #1 trending consumer product in the tech category'
    ]
  }
};

function initPortfolioModal() {
  const modalOverlay = document.getElementById('caseStudyModal');
  const modalClose = document.getElementById('closeCaseStudyModal');
  const triggerBtns = document.querySelectorAll('.view-case-study-btn');

  if (!modalOverlay) return;

  const titleEl = document.getElementById('caseStudyTitle');
  const clientEl = document.getElementById('caseStudyClient');
  const metricsEl = document.getElementById('caseStudyMetrics');
  const summaryEl = document.getElementById('caseStudySummary');
  const challengeEl = document.getElementById('caseStudyChallenge');
  const solutionEl = document.getElementById('caseStudySolution');
  const resultsEl = document.getElementById('caseStudyResults');

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const studyKey = btn.getAttribute('data-study');
      const data = portfolioData[studyKey];
      if (!data) return;

      titleEl.textContent = data.title;
      clientEl.textContent = data.client;
      metricsEl.textContent = data.metrics;
      summaryEl.textContent = data.summary;
      challengeEl.textContent = data.challenge;
      solutionEl.textContent = data.solution;

      resultsEl.innerHTML = '';
      data.results.forEach(res => {
        const li = document.createElement('li');
        li.innerHTML = `<strong style="color: #10b981;">✓</strong> ${res}`;
        resultsEl.appendChild(li);
      });

      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });
}

/* --------------------------------------------------------------------------
   9. INTERACTIVE FAQ ACCORDION
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        otherAnswer.style.maxHeight = null;
        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked item
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   10. INTERACTIVE PROJECT ENQUIRY FORM & TOAST
   -------------------------------------------------------------------------- */
function initEnquiryForm() {
  const form = document.getElementById('projectEnquiryForm');
  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    // Basic Validation
    const name = form.querySelector('#clientName').value.trim();
    const email = form.querySelector('#clientEmail').value.trim();

    if (!name || !email) {
      showToast('Please fill in your name and a valid email address.', 'error');
      return;
    }

    // Checked services
    const checkedServices = Array.from(form.querySelectorAll('.service-pill-checkbox input:checked'))
      .map(cb => cb.value);

    // Simulate sending with loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin" style="width: 20px; height: 20px; margin-right: 8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" stroke-dasharray="32" stroke-linecap="round"/>
      </svg>
      Analyzing Your Project...
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      form.reset();

      // Show success toast
      showToast(`Thank you, ${name}! Your growth blueprint is being prepared. Our senior strategist will contact you within 2 business hours.`, 'success');
    }, 1200);
  });

  function showToast(message, type = 'success') {
    if (!toast) return;
    toastMessage.textContent = message;
    toast.style.borderColor = type === 'success' ? 'var(--neon-cyan)' : '#ef4444';
    toast.classList.add('active');

    setTimeout(() => {
      toast.classList.remove('active');
    }, 5500);
  }

  // Quick project modal (opened from hero "Start Your Project")
  const startProjectBtn = document.getElementById('startProjectHeroBtn');
  const quickModal = document.getElementById('quickProjectModal');
  const closeQuickModal = document.getElementById('closeQuickProjectModal');

  if (startProjectBtn && quickModal) {
    startProjectBtn.addEventListener('click', (e) => {
      // If user is on a desktop or prefers scrolling:
      // Smooth scroll to the contact form and focus the first input
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const input = document.getElementById('clientName');
          if (input) input.focus();
        }, 600);
      }
    });
  }

  // Newsletter form submission
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]').value;
      if (email) {
        showToast('Subscribed! You will receive our monthly Digital Growth Insights breakdown.');
        newsletterForm.reset();
      }
    });
  }
}

/* --------------------------------------------------------------------------
   11. BACK TO TOP BUTTON
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
