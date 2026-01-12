const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const { app } = require('electron');

class PlayerManager {
  constructor(database) {
    this.db = database;
    this.photosPath = path.join(app.getPath('userData'), 'assets', 'players');
    this.initPhotosFolder();
  }

  async initPhotosFolder() {
    try {
      await fs.mkdir(this.photosPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create photos folder:', error);
    }
  }

  async addPlayer(playerData) {
    try {
      const playerId = uuidv4();
      const player = {
        id: playerId,
        teamId: playerData.teamId,
        name: playerData.name,
        jerseyNumber: playerData.jerseyNumber,
        position: playerData.position,
        photoPath: null,
        isCaptain: playerData.isCaptain || false,
        isStarting: playerData.isStarting !== false
      };

      if (playerData.photo) {
        player.photoPath = await this.savePhoto(playerId, playerData.photo);
      }

      this.db.savePlayer(player);
      return { success: true, player };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updatePlayer(playerId, updates) {
    try {
      const player = {
        id: playerId,
        teamId: updates.teamId,
        name: updates.name,
        jerseyNumber: updates.jerseyNumber,
        position: updates.position,
        photoPath: updates.photoPath,
        isCaptain: updates.isCaptain || false,
        isStarting: updates.isStarting !== false
      };

      if (updates.photo) {
        player.photoPath = await this.savePhoto(playerId, updates.photo);
      }

      this.db.savePlayer(player);
      return { success: true, player };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async savePhoto(playerId, photoBuffer) {
    const fileName = `${playerId}.png`;
    const filePath = path.join(this.photosPath, fileName);
    await fs.writeFile(filePath, photoBuffer);
    return filePath;
  }

  getPlayersByTeam(teamId) {
    try {
      const players = this.db.getPlayersByTeam(teamId);
      return { success: true, players };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deletePlayer(playerId) {
    try {
      this.db.deletePlayer(playerId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  updatePlayerStats(playerId, matchId, sport, stats) {
    try {
      const statsData = {
        playerId,
        matchId,
        sport,
        ...stats
      };
      this.db.savePlayerStats(statsData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getPlayerStats(playerId, matchId) {
    try {
      const stats = this.db.getPlayerStats(playerId, matchId);
      return { success: true, stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = PlayerManager;
