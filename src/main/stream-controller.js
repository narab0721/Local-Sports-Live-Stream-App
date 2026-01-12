class StreamController {
  constructor(obsController, cameraManager) {
    this.obs = obsController;
    this.cameraManager = cameraManager;
    this.activeCamera = null;
    this.streamingStatus = 'idle';
  }

  async switchCamera(cameraId) {
    try {
      const camera = this.cameraManager.getCamera(cameraId);
      if (!camera) {
        throw new Error('Camera not found');
      }

      // Update OBS source with new camera stream
      const sourceName = `Camera_${cameraId}`;
      const result = await this.obs.updateSource(sourceName, {
        url: camera.streamUrl,
        is_local_file: false
      });

      if (result.success) {
        this.activeCamera = cameraId;
        return { success: true, camera };
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getStatus() {
    const obsStatus = await this.obs.getStreamStatus();
    return {
      success: true,
      activeCamera: this.activeCamera,
      obsStatus: obsStatus.status,
      cameras: await this.cameraManager.listCameras()
    };
  }

  async setupMultiCameraScene(cameraIds) {
    try {
      // Create sources for each camera in OBS
      for (const cameraId of cameraIds) {
        const camera = this.cameraManager.getCamera(cameraId);
        if (camera) {
          await this.obs.createSource(
            `Camera_${cameraId}`,
            'ffmpeg_source',
            { url: camera.streamUrl }
          );
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = StreamController;
