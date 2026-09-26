/**
 * PulseWave Audio Player — Enterprise Edition
 * Task 3: Music Player — Arch Technologies Internship
 * @version 2.0.0
 */

'use strict';

/* ========================================================================
   1. CONSTANTS & CONFIGURATION
   ======================================================================== */

const TRACKS = Object.freeze([
  { id: 1, title: "Midnight Reverie", artist: "Aura & Synth Lab", genre: "Lo-Fi", duration: "2:45",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
    src: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3" },
  { id: 2, title: "Neon Horizon", artist: "RetroWave Collective", genre: "Synthwave", duration: "3:10",
    cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80",
    src: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3" },
  { id: 3, title: "Cyber Protocol 2077", artist: "Zero Day Unit", genre: "Cyberpunk", duration: "2:30",
    cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=cyberpunk-2099-10701.mp3" },
  { id: 4, title: "Deep Focus Echoes", artist: "Solitude Space", genre: "Ambient", duration: "3:40",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
    src: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_73142e0bc2.mp3?filename=ambient-piano-amp-strings-10711.mp3" },
  { id: 5, title: "Tokyo Rainy Night", artist: "Komorebi Beats", genre: "Lo-Fi", duration: "2:15",
    cover: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80",
    src: "https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d65b1111.mp3?filename=rainy-day-in-tokyo-lofi-chill-124976.mp3" },
  { id: 6, title: "Electromagnetic Pulse", artist: "Vector Void", genre: "Synthwave", duration: "2:55",
    cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
    src: "https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=modern-synthwave-116527.mp3" }
]);

const CONFIG = Object.freeze({
  DEFAULT_VOLUME: 0.85,
  SEEK_STEP: 5,
  SPEED_OPTIONS: Object.freeze([1.0, 1.25, 1.5, 2.0]),
  FFT_SIZE: 128,
  BAR_COUNT: 64,
  SMOOTHING: 0.82,
  STORAGE: Object.freeze({ VOLUME: 'pw_vol', LIKED: 'pw_liked', LAST: 'pw_last' }),
  TOAST_MS: 2500,
  SEARCH_DELAY: 200
});

/* ========================================================================
   2. APPLICATION STATE
   ======================================================================== */

const state = {
  trackIndex: 0,
  isPlaying: false,
  isShuffle: false,
  repeatMode: 0,  // 0=off, 1=all, 2=one
  category: 'All',
  searchQuery: '',
  speedIndex: 0,
  liked: new Set(),
  filtered: [...TRACKS],
  audioCtx: null,
  analyser: null,
  sourceNode: null,
  vizInit: false,
  rafId: null,
  canvasW: 0,
  canvasH: 0
};

/* ========================================================================
   3. DOM ELEMENT CACHE
   ======================================================================== */

const dom = {};

function cacheDom() {
  const ids = [
    'audio-element','btn-play','play-icon','btn-prev','btn-next',
    'btn-shuffle','btn-shuffle-all','btn-repeat','repeat-icon',
    'btn-speed','btn-mute','volume-icon','volume-slider',
    'seek-bar-container','seek-progress','seek-thumb',
    'current-time','total-duration','search-input','clear-search',
    'category-filters','track-list','current-cover','current-title',
    'current-artist','current-genre','hero-bg-blur','bar-cover',
    'bar-title','bar-artist','btn-like','visualizer-canvas',
    'section-title','track-count','up-next-indicator','up-next-title',
    'volume-tooltip','toast-container'
  ];
  ids.forEach(id => { dom[toCamelCase(id)] = document.getElementById(id); });
}

/* ========================================================================
   4. UTILITIES
   ======================================================================== */

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/** Sanitize text — prevents XSS via plain text content */
function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function debounce(fn, ms) {
  let t = null;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

function showToast(msg, type = 'info') {
  const c = dom.toastContainer;
  if (!c) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, CONFIG.TOAST_MS);
}

function persist(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
function retrieve(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }

/* ========================================================================
   5. WEB AUDIO API INITIALIZATION
   ======================================================================== */

function initAudioContext() {
  if (state.audioCtx) return;
  try {
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    state.analyser = state.audioCtx.createAnalyser();
    state.analyser.fftSize = CONFIG.FFT_SIZE;
    state.analyser.smoothingTimeConstant = CONFIG.SMOOTHING;
    state.sourceNode = state.audioCtx.createMediaElementSource(dom.audioElement);
    state.sourceNode.connect(state.analyser);
    state.analyser.connect(state.audioCtx.destination);
    state.vizInit = true;
  } catch (err) {
    console.error('[PulseWave] Web Audio init failed:', err);
    showToast('Audio visualization unavailable', 'error');
  }
}

/* ========================================================================
   6. VISUALIZER ENGINE
   ======================================================================== */

function startVisualizer() {
  if (!state.vizInit || state.rafId) return;
  const canvas = dom.visualizerCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
      state.canvasW = rect.width;
      state.canvasH = rect.height;
    }
  }
  resizeCanvas();

  const bufferLength = state.analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    state.rafId = requestAnimationFrame(draw);
    resizeCanvas();
    state.analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, state.canvasW, state.canvasH);
    const barWidth = state.canvasW / CONFIG.BAR_COUNT;
    const gap = 2;
    for (let i = 0; i < CONFIG.BAR_COUNT; i++) {
      const idx = Math.floor(i * bufferLength / CONFIG.BAR_COUNT);
      const value = dataArray[idx] / 255;
      const barH = Math.max(2, value * state.canvasH * 0.9);
      const x = i * barWidth;
      const y = state.canvasH - barH;
      const grad = ctx.createLinearGradient(x, y, x, state.canvasH);
      grad.addColorStop(0, `rgba(0,240,255,${0.4 + value * 0.6})`);
      grad.addColorStop(1, `rgba(121,40,202,${0.2 + value * 0.4})`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x + gap / 2, y, barWidth - gap, barH, [3, 3, 0, 0]);
      ctx.fill();
    }
  }
  draw();
}

function stopVisualizer() {
  if (state.rafId) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
}

/* ========================================================================
   7. TRACK LIST RENDERING
   ======================================================================== */

function computeFilteredTracks() {
  let tracks = TRACKS;
  if (state.category !== 'All') {
    tracks = tracks.filter(t => t.genre === state.category);
  }
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    tracks = tracks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.genre.toLowerCase().includes(q)
    );
  }
  state.filtered = tracks;
  return tracks;
}

