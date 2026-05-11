// ════════════════════════════════════════════
//  AUTO-DETECT: 이미지 & 영상 파일 감지
//  ─ 파일을 assets 폴더에 넣으면 자동 표시
//  ─ 파일이 없으면 해당 섹션/항목 자동 숨김
// ════════════════════════════════════════════

// ── Gallery: onerror 호출 시 아이템 제거 ──────
function removeGalleryItem(img) {
  img.closest('.gallery-item').remove();
  // 약간의 딜레이 후 갤러리 전체 가시성 체크
  clearTimeout(window._galleryCheckTimer);
  window._galleryCheckTimer = setTimeout(finalizeGallery, 200);
}

// 모든 이미지 로드 시도 후 처리
function finalizeGallery() {
  const items = document.querySelectorAll('.gallery-item');
  const section = document.getElementById('gallery');

  if (items.length === 0) {
    // 사진이 하나도 없으면 갤러리 섹션 숨김
    section.style.display = 'none';
  } else {
    // 사진이 있으면 섹션 표시
    section.style.display = '';
    // 라이트박스 이미지 목록 재구성
    rebuildLightbox();
  }
}

// ── Video: highlight.mp4 존재 여부 확인 ────────
async function initVideo() {
  const VIDEO_SRC = './assets/videos/highlight.mp4';
  const section   = document.getElementById('video-section');
  const videoEl   = document.getElementById('wedding-video');

  try {
    const res = await fetch(VIDEO_SRC, { method: 'HEAD' });
    if (res.ok) {
      videoEl.src = VIDEO_SRC;
      section.style.display = '';   // 섹션 표시
    }
    // 파일 없으면 섹션 그대로 숨김 (display:none 유지)
  } catch (_) {
    // 네트워크 오류 시에도 숨김 유지
  }
}


// ════════════════════════════════════════════
//  AOS 초기화
// ════════════════════════════════════════════
AOS.init({
  duration: 900,
  easing: 'ease-out-cubic',
  once: true,
  offset: 50,
});


// ════════════════════════════════════════════
//  D-Day 카운트다운
// ════════════════════════════════════════════
const WEDDING = new Date('2027-01-17T11:00:00');

function updateCountdown() {
  const diff = WEDDING - new Date();

  if (diff <= 0) {
    document.getElementById('cd-days').textContent  = '0';
    document.getElementById('cd-hours').textContent = '00';
    document.getElementById('cd-mins').textContent  = '00';
    return;
  }

  const days  = Math.floor(diff / 864e5);
  const hours = Math.floor((diff % 864e5) / 36e5);
  const mins  = Math.floor((diff % 36e5)  / 6e4);

  document.getElementById('cd-days').textContent  = days;
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent  = String(mins).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 30000);


// ════════════════════════════════════════════
//  스크롤 인디케이터 숨김
// ════════════════════════════════════════════
const scrollIndicator = document.querySelector('.scroll-indicator');
window.addEventListener('scroll', () => {
  if (!scrollIndicator) return;
  scrollIndicator.classList.toggle('fade-out', window.scrollY > 80);
}, { passive: true });


// ════════════════════════════════════════════
//  아코디언
// ════════════════════════════════════════════
function toggleAccordion(btn) {
  const body   = btn.nextElementSibling;
  const icon   = btn.querySelector('.acc-icon');
  const isOpen = body.classList.contains('open');

  // 모두 닫기
  document.querySelectorAll('.acc-body').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.acc-icon').forEach(i => i.classList.remove('open'));

  if (!isOpen) {
    body.classList.add('open');
    icon.classList.add('open');
  }
}


// ════════════════════════════════════════════
//  클립보드 복사
// ════════════════════════════════════════════
function copyText(text, btn) {
  const original = btn.textContent;

  const done = () => {
    btn.textContent = '복사완료 ✓';
    btn.classList.add('done');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('done');
    }, 2000);
  };

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(done).catch(fallback);
  } else {
    fallback();
  }

  function fallback() {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
    document.body.appendChild(el);
    el.focus(); el.select();
    try { document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(el);
    done();
  }
}


// ════════════════════════════════════════════
//  라이트박스
// ════════════════════════════════════════════
let galleryImages = [];
let currentIdx    = 0;

function rebuildLightbox() {
  // 현재 DOM에 남아있는 갤러리 이미지만 수집
  galleryImages = [...document.querySelectorAll('.gallery-item img')].map(i => i.src);
}

// 갤러리 클릭 — 이벤트 위임 방식 (동적 인덱스 계산)
document.addEventListener('click', e => {
  const item = e.target.closest('.gallery-item');
  if (!item) return;

  const visibleItems = [...document.querySelectorAll('.gallery-item')];
  const idx = visibleItems.indexOf(item);
  if (idx >= 0) openLightbox(idx);
});

function openLightbox(idx) {
  currentIdx = idx;
  const lb  = document.getElementById('lightbox');
  document.getElementById('lb-img').src = galleryImages[idx] || '';
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
  document.body.style.overflow = '';
}

function prevImg() {
  if (!galleryImages.length) return;
  currentIdx = (currentIdx - 1 + galleryImages.length) % galleryImages.length;
  document.getElementById('lb-img').src = galleryImages[currentIdx];
}

function nextImg() {
  if (!galleryImages.length) return;
  currentIdx = (currentIdx + 1) % galleryImages.length;
  document.getElementById('lb-img').src = galleryImages[currentIdx];
}

// 키보드 네비게이션
document.addEventListener('keydown', e => {
  if (document.getElementById('lightbox').style.display === 'none') return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  prevImg();
  if (e.key === 'ArrowRight') nextImg();
});


// ════════════════════════════════════════════
//  페이지 로드 후 자동 감지 실행
// ════════════════════════════════════════════
window.addEventListener('load', () => {
  // 갤러리: 남아있는 아이템으로 라이트박스 구성 + 섹션 표시
  finalizeGallery();

  // 영상: highlight.mp4 존재 시 영상 섹션 표시
  initVideo();
});
