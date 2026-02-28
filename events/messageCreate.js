const Database = require('../database');
const LevelCalculator = require('../utils/levelCalc');
const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot || !message.guild || !message.content) return;
        
        const guildId = message.guild.id;
        const userId = message.author.id;
        const settings = Database.getGuildSettings(guildId);
        
        // Cooldown check
        const now = Date.now();
        const cooldown = Database.getCooldown(userId);
        
        if (now < cooldown) return;
        
        Database.setCooldown(userId, now + settings.cooldown);
        
        // Add XP
        const newXp = Database.addXP(userId, guildId, settings.xpPerMessage);
        const newLevel = LevelCalculator.calculateLevel(newXp);
        const oldLevel = Database.getLevel(userId, guildId);
        
        // Level up
        if (newLevel > oldLevel) {
            Database.setLevel(userId, guildId, newLevel);
            
            // Send level up message
            if (settings.levelUpMessage) {
                await this.sendLevelUpMessage(message, newLevel, settings);
            }
            
            // Give role
            if (settings.giveRole) {
                await this.giveLevelRole(message, newLevel, guildId);
            }
        }
    },
    
    async sendLevelUpMessage(message, level, settings) {
        const channel = settings.levelChannel 
            ? message.guild.channels.cache.get(settings.levelChannel) 
            : message.channel;
        
        if (!channel) return;
        
        let content = settings.customLevelUpMessage 
            ? settings.customLevelUpMessage.replace('{user}', message.author.toString())
            : `🎉 **${message.author.username}** naik ke **Level ${level}**!`;
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setDescription(content)
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .addFields({ name: '📈 Level', value: `${level}`, inline: true })
            .addFields({ name: '🎯 XP', value: `${Database.getXP(message.author.id, message.guild.id)}`, inline: true })
            .setFooter({ text: 'Keep chatting!' })
            .setTimestamp();
        
        await channel.send({ content: message.author.toString(), embeds: [embed] }).catch(() => {});
    },
    
    async giveLevelRole(message, level, guildId) {
        const roleId = Database.getRoleForLevel(guildId, level);
        if (!roleId) return;
        
        const role = message.guild.roles.cache.get(roleId);
        if (!role) return;
        
        // Check if member already has role
        if (message.member.roles.cache.has(roleId)) return;
        
        try {
            await message.member.roles.add(role);
            
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.SUCCESS)
                .setDescription(`🎁 Kamu mendapatkan role **${role.name}**!`)
                .setTimestamp();
            
            await message.channel.send({ content: message.author.toString(), embeds: [embed] }).catch(() => {});
        } catch (error) {
            console.error('Failed to give role:', error);
        }
    }
};
