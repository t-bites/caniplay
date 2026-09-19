/* i18n.js — client-side runtime internationalization for CanIPlay
 * Strategy: static English baseline + data-i18n keys in markup + per-language
 * dictionary overlays applied at runtime. No server-side rendering, no static
 * page duplication. Language preference stored in localStorage, with ?lang= URL
 * override for sharing.
 */
(() => {
  'use strict';

  // ── supported languages ────────────────────────────────────────────────
  const LANGS = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ru'];
  const LANG_NAMES = {
    'en': 'English',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'ja': '日本語',
    'ko': '한국어',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'pt': 'Português',
    'ru': 'Русский',
  };

  // ── translations ───────────────────────────────────────────────────────
  // Keys mirror data-i18n attributes in markup. Keep values concise to fit
  // existing layouts (nav tabs, chips, buttons, table headers, toasts, etc.).
  const DICT = {
    'zh-CN': {
      // nav
      'nav.home': '首页',
      'nav.gear': '游戏硬件',
      'nav.top': '热门排行',
      'nav.features': '特性',
      'nav.news': '游戏资讯',
      'nav.sales': '折扣',
      // hero
      'hero.title': '我的电脑能玩这款游戏吗？',
      'hero.subtitle': '输入你的显卡、CPU 和内存，立刻得到兼容性 verdict。',
      'hero.search.ph': '搜索游戏（例如 GTA V）… 输入即搜',
      // stats (plural kept simple; numbers are dynamic)
      'stat.games': '款游戏',
      'stat.dlcs': '个 DLC',
      'stat.news': '条资讯',
      'stat.cpus': '款 CPU',
      'stat.gpus': '款 GPU',
      // CTA
      'cta.browse': '浏览全部游戏',
      'cta.top': '热门排行',
      'cta.deals': '折扣',
      // modules
      'mod.hot': '🔥 热门游戏',
      'mod.more': '查看全部 →',
      'mod.sales': '🎁 折扣',
      'mod.see_all': '查看全部优惠 →',
      'mod.coming': '⏳ 即将推出',
      'mod.upcoming': '浏览即将上线 →',
      // hardware panel
      'hw.title': '🖥️ 我的硬件',
      'hw.gpu.ph': '显卡（例如 RTX 3060）',
      'hw.cpu.ph': 'CPU（例如 i5-12400F）',
      'hw.ram': '内存',
      'hw.check': '检测',
      'hw.save_group': '+ 保存为新配置组',
      'hw.detect.gpu': '此浏览器无法检测显卡',
      'hw.detect.cpu': '此浏览器无法检测 CPU',
      'hw.hint': '手动输入你的硬件型号，点击「检测」查看游戏兼容性。',
      // gear module
      'gear.title': '🛒 游戏硬件',
      'gear.view_all': '查看全部 →',
      // news module
      'news.title': '📰 游戏资讯',
      'news.view_all': '查看全部 →',
      // breadcrumbs / page labels
      'crumb.home': '首页',
      // game page
      'game.reqs': '配置要求',
      'game.min': '最低配置',
      'game.rec': '推荐配置',
      'game.os': '操作系统',
      'game.cpu': '处理器',
      'game.gpu': '显卡',
      'game.mem': '内存',
      'game.disk': '存储',
      'game.verdict': ' verdict',
      'game.runs_great': '运行流畅',
      'game.below_min': '低于最低配置 — 可能无法运行',
      'game.min_label': '最低配置',
      'game.rec_label': '推荐配置',
      'game.open_store': '打开 Steam 商店页面',
      'game.similar': '相似游戏',
      // compare
      'cmp.title': '对比游戏',
      'cmp.close': '关闭',
      'cmp.add': '加入对比',
      'cmp.in_compare': '⚖ 已在对比',
      'cmp.remove': '移除',
      'cmp.hw_title': '对比硬件配置',
      'cmp.verdict': '能否运行？',
      'cmp.pass': '达标',
      'cmp.labels': { cpu: 'CPU', gpu: '显卡', mem: '内存', disk: '存储' },
      'cmp.can_play': '能否运行',
      // wishlist
      'wl.add': '加入愿望单',
      'wl.remove': '移除愿望单',
      'wl.title': '愿望单',
      'wl.view_all': '查看全部愿望单游戏',
      'wl.clear': '清空愿望单',
      'wl.clear_all': '清空全部愿望单',
      'wl.batch': '愿望单批量操作',
      'wl.selected': '已选择',
      'wl.remove_sel': '移除选中',
      // recent
      'recent.clear': '清空检测历史',
      'recent.clear_label': '清空我的检测历史',
      // sort / filter
      'sort.deals': '排序：折扣',
      'sort.biggest': '最大折扣',
      'sort.price_asc': '价格：低 → 高',
      'sort.feats': '排序：特性',
      'sort.players': '排序：在线人数',
      'sort.rank': '排序：排名',
      'sort.name': '排序：名称',
      'view.mode': '视图模式',
      'view.grid': '切换为列表视图',
      'view.list': '切换为网格视图',
      // price range
      'price.min': '最低价',
      'price.max': '最高价',
      // chips / breadcrumbs helpers
      'chip.jump_results': '跳转到搜索结果',
      'chip.remove_search': '移除搜索过滤',
      'chip.jump_genre': '跳转到分类',
      'chip.remove_genre': '移除分类过滤',
      'chip.jump_feat': '跳转到特性筛选结果',
      'chip.remove_feat': '移除特性过滤',
      'chip.jump_wl': '跳转到愿望单',
      'chip.remove_wl': '移除愿望单过滤',
      'chip.jump_price': '跳转到价格区间',
      'chip.remove_price': '移除价格过滤',
      // sparkline / history
      'spark.players': '在线玩家历史',
      'spark.rank': '排名历史',
      'spark.peak': '峰值',
      'spark.best': '最佳排名',
      'spark.window': '窗口',
      'spark.avg': '平均',
      'spark.median': '中位',
      'spark.d_ago': '天前',
      // toast / misc
      'toast.copied': '✅ 链接已复制',
      'toast.qr_fail': '二维码不可用',
      'toast.loading': '加载中…',
      'toast.back_to_top': '返回顶部',
      'kbd.search.ph': '搜索游戏 — 或显卡/CPU 型号…',
      'kbd.title': '搜索游戏和硬件（Ctrl+K）',
      'hw.vm.exact': '精确匹配：输入与数据库型号完全一致',
      'hw.vm.good': '系列匹配：按型号后缀匹配（如 "3060" → GeForce RTX 3060）',
      'hw.vm.warn': '部分匹配：未找到精确型号，显示名称最接近的结果',
      'hw.vm.loose': '最接近匹配：未找到精确型号，按名称相似度推荐',
      // nav footer
      'footer.tagline': 'CanIPlay — 游戏兼容性检测。硬件数据：PassMark。游戏数据：Steam。',
      'footer.deals': '优惠与免费游戏',
      // lang switcher
      'lang.label': '语言',
      // top-games
      'top.title': '热门游戏实时排行',
      'top.online': '当前在线',
      'top.live': '实时在线人数',
      'top.history': '历史趋势',
      'top.copy_link': '复制链接',
      'top.copy_position': '复制当前排名链接',
      // feature page
      'feat.title': '特性',
      'feat.back': '返回',
      'feat.games': '款游戏',
      'feat.view_all': '查看全部',
      // deals
      'deals.sort': '排序',
      'deals.filter': '筛选',
      'deals.scope': '范围',
      'deals.layout': '布局',
      // wl rank badges
      'wl.on_top': '在热门榜',
      'wl.online': '在线',
      'wl.combined': '收藏游戏合计在线',
      'wl.games_combined': '款收藏游戏合计',
      'wl.players_online': '名玩家在线',
      // rank locator
      'rank.loc': '定位到热门排行',
      'rank.loc_copy': '复制链接',
      'rank.loc_title': '点击复制当前排名链接',
      // rank table
      'rank.current': '当前在线',
      'rank.rank': '排名',
      'rank.game': '游戏',
      'rank.history': '历史',
      'rank.gap': '距最佳窗口',
      // settings / misc
      'settings.title': '设置',
      'settings.lang': '语言',
      // accessibility
      'a11y.wishlist.on': '从愿望单移除',
      'a11y.wishlist.off': '加入愿望单',
      'a11y.compare.add': '加入对比',
      'a11y.compare.remove': '从对比移除',
      'a11y.copy_link': '复制链接',
      'a11y.share': '分享',
      'a11y.close': '关闭',
      'a11y.loading': '加载中',
      'a11y.error': '错误',
      'a11y.no_results': '无结果',
      // error states
      'error.no_suggest': '您的硬件满足最低配置。查看「推荐配置」以获得更流畅体验。',
      'error.no_feat_index': '特性索引缺失',
      'error.no_features_bucket': '无特性分桶',
      'error.qr_fail': '二维码生成失败',
      'error.gpu_detect': '浏览器无法检测显卡',
      'error.cpu_detect': '浏览器无法检测 CPU',
      'error.load_more': '加载更多…',
    },
    'en': {
      // baseline: English strings are the default, no override needed.
      // Keep this object as identity map so we can merge uniformly.
    },
  };

  // ── helpers ────────────────────────────────────────────────────────────
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

  function getLang() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && LANGS.includes(urlLang)) return urlLang;
    const stored = localStorage.getItem('caniplay_lang');
    if (stored && LANGS.includes(stored)) return stored;
    // detect from browser
    const nav = (navigator.language || 'en');
    if (LANGS.includes(nav)) return nav;
    // fallback to primary subtag
    const primary = nav.split('-')[0];
    const match = LANGS.find(l => l.startsWith(primary + '-'));
    return match || 'en';
  }

  function setLang(lang) {
    if (!LANGS.includes(lang)) return;
    localStorage.setItem('caniplay_lang', lang);
    applyTranslations(lang);
    updateSwitcher(lang);
    // update html lang attribute
    document.documentElement.lang = lang === 'en' ? 'en' : lang;
  }

  // ── translation engine ─────────────────────────────────────────────────
  function t(key, fallback) {
    const dict = DICT[currentLang] || {};
    if (dict[key]) return dict[key];
    // fallback to English (identity)
    return fallback || key;
  }

  let currentLang = 'en';

  function applyTranslations(lang) {
    currentLang = lang;
    const dict = DICT[lang] || {};
    if (Object.keys(dict).length === 0) return; // English: nothing to do

    // 1) Static markup: elements with data-i18n attribute
    qsa('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = dict[key];
      if (!val) return;

      // For input placeholders
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.hasAttribute('placeholder')) {
          el.setAttribute('placeholder', val);
          return;
        }
      }

      // For buttons/links/headings: replace text content
      // Preserve child elements if any (e.g. <b> inside)
      if (el.children.length === 0) {
        el.textContent = val;
      } else {
        // Try to replace only text nodes, keeping markup
        replaceTextNodes(el, val);
      }
    });

    // 2) Dynamic app.js strings: postMessage bridge
    // app.js can call window.i18n.t(key, fallback) for runtime strings.
    // The dictionary above already includes all keys used by app.js.

    // 3) Update document title if needed
    const titleKey = qs('[data-i18n="page.title"]');
    if (titleKey) {
      document.title = titleKey.textContent || document.title;
    }

    // 4) Dispatch event for app.js listeners
    window.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang } }));
  }

  // Replace text inside an element while preserving markup when possible.
  // This is best-effort; for complex HTML structures, app.js should use
  // window.i18n.t() directly.
  function replaceTextNodes(root, newText) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);
    if (textNodes.length === 1) {
      textNodes[0].textContent = newText;
    } else if (textNodes.length > 1) {
      // Merge all text nodes into the first one
      const merged = textNodes.map(n => n.textContent).join('');
      textNodes[0].textContent = newText;
      textNodes.slice(1).forEach(n => n.textContent = '');
    }
  }

  // ── language switcher UI ───────────────────────────────────────────────
  function buildSwitcher() {
    const current = getLang();
    currentLang = current;

    const btn = document.createElement('div');
    btn.className = 'lang-switcher';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-label', t('lang.label', 'Language'));
    btn.title = t('lang.label', 'Language');

    const label = document.createElement('span');
    label.className = 'lang-label';
    label.textContent = LANG_NAMES[current] || current;

    const menu = document.createElement('div');
    menu.className = 'lang-menu';
    menu.hidden = true;

    LANGS.forEach(l => {
      const item = document.createElement('button');
      item.className = 'lang-item' + (l === current ? ' active' : '');
      item.type = 'button';
      item.textContent = LANG_NAMES[l] || l;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        setLang(l);
        menu.hidden = true;
      });
      menu.appendChild(item);
    });

    btn.appendChild(label);
    btn.appendChild(menu);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        menu.hidden = !menu.hidden;
      }
      if (e.key === 'Escape') menu.hidden = true;
    });

    document.addEventListener('click', () => { menu.hidden = true; });

    return btn;
  }

  function updateSwitcher(lang) {
    const switcher = document.querySelector('.lang-switcher');
    if (!switcher) return;
    const label = switcher.querySelector('.lang-label');
    if (label) label.textContent = LANG_NAMES[lang] || lang;
    qsa('.lang-item', switcher).forEach(item => {
      const l = [...item.parentNode.children].indexOf(item);
      item.classList.toggle('active', l === LANGS.indexOf(lang));
    });
  }

  function mountSwitcher() {
    // Insert into nav
    const nav = qs('.nav');
    if (!nav || document.querySelector('.lang-switcher')) return;
    const btn = buildSwitcher();
    nav.appendChild(btn);
  }

  // ── public API ─────────────────────────────────────────────────────────
  // app.js runtime strings use: window.i18n.t('key', 'English fallback')
  window.i18n = {
    t,
    getLang,
    setLang,
    LANGS,
    LANG_NAMES,
    dict: DICT,
  };

  // ── boot ───────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const lang = getLang();
    currentLang = lang;
    mountSwitcher();
    // apply after a tick so app.js initial render finishes first
    requestAnimationFrame(() => applyTranslations(lang));
  }
})();
