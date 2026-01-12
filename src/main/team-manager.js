```javascript
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const { app } = require('electron');

class TeamManager {
  constructor(database) {
    this.db = database;
    this.assetsPath = path.join(app.getPath('userData'), 'assets', 'logos');
    this.initAssetsFolder();
  }

  async initAssetsFolder() {
    try {
      await fs.mkdir(this.assetsPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create assets folder:', error);
    }
  }

  async createTeam(teamData) {
    try {
      const teamId = uuidv4();
      const team = {
        id: teamId,
        name: teamData.name,
        shortName: teamData.shortName || teamData.name.substring(0, 3).toUpperCase(),
        color: teamData.color || '#3b82f6',
        logoPath: null
      };

      // Save logo if provided
      if (teamData.logo) {
        team.logoPath = await this.saveLogo(teamId, teamData.logo);
      }

      this.db.saveTeam(team);
      return { success: true, team };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateTeam(teamId, updates) {
    try {
      const existingTeam = this.db.getTeam(teamId);
      if (!existingTeam) {
        throw new Error('Team not found');
      }

      const team = {
        id: teamId,
        name: updates.name || existingTeam.name,
        shortName: updates.shortName || existingTeam.short_name,
        color: updates.color || existingTeam.color,
        logoPath: existingTeam.logo_path
      };

      if (updates.logo) {
        team.logoPath = await this.saveLogo(teamId, updates.logo);
      }

      this.db.saveTeam(team);
      return { success: true, team };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async saveLogo(teamId, logoBuffer) {
    const fileName = `${teamId}.png`;
    const filePath = path.join(this.assetsPath, fileName);
    await fs.writeFile(filePath, logoBuffer);
    return filePath;
  }

  getTeams() {
    try {
      const teams = this.db.getTeams();
      return { success: true, teams };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getTeam(teamId) {
    try {
      const team = this.db.getTeam(teamId);
      return { success: true, team };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteTeam(teamId) {
    try {
      const team = this.db.getTeam(teamId);
      if (team && team.logo_path) {
        try {
          await fs.unlink(team.logo_path);
        } catch (error) {
          console.error('Failed to delete logo:', error);
        }
      }

      this.db.deleteTeam(teamId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = TeamManager;
```
