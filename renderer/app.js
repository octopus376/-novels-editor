const CHARS_PER_LINE = 15, STORAGE_KEY = 'novel-editor-data', INDENT = 2;
const $ = (s) => document.querySelector(s);

const state = {
  books: [], currentBookId: null, currentChapterId: null,
  quill: null, saveTimer: null, phoneVisible: true,
  selectedVolumeId: null
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
  loadAllData(); initQuill(); bindEvents(); bindMenuEvents();
  loadTheme(); updateClock(); setInterval(updateClock, 1000); renderRecentBooks();
  loadBg();
  // 语言切换按钮
  const toggleLang = () => {
    setLanguage(currentLang === 'zh' ? 'en' : 'zh');
    const label = currentLang === 'zh' ? '中/EN' : 'EN/中';
    const bl = $('#btn-toggle-lang'); if (bl) bl.textContent = label;
    const wl = $('#btn-welcome-lang'); if (wl) wl.textContent = label;
    updateDynamicI18n();
  };
  const bl = $('#btn-toggle-lang'); if (bl) bl.addEventListener('click', toggleLang);
  const wl = $('#btn-welcome-lang'); if (wl) wl.addEventListener('click', toggleLang);
  // 背景设置按钮
  const wbg = document.getElementById('btn-welcome-bg');
  if (wbg) wbg.addEventListener('click', showBgSettings);
  const pbg = document.getElementById('btn-pick-bg');
  if (pbg) pbg.addEventListener('click', pickBgImage);
  const rbg = document.getElementById('btn-remove-bg');
  if (rbg) rbg.addEventListener('click', removeBgImage);
  const sbg = document.getElementById('btn-save-bg');
  if (sbg) sbg.addEventListener('click', saveBgSettings);
  const cbg = document.getElementById('btn-cancel-bg');
  if (cbg) cbg.addEventListener('click', function() { hideModal('modal-bg-settings'); });
  const bgs = document.getElementById('bg-opacity-slider');
  if (bgs) bgs.addEventListener('input', function() { document.getElementById('bg-opacity-val').textContent = this.value + '%'; });
  // 初始标签
  const initLabel = currentLang === 'zh' ? '中/EN' : 'EN/中';
  const bl2 = $('#btn-toggle-lang'); if (bl2) bl2.textContent = initLabel;
  const wl2 = $('#btn-welcome-lang'); if (wl2) wl2.textContent = initLabel;
  // 字体大小恢复
  const fs = localStorage.getItem('novel-editor-font-size');
  if (fs) setTimeout(() => { const ed = document.querySelector('.ql-editor'); if (ed) ed.style.fontSize = fs + 'px'; }, 300);
});

function updateClock() {
  const st = $('#status-time'); if (st) {
    const n = new Date(); st.textContent = n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0');
  }
  const ct = $('#clock-time'); if (ct) {
    const n = new Date();
    ct.textContent = n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0')+':'+n.getSeconds().toString().padStart(2,'0');
  }
  const cd = $('#clock-date'); if (cd) {
    const n = new Date();
    cd.textContent = n.getFullYear()+'-'+(n.getMonth()+1).toString().padStart(2,'0')+'-'+n.getDate().toString().padStart(2,'0');
  }
  const cw = $('#clock-week'); if (cw) {
    const zhDays = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    const enDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    cw.textContent = currentLang === 'zh' ? zhDays[new Date().getDay()] : enDays[new Date().getDay()];
  }
}

// ==================== 数据 ====================
function loadAllData() { try { state.books = JSON.parse(localStorage.getItem(STORAGE_KEY))?.books || []; } catch(e) { state.books = []; } }
function saveAllData() { localStorage.setItem(STORAGE_KEY, JSON.stringify({ books: state.books })); }
function getBook(id) { return state.books.find(b => b.id === id); }
function getChapter(book, chId) { return book?.chapters?.find(c => c.id === chId); }

// ==================== Quill ====================
function initQuill() {
  state.quill = new Quill('#editor', {
    theme: 'snow',
    modules: { toolbar: false },
    placeholder: t('editorPlaceholder')
  });
  let _previewTimer = null;
  state.quill.on('text-change', () => {
    updateWordCount();
    scheduleAutoSave();
    if (_previewTimer) clearTimeout(_previewTimer);
    _previewTimer = setTimeout(() => updatePhonePreview(), 150);
  });
}

