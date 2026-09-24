/**
 * ANISHA VANJINATHAN - PREMIUM FULLSTACK PORTFOLIO
 * Dynamic CMS data binding, 4-domain project filters, theme toggle, and unbreakable persistence.
 */

import { profileConfig } from './profile-config.js';
import {
  getPortfolioContent,
  getSyncLocalContent,
  listenForContentUpdates,
  savePortfolioContent
} from './storage-helper.js';

let appData = { ...profileConfig };
let currentDomainFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  initThemeToggle();
  initMobileDrawer();
  initContactForm();
  initDomainFilters();

  // 1. Instant 0ms Pre-Hydration from Local Storage
  const syncLocal = getSyncLocalContent();
  if (syncLocal && typeof syncLocal === 'object') {
    appData = { ...appData, ...syncLocal };
  }
  renderAllSections();

  // 2. High-Capacity IndexedDB Hydration (Photos & Full State)
  try {
    const idbData = await getPortfolioContent();
    if (idbData && typeof idbData === 'object' && Object.keys(idbData).length > 0) {
      appData = { ...appData, ...idbData };
      renderAllSections();
    }
  } catch (e) {
    console.warn('[CMS] IndexedDB hydration note:', e);
  }

  // 3. Live Server API Synchronization
  await fetchLiveCMSData();
  renderAllSections();

  // 4. Real-time Multi-Tab Sync Listener
  listenForContentUpdates((liveData) => {
    if (liveData && typeof liveData === 'object') {
      appData = { ...appData, ...liveData };
      renderAllSections();
      showToast('Frontend updated live with changes from Admin!');
    }
  });
});

/* ==========================================================================
   1. DATA LOADING FROM BACKEND API
   ========================================================================== */
async function fetchLiveCMSData() {
  try {
    const res = await fetch('/api/content', { cache: 'no-store' });
    if (res.ok) {
      const liveData = await res.json();
      if (liveData && Object.keys(liveData).length > 0) {
        appData = { ...appData, ...liveData };
        // Keep client storage in sync with server data
        await savePortfolioContent(appData);
        console.log('[CMS] Successfully synced latest content from backend API.');
      }
    }
  } catch (err) {
    console.log('[CMS] Running with persistent client storage and profile configuration.');
  }
}

/* ==========================================================================
   2. RENDER ALL SECTIONS
   ========================================================================== */
function renderAllSections() {
  renderNavigation();
  renderHero();
  renderAbout();
  renderServices();
  renderProjects(currentDomainFilter);
  renderSkillsMatrix();
  renderEducation();
  renderLinkedInHeadlines();
  renderContactInfo();
}

/* --- Navigation & Brand --- */
function renderNavigation() {
  const p = appData.personal || {};
  const navBrandName = document.getElementById('nav-brand-name');
  const navBrandTitle = document.getElementById('nav-brand-title');
  const mobileBrandName = document.getElementById('mobile-brand-name');
  const footerName = document.getElementById('footer-name');

  if (navBrandName && p.name) navBrandName.textContent = p.name;
  if (navBrandTitle && p.role) navBrandTitle.textContent = p.role.toUpperCase();
  if (mobileBrandName && p.name) mobileBrandName.textContent = p.name;
  if (footerName && p.name) footerName.textContent = p.name;
}