function renderTrackList() {
  const tracks = computeFilteredTracks();
  const container = dom.trackList;
  if (!container) return;

  dom.trackCount.textContent = `${tracks.length} ${tracks.length === 1 ? 'song' : 'songs'} available`;

  if (tracks.length === 0) {
    container.innerHTML = '<div class="empty-state"><h4>No tracks found</h4><p>Try a different search or category.</p></div>';
    return;
  }

  const frag = document.createDocumentFragment();
  const activeTrack = TRACKS[state.trackIndex];

  tracks.forEach((track, i) => {
    const isActive = track.id === activeTrack.id;
    const item = document.createElement('div');
    item.className = `track-item${isActive ? ' active-track' : ''}`;
    item.dataset.trackId = track.id;
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', String(isActive));
    item.setAttribute('tabindex', '0');
    item.innerHTML =
      '<div class="track-number"><span class="track-number-text">' + (i + 1) +
      '</span><div class="playing-indicator"><span></span><span></span><span></span><span></span></div></div>' +
      '<img class="track-thumb" src="' + escapeHtml(track.cover) + '" alt="" loading="lazy" />' +
      '<div class="track-info"><div class="track-title">' + escapeHtml(track.title) +
      '</div><div class="track-artist">' + escapeHtml(track.artist) + '</div></div>' +
      '<span class="track-genre-tag">' + escapeHtml(track.genre) + '</span>' +
      '<span class="track-duration">' + track.duration + '</span>';
    item.addEventListener('click', () => {
      const idx = TRACKS.findIndex(t => t.id === track.id);
      if (idx !== -1) loadTrack(idx, true);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const idx = TRACKS.findIndex(t => t.id === track.id);
        if (idx !== -1) loadTrack(idx, true);
      }
    });
    frag.appendChild(item);
  });

  container.innerHTML = '';
  container.appendChild(frag);
}

function updateActiveTrackHighlight() {
  document.querySelectorAll('.track-item').forEach(el => {
    const id = parseInt(el.dataset.trackId, 10);
    const isActive = id === TRACKS[state.trackIndex]?.id;
    el.classList.toggle('active-track', isActive);
    el.setAttribute('aria-selected', String(isActive));
  });
}

/* ========================================================================
   8. PLAYBACK CONTROLS
   ======================================================================== */