// ==================== 事件 ====================
function bindEvents() {
  $('#btn-new-book').addEventListener('click', () => { showModal('modal-new-book'); $('#input-new-book-title').focus(); });
  $('#btn-create-book').addEventListener('click', doCreateBook);
  $('#btn-cancel-new-book').addEventListener('click', () => { hideModal('modal-new-book'); _coverDataUrl = null; const cp = document.getElementById('cover-preview'); if (cp) cp.innerHTML = '📷'; });
  $('#btn-pick-cover')?.addEventListener('click', async () => {
    if (!window.novelAPI) return;
    const r = await window.novelAPI.pickImage();
    if (r?.success) {
      _coverDataUrl = await compressImage(r.dataUrl);
      const cp = document.getElementById('cover-preview');
      if (cp) cp.innerHTML = `<img src="${_coverDataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">`;
    }
  });
  $('#input-new-book-title').addEventListener('keydown', e => { if (e.key === 'Enter') doCreateBook(); });
  $('#btn-back-home').addEventListener('click', goHome);
  $('#btn-toggle-sidebar').addEventListener('click', () => $('#sidebar').classList.toggle('collapsed'));
  $('#btn-toggle-phone').addEventListener('click', () => { state.phoneVisible = !state.phoneVisible; $('#phone-panel').classList.toggle('hidden', !state.phoneVisible); });

  // 面板按钮不抢焦点 + 操作后归还焦点
  document.querySelectorAll('.action-panel button').forEach(btn => {
    btn.addEventListener('mousedown', e => e.preventDefault());
    btn.addEventListener('click', () => setTimeout(refocusEditor, 50));
  });
  // 侧栏按钮不抢焦点
  document.querySelectorAll('.sidebar button').forEach(btn => {
    btn.addEventListener('mousedown', e => e.preventDefault());
    btn.addEventListener('click', () => setTimeout(refocusEditor, 50));
  });
  // 点击编辑区自动聚焦
  document.querySelector('.editor-container')?.addEventListener('click', (e) => {
    if (!e.target.closest('.action-panel') && !e.target.closest('.modal-overlay') && !e.target.closest('.sidebar')) {
      setTimeout(refocusEditor, 30);
    }
  });
  // 关闭弹窗后恢复焦点
  document.querySelectorAll('.modal-overlay').forEach(m => {
    const observer = new MutationObserver(() => {
      if (m.style.display === 'none') setTimeout(refocusEditor, 100);
    });
    observer.observe(m, { attributes: true, attributeFilter: ['style'] });
  });

  // 自定义格式按钮
  document.querySelectorAll('.fmt-btn[data-fmt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const fmt = btn.dataset.fmt;
      const range = state.quill.getSelection();
      if (!range || range.length === 0) { flashHint(); return; }
      const current = state.quill.getFormat(range);
      state.quill.format(fmt, !current[fmt]);
      btn.classList.toggle('active', !current[fmt]);
    });
  });
  // 格式按钮状态同步
  state.quill.on('selection-change', (range) => {
    document.querySelectorAll('.fmt-btn[data-fmt]').forEach(btn => {
      if (range && range.length > 0) {
        const fmt = state.quill.getFormat(range);
        btn.classList.toggle('active', !!fmt[btn.dataset.fmt]);
      }
    });
  });

  // 颜色选择器
  const colors = [
    { name: '红', val: '#e53935' }, { name: '橙', val: '#fb8c00' },
    { name: '黄', val: '#fdd835' }, { name: '绿', val: '#43a047' },
    { name: '青', val: '#00acc1' }, { name: '蓝', val: '#1e88e5' },
    { name: '紫', val: '#8e24aa' }, { name: '黑', val: '#212121' },
    { name: '白', val: '#fafafa' }, { name: '灰', val: '#9e9e9e' },
    { name: '粉', val: '#ec407a' }, { name: '棕', val: '#795548' }
  ];
  const colorGrid = $('#color-grid');
  let _colorTarget = null, _pickedColor = null, _savedRange = null;
  colors.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'color-swatch';
    sw.style.background = c.val;
    sw.title = c.name;
    sw.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
      _pickedColor = c.val;
    });
    colorGrid.appendChild(sw);
  });

  function openColorPicker(target) {
    const sel = state.quill.getSelection();
    if (!sel || sel.length === 0) { flashHint(); return; }
    _savedRange = sel;
    _colorTarget = target;
    _pickedColor = null;
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    $('#color-pick-title').textContent = target === 'color' ? t('pickColorTitle') : t('pickBgTitle');
    showModal('modal-color-pick');
  }
  $('#btn-font-color').addEventListener('click', () => openColorPicker('color'));
  $('#btn-bg-color').addEventListener('click', () => openColorPicker('background'));
  $('#btn-confirm-color').addEventListener('click', () => {
    if (_pickedColor && _colorTarget && _savedRange) {
      state.quill.setSelection(_savedRange.index, _savedRange.length);
      state.quill.format(_colorTarget, _pickedColor);
    }
    hideModal('modal-color-pick');
  });
  $('#btn-cancel-color').addEventListener('click', () => hideModal('modal-color-pick'));

  // 清除格式
  $('#btn-clear-fmt').addEventListener('click', () => {
    const sel = state.quill.getSelection();
    if (!sel || sel.length === 0) { flashHint(); return; }
    state.quill.removeFormat(sel.index, sel.length);
    refocusEditor();
  });

  // 插图
  $('#btn-insert-image').addEventListener('click', () => { insertImage(); refocusEditor(); });

  // 导入
  $('#btn-import').addEventListener('click', importBook);

  $('#btn-export').addEventListener('click', () => showModal('modal-export'));
  $('#btn-cancel-export').addEventListener('click', () => hideModal('modal-export'));
  $('#btn-confirm-export').addEventListener('click', doExport);
  $('#btn-cancel-settings').addEventListener('click', () => hideModal('modal-book-settings'));
  $('#btn-save-settings').addEventListener('click', saveBookSettings);
  $('#btn-delete-book').addEventListener('click', deleteCurrentBook);
  $('#btn-close-help').addEventListener('click', () => hideModal('modal-help'));
  $('#theme-select').addEventListener('change', e => setTheme(e.target.value));
  $('#font-size-select').addEventListener('change', e => { const ed = document.querySelector('.ql-editor'); if (ed) ed.style.fontSize = e.target.value + 'px'; localStorage.setItem('novel-editor-font-size', e.target.value); });
  $('#btn-add-chapter').addEventListener('click', addChapter);
  $('#btn-add-volume').addEventListener('click', addVolume);
  $('#btn-confirm-volume').addEventListener('click', doAddVolume);
  $('#btn-cancel-volume').addEventListener('click', () => hideModal('modal-add-volume'));
  $('#input-volume-title').addEventListener('keydown', e => { if (e.key === 'Enter') doAddVolume(); });
  $('#chapter-title').addEventListener('input', onChapterTitleChange);
  $('#project-title').addEventListener('dblclick', () => showBookSettings());
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveCurrentChapter(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); doCreateBook(); }
  });
}

function bindMenuEvents() {
  if (!window.novelAPI) return;
  window.novelAPI.onMenuEvent('menu-new-book', () => { showModal('modal-new-book'); $('#input-new-book-title').focus(); });
  window.novelAPI.onMenuEvent('menu-export-txt', () => { $('#export-format').value='txt'; showModal('modal-export'); });
  window.novelAPI.onMenuEvent('menu-export-html', () => { $('#export-format').value='html'; showModal('modal-export'); });
  window.novelAPI.onMenuEvent('menu-theme', setTheme);
  window.novelAPI.onMenuEvent('menu-show-help', () => { updateHelpContent(); showModal('modal-help'); });
}

// ==================== 书籍 ====================
let _coverDataUrl = null;

