/* ================================================
   자기소개 홈페이지 — script.js
   ================================================

   ✏️  내용을 수정하려면 아래 SITE_CONFIG 객체만 편집하세요!
   ================================================ */

const SITE_CONFIG = {
  /* ── 기본 정보 ── */
  name:     '현창훈',
  initials: '현창훈',
  title:    '순천대학교 조교수',
  tagline:  '언제든지 연락 주세요. 반갑게 대화 나누겠습니다.',

  /* ── 타이핑 효과 문구 ── */
  typingTexts: [
    '순천대학교 조교수입니다 🎓',
    '컴퓨터공학 연구를 합니다 💻',
    '새로운 기술을 탐구합니다 🚀',
    '함께 성장하는 교육을 지향합니다 🤝',
  ],

  /* ── 이메일 ── */
  email: 'chhyun@scnu.ac.kr',

  /* ── 소셜 링크 ── (빈 배열 = 표시 안 함) */
  socials: [],

  /* ── YouTube 영상 ──
     videoId: YouTube URL의 ?v= 뒤 코드
     si: 공유 파라미터 (선택)
  */
  videos: [
    {
      videoId:     '8ar2Oo2AFBE',
      si:          'Y4jgBnQzXUXAwoKw',
      title:       '연구 소개 영상',
      description: '현창훈 교수의 연구 및 강의 소개 영상입니다.',
    },
  ],

  /* ── 갤러리 사진 ──
     src: 파일 경로 (현재 디렉토리 기준)
     alt / caption: 사진 설명
  */
  gallery: [
    { src: 'img1.jpg', alt: '현창훈 교수 사진', caption: '사진1' },
  ],

  /* ── 경력/학력 타임라인 ──
     type: 'career' | 'education' | 'award'
     year: 기간 문자열
     org:  기관명
     role: 직책/학위명
     desc: 상세 설명 (빈 문자열이면 미표시)
  */
  timeline: [
    {
      type: 'career',
      year: '2026.03 – 현재',
      org:  '순천대학교',
      role: '조교수',
      desc: '컴퓨터공학과 조교수로 재직 중입니다.',
    },
    {
      type: 'career',
      year: '2025.10 – 2026.03',
      org:  '부산대학교',
      role: '포스트닥터 연구원',
      desc: '부산대학교에서 포스트닥터 연구를 수행하였습니다.',
    },
    {
      type: 'career',
      year: '2024.09 – 2025.09',
      org:  '경북대학교',
      role: '포스트닥터 연구원',
      desc: '경북대학교에서 포스트닥터 연구를 수행하였습니다.',
    },
    {
      type: 'education',
      year: '박사 취득',
      org:  '경북대학교',
      role: '컴퓨터공학 공학박사',
      desc: '경북대학교 컴퓨터공학과에서 박사학위를 취득하였습니다.',
    },
  ],
};


/* ================================================
   초기화 — DOM 로드 후 실행
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  checkFileProtocol();   // file:// 감지 → 배너 표시
  buildYoutube();
  buildGallery();
  buildTimeline();
  initTyping();
  initNavbar();
  initScrollAnimations();
  initLightbox();
  initBackToTop();
  initTimelineFilter();
});

/* ── file:// 접속 감지 → 배너 표시, 썸네일+링크 모드 ── */
function checkFileProtocol() {
  if (window.location.protocol !== 'file:') return;
  const banner = document.getElementById('fileBanner');
  if (banner) banner.style.display = 'flex';
}


/* ── 기본 정보 적용 ── */
function applyConfig() {
  const cfg = SITE_CONFIG;

  // Hero
  const heroName = document.getElementById('heroName');
  if (heroName) heroName.textContent = cfg.name;

  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) heroTitle.textContent = cfg.title;

  // Nav logo & footer logo
  document.querySelectorAll('.nav-logo, #footerLogo').forEach(el => {
    el.textContent = cfg.initials;
  });

  // Footer tagline
  const tagline = document.getElementById('footerTagline');
  if (tagline) tagline.textContent = cfg.tagline;

  // Email
  const emailLink = document.getElementById('footerEmailLink');
  const emailText = document.getElementById('footerEmailText');
  if (emailLink) emailLink.href = `mailto:${cfg.email}`;
  if (emailText) emailText.textContent = cfg.email;

  // Copyright
  const copy = document.getElementById('footerCopy');
  if (copy) copy.textContent = `© ${new Date().getFullYear()} ${cfg.name}. All rights reserved.`;

  // 페이지 title & meta
  document.title = `${cfg.name} — 포트폴리오`;

  // Socials
  const socialContainer = document.getElementById('footerSocial');
  if (socialContainer) {
    socialContainer.innerHTML = cfg.socials
      .map(s => `
        <a href="${s.href}" class="social-icon" aria-label="${s.label}" title="${s.label}"
           ${s.href !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''}>
          ${s.icon}
        </a>`)
      .join('');
  }
}