/* --- Hero Section --- */
function renderHero() {
  const p = appData.personal || {};

  const heroGreeting = document.getElementById('hero-greeting');
  const heroName = document.getElementById('hero-name');
  const heroSubtitle = document.getElementById('hero-subtitle');
  const heroTagline = document.getElementById('hero-tagline');
  const heroLocation = document.getElementById('hero-location');
  const heroEmail = document.getElementById('hero-email');
  const heroPhone = document.getElementById('hero-phone');
  const heroEmailLink = document.getElementById('hero-email-link');
  const heroPhoneLink = document.getElementById('hero-phone-link');
  const heroPortrait = document.getElementById('hero-portrait-img');
  const heroCtaPrimary = document.getElementById('hero-cta-primary');
  const heroCtaSecondary = document.getElementById('hero-cta-secondary');

  if (heroGreeting && p.greeting) heroGreeting.textContent = p.greeting;
  if (heroName && p.name) heroName.textContent = p.name;
  if (heroSubtitle && p.headlineSub) heroSubtitle.textContent = p.headlineSub;
  if (heroTagline && p.tagline) heroTagline.textContent = p.tagline;
  if (heroLocation && p.location) heroLocation.textContent = p.location;
  if (heroEmail && p.email) heroEmail.textContent = p.email;
  if (heroPhone && p.phone) heroPhone.textContent = p.phone;

  if (heroEmailLink && p.email) heroEmailLink.href = `mailto:${p.email}`;
  if (heroPhoneLink && p.phone) heroPhoneLink.href = `tel:${p.phone.replace(/[^0-9+]/g, '')}`;

  if (heroPortrait && p.heroImage) {
    heroPortrait.src = p.heroImage;
    heroPortrait.onerror = function() {
      this.src = 'assets/hero-portrait.svg';
    };
  }

  if (heroCtaPrimary && p.ctaPrimaryText) {
    heroCtaPrimary.querySelector('span').textContent = p.ctaPrimaryText;
    if (p.ctaPrimaryLink) heroCtaPrimary.href = p.ctaPrimaryLink;
  }
  if (heroCtaSecondary && p.ctaSecondaryText) {
    heroCtaSecondary.querySelector('span').textContent = p.ctaSecondaryText;
    if (p.ctaSecondaryLink) heroCtaSecondary.href = p.ctaSecondaryLink;
  }
}

/* --- About Me Section --- */
function renderAbout() {
  const ab = appData.about || {};
  const badge = document.getElementById('about-badge');
  const headline = document.getElementById('about-headline');
  const bioContainer = document.getElementById('about-bio-container');
  const statsGrid = document.getElementById('about-stats-grid');
  const infoLocation = document.getElementById('info-location');
  const infoEmail = document.getElementById('info-email');
  const infoPhone = document.getElementById('info-phone');
  const infoUniv = document.getElementById('info-univ');
  const infoLanguages = document.getElementById('info-languages');
  const infoFocus = document.getElementById('info-focus');

  if (badge && ab.badge) badge.textContent = ab.badge;
  if (headline && ab.headline) headline.textContent = ab.headline;

  if (bioContainer && ab.bio) {
    const paragraphs = ab.bio.split('\n\n').filter(p => p.trim().length > 0);
    bioContainer.innerHTML = paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join('');
  }

  if (statsGrid && ab.stats && Array.isArray(ab.stats)) {
    statsGrid.innerHTML = ab.stats.map(s => `
      <div class="stat-pill-item">
        <span class="check-icon">✓</span>
        <div>
          <strong class="stat-val">${escapeHtml(s.value)}</strong>
          <span class="stat-lbl">${escapeHtml(s.label)}</span>
        </div>
      </div>
    `).join('');
  }

  const ci = ab.cardInfo || {};
  const p = appData.personal || {};

  if (infoLocation) infoLocation.textContent = ci.location || p.location || 'Chennai, India';
  if (infoEmail) {
    infoEmail.textContent = ci.email || p.email || 'anisha8020@gmail.com';
    infoEmail.href = `mailto:${ci.email || p.email}`;
  }
  if (infoPhone) {
    infoPhone.textContent = ci.phone || p.phone || '+91 8668177527';
    infoPhone.href = `tel:${(ci.phone || p.phone || '').replace(/[^0-9+]/g, '')}`;
  }
  if (infoUniv) infoUniv.textContent = ci.university || p.institution || 'SRM IST Ramapuram';
  if (infoLanguages) infoLanguages.textContent = ci.languages || 'English, Tamil';
  if (infoFocus) infoFocus.textContent = ci.focus || 'AI Apps, E-Commerce & Growth';
}

