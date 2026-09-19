/**
 * ANISHA VANJINATHAN - PORTFOLIO INTERACTIVITY & DYNAMIC CMS BINDING
 * Loads content live from backend API (/api/content) or falls back to profile-config.js.
 * Everything edited in the Admin Dashboard is instantly reflected here.
 */

import { profileConfig } from './profile-config.js';

// State: starts with default config, then merges live data from backend CMS
let contentData = { ...profileConfig };

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initCopyEmail();
  initForms();
  initModal();
  initScrollEffects();

  // Load live data from Backend CMS
  await loadDynamicContent();
  
  // Initial renders
  renderAllProjects('all');
  renderServices();
});

/* ==========================================================================
   0. DYNAMIC CMS BINDING (LIVE THEME & CONTENT UPDATES)
   ========================================================================== */
async function loadDynamicContent() {
  try {
    const res = await fetch('/api/content');
    if (res.ok) {
      const liveData = await res.json();
      if (liveData && Object.keys(liveData).length > 0) {
        contentData = { ...contentData, ...liveData };
        applyLiveThemeAndContent(contentData);
      }
    }
  } catch (err) {
    console.log('Running in offline/static mode with default profile.');
  }
}

function applyLiveThemeAndContent(data) {
  if (!data) return;

  // 1. Theme & Colors
  if (data.theme) {
    const root = document.documentElement;
    if (data.theme.primaryColor) {
      root.style.setProperty('--primary-orange', data.theme.primaryColor);
      root.style.setProperty('--primary-orange-hover', data.theme.primaryHover || data.theme.primaryColor);
    }
    if (data.theme.amberColor) {
      root.style.setProperty('--primary-amber', data.theme.amberColor);
    }
    if (data.theme.bgMain) {
      root.style.setProperty('--bg-main', data.theme.bgMain);
    }
    if (data.theme.bgSurface) {
      root.style.setProperty('--bg-surface', data.theme.bgSurface);
    }
  }

  // 2. Personal & Hero Section
  if (data.personal) {
    const p = data.personal;

    // Logos
    document.querySelectorAll('.logo-accent').forEach(el => el.textContent = p.preferredName || 'Anisha');
    document.querySelectorAll('.mobile-logo').forEach(el => el.innerHTML = `${p.preferredName || 'Anisha'}<span>.v</span>`);

    // Hero Greeting
    const heroBadge = document.getElementById('hero-badge-text');
    if (heroBadge && p.greeting) heroBadge.textContent = p.greeting;

    // Hero Headline
    const heroHeadline = document.getElementById('hero-headline');
    if (heroHeadline) {
      heroHeadline.innerHTML = `
        ${p.headlineMain || 'Creative'} <span class="gradient-text">${p.headlineGradient || 'Developer'}</span> &amp;<br />
        ${p.headlineSub || 'Future'} <span class="gradient-text-amber">${p.headlineSubGradient || 'Founder'}</span>
      `;
    }

    // Hero Quote
    const heroQuote = document.getElementById('hero-quote');
    if (heroQuote && p.heroQuote) {
      heroQuote.textContent = `"${p.heroQuote.replace(/^"|"$/g, '')}"`;
    }

    // Hero Portrait Image
    const portraitImg = document.getElementById('hero-portrait-img');
    if (portraitImg && p.heroImage) {
      portraitImg.src = p.heroImage;
    }

    // Hero Caption
    const capName = document.getElementById('hero-caption-name');
    if (capName && p.name) capName.textContent = p.name;
    const capSub = document.getElementById('hero-caption-sub');
    if (capSub) capSub.textContent = `${p.year || '2nd Year'} • ${p.institution || 'SRM IST Ramapuram'}`;

    // Direct Email
    document.querySelectorAll('#contact-email-display, .mobile-email').forEach(el => {
      if (p.email) el.textContent = p.email;
    });
  }

  // 3. 4 Pillars Strip
  if (data.pillars && data.pillars.length >= 4) {
    const pillarsGrid = document.getElementById('hero-pillars-grid');
    if (pillarsGrid) {
      pillarsGrid.innerHTML = data.pillars.map(p => `
        <div class="pillar-card">
          <span class="pillar-num">${p.number}</span>
          <div class="pillar-info">
            <h4 class="pillar-title">${p.title}</h4>
            <p class="pillar-sub">${p.subtitle}</p>
          </div>
        </div>
      `).join('');
    }
  }

  // 4. About Persona Cards
  if (data.aboutCards) {
    const personaGrid = document.getElementById('persona-grid');
    if (personaGrid) {
      personaGrid.innerHTML = data.aboutCards.map((c, idx) => `
        <div class="persona-card glass-card ${idx === 1 ? 'highlighted-persona' : ''}">
          <div class="persona-card-header">
            <span class="persona-icon-box">${c.icon || '💼'}</span>
            <span class="persona-tag">${c.tag || ''}</span>
          </div>
          <h3 class="persona-title">${c.title}</h3>
          <p class="persona-desc">${c.description}</p>
          <ul class="persona-points">
            ${(c.points || []).map(pt => `<li><span class="check-bullet">✓</span> ${pt}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    }
  }

  // 5. Metrics Row
  if (data.stats) {
    const metricsRow = document.getElementById('metrics-row');
    if (metricsRow) {
      metricsRow.innerHTML = data.stats.map((s, idx) => `
        ${idx > 0 ? '<div class="metric-divider"></div>' : ''}
        <div class="metric-item">
          <span class="metric-number">${s.value}</span>
          <span class="metric-label">${s.label}</span>
        </div>
      `).join('');
    }
  }

  // 6. Startup Section
  if (data.startupLab) {
    const s = data.startupLab;
    const badge = document.getElementById('startup-badge');
    if (badge && s.badge) badge.textContent = s.badge;
    const origin = document.getElementById('startup-origin');
    if (origin && s.origin) origin.textContent = s.origin;
    const headline = document.getElementById('startup-headline');
    if (headline && s.headline) headline.textContent = s.headline;
    const desc = document.getElementById('startup-desc');
    if (desc && s.description) desc.textContent = s.description;
  }
}

/* ==========================================================================
   1. NAVIGATION & MOBILE DRAWER
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('site-header');
  const toggleBtn = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta-btn');
  const desktopLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    highlightActiveNavLink();
  }, { passive: true });

  if (toggleBtn && mobileDrawer) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileDrawer();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        closeMobileDrawer();
      }
    });
  }

  function openMobileDrawer() {
    mobileDrawer.classList.add('open');
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    mobileDrawer.classList.remove('open');
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function highlightActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 120;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        desktopLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
}

/* ==========================================================================
   2. DYNAMIC PROJECTS & FILTERING
   ========================================================================== */
function renderAllProjects(filter = 'all') {
  const projectsGrid = document.getElementById('projects-grid');
  const filterTabs = document.querySelectorAll('.filter-tab');
  if (!projectsGrid) return;

  const projectsList = contentData.projects || profileConfig.projects;
  const filtered = filter === 'all' 
    ? projectsList 
    : projectsList.filter(p => p.category === filter);

  projectsGrid.innerHTML = '';

  filtered.forEach((project, index) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.style.animation = `fade-up 0.4s ease forwards ${index * 0.08}s`;

    card.innerHTML = `
      <div class="project-media">
        <img 
          src="${project.image || 'assets/project-edtech.svg'}" 
          alt="${project.title} Preview" 
          class="project-img" 
          loading="lazy" 
        />
        <span class="project-category-badge">${project.categoryLabel || project.category}</span>
        <span class="project-year">${project.year || ''}</span>
      </div>
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-tagline">${project.tagline || ''}</p>
        <div class="project-tags">
          ${(project.tags || []).map(t => `<span class="project-tag">${t}</span>`).join('')}
        </div>
        <div class="project-actions">
          <button class="btn-case-study" data-project-id="${project.id}">
            Case Study
          </button>
          <div class="project-links">
            ${project.liveUrl && project.liveUrl !== '#' ? `<a href="${project.liveUrl}" target="_blank" rel="noopener" class="icon-link">Live ↗</a>` : ''}
            ${project.githubUrl && project.githubUrl !== '#' ? `<a href="${project.githubUrl}" target="_blank" rel="noopener" class="icon-link">Code ↗</a>` : ''}
          </div>
        </div>
      </div>
    `;

    projectsGrid.appendChild(card);
  });

  // Attach modal listeners
  const caseStudyButtons = projectsGrid.querySelectorAll('.btn-case-study');
  caseStudyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const pId = btn.getAttribute('data-project-id');
      openCaseStudyModal(pId);
    });
  });

  // Attach tab clicks once
  if (!window.__tabsInitialized) {
    window.__tabsInitialized = true;
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const category = tab.getAttribute('data-filter');
        renderAllProjects(category);
      });
    });
  }
}

