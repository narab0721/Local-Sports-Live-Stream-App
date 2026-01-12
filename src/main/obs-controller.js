const OBSWebSocket = require('obs-websocket-js').default;
const EventEmitter = require('events');

class OBSController extends EventEmitter {
  constructor() {
    super();
    this.obs = new OBSWebSocket();
    this.connected = false;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.obs.on('ConnectionOpened', () => {
      this.connected = true;
      this.emit('connected');
    });

    this.obs.on('ConnectionClosed', () => {
      this.connected = false;
      this.emit('disconnected');
    });

    this.obs.on('StreamStateChanged', (data) => {
      this.emit('streamStateChanged', data);
    });
  }

  async connect(config) {
    try {
      const { address, password } = config;
      await this.obs.connect(`ws://${address}:4455`, password);
      return { success: true, message: 'Connected to OBS' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async disconnect() {
    try {
      if (this.connected) {
        await this.obs.disconnect();
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getScenes() {
    try {
      const { scenes } = await this.obs.call('GetSceneList');
      return { success: true, scenes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createSource(sourceName, sourceType, sourceSettings) {
    try {
      await this.obs.call('CreateInput', {
        sceneName: 'Main',
        inputName: sourceName,
        inputKind: sourceType,
        inputSettings: sourceSettings
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateSource(sourceName, settings) {
    try {
      await this.obs.call('SetInputSettings', {
        inputName: sourceName,
        inputSettings: settings
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async startStreaming() {
    try {
      await this.obs.call('StartStream');
      return { success: true, message: 'Streaming started' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async stopStreaming() {
    try {
      await this.obs.call('StopStream');
      return { success: true, message: 'Streaming stopped' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getStreamStatus() {
    try {
      const status = await this.obs.call('GetStreamStatus');
      return { success: true, status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async setCurrentScene(sceneName) {
    try {
      await this.obs.call('SetCurrentProgramScene', { sceneName });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = OBSController;