function doCreateBook() {
  const title = $('#input-new-book-title').value.trim(); if (!title) return;
  const author = $('#input-new-book-author').value.trim();
  hideModal('modal-new-book'); $('#input-new-book-title').value = ''; $('#input-new-book-author').value = '';
  const book = { id: 'book-' + Date.now(), title, author,
    cover: _coverDataUrl || '',
    chapters: [{ id: 'ch-' + Date.now(), title: t('chapterDefault'), content: '', wordCount: 0, createdAt: new Date().toISOString() }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  state.books.unshift(book); saveAllData(); openBook(book.id);
  _coverDataUrl = null;
  const cp = document.getElementById('cover-preview'); if (cp) cp.innerHTML = '📷';
}

function openBook(bookId) {
  if (state.currentBookId) saveCurrentChapter();
  state.currentBookId = bookId; state.currentChapterId = null;
  const book = getBook(bookId); if (!book) return;
  $('#welcome-screen').style.display = 'none'; $('#editor-screen').style.display = 'flex';
  $('#project-title').textContent = '《' + book.title + '》'; renderChapterList();
  const fc = book.chapters[0]; if (fc) selectChapter(fc.id);
}

function goHome() {
  if (state.currentBookId) saveCurrentChapter();
  state.currentBookId = null; state.currentChapterId = null;
  $('#editor-screen').style.display = 'none'; $('#welcome-screen').style.display = 'flex'; renderRecentBooks();
}

function deleteCurrentBook() {
  const book = getBook(state.currentBookId); if (!book) return;
  hideModal('modal-book-settings');
  showConfirm(t('deleteBookConfirm', {title: book.title}), () => {
    state.books = state.books.filter(b => b.id !== state.currentBookId); saveAllData(); goHome();
  });
}

// 自定义确认弹窗（不抢焦点）
let _confirmCallback = null;
function showConfirm(msg, callback) {
  _confirmCallback = callback;
  $('#confirm-delete-msg').textContent = msg;
  showModal('modal-confirm-delete');
}
$('#btn-confirm-delete').addEventListener('click', () => { hideModal('modal-confirm-delete'); if (_confirmCallback) _confirmCallback(); });
$('#btn-cancel-delete').addEventListener('click', () => { hideModal('modal-confirm-delete'); _confirmCallback = null; });

// ==================== 章节 ====================
function addChapter() {
  const book = getBook(state.currentBookId); if (!book) return;
  const ch = { id: 'ch-' + Date.now(), title: t('chapterNew'), content: '', wordCount: 0, createdAt: new Date().toISOString() };
  if (state.selectedVolumeId && book.volumes?.find(v => v.id === state.selectedVolumeId)) {
    ch.volume = state.selectedVolumeId;
  }
  book.chapters.push(ch); book.updatedAt = new Date().toISOString(); saveAllData(); renderChapterList(); selectChapter(ch.id);
}

function addVolume() {
  const book = getBook(state.currentBookId); if (!book) return;
  $('#input-volume-title').value = t('volumeDefault', {n: (book.volumes?.length||0)+1});
  showModal('modal-add-volume');
  $('#input-volume-title').focus();
  $('#input-volume-title').select();
}

function doAddVolume() {
  const n = $('#input-volume-title').value.trim(); if (!n) return;
  hideModal('modal-add-volume');
  const book = getBook(state.currentBookId); if (!book) return;
  if (!book.volumes) book.volumes = [];
  book.volumes.push({ id: 'vol-'+Date.now(), title: n, order: book.volumes.length });
  state.selectedVolumeId = book.volumes[book.volumes.length - 1].id;
  book.updatedAt = new Date().toISOString(); saveAllData(); renderChapterList();
}

function selectChapter(chId) {
  if (state.currentChapterId && state.currentChapterId !== chId) saveCurrentChapter();
  state.currentChapterId = chId;
  const book = getBook(state.currentBookId), ch = getChapter(book, chId); if (!ch) return;
  $('#chapter-title').value = ch.title;
  if (ch.content) { const d = state.quill.clipboard.convert({ html: ch.content }); state.quill.setContents(d); }
  else { state.quill.setContents([]); state.quill.root.classList.add('ql-blank'); }
  updatePhonePreview(); updateWordCount(); updateChapterListActive();
  if (state.quill) { state.quill.enable(); state.quill.focus(); }
}

function saveCurrentChapter() {
  const book = getBook(state.currentBookId), ch = getChapter(book, state.currentChapterId);
  if (!book || !ch || !state.quill) return;
  ch.content = state.quill.root.innerHTML; ch.wordCount = getWordCount();
  book.updatedAt = new Date().toISOString(); saveAllData(); showSaved();
}

function deleteChapter(chId) {
  const book = getBook(state.currentBookId); if (!book || book.chapters.length <= 1) { flashHint(t('keepOneChapter')); return; }
  const wasCurrent = (state.currentChapterId === chId);
  let fallbackId = null;
  if (wasCurrent) {
    const idx = book.chapters.findIndex(c => c.id === chId);
    if (idx > 0) fallbackId = book.chapters[idx - 1].id;
    else if (idx < book.chapters.length - 1) fallbackId = book.chapters[idx + 1].id;
  }
  showConfirm(t('confirmDeleteChapter'), () => {
    book.chapters = book.chapters.filter(c => c.id !== chId); book.updatedAt = new Date().toISOString(); saveAllData();
    state.currentChapterId = null;
    const el = document.querySelector(`.chapter-item[data-chapter-id="${chId}"]`);
    if (el) el.remove();
    updateChapterNumbers();
    if (wasCurrent && fallbackId) selectChapter(fallbackId);
  });
}

function renameChapter(chId) {
  const book = getBook(state.currentBookId), ch = getChapter(book, chId); if (!ch) return;
  const n = prompt(t('renamePrompt'), ch.title); if (!n || n === ch.title) return;
  ch.title = n; book.updatedAt = new Date().toISOString(); saveAllData(); renderChapterList();
  if (state.currentChapterId === chId) $('#chapter-title').value = n;
}


// ==================== 分享与导入 ====================
async function showShareDialog(bookId) {
  const book = getBook(bookId);
  if (!book || !window.novelAPI) return;
  const data = JSON.stringify({
    v: 1,
    title: book.title,
    author: book.author || '',
    cover: book.cover || '',
    chapters: (book.chapters || []).map(ch => ({
      title: ch.title, content: ch.content || '', wordCount: ch.wordCount || 0
    })),
    volumes: book.volumes || [],
    createdAt: book.createdAt
  }, null, 2);
  const r = await window.novelAPI.saveNovelFile({ title: book.title, content: data });
  if (r?.success) flashHint(t('exportDone'));
}

async function importBook() {
  if (!window.novelAPI) return;
  const msg = $('#import-msg');
  const r = await window.novelAPI.openNovelFile();
  if (!r || !r.success) return;
  try {
    const data = JSON.parse(r.content);
    if (!data.title) throw new Error(t('importInvalid'));
    if (state.books.find(b => b.title === data.title)) {
      state.books = state.books.filter(b => b.title !== data.title);
    }
    const book = {
      id: 'book-' + Date.now(),
      title: data.title,
      author: data.author || '',
      cover: data.cover || '',
      chapters: (data.chapters || []).map(ch => ({
        id: 'ch-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
        title: ch.title, content: ch.content || '', wordCount: ch.wordCount || 0,
        createdAt: new Date().toISOString()
      })),
      volumes: data.volumes || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.books.unshift(book);
    saveAllData();
    renderRecentBooks();
    msg.textContent = t('importSuccessMsg', {title: book.title});
    msg.className = 'import-msg success';
  } catch(e) {
    msg.textContent = t('importFail');
    msg.className = 'import-msg error';
  }
}

async function insertImage() {
  if (!window.novelAPI || !state.quill) return;
  const result = await window.novelAPI.pickImage();
  if (!result || !result.success) return;
  const compressed = await compressImage(result.dataUrl);
  const range = state.quill.getSelection(true);
  const index = range ? range.index : state.quill.getLength();
  state.quill.insertEmbed(index, 'image', compressed);
  state.quill.setSelection(index + 1);
}

// 图片压缩：限制最大宽度400px，质量0.6
function compressImage(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 400;
      if (img.width <= maxW) { resolve(dataUrl); return; }
      const ratio = maxW / img.width;
      const canvas = document.createElement('canvas');
      canvas.width = maxW;
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function onChapterTitleChange() {
  const book = getBook(state.currentBookId), ch = getChapter(book, state.currentChapterId);
  if (ch) { ch.title = $('#chapter-title').value.trim() || t('unnamedChapter'); book.updatedAt = new Date().toISOString(); }
  updateChapterListActive(); debounceSaveMeta();
}

// ==================== 手机预览 ====================
function updatePhonePreview() {
  if (!state.quill) return;
  const c = $('#phone-reader-content'); if (!c) return;
  const items = extractQuillItems(state.quill.root);
  let html = '', totalChars = 0, totalLines = 0;
  if (items.length === 0) {
    c.innerHTML = '<div class="phone-empty-hint">' + t('phoneEmpty') + '</div>';
    $('#phone-line-count').textContent = '0 ' + t('phoneLines'); $('#phone-char-count').textContent = '0 ' + t('phoneWords');
    $('#phone-book-title').textContent = $('#chapter-title').value || t('chapterTitleDefault'); return;
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type === 'image') {
      html += `<div class="phone-reader-img"><img src="${item.src}" alt="${t('imageAlt')}"></div>`;
      html += '<div class="phone-reader-spacer"></div>';
      continue;
    }
    if (item.type === 'text') {
      const lines = formatToLines(item.text);
      totalChars += (item.text || '').replace(/\s/g, '').length;
      html += lines.map(l => {
        if (l.spacer) return '<div class="phone-reader-spacer"></div>';
        let cls = 'phone-reader-line';
        if (l.isFirst) cls += ' phone-line-first';
        if (l.isLast) cls += ' phone-line-last';
        const pre = l.isFirst ? '<span class="indent-gap"></span>' : '';
        totalLines++;
        return `<div class="${cls}">${pre}${escHtml(l.text)}</div>`;
      }).join('');
      if (i < items.length - 1 && items[i+1].type === 'text') {
        html += '<div class="phone-reader-spacer"></div>';
      }
    }
  }
  c.innerHTML = html;
  $('#phone-line-count').textContent = totalLines + ' ' + t('phoneLines');
  $('#phone-char-count').textContent = totalChars.toLocaleString() + ' ' + t('phoneWords');
  $('#phone-book-title').textContent = $('#chapter-title').value || t('chapterTitleDefault');
  c.scrollTop = c.scrollHeight;
}

// 从 Quill DOM 提取文本段落和图片
function extractQuillItems(root) {
  const items = [];
  let currentText = '';
  function walk(node) {
    if (node.nodeType === 3) { currentText += node.textContent; return; }
    if (node.nodeType !== 1) return;
    if (node.tagName === 'IMG') {
      if (currentText.trim()) { items.push({ type: 'text', text: currentText }); currentText = ''; }
      items.push({ type: 'image', src: node.getAttribute('src') });
      return;
    }
    const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'LI', 'BR'];
    if (blockTags.includes(node.tagName)) {
      if (node.tagName === 'BR') { currentText += '\n'; }
      else {
        if (currentText.trim()) { items.push({ type: 'text', text: currentText }); currentText = ''; }
        for (const child of node.childNodes) walk(child);
        if (currentText.trim()) { items.push({ type: 'text', text: currentText }); currentText = ''; }
      }
    } else { for (const child of node.childNodes) walk(child); }
  }
  for (const child of root.childNodes) walk(child);
  if (currentText.trim()) { items.push({ type: 'text', text: currentText }); }
  return items;
}

const LINE_START_FORBIDDEN = /^[，。！？；：、》」』）】》'"\.!,;:?\)\]\}】〉」』》〞〟]/;

function formatToLines(text) {
  if (!text) return [];
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = [];
  const paragraphs = normalized.split('\n');
  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim(); if (!para) continue;
    const cleaned = para.replace(/\s+/g, '');
    let raw = [];
    for (let j = 0; j < cleaned.length; j += CHARS_PER_LINE) raw.push(cleaned.substring(j, j + CHARS_PER_LINE));
    for (let j = 1; j < raw.length; j++) {
      while (raw[j].length > 0 && LINE_START_FORBIDDEN.test(raw[j])) {
        raw[j-1] += raw[j][0]; raw[j] = raw[j].substring(1);
      }
    }
    if (raw.length > 0 && raw[0].length > CHARS_PER_LINE - INDENT) {
      let overflow = raw[0].substring(CHARS_PER_LINE - INDENT);
      raw[0] = raw[0].substring(0, CHARS_PER_LINE - INDENT);
      let idx = 1;
      while (overflow.length > 0) {
        if (idx >= raw.length) raw.push('');
        raw[idx] = overflow + raw[idx]; overflow = '';
        if (raw[idx].length > CHARS_PER_LINE) { overflow = raw[idx].substring(CHARS_PER_LINE); raw[idx] = raw[idx].substring(0, CHARS_PER_LINE); }
        idx++;
      }
    }
    for (let j = 0; j < raw.length; j++) {
      if (raw[j].length === 0) continue;
      lines.push({ text: raw[j], isFirst: j === 0, isLast: j === raw.length - 1 && raw[j].length < CHARS_PER_LINE });
    }
    if (i < paragraphs.length - 1 && paragraphs[i + 1].trim()) lines.push({ spacer: true });
  }
  return lines;
}

// ==================== 自动保存 ====================
function scheduleAutoSave() { if (state.saveTimer) clearTimeout(state.saveTimer); $('#save-indicator').textContent = '⏳'; state.saveTimer = setTimeout(() => { saveCurrentChapter(); }, 600); }
function showSaved() { $('#save-indicator').textContent = '✅'; setTimeout(() => { if ($('#save-indicator').textContent === '✅') $('#save-indicator').textContent = '💾'; }, 2000); }
let metaSaveTimer; function debounceSaveMeta() { if (metaSaveTimer) clearTimeout(metaSaveTimer); metaSaveTimer = setTimeout(saveAllData, 400); }

// ==================== UI ====================
function renderRecentBooks() {
  const s = $('#recent-section'), l = $('#recent-list'); if (!s || !l) return;
  if (state.books.length === 0) { s.style.display = 'none'; return; }
  s.style.display = 'block';
  const cols = ['#e8f0fe','#fce8e6','#e6f4ea','#fff3e0','#f3e5f5'], icons = ['📖','📗','📘','📙','📕'];
  l.innerHTML = state.books.map((b, i) => {
    const tw = b.chapters?.reduce((s, c) => s + (c.wordCount || 0), 0) || 0;
    const u = b.updatedAt ? timeAgo(b.updatedAt) : '';
    const coverHtml = b.cover ? `<img src="${b.cover}" style="width:100%;height:100%;object-fit:cover;border-radius:6px">` : icons[i%5];
    const coverBg = b.cover ? 'transparent' : cols[i%5];
    return `<div class="recent-card" data-id="${b.id}"><div class="recent-icon" style="background:${coverBg};overflow:hidden">${coverHtml}</div><div class="recent-info"><div class="recent-title">《${escHtml(b.title)}》</div><div class="recent-meta">${(b.chapters?.length||0)}${t('chapters')} · ${tw.toLocaleString()}${t('words')} · ${u}</div></div><button class="recent-share" data-id="${b.id}" title="${t('settingsBtn')}">⚙</button><button class="recent-share" data-id="${b.id}" title="${t('shareBtn')}">📤</button><span class="recent-arrow">›</span></div>`;
  }).join('');
  l.querySelectorAll('.recent-share').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (btn.title === t('settingsBtn')) { state.currentBookId = id; showBookSettings(); }
      else showShareDialog(id);
    });
  });
  l.querySelectorAll('.recent-card').forEach(c => {
    c.addEventListener('click', () => openBook(c.dataset.id));
    c.addEventListener('contextmenu', e => { e.preventDefault(); state.currentBookId = c.dataset.id; showBookSettings(); });
  });
}

