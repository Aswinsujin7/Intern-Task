/**
 * NEXX SOLUTIONS - INTERACTIVE HORIZONTAL SERVICES CAROUSEL ENGINE
 * 
 * Features:
 * - 10-Service Horizontal Sliding Carousel (4 on Desktop, 2 on Tablet, 1 on Mobile)
 * - Arrow navigation (prev/next) with smooth sliding
 * - Touch swipe navigation on mobile
 * - Card active state highlighting with neon cyan border and glowing underline
 * - Modal integration on card click
 */

document.addEventListener('DOMContentLoaded', () => {
  initServicesShowcase();
});

function initServicesShowcase() {
  const cards = Array.from(document.querySelectorAll('.carousel-service-card'));
  const viewport = document.getElementById('servicesCarouselViewport');
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');
  const counterText = document.getElementById('carouselCounterText');
  const showcaseWrapper = document.querySelector('.services-showcase-wrapper');

  if (!cards.length) return;

  // Metadata for all 10 services
  const serviceMeta = {
    seo: {
      index: '01',
      badge: 'SEO',
      title: 'SEO & Search Optimization',
      serviceKey: 'seo'
    },
    social: {
      index: '02',
      badge: 'SOCIAL',
      title: 'Social Media Marketing',
      serviceKey: 'social'
    },
    ppc: {
      index: '03',
      badge: 'PPC',
      title: 'Google Ads & PPC',
      serviceKey: 'ppc'
    },
    web: {
      index: '04',
      badge: 'DEV',
      title: 'Website Design & Development',
      serviceKey: 'web'
    },
    branding: {
      index: '05',
      badge: 'BRAND',
      title: 'Branding & Creative Design',
      serviceKey: 'branding'
    },
    content: {
      index: '06',
      badge: 'CONTENT',
      title: 'Content Marketing',
      serviceKey: 'content'
    },
    email: {
      index: '07',
      badge: 'EMAIL',
      title: 'Email Marketing',
      serviceKey: 'email'
    },
    video: {
      index: '08',
      badge: 'VIDEO',
      title: 'Video Marketing',
      serviceKey: 'video'
    },
    leadgen: {
      index: '09',
      badge: 'LEADS',
      title: 'Lead Generation',
      serviceKey: 'leadgen'
    },
    automation: {
      index: '10',
      badge: 'AUTO',
      title: 'Marketing Automation',
      serviceKey: 'automation'
    }
  };

  const serviceKeys = ['seo', 'social', 'ppc', 'web', 'branding', 'content', 'email', 'video', 'leadgen', 'automation'];
  let currentServiceKey = 'seo';

  // Function to switch active service card
  function switchService(serviceKey, scrollIntoView = true) {
    const meta = serviceMeta[serviceKey];
    if (!meta) return;

    currentServiceKey = serviceKey;

    // 1. Update Carousel Cards Active States
    cards.forEach((card) => {
      const isTarget = card.getAttribute('data-service-target') === serviceKey;
      card.classList.toggle('active', isTarget);
      card.setAttribute('aria-selected', isTarget ? 'true' : 'false');

      if (isTarget && scrollIntoView && viewport) {
        // Smoothly scroll active card into view in viewport
        const cardLeft = card.offsetLeft;
        const cardWidth = card.offsetWidth;
        const viewportWidth = viewport.offsetWidth;
        const targetScroll = cardLeft - (viewportWidth / 2) + (cardWidth / 2);
        viewport.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: 'smooth'
        });
      }
    });

    // 2. Update Carousel Counter Label
    if (counterText) {
      counterText.innerHTML = `${meta.index} / 10 &bull; ${meta.title}`;
    }
  }

  // Next and Previous Navigation Handlers
  function goToNextService() {
    const currentIndex = serviceKeys.indexOf(currentServiceKey);
    const nextIndex = (currentIndex + 1) % serviceKeys.length;
    switchService(serviceKeys[nextIndex], true);
  }

  function goToPrevService() {
    const currentIndex = serviceKeys.indexOf(currentServiceKey);
    const prevIndex = (currentIndex - 1 + serviceKeys.length) % serviceKeys.length;
    switchService(serviceKeys[prevIndex], true);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToNextService();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToPrevService();
    });
  }

  // Card Click Listeners
  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const target = card.getAttribute('data-service-target');
      if (target) {
        switchService(target, true);
        
        // Open service modal if function exists
        if (typeof window.openServiceModal === 'function') {
          window.openServiceModal(target);
        }
      }
    });

    // Keyboard support (Enter or Space to select)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const target = card.getAttribute('data-service-target');
        if (target) {
          switchService(target, true);
        }
      }
    });
  });

  // Touch Swipe Navigation for Mobile
  if (viewport) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Only trigger if horizontal swipe is greater than vertical movement
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX < 0) {
          // Swipe Left -> Next Service
          goToNextService();
        } else {
          // Swipe Right -> Prev Service
          goToPrevService();
        }
      }
    }
  }

  // Global helper for external calls
  window.selectServiceDemo = function(key) {
    if (serviceKeys.includes(key)) {
      switchService(key, true);
    }
  };

  // Initialize with SEO as the default active card
  switchService('seo', false);

  // Scroll reveal animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.15 });

  if (showcaseWrapper) {
    observer.observe(showcaseWrapper);
  }
}
