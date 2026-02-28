const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../database');
const LevelCalculator = require('../utils/levelCalc');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('🏆 Lihat top 10 member dengan XP tertinggi'),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        const guildId = interaction.guild.id;
        const leaderboard = Database.getLeaderboard(guildId);
        
        if (leaderboard.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.INFO)
                .setTitle('🏆 Leaderboard')
                .setDescription('Belum ada data XP')
                .setTimestamp();
            return await interaction.editReply({ embeds: [embed] });
        }
        
        const description = leaderboard.map((entry, index) => {
            const userId = entry.ID.replace(`xp_${guildId}_`, '');
            const xp = entry.data;
            const level = LevelCalculator.calculateLevel(xp);
            
            const medals = ['🥇', '🥈', '🥉'];
            const medal = medals[index] || `#${index + 1}`;
            
            return `${medal} **<@${userId}>** - Level **${level}** (${xp} XP)`;
        }).join('\n');
        
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setTitle('🏆 Top 10 Leaderboard')
            .setDescription(description)
            .setFooter({ text: 'Keep chatting to climb the ranks!' })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    }
};