/* ── YouTube 그리드 생성 (썸네일 → 클릭 시 동일 페이지 재생) ── */
function buildYoutube() {
  const grid = document.getElementById('youtubeGrid');
  if (!grid) return;

  grid.innerHTML = SITE_CONFIG.videos.map((v, i) => {
    const siParam  = v.si ? `&si=${v.si}` : '';
    // autoplay=1 : 클릭 후 iframe 삽입 시 자동 재생
    const embedSrc = `https://www.youtube.com/embed/${v.videoId}?rel=0&modestbranding=1&autoplay=1${siParam}`;
    // 고화질 썸네일 (maxresdefault 없으면 hqdefault 로 fallback)
    const thumbMax = `https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg`;
    const thumbHQ  = `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

    return `
      <div class="youtube-card reveal">
        <div class="youtube-embed yt-thumb-wrap" id="ytWrap${i}" data-src="${embedSrc}">
          <img
            class="yt-thumb"
            src="${thumbMax}"
            alt="${v.title} 썸네일"
            onerror="this.src='${thumbHQ}'"
          />
          <button
            class="yt-play-btn"
            onclick="ytPlay('ytWrap${i}')"
            aria-label="${v.title} 재생">
            <svg viewBox="0 0 68 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path class="yt-play-bg" d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"/>
              <path class="yt-play-arrow" d="M45 24 27 14v20"/>
            </svg>
          </button>
        </div>
        <div class="youtube-info">
          <h3>${v.title}</h3>
          <p>${v.description}</p>
        </div>
      </div>
    `;
  }).join('');
}

/* 썸네일 클릭 → 같은 자리에 iframe 삽입 (새 탭 열지 않음) */
function ytPlay(wrapperId) {
  const wrap = document.getElementById(wrapperId);
  if (!wrap) return;
  const src = wrap.dataset.src;
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = 'YouTube video player';
  iframe.frameBorder = '0';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  iframe.allowFullscreen = true;
  // 썸네일 + 버튼을 iframe 으로 교체 (동일 div 안)
  wrap.innerHTML = '';
  wrap.appendChild(iframe);
}




/* ── 갤러리 그리드 생성 ── */
function buildGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  grid.innerHTML = SITE_CONFIG.gallery.map((item, i) => `
    <div class="gallery-item reveal" data-index="${i}" tabindex="0" role="button"
         aria-label="${item.caption} 사진 보기">
      <img src="${item.src}" alt="${item.alt}" loading="lazy"
           onerror="this.parentElement.style.display='none'">
      <div class="gallery-overlay">
        <div class="gallery-overlay-icon" aria-hidden="true">🔍</div>
        <p>${item.caption}</p>
      </div>
    </div>
  `).join('');
}


/* ── 타임라인 생성 ── */
function buildTimeline(filter = 'all') {
  const wrapper = document.getElementById('timelineWrapper');
  if (!wrapper) return;

  const items = SITE_CONFIG.timeline.filter(
    item => filter === 'all' || item.type === filter
  );

  const tagMap = {
    career:    { label: '💼 경력',  cls: 'tag-career' },
    education: { label: '🎓 학력',  cls: 'tag-education' },
    award:     { label: '🏆 수상',  cls: 'tag-award' },
  };

  wrapper.innerHTML = items.map((item, i) => {
    const tag = tagMap[item.type] || { label: item.type, cls: 'tag-career' };
    const side = i % 2 === 0 ? '' : 'right';
    return `
      <div class="timeline-item ${side} type-${item.type}" data-type="${item.type}">
        <div class="timeline-card">
          <div class="timeline-year">${item.year}</div>
          <span class="timeline-tag ${tag.cls}">${tag.label}</span>
          <div class="timeline-org">${item.org}</div>
          <div class="timeline-role">${item.role}</div>
          ${item.desc ? `<div class="timeline-desc">${item.desc}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  // 스크롤 애니메이션 재등록
  observeTimelineItems();
}


/* ── 타임라인 필터 ── */
function initTimelineFilter() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      buildTimeline(btn.dataset.filter);
    });
  });
}


/* ── 타이핑 애니메이션 ── */
function initTyping() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const texts = SITE_CONFIG.typingTexts;
  let textIdx = 0, charIdx = 0, deleting = false;

  function tick() {
    const current = texts[textIdx];
    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        textIdx = (textIdx + 1) % texts.length;
      }
    }
    setTimeout(tick, deleting ? 50 : 80);
  }
  tick();
}


/* ── 네비게이션 ── */
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // 스크롤 시 배경 추가
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // 모바일 토글
  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // 메뉴 링크 클릭 시 닫기
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}


/* ── 스크롤 reveal 애니메이션 ── */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}


/* ── 타임라인 아이템 reveal ── */
function observeTimelineItems() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), 100);
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.1 }
  );

  document.querySelectorAll('.timeline-item').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.08}s`;
    observer.observe(el);
  });
}


/* ── 라이트박스 ── */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightboxImg');
  const lbCap    = document.getElementById('lightboxCaption');
  const lbCnt    = document.getElementById('lightboxCounter');
  const lbClose  = document.getElementById('lightboxClose');
  const lbPrev   = document.getElementById('lightboxPrev');
  const lbNext   = document.getElementById('lightboxNext');

  let currentIdx = 0;
  const gallery  = SITE_CONFIG.gallery;

  function openLightbox(idx) {
    currentIdx = idx;
    const item = gallery[idx];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCap.textContent = item.caption;
    lbCnt.textContent = `${idx + 1} / ${gallery.length}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function showPrev() {
    currentIdx = (currentIdx - 1 + gallery.length) % gallery.length;
    openLightbox(currentIdx);
  }

  function showNext() {
    currentIdx = (currentIdx + 1) % gallery.length;
    openLightbox(currentIdx);
  }

  // 갤러리 클릭 (이벤트 위임)
  document.getElementById('galleryGrid').addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    openLightbox(parseInt(item.dataset.index, 10));
  });

  // 키보드 접근성 (Enter / Space)
  document.getElementById('galleryGrid').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const item = e.target.closest('.gallery-item');
      if (item) {
        e.preventDefault();
        openLightbox(parseInt(item.dataset.index, 10));
      }
    }
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click',  showPrev);
  lbNext.addEventListener('click',  showNext);

  // 배경 클릭 닫기
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // 키보드 단축키
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showPrev();
    if (e.key === 'ArrowRight')  showNext();
  });
}


/* ── Back to Top ── */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
