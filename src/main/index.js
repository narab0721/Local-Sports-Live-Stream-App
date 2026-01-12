const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const OBSController = require('./obs-controller');
const CameraManager = require('./camera-manager');
const StreamController = require('./stream-controller');
const OverlayManager = require('./overlay-manager');
const Database = require('./database');

let mainWindow;
let obsController;
let cameraManager;
let streamController;
let overlayManager;
let database;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/dashboard.html'));
  
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  database = new Database();
  obsController = new OBSController();
  cameraManager = new CameraManager();
  overlayManager = new OverlayManager();
  streamController = new StreamController(obsController, cameraManager, overlayManager);

  createWindow();
  setupIPCHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    obsController.disconnect();
    overlayManager.destroyOverlay();
    app.quit();
  }
});

function setupIPCHandlers() {
  // OBS Connection
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

  // Camera Management
  ipcMain.handle('camera:add', async (event, cameraConfig) => {
    const result = await cameraManager.addCamera(cameraConfig);
    if (result.success) {
      await database.saveCamera(result.camera);
    }
    return result;
  });

  ipcMain.handle('camera:remove', async (event, cameraId) => {
    return await cameraManager.removeCamera(cameraId);
  });

  ipcMain.handle('camera:list', async () => {
    return await cameraManager.listCameras();
  });

  ipcMain.handle('camera:switch', async (event, cameraId) => {
    return await streamController.switchCamera(cameraId);
  });

  // Overlay Management
  ipcMain.handle('overlay:show', async () => {
    return overlayManager.showOverlay();
  });

  ipcMain.handle('overlay:hide', async () => {
    return overlayManager.hideOverlay();
  });

  ipcMain.handle('overlay:updateScore', async (event, scoreData) => {
    const result = overlayManager.updateScore(scoreData);
    // Also update OBS browser source
    await obsController.updateOverlaySource(scoreData);
    return result;
  });

  ipcMain.handle('overlay:updateSettings', async (event, settings) => {
    return overlayManager.updateSettings(settings);
  });

  ipcMain.handle('overlay:getData', async () => {
    return overlayManager.getOverlayData();
  });

  // Stream Control
  ipcMain.handle('stream:getStatus', async () => {
    return await streamController.getStatus();
  });

  // Database
  ipcMain.handle('db:saveConfig', async (event, config) => {
    return await database.saveConfig(config);
  });

  ipcMain.handle('db:getConfig', async () => {
    return await database.getConfig();
  });
}