function renderChapterList() {
  const book = getBook(state.currentBookId), list = $('#chapter-list'); if (!book || !list) return;
  const chapters = book.chapters || [], volumes = book.volumes || [];
  if (chapters.length === 0 && volumes.length === 0) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">' + t('emptyChapterHint') + '<br><br>' + t('emptyChapterSubHint') + '</div>'; return;
  }
  let html = '';
  if (volumes.length > 0) {
    volumes.forEach(vol => {
      const v = chapters.filter(c => c.volume === vol.id);
      const isSelected = state.selectedVolumeId === vol.id;
      html += `<div class="volume-header${isSelected ? ' vol-selected' : ''}" data-vol-id="${vol.id}">
        <span class="arrow">▼</span>
        <span class="vol-title">${escHtml(vol.title)}</span>
        <span class="vol-count">${t('volumeCount',{n:v.length})}</span>
        <button class="vol-import" data-vol-id="${vol.id}" title="${t('importToVolBtn')}">${t('importToVolBtn')}</button>
        <button class="vol-del" data-vol-id="${vol.id}" title="${t('deleteVolBtn')}">×</button>
      </div>`;
      v.forEach((ch, i) => { html += chapterItemHtml(ch, i + 1); });
    });
    const ua = chapters.filter(c => !c.volume);
    if (ua.length > 0) {
      html += `<div class="volume-header${!state.selectedVolumeId ? ' vol-selected' : ''}" data-vol-id="">
        <span class="arrow">▼</span><span class="vol-title">${t('unassigned')}</span><span class="vol-count">${t('volumeCount',{n:ua.length})}</span>
      </div>`;
      ua.forEach((ch, i) => { html += chapterItemHtml(ch, i + 1); });
    }
  } else {
    chapters.forEach((ch, i) => { html += chapterItemHtml(ch, i + 1); });
  }
  list.innerHTML = html;
  list.querySelectorAll('.chapter-item').forEach(item => { item.addEventListener('click', e => { if (!e.target.closest('.ch-btn') && !e.target.closest('.ch-name input')) selectChapter(item.dataset.chapterId); }); });
  list.querySelectorAll('.ch-name').forEach(el => { el.addEventListener('dblclick', e => { e.stopPropagation(); startInlineRename(el.dataset.chapterId); }); });
  list.querySelectorAll('.ch-rename').forEach(b => { b.addEventListener('click', e => { e.stopPropagation(); startInlineRename(b.dataset.chapterId); }); });
  list.querySelectorAll('.ch-delete').forEach(b => { b.addEventListener('click', e => { e.stopPropagation(); deleteChapter(b.dataset.chapterId); }); });
  list.querySelectorAll('.vol-title').forEach(titleEl => {
    titleEl.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const volHeader = titleEl.closest('.volume-header');
      const volId = volHeader?.dataset.volId;
      if (!volId || volHeader.querySelector('input')) return;
      const old = titleEl.textContent;
      titleEl.innerHTML = `<input class="vol-inline-input" value="${escHtml(old)}" data-old="${escHtml(old)}">`;
      const inp = titleEl.querySelector('input');
      inp.focus(); inp.select();
      const finish = () => {
        const nt = inp.value.trim();
        titleEl.textContent = nt || old;
        if (nt && nt !== old) {
          const book = getBook(state.currentBookId);
          const vol = book?.volumes?.find(v => v.id === volId);
          if (vol) { vol.title = nt; book.updatedAt = new Date().toISOString(); saveAllData(); }
        }
      };
      inp.addEventListener('blur', finish);
      inp.addEventListener('keydown', ev => {
        if (ev.key === 'Enter') { ev.preventDefault(); finish(); }
        if (ev.key === 'Escape') { ev.preventDefault(); inp.value = inp.dataset.old; finish(); }
      });
    });
  });
  list.querySelectorAll('.volume-header').forEach(h => {
    h.addEventListener('click', (e) => {
      if (e.target.closest('.vol-del') || e.target.closest('.vol-title input')) return;
      state.selectedVolumeId = h.dataset.volId || null;
      const arrow = h.querySelector('.arrow');
      if (arrow) arrow.classList.toggle('collapsed');
      let el = h.nextElementSibling;
      while (el && el.classList.contains('chapter-item')) {
        el.style.display = el.style.display === 'none' ? '' : 'none';
        el = el.nextElementSibling;
      }
      document.querySelectorAll('.volume-header').forEach(vh => vh.classList.remove('vol-selected'));
      if (state.selectedVolumeId) h.classList.add('vol-selected');
      else document.querySelector('.volume-header[data-vol-id=""]')?.classList.add('vol-selected');
    });
  });
  list.querySelectorAll('.vol-import').forEach(b => {
    b.addEventListener('click', (e) => { e.stopPropagation(); showImportDialog(b.dataset.volId); });
  });
  list.querySelectorAll('.vol-del').forEach(b => {
    b.addEventListener('click', (e) => { e.stopPropagation(); deleteVolume(b.dataset.volId); });
  });
  updateChapterListActive();
}