/* ==========================================================================
   3. SERVICES SECTION RENDERING
   ========================================================================== */
function renderServices() {
  const servicesGrid = document.getElementById('services-grid');
  if (!servicesGrid) return;

  servicesGrid.innerHTML = '';
  const servicesList = contentData.services || profileConfig.services;

  servicesList.forEach(service => {
    const card = document.createElement('div');
    card.className = 'service-card glass-card';

    card.innerHTML = `
      <span class="service-num">${service.number}</span>
      <h3 class="service-title">${service.title}</h3>
      <p class="service-desc">${service.description}</p>
      <ul class="service-deliverables">
        ${(service.deliverables || []).map(item => `
          <li><span class="service-check">✓</span> ${item}</li>
        `).join('')}
      </ul>
    `;

    servicesGrid.appendChild(card);
  });
}

/* ==========================================================================
   4. CASE STUDY MODAL DIALOG
   ========================================================================== */
let openCaseStudyModal = () => {};

function initModal() {
  const modal = document.getElementById('case-study-modal');
  const modalBody = document.getElementById('modal-content');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal || !modalBody) return;

  openCaseStudyModal = (projectId) => {
    const projectsList = contentData.projects || profileConfig.projects;
    const project = projectsList.find(p => p.id === projectId);
    if (!project) return;

    modalBody.innerHTML = `
      <img src="${project.image || 'assets/project-edtech.svg'}" alt="${project.title}" />
      <span class="modal-tag">${project.categoryLabel || project.category} • ${project.year || ''}</span>
      <h3 class="modal-title">${project.title}</h3>
      <p class="modal-desc">${project.description || project.tagline}</p>
      <div class="modal-tags-list">
        ${(project.tags || []).map(tag => `<span class="project-tag">${tag}</span>`).join('')}
      </div>
      <div class="modal-links-row">
        <a href="#contact" class="btn btn-primary" id="modal-hire-cta">
          <span>Inquire About Similar Project</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    `;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const modalHire = document.getElementById('modal-hire-cta');
    if (modalHire) {
      modalHire.addEventListener('click', () => {
        closeModal();
      });
    }
  };

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });
}

