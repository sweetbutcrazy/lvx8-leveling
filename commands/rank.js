const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../database');
const LevelCalculator = require('../utils/levelCalc');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('📊 Lihat level dan XP kamu')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin dicek (opsional)')),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const guildId = interaction.guild.id;
        const userId = targetUser.id;
        
        const xp = Database.getXP(userId, guildId);
        const level = Database.getLevel(userId, guildId);
        const nextLevelXP = LevelCalculator.calculateNextLevelXP(xp);
        const prevLevelXP = LevelCalculator.calculateXPForLevel(level);
        const progress = LevelCalculator.calculateProgress(xp);
        
        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        const avatar = targetUser.displayAvatarURL({ extension: 'png', size: 256 });
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.INFO)
            .setAuthor({ name: targetUser.tag, iconURL: avatar })
            .setDescription(`**Level ${level}**`)
            .addFields(
                { name: '📈 XP', value: `${xp} / ${nextLevelXP}`, inline: true },
                { name: '🎯 Progress', value: `${progress.toFixed(1)}%`, inline: true },
                { name: '🏆 Rank', value: `#${await this.getRank(userId, guildId)}`, inline: true }
            )
            .setThumbnail(avatar)
            .setFooter({ text: 'Keep chatting to level up!' })
            .setTimestamp();
        
        // Progress bar
        const progressBar = this.createProgressBar(progress, 20);
        embed.addFields({ name: 'Progress Bar', value: progressBar, inline: false });
        
        await interaction.reply({ embeds: [embed] });
    },
    
    async getRank(userId, guildId) {
        const leaderboard = Database.getLeaderboard(guildId);
        const index = leaderboard.findIndex(entry => entry.ID === `xp_${guildId}_${userId}`);
        return index === -1 ? 'N/A' : index + 1;
    },
    
    createProgressBar(progress, length) {
        const filled = Math.round((progress / 100) * length);
        const empty = length - filled;
        return `[\`${'█'.repeat(filled)}${'░'.repeat(empty)}\`] ${progress.toFixed(1)}%`;
    }
};
