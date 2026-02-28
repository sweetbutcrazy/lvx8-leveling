require('dotenv').config();

module.exports = {
    TOKEN: process.env.DISCORD_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    
    // Pengaturan Default
    DEFAULT_XP_PER_MESSAGE: 15,
    DEFAULT_COOLDOWN: 5000, // 5 detik
    DEFAULT_LEVEL_UP_MESSAGE: true,
    DEFAULT_ROLE_GIVE: true,
    
    // Warna Embed
    COLORS: {
        SUCCESS: 0x00FF88,
        ERROR: 0xFF3366,
        INFO: 0x3399FF,
        WARNING: 0xFFAA00
    }
};