let _importTargetVolId = null;

function showImportDialog(volId) {
  const book = getBook(state.currentBookId); if (!book) return;
  const vol = book.volumes?.find(v => v.id === volId); if (!vol) return;
  _importTargetVolId = volId;
  $('#import-vol-name').textContent = vol.title;
  const otherChapters = (book.chapters || []).filter(c => c.volume !== volId);
  const list = $('#chapter-check-list');
  if (otherChapters.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted);padding:10px">' + t('noChapters') + '</div>';
  } else {
    list.innerHTML = otherChapters.map(ch =>
      `<label class="chapter-check-item"><input type="checkbox" value="${ch.id}"> ${escHtml(ch.title)} <span style="color:var(--text-muted);font-size:11px">${(ch.wordCount||0).toLocaleString()}${t('words')}</span></label>`
    ).join('');
  }
  let allChecked = false;
  const selectAllEl = $('#select-all-chapters');
  selectAllEl.onclick = () => {
    allChecked = !allChecked;
    const cbs = list.querySelectorAll('input[type=checkbox]');
    cbs.forEach(cb => { cb.checked = allChecked; });
  };
  $('#btn-confirm-import').onclick = () => {
    const checked = list.querySelectorAll('input[type=checkbox]:checked');
    const ids = Array.from(checked).map(cb => cb.value);
    if (ids.length === 0) { hideModal('modal-import-chapters'); return; }
    (book.chapters || []).forEach(ch => { if (ids.includes(ch.id)) ch.volume = volId; });
    book.updatedAt = new Date().toISOString();
    saveAllData();
    renderChapterList();
    hideModal('modal-import-chapters');
  };
  $('#btn-cancel-import').onclick = () => hideModal('modal-import-chapters');
  showModal('modal-import-chapters');
}