function loadTrack(index, autoplay = false) {
  if (index < 0 || index >= TRACKS.length) return;
  state.trackIndex = index;
  const track = TRACKS[index];

  // Update DOM
  dom.currentCover.src = track.cover;
  dom.currentTitle.textContent = track.title;
  dom.currentArtist.textContent = track.artist;
  dom.currentGenre.textContent = track.genre;
  dom.barCover.src = track.cover;
  dom.barTitle.textContent = track.title;
  dom.barArtist.textContent = track.artist;
  dom.heroBgBlur.style.backgroundImage = `url(${track.cover})`;

  // Audio element
  dom.audioElement.src = track.src;
  dom.audioElement.load();

  // Persist last track
  persist(CONFIG.STORAGE.LAST, index);

  // Update visual elements
  updateActiveTrackHighlight();
  updatePlayPauseUI(false);
  updateUpNext();

  // Restore liked state
  dom.btnLike.classList.toggle('liked', state.liked.has(track.id));
  dom.btnLike.setAttribute('aria-pressed', String(state.liked.has(track.id)));

  if (autoplay) {
    playTrack();
  }
}

async function playTrack() {
  try {
    initAudioContext();
    if (state.audioCtx?.state === 'suspended') {
      await state.audioCtx.resume();
    }
    await dom.audioElement.play();
    state.isPlaying = true;
    updatePlayPauseUI(true);
    startVisualizer();
  } catch (err) {
    console.warn('[PulseWave] Play blocked or failed:', err);
    showToast('Press play to start audio', 'info');
  }
}

function pauseTrack() {
  dom.audioElement.pause();
  state.isPlaying = false;
  updatePlayPauseUI(false);
  stopVisualizer();
}

function togglePlay() {
  if (state.isPlaying) {
    pauseTrack();
  } else {
    playTrack();
  }
}

function nextTrack() {
  let next;
  if (state.isShuffle) {
    next = Math.floor(Math.random() * TRACKS.length);
  } else {
    next = (state.trackIndex + 1) % TRACKS.length;
  }
  loadTrack(next, state.isPlaying);
}

function prevTrack() {
  // If more than 3 seconds in, restart current track
  if (dom.audioElement.currentTime > 3) {
    dom.audioElement.currentTime = 0;
    return;
  }
  let prev;
  if (state.isShuffle) {
    prev = Math.floor(Math.random() * TRACKS.length);
  } else {
    prev = (state.trackIndex - 1 + TRACKS.length) % TRACKS.length;
  }
  loadTrack(prev, state.isPlaying);
}

function updatePlayPauseUI(playing) {
  const icon = dom.playIcon;
  if (!icon) return;
  icon.setAttribute('data-lucide', playing ? 'pause' : 'play');
  dom.btnPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  lucide.createIcons();
}

function updateUpNext() {
  const nextIdx = state.isShuffle
    ? Math.floor(Math.random() * TRACKS.length)
    : (state.trackIndex + 1) % TRACKS.length;
  if (nextIdx !== state.trackIndex) {
    dom.upNextTitle.textContent = TRACKS[nextIdx].title;
    dom.upNextIndicator.classList.remove('hidden');
  }
}

/* ========================================================================
   9. PROGRESS / SEEK (with drag support)
   ======================================================================== */

let isSeeking = false;

function updateProgress() {
  if (isSeeking) return;
  const audio = dom.audioElement;
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  dom.seekProgress.style.width = pct + '%';
  dom.seekThumb.style.left = pct + '%';
  dom.currentTime.textContent = formatTime(audio.currentTime);
  dom.seekBarContainer.setAttribute('aria-valuenow', Math.round(pct));
}

function seekToPercent(pct) {
  const audio = dom.audioElement;
  if (!audio.duration || !Number.isFinite(audio.duration)) return;
  pct = Math.max(0, Math.min(100, pct));
  audio.currentTime = (pct / 100) * audio.duration;
  dom.seekProgress.style.width = pct + '%';
  dom.seekThumb.style.left = pct + '%';
  dom.currentTime.textContent = formatTime(audio.currentTime);
}

function getSeekPercent(e) {
  const rect = dom.seekBarContainer.getBoundingClientRect();
  return ((e.clientX - rect.left) / rect.width) * 100;
}

function initSeekDrag() {
  const bar = dom.seekBarContainer;
  if (!bar) return;

  bar.addEventListener('mousedown', (e) => {
    isSeeking = true;
    seekToPercent(getSeekPercent(e));
  });
  document.addEventListener('mousemove', (e) => {
    if (!isSeeking) return;
    seekToPercent(getSeekPercent(e));
  });
  document.addEventListener('mouseup', () => { isSeeking = false; });

  // Touch support
  bar.addEventListener('touchstart', (e) => {
    isSeeking = true;
    seekToPercent(getSeekPercent(e.touches[0]));
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (!isSeeking) return;
    seekToPercent(getSeekPercent(e.touches[0]));
  }, { passive: true });
  document.addEventListener('touchend', () => { isSeeking = false; });
}

