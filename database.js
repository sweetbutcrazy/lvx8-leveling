const db = require('quick.db');

class Database {
    // === USER DATA ===
    static addXP(userId, guildId, amount) {
        return db.add(`xp_${guildId}_${userId}`, amount);
    }
    
    static getXP(userId, guildId) {
        return db.get(`xp_${guildId}_${userId}`) || 0;
    }
    
    static getLevel(userId, guildId) {
        const xp = this.getXP(userId, guildId);
        return Math.floor(0.1 * Math.sqrt(xp));
    }
    
    static setLevel(userId, guildId, level) {
        return db.set(`level_${guildId}_${userId}`, level);
    }
    
    static getLevel(userId, guildId) {
        return db.get(`level_${guildId}_${userId}`) || 0;
    }
    
    // === GUILD SETTINGS ===
    static getGuildSettings(guildId) {
        const defaults = {
            xpPerMessage: 15,
            cooldown: 5000,
            levelUpMessage: true,
            giveRole: true,
            levelChannel: null,
            customLevelUpMessage: null
        };
        
        const settings = db.get(`settings_${guildId}`) || {};
        return { ...defaults, ...settings };
    }
    
    static setGuildSettings(guildId, key, value) {
        return db.set(`settings_${guildId}.${key}`, value);
    }
    
    // === LEVEL ROLES ===
    static addLevelRole(guildId, level, roleId) {
        const roles = db.get(`levelroles_${guildId}`) || {};
        roles[level] = roleId;
        return db.set(`levelroles_${guildId}`, roles);
    }
    
    static removeLevelRole(guildId, level) {
        const roles = db.get(`levelroles_${guildId}`) || {};
        delete roles[level];
        return db.set(`levelroles_${guildId}`, roles);
    }
    
    static getLevelRoles(guildId) {
        return db.get(`levelroles_${guildId}`) || {};
    }
    
    static getRoleForLevel(guildId, level) {
        const roles = this.getLevelRoles(guildId);
        return roles[level] || null;
    }
    
    // === COOLDOWN ===
    static getCooldown(userId) {
        return db.get(`cooldown_${userId}`) || 0;
    }
    
    static setCooldown(userId, timestamp) {
        return db.set(`cooldown_${userId}`, timestamp);
    }
    
    // === LEADERBOARD ===
    static getLeaderboard(guildId) {
        const all = db.all().filter(data => data.ID.startsWith(`xp_${guildId}_`));
        all.sort((a, b) => b.data - a.data);
        return all.slice(0, 10); // Top 10
    }
}

module.exports = Database;