function deleteVolume(volId) {
  const book = getBook(state.currentBookId); if (!book) return;
  const vol = book.volumes?.find(v => v.id === volId); if (!vol) return;
  let nextVolId = null;
  if (book.volumes) {
    const idx = book.volumes.findIndex(v => v.id === volId);
    if (idx > 0) nextVolId = book.volumes[idx - 1].id;
    else if (idx < book.volumes.length - 1) nextVolId = book.volumes[idx + 1].id;
  }
  showConfirm(t('deleteVolConfirm', {title: vol.title}), () => {
    (book.chapters || []).forEach(ch => { if (ch.volume === volId) delete ch.volume; });
    book.volumes = book.volumes.filter(v => v.id !== volId);
    state.selectedVolumeId = nextVolId;
    book.updatedAt = new Date().toISOString(); saveAllData();
    renderChapterList();
  });
}

function updateChapterNumbers() {
  document.querySelectorAll('.chapter-item .ch-index').forEach((el, i) => { el.textContent = (i + 1) + '.'; });
}

function chapterItemHtml(ch, idx) {
  const a = ch.id === state.currentChapterId, w = ch.wordCount || 0;
  return `<div class="chapter-item${a?' active':''}" data-chapter-id="${ch.id}"><span class="ch-index">${idx}.</span><span class="ch-name" data-chapter-id="${ch.id}" title="${t('dblClickRename')}">${escHtml(ch.title)}</span><span class="ch-words">${w>0?formatWordCount(w):''}</span><span class="ch-actions"><button class="ch-btn ch-rename" data-chapter-id="${ch.id}">✏</button><button class="ch-btn ch-delete" data-chapter-id="${ch.id}">🗑</button></span></div>`;
}

function startInlineRename(chId) {
  const el = document.querySelector(`.ch-name[data-chapter-id="${chId}"]`); if (!el || el.querySelector('input')) return;
  const old = el.textContent; el.innerHTML = `<input class="ch-inline-input" value="${escHtml(old)}" data-old="${escHtml(old)}">`;
  const inp = el.querySelector('input'); inp.focus(); inp.select();
  inp.addEventListener('blur', () => finishInlineRename(chId));
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); finishInlineRename(chId); } if (e.key === 'Escape') { e.preventDefault(); inp.value = inp.dataset.old; finishInlineRename(chId); } });
}

function finishInlineRename(chId) {
  const el = document.querySelector(`.ch-name[data-chapter-id="${chId}"]`); if (!el) return;
  const inp = el.querySelector('input'); if (!inp) return;
  const nt = inp.value.trim(); el.innerHTML = escHtml(nt || t('unnamedChapter'));
  if (nt && nt !== inp.dataset.old) { const b = getBook(state.currentBookId), c = getChapter(b, chId); if (c) { c.title = nt; b.updatedAt = new Date().toISOString(); saveAllData(); } if (state.currentChapterId === chId) $('#chapter-title').value = nt; }
}

function updateChapterListActive() {
  document.querySelectorAll('.chapter-item').forEach(i => i.classList.toggle('active', i.dataset.chapterId === state.currentChapterId));
  const b = getBook(state.currentBookId), c = getChapter(b, state.currentChapterId);
  if (c) { const el = document.querySelector(`.chapter-item[data-chapter-id="${state.currentChapterId}"] .ch-name`); if (el) el.textContent = c.title; }
}

function updateWordCount() {
  const c = getWordCount(); $('#word-count-current').textContent = c.toLocaleString();
  const b = getBook(state.currentBookId); let t = 0;
  if (b?.chapters) b.chapters.forEach(ch => { t += (ch.id === state.currentChapterId ? c : (ch.wordCount || 0)); });
  $('#word-count-total').textContent = t.toLocaleString();
}

// ==================== 设置 & 导出 ====================
let _settingsCover = null;

function showBookSettings() {
  const b = getBook(state.currentBookId); if (!b) return;
  $('#input-book-title').value = b.title;
  $('#input-book-author').value = b.author || '';
  _settingsCover = b.cover || null;
  let sec = document.getElementById('settings-cover-section');
  if (!sec) {
    const actions = document.querySelector('#modal-book-settings .modal-actions');
    sec = document.createElement('div'); sec.id = 'settings-cover-section'; sec.className = 'form-group';
    sec.innerHTML = `<label>${t('coverLabelShort')}</label><div class="cover-row"><div class="cover-preview" id="settings-cover-preview" style="width:80px;height:100px;border:2px dashed var(--border-color);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:28px;background:var(--bg-input);cursor:pointer">📷</div><button class="btn btn-sm btn-outline" id="btn-pick-cover-settings">${t('pickCoverSettings')}</button></div>`;
    actions.parentNode.insertBefore(sec, actions);
    document.getElementById('btn-pick-cover-settings').addEventListener('click', async () => {
      if (!window.novelAPI) return;
      const r = await window.novelAPI.pickImage();
      if (r?.success) { _settingsCover = await compressImage(r.dataUrl); const pv = document.getElementById('settings-cover-preview'); if (pv) pv.innerHTML = `<img src="${_settingsCover}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">`; }
    });
  }
  const pv = document.getElementById('settings-cover-preview');
  if (pv) pv.innerHTML = b.cover ? `<img src="${b.cover}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">` : '📷';
  showModal('modal-book-settings');
}
function saveBookSettings() { const b = getBook(state.currentBookId); if (!b) return; b.title = $('#input-book-title').value.trim() || b.title; b.author = $('#input-book-author').value.trim(); if (_settingsCover !== null) b.cover = _settingsCover; b.updatedAt = new Date().toISOString(); saveAllData(); $('#project-title').textContent = '《' + b.title + '》'; hideModal('modal-book-settings'); renderRecentBooks(); }

