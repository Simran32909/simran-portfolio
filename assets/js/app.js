/* Utilities */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Initialize animations and interactions */
class PortfolioApp {
  constructor() {
    this.header = document.querySelector('.site-header');
    this.lastScroll = window.scrollY;
    this.scrollTimeout = null;
    this.heroParallax = document.querySelector('.hero-parallax');
    this.projectCards = document.querySelectorAll('.project-card');
    this.techItems = document.querySelectorAll('.tech-item');
    
    this.init();
  }

  init() {
    this.initYear();
    this.initNav();
    this.initScrollEffects();
    this.initRevealAnimations();
    this.initSmoothScroll();
    if (!prefersReducedMotion) {
      this.initParallax();
      this.initCardTilt();
      this.initTechHover();
    }
    this.initTechIcons();
  }

  initYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');
    const overlay = document.querySelector('.menu-overlay');
    
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      document.documentElement.classList.toggle('menu-open', !expanded);
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        document.documentElement.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    }

    // Update active nav item on scroll
    const navLinks = nav.querySelectorAll('.nav-link');
    const sections = Array.from(navLinks).map(link => {
      const id = link.getAttribute('href').substring(1);
      return document.getElementById(id);
    }).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('active', 
              link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));
  }

  initScrollEffects() {
    let ticking = false;
    
    const onScroll = () => {
      const currentScroll = window.scrollY;
      const scrollingDown = currentScroll > this.lastScroll;
      
      // Handle header show/hide
      if (currentScroll > 100) {
        this.header.classList.add('scrolled');
        if (scrollingDown) {
          this.header.classList.add('hidden');
        } else {
          this.header.classList.remove('hidden');
        }
      } else {
        this.header.classList.remove('scrolled', 'hidden');
      }
      
      this.lastScroll = currentScroll;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  initRevealAnimations() {
    if (prefersReducedMotion) {
      document.querySelectorAll('[data-animate]')
        .forEach(el => el.classList.add('in'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px'
    });

    document.querySelectorAll('[data-animate]')
      .forEach(el => observer.observe(el));
  }

  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const hash = link.getAttribute('href');
        if (!hash || hash === '#') return;
        
        const target = document.querySelector(hash);
        if (!target) return;
        
        e.preventDefault();
        
        // Close mobile menu if open
        document.documentElement.classList.remove('menu-open');
        document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
        
        // Smooth scroll
        target.scrollIntoView({ 
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    });
  }

  initParallax() {
    let ticking = false;
    
    const onMouseMove = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const { clientX, clientY } = e;
          const { innerWidth, innerHeight } = window;
          
          // Parallax for hero section
          if (this.heroParallax) {
            const moveX = (clientX / innerWidth - 0.5) * 20;
            const moveY = (clientY / innerHeight - 0.5) * 20;
            this.heroParallax.style.transform = 
              `translate(${moveX}px, ${moveY}px)`;
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
  }

  initCardTilt() {
    this.projectCards.forEach(card => {
      let raf;
      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rx = (y - 0.5) * -8;
          const ry = (x - 0.5) * 8;
          card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
          const media = card.querySelector('.project-media');
          if (media) {
            media.style.setProperty('--mx', `${x * 100}%`);
            media.style.setProperty('--my', `${y * 100}%`);
          }
        });
      };
      const onLeave = () => {
        cancelAnimationFrame(raf);
        card.style.transform = '';
      };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }

  initTechHover() {
    this.techItems.forEach(item => {
      item.addEventListener('mouseenter', () => item.classList.add('focus'));
      item.addEventListener('mouseleave', () => item.classList.remove('focus'));
    });
  }

  initTechIcons() {
    const map = new Map([
      // Languages
      ['Python', ['Python','Anaconda-Light','Anaconda-Dark']],
      ['JavaScript', ['JavaScript','Babel','JS']],
      ['C++', ['CPP','C.svg','CPP.svg']],
      ['Java', ['Java','Azul','AndroidStudio-Light']],
      ['TypeScript', ['TypeScript','TS']],
      ['Go', ['Go','Golang']],
      ['SQL', ['SQL','MySQL','PostgreSQL']],
      ['Bash', ['Bash','Bash-Dark','Bash-Light']],
      
      // ML & AI
      ['PyTorch', ['PyTorch','Torch','Lightning']],
      ['TensorFlow', ['TensorFlow','Tensorflow']],
      ['Hugging Face', ['HuggingFace','Transformers']],
      ['PyTorch Lightning', ['PyTorchLightning','Lightning']],
      ['OpenCV', ['OpenCV']],
      ['Scikit-learn', ['Scikit-learn','Sklearn','Python']],
      ['DeepSpeed', ['DeepSpeed']],
      ['TensorRT', ['TensorRT']],
      
      // Web & Databases
      ['Flask', ['Flask']],
      ['Springboot', ['SpringBoot','Spring']],
      ['React', ['React']],
      ['Next.js', ['NextJS','Next.js','Next']],
      ['Node.js', ['NodeJS','Node.js','Node']],
      ['Express.js', ['Express','ExpressJS','NodeJS']],
      ['REST APIs', ['RestAPI','API']],
      ['SQL', ['SQL','MySQL','PostgreSQL']],
      
      // Tools & Libraries
      ['Git', ['Git']],
      ['Docker', ['Docker']],
      ['Linux', ['Linux','Arch-Dark','Arch-Light','Debian-Dark','Debian-Light']],
      ['NumPy', ['NumPy','Numpy']],
      ['Pandas', ['Pandas']],
      ['llama.cpp', ['LlamaCPP','Llama']],
      ['Streamlit', ['Streamlit']],
      ['Wandb', ['Wandb','WeightsBiases']],
      
      // Additional project technologies
      ['Phi-2', ['Phi','Microsoft']],
      ['Hydra', ['Hydra','OmegaConf']],
      ['Transformers', ['Transformers','HuggingFace']],
      ['QLoRA', ['QLoRA','LoRA']],
      ['GGUF', ['GGUF','GGML']],
      ['LLaMA', ['LLaMA','Llama']],
      ['PEFT', ['PEFT','ParameterEfficient']],
      ['LoRA', ['LoRA','LowRank']],
      ['CLIP', ['CLIP','OpenAI']],
      ['Retrieval', ['Retrieval','Search']],
      ['Cosine Similarity', ['Cosine','Similarity']],
      ['NumPy', ['NumPy','Numpy']],
      
      // Additional mappings for better coverage
      ['Bootstrap', ['Bootstrap']],
      ['CMake', ['CMake','CMake-Dark','CMake-Light']],
      ['CLion', ['CLion','CLion-Dark','CLion-Light']],
      ['GitHub', ['GitHub','GitHub-Dark','GitHub-Light']],
      ['HTML', ['HTML','CSS']],
      ['CSS', ['CSS']],
      ['LaTeX', ['LaTeX','TeX']],
      ['Markdown', ['Markdown','MD','DevTo-Light']],
      ['MySQL', ['MySQL']],
      ['PostgreSQL', ['PostgreSQL','Postgres']],
      ['Nginx', ['Nginx','NGINX']],
      ['npm', ['npm','NPM']],
      ['PhpStorm', ['PhpStorm','PHPStorm']],
      ['Spring', ['Spring','SpringBoot']],
      ['Svelte', ['Svelte']],
      ['Three.js', ['ThreeJS','Three.js']],
      ['MongoDB', ['MongoDB']],
      ['tRPC', ['tRPC','TRPC']],
      ['Cypress', ['Cypress-Dark','Cypress-Light','Cypress']],
      ['React Query', ['ReactQuery','TanStackQuery','React-Query']],
      ['Material UI', ['MaterialUI','MUI']]
    ]);

    const basePath = 'icons/';
    const variants = (name) => {
      if (name.endsWith('.svg')) return [name];
      return [`${name}.svg`, `${name}-Dark.svg`, `${name}-Light.svg`];
    };

    const createPlaceholder = (label) => {
      const abbr = label.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).map(w => w[0]).slice(0,2).join('').toUpperCase();
      const ph = document.createElement('div');
      ph.className = 'tech-fallback';
      ph.textContent = abbr || '*';
      return ph;
    };

    const tryLoad = (item, files, idx = 0) => {
      if (idx >= files.length) return; // give up
      const img = new Image();
      img.className = 'tech-icon';
      img.width = 28; img.height = 28;
      img.onload = () => {
        // build structure: <img/><span>Label</span>
        const label = item.textContent.trim();
        item.textContent = '';
        item.prepend(img);
        const span = document.createElement('span');
        span.textContent = label;
        item.appendChild(span);
      };
      img.onerror = () => {
        if (idx + 1 < files.length) return tryLoad(item, files, idx + 1);
        // final fallback placeholder
        const label = item.textContent.trim();
        item.textContent = '';
        item.prepend(createPlaceholder(label));
        const span = document.createElement('span');
        span.textContent = label;
        item.appendChild(span);
      };
      img.src = basePath + files[idx];
    };

    this.techItems.forEach(item => {
      const label = item.textContent.trim();
      const candidates = map.get(label) || [];
      const files = candidates.flatMap(variants);
      if (files.length > 0) {
        tryLoad(item, files);
      }
    });
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioApp();
});

/* Active section nav + progress bar + scroll-top */
(() => {
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const bar = document.querySelector('.progress-bar');
  const topBtn = document.querySelector('.scroll-top');
  const setActive = (id) => {
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
  };
  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.max(0, Math.min(1, docHeight ? scrollTop / docHeight : 0));
    if (bar) bar.style.width = `${pct * 100}%`;
    if (topBtn) topBtn.classList.toggle('show', scrollTop > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { threshold: 0.55 });
  sections.forEach(s => s && observer.observe(s));

  if (topBtn) topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
})();

/* Project media cursor glow follows pointer */
(() => {
  if (prefersReducedMotion) return;
  const medias = document.querySelectorAll('.project-media');
  medias.forEach(m => {
    m.addEventListener('pointermove', (e) => {
      const rect = m.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      m.style.setProperty('--mx', `${x}%`);
      m.style.setProperty('--my', `${y}%`);
    });
  });
})();


