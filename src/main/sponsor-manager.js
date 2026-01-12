javascript
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const { app } = require('electron');

class SponsorManager {
  constructor(database) {
    this.db = database;
    this.sponsorsPath = path.join(app.getPath('userData'), 'assets', 'sponsors');
    this.currentSponsorIndex = 0;
    this.rotationInterval = null;
    this.initSponsorsFolder();
  }

  async initSponsorsFolder() {
    try {
      await fs.mkdir(this.sponsorsPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create sponsors folder:', error);
    }
  }

  async addSponsor(sponsorData) {
    try {
      const sponsorId = uuidv4();
      const sponsor = {
        id: sponsorId,
        name: sponsorData.name,
        logoPath: null,
        position: sponsorData.position || 'bottom',
        displayDuration: sponsorData.displayDuration || 5000,
        priority: sponsorData.priority || 1,
        active: true
      };

      if (sponsorData.logo) {
        sponsor.logoPath = await this.saveSponsorLogo(sponsorId, sponsorData.logo);
      }

      this.db.saveSponsor(sponsor);
      return { success: true, sponsor };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async saveSponsorLogo(sponsorId, logoBuffer) {
    const fileName = `${sponsorId}.png`;
    const filePath = path.join(this.sponsorsPath, fileName);
    await fs.writeFile(filePath, logoBuffer);
    return filePath;
  }

  getSponsors() {
    try {
      const sponsors = this.db.getSponsors();
      return { success: true, sponsors };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteSponsor(sponsorId) {
    try {
      this.db.deleteSponsor(sponsorId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  startRotation(callback) {
    const sponsors = this.db.getSponsors();
    if (sponsors.length === 0) return;

    this.rotationInterval = setInterval(() => {
      const sponsor = sponsors[this.currentSponsorIndex];
      callback(sponsor);
      this.currentSponsorIndex = (this.currentSponsorIndex + 1) % sponsors.length;
    }, sponsors[0]?.display_duration || 5000);
  }

  stopRotation() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
  }
}

module.exports = SponsorManager;