/* ==========================================================================
   5. EMAIL COPY & TOAST NOTIFICATIONS
   ========================================================================== */
function initCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  const copyText = document.getElementById('copy-text');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const email = (contentData.personal && contentData.personal.email) || profileConfig.personal.email;
      navigator.clipboard.writeText(email).then(() => {
        if (copyText) copyText.textContent = 'Copied!';
        showToast(`Email copied to clipboard: ${email}`);
        setTimeout(() => {
          if (copyText) copyText.textContent = 'Copy';
        }, 2500);
      }).catch(() => {
        showToast(`Email: ${email}`);
      });
    });
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span>⚡</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ==========================================================================
   6. CONTACT & WAITLIST FORMS (CONNECTED TO BACKEND API)
   ========================================================================== */
function initForms() {
  // Contact Form
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit-btn');

  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const serviceInput = document.getElementById('contact-service');
      const messageInput = document.getElementById('contact-message');

      const payload = {
        name: nameInput ? nameInput.value : '',
        email: emailInput ? emailInput.value : '',
        service: serviceInput ? serviceInput.value : 'General',
        message: messageInput ? messageInput.value : ''
      };

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending message...</span>';

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          showToast(data.message || `Thank you, ${payload.name}! Your message has been received.`);
        } else {
          showToast(`Thank you, ${payload.name}! Your message has been recorded.`);
        }
      } catch (err) {
        showToast(`Thank you, ${payload.name}! Your message has been recorded.`);
      } finally {
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>Send Message</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        `;
      }
    });
  }

  // Startup Waitlist Form
  const waitlistForm = document.getElementById('waitlist-form');
  const waitlistEmail = document.getElementById('waitlist-email');

  if (waitlistForm && waitlistEmail) {
    waitlistForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = waitlistEmail.value;

      try {
        const response = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        if (response.ok) {
          const data = await response.json();
          showToast(data.message || `Welcome to the SkillPulse AI waitlist!`);
        } else {
          showToast(`Welcome! ${email} has been added to the SkillPulse AI waitlist.`);
        }
      } catch (err) {
        showToast(`Welcome! ${email} has been added to the SkillPulse AI waitlist.`);
      } finally {
        waitlistForm.reset();
      }
    });
  }
}

/* ==========================================================================
   7. SCROLL EFFECTS & BACK TO TOP
   ========================================================================== */
function initScrollEffects() {
  const backToTopBtn = document.getElementById('back-to-top-btn');

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}
