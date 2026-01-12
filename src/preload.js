```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  obs: {
    connect: (config) => ipcRenderer.invoke('obs:connect', config),
    disconnect: () => ipcRenderer.invoke('obs:disconnect'),
    startStreaming: () => ipcRenderer.invoke('obs:startStreaming'),
    stopStreaming: () => ipcRenderer.invoke('obs:stopStreaming')
  },

  camera: {
    add: (config) => ipcRenderer.invoke('camera:add', config),
    remove: (id) => ipcRenderer.invoke('camera:remove', id),
    list: () => ipcRenderer.invoke('camera:list'),
    switch: (id) => ipcRenderer.invoke('camera:switch', id)
  },

  team: {
    create: (data) => ipcRenderer.invoke('team:create', data),
    update: (id, updates) => ipcRenderer.invoke('team:update', id, updates),
    list: () => ipcRenderer.invoke('team:list'),
    get: (id) => ipcRenderer.invoke('team:get', id),
    delete: (id) => ipcRenderer.invoke('team:delete', id),
    uploadLogo: (id) => ipcRenderer.invoke('team:uploadLogo', id)
  },

  player: {
    add: (data) => ipcRenderer.invoke('player:add', data),
    update: (id, updates) => ipcRenderer.invoke('player:update', id, updates),
    listByTeam: (teamId) => ipcRenderer.invoke('player:listByTeam', teamId),
    delete: (id) => ipcRenderer.invoke('player:delete', id),
    updateStats: (playerId, matchId, sport, stats) => 
      ipcRenderer.invoke('player:updateStats', playerId, matchId, sport, stats),
    uploadPhoto: (id) => ipcRenderer.invoke('player:uploadPhoto', id)
  },

  sponsor: {
    add: (data) => ipcRenderer.invoke('sponsor:add', data),
    list: () => ipcRenderer.invoke('sponsor:list'),
    delete: (id) => ipcRenderer.invoke('sponsor:delete', id),
    uploadLogo: () => ipcRenderer.invoke('sponsor:uploadLogo')
  },

  overlay: {
    show: () => ipcRenderer.invoke('overlay:show'),
    hide: () => ipcRenderer.invoke('overlay:hide'),
    updateScore: (data) => ipcRenderer.invoke('overlay:updateScore', data),
    updateSettings: (settings) => ipcRenderer.invoke('overlay:updateSettings', settings)
  },

  match: {
    recordEvent: (eventData) => ipcRenderer.invoke('match:recordEvent', eventData)
  },

  db: {
    saveConfig: (config) => ipcRenderer.invoke('db:saveConfig', config),
    getConfig: () => ipcRenderer.invoke('db:getConfig')
  }
});
```
