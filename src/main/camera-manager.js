const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

class CameraManager extends EventEmitter {
  constructor() {
    super();
    this.cameras = new Map();
  }

  async addCamera(config) {
    try {
      const cameraId = uuidv4();
      const camera = {
        id: cameraId,
        name: config.name,
        type: config.type, // 'ip', 'mobile', 'usb'
        url: config.url,
        streamUrl: this.buildStreamUrl(config),
        status: 'offline',
        resolution: config.resolution || '1920x1080',
        fps: config.fps || 30
      };

      this.cameras.set(cameraId, camera);
      this.emit('cameraAdded', camera);

      return { success: true, camera };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  buildStreamUrl(config) {
    switch (config.type) {
      case 'ip':
        return config.url; // RTSP URL
      case 'mobile':
        return `http://${config.url}/video`; // Mobile camera IP
      case 'usb':
        return config.deviceId; // USB device ID
      default:
        return config.url;
    }
  }

  async removeCamera(cameraId) {
    try {
      if (!this.cameras.has(cameraId)) {
        throw new Error('Camera not found');
      }

      const camera = this.cameras.get(cameraId);
      if (camera.status === 'streaming') {
        await this.stopStream(cameraId);
      }

      this.cameras.delete(cameraId);
      this.emit('cameraRemoved', cameraId);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listCameras() {
    return {
      success: true,
      cameras: Array.from(this.cameras.values())
    };
  }

  async startStream(cameraId) {
    try {
      const camera = this.cameras.get(cameraId);
      if (!camera) {
        throw new Error('Camera not found');
      }

      camera.status = 'streaming';
      this.cameras.set(cameraId, camera);
      this.emit('streamStarted', camera);

      return { success: true, camera };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async stopStream(cameraId) {
    try {
      const camera = this.cameras.get(cameraId);
      if (!camera) {
        throw new Error('Camera not found');
      }

      camera.status = 'offline';
      this.cameras.set(cameraId, camera);
      this.emit('streamStopped', camera);

      return { success: true, camera };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getCamera(cameraId) {
    return this.cameras.get(cameraId);
  }
}

module.exports = CameraManager;
