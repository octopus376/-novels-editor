const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('novelAPI', {
  exportFile: (data) => ipcRenderer.invoke('export-file', data),
  pickImage: () => ipcRenderer.invoke('pick-image'),
  saveNovelFile: (data) => ipcRenderer.invoke('save-novel-file', data),
  openNovelFile: () => ipcRenderer.invoke('open-novel-file'),
  setMenuLang: (lang) => ipcRenderer.invoke('set-menu-lang', lang),
  onMenuEvent: (channel, callback) => {
    const valid = ['menu-new-book','menu-export-txt','menu-export-html','menu-theme','menu-show-help'];
    if (valid.includes(channel)) ipcRenderer.on(channel, (e, ...args) => callback(...args));
  }
});