/* ========================================================================
   10. VOLUME CONTROLS
   ======================================================================== */

function updateVolumeIcon(vol) {
  let icon = 'volume-2';
  if (vol === 0) icon = 'volume-x';
  else if (vol < 0.5) icon = 'volume-1';
  dom.volumeIcon.setAttribute('data-lucide', icon);
  lucide.createIcons();
}

function updateVolumeTooltip(vol) {
  if (dom.volumeTooltip) dom.volumeTooltip.textContent = Math.round(vol * 100) + '%';
}

function initVolumeControls() {
  const saved = retrieve(CONFIG.STORAGE.VOLUME);
  const vol = saved !== null ? saved : CONFIG.DEFAULT_VOLUME;
  dom.audioElement.volume = vol;
  dom.volumeSlider.value = vol;
  updateVolumeIcon(vol);
  updateVolumeTooltip(vol);

  dom.volumeSlider.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    dom.audioElement.volume = v;
    updateVolumeIcon(v);
    updateVolumeTooltip(v);
    persist(CONFIG.STORAGE.VOLUME, v);
  });

  dom.btnMute.addEventListener('click', () => {
    if (dom.audioElement.volume > 0) {
      dom.audioElement.dataset.prevVolume = dom.audioElement.volume;
      dom.audioElement.volume = 0;
      dom.volumeSlider.value = 0;
    } else {
      const prev = parseFloat(dom.audioElement.dataset.prevVolume) || CONFIG.DEFAULT_VOLUME;
      dom.audioElement.volume = prev;
      dom.volumeSlider.value = prev;
    }
    updateVolumeIcon(dom.audioElement.volume);
    updateVolumeTooltip(dom.audioElement.volume);
    persist(CONFIG.STORAGE.VOLUME, dom.audioElement.volume);
  });
}

/* ========================================================================
   11. SHUFFLE, REPEAT, SPEED
   ======================================================================== */

function initShuffleRepeatSpeed() {
  dom.btnShuffle.addEventListener('click', () => {
    state.isShuffle = !state.isShuffle;
    dom.btnShuffle.classList.toggle('active', state.isShuffle);
    dom.btnShuffle.setAttribute('aria-pressed', String(state.isShuffle));
    showToast(state.isShuffle ? 'Shuffle on' : 'Shuffle off', 'info');
  });

  dom.btnShuffleAll.addEventListener('click', () => {
    state.isShuffle = true;
    dom.btnShuffle.classList.add('active');
    dom.btnShuffle.setAttribute('aria-pressed', 'true');
    nextTrack();
  });

  dom.btnRepeat.addEventListener('click', () => {
    state.repeatMode = (state.repeatMode + 1) % 3;
    const labels = ['Off', 'All', 'One'];
    const label = labels[state.repeatMode];
    dom.btnRepeat.title = `Repeat: ${label}`;
    dom.btnRepeat.classList.toggle('active', state.repeatMode > 0);
    showToast(`Repeat: ${label}`, 'info');
  });

  dom.btnSpeed.addEventListener('click', () => {
    state.speedIndex = (state.speedIndex + 1) % CONFIG.SPEED_OPTIONS.length;
    const speed = CONFIG.SPEED_OPTIONS[state.speedIndex];
    dom.audioElement.playbackRate = speed;
    dom.btnSpeed.textContent = speed.toFixed(1) + 'x';
  });
}

/* ========================================================================
   12. LIKE / FAVORITES (persisted)
   ======================================================================== */

function initLikeButton() {
  const saved = retrieve(CONFIG.STORAGE.LIKED);
  if (Array.isArray(saved)) state.liked = new Set(saved);

  dom.btnLike.addEventListener('click', () => {
    const track = TRACKS[state.trackIndex];
    if (state.liked.has(track.id)) {
      state.liked.delete(track.id);
      showToast('Removed from favorites', 'info');
    } else {
      state.liked.add(track.id);
      showToast('Added to favorites', 'success');
    }
    dom.btnLike.classList.toggle('liked', state.liked.has(track.id));
    dom.btnLike.setAttribute('aria-pressed', String(state.liked.has(track.id)));
    persist(CONFIG.STORAGE.LIKED, [...state.liked]);
  });
}

/* ========================================================================
   13. CATEGORY FILTER & SEARCH
   ======================================================================== */

