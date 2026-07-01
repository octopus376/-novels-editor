// ==================== 语言包 ====================
const LANG = {
  zh: {
    appTitle: '✍️ 小说编辑器',
    appSubtitle: '左侧写作 · 右侧手机预览 — 每行15字 · 自动保存',
    newBook: '📕 新建小说',
    recentWorks: '📚 最近作品',
    importWorks: '📥 导入作品',
    importDesc: '选择另一台电脑导出的 .novel 文件即可录入',
    importBtn: '📂 选择文件导入',
    chapters: '章',
    words: '字',
    // 工具栏
    sidebar: '侧边栏',
    backHome: '← 书架',
    saved: '💾 已保存',
    savedOk: '✅ 已保存',
    unsaved: '⏳ 未保存',
    wordCountCurrent: '当前 ',
    wordCountTotal: '总计 ',
    // 侧栏
    toc: '📑 目录',
    addChapter: '＋',
    addVolume: '＋ 添加卷',
    unassigned: '未分卷',
    chapterNew: '新章节',
    chapterPlaceholder: '章节标题',
    coverLabel: '封面图片（可选）',
    pickCover: '选择封面',
    changeCover: '更换封面',
    cover: '封面',
    volumeNew: '第一卷',
    renameTitle: '重命名',
    deleteTitle: '删除',
    importToVol: '导入',
    selectAll: '全选 / 取消全选',
    // 格式面板
    formatLabel: '格式',
    bold: '加粗',
    italic: '斜体',
    underline: '下划线',
    fontColor: '字体颜色',
    bgColor: '背景颜色',
    clearFormat: '清除格式',
    insertImage: '🖼️ 插图',
    pickColorTitle: '选择字体颜色',
    pickBgTitle: '选择背景颜色',
    // 颜色名
    colorRed: '红', colorOrange: '橙', colorYellow: '黄', colorGreen: '绿',
    colorCyan: '青', colorBlue: '蓝', colorPurple: '紫', colorBlack: '黑',
    colorWhite: '白', colorGray: '灰', colorPink: '粉', colorBrown: '棕',
    // 编辑器
    editorPlaceholder: '请在此处开始输入小说正文',
    // 手机预览
    phoneLabel: '📱 手机预览',
    phoneEmpty: '在左侧编辑器中输入文字<br>这里实时预览<br><br>📱 每行15字排版',
    phoneLines: '行',
    phoneWords: '字',
    // 弹窗
    newBookTitle: '📕 新建小说',
    bookName: '小说名称',
    bookNamePlaceholder: '请输入小说名称',
    authorPlaceholder: '请输入作者名',
    create: '创建',
    cancel: '取消',
    confirm: '确定',
    close: '关闭',
    addVolumeTitle: '📑 添加卷',
    volumeName: '卷名',
    volumeNamePlaceholder: '例如：第一卷',
    add: '添加',
    importChaptersTitle: '📂 导入章节到',
    noChapters: '没有可导入的章节',
    importConfirm: '确定导入',
    exportTitle: '导出小说',
    exportTxt: '纯文本 .txt（15字/行排版）',
    exportHtml: '网页 .html（手机尺寸）',
    exportScopeAll: '全部章节',
    exportScopeCurrent: '仅当前章节',
    exportBtn: '导出',
    bookSettings: '小说设置',
    author: '作者',
    deleteBook: '🗑 删除',
    save: '保存',
    selectAllCaps: '全选 / 取消全选',
    // 确认
    confirmDelete: '确认删除',
    confirmDeleteChapter: '确定删除此章节？',
    confirmDeleteVolume: '删除卷',
    confirmDeleteVolumeMsg: '卷内章节将变为未分卷，不会被删除。',
    confirmDeleteBook: '确定删除',
    confirmDeleteBookMsg: '此操作不可恢复！',
    keepOneChapter: '至少保留一个章节',
    selectTextFirst: '请先选中文字',
    // 导入导出
    share: '📤',
    shareTitle: '分享作品',
    importSuccess: '导入成功！',
    importFail: '❌ 文件无效，请检查后重试',
    exportSuccess: '导出成功!',
    duplicateBook: '已存在同名书，是否覆盖？',
    // 主题
    themeLight: '☀️ 日间',
    themeDark: '🌙 夜间',
    themeEye: '🌿 护眼',
    // 菜单
    menuFile: '小说',
    menuNew: '新建小说',
    menuExportTxt: '导出 TXT',
    menuExportHtml: '导出 HTML',
    menuQuit: '退出',
    menuView: '视图',
    menuLight: '日间模式',
    menuDark: '夜间模式',
    menuEye: '护眼模式',
    menuFull: '切换全屏',
    menuHelp: '使用说明',
    menuAbout: '关于',
    menuAboutMsg: '小说编辑器 v3.0',
    menuAboutDetail: '内置存储 · 无需外部文件夹\n左侧编辑 + 右侧手机预览\n每行15字排版 · 自动保存',
    helpTitle: '📖 使用说明',
    helpClose: '知道了',
    // 工具
    saveFailed: '保存失败: ',
    noExportChapters: '没有可导出的章节',
    pickImageTitle: '选择插图',
    // 首页
    minutesAgo: '分钟前',
    hoursAgo: '小时前',
    daysAgo: '天前',
    monthsAgo: '个月前',
    justNow: '刚刚',
    emptyShelf: '书架空空如也',
    emptyShelfHint: '点击 ＋ 创建你的第一本书',
    // 快捷键提示
    shortcutTitle: '⌨️ 快捷键',
    shortNew: '新建',
    shortSave: '保存',
    shortUndo: '撤销',
    shortRedo: '重做',
    shortFull: '全屏',
    shortClose: '关闭弹窗',
    // 背景设置
    bgSettingsTitle: '🎨 背景设置',
    bgImage: '背景图片',
    pickBgImage: '选择背景图片',
    removeBg: '移除背景',
    bgOpacity: '透明度',
    bgApply: '应用',
    // 章节相关
    chapterDefault: '第一章',
    volumeDefault: '第{n}卷',
    volumeCount: '{n}章',
    unnamedChapter: '未命名章节',
    emptyChapterHint: '点击 ＋ 添加章节',
    emptyChapterSubHint: '下方「＋ 添加卷」创建分卷',
    renamePrompt: '新章节名:',
    chapterTitleDefault: '章节名',
    deleteBookConfirm: '确定删除「{title}」？',
    importSuccessMsg: '✅ 《{title}》导入成功！',
    importInvalid: '无效',
    // 卷相关
    importToVolBtn: '导入',
    deleteVolBtn: '删除此卷',
    settingsBtn: '设置',
    shareBtn: '分享此书',
    dblClickRename: '双击重命名',
    deleteVolConfirm: '删除卷「{title}」？卷内章节将变为未分卷。',
    // 导出
    exportDone: '✅ 导出成功',
    // 图片
    imageAlt: '插图',
    // 封面
    coverLabelShort: '封面',
    pickCoverSettings: '更换封面',
  },

  en: {
    appTitle: '✍️ Novel Editor',
    appSubtitle: 'Write on left · Phone preview on right — 15 chars/line · Auto save',
    newBook: '📕 New Novel',
    recentWorks: '📚 Recent Works',
    importWorks: '📥 Import Work',
    importDesc: 'Select a .novel file exported from another computer',
    importBtn: '📂 Select File to Import',
    chapters: 'Ch',
    words: 'words',
    // Toolbar
    sidebar: 'Sidebar',
    backHome: '← Back',
    saved: '💾 Saved',
    savedOk: '✅ Saved',
    unsaved: '⏳ Unsaved',
    wordCountCurrent: 'Cur ',
    wordCountTotal: 'Total ',
    // Sidebar
    toc: '📑 Contents',
    addChapter: '＋',
    addVolume: '＋ Add Volume',
    unassigned: 'Unassigned',
    chapterNew: 'New Chapter',
    chapterPlaceholder: 'Chapter Title',
    coverLabel: 'Cover Image (optional)',
    pickCover: 'Pick Cover',
    changeCover: 'Change Cover',
    cover: 'Cover',
    volumeNew: 'Volume 1',
    renameTitle: 'Rename',
    deleteTitle: 'Delete',
    importToVol: 'Import',
    selectAll: 'Select All / Deselect',
    // Format panel
    formatLabel: 'Format',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    fontColor: 'Font Color',
    bgColor: 'BG Color',
    clearFormat: 'Clear',
    insertImage: '🖼️ Image',
    pickColorTitle: 'Pick Font Color',
    pickBgTitle: 'Pick BG Color',
    // Colors
    colorRed: 'Red', colorOrange: 'Orange', colorYellow: 'Yellow', colorGreen: 'Green',
    colorCyan: 'Cyan', colorBlue: 'Blue', colorPurple: 'Purple', colorBlack: 'Black',
    colorWhite: 'White', colorGray: 'Gray', colorPink: 'Pink', colorBrown: 'Brown',
    // Editor
    editorPlaceholder: 'Start writing your novel here...',
    // Phone preview
    phoneLabel: '📱 Preview',
    phoneEmpty: 'Type in the left editor<br>Live preview here<br><br>📱 15 chars / line',
    phoneLines: 'lines',
    phoneWords: 'words',
    // Modals
    newBookTitle: '📕 New Novel',
    bookName: 'Novel Name',
    bookNamePlaceholder: 'Enter novel name',
    authorPlaceholder: 'Enter author name',
    create: 'Create',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    addVolumeTitle: '📑 Add Volume',
    volumeName: 'Volume Name',
    volumeNamePlaceholder: 'e.g. Volume 1',
    add: 'Add',
    importChaptersTitle: '📂 Import Chapters to',
    noChapters: 'No chapters available',
    importConfirm: 'Import',
    exportTitle: 'Export Novel',
    exportTxt: 'Plain Text .txt (15 chars/line)',
    exportHtml: 'Web Page .html (phone size)',
    exportScopeAll: 'All Chapters',
    exportScopeCurrent: 'Current Chapter',
    exportBtn: 'Export',
    bookSettings: 'Novel Settings',
    author: 'Author',
    deleteBook: '🗑 Delete',
    save: 'Save',
    selectAllCaps: 'Select All / Deselect',
    // Confirm
    confirmDelete: 'Confirm Delete',
    confirmDeleteChapter: 'Delete this chapter?',
    confirmDeleteVolume: 'Delete Volume',
    confirmDeleteVolumeMsg: 'Chapters in this volume will become unassigned.',
    confirmDeleteBook: 'Delete',
    confirmDeleteBookMsg: 'This cannot be undone!',
    keepOneChapter: 'At least one chapter required',
    selectTextFirst: 'Please select text first',
    // Import/Export
    share: '📤',
    shareTitle: 'Share Work',
    importSuccess: 'Import successful!',
    importFail: '❌ Invalid file, please check and retry',
    exportSuccess: 'Export successful!',
    duplicateBook: 'A book with this name exists. Overwrite?',
    // Theme
    themeLight: '☀️ Light',
    themeDark: '🌙 Dark',
    themeEye: '🌿 Eye-care',
    // Menu
    menuFile: 'File',
    menuNew: 'New Novel',
    menuExportTxt: 'Export TXT',
    menuExportHtml: 'Export HTML',
    menuQuit: 'Quit',
    menuView: 'View',
    menuLight: 'Light Mode',
    menuDark: 'Dark Mode',
    menuEye: 'Eye-care Mode',
    menuFull: 'Toggle Fullscreen',
    menuHelp: 'Help',
    menuAbout: 'About',
    menuAboutMsg: 'Novel Editor v3.0',
    menuAboutDetail: 'Built-in storage · No external folders\nLeft editor + Right phone preview\n15 chars/line · Auto save',
    helpTitle: '📖 Help',
    helpClose: 'Got it',
    // Tools
    saveFailed: 'Save failed: ',
    noExportChapters: 'No chapters to export',
    pickImageTitle: 'Select Image',
    // Home
    minutesAgo: ' min ago',
    hoursAgo: ' hr ago',
    daysAgo: ' days ago',
    monthsAgo: ' months ago',
    justNow: 'just now',
    emptyShelf: 'Shelf is empty',
    emptyShelfHint: 'Click ＋ to create your first novel',
    // Shortcuts
    shortcutTitle: '⌨️ Shortcuts',
    shortNew: 'New',
    shortSave: 'Save',
    shortUndo: 'Undo',
    shortRedo: 'Redo',
    shortFull: 'Fullscreen',
    shortClose: 'Close popup',
    // Background Settings
    bgSettingsTitle: '🎨 BG Settings',
    bgImage: 'Background Image',
    pickBgImage: 'Pick Image',
    removeBg: 'Remove',
    bgOpacity: 'Opacity',
    bgApply: 'Apply',
    // Chapters
    chapterDefault: 'Chapter 1',
    volumeDefault: 'Volume {n}',
    volumeCount: '{n} Ch',
    unnamedChapter: 'Untitled',
    emptyChapterHint: 'Click ＋ to add chapter',
    emptyChapterSubHint: 'Click 「＋ Add Volume」 to create volume',
    renamePrompt: 'New name:',
    chapterTitleDefault: 'Chapter Title',
    deleteBookConfirm: 'Delete "{title}"?',
    importSuccessMsg: '✅ "{title}" imported!',
    importInvalid: 'Invalid',
    // Volumes
    importToVolBtn: 'Import',
    deleteVolBtn: 'Delete Volume',
    settingsBtn: 'Settings',
    shareBtn: 'Share',
    dblClickRename: 'Double-click to rename',
    deleteVolConfirm: 'Delete "{title}"? Chapters will become unassigned.',
    // Export
    exportDone: '✅ Export done',
    // Image
    imageAlt: 'Illustration',
    // Cover
    coverLabelShort: 'Cover',
    pickCoverSettings: 'Change Cover',
  }
};

// 当前语言
let currentLang = localStorage.getItem('novel-editor-lang') || 'zh';

function t(key, replacements) {
  let str;
  if (LANG[currentLang] && LANG[currentLang][key]) str = LANG[currentLang][key];
  else if (LANG.zh && LANG.zh[key]) str = LANG.zh[key];
  else str = key;
  if (replacements) {
    Object.entries(replacements).forEach(([k, v]) => {
      str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), v);
    });
  }
  return str;
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('novel-editor-lang', lang);
  applyAllLanguage();
  // 通知主进程切换菜单语言
  if (window.novelAPI && window.novelAPI.setMenuLang) {
    window.novelAPI.setMenuLang(lang);
  }
}

function applyAllLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.type !== 'checkbox') {
      el.placeholder = t(key);
    } else if (el.tagName === 'OPTION') {
      el.textContent = t(key);
    } else {
      el.textContent = t(key);
    }
  });
  // 带 placeholder 属性的元素
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}
