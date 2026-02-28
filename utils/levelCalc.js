class LevelCalculator {
    static calculateLevel(xp) {
        return Math.floor(0.1 * Math.sqrt(xp));
    }
    
    static calculateXPForLevel(level) {
        return Math.pow((level / 0.1), 2);
    }
    
    static calculateNextLevelXP(currentXP) {
        const currentLevel = this.calculateLevel(currentXP);
        const nextLevel = currentLevel + 1;
        return this.calculateXPForLevel(nextLevel);
    }
    
    static calculateProgress(currentXP) {
        const currentLevel = this.calculateLevel(currentXP);
        const nextLevelXP = this.calculateNextLevelXP(currentXP);
        const prevLevelXP = this.calculateXPForLevel(currentLevel);
        
        const progress = ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;
        return Math.min(100, Math.max(0, progress));
    }
}

module.exports = LevelCalculator;