async function doExport() {
  const fmt = $('#export-format').value, scope = $('#export-scope').value;
  const b = getBook(state.currentBookId); if (!b) return; saveCurrentChapter();
  let chs = scope === 'current' ? [getChapter(b, state.currentChapterId)].filter(Boolean) : (b.chapters || []);
  if (chs.length === 0) { flashHint(t('noExportChapters')); return; }
  let out = '';
  if (fmt === 'txt') {
    for (const ch of chs) { const ls = formatToLines((ch.content && stripHtml(ch.content)) || ''); const tl = ls.map(l => l.spacer ? '' : (l.isFirst ? '　　　' + l.text : l.text)); out += `\n${ch.title}\n${'='.repeat(ch.title.length)}\n\n${tl.join('\n')}\n\n`; }
  } else {
    out = `<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n<title>${escHtml(b.title)}</title>\n<style>body{max-width:400px;margin:0 auto;padding:20px;font-family:"PingFang SC",sans-serif;font-size:18px;line-height:2}h2{text-align:center;margin:30px 0 16px}.line{text-align:justify;min-height:1.8em}.first{padding-left:3em}.spacer{height:1em}hr{margin:30px 0;border:none;border-top:1px solid #ddd}</style>\n</head>\n<body>\n<h1>${escHtml(b.title)}</h1>\n`;
    for (const ch of chs) { const ls = formatToLines((ch.content && stripHtml(ch.content)) || ''); out += `<h2>${escHtml(ch.title)}</h2>\n`; ls.forEach(l => { if (l.spacer) out += '<div class="spacer"></div>\n'; else out += `<div class="line${l.isFirst?' first':''}">${escHtml(l.text)}</div>\n`; }); out += '<hr>\n'; }
    out += '</body>\n</html>';
  }
  if (window.novelAPI) { const r = await window.novelAPI.exportFile({ title: b.title, content: out, format: fmt }); if (r?.success) { flashHint(t('exportDone')); hideModal('modal-export'); } else if (r?.error) { flashHint(r.error); } }
}

// ==================== 主题 ====================
function setTheme(t) { document.body.setAttribute('data-theme', t); $('#theme-select').value = t; localStorage.setItem('novel-editor-theme', t); }
function loadTheme() { setTheme(localStorage.getItem('novel-editor-theme') || 'light'); }

// ==================== 工具 ====================
function getWordCount() { if (!state.quill) return 0; const t = state.quill.getText(); return (t.match(/[一-鿿㐀-䶿]/g) || []).length + (t.match(/[a-zA-Z]+/g) || []).length; }
function formatWordCount(n) { if (currentLang === 'zh' && n >= 10000) return (n/10000).toFixed(1)+'万'; if (n >= 1000) return (n/1000).toFixed(1)+'k'; return String(n); }
function showModal(id) { $('#'+id).style.display = 'flex'; }
function hideModal(id) { $('#'+id).style.display = 'none'; }
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function stripHtml(h) { if (!h) return ''; const d = document.createElement('div'); d.innerHTML = h; return d.textContent || ''; }

function flashHint(msg) {
  const el = document.getElementById('save-indicator');
  if (!el) return;
  const old = el.textContent;
  const oldColor = el.style.color;
  el.textContent = msg || t('selectTextFirst');
  el.style.color = msg && !msg.includes(t('selectTextFirst')) ? '#4caf50' : '#e53935';
  setTimeout(() => { el.textContent = old; el.style.color = oldColor; }, 2000);
}

function refocusEditor() {
  if (state.quill) {
    state.quill.enable();
    state.quill.focus();
  }
}

function timeAgo(iso) { const df = Date.now() - new Date(iso).getTime(), m = Math.floor(df/60000); if (m < 1) return t('justNow'); if (m < 60) return m + t('minutesAgo'); const h = Math.floor(m/60); if (h < 24) return h + t('hoursAgo'); const d = Math.floor(h/24); if (d < 30) return d + t('daysAgo'); return Math.floor(d/30) + t('monthsAgo'); }

// ==================== 背景设置 ====================
const BG_KEY = 'novel-editor-bg';
let bgState = { image: '', opacity: 100 };

function loadBg() {
  try { const d = JSON.parse(localStorage.getItem(BG_KEY)); if (d) bgState = d; } catch(e) {}
  applyBgVars();
}
function applyBgVars() {
  if (bgState.image) {
    document.body.classList.add('has-custom-bg');
    document.body.style.setProperty('--bg-image', `url(${bgState.image})`);
    document.body.style.setProperty('--bg-opacity', bgState.opacity / 100);
  } else {
    document.body.classList.remove('has-custom-bg');
    document.body.style.setProperty('--bg-image', 'none');
    document.body.style.setProperty('--bg-opacity', '1');
  }
}
function showBgSettings() {
  document.getElementById('bg-opacity-slider').value = bgState.opacity;
  document.getElementById('bg-opacity-val').textContent = bgState.opacity + '%';
  showModal('modal-bg-settings');
}
function saveBgSettings() {
  bgState.opacity = parseInt(document.getElementById('bg-opacity-slider').value);
  localStorage.setItem(BG_KEY, JSON.stringify(bgState));
  applyBgVars();
  hideModal('modal-bg-settings');
}
async function pickBgImage() {
  if (!window.novelAPI) return;
  const r = await window.novelAPI.pickImage();
  if (r?.success) { bgState.image = await compressImage(r.dataUrl); applyBgVars(); }
}
function removeBgImage() { bgState.image = ''; applyBgVars(); }

