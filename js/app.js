(() => {
  'use strict';

  // ================= CONFIG =================
  // Replace this with the real BADDIECULTURE WhatsApp number before launch.
  const WHATSAPP_NUMBER = '910000000000';
  const REDEEM_CODES = { MIORIMIORI: 15, THAPA15: 15, DIYA15: 15, KENTALORE15: 15, AC15: 15, TANITYA15: 15 , ADITI15: 15 };
  // Optional GA4 measurement ID. Replace with your real ID (G-XXXXXXXXXX) before launch.
  const ANALYTICS_MEASUREMENT_ID = 'G-XXXXXXXXXX';
  const DROP_TOTAL = 100;
  const DROP_AVAILABLE = 37;

  // The supplied transparent PNGs are used directly for the product cards.
  // The fighter layer PNGs are pre-registered to the same 432x578 coordinate space.
  const ASSET = {
    fighterBase: 'assets/fighter-base.png',
    fighterBaseTopClean: 'assets/fighter-base-top-clean.png',
    fighterBaseBottomClean: 'assets/fighter-base-bottom-clean.png',
    fighterBaseTopBottomClean: 'assets/fighter-base-top-bottom-clean.png',
    teeWhite: 'assets/fighter-tee-white.png',
    teeBlack: 'assets/fighter-tee-black.png',
    pantsCream: 'assets/fighter-pants-cream.png',
    pantsBlack: 'assets/fighter-pants-black.png',
    bandana: 'assets/fighter-bandana.png',
    cardTeeWhite: 'assets/tee-white.png',
    cardTeeBlack: 'assets/tee-black.png',
    cardPantsCream: 'assets/pants-cream.png',
    cardPantsBlack: 'assets/pants-black.png',
    cardBandana: 'assets/bandana.png'
  };

  const PRODUCTS = [
    {
      id: 'tee01', category: 'top', name: 'THE EYES', price: 700,
      fabric: '220GSM 90/10 COTTON-SPANDEX', fit: 'CROPPED / BOXY / STRETCHY', quality: 'SCREEN-PRINTED GRAPHIC', rarity: 'EPIC', sizes: ['XS','S','M','L'], lore: 'A signal for people who refuse to stay readable.', stats: { aura: 8, chaos: 7, style: 9, energy: 7 },
      colors: [
        { id: 'white', label: 'WHITE', dot: '#f5f5f0', photo: ASSET.cardTeeWhite, layer: ASSET.teeWhite },
        { id: 'black', label: 'BLACK', dot: '#111111', photo: ASSET.cardTeeBlack, layer: ASSET.teeBlack }
      ]
    },
    {
      id: 'sweat01', category: 'bottom', name: 'KISS SWEATPANTS', price: 800,
      fabric: '320GSM FLEECE', fit: 'RELAXED TAPERED', quality: 'EMBROIDERED GRAPHIC', rarity: 'RARE', sizes: ['S','M','L','XL','XXL'], lore: 'Built for disappearing into the city after dark.', stats: { aura: 7, chaos: 8, style: 9, energy: 8 },
      colors: [
        { id: 'cream', label: 'CREAM', dot: '#efe9da', photo: ASSET.cardPantsCream, layer: ASSET.pantsCream },
        { id: 'black', label: 'BLACK', dot: '#111111', photo: ASSET.cardPantsBlack, layer: ASSET.pantsBlack }
      ]
    },
    {
      id: 'band01', category: 'accessory', name: 'ANGEL BANDANA', price: 250,
      fabric: 'SATIN POLY WOVEN', fit: 'ONE SIZE', quality: 'ALL-OVER PRINT', rarity: 'ARCHIVED', sizes: ['55x55cm'], lore: 'A quiet relic from the archive. Wear it like a warning.', stats: { aura: 9, chaos: 9, style: 8, energy: 8 },
      colors: [{ id: 'default', label: 'ONE COLOR', dot: '#1a1a1a', photo: ASSET.cardBandana, layer: ASSET.bandana }]
    }
  ];

  const $ = id => document.getElementById(id);
  const els = {
    boot: $('screen-boot'), fill: $('boot-fill'), pct: $('boot-pct'), bootLog: $('boot-log'), bootEnter: $('boot-enter'), enterBtn: $('enter-btn'),
    productCard: $('product-card'), cat: $('product-cat'), img: $('product-img'), name: $('product-name'), price: $('product-price'),
    colorRow: $('color-row'), addBtn: $('add-btn'), count: $('stage-count'), imageIndex: $('image-index'), microCopy: $('micro-copy'),
    base: $('fighter-base'), bottom: $('fighter-bottom'), top: $('fighter-top'), accessory: $('fighter-accessory'), status: $('fighter-status'),
    proceed: $('proceed-btn'), tray: $('tray'), loadoutGrid: $('loadout-grid'), loadoutCount: $('loadout-count'),
    priceLines: $('price-lines'), redeemInput: $('redeem-input'), redeemBtn: $('redeem-btn'), redeemMsg: $('redeem-msg'),
    confirmBtn: $('confirm-btn'), confirmSummary: $('confirm-summary'), waLink: $('wa-link'), connecting: $('connecting-text'),
    infoToggle: $('info-toggle'), productInfo: $('product-info'), statsToggle: $('stats-toggle'), fighterStats: $('fighter-stats'), statAura: $('stat-aura'), statChaos: $('stat-chaos'), statStyle: $('stat-style'), statEnergy: $('stat-energy'),
    saveFit: $('save-fit-btn'), shareFit: $('share-fit-btn'), signalToast: $('signal-toast'), assetError: $('asset-error'), retryImg: $('retry-img'), dropCounter: $('drop-counter'),
    cartDrawer: $('cart-drawer'), cartFab: $('cart-fab'), cartClose: $('cart-close'), cartItems: $('cart-items'), cartTotal: $('cart-total'), cartBadge: $('cart-count-badge'), cartCheckout: $('cart-checkout'), soundToggle: $('sound-toggle')
  };

  let currentIndex = 0;
  let outfit = {}; // one item per category: top, bottom, accessory
  let selectedSizes = {};
  let selectedColorIdx = {};
  let appliedCode = null;
  let discountPct = 0;
  let infoOpen = false;
  let sessionStartedAt = Date.now();
  let loadoutStartedAt = null;
  let loadoutHasItems = false;
  const ANALYTICS_QUEUE_KEY = 'baddieculture-analytics-queue';
  const AUDIO_STORAGE_KEY = 'baddieculture-retro-sound';

  // ================= RETRO AUDIO ENGINE =================
  // Procedural arcade audio. SFX are always enabled; only background music
  // is user-toggleable. The browser may still block autoplay until a gesture.
  const RetroAudio = (() => {
    let ctx = null;
    let master = null;
    let musicGain = null;
    let sfxGain = null;
    let scheduler = null;
    let nextNoteTime = 0;
    let step = 0;
    let musicEnabled = true;
    let ready = false;
    const BPM = 150;
    const STEP = 60 / BPM / 2;
    const melody = [
      659.25, 0, 783.99, 0, 987.77, 0, 783.99, 0,
      659.25, 0, 587.33, 0, 523.25, 0, 587.33, 0,
      659.25, 0, 783.99, 0, 1046.50, 0, 987.77, 0,
      783.99, 0, 659.25, 0, 587.33, 0, 523.25, 0
    ];
    const bass = [
      164.81, 164.81, 196.00, 196.00, 130.81, 130.81, 146.83, 146.83,
      164.81, 164.81, 196.00, 196.00, 146.83, 146.83, 130.81, 130.81
    ];

    function makeContext() {
      if (ctx) return;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      ctx = new Ctx();
      master = ctx.createGain();
      musicGain = ctx.createGain();
      sfxGain = ctx.createGain();
      master.gain.value = 1.0;
      musicGain.gain.value = 0.24;
      sfxGain.gain.value = 0.42;
      musicGain.connect(master);
      sfxGain.connect(master);
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 8;
      compressor.ratio.value = 8;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.12;
      master.connect(compressor).connect(ctx.destination);
    }

    function tone(freq, duration, type='square', volume=0.16, when=null, endFreq=null) {
      if (!ctx || !sfxGain) return;
      const t = when ?? ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t + duration);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain).connect(sfxGain);
      osc.start(t);
      osc.stop(t + duration + 0.015);
    }

    function noise(duration=0.07, volume=0.08, when=null) {
      if (!ctx || !sfxGain) return;
      const t = when ?? ctx.currentTime;
      const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i=0; i<data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      src.buffer = buffer;
      src.connect(gain).connect(sfxGain);
      src.start(t);
    }

    function scheduleMusicNote(freq, when, duration, type='square', volume=0.7) {
      if (!ctx || !musicGain || !freq || !musicEnabled) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, when);
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.linearRampToValueAtTime(volume, when + 0.008);
      gain.gain.setValueAtTime(volume * 0.72, when + Math.max(0.02, duration * 0.45));
      gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      osc.connect(gain).connect(musicGain);
      osc.start(when);
      osc.stop(when + duration + 0.02);
    }

    function scheduleAhead() {
      if (!ctx || !ready || !musicEnabled) return;
      while (nextNoteTime < ctx.currentTime + 0.55) {
        const m = melody[step % melody.length];
        const b = bass[step % bass.length];
        if (m) scheduleMusicNote(m, nextNoteTime, STEP * 0.78, 'square', 0.7);
        if (step % 2 === 0) scheduleMusicNote(b, nextNoteTime, STEP * 1.65, 'triangle', 0.62);
        if (step % 4 === 0) noise(0.045, 0.055, nextNoteTime);
        if (step % 2 === 1) noise(0.018, 0.022, nextNoteTime + STEP * 0.18);
        step += 1;
        nextNoteTime += STEP;
      }
    }

    async function start() {
      try {
        makeContext();
        if (!ctx) return false;
        if (ctx.state === 'suspended') await ctx.resume();
        if (ctx.state !== 'running') return false;
        ready = true;
        step = 0;
        nextNoteTime = ctx.currentTime + 0.05;
        clearInterval(scheduler);
        scheduler = setInterval(scheduleAhead, 80);
        if (musicEnabled) {
          musicGain.gain.cancelScheduledValues(ctx.currentTime);
          musicGain.gain.setTargetAtTime(0.24, ctx.currentTime, 0.025);
          scheduleAhead();
        }
        return true;
      } catch (_) {
        ready = false;
        return false;
      }
    }

    function setMusic(on) {
      musicEnabled = !!on;
      if (!ctx) return;
      if (musicEnabled) {
        step = 0;
        nextNoteTime = ctx.currentTime + 0.05;
        musicGain.gain.cancelScheduledValues(ctx.currentTime);
        musicGain.gain.setTargetAtTime(0.24, ctx.currentTime, 0.025);
        scheduleAhead();
      } else {
        musicGain.gain.cancelScheduledValues(ctx.currentTime);
        musicGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.025);
      }
    }

    function play(name) {
      if (!ready || !ctx || !sfxGain) return;
      if (ctx.state === 'suspended') { ctx.resume(); return; }
      const t = ctx.currentTime;
      switch (name) {
        // Punchy Game Boy / 8-bit style UI click: short blip + tick + noise.
        case 'click':
          tone(1046.5, 0.045, 'square', 0.34, t, 523.25);
          tone(1568, 0.022, 'square', 0.18, t + 0.012, 1174.66);
          noise(0.018, 0.11, t);
          break;
        case 'select':
          tone(659.25, 0.052, 'square', 0.32, t, 1318.5);
          tone(987.77, 0.032, 'square', 0.16, t + 0.028, 783.99);
          break;
        case 'equip':
          tone(392, 0.07, 'square', 0.34, t, 783.99);
          tone(783.99, 0.075, 'square', 0.26, t + 0.05, 1567.98);
          noise(0.028, 0.09, t + 0.045);
          break;
        case 'random':
          tone(330, 0.045, 'square', 0.28, t, 660);
          tone(495, 0.045, 'square', 0.24, t + 0.045, 990);
          tone(742.5, 0.07, 'square', 0.28, t + 0.09, 1485);
          noise(0.05, 0.09, t + 0.14);
          break;
        case 'save': tone(523.25, 0.07, 'triangle', 0.12, t, 783.99); tone(783.99, 0.11, 'square', 0.11, t + 0.07, 1046.5); break;
        case 'share': tone(659.25, 0.06, 'square', 0.12, t, 987.77); tone(987.77, 0.1, 'triangle', 0.09, t + 0.06, 1318.5); break;
        case 'confirm': tone(523.25, 0.08, 'square', 0.14, t, 659.25); tone(783.99, 0.13, 'square', 0.12, t + 0.08, 1046.5); break;
        case 'back': tone(659.25, 0.06, 'square', 0.11, t, 392); break;
        case 'error': noise(0.08, 0.06, t); tone(160, 0.13, 'sawtooth', 0.08, t, 70); break;
        case 'glitch': noise(0.055, 0.07, t); tone(180, 0.045, 'sawtooth', 0.08, t, 760); tone(310, 0.055, 'square', 0.06, t + 0.045, 95); break;
        default: tone(660, 0.045, 'square', 0.11, t, 520);
      }
    }

    return { start, setMusic, play, isReady: () => ready, isMusicEnabled: () => musicEnabled };
  })();

  function initSound() {
    if (!els.soundToggle) return;

    // Music toggle controls ONLY the background track. Retro SFX remain on.
    els.soundToggle.addEventListener('click', toggleSound);

    let musicOff = false;
    try { musicOff = sessionStorage.getItem(AUDIO_STORAGE_KEY) === 'off'; } catch (_) {}
    const wantsMusic = !musicOff;
    RetroAudio.setMusic(wantsMusic);
    els.soundToggle.classList.toggle('is-on', wantsMusic);
    els.soundToggle.setAttribute('aria-pressed', String(wantsMusic));
    els.soundToggle.textContent = wantsMusic ? '♪ MUSIC: ON' : '♪ MUSIC: OFF';

    // Best-effort autoplay. If the browser blocks it, unlock on the first
    // pointer/key interaction. SFX remain permanently enabled after unlock.
    const unlock = async () => {
      const ok = await RetroAudio.start();
      if (ok) document.removeEventListener('pointerdown', unlock);
    };
    unlock();
    document.addEventListener('pointerdown', unlock, { passive:true });
  }

  async function toggleSound() {
    const next = !RetroAudio.isMusicEnabled();
    RetroAudio.setMusic(next);
    els.soundToggle.classList.toggle('is-on', next);
    els.soundToggle.setAttribute('aria-pressed', String(next));
    els.soundToggle.textContent = next ? '♪ MUSIC: ON' : '♪ MUSIC: OFF';
    try {
      if (next) sessionStorage.removeItem(AUDIO_STORAGE_KEY);
      else sessionStorage.setItem(AUDIO_STORAGE_KEY, 'off');
    } catch (_) {}
    if (!RetroAudio.isReady()) await RetroAudio.start();
  }

  function bindRetroSounds() {
    document.addEventListener('click', event => {
      const el = event.target.closest('button, a');
      if (!el || el.id === 'sound-toggle') return;
      let sound = 'click';
      if (el.matches('#prev-btn,#next-btn,.tray-slot')) sound = 'select';
      else if (el.matches('[data-preset]')) sound = 'select';
      else if (el.matches('#randomize-btn')) sound = 'random';
      else if (el.matches('#add-btn')) sound = 'equip';
      else if (el.matches('#save-fit-btn')) sound = 'save';
      else if (el.matches('#share-fit-btn')) sound = 'share';
      else if (el.matches('#proceed-btn,#cart-checkout,#confirm-btn,#wa-link')) sound = 'confirm';
      else if (el.matches('#back-to-select,#restart-btn,#cart-close')) sound = 'back';
      else if (el.matches('#brand-secret')) sound = 'glitch';
      else if (el.matches('#retry-img')) sound = 'error';
      RetroAudio.play(sound);
    }, { passive:true });
  }

  function trackEvent(name, params = {}) {
    const payload = { event: name, ...params, ts: Date.now() };
    try {
      const queue = JSON.parse(localStorage.getItem(ANALYTICS_QUEUE_KEY) || '[]');
      queue.push(payload);
      localStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(queue.slice(-100)));
    } catch (_) {}
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  function initAnalytics() {
    if (!ANALYTICS_MEASUREMENT_ID || ANALYTICS_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ANALYTICS_MEASUREMENT_ID);
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS_MEASUREMENT_ID, { send_page_view: true });
  }

  function outfitCombination() {
    return ['top','bottom','accessory'].map(category => { const item = outfit[category]; return item ? `${category}:${item.id}:${item.colorId}` : `${category}:none`; }).join('|');
  }

  function trackLoadoutChange(reason, item) {
    const items = Object.values(outfit);
    if (!loadoutStartedAt && items.length) loadoutStartedAt = Date.now();
    if (items.length) loadoutHasItems = true;
    trackEvent('outfit_changed', { reason, item_id: item?.id, category: item?.category, color: item?.colorId, item_count: items.length, value: calcSubtotal(), combination: outfitCombination() });
  }

  const STORAGE_KEY = 'baddieculture-v10-loadout';
  const PRESETS = {
    'default': {},
    'all-black': { top: ['tee01','black'], bottom: ['sweat01','black'], accessory: ['band01','default'] },
    'street': { top: ['tee01','black'], bottom: ['sweat01','cream'] },
    'angel': { top: ['tee01','white'], bottom: ['sweat01','cream'] },
    'full-fit': { top: ['tee01','white'], bottom: ['sweat01','cream'], accessory: ['band01','default'] }
  };

  const showScreen = name => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = $('screen-' + name);
    if (target) target.classList.add('active');
  };

  const currentColor = product => product.colors[selectedColorIdx[product.id] || 0];

  function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ outfit, selectedSizes, selectedColorIdx }));
    } catch (_) {}
  }

  function restoreState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved || !saved.outfit) return;
      outfit = saved.outfit || {};
      selectedSizes = saved.selectedSizes || {};
      selectedColorIdx = saved.selectedColorIdx || {};
    } catch (_) {}
  }

  function productById(id) { return PRODUCTS.find(p => p.id === id); }

  function makeOutfitFromPreset(name) {
    const preset = PRESETS[name];
    if (!preset) return;
    outfit = {};
    Object.entries(preset).forEach(([category, [productId, colorId]]) => {
      const product = productById(productId);
      if (!product) return;
      const colorIndex = product.colors.findIndex(c => c.id === colorId);
      if (colorIndex >= 0) selectedColorIdx[product.id] = colorIndex;
      const color = currentColor(product);
      outfit[category] = { id:product.id, category, name:product.name, price:product.price, fabric:product.fabric, fit:product.fit, quality:product.quality, rarity:product.rarity, sizes:product.sizes, lore:product.lore, stats:product.stats, colorId:color.id, colorLabel:color.label, photo:color.photo, layer:color.layer };
    });
    selectedSizes = {};
    Object.values(outfit).forEach(p => { selectedSizes[p.id] = p.sizes[0]; });
    persistState();
    trackLoadoutChange('preset');
    updateMannequin(); updateTray(); updateProceed(); renderProduct(); bumpSwap();
  }

  function randomizeFit() {
    outfit = {};
    selectedSizes = {};
    PRODUCTS.forEach(product => {
      if (Math.random() < 0.78) {
        const idx = Math.floor(Math.random() * product.colors.length);
        selectedColorIdx[product.id] = idx;
        const color = product.colors[idx];
        outfit[product.category] = { id:product.id, category:product.category, name:product.name, price:product.price, fabric:product.fabric, fit:product.fit, quality:product.quality, rarity:product.rarity, sizes:product.sizes, lore:product.lore, stats:product.stats, colorId:color.id, colorLabel:color.label, photo:color.photo, layer:color.layer };
        selectedSizes[product.id] = product.sizes[0];
      }
    });
    if (!Object.keys(outfit).length) {
      const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
      const idx = Math.floor(Math.random() * product.colors.length);
      selectedColorIdx[product.id] = idx;
      const color = product.colors[idx];
      outfit[product.category] = { id:product.id, category:product.category, name:product.name, price:product.price, fabric:product.fabric, fit:product.fit, quality:product.quality, rarity:product.rarity, sizes:product.sizes, lore:product.lore, stats:product.stats, colorId:color.id, colorLabel:color.label, photo:color.photo, layer:color.layer };
      selectedSizes[product.id] = product.sizes[0];
    }
    persistState(); trackLoadoutChange('randomize'); updateMannequin(); updateTray(); updateProceed(); renderProduct(); bumpSwap();
  }

  function calcStats() {
    const base = { aura:5, chaos:5, style:5, energy:5 };
    Object.values(outfit).forEach(item => {
      if (!item.stats) return;
      Object.keys(base).forEach(k => { base[k] += item.stats[k] || 0; });
    });
    return Object.fromEntries(Object.entries(base).map(([k,v]) => [k, Math.min(10, Math.round(v / Math.max(1, Object.keys(outfit).length + 1)))]));
  }

  function updateFighterHUD() {
    const stats = calcStats();
    els.statAura.textContent = String(stats.aura).padStart(2,'0');
    els.statChaos.textContent = String(stats.chaos).padStart(2,'0');
    els.statStyle.textContent = String(stats.style).padStart(2,'0');
    els.statEnergy.textContent = String(stats.energy).padStart(2,'0');
    const items = Object.values(outfit);
    if (els.cartBadge) renderCart();
  }

  function renderProductInfo(product, color) {
    els.productInfo.innerHTML = `<div class="info-grid"><span>FABRIC</span><b>${product.fabric}</b><span>FIT</span><b>${product.fit}</b><span>QUALITY</span><b>${product.quality}</b><span>COLOR</span><b>${color.label}</b></div><p>${product.lore}</p>`;
  }

  function showSignal(message) {
    els.signalToast.textContent = message;
    els.signalToast.classList.add('show');
    clearTimeout(showSignal.timer);
    showSignal.timer = setTimeout(() => els.signalToast.classList.remove('show'), 1800);
  }

  // ================= PRODUCT UI =================
  function renderProduct() {
    const product = PRODUCTS[currentIndex];
    trackEvent('product_view', { product_id: product.id, product_name: product.name, category: product.category, price: product.price, color: currentColor(product).id });
    const color = currentColor(product);
    els.cat.textContent = product.category.toUpperCase();
    els.img.loading = 'eager';
    els.img.decoding = 'async';
    els.img.src = color.photo;
    els.img.alt = `${product.name} — ${color.label}`;
    els.name.textContent = product.name;
    els.price.textContent = `₹${product.price}`;
    els.count.textContent = `${String(currentIndex + 1).padStart(2,'0')} / ${String(PRODUCTS.length).padStart(2,'0')}`;
    els.imageIndex.textContent = String(currentIndex + 1).padStart(2,'0');

    els.colorRow.innerHTML = '';
    product.colors.forEach((c, i) => {
      if (product.colors.length === 1 && c.label === 'ONE COLOR') return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `color-swatch pixel${i === (selectedColorIdx[product.id] || 0) ? ' selected' : ''}`;
      btn.innerHTML = `<span class="dot" style="background:${c.dot}"></span>${c.label}`;
      btn.addEventListener('click', () => { selectedColorIdx[product.id] = i; renderProduct(); });
      els.colorRow.appendChild(btn);
    });

    const selected = outfit[product.category];
    const isAdded = selected && selected.id === product.id && selected.colorId === color.id;
    els.addBtn.textContent = isAdded ? '✓ ADDED' : '× ADD TO OUTFIT';
    els.addBtn.classList.toggle('added', !!isAdded);
    els.microCopy.textContent = isAdded ? 'SELECTED // TAP AGAIN TO REMOVE' : 'SELECT A COLOR // ADD TO LOADOUT';
    renderProductInfo(product, color);
    els.productInfo.hidden = !infoOpen;
    els.infoToggle.setAttribute('aria-expanded', String(infoOpen));
    els.infoToggle.textContent = infoOpen ? '− HIDE ITEM DATA' : '+ ITEM DATA';
    updateFighterHUD();
  }

  function bumpSwap() {
    els.productCard.classList.remove('swap');
    void els.productCard.offsetWidth;
    els.productCard.classList.add('swap');
  }

  $('prev-btn').addEventListener('click', () => { currentIndex = (currentIndex - 1 + PRODUCTS.length) % PRODUCTS.length; renderProduct(); bumpSwap(); });
  $('next-btn').addEventListener('click', () => { currentIndex = (currentIndex + 1) % PRODUCTS.length; renderProduct(); bumpSwap(); });

  els.addBtn.addEventListener('click', () => {
    const p = PRODUCTS[currentIndex];
    const c = currentColor(p);
    const selected = outfit[p.category];
    if (selected && selected.id === p.id && selected.colorId === c.id) {
      delete outfit[p.category];
      trackEvent('remove_from_outfit', { product_id:p.id, category:p.category, color:c.id });
    } else {
      outfit[p.category] = { id:p.id, category:p.category, name:p.name, price:p.price, fabric:p.fabric, fit:p.fit, quality:p.quality, rarity:p.rarity, sizes:p.sizes, lore:p.lore, stats:p.stats, colorId:c.id, colorLabel:c.label, photo:c.photo, layer:c.layer };
      trackEvent('add_to_outfit', { product_id:p.id, category:p.category, color:c.id, price:p.price });
    }
    trackLoadoutChange('manual', outfit[p.category]);
    persistState(); updateMannequin(); updateTray(); updateProceed(); renderProduct();
  });

  els.infoToggle.addEventListener('click', () => {
    infoOpen = !infoOpen;
    trackEvent('item_data_toggle', { product_id: PRODUCTS[currentIndex].id, open: infoOpen });
    renderProduct();
  });

  // Preset controls are bound directly (rather than through document delegation)
  // so they remain reliable on touch devices and during screen transitions.
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      makeOutfitFromPreset(btn.dataset.preset);
      trackEvent('preset_selected', { preset: btn.dataset.preset, item_count: Object.keys(outfit).length, value: calcSubtotal() });
      showSignal(`PRESET // ${btn.textContent.trim()}`);
    });
  });
  const randomizeBtn = $('randomize-btn');
  if (randomizeBtn) {
    randomizeBtn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      randomizeFit();
      trackEvent('randomize_fit', { item_count: Object.keys(outfit).length, value: calcSubtotal() });
      showSignal('RANDOM FIT // GENERATED');
    });
  }

  // ================= FIGHTER LAYER SYSTEM =================
  // No combination-specific character files are required. The app swaps only the
  // affected category layer and chooses a clean base automatically.
  function setLayer(img, src, visible) {
    if (!visible) {
      img.classList.add('hidden');
      img.removeAttribute('src');
      return;
    }
    img.classList.remove('hidden');
    img.src = src;
    img.classList.remove('equipping');
    void img.offsetWidth;
    img.classList.add('equipping');
  }

  function updateMannequin() {
    const hasTop = !!outfit.top;
    const hasBottom = !!outfit.bottom;
    const hasAccessory = !!outfit.accessory;

    // V10 character system: the supplied 432x578 transparent character/layer
    // assets share the exact same coordinate space. Keep the V10 base as the
    // permanent character and place only the selected V10 garment layers above it.
    function setLayer(img, src, visible) {
      if (!visible) {
        img.classList.add('hidden');
        img.removeAttribute('src');
        return;
      }
      img.classList.remove('hidden');
      img.src = src;
      img.style.left = '0';
      img.style.top = '0';
      img.style.width = '100%';
      img.style.height = '100%';
      img.classList.remove('equipping');
      void img.offsetWidth;
      img.classList.add('equipping');
    }

    setLayer(els.base, ASSET.fighterBase, true);
    setLayer(els.bottom, hasBottom ? outfit.bottom.layer : '', hasBottom);
    setLayer(els.top, hasTop ? outfit.top.layer : '', hasTop);
    setLayer(els.accessory, hasAccessory ? ASSET.bandana : '', hasAccessory);

    const active = [];
    if (hasTop) active.push('TOP');
    if (hasBottom) active.push('BTM');
    if (hasAccessory) active.push('ACC');
    els.status.textContent = active.length ? `${active.join(' + ')} // ACTIVE` : 'BASE LOADOUT';
    updateFighterHUD();
  }

  function updateTray() {
    els.tray.querySelectorAll('.tray-slot').forEach(slot => {
      const filled = !!outfit[slot.dataset.slot];
      slot.classList.toggle('filled', filled);
      slot.setAttribute('aria-pressed', String(filled));
    });
  }

  els.statsToggle.addEventListener('click', () => {
    const open = els.statsToggle.getAttribute('aria-expanded') !== 'true';
    els.statsToggle.setAttribute('aria-expanded', String(open));
    els.fighterStats.hidden = !open;
    els.statsToggle.textContent = open ? '− FIGHTER DATA' : '+ FIGHTER DATA';
  });

  els.tray.querySelectorAll('.tray-slot').forEach(slot => slot.addEventListener('click', () => {
    const category = slot.dataset.slot;
    const product = PRODUCTS.find(p => p.category === category);
    if (!product) return;
    currentIndex = PRODUCTS.indexOf(product);
    renderProduct(); bumpSwap();
  }));

  function updateProceed() {
    const count = Object.keys(outfit).length;
    els.proceed.classList.toggle('enabled', count > 0);
    els.proceed.textContent = count ? `○ VIEW LOADOUT // ₹${calcSubtotal()}` : '○ VIEW LOADOUT';
    updateFighterHUD();
  }

  els.proceed.addEventListener('click', () => {
    if (!Object.keys(outfit).length) return;
    trackEvent('view_loadout', { item_count: Object.keys(outfit).length, value: calcSubtotal(), combination: outfitCombination() });
    renderLoadout(); showScreen('loadout');
  });
  $('back-to-select').addEventListener('click', () => showScreen('select'));

  // ================= LOADOUT =================
  function renderLoadout() {
    const items = Object.values(outfit);
    els.loadoutGrid.innerHTML = '';
    els.loadoutCount.textContent = `${items.length} ITEM${items.length === 1 ? '' : 'S'}`;

    items.forEach(p => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div class="item-thumb"><img src="${p.photo}" alt="${p.name} — ${p.colorLabel}" loading="lazy" decoding="async" width="500" height="500"></div>
        <div class="item-info">
          <div class="name pixel">${p.name} — ${p.colorLabel}</div>
          <div class="item-stats"><span>${p.fabric}</span><span>${p.fit}</span><span>${p.quality}</span><span>RARITY // ${p.rarity || "COMMON"}</span></div>
        </div>
        <div class="item-price pixel">₹${p.price}</div>
        <div class="variant-row" data-product="${p.id}">${(productById(p.id)?.colors || []).map((c,i) => `<button type="button" class="variant-btn pixel ${c.id===p.colorId?'selected':''}" data-color-index="${i}">${c.label}</button>`).join('')}</div>
        <div class="size-row" data-product="${p.id}">${p.sizes.map(size => `<button type="button" class="size-btn pixel ${selectedSizes[p.id]===size?'selected':''}" data-size="${size}">${size}</button>`).join('')}</div>`;
      els.loadoutGrid.appendChild(row);
    });

    els.loadoutGrid.querySelectorAll('.variant-row').forEach(row => {
      const productId = row.dataset.product;
      row.querySelectorAll('.variant-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const product = productById(productId);
          const idx = Number(btn.dataset.colorIndex);
          if (!product || !product.colors[idx]) return;
          const color = product.colors[idx];
          selectedColorIdx[productId] = idx;
          const category = product.category;
          outfit[category] = { ...outfit[category], colorId:color.id, colorLabel:color.label, photo:color.photo, layer:color.layer };
          persistState(); updateMannequin(); updateTray(); updateProceed(); renderProduct(); renderLoadout(); renderCart();
          trackEvent('variant_selected', { product_id:productId, color:color.id });
          showSignal(`COLOR // ${color.label}`);
        });
      });
    });

    els.loadoutGrid.querySelectorAll('.size-row').forEach(row => {
      const productId = row.dataset.product;
      row.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          row.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSizes[productId] = btn.dataset.size;
          trackEvent('size_selected', { product_id:productId, size:btn.dataset.size });
          persistState();
          updateConfirmState();
        });
      });
    });
    renderPriceBox(); updateConfirmState();
  }

  function calcSubtotal() { return Object.values(outfit).reduce((sum,p) => sum + p.price, 0); }
  function renderPriceBox() {
    const subtotal = calcSubtotal();
    const discount = Math.round(subtotal * discountPct / 100);
    const total = subtotal - discount;
    let html = Object.values(outfit).map(p => `<div class="price-line"><span>${p.name}</span><span>₹${p.price}</span></div>`).join('');
    if (discountPct) html += `<div class="price-line discount"><span>CODE: ${appliedCode} (-${discountPct}%)</span><span>-₹${discount}</span></div>`;
    html += `<div class="price-line total"><span>TOTAL</span><span>₹${total}</span></div>`;
    els.priceLines.innerHTML = html;
  }
  function updateConfirmState() {
    const ready = Object.values(outfit).length > 0 && Object.values(outfit).every(p => !!selectedSizes[p.id]);
    els.confirmBtn.disabled = !ready;
  }

  els.redeemBtn.addEventListener('click', () => {
    const code = els.redeemInput.value.trim().toUpperCase();
    if (!code) { els.redeemMsg.textContent = 'ENTER A CODE FIRST'; els.redeemMsg.className = 'redeem-msg err'; return; }
    if (REDEEM_CODES[code]) {
      appliedCode = code; discountPct = REDEEM_CODES[code]; els.redeemMsg.textContent = `CODE APPLIED: -${discountPct}%`; els.redeemMsg.className = 'redeem-msg ok';
    } else {
      appliedCode = null; discountPct = 0; els.redeemMsg.textContent = 'INVALID CODE'; els.redeemMsg.className = 'redeem-msg err';
    }
    renderPriceBox();
  });

  els.confirmBtn.addEventListener('click', () => { if (!els.confirmBtn.disabled) { trackEvent('order_intent', { item_count:Object.keys(outfit).length, value:calcSubtotal(), combination:outfitCombination(), discount_pct:discountPct }); prepareWhatsapp(); showScreen('confirm'); } });

  function prepareWhatsapp() {
    const subtotal = calcSubtotal();
    const discount = Math.round(subtotal * discountPct / 100);
    const total = subtotal - discount;
    const lines = Object.values(outfit).map(p => `• ${p.name} — ${p.colorLabel} — Size ${selectedSizes[p.id]}`).join('<br>');
    els.confirmSummary.innerHTML = `${lines}<br><br><strong>TOTAL: ₹${total}</strong>`;

    let message = 'NEW OUTFIT ORDER — BADDIECULTURE\n\n';
    Object.values(outfit).forEach(p => { message += `- ${p.name} (${p.colorLabel}, Size: ${selectedSizes[p.id]}) — ₹${p.price}\n`; });
    if (discountPct) message += `\nCode applied: ${appliedCode} (-${discountPct}%)\n`;
    message += `\nTOTAL: ₹${total}\n\nPlease confirm my order — I'll share delivery details next.`;

    els.waLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    els.connecting.style.display = 'block'; els.waLink.classList.remove('show');
    setTimeout(() => els.waLink.classList.add('show'), 700);
  }

  els.waLink.addEventListener('click', () => {
    trackEvent('whatsapp_order_click', { item_count:Object.keys(outfit).length, value:calcSubtotal(), combination:outfitCombination() });
  });

  function buildLoadoutURL() {
    const url = new URL(window.location.href);
    ['top','bottom','accessory'].forEach(category => {
      const item = outfit[category];
      if (item) url.searchParams.set(category, `${item.id}:${item.colorId}`);
      else url.searchParams.delete(category);
    });
    return url.toString();
  }

  function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const categories = ['top','bottom','accessory'];
    let found = false;
    outfit = {};
    selectedSizes = {};
    categories.forEach(category => {
      const raw = params.get(category);
      if (!raw) return;
      const [productId, colorId] = raw.split(':');
      const product = productById(productId);
      if (!product || product.category !== category) return;
      const idx = product.colors.findIndex(c => c.id === colorId);
      if (idx < 0) return;
      selectedColorIdx[product.id] = idx;
      const color = product.colors[idx];
      outfit[category] = { id:product.id, category, name:product.name, price:product.price, fabric:product.fabric, fit:product.fit, quality:product.quality, rarity:product.rarity, sizes:product.sizes, lore:product.lore, stats:product.stats, colorId:color.id, colorLabel:color.label, photo:color.photo, layer:color.layer };
      selectedSizes[product.id] = product.sizes[0];
      found = true;
    });
    if (found) { persistState(); return true; }
    return false;
  }

  function renderCart() {
    const items = Object.values(outfit);
    els.cartBadge.textContent = String(items.length);
    els.cartTotal.textContent = `₹${calcSubtotal()}`;
    els.cartItems.innerHTML = items.length ? items.map(p => `
      <div class="cart-item">
        <img src="${p.photo}" alt="${p.name} — ${p.colorLabel}" loading="lazy" decoding="async" width="500" height="500">
        <div><div class="pixel cart-item-name">${p.name}</div><div class="cart-item-meta">${p.colorLabel} · ${selectedSizes[p.id] || p.sizes[0]}</div></div>
        <button type="button" class="cart-remove pixel" data-remove-category="${p.category}" aria-label="Remove ${p.name}">×</button>
      </div>`).join('') : '<div class="cart-empty pixel">BASE // CART EMPTY</div>';
  }

  function openCart() { renderCart(); els.cartDrawer.classList.add('open'); els.cartDrawer.setAttribute('aria-hidden','false'); }
  function closeCart() { els.cartDrawer.classList.remove('open'); els.cartDrawer.setAttribute('aria-hidden','true'); }

  els.cartFab.addEventListener('click', openCart);
  els.cartClose.addEventListener('click', closeCart);
  els.cartCheckout.addEventListener('click', () => { if (Object.keys(outfit).length) { trackEvent('checkout_started', { item_count:Object.keys(outfit).length, value:calcSubtotal(), combination:outfitCombination() }); closeCart(); renderLoadout(); showScreen('loadout'); } });
  els.cartItems.addEventListener('click', event => {
    const btn = event.target.closest('[data-remove-category]');
    if (!btn) return;
    delete outfit[btn.dataset.removeCategory];
    persistState(); updateMannequin(); updateTray(); updateProceed(); renderProduct(); renderCart();
    showSignal('CART // ITEM REMOVED');
  });

  async function saveFitImage() {
    try {
      const blob = await createFitBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'baddieculture-fit.png';
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      trackEvent('fit_saved', { item_count:Object.keys(outfit).length, value:calcSubtotal() });
      showSignal('FIT // SAVED');
    } catch (_) { showSignal('FIT // SAVE ERROR'); }
  }
  els.saveFit.addEventListener('click', saveFitImage);

  async function shareCharacter() {
    const url = buildLoadoutURL();
    try {
      const blob = await createFitBlob();
      const file = new File([blob], 'baddieculture-fit.png', { type:'image/png' });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files:[file] }))) {
        await navigator.share({ title:'BADDIECULTURE // MY FIT', text:'My BADDIECULTURE fighter loadout.', url, files:[file] });
        trackEvent('fit_shared', { item_count:Object.keys(outfit).length, value:calcSubtotal(), combination:outfitCombination(), share_url:url });
        showSignal('FIT // SHARED');
        return;
      }
    } catch (err) { if (err && err.name === 'AbortError') return; }
    try {
      await navigator.clipboard.writeText(url);
      trackEvent('fit_shared', { item_count:Object.keys(outfit).length, value:calcSubtotal(), combination:outfitCombination(), share_url:url, method:'link_copy' });
      showSignal('LOADOUT LINK // COPIED');
    } catch (_) {
      window.prompt('COPY YOUR LOADOUT LINK', url);
    }
  }

  async function createFitBlob() {
    const canvas = document.createElement('canvas');
    canvas.width = 432; canvas.height = 578;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const urls = [ASSET.fighterBase, outfit.bottom?.layer, outfit.top?.layer, outfit.accessory ? ASSET.bandana : null].filter(Boolean);
    for (const src of urls) {
      const img = new Image(); img.src = src;
      await new Promise((resolve,reject)=>{ img.onload=resolve; img.onerror=reject; });
      ctx.drawImage(img,0,0,432,578);
    }
    ctx.fillStyle='#0a0a0a'; ctx.font='bold 12px monospace'; ctx.fillText('BADDIECULTURE // DROP_04',14,24);
    ctx.font='10px monospace'; ctx.fillText(`LOADOUT // ₹${calcSubtotal()}`,14,40);
    return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('blob failed')),'image/png'));
  }
  els.shareFit.addEventListener('click', shareCharacter);

  $('restart-btn').addEventListener('click', () => {
    outfit = {}; selectedSizes = {}; selectedColorIdx = {}; appliedCode = null; discountPct = 0; currentIndex = 0;
    els.redeemInput.value = ''; els.redeemMsg.textContent = ''; els.redeemMsg.className = 'redeem-msg';
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    updateMannequin(); updateTray(); updateProceed(); renderProduct(); showScreen('select');
  });

  let secretClicks = 0;
  let secretTimer;
  $('brand-secret').addEventListener('click', () => {
    secretClicks += 1;
    clearTimeout(secretTimer);
    secretTimer = setTimeout(() => { secretClicks = 0; }, 1200);
    if (secretClicks >= 5) { secretClicks = 0; showSignal('SIGNAL DETECTED // ARCHIVE ACCESS DENIED'); document.body.classList.add('signal-flash'); setTimeout(() => document.body.classList.remove('signal-flash'), 260); }
  });

  els.img.addEventListener('error', () => {
    els.img.alt = 'Product image unavailable';
    els.img.style.opacity = '0.35';
    if (els.assetError) els.assetError.hidden = false;
    trackEvent('asset_error', { product_id: PRODUCTS[currentIndex]?.id, asset: els.img.src });
  });
  els.img.addEventListener('load', () => { els.img.style.opacity = '1'; if (els.assetError) els.assetError.hidden = true; });
  if (els.retryImg) els.retryImg.addEventListener('click', () => {
    const product = PRODUCTS[currentIndex]; const color = currentColor(product);
    els.assetError.hidden = true; els.img.style.opacity = '1';
    els.img.src = color.photo + (color.photo.includes('?') ? '&' : '?') + 'retry=' + Date.now();
    trackEvent('asset_retry', { product_id: product.id });
  });

  window.addEventListener('pagehide', () => {
    const items = Object.values(outfit);
    if (loadoutHasItems && items.length) {
      trackEvent('abandoned_loadout', { duration_sec: Math.round(((Date.now() - (loadoutStartedAt || sessionStartedAt)) / 1000)), item_count:items.length, value:calcSubtotal(), combination:outfitCombination() });
    }
  });

  // ================= BOOT =================
  function runBoot() {
    let progress = 0, logIndex = 0, done = false;
    const logs = Array.from(els.bootLog.querySelectorAll('span'));
    els.fill.style.width = '0%'; els.pct.textContent = '00%'; logs.forEach(l => l.classList.remove('show'));
    if (els.bootEnter) { els.bootEnter.hidden = true; els.bootEnter.classList.remove('show'); }
    const finish = () => {
      if (done) return;
      done = true;
      els.fill.style.width='100%';
      els.pct.textContent='100%';
      logs.forEach(l=>l.classList.add('show'));
      if (els.bootEnter) {
        els.bootEnter.hidden = false;
        requestAnimationFrame(() => els.bootEnter.classList.add('show'));
        els.enterBtn?.focus({ preventScroll: true });
      }
    };
    const timer = setInterval(() => {
      progress = Math.min(100, progress + Math.random() * 6 + 4);
      els.fill.style.width = `${progress}%`; els.pct.textContent = `${Math.floor(progress).toString().padStart(2,'0')}%`;
      const target = Math.ceil((progress / 100) * logs.length);
      while (logIndex < target) { logs[logIndex].classList.add('show'); RetroAudio.play('click'); logIndex++; }
      if (progress >= 100) { clearInterval(timer); finish(); }
    }, 80);
    setTimeout(() => { clearInterval(timer); finish(); }, 5000);
  }

  // ================= INIT =================
  function preloadCharacterLayers() {
    const urls = [ASSET.fighterBase, ASSET.teeWhite, ASSET.teeBlack, ASSET.pantsCream, ASSET.pantsBlack, ASSET.bandana];
    return Promise.all(urls.map(src => new Promise(resolve => { const img = new Image(); img.decoding='async'; img.onload = img.onerror = resolve; img.src = src; })));
  }

  async function init() {
    initSound();
    bindRetroSounds();
    initAnalytics();
    const loadedFromURL = loadFromURL();
    if (!loadedFromURL) restoreState();
    renderProduct(); updateMannequin(); updateTray(); updateProceed();
    // Only character layers are preloaded. Product cards load on demand.
    preloadCharacterLayers();
    els.enterBtn?.addEventListener('click', async () => {
      const ok = await RetroAudio.start();
      if (ok) RetroAudio.play('confirm');
      showScreen('select');
    }, { once: true });
    runBoot();
    if (loadedFromURL) trackEvent('shared_loadout_opened', { item_count:Object.keys(outfit).length, value:calcSubtotal(), combination:outfitCombination() });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
