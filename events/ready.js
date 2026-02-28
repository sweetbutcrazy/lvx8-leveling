const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`✅ ${client.user.tag} siap!`);
        
        // Set activity
        client.user.setPresence({
            activities: [{ name: '/help | Leveling System', type: ActivityType.Watching }],
            status: 'online'
        });
    }
};
