document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. FLOATING THEME & LAYOUT SELECTORS
  // ==========================================
  
  // Theme Selector Elements
  const themeToggle = document.getElementById('theme-panel-toggle');
  const themePanel = document.getElementById('theme-selection-panel');
  const themeOptionBtns = document.querySelectorAll('.theme-option-btn[data-theme]');

  // Layout Selector Elements
  const layoutToggle = document.getElementById('layout-panel-toggle');
  const layoutPanel = document.getElementById('layout-selection-panel');
  const layoutOptionBtns = document.querySelectorAll('.theme-option-btn[data-layout]');

  // Theme Toggle panel opening
  themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    themeToggle.classList.toggle('active');
    themePanel.classList.toggle('active');
    // Close layout panel if open
    layoutToggle.classList.remove('active');
    layoutPanel.classList.remove('active');
  });

  // Layout Toggle panel opening
  layoutToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    layoutToggle.classList.toggle('active');
    layoutPanel.classList.toggle('active');
    // Close theme panel if open
    themeToggle.classList.remove('active');
    themePanel.classList.remove('active');
  });

  // Close panels on body click
  document.addEventListener('click', (e) => {
    if (!themePanel.contains(e.target) && e.target !== themeToggle && !themeToggle.contains(e.target)) {
      themeToggle.classList.remove('active');
      themePanel.classList.remove('active');
    }
    if (!layoutPanel.contains(e.target) && e.target !== layoutToggle && !layoutToggle.contains(e.target)) {
      layoutToggle.classList.remove('active');
      layoutPanel.classList.remove('active');
    }
  });

  // Switch Theme Function
  function switchTheme(themeName) {
    document.body.classList.remove('theme-cocoa', 'theme-oat', 'theme-blush', 'theme-zen');
    document.body.classList.add(`theme-${themeName}`);
    themeOptionBtns.forEach(btn => {
      if (btn.dataset.theme === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    localStorage.setItem('koda-theme', themeName);
    updateSimulatorGlow(themeName, document.querySelector('.sim-btn.active').dataset.mode);
  }

  // Hook Theme clicks
  themeOptionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTheme(btn.dataset.theme);
    });
  });

  // Switch Layout Function
  function switchLayout(layoutName) {
    document.body.classList.remove('layout-a', 'layout-b', 'layout-c');
    document.body.classList.add(`layout-${layoutName}`);
    layoutOptionBtns.forEach(btn => {
      if (btn.dataset.layout === layoutName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    localStorage.setItem('koda-layout', layoutName);
    
    // Throw the user back to the very top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Refresh Scroll Trigger for Sticky Bottom Bar in the new layout
    window.dispatchEvent(new Event('scroll'));
  }

  // Hook Layout clicks
  layoutOptionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchLayout(btn.dataset.layout);
    });
  });


  // ==========================================
  // 2. INTERACTIVE FACE SIMULATOR CONTROLLER
  // ==========================================
  const simBtns = document.querySelectorAll('.sim-btn');
  const simTitle = document.getElementById('sim-title');
  const simBadge = document.getElementById('sim-badge');
  const simText = document.getElementById('sim-text');
  const simQuote = document.getElementById('sim-quote');
  const screenShapes = document.getElementById('screen-shapes');
  const screenGlow = document.getElementById('screen-glow');

  // SVG states mapping
  const faceStates = {
    companion: {
      title: 'Companion Mode',
      badge: 'Active Listening',
      text: "In Companion Mode, Koda's display shows soft crescent eyes indicating comfort and conversational engagement. Koda listens gently, responds in a calm tone, and uses conversational memory to remember your preferences and daily routines.",
      quote: '"I\'m here. I\'m listening. How was your day?"',
      shapes: `
        <path class="screen-element" d="M 45,65 Q 60,50 75,65" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" fill="none" />
        <path class="screen-element" d="M 125,65 Q 140,50 155,65" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" fill="none" />
      `
    },
    calm: {
      title: 'Calm Mode',
      badge: 'Deep Breathing',
      text: "Calm Mode features low-intensity lights, sleeping eyes, and an animated breathing wave on the face screen. Koda's voice slows down, guiding you through a short physical or emotional reset to alleviate stress.",
      quote: '"Take a deep breath in... and let it out slowly."',
      shapes: `
        <path class="screen-element" d="M 40,65 L 75,65" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" fill="none" />
        <path class="screen-element" d="M 125,65 L 160,65" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" fill="none" />
        <path class="screen-element wave" d="M 30,95 Q 50,83 70,95 T 110,95 T 150,95 T 170,95" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" fill="none" style="animation: breathe-wave 3s infinite ease-in-out;" />
      `
    },
    weather: {
      title: 'Weather Awareness',
      badge: 'Ambient Warning',
      text: "In Weather Mode, Koda alerts you to outdoor changes by displaying clear symbolic weather icons (like rain clouds or sun rays) alongside its eyes. It provides a warm verbal heads-up before you head out.",
      quote: '"It looks like rain today, Alex. Don\'t forget an umbrella."',
      shapes: `
        <path class="screen-element" d="M 45,52 A 8,8 0 1 1 55,52 A 8,8 0 1 1 45,52" fill="var(--accent)" />
        <path class="screen-element" d="M 145,52 A 8,8 0 1 1 155,52 A 8,8 0 1 1 145,52" fill="var(--accent)" />
        <g transform="translate(85, 58) scale(0.6)">
          <path class="screen-element" d="M 32 46 A 10 10 0 0 1 48 38 A 12 12 0 0 1 70 42 A 8 8 0 0 1 76 58 A 6 6 0 0 1 70 70 L 32 70 A 8 8 0 0 1 32 46 Z" fill="var(--accent)" />
          <line class="screen-element" x1="38" y1="78" x2="34" y2="86" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" />
          <line class="screen-element" x1="48" y1="80" x2="44" y2="88" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" />
          <line class="screen-element" x1="58" y1="80" x2="54" y2="88" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" />
          <line class="screen-element" x1="68" y1="78" x2="64" y2="86" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" />
        </g>
      `
    },
    bedtime: {
      title: 'Bedtime Mode',
      badge: 'Wind-Down Routine',
      text: "Bedtime Mode features relaxed sleepy eyes and a glowing moon icon. Koda dims its display and chest light, guides you through a wind-down journal session, and plays peaceful nature soundscapes to help you sleep.",
      quote: '"Sleep well. I will keep watch while you rest."',
      shapes: `
        <path class="screen-element" d="M 40,55 Q 55,72 70,55" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" fill="none" />
        <path class="screen-element" d="M 130,55 Q 145,72 160,55" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" fill="none" />
        <path class="screen-element" d="M 94,72 A 10,10 0 0 0 106,86 A 7.5,7.5 0 1 1 94,72 Z" fill="var(--accent)" />
      `
    },
    muted: {
      title: 'Privacy Mode',
      badge: 'Hardware Muted',
      text: "Privacy Mode occurs when the physical mute button on Koda's paw is clicked. The microphone circuits are physically cut at the hardware level, Koda's eyes dim, and a clear red mute icon lights up to verify your absolute safety.",
      quote: '"Offline. Microphone hardware fully disconnected."',
      shapes: `
        <path class="screen-element" d="M 40,60 L 70,60" stroke="var(--text-muted)" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.5" />
        <path class="screen-element" d="M 130,60 L 160,60" stroke="var(--text-muted)" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.5" />
        <g class="screen-element" stroke="var(--accent-heart)" stroke-width="3.5" fill="none" stroke-linecap="round" transform="translate(86, 68) scale(0.7)">
          <rect x="7" y="2" width="10" height="15" rx="5" stroke-width="3.5" />
          <path d="M1 10a11 11 0 0 0 22 0" />
          <line x1="12" y1="21" x2="12" y2="25" />
          <line x1="2" y1="2" x2="22" y2="22" stroke-width="4.5" stroke="var(--accent-heart)" />
        </g>
      `
    }
  };

  // Function to adjust simulator glow color depending on the theme and mode
  function updateSimulatorGlow(themeName, mode) {
    let accentColor = '';
    
    // Get colors matching active theme
    if (mode === 'muted') {
      accentColor = '245, 51, 83'; // Red for muted across all themes
    } else {
      switch (themeName) {
        case 'oat':
          accentColor = '14, 180, 164'; // Teal
          break;
        case 'blush':
          accentColor = '250, 175, 35'; // Amber/Gold
          break;
        case 'zen':
          accentColor = '228, 193, 103'; // Sage-gold
          break;
        case 'cocoa':
        default:
          accentColor = '249, 172, 47'; // Cocoa Amber
          break;
      }
    }
    
    screenGlow.style.background = `radial-gradient(circle, rgba(${accentColor}, 0.35) 0%, rgba(0,0,0,0) 70%)`;
  }

  // Handle Mode Selection click
  simBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate all buttons
      simBtns.forEach(b => b.classList.remove('active'));
      
      // Activate clicked button
      btn.classList.add('active');
      
      const mode = btn.dataset.mode;
      const state = faceStates[mode];
      
      // Update descriptions
      simTitle.innerHTML = `<span>${state.title}</span><span class="sim-desc-badge" id="sim-badge">${state.badge}</span>`;
      simText.textContent = state.text;
      simQuote.textContent = state.quote;
      
      // Render new SVGs inside screen shapes
      screenShapes.innerHTML = state.shapes;
      
      // Adjust color glow
      const currentTheme = localStorage.getItem('koda-theme') || 'cocoa';
      updateSimulatorGlow(currentTheme, mode);
    });
  });

  // Inject breathing keyframes directly into the page styling for the wave animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes breathe-wave {
      0%, 100% {
        transform: translateY(0);
        opacity: 0.5;
      }
      50% {
        transform: translateY(-8px);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);


  // ==========================================
  // 3. EVERYDAY USE CASES (LIFESTYLE GALLERY)
  // ==========================================
  const usecaseBtns = document.querySelectorAll('.usecase-btn');
  const usecaseSlides = document.querySelectorAll('.usecase-slide');

  usecaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate selectors
      usecaseBtns.forEach(b => b.classList.remove('active'));
      
      // Activate current selector
      btn.classList.add('active');
      
      const targetIndex = btn.dataset.index;
      
      // Swap Slides
      usecaseSlides.forEach(slide => {
        if (slide.dataset.slide === targetIndex) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });
    });
  });

  // Auto-rotate use case stories every 8 seconds for a lively look
  let activeUseCaseIndex = 0;
  let useCaseInterval = setInterval(rotateUseCase, 8000);

  function rotateUseCase() {
    activeUseCaseIndex = (activeUseCaseIndex + 1) % usecaseBtns.length;
    usecaseBtns[activeUseCaseIndex].click();
  }

  // Clear interval on user click to prevent annoying transitions during reading
  const usecaseSection = document.getElementById('usecases');
  usecaseSection.addEventListener('click', () => {
    clearInterval(useCaseInterval);
  });


  // ==========================================
  // 4. DESIGN JOURNEY CAROUSEL CONTROLLERS
  // ==========================================
  const designCarousel = document.getElementById('design-carousel');
  const carouselLeftBtn = document.getElementById('carousel-left');
  const carouselRightBtn = document.getElementById('carousel-right');

  carouselRightBtn.addEventListener('click', () => {
    designCarousel.scrollBy({
      left: 348, // Card width + gap
      behavior: 'smooth'
    });
  });

  carouselLeftBtn.addEventListener('click', () => {
    designCarousel.scrollBy({
      left: -348,
      behavior: 'smooth'
    });
  });


  // ==========================================
  // 5. FAQ ACCORDION TOGGLE
  // ==========================================
  const faqHeaders = document.querySelectorAll('.faq-header');

  faqHeaders.forEach(header => {
    // Add accessibility attributes dynamically
    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'false');

    const toggleAccordion = () => {
      const parent = header.parentElement;
      const isActive = parent.classList.toggle('active');
      header.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      
      // Close other accordion items for single-open behavior
      document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== parent) {
          item.classList.remove('active');
          const siblingHeader = item.querySelector('.faq-header');
          if (siblingHeader) {
            siblingHeader.setAttribute('aria-expanded', 'false');
          }
        }
      });
    };

    header.addEventListener('click', toggleAccordion);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleAccordion();
      }
    });
  });


  // ==========================================
  // 6. PRE-ORDER LEAD MODAL CONTROLLER
  // ==========================================
  const preorderModal = document.getElementById('preorder-modal');
  const openPreorderBtns = document.querySelectorAll('.open-preorder-btn');
  const closePreorderBtn = document.getElementById('modal-close-btn');
  const donePreorderBtn = document.getElementById('modal-done-btn');
  const preorderForm = document.getElementById('preorder-form');
  const signupScreen = document.getElementById('modal-signup-screen');
  const successScreen = document.getElementById('modal-success-screen');
  const successName = document.getElementById('success-name');
  const successEmail = document.getElementById('success-email');

  // Open Modal function
  function openModal() {
    preorderModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop page scrolling
  }

  // Close Modal function
  function closeModal() {
    preorderModal.classList.remove('active');
    document.body.style.overflow = ''; // Resume scrolling
    // Reset modal screens after animation closes
    setTimeout(() => {
      signupScreen.style.display = 'block';
      successScreen.style.display = 'none';
      preorderForm.reset();
    }, 400);
  }

  // Bind Open Buttons
  openPreorderBtns.forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  // Bind Close Buttons
  closePreorderBtn.addEventListener('click', closeModal);
  donePreorderBtn.addEventListener('click', closeModal);
  
  // Close on Backdrop click
  preorderModal.addEventListener('click', (e) => {
    if (e.target === preorderModal) {
      closeModal();
    }
  });

  // Handle preorder submission
  preorderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('form-name').value;
    const emailInput = document.getElementById('form-email').value;
    
    // Simulate API signup delay and load success page
    successName.textContent = nameInput;
    successEmail.textContent = emailInput;
    
    signupScreen.style.display = 'none';
    successScreen.style.display = 'block';
  });

  // ==========================================
  // 7. STICKY BOTTOM CTA BAR CONTROLLER
  // ==========================================
  const stickyBar = document.getElementById('sticky-bottom-bar');
  const ctaSection = document.querySelector('.cta-banner'); // Standard Bottom CTA

  const getActiveHeroHeight = () => {
    const heroA = document.getElementById('hero-a');
    const heroB = document.getElementById('hero-b');
    const heroC = document.getElementById('hero-c');
    
    if (document.body.classList.contains('layout-a') && heroA) return heroA.offsetHeight;
    if (document.body.classList.contains('layout-b') && heroB) return heroB.offsetHeight;
    if (document.body.classList.contains('layout-c') && heroC) return heroC.offsetHeight;
    
    return 600; // Default fallback
  };

  if (stickyBar && ctaSection) {
    window.addEventListener('scroll', () => {
      const heroHeight = getActiveHeroHeight();
      const scrollPos = window.scrollY;
      const ctaTop = ctaSection.getBoundingClientRect().top + window.scrollY;
      const windowHeight = window.innerHeight;

      // Show bar after scrolling past active hero section, but hide when reaching bottom CTA section
      if (scrollPos > heroHeight - 120 && (scrollPos + windowHeight < ctaTop + 80)) {
        stickyBar.classList.add('visible');
      } else {
        stickyBar.classList.remove('visible');
      }
    });
  }

  // ==========================================
  // 8. DIRECT HERO SIGNUP (LAYOUT C)
  // ==========================================
  const dtcHeroForm = document.getElementById('dtc-hero-form');
  if (dtcHeroForm) {
    dtcHeroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('dtc-hero-email').value;
      
      // Load success screen directly inside modal
      successName.textContent = "Friend";
      successEmail.textContent = emailInput;
      
      signupScreen.style.display = 'none';
      successScreen.style.display = 'block';
      openModal();
    });
  }


  // ==========================================
  // 9. MOBILE MENU CONTROLLER
  // ==========================================
  const mobileToggle = document.getElementById('btn-mobile-toggle');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinksList = document.querySelectorAll('.nav-link');

  if (mobileToggle && navLinksContainer) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = navLinksContainer.classList.toggle('active');
      mobileToggle.textContent = isActive ? '✕' : '☰';
      mobileToggle.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinksList.forEach(link => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('active');
        mobileToggle.textContent = '☰';
        mobileToggle.classList.remove('active');
      });
    });

    // Close menu when clicking outside of it
    document.addEventListener('click', (e) => {
      if (!navLinksContainer.contains(e.target) && e.target !== mobileToggle) {
        navLinksContainer.classList.remove('active');
        mobileToggle.textContent = '☰';
        mobileToggle.classList.remove('active');
      }
    });
  }


  // ==========================================
  // 10. LOAD SAVED PREFERENCES (SAFE INITIALIZATION END)
  // ==========================================
  const savedTheme = localStorage.getItem('koda-theme') || 'cocoa';
  switchTheme(savedTheme);

  const savedLayout = localStorage.getItem('koda-layout') || 'a';
  switchLayout(savedLayout);

});
