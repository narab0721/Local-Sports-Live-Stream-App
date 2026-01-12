const { BrowserWindow } = require('electron');
const path = require('path');

class OverlayManager {
  constructor() {
    this.overlayWindow = null;
    this.currentOverlay = null;
    this.scoreData = {
      teamA: { name: 'Team A', score: 0, color: '#3b82f6' },
      teamB: { name: 'Team B', score: 0, color: '#ef4444' },
      timer: '00:00',
      period: 'Q1'
    };
    this.settings = {
      position: 'bottom',
      style: 'modern',
      showScore: true,
      showTimer: true,
      showLogos: false,
      sport: 'football'
    };
  }

  createOverlayWindow() {
    this.overlayWindow = new BrowserWindow({
      width: 1920,
      height: 200,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    this.overlayWindow.loadFile(path.join(__dirname, '../renderer/overlay.html'));
    this.overlayWindow.setIgnoreMouseEvents(true);
  }

  updateScore(data) {
    this.scoreData = { ...this.scoreData, ...data };
    if (this.overlayWindow) {
      this.overlayWindow.webContents.send('update-score', this.scoreData);
    }
    return { success: true, data: this.scoreData };
  }

  updateSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    if (this.overlayWindow) {
      this.overlayWindow.webContents.send('update-settings', this.settings);
    }
    return { success: true, settings: this.settings };
  }

  showOverlay() {
    if (!this.overlayWindow) {
      this.createOverlayWindow();
    }
    this.overlayWindow.show();
    return { success: true };
  }

  hideOverlay() {
    if (this.overlayWindow) {
      this.overlayWindow.hide();
    }
    return { success: true };
  }

  destroyOverlay() {
    if (this.overlayWindow) {
      this.overlayWindow.close();
      this.overlayWindow = null;
    }
    return { success: true };
  }

  getOverlayData() {
    return {
      success: true,
      score: this.scoreData,
      settings: this.settings
    };
  }
}

module.exports = OverlayManager;
