javascript
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const OBSController = require('./obs-controller');
const CameraManager = require('./camera-manager');
const StreamController = require('./stream-controller');
const OverlayManager = require('./overlay-manager');
const TeamManager = require('./team-manager');
const PlayerManager = require('./player-manager');
const SponsorManager = require('./sponsor-manager');
const Database = require('./database');

let mainWindow;
let obsController;
let cameraManager;
let streamController;
let overlayManager;
let teamManager;
let playerManager;
let sponsorManager;
let database;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/dashboard.html'));
}

app.whenReady().then(() => {
  database = new Database();
  obsController = new OBSController();
  cameraManager = new CameraManager();
  overlayManager = new OverlayManager();
  teamManager = new TeamManager(database);
  playerManager = new PlayerManager(database);
  sponsorManager = new SponsorManager(database);
  streamController = new StreamController(obsController, cameraManager, overlayManager);

  createWindow();
  setupIPCHandlers();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    obsController.disconnect();
    overlayManager.destroyOverlay();
    sponsorManager.stopRotation();
    app.quit();
  }
});

function setupIPCHandlers() {
  // OBS
  ipcMain.handle('obs:connect', async (event, config) => {
    return await obsController.connect(config);
  });

  ipcMain.handle('obs:disconnect', async () => {
    return await obsController.disconnect();
  });

  ipcMain.handle('obs:startStreaming', async () => {
    return await obsController.startStreaming();
  });

  ipcMain.handle('obs:stopStreaming', async () => {
    return await obsController.stopStreaming();
  });

  // Cameras
  ipcMain.handle('camera:add', async (event, config) => {
    const result = await cameraManager.addCamera(config);
    if (result.success) {
      await database.saveCamera(result.camera);
    }
    return result;
  });

  ipcMain.handle('camera:remove', async (event, id) => {
    return await cameraManager.removeCamera(id);
  });

  ipcMain.handle('camera:list', async () => {
    return await cameraManager.listCameras();
  });

  ipcMain.handle('camera:switch', async (event, id) => {
    return await streamController.switchCamera(id);
  });

  // Teams
  ipcMain.handle('team:create', async (event, teamData) => {
    return await teamManager.createTeam(teamData);
  });

  ipcMain.handle('team:update', async (event, teamId, updates) => {
    return await teamManager.updateTeam(teamId, updates);
  });

  ipcMain.handle('team:list', async () => {
    return teamManager.getTeams();
  });

  ipcMain.handle('team:get', async (event, teamId) => {
    return teamManager.getTeam(teamId);
  });

  ipcMain.handle('team:delete', async (event, teamId) => {
    return await teamManager.deleteTeam(teamId);
  });

  ipcMain.handle('team:uploadLogo', async (event, teamId) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif'] }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const logoBuffer = await fs.readFile(result.filePaths[0]);
      return await teamManager.updateTeam(teamId, { logo: logoBuffer });
    }
    return { success: false, error: 'No file selected' };
  });

  // Players
  ipcMain.handle('player:add', async (event, playerData) => {
    return await playerManager.addPlayer(playerData);
  });

  ipcMain.handle('player:update', async (event, playerId, updates) => {
    return await playerManager.updatePlayer(playerId, updates);
  });

  ipcMain.handle('player:listByTeam', async (event, teamId) => {
    return playerManager.getPlayersByTeam(teamId);
  });

  ipcMain.handle('player:delete', async (event, playerId) => {
    return await playerManager.deletePlayer(playerId);
  });

  ipcMain.handle('player:updateStats', async (event, playerId, matchId, sport, stats) => {
    return playerManager.updatePlayerStats(playerId, matchId, sport, stats);
  });

  ipcMain.handle('player:uploadPhoto', async (event, playerId) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const photoBuffer = await fs.readFile(result.filePaths[0]);
      return await playerManager.updatePlayer(playerId, { photo: photoBuffer });
    }
    return { success: false, error: 'No file selected' };
  });

  // Sponsors
  ipcMain.handle('sponsor:add', async (event, sponsorData) => {
    return await sponsorManager.addSponsor(sponsorData);
  });

  ipcMain.handle('sponsor:list', async () => {
    return sponsorManager.getSponsors();
  });

  ipcMain.handle('sponsor:delete', async (event, sponsorId) => {
    return await sponsorManager.deleteSponsor(sponsorId);
  });

  ipcMain.handle('sponsor:uploadLogo', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, path: result.filePaths[0] };
    }
    return { success: false, error: 'No file selected' };
  });

  // Overlay
  ipcMain.handle('overlay:show', async () => {
    return overlayManager.showOverlay();
  });

  ipcMain.handle('overlay:hide', async () => {
    return overlayManager.hideOverlay();
  });

  ipcMain.handle('overlay:updateScore', async (event, scoreData) => {
    return overlayManager.updateScore(scoreData);
  });

  ipcMain.handle('overlay:updateSettings', async (event, settings) => {
    return overlayManager.updateSettings(settings);
  });

  // Match Events
  ipcMain.handle('match:recordEvent', async (event, eventData) => {
    try {
      database.saveMatchEvent(eventData);
      // Update overlay with event
      await overlayManager.showEvent(eventData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