// ==================== 语言切换 ====================
function updateDynamicI18n() {
  const si = $('#save-indicator');
  if (si) {
    if (si.textContent.includes('已保存') || si.textContent.includes('Saved') || si.textContent.includes('💾'))
      si.textContent = t('saved');
  }
  const fl = document.querySelector('.format-label');
  if (fl) fl.textContent = t('formatLabel');
  const mapBtn = {
    'btn-add-volume': 'addVolume', 'btn-export': 'exportBtn',
    'btn-font-color': 'fontColor', 'btn-bg-color': 'bgColor',
    'btn-clear-fmt': 'clearFormat', 'btn-cancel-color': 'cancel',
    'btn-confirm-color': 'confirm', 'btn-close-help': 'helpClose',
    'btn-import': 'importBtn', 'btn-confirm-volume': 'add',
    'btn-cancel-volume': 'cancel', 'btn-create-book': 'create',
    'btn-cancel-new-book': 'cancel',
  };
  Object.entries(mapBtn).forEach(([id, key]) => { const el = document.getElementById(id); if (el) el.textContent = t(key); });
  const imgBtn = document.getElementById('btn-insert-image');
  if (imgBtn) imgBtn.textContent = t('insertImage');
  document.querySelectorAll('.fmt-btn[data-fmt]').forEach(btn => {
    const map = { bold: t('bold'), italic: t('italic'), underline: t('underline') };
    if (map[btn.dataset.fmt]) btn.textContent = map[btn.dataset.fmt];
  });
  if (state.currentBookId) renderChapterList();
  renderRecentBooks();
  const pl = document.querySelector('.phone-panel-label');
  if (pl) pl.textContent = t('phoneLabel');
  const ph = document.querySelector('.phone-empty-hint');
  if (ph) ph.innerHTML = t('phoneEmpty');
  const idEl = document.querySelector('.import-desc');
  if (idEl) idEl.textContent = t('importDesc');
  updateExportLabels();
  const chTitle = $('#chapter-title');
  if (chTitle && chTitle.placeholder) chTitle.placeholder = t('chapterPlaceholder');
  updateWordCountDisplay();
  updateClock();
  updateEditorPlaceholder();
  updateHelpContent();
  // 新建小说弹窗
  const nbTitle = document.querySelector('#modal-new-book h2');
  if (nbTitle) nbTitle.textContent = t('newBookTitle');
  const nbLabels = document.querySelectorAll('#modal-new-book label');
  if (nbLabels[0]) nbLabels[0].textContent = t('bookName');
  if (nbLabels[1]) nbLabels[1].textContent = t('author');
  const nbNameInput = document.getElementById('input-new-book-title');
  if (nbNameInput) nbNameInput.placeholder = t('bookNamePlaceholder');
  const nbAuthorInput = document.getElementById('input-new-book-author');
  if (nbAuthorInput) nbAuthorInput.placeholder = t('authorPlaceholder');
  document.querySelectorAll('#modal-new-book label').forEach(l => { if (l.textContent.includes(t('coverLabelShort')) || l.textContent.includes('Cover')) l.textContent = t('coverLabel'); });
  const cvBtn = document.getElementById('btn-pick-cover');
  if (cvBtn) cvBtn.textContent = t('pickCover');
  // 设置弹窗
  const bsTitle = document.querySelector('#modal-book-settings h2');
  if (bsTitle) bsTitle.textContent = t('bookSettings');
  const bsLabels = document.querySelectorAll('#modal-book-settings label');
  if (bsLabels[0]) bsLabels[0].textContent = t('bookName');
  if (bsLabels[1]) bsLabels[1].textContent = t('author');
  const cvLabel2 = document.querySelector('#settings-cover-section label');
  if (cvLabel2) cvLabel2.textContent = t('cover');
  const cvBtn2 = document.getElementById('btn-pick-cover-settings');
  if (cvBtn2) cvBtn2.textContent = t('changeCover');
  const delBtn = document.getElementById('btn-delete-book');
  if (delBtn) delBtn.textContent = t('deleteBook');
  const cancelSet = document.getElementById('btn-cancel-settings');
  if (cancelSet) cancelSet.textContent = t('cancel');
  const saveSet = document.getElementById('btn-save-settings');
  if (saveSet) saveSet.textContent = t('save');
  const avTitle = document.querySelector('#modal-add-volume h2');
  if (avTitle) avTitle.textContent = '📑 ' + t('addVolumeTitle');
  const avLabel = document.querySelector('#modal-add-volume label');
  if (avLabel) avLabel.textContent = t('volumeName');
  const avInput = document.getElementById('input-volume-title');
  if (avInput) avInput.placeholder = t('volumeNamePlaceholder');
  const hTitle = document.querySelector('#modal-help h2');
  if (hTitle) hTitle.textContent = '📖 ' + t('helpTitle');
}

function updateHelpContent() {
  const helpDiv = document.querySelector('#modal-help .help-content');
  if (!helpDiv) return;
  helpDiv.innerHTML = currentLang === 'zh'
    ? `<h4>📕 新建小说</h4><p>首页 → 点击「📕 新建小说」→ 输入书名 → 点「创建」或回车。<br>快捷键：<b>Ctrl+N</b></p><h4>🏠 书架</h4><p>· 展示所有小说，点击卡片进入编辑。<br>· ⚙ → 修改书名/作者/封面/删除。<br>· 📤 → <b>导出 .novel 文件</b>。<br>· 右键卡片 → 弹出设置。<br>· 📥 导入 → 选择 .novel 文件。</p><h4>📑 章节管理</h4><p>· 「＋」添加章节（归入选中的卷）。<br>· 「＋ 添加卷」创建分卷。<br>· <b>双击章节名/卷名</b> — 内联重命名。<br>· 「🗑」删除章节。<br>· 点击卷名选中，点击 ▼/▶ 折叠。</p><h4>✍️ 正文编辑</h4><p><b>Ctrl+S</b> 保存 · <b>Ctrl+Z</b> 撤销 · <b>Ctrl+Y</b> 重做。</p><h4>🎨 格式</h4><p><b>先选中文字 → 再点按钮</b><br>加粗/斜体/下划线/字体颜色/背景颜色/插图。</p><h4>📱 手机预览</h4><p>每行15字 / 首行缩进 / 标点禁则 / 插图同步。<br>工具栏「📱」显示/隐藏。</p><h4>💾 保存</h4><p>自动保存到内置存储（localStorage）。</p><h4>📤 导出</h4><p>TXT（15字/行）或 HTML（手机尺寸）。</p>`
    : `<h4>📕 New Novel</h4><p>Home →「📕 New Novel」→ Enter name → Create.<br>Shortcut: <b>Ctrl+N</b></p><h4>🏠 Bookshelf</h4><p>· Click card to edit.<br>· ⚙ → Edit / Delete.<br>· 📤 → <b>Export .novel</b>.<br>· 📥 → Import .novel file.</p><h4>📑 Chapters</h4><p>· 「＋」Add chapter.<br>· 「＋ Add Volume」Create volume.<br>· <b>Double-click</b> to rename.<br>· 「🗑」Delete chapter.</p><h4>✍️ Editor</h4><p><b>Ctrl+S</b> Save · <b>Ctrl+Z</b> Undo · <b>Ctrl+Y</b> Redo.</p><h4>🎨 Format</h4><p><b>Select text → click button</b><br>Bold/Italic/Underline/Color/Image.</p><h4>📱 Preview</h4><p>15 chars/line / indent / punctuation rules.</p><h4>💾 Save</h4><p>Auto-save to internal storage.</p><h4>📤 Export</h4><p>TXT (15 chars/line) or HTML.</p>`;
}

function updateEditorPlaceholder() {
  if (state.quill) { state.quill.root.dataset.placeholder = t('editorPlaceholder'); }
  const s = document.getElementById('ql-placeholder-style') || (() => { const el = document.createElement('style'); el.id = 'ql-placeholder-style'; document.head.appendChild(el); return el; })();
  s.textContent = `.ql-editor.ql-blank::before{content:'${t('editorPlaceholder')}';color:var(--text-muted);font-style:normal;letter-spacing:0}`;
}

function updateWordCountDisplay() {
  const wcEls = document.querySelectorAll('.toolbar-center .word-count');
  if (wcEls[0]) { const n1 = wcEls[0].querySelector('strong')?.textContent || '0'; wcEls[0].innerHTML = t('wordCountCurrent') + '<strong id="word-count-current">' + n1 + '</strong> ' + t('words'); }
  if (wcEls[1]) { const n2 = wcEls[1].querySelector('strong')?.textContent || '0'; wcEls[1].innerHTML = t('wordCountTotal') + '<strong id="word-count-total">' + n2 + '</strong> ' + t('words'); }
}

function updateExportLabels() {
  const fmt = document.getElementById('export-format');
  if (fmt) { fmt.options[0].text = t('exportTxt'); fmt.options[1].text = t('exportHtml'); }
  const scope = document.getElementById('export-scope');
  if (scope) { scope.options[0].text = t('exportScopeAll'); scope.options[1].text = t('exportScopeCurrent'); }
}

window.addEventListener('beforeunload', () => { if (state.currentBookId) saveCurrentChapter(); });
