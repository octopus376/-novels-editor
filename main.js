const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 820, minWidth: 1050, minHeight: 650,
    title: '小说编辑器',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: false
    },
    show: false
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
  buildMenu();
}

const menuLabels = {
  zh: { file:'小说', new:'新建小说', exportTxt:'导出 TXT', exportHtml:'导出 HTML', quit:'退出',
    view:'视图', light:'日间模式', dark:'夜间模式', eye:'护眼模式', full:'切换全屏',
    help:'使用说明', about:'帮助', aboutTitle:'关于', aboutMsg:'小说编辑器 v3.0',
    aboutDetail:'内置存储 · 无需外部文件夹\n左侧编辑 + 右侧手机预览\n每行15字排版 · 自动保存' },
  en: { file:'File', new:'New Novel', exportTxt:'Export TXT', exportHtml:'Export HTML', quit:'Quit',
    view:'View', light:'Light Mode', dark:'Dark Mode', eye:'Eye-care', full:'Toggle Fullscreen',
    help:'Help', about:'About', aboutTitle:'About', aboutMsg:'Novel Editor v3.0',
    aboutDetail:'Built-in storage · No folder needed\nLeft editor + Right phone preview\n15 chars/line · Auto save' }
};
let menuLang = 'zh';

function buildMenu() {
  const L = menuLabels[menuLang] || menuLabels.zh;
  const template = [
    { label: L.file, submenu: [
      { label: L.new, accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu-new-book') },
      { type: 'separator' },
      { label: L.exportTxt, click: () => mainWindow?.webContents.send('menu-export-txt') },
      { label: L.exportHtml, click: () => mainWindow?.webContents.send('menu-export-html') },
      { type: 'separator' },
      { label: L.quit, accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
    ]},
    { label: L.view, submenu: [
      { label: L.light, click: () => mainWindow?.webContents.send('menu-theme', 'light') },
      { label: L.dark, click: () => mainWindow?.webContents.send('menu-theme', 'dark') },
      { label: L.eye, click: () => mainWindow?.webContents.send('menu-theme', 'eye-care') },
      { type: 'separator' },
      { label: L.full, accelerator: 'F11', click: () => mainWindow?.setFullScreen(!mainWindow?.isFullScreen()) }
    ]},
    { label: L.help, click: () => mainWindow?.webContents.send('menu-show-help') },
    { label: L.about, submenu: [{ label: L.aboutTitle, click: () => {
      dialog.showMessageBox(mainWindow, { type:'info', title:L.aboutTitle, message:L.aboutMsg, detail:L.aboutDetail });
    }}]}
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// 仅保留导出功能需要文件系统
ipcMain.handle('export-file', async (event, { title, content, format }) => {
  const ext = format === 'txt' ? 'txt' : 'html';
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '导出小说',
    defaultPath: `${title || '小说'}.${ext}`,
    filters: [{ name: format.toUpperCase(), extensions: [ext] }]
  });
  if (result.canceled) return null;
  try {
    fs.writeFileSync(result.filePath, content, 'utf-8');
    return { success: true, path: result.filePath };
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('set-menu-lang', (event, lang) => {
  menuLang = lang;
  buildMenu();
});

ipcMain.handle('pick-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择插图',
    properties: ['openFile'],
    filters: [{ name: '图片', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'] }]
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  try {
    const imgPath = result.filePaths[0];
    const data = fs.readFileSync(imgPath);
    const ext = path.extname(imgPath).toLowerCase().replace('.', '');
    const mime = ext === 'jpg' ? 'jpeg' : ext;
    const base64 = 'data:image/' + mime + ';base64,' + data.toString('base64');
    return { success: true, dataUrl: base64, name: path.basename(imgPath) };
  } catch (e) { return { error: e.message }; }
});

// 分享/导出小说文件
ipcMain.handle('save-novel-file', async (event, { title, content }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '导出小说文件',
    defaultPath: `${title || '小说'}.novel`,
    filters: [{ name: '小说文件', extensions: ['novel'] }]
  });
  if (result.canceled) return null;
  try {
    fs.writeFileSync(result.filePath, content, 'utf-8');
    return { success: true, path: result.filePath };
  } catch (e) { return { error: e.message }; }
});

// 导入小说文件
ipcMain.handle('open-novel-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '导入小说文件',
    properties: ['openFile'],
    filters: [{ name: '小说文件', extensions: ['novel'] }]
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  try {
    const content = fs.readFileSync(result.filePaths[0], 'utf-8');
    return { success: true, content, path: result.filePaths[0] };
  } catch (e) { return { error: e.message }; }
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