function initCategoryAndSearch() {
  dom.categoryFilters.addEventListener('click', (e) => {
    const item = e.target.closest('.cat-item');
    if (!item) return;
    document.querySelectorAll('.cat-item').forEach(el => {
      el.classList.remove('active');
      el.setAttribute('aria-selected', 'false');
      el.setAttribute('tabindex', '-1');
    });
    item.classList.add('active');
    item.setAttribute('aria-selected', 'true');
    item.setAttribute('tabindex', '0');
    state.category = item.dataset.category;
    dom.sectionTitle.textContent = state.category === 'All'
      ? 'All Tracks' : state.category + ' Collection';
    renderTrackList();
  });

  dom.categoryFilters.addEventListener('keydown', (e) => {
    const items = [...dom.categoryFilters.querySelectorAll('.cat-item')];
    const cur = items.findIndex(el => el.classList.contains('active'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (cur + 1) % items.length;
      items[next].click();
      items[next].focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (cur - 1 + items.length) % items.length;
      items[prev].click();
      items[prev].focus();
    }
  });

  const debouncedSearch = debounce((q) => {
    state.searchQuery = q;
    renderTrackList();
  }, CONFIG.SEARCH_DELAY);

  dom.searchInput.addEventListener('input', (e) => {
    const q = e.target.value;
    dom.clearSearch.classList.toggle('hidden', q.length === 0);
    debouncedSearch(q);
  });

  dom.clearSearch.addEventListener('click', () => {
    dom.searchInput.value = '';
    state.searchQuery = '';
    dom.clearSearch.classList.add('hidden');
    renderTrackList();
    dom.searchInput.focus();
  });
}

/* ========================================================================
   14. KEYBOARD SHORTCUTS
   ======================================================================== */

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.isContentEditable) return;
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowRight':
        e.preventDefault();
        dom.audioElement.currentTime = Math.min(
          dom.audioElement.currentTime + CONFIG.SEEK_STEP,
          dom.audioElement.duration || 0
        );
        break;
      case 'ArrowLeft':
        e.preventDefault();
        dom.audioElement.currentTime = Math.max(
          dom.audioElement.currentTime - CONFIG.SEEK_STEP, 0
        );
        break;
      case 'KeyM': dom.btnMute.click(); break;
      case 'KeyS': dom.btnShuffle.click(); break;
      case 'KeyN': nextTrack(); break;
      case 'KeyP': prevTrack(); break;
    }
  });
}

/* ========================================================================
   15. EVENT BINDINGS & ERROR HANDLING
   ======================================================================== */

function bindAudioEvents() {
  const audio = dom.audioElement;
  audio.addEventListener('timeupdate', updateProgress);

  audio.addEventListener('loadedmetadata', () => {
    dom.totalDuration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    if (state.repeatMode === 2) {
      audio.currentTime = 0;
      audio.play();
    } else if (state.repeatMode === 1) {
      nextTrack();
    } else {
      const filtered = state.filtered;
      const cur = filtered.findIndex(t => t.id === TRACKS[state.trackIndex]?.id);
      if (cur < filtered.length - 1) {
        nextTrack();
      } else {
        pauseTrack();
      }
    }
  });

  audio.addEventListener('error', () => {
    const err = audio.error;
    let msg = 'Audio playback error';
    if (err) {
      switch (err.code) {
        case MediaError.MEDIA_ERR_ABORTED: msg = 'Audio loading aborted'; break;
        case MediaError.MEDIA_ERR_NETWORK: msg = 'Network error loading audio'; break;
        case MediaError.MEDIA_ERR_DECODE: msg = 'Audio decoding error'; break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: msg = 'Audio format not supported'; break;
      }
    }
    console.error('[PulseWave]', msg);
    showToast(msg, 'error');
    pauseTrack();
  });

  dom.btnPlay.addEventListener('click', togglePlay);
  dom.btnPrev.addEventListener('click', prevTrack);
  dom.btnNext.addEventListener('click', nextTrack);
}

function bindGlobalErrorHandlers() {
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[PulseWave] Unhandled promise rejection:', e.reason);
  });
}

/* ========================================================================
   16. INITIALIZATION
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  try {
    cacheDom();
    bindAudioEvents();
    bindGlobalErrorHandlers();
    initVolumeControls();
    initShuffleRepeatSpeed();
    initLikeButton();
    initCategoryAndSearch();
    initKeyboardShortcuts();
    initSeekDrag();
    renderTrackList();

    const savedIdx = retrieve(CONFIG.STORAGE.LAST);
    const startIdx = (typeof savedIdx === 'number' && savedIdx >= 0 && savedIdx < TRACKS.length)
      ? savedIdx : 0;
    loadTrack(startIdx, false);

    if (typeof lucide !== 'undefined') lucide.createIcons();
    console.log('[PulseWave] Initialized (v2.0.0)');
  } catch (err) {
    console.error('[PulseWave] Init failed:', err);
  }
});