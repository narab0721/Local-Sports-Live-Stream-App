javascript
const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class DatabaseManager {
  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'stream-app.db');
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  initDatabase() {
    this.db.exec(`
      -- Teams Table
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        short_name TEXT,
        color TEXT DEFAULT '#3b82f6',
        logo_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Players Table
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        name TEXT NOT NULL,
        jersey_number INTEGER,
        position TEXT,
        photo_path TEXT,
        is_captain BOOLEAN DEFAULT 0,
        is_starting BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
      );

      -- Player Statistics Table
      CREATE TABLE IF NOT EXISTS player_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id TEXT NOT NULL,
        match_id TEXT,
        sport TEXT NOT NULL,
        goals INTEGER DEFAULT 0,
        assists INTEGER DEFAULT 0,
        yellow_cards INTEGER DEFAULT 0,
        red_cards INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0,
        rebounds INTEGER DEFAULT 0,
        steals INTEGER DEFAULT 0,
        runs INTEGER DEFAULT 0,
        wickets INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      );

      -- Sponsors Table
      CREATE TABLE IF NOT EXISTS sponsors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        logo_path TEXT NOT NULL,
        position TEXT DEFAULT 'bottom',
        display_duration INTEGER DEFAULT 5000,
        priority INTEGER DEFAULT 1,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Matches Table
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        team_a_id TEXT NOT NULL,
        team_b_id TEXT NOT NULL,
        sport TEXT NOT NULL,
        venue TEXT,
        start_time DATETIME,
        status TEXT DEFAULT 'scheduled',
        score_a INTEGER DEFAULT 0,
        score_b INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_a_id) REFERENCES teams(id),
        FOREIGN KEY (team_b_id) REFERENCES teams(id)
      );

      -- Match Events Table
      CREATE TABLE IF NOT EXISTS match_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id TEXT NOT NULL,
        player_id TEXT,
        event_type TEXT NOT NULL,
        event_time TEXT,
        period TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(id),
        FOREIGN KEY (player_id) REFERENCES players(id)
      );

      -- Cameras Table
      CREATE TABLE IF NOT EXISTS cameras (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        config TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- OBS Configs Table
      CREATE TABLE IF NOT EXISTS obs_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT NOT NULL,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  // Team Methods
  saveTeam(team) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO teams (id, name, short_name, color, logo_path)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(team.id, team.name, team.shortName, team.color, team.logoPath);
  }

  getTeams() {
    const stmt = this.db.prepare('SELECT * FROM teams ORDER BY name');
    return stmt.all();
  }

  getTeam(id) {
    const stmt = this.db.prepare('SELECT * FROM teams WHERE id = ?');
    return stmt.get(id);
  }

  deleteTeam(id) {
    const stmt = this.db.prepare('DELETE FROM teams WHERE id = ?');
    return stmt.run(id);
  }

  // Player Methods
  savePlayer(player) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO players 
      (id, team_id, name, jersey_number, position, photo_path, is_captain, is_starting)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      player.id,
      player.teamId,
      player.name,
      player.jerseyNumber,
      player.position,
      player.photoPath,
      player.isCaptain ? 1 : 0,
      player.isStarting ? 1 : 0
    );
  }

  getPlayersByTeam(teamId) {
    const stmt = this.db.prepare('SELECT * FROM players WHERE team_id = ? ORDER BY jersey_number');
    return stmt.all(teamId);
  }

  deletePlayer(id) {
    const stmt = this.db.prepare('DELETE FROM players WHERE id = ?');
    return stmt.run(id);
  }

  // Player Stats Methods
  savePlayerStats(stats) {
    const stmt = this.db.prepare(`
      INSERT INTO player_stats 
      (player_id, match_id, sport, goals, assists, yellow_cards, red_cards, points, rebounds, steals, runs, wickets)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      stats.playerId,
      stats.matchId,
      stats.sport,
      stats.goals || 0,
      stats.assists || 0,
      stats.yellowCards || 0,
      stats.redCards || 0,
      stats.points || 0,
      stats.rebounds || 0,
      stats.steals || 0,
      stats.runs || 0,
      stats.wickets || 0
    );
  }

  getPlayerStats(playerId, matchId) {
    const stmt = this.db.prepare(`
      SELECT * FROM player_stats 
      WHERE player_id = ? AND match_id = ?
      ORDER BY created_at DESC LIMIT 1
    `);
    return stmt.get(playerId, matchId);
  }

  // Sponsor Methods
  saveSponsor(sponsor) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO sponsors (id, name, logo_path, position, display_duration, priority, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      sponsor.id,
      sponsor.name,
      sponsor.logoPath,
      sponsor.position,
      sponsor.displayDuration,
      sponsor.priority,
      sponsor.active ? 1 : 0
    );
  }

  getSponsors() {
    const stmt = this.db.prepare('SELECT * FROM sponsors WHERE active = 1 ORDER BY priority DESC');
    return stmt.all();
  }

  deleteSponsor(id) {
    const stmt = this.db.prepare('DELETE FROM sponsors WHERE id = ?');
    return stmt.run(id);
  }

  // Match Methods
  saveMatch(match) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO matches 
      (id, team_a_id, team_b_id, sport, venue, start_time, status, score_a, score_b)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      match.id,
      match.teamAId,
      match.teamBId,
      match.sport,
      match.venue,
      match.startTime,
      match.status,
      match.scoreA,
      match.scoreB
    );
  }

  getCurrentMatch() {
    const stmt = this.db.prepare(`
      SELECT * FROM matches 
      WHERE status = 'live' 
      ORDER BY start_time DESC LIMIT 1
    `);
    return stmt.get();
  }

  // Match Event Methods
  saveMatchEvent(event) {
    const stmt = this.db.prepare(`
      INSERT INTO match_events (match_id, player_id, event_type, event_time, period, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      event.matchId,
      event.playerId,
      event.eventType,
      event.eventTime,
      event.period,
      event.details
    );
  }

  getMatchEvents(matchId) {
    const stmt = this.db.prepare(`
      SELECT me.*, p.name as player_name, p.jersey_number
      FROM match_events me
      LEFT JOIN players p ON me.player_id = p.id
      WHERE me.match_id = ?
      ORDER BY me.created_at DESC
    `);
    return stmt.all(matchId);
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseManager;

