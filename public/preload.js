const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getCookieByName: (name) => ipcRenderer.invoke('get-cookie-by-name', name),
    setCookieByName: (cookie) => ipcRenderer.invoke('set-cookie-by-name', cookie),
    deleteCookieByName: (name) => ipcRenderer.invoke('delete-cookie-by-name', name),
    closeApp: () => ipcRenderer.send('close-app')
});