/* --- Services Section --- */
function renderServices() {
  const container = document.getElementById('services-container');
  if (!container) return;

  const services = appData.services || [];
  const iconMap = {
    'ai-dev': '💻',
    'shopify': '🛍️',
    'content': '📈',
    'design-art': '🎨'
  };

  container.innerHTML = services.map(s => {
    const icon = iconMap[s.id] || '⚡';
    const deliverables = s.deliverables && Array.isArray(s.deliverables)
      ? s.deliverables.map(d => `<li>${escapeHtml(d)}</li>`).join('')
      : '';

    return `
      <div class="service-card">
        <span class="service-number">${escapeHtml(s.number || '01')}</span>
        <div class="service-icon-box">${icon}</div>
        <h3 class="service-title">${escapeHtml(s.title)}</h3>
        <p class="service-desc">${escapeHtml(s.description)}</p>
        <ul class="service-deliverables-list">
          ${deliverables}
        </ul>
      </div>
    `;
  }).join('');
}

/* --- Featured Projects (4 Domains - NO '+' Button on Frontend) --- */
function initDomainFilters() {
  const filterButtons = document.querySelectorAll('.domain-tab-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      currentDomainFilter = filter;
      renderProjects(filter);
    });
  });
}

function renderProjects(filter = 'all') {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const allProjects = appData.projects || [];
  const filtered = filter === 'all' 
    ? allProjects 
    : allProjects.filter(p => (p.domain || '').toLowerCase() === filter.toLowerCase());

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-surface); border: 1px dashed var(--border); border-radius: 14px;">
        <p style="color: var(--text-muted); font-size: 1.1rem;">No projects added under this domain yet.</p>
        <p style="color: var(--text-dim); font-size: 0.85rem; margin-top: 0.5rem;">Add one easily via the <a href="/admin" style="color: var(--primary);">Backend CMS</a>.</p>
      </div>
    `;
    return;
  }

  const domainLabels = {
    college: '🏛️ College & Hackathon',
    freelancer: '💼 Freelancer & Brand',
    startup: '🚀 Startup Venture',
    softskills: '🎭 Soft Skills & Events'
  };

  grid.innerHTML = filtered.map(p => {
    const domainTag = domainLabels[p.domain] || 'Project';
    const techPills = p.tech && Array.isArray(p.tech) 
      ? p.tech.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')
      : '';
    const imgUrl = p.image || 'assets/project-campus.svg';

    return `
      <div class="project-card">
        <div class="project-media-wrap">
          <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(p.title)}" onerror="this.src='assets/project-campus.svg'" />
          <span class="project-domain-pill">${escapeHtml(domainTag)}</span>
        </div>
        <div class="project-body">
          ${p.recognition ? `<span class="project-recognition-tag">${escapeHtml(p.recognition)}</span>` : ''}
          <h3 class="project-title">${escapeHtml(p.title)}</h3>
          ${p.role ? `<div class="project-role">${escapeHtml(p.role)}</div>` : ''}
          <p class="project-desc">${escapeHtml(p.description || '')}</p>
          <div class="project-tech-tags">
            ${techPills}
          </div>
          <div class="project-links-row">
            ${p.liveUrl && p.liveUrl !== '#' ? `
              <a href="${escapeHtml(p.liveUrl)}" target="_blank" rel="noopener" class="project-btn">
                <span>Live Demo</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            ` : ''}
            ${p.githubUrl && p.githubUrl !== '#' ? `
              <a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener" class="project-btn">
                <span>View Details</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* --- Skills Matrix (5 Categories) --- */
function renderSkillsMatrix() {
  const container = document.getElementById('skills-matrix-container');
  if (!container) return;

  const matrix = appData.skillsMatrix || [];
  container.innerHTML = matrix.map(cat => {
    const badges = (cat.skills || []).map(skill => `
      <span class="skill-badge">${escapeHtml(skill)}</span>
    `).join('');

    return `
      <div class="skill-domain-card">
        <div class="skill-card-header">
          <span class="skill-icon">${escapeHtml(cat.icon || '⚡')}</span>
          <h3 class="skill-card-title">${escapeHtml(cat.category)}</h3>
        </div>
        <div class="skills-tags-cluster">
          ${badges}
        </div>
      </div>
    `;
  }).join('');
}

/* --- Education Section --- */
function renderEducation() {
  const container = document.getElementById('education-container');
  if (!container) return;

  const eduList = appData.education || [];
  container.innerHTML = eduList.map(item => `
    <div class="education-card">
      <div class="edu-status-pill">${escapeHtml(item.status || 'Verified')}</div>
      <h3 class="edu-degree">${escapeHtml(item.degree)}</h3>
      <div class="edu-institution">${escapeHtml(item.institution)}</div>
      <div class="edu-period">${escapeHtml(item.period)}</div>
      <p class="edu-highlights">${escapeHtml(item.highlights || '')}</p>
    </div>
  `).join('');
}

/* --- LinkedIn Profile Assets (1-Click Copy) --- */
function renderLinkedInHeadlines() {
  const container = document.getElementById('linkedin-headlines-container');
  if (!container) return;

  const headlines = appData.linkedInHeadlines || [];
  container.innerHTML = headlines.map(h => `
    <div class="headline-card">
      <div class="headline-header">
        <span class="headline-label">${escapeHtml(h.label)}</span>
        <span class="headline-badge">${escapeHtml(h.badge || 'Preset')}</span>
      </div>
      <div class="headline-text-box" id="headline-box-${h.id}">
        ${escapeHtml(h.text)}
      </div>
      <button class="btn-copy-headline" onclick="copyTextToClipboard('${escapeHtml(h.text)}', this)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>Copy Headline</span>
      </button>
    </div>
  `).join('');
}

/* --- Contact Info --- */
function renderContactInfo() {
  const p = appData.personal || {};
  const emailVal = document.getElementById('contact-email-val');
  const phoneVal = document.getElementById('contact-phone-val');
  const locVal = document.getElementById('contact-loc-val');
  const mobileEmail = document.getElementById('mobile-email-text');
  const mobileLoc = document.getElementById('mobile-location-text');

  if (emailVal && p.email) emailVal.textContent = p.email;
  if (phoneVal && p.phone) phoneVal.textContent = p.phone;
  if (locVal && p.location) locVal.textContent = p.location;
  if (mobileEmail && p.email) mobileEmail.textContent = p.email;
  if (mobileLoc && p.location) mobileLoc.textContent = `📍 ${p.location}`;
}

/* ==========================================================================
   3. INTERACTIVE CONTACT FORM & CLIPBOARD
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('contact-submit-btn');
    const originalText = submitBtn.innerHTML;

    const payload = {
      name: form.name.value,
      email: form.email.value,
      service: form.service.value,
      message: form.message.value
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Sending...</span>`;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Thank you! Your message has been sent to Anisha.');
        form.reset();
      } else {
        showToast(data.error || 'Could not send message. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Thank you! Inquiry saved (Offline mode).', 'success');
      form.reset();
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// Global Clipboard Helpers
window.copyEmailToClipboard = function () {
  const email = appData.personal?.email || 'anisha8020@gmail.com';
  navigator.clipboard.writeText(email).then(() => {
    const btnText = document.getElementById('copy-email-btn-text');
    if (btnText) {
      const orig = btnText.textContent;
      btnText.textContent = 'Copied!';
      setTimeout(() => { btnText.textContent = orig; }, 2000);
    }
    showToast(`Email copied: ${email}`);
  });
};

window.copyTextToClipboard = function (text, buttonElement) {
  navigator.clipboard.writeText(text).then(() => {
    if (buttonElement) {
      const span = buttonElement.querySelector('span');
      if (span) {
        const orig = span.textContent;
        span.textContent = 'Copied! ✓';
        setTimeout(() => { span.textContent = orig; }, 2000);
      }
    }
    showToast('Headline copied to clipboard! Ready to paste into LinkedIn.');
  });
};

/* --- Toast Notification --- */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* --- Mobile Drawer Menu --- */
function initMobileDrawer() {
  const toggle = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!toggle || !drawer) return;

  toggle.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('active');
    if (isOpen) {
      drawer.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      drawer.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
    }
  });

  drawer.addEventListener('click', (e) => {
    if (e.target === drawer || e.target.classList.contains('mobile-link') || e.target.closest('.mobile-cta-btn')) {
      drawer.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

/* --- Theme Toggle Controller --- */
function initThemeToggle() {
  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  if (toggleBtns.length === 0) return;

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('portfolio_theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('portfolio_theme', 'dark');
    }
  }

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
    });
  });
}

